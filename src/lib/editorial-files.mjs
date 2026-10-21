import {readFile} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';

const sharedReview=()=>process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW==='true';
const assertReview=()=>{if(process.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&!sharedReview())throw Error('Editorial source files require a review build.');};
function within(root,name){const target=resolve(root,name);const rel=relative(root,target);if(rel.startsWith('..'+sep)||rel==='..'||resolve(target)===resolve(root))throw Error('Invalid editorial source path');return target;}
export async function readEditorialOriginal(file){
  assertReview();
  const name=file.replaceAll('\\','/').replace(/^01_EDICOES_PRIORITARIAS\//,'');
  if(!/^[\w.-]+\.pdf$/i.test(name))throw Error('Invalid source filename');
  const root=resolve(sharedReview()?'./src/assets/editorial-originals':process.env.NEXO_EDITORIAL_ARCHIVE||'../../work/psicologia-em-pauta-kit/PSICOLOGIA_EM_PAUTA_KIT_CODEX_2026/01_EDICOES_PRIORITARIAS');
  return new Uint8Array(await readFile(within(root,name)));
}
export async function readEditorialImage(slug){
  assertReview();
  if(!/^[a-z0-9-]+$/.test(slug))throw Error('Invalid editorial illustration');
  const root=resolve(sharedReview()?'./src/assets/editorial-images':process.env.NEXO_EDITORIAL_IMAGES||'../../work/pauta-audit/editorial-images');
  return new Uint8Array(await readFile(within(root,slug+'.jpg')));
}
export async function readEditorialSocial(slug){
  if(process.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW!=='true')throw Error('Editorial social files require a review build.');
  if(!/^[a-z0-9-]+$/.test(slug))throw Error('Invalid editorial social image');
  const root=resolve(process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW==='true'?'./src/assets/editorial-social':process.env.NEXO_EDITORIAL_IMAGES||'../../work/pauta-audit/editorial-images');
  return new Uint8Array(await readFile(within(root,slug+'.png')));
}
