import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const root=path.resolve(process.argv[2]||'dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
if(!fs.existsSync(root))throw new Error('Execute pnpm build antes de pnpm verify.');
const files=walk(root),htmlFiles=files.filter(f=>f.endsWith('.html'));
const failures=[];const check=(test,message)=>{if(!test)failures.push(message)};
const titles=new Set();
const production=process.env.PUBLIC_INDEXABLE==='true';
for(const file of htmlFiles){
 const html=fs.readFileSync(file,'utf8'),name=path.relative(root,file);
 check(/<html[^>]*lang="pt-BR"/.test(html),`${name}: idioma`);
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];check(title&&!titles.has(title),`${name}: título ausente/repetido`);titles.add(title);
 check(/name="description" content="[^"]+"/.test(html),`${name}: descrição`);
 check((html.match(/<h1[ >]/g)||[]).length===1,`${name}: exige um H1`);
 check(/<main\s[^>]*id="conteudo"/.test(html),`${name}: conteúdo principal`);
 check(html.includes(`name="robots" content="${production?'index,follow':'noindex,follow'}"`),`${name}: indexação`);
 check(production?html.includes('rel="canonical"'):!html.includes('rel="canonical"'),`${name}: canonical da prévia/produção`);
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
const routes=['','para-voce','psicoterapia','avaliacao-neuropsicologica','integracao-psiquiatrica','para-sua-empresa','riscos-psicossociais-nr1','nossa-abordagem','profissionais','psicologia-em-pauta','contato','politica-de-privacidade'];
routes.forEach(route=>check(fs.existsSync(path.join(root,route,'index.html')),`Rota ausente: /${route}/`));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
check((sitemap.match(/<loc>/g)||[]).length===(production?12:0),'Sitemap incompatível com indexação');
check(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Allow: /'),'Robots deve permitir ler noindex');
const headers=fs.readFileSync(path.join(root,'_headers'),'utf8');check(production?!headers.includes('noindex'):headers.includes('noindex'),'X-Robots-Tag');
const assets=files.filter(f=>/\.(js|css)$/.test(f)).map(f=>({file:path.relative(root,f),bytes:fs.statSync(f).size,gzip:gzipSync(fs.readFileSync(f)).length}));
console.log(JSON.stringify({pages:htmlFiles.length,requestedRoutes:routes.length,linksAndAssets:'checked',mode:production?'production':'preview',assets,failures},null,2));
if(failures.length)process.exitCode=1;
