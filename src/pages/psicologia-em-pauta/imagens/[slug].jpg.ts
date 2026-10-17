import type {APIRoute} from 'astro';
import {editorialPreview,editorialArticles} from '../../../data/editorial';
import {readEditorialImage} from '../../../lib/editorial-files.mjs';
export const prerender=true;
export function getStaticPaths(){return editorialPreview?editorialArticles.filter(article=>['neuro','profession'].includes(article.theme)).map(article=>({params:{slug:article.slug}})):[];}
export const GET:APIRoute=async({params})=>new Response(await readEditorialImage(params.slug||''),{headers:{'Content-Type':'image/jpeg','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
