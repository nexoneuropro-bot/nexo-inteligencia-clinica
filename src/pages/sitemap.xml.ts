import {pages} from '../data/pages';
export function GET(){
  const site=import.meta.env.PUBLIC_SITE_URL || 'https://nexoneuro.com';
  const paths=import.meta.env.PUBLIC_INDEXABLE==='true'?['/',...pages.map(p=>`/${p.slug}/`)]:[];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${new URL(path,site).href}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
