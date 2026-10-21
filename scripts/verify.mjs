import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const root=path.resolve(process.argv[2]||'dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
if(!fs.existsSync(root))throw new Error('Execute pnpm build antes de pnpm verify.');
const files=walk(root),htmlFiles=files.filter(f=>f.endsWith('.html'));
const failures=[];const check=(test,message)=>{if(!test)failures.push(message)};
const titles=new Set();
const production=process.env.PUBLIC_INDEXABLE==='true'&&process.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW!=='true';
for(const file of htmlFiles){
 const html=fs.readFileSync(file,'utf8'),name=path.relative(root,file);
 const editorialPrivacy=name.split(path.sep).join('/')==='psicologia-em-pauta/privacidade/index.html';
 const shouldIndex=production&&name!=='404.html'&&!editorialPrivacy;
 check(/<html[^>]*lang="pt-BR"/.test(html),`${name}: idioma`);
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];check(title&&!titles.has(title),`${name}: título ausente/repetido`);titles.add(title);
 check(/name="description" content="[^"]+"/.test(html),`${name}: descrição`);
 check((html.match(/<h1[ >]/g)||[]).length===1,`${name}: exige um H1`);
 check(/<main\s[^>]*id="conteudo"/.test(html),`${name}: conteúdo principal`);
 check(html.includes(`name="robots" content="${shouldIndex?'index,follow':'noindex,follow'}"`),`${name}: indexação`);
 check(shouldIndex?html.includes('rel="canonical"'):!html.includes('rel="canonical"'),`${name}: canonical da prévia/produção`);
 check(html.includes('data-ambient-sound')&&html.includes('data-sound-toggle aria-pressed="false"'),`${name}: ambiente sonoro opcional desligado inicialmente`);
 check(editorialPrivacy||html.includes('id="experience-stage"'),`${name}: continuidade espacial e alternativa estática`);
 const localEditorialDraft=(process.env.PUBLIC_EDITORIAL_PREVIEW==='true'||process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW==='true')&&(name.split(path.sep).join('/')==='psicologia-em-pauta/index.html'||html.includes('data-editorial-article='));
 check(!/class="[^"\n]*\b(?:ed-draft-strip|ed-inline-review|ed-article-review|ed-review-responses|ed-review-panel)\b/.test(html),`${name}: painel interno de revisão não deve aparecer na leitura`);
 check(!/id="(?:respostas-de-revisao|revisao-do-artigo|painel-editorial)"/.test(html),`${name}: âncora interna de revisão exposta`);
 check(localEditorialDraft||!/prévia para revisão|biblioteca em preparação|rascunho operacional|apresentado no briefing|registro informado|artigos aguardam|ainda aguardam confirmação|versão preliminar/i.test(html),`${name}: conteúdo público sem notas editoriais internas`);
 // Cloudflare enforces script-src 'self'. JSON data is inert; executable
 // inline code would silently disable controls that work on a local preview.
 for(const [,attrs,code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  const inert=/\btype=["']application\/(?:ld\+)?json["']/i.test(attrs);
  check(inert||/\bsrc=["'][^"']+["']/i.test(attrs)||!code.trim(),`${name}: script executável inline incompatível com CSP`);
 }
 for(const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
  const link=match[1];if(/^(https?:|tel:|mailto:|data:)/.test(link))continue;
  if(link==='#'){failures.push(`${name}: link vazio`);continue;}
  const [url,hash]=link.split('#');
  let target=url?path.join(root,url.split('?')[0].replace(/^\//,'')):file;
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){failures.push(`${name}: recurso inexistente ${link}`);continue;}
  if(hash&&target.endsWith('.html'))check(new RegExp(`id=["']${hash}["']`).test(fs.readFileSync(target,'utf8')),`${name}: âncora inexistente ${link}`);
 }
}
const businessServices=['recrutamento-e-selecao','treinamento-e-desenvolvimento','avaliacao-psicologica-organizacional'];
const routes=['','para-voce','psicoterapia','avaliacao-neuropsicologica','integracao-psiquiatrica','para-sua-empresa','riscos-psicossociais-nr1',...businessServices,'nossa-abordagem','profissionais','psicologia-em-pauta','contato','politica-de-privacidade'];
routes.forEach(route=>check(fs.existsSync(path.join(root,route,'index.html')),`Rota ausente: /${route}/`));
// The home presentation is optional decoration over working HTML navigation.
// Keep the cinematic sequence confined to the home and independent of a film.
const homeHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
const opening=homeHtml.match(/<section\b[^>]*\bdata-home-opening(?=[\s=>])[\s\S]*?<\/section>/)?.[0]||'';
const openingTag=opening.match(/^<section\b[^>]*>/)?.[0]||'';
const openingCanvas=opening.match(/<canvas\b[^>]*\bdata-opening-canvas(?=[\s=>])[^>]*>/)?.[0]||'';
const openingPaths=opening.match(/<[a-z][\w:-]*\b[^>]*\bdata-opening-paths(?=[\s=>])[^>]*>/)?.[0]||'';
const hiddenByDefault=tag=>/\s(?:hidden|inert)(?=[\s=>])/.test(tag);
check((homeHtml.match(/\bdata-home-opening(?=[\s=>])/g)||[]).length===1,'Home: uma única abertura');
check(Boolean(opening)&&!hiddenByDefault(openingTag),'Home: abertura e caminhos disponíveis sem JavaScript');
check(Boolean(openingCanvas),'Home: apresentação sináptica em canvas');
check(/\baria-hidden="true"/.test(openingCanvas)||/<div\b[^>]*class="[^"]*\bhome-opening-scene\b[^"]*"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<canvas\b/.test(opening),'Home: canvas decorativo oculto da árvore acessível');
check(Boolean(openingPaths)&&!hiddenByDefault(openingPaths),'Home: escolhas HTML visíveis antes do aprimoramento');
const openingChoices=[...opening.matchAll(/<a\b[^>]*\bdata-opening-choice(?=[\s=>])[^>]*>/g)].map(match=>match[0]);
check(openingChoices.length===2,'Home: dois caminhos institucionais na abertura');
for(const route of ['/para-voce/','/para-sua-empresa/'])check(openingChoices.some(tag=>tag.includes(`href="${route}"`)&&!hiddenByDefault(tag)),`Home: caminho acessível ${route}`);
for(const control of ['skip','pause'])check(new RegExp(`<button\\b[^>]*\\bdata-opening-${control}(?=[\\s=>])`).test(opening),`Home: controle de ${control==='skip'?'pular':'pausar'} a abertura`);
check(/<button\b[^>]*\bdata-opening-replay(?=[\s=>])/.test(homeHtml),'Home: opção de rever abertura');
check(!/<video\b|data-opening-video|\/media\/nexo-abertura\.mp4/i.test(opening),'Home: sequência sem dependência do vídeo anterior');
for(const file of htmlFiles.filter(file=>file!==path.join(root,'index.html'))){
 check(!/\bdata-home-opening(?=[\s=>])|\bdata-opening-canvas(?=[\s=>])/.test(fs.readFileSync(file,'utf8')),`${path.relative(root,file)}: abertura exclusiva da home`);
}
// A page can build correctly yet remain undiscoverable. Follow the actual HTML
// links from the home page to check that every institutional route is reachable.
const routePaths=new Set(routes.map(route=>route?`/${route}/`:'/'));
const reached=new Set(['/']),pending=['/'];
while(pending.length){
 const current=pending.shift();
 const html=fs.readFileSync(path.join(root,current.slice(1),'index.html'),'utf8');
 for(const [,href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
  const target=new URL(href,`https://preview.invalid${current}`);
  if(target.origin==='https://preview.invalid'&&routePaths.has(target.pathname)&&!reached.has(target.pathname)){reached.add(target.pathname);pending.push(target.pathname);}
 }
}
for(const route of routePaths)check(reached.has(route),`Rota sem caminho navegável desde a home: ${route}`);
for(const route of ['', 'para-voce']){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 check(html.includes('data-care-pathways'),`${route||'home'}: apresentação dos caminhos de cuidado`);
 for(const topic of ['psychotherapy','brief-therapy','neuropsychological-assessment','psychiatry-interface','self-knowledge-social-care'])check(html.includes(`data-care-node="${topic}"`),`${route||'home'}: caminho ${topic}`);
 check(html.includes('data-self-observation'),`${route||'home'}: reflexão educativa`);
 check((html.match(/data-so-panel="\d"/g)||[]).length===5,`${route||'home'}: cinco etapas de auto-observação em HTML`);
}
for(const route of ['para-sua-empresa','riscos-psicossociais-nr1']){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 check(html.includes('data-business-experience'),`${route}: continuidade da jornada empresarial`);
 for(let index=0;index<4;index++)check(html.includes(`data-work-factor="${index}"`),`${route}: condição de trabalho ${index}`);
 for(let index=0;index<5;index++)check(html.includes(`data-work-stage="${index}"`),`${route}: etapa de prevenção ${index}`);
 check(html.includes('26 de maio de 2026'),`${route}: vigência NR-1 contextualizada`);
 check(!html.includes('frente prevista no briefing'),`${route}: conteúdo público sem rascunho interno`);
}
// The institutional crawler above checks that each service is discoverable and
// resolves every local link. These assertions protect the shared spatial entry
// when a dedicated business service is opened directly from search.
for(const route of businessServices){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 check(html.includes('data-business-service'),`${route}: identificação do serviço empresarial`);
 check(html.includes('data-entry="business"'),`${route}: continuidade espacial da jornada empresarial`);
}
const professionalHtml=fs.readFileSync(path.join(root,'profissionais','index.html'),'utf8');
check(professionalHtml.includes('CRP-SP 06/176184')&&professionalHtml.includes('CRM-SP 193133'),'Profissionais: registros presentes');
check(!/Registro informado|Apresentado no briefing|Registros, títulos e RQE|registros informados|aguardam conferência/.test(professionalHtml),'Profissionais: apresentação pública sem notas internas');
for(const [route,scene] of Object.entries({'psicologia-em-pauta':'ideas',profissionais:'people',contato:'contact','politica-de-privacidade':'privacy'})){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 check(html.includes(`data-reading-scene="${scene}"`),`${route}: composição espacial correspondente à leitura`);
}
const libraryHtml=fs.readFileSync(path.join(root,'psicologia-em-pauta','index.html'),'utf8');
const guides=JSON.parse(fs.readFileSync(new URL('../src/data/learning-guides.json',import.meta.url),'utf8'));
check(libraryHtml.includes('data-learning-library'),'Psicologia em Pauta: biblioteca acessível em HTML');
check(guides.length===3,'Psicologia em Pauta: três guias educativos');
for(const guide of guides){
 check(libraryHtml.includes(`data-learning-guide="${guide.slug}"`),`Guia ${guide.slug}: conteúdo na página`);
 check([...libraryHtml.matchAll(/<a\b([^>]*)>/g)].some(([,attrs])=>attrs.includes(`href="${guide.download}"`) && /\sdownload(?:\s|=|$)/.test(attrs)),`Guia ${guide.slug}: download disponível`);
 const pdfPath=path.join(root,guide.download.replace(/^\//,''));
 check(fs.existsSync(pdfPath),`Guia ${guide.slug}: arquivo disponível`);
 if(fs.existsSync(pdfPath))check(fs.readFileSync(pdfPath).subarray(0,5).toString()==='%PDF-',`Guia ${guide.slug}: formato PDF`);
 for(const section of guide.sections)check(libraryHtml.includes(section.title),`Guia ${guide.slug}: leitura integral em HTML`);
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
check((sitemap.match(/<loc>/g)||[]).length===(production?routes.length:0),'Sitemap incompatível com indexação');
check(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Allow: /'),'Robots deve permitir ler noindex');
const headers=fs.readFileSync(path.join(root,'_headers'),'utf8');check(production?!headers.includes('noindex'):headers.includes('noindex'),'X-Robots-Tag');
check(/\bscript-src\s+'self'\s*;/.test(headers),'CSP permite somente scripts da própria origem');
const assets=files.filter(f=>/\.(js|css)$/.test(f)).map(f=>({file:path.relative(root,f),bytes:fs.statSync(f).size,gzip:gzipSync(fs.readFileSync(f)).length}));
console.log(JSON.stringify({pages:htmlFiles.length,requestedRoutes:routes.length,reachableRoutes:reached.size,linksAndAssets:'checked',mode:production?'production':'preview',assets,failures},null,2));
if(failures.length)process.exitCode=1;
