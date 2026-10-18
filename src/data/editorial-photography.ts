import manifest from './editorial-photography.json';

export interface EditorialPhotograph {
  file: string;
  sha256: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
  kind: 'documentary' | 'editorial' | 'author';
  objectPosition: string;
  source: { file: string; sha256: string; page: number; imageKey: string; imageIndex: number; crop?: number[] };
}
interface EditionPhotography {
  cover: string;
  chapters: { sectionId: string; assetId: string }[];
  notes: string[];
}
export const editorialPhotography = manifest as {
  authorization: typeof manifest.authorization;
  assets: Record<string, EditorialPhotograph>;
  editions: Record<string, EditionPhotography>;
};
export const editorialCoverPhoto = (slug: string) => {
  const id = editorialPhotography.editions[slug]?.cover;
  return id ? editorialPhotography.assets[id] : undefined;
};
export const editorialChapterPhotos = (slug: string, sectionId: string) =>
  (editorialPhotography.editions[slug]?.chapters || [])
    .filter(photo => photo.sectionId === sectionId)
    .map(photo => editorialPhotography.assets[photo.assetId])
    .filter((photo): photo is EditorialPhotograph => Boolean(photo));
