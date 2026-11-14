/**
 * Lossless magazine composition and reading-order regressions.
 * Run: node scripts/test-editorial-magazine.mjs
 * The helper is transpiled in memory so this also works on Node 22 versions
 * that do not enable TypeScript type stripping by default. Nothing is emitted.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const modulePath = new URL('../src/lib/magazine-pages.ts', import.meta.url);
const source = await fs.readFile(modulePath, 'utf8');
const { outputText, diagnostics } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, strict: true },
  fileName: 'magazine-pages.ts', reportDiagnostics: true,
});
assert.equal((diagnostics || []).filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error).length, 0,
  'Magazine helper must transpile without syntax diagnostics');
const { buildMagazinePages, magazineVisiblePages, magazineStep } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const contentDirectory = new URL('../src/data/editorial/', import.meta.url);
const files = (await fs.readdir(contentDirectory)).filter(name => name.endsWith('.json')).sort();
assert.equal(files.length, 6, 'The six authorized source editions must remain covered by this test');
let blockTotal = 0;
let referenceTotal = 0;
let pageTotal = 0;

function assertReadingOrder(pages, spread, label) {
  let page = 0;
  const forward = [];
  let turns = 0;
  for (;;) {
    assert.ok(turns++ <= pages.length + 1, `${label}: forward navigation must terminate`);
    const visible = magazineVisiblePages(page, pages.length, spread);
    assert.ok(visible.length >= 1 && visible.length <= (spread ? 2 : 1), `${label}: appropriate visible-page count`);
    forward.push(...visible);
    const next = magazineStep(page, pages.length, spread, 1);
    if (next === page) break;
    assert.ok(next > page, `${label}: next must advance`);
    page = next;
  }
  assert.deepEqual(forward, pages.map((_, index) => index), `${label}: forward reading cannot omit, repeat or reorder pages`);
  const backward = [];
  turns = 0;
  for (;;) {
    assert.ok(turns++ <= pages.length + 1, `${label}: backward navigation must terminate`);
    backward.push(...magazineVisiblePages(page, pages.length, spread).slice().reverse());
    const previous = magazineStep(page, pages.length, spread, -1);
    if (previous === page) break;
    assert.ok(previous < page, `${label}: previous must go back`);
    page = previous;
  }
  assert.equal(page, 0, `${label}: backward reading must reach the cover`);
  assert.deepEqual(backward, pages.map((_, index) => index).reverse(), `${label}: backward reading cannot omit, repeat or reorder pages`);
}

for (const file of files) {
  const article = JSON.parse(await fs.readFile(new URL(file, contentDirectory), 'utf8'));
  const pages = buildMagazinePages(article);
  assert.equal(pages[0].kind, 'cover', `${file}: begin with a cover`);
  assert.equal(pages[1].kind, 'contents', `${file}: provide contents`);
  assert.equal(pages.at(-1).kind, 'credits', `${file}: end with author/reading credits`);
  assert.equal(new Set(pages.map(page => page.id)).size, pages.length, `${file}: stable page identifiers are unique`);
  const actualBlocks = pages.filter(page => page.kind === 'chapter').flatMap(page => page.blocks.map(({ block, originalIndex }) => [page.chapterIndex, originalIndex, block]));
  const expectedBlocks = article.sections.flatMap((section, sectionIndex) => section.blocks.map((block, blockIndex) => [sectionIndex, blockIndex, block]));
  assert.deepEqual(actualBlocks, expectedBlocks, `${file}: retain every complete source block once and in order, including tables, quotation attribution and exercises`);
  const actualReferences = pages.flatMap(page => page.references);
  assert.deepEqual(actualReferences, article.references.map((reference, originalIndex) => ({ reference, originalIndex })),
    `${file}: retain all bibliography entries, links and original numbering`);
  article.sections.forEach((section, index) => {
    const chapterPages = pages.filter(page => page.kind === 'chapter' && page.chapterIndex === index);
    assert.ok(chapterPages.length > 0, `${file}: every source chapter must have a page`);
    assert.equal(chapterPages[0].continuation, false, `${file}: chapter has an opening`);
    chapterPages.forEach((page, part) => {
      assert.equal(page.title, section.title, `${file}: preserve chapter title`);
      assert.equal(page.continuation, part > 0, `${file}: mark continuation pages correctly`);
    });
  });
  assertReadingOrder(pages, false, `${file}, mobile`);
  assertReadingOrder(pages, true, `${file}, desktop`);
  const withPress = buildMagazinePages(article, 300, true);
  assert.equal(withPress.filter(page => page.kind === 'press').length, 1, `${file}: exactly one press context page`);
  assert.deepEqual(withPress.flatMap(page => page.blocks), pages.flatMap(page => page.blocks), `${file}: press page preserves all article blocks`);
  assert.deepEqual(withPress.flatMap(page => page.references), actualReferences, `${file}: press page preserves reference numbering`);
  assertReadingOrder(withPress, false, `${file}, mobile with press`);
  assertReadingOrder(withPress, true, `${file}, desktop with press`);
  // Changing page-composition capacity must never drop/summarize content.
  const compact = buildMagazinePages(article, 100);
  assert.deepEqual(compact.flatMap(page => page.blocks.map(({ block }) => block)), expectedBlocks.map(tuple => tuple[2]),
    `${file}: small page target still preserves all original blocks`);
  blockTotal += actualBlocks.length;
  referenceTotal += actualReferences.length;
  pageTotal += pages.length;
  console.log(`PASS ${article.slug}: ${pages.length} pages, ${actualBlocks.length} source blocks, ${actualReferences.length} references`);
}

// Invalid targets, single-page books, odd/even endings and spread-resize targets.
assert.deepEqual(magazineVisiblePages(-20, 10, true), [0]);
assert.deepEqual(magazineVisiblePages(Number.NaN, 10, true), [0]);
assert.deepEqual(magazineVisiblePages(2.9, 10, false), [2]);
assert.deepEqual(magazineVisiblePages(2, 10, true), [1, 2]);
assert.deepEqual(magazineVisiblePages(999, 10, true), [9]);
assert.deepEqual(magazineVisiblePages(999, 11, true), [9, 10]);
assert.deepEqual(magazineVisiblePages(4, 0, true), []);
assert.deepEqual(magazineVisiblePages(0, 1, true), [0]);
assert.equal(magazineStep(0, 1, true, 1), 0);
assert.equal(magazineStep(0, 1, false, -1), 0);
assert.equal(magazineStep(0, 0, true, 1), 0);

const emptyArticle = { sections: [], references: [] };
assert.deepEqual(buildMagazinePages(emptyArticle).map(page => page.kind), ['cover', 'contents', 'credits']);
const longBlock = { type: 'p', text: 'A source paragraph must stay intact. '.repeat(200) };
const tableBlock = { type: 'table', columns: ['Contexto', 'Possibilidades'], rows: [['Mudança', 'Construir redes de apoio']] };
const longArticle = { sections: [{ id: 'long', title: 'Long content', blocks: [longBlock, tableBlock] }], references: [] };
const longPages = buildMagazinePages(longArticle, 100);
assert.deepEqual(longPages.flatMap(page => page.blocks.map(({ block }) => block)), [longBlock, tableBlock],
  'Oversized paragraphs/tables stay intact; scrolling handles their size instead of truncation');
console.log(JSON.stringify({ pass: true, editions: files.length, pages: pageTotal, intactSourceBlocks: blockTotal,
  references: referenceTotal, checks: ['lossless composition', 'source order', 'reference numbering', 'desktop/mobile forward/backward', 'bounds', 'large blocks', 'small page target'] }));
