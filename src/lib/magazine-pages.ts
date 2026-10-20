import type { EditorialArticle, EditorialBlock } from '../data/editorial';

export interface MagazineContentBlock {
  block: EditorialBlock;
  /** Position in the original section, useful for verifying complete migration. */
  originalIndex: number;
}

export interface MagazinePage {
  kind: 'cover' | 'contents' | 'chapter' | 'press' | 'references' | 'credits';
  id: string;
  title: string;
  chapterIndex?: number;
  continuation?: boolean;
  blocks: MagazineContentBlock[];
  references: { reference: EditorialArticle['references'][number]; originalIndex: number }[];
}

const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/u).length : 0;

export function magazineBlockWeight(block: EditorialBlock): number {
  const words = wordCount([block.text || '', block.attribution || '', ...(block.items || []),
    ...(block.columns || []), ...(block.rows || []).flat()].join(' '));
  // Lists, tables and quotations need more breathing room than body paragraphs.
  return words + (block.type === 'table' ? 70 : block.type === 'exercise' ? 55 : block.type === 'quote' ? 40 : 12);
}

/**
 * Pages are composed from intact source blocks; nothing is truncated, rewritten,
 * or converted to a bitmap. Long blocks/tables can scroll inside their page.
 * Content remains in source order and references retain their original numbering.
 */
export function buildMagazinePages(article: EditorialArticle, targetWords = 300, includePress = false): MagazinePage[] {
  const pages: MagazinePage[] = [
    { kind: 'cover', id: 'capa', title: 'Capa', blocks: [], references: [] },
    { kind: 'contents', id: 'sumario', title: 'Nesta edição', blocks: [], references: [] },
  ];
  article.sections.forEach((section, chapterIndex) => {
    let blocks: MagazineContentBlock[] = [];
    let weight = 0;
    let part = 0;
    const flush = () => {
      if (!blocks.length && section.blocks.length) return;
      pages.push({ kind: 'chapter', id: `${section.id}-${part + 1}`, title: section.title,
        chapterIndex, continuation: part > 0, blocks, references: [] });
      part += 1;
      blocks = [];
      weight = 0;
    };
    section.blocks.forEach((block, originalIndex) => {
      const nextWeight = magazineBlockWeight(block);
      if (blocks.length && weight + nextWeight > Math.max(100, targetWords)) flush();
      blocks.push({ block, originalIndex });
      weight += nextWeight;
    });
    if (blocks.length || !section.blocks.length) flush();
  });
  if (includePress) pages.push({ kind: 'press', id: 'tema-na-vida-publica', title: 'O tema na vida pública', blocks: [], references: [] });
  let references: MagazinePage['references'] = [];
  let referenceWeight = 0;
  let referencePart = 0;
  const flushReferences = () => {
    if (!references.length) return;
    pages.push({ kind: 'references', id: `referencias-${referencePart + 1}`, title: 'Fontes e referências',
      continuation: referencePart > 0, blocks: [], references });
    references = [];
    referenceWeight = 0;
    referencePart += 1;
  };
  article.references.forEach((reference, originalIndex) => {
    const weight = wordCount(reference.label) + 20;
    if (references.length && (referenceWeight + weight > 230 || references.length >= 6)) flushReferences();
    references.push({ reference, originalIndex });
    referenceWeight += weight;
  });
  flushReferences();
  pages.push({ kind: 'credits', id: 'creditos', title: 'A conversa continua', blocks: [], references: [] });
  return pages;
}

/** Covers are single; the remaining desktop pages form reading-order spreads. */
export function magazineVisiblePages(page: number, total: number, spread: boolean): number[] {
  if (total <= 0) return [];
  const index = Math.max(0, Math.min(total - 1, Number.isFinite(page) ? Math.trunc(page) : 0));
  if (!spread || index === 0) return [index];
  const start = 1 + Math.floor((index - 1) / 2) * 2;
  return start + 1 < total ? [start, start + 1] : [start];
}

export function magazineStep(page: number, total: number, spread: boolean, direction: -1 | 1): number {
  const visible = magazineVisiblePages(page, total, spread);
  if (!visible.length) return 0;
  // A full final spread can end one index after its starting position. Returning
  // that last index would redisplay the same spread on an extra keyboard turn.
  if (direction > 0 && visible[visible.length - 1] >= total - 1) return Math.max(0, Math.min(total - 1, page));
  if (direction < 0 && visible[0] === 0) return 0;
  return Math.max(0, Math.min(total - 1, direction > 0 ? visible[visible.length - 1] + 1 : visible[0] - 1));
}
