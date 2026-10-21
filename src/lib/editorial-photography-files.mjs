import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// File access follows the existing .mjs editorial asset readers. Only manifest
// paths inside the photographic archive are permitted, and only in a preview.
export async function readEditorialPhotograph(file){
 if(process.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW!=='true')throw Error('Editorial photographs require a review build.');
 if(!/^src\/assets\/editorial-images\/[a-z0-9-]+\.jpg$/.test(file))throw Error('Invalid editorial photograph path');
 return new Uint8Array(await readFile(resolve(file)));
}
