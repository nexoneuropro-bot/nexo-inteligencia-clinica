import type {APIRoute} from 'astro';
import {editorialPreview} from '../../../data/editorial';
import {readEditorialEdition} from '../../../lib/editorial-pdfs.mjs';
import manifest from '../../../data/editorial-pdf-manifest.json';

export const prerender=true;
export function getStaticPaths(){
  return editorialPreview?manifest.editions.map(edition=>({params:{edition:edition.slug},props:{file:edition.file}})):[];
}
export const GET:APIRoute=async({props})=>{
  // Filenames originate only in the generated, repository-owned manifest.
  const file=String(props.file||'');
  if(!/^src\/assets\/editorial-pdfs\/[a-z0-9-]+\.pdf$/.test(file))throw Error('Invalid editorial edition path');
  return new Response(new Uint8Array(await readEditorialEdition(file)),{headers:{
    'Content-Type':'application/pdf',
    'X-Robots-Tag':'noindex, nofollow',
    'Cache-Control':'no-store',
    'Content-Disposition':`inline; filename="${file.split('/').pop()}"`
  }});
};
