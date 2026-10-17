export function GET(){
  const site=import.meta.env.PUBLIC_SITE_URL || 'https://nexoneuro.com';
  const sitemap=import.meta.env.PUBLIC_INDEXABLE === 'true'&&import.meta.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&import.meta.env.PUBLIC_EDITORIAL_SHARED_PREVIEW!=='true' ? `\nSitemap: ${new URL('/sitemap.xml',site).href}\n` : '\n# Previa: noindex em meta tags e X-Robots-Tag. Permitir leitura desses sinais.\n';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
