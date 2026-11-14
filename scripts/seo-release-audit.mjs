// Verifica os artefatos de SEO de cada ambiente sem fazer deploy.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const mode=process.env.SEO_AUDIT_MODE;
assert.ok(['preview','production'].includes(mode),'Defina SEO_AUDIT_MODE=preview ou production');
const production=mode==='production';
const origin=production?'https://nexoneuro.com':'https://nexo-previa-20261014.pages.dev';
const root=path.resolve('dist');
const slugs=['','para-voce','psicoterapia','avaliacao-neuropsicologica',
  'integracao-psiquiatrica','para-sua-empresa','recrutamento-e-selecao',
  'treinamento-e-desenvolvimento','avaliacao-psicologica-organizacional',
  'riscos-psicossociais-nr1','nossa-abordagem','profissionais',
  'psicologia-em-pauta','contato','politica-de-privacidade'];
const read=filename=>readFileSync(path.join(root,filename),'utf8');
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([a-zA-Z_:][\w:.-]*)="([^"]*)"/g)].map(([,name,value])=>[name,value]));
const tags=(html,tag)=>[...html.matchAll(new RegExp('<'+tag+'\\b[^>]*>','gi'))].map(match=>attrs(match[0]));
const meta=(html,key,value)=>tags(html,'meta').find(item=>item[key]===value);
const assetExists=filename=>existsSync(path.join(root,filename));
let checked=0;
for(const slug of slugs){
  const relative=slug?slug+'/index.html':'index.html';
  assert.ok(assetExists(relative),'Rota institucional ausente: '+relative);
  const html=read(relative);
  const expectedUrl=origin+'/'+(slug?slug+'/':'');
  const robots=meta(html,'name','robots')?.content;
  assert.equal(robots,production?'index,follow':'noindex,follow','robots: '+relative);
  const canonical=tags(html,'link').find(link=>link.rel==='canonical')?.href;
  assert.equal(canonical,production?expectedUrl:undefined,'canonical: '+relative);
  const ogUrl=meta(html,'property','og:url')?.content;
  assert.equal(ogUrl,production?expectedUrl:undefined,'og:url: '+relative);
  const ogImage=meta(html,'property','og:image')?.content;
  const twImage=meta(html,'name','twitter:image')?.content;
  assert.ok(ogImage?.startsWith(origin+'/'),'Imagem OG usa origem incorreta: '+relative+' => '+ogImage);
  assert.ok(twImage?.startsWith(origin+'/'),'Imagem Twitter usa origem incorreta: '+relative+' => '+twImage);
  assert.ok(/<title>[^<]+<\/title>/.test(html),'Title ausente: '+relative);
  assert.ok(meta(html,'name','description')?.content?.length>60,'Description curta/ausente: '+relative);
  assert.ok(/<h1\b/i.test(html),'H1 ausente: '+relative);
  const ldJson=html.includes('type="application/ld+json"');
  assert.equal(ldJson,production,'JSON-LD na previa/producao: '+relative);
  checked++;
}
const robotText=read('robots.txt');
const siteMap=read('sitemap.xml');
assert.ok(/User-agent:\s*\*/.test(robotText)&&/Allow:\s*\//.test(robotText),'robots.txt deve permitir ler os sinais noindex');
const urls=[...siteMap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(production){
  assert.ok(robotText.includes('Sitemap: https://nexoneuro.com/sitemap.xml'),'Sitemap oficial ausente no robots.txt');
  for(const slug of slugs)assert.ok(urls.includes(origin+'/'+(slug?slug+'/':'')),'Sitemap sem rota: '+(slug||'/'));
  assert.ok(urls.every(url=>url.startsWith(origin+'/')),'Sitemap contem dominio nao oficial');
  assert.ok(!urls.some(url=>/\/(?:conhecendo-meu-momento|nexo-profissional|nr1-questionario|pesquisa)\//.test(url)),'Rota clinica/pesquisa vazou para sitemap');
}else{
  assert.equal(urls.length,0,'Previa nao deve incluir URLs no sitemap');
  assert.ok(!robotText.includes('Sitemap:'),'Previa nao deve anunciar sitemap');
}
const headers=read('_headers');
const general=headers.split('/conhecendo-meu-momento')[0];
assert.equal(general.includes('X-Robots-Tag: noindex, follow'),!production,'X-Robots-Tag global divergente');
for(const privateRoute of ['/conhecendo-meu-momento/*','/nexo-profissional/*','/nr1-questionario/*','/pesquisa/relacionamento-aberto/*']){
  assert.ok(headers.includes(privateRoute),'Cabecalho privado ausente: '+privateRoute);
}
assert.ok(headers.includes('X-Robots-Tag: noindex, nofollow, noarchive'),'Rotas clinicas devem permanecer fora da busca');
console.log(JSON.stringify({mode,origin,institutionalPagesChecked:checked,sitemapUrls:urls.length,globalIndexing:production?'enabled':'disabled',privatePages:'noindex preserved',metadata:'verified'},null,2));
