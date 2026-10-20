import sources from './editorial-press.json';
export interface EditorialPressSource {
  vehicle: string; kind: string; date: string; author: string; title: string;
  url: string; image: string; width: number; height: number; heading: string;
  context: string; limit: string; question: string; capturedAt: string;
}
export const editorialPressForArticle = (slug: string): EditorialPressSource | undefined =>
  (sources as Record<string, EditorialPressSource>)[slug];
