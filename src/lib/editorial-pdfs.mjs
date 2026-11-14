import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

export async function readEditorialEdition(file){
  if(process.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW!=='true')throw Error('Editorial editions require a preview build.');
  if(!/^src\/assets\/editorial-pdfs\/[a-z0-9-]+\.pdf$/.test(file))throw Error('Invalid editorial edition path');
  return new Uint8Array(await readFile(resolve(file)));
}
