import type {APIRoute} from 'astro';
import {editorialPreview} from '../../../data/editorial';
import {editorialPhotography} from '../../../data/editorial-photography';
import {readEditorialPhotograph} from '../../../lib/editorial-photography-files.mjs';
export const prerender=true;
export function getStaticPaths(){return editorialPreview?Object.keys(editorialPhotography.assets).map(slug=>({params:{slug}})):[];}
export const GET:APIRoute=async({params})=>{
 const photo=editorialPhotography.assets[params.slug||''];
 if(!editorialPreview||!photo)return new Response(null,{status:404});
 return new Response(await readEditorialPhotograph(photo.file),{headers:{'Content-Type':'image/jpeg','X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
};
