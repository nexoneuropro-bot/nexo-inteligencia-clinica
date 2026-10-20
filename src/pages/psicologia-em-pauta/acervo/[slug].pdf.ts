import type {APIRoute} from 'astro';
import {editorialPreview,editorialArticles} from '../../../data/editorial';
import {readEditorialOriginal} from '../../../lib/editorial-files.mjs';
export const prerender=true;
export function getStaticPaths(){return editorialPreview?editorialArticles.filter(article=>article.slug==='analise-do-comportamento').map(article=>({params:{slug:article.slug},props:{file:article.source.file}})):[];}
export const GET:APIRoute=async({props})=>new Response(await readEditorialOriginal(props.file),{headers:{'Content-Type':'application/pdf','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
