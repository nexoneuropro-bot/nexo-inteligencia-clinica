import type {APIRoute} from 'astro';
import {editorialPreview,editorialArticles} from '../../../data/editorial';
import {readEditorialSocial} from '../../../lib/editorial-files.mjs';
export const prerender=true;
export function getStaticPaths(){return editorialPreview?editorialArticles.map(article=>({params:{slug:article.slug}})):[];}
export const GET:APIRoute=async({params})=>new Response(await readEditorialSocial(params.slug||''),{headers:{'Content-Type':'image/png','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
