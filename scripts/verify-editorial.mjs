/**
 * Read-only checks for the local editorial draft and the public build boundary.
 * Usage: node scripts/verify-editorial.mjs <build-directory> --draft|--shared|--public
 * Reads source JSON and emitted files only; never requires the private archive.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const args=process.argv.slice(2);
const flags=args.filter(arg=>arg.startsWith('--'));
const directories=args.filter(arg=>!arg.startsWith('--'));
if(flags.length!==1||!['--draft','--shared','--public'].includes(flags[0])||directories.length>1){
 console.error('Usage: node scripts/verify-editorial.mjs <build-directory> --draft|--shared|--public');
 process.exit(2);
}
const mode=flags[0].slice(2);
const build=path.resolve(directories[0]||'dist');
const project=fileURLToPath(new URL('..',import.meta.url));
const dataDirectory=path.join(project,'src','data','editorial');
const photography=JSON.parse(fs.readFileSync(path.join(project,'src/data/editorial-photography.json'),'utf8'));
const expected={
 'relacoes-reciprocidade':{pages:14,hash:'e143fee52b9154a8bc9a0af2546af4a54af1cd2189d4ef1124dce6dcb59246fc'},
 'neurodivergencia-comunicacao':{pages:15,hash:'d526a282fc4369753e70b302fbc2ad442e71476af5dfbe9cae7b13317e2ae4f5'},
 'o-que-faz-um-psicologo':{pages:12,hash:'3568e5554f4d5686be87c0dbc292fb908a5d62c43bb1799f21041b041a412411'},
 'analise-do-comportamento':{pages:7,hash:'1f3eca20c50046dced189b6885ea2574aa49d4de90ec275a04b6061dc7084f52'},
 'escuta-atencao-e-relacoes':{pages:17,hash:'7da24b5dd1e4c9c5c194c8ddc22a084140c03cc79624add2ccbb00ff38462fef'},
 'quem-cuida-de-quem-cuida':{pages:18,hash:'98c39c1300f38de1936f38f1b89197c030f517e4346342c2819d1d58c831f1b8'},
};
const slugs=Object.keys(expected);
const institutional=['','para-voce','psicoterapia','avaliacao-neuropsicologica','integracao-psiquiatrica','para-sua-empresa','riscos-psicossociais-nr1','recrutamento-e-selecao','treinamento-e-desenvolvimento','avaliacao-psicologica-organizacional','nossa-abordagem','profissionais','psicologia-em-pauta','contato','politica-de-privacidade'];
const failures=[];
const warnings=[];
const check=(value,message)=>{if(!value)failures.push(message);};
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
 const target=path.join(directory,entry.name);
 if(entry.isSymbolicLink()){failures.push(`Unexpected symlink: ${target}`);return [];}
 return entry.isDirectory()?walk(target):[target];
});
const relative=file=>path.relative(build,file).split(path.sep).join('/');
const routeFile=slug=>path.join(build,'psicologia-em-pauta',slug,'index.html');
const routeUrl=slug=>`/psicologia-em-pauta/${slug}/`;
const sourceUrl=slug=>`/psicologia-em-pauta/${slug==='analise-do-comportamento'?'acervo':'originais'}/${slug}.pdf`;
const imageUrl=slug=>`/psicologia-em-pauta/imagens/${slug}.jpg`;
const socialUrl=slug=>`/psicologia-em-pauta/sociais/${slug}.png`;
const outputFile=url=>path.join(build,...url.replace(/^\//,'').split('/'));
const read=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

function decode(value){
 return value.replace(/\\u([0-9a-f]{4})/gi,(_,hex)=>String.fromCharCode(parseInt(hex,16)))
  .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi,(_,hex,decimal)=>{
   const point=parseInt(hex||decimal,hex?16:10);
   return point<=0x10ffff?String.fromCodePoint(point):'\ufffd';
  })
  .replace(/&(amp|quot|apos|lt|gt|nbsp|ldquo|rdquo|lsquo|rsquo|ndash|mdash);/g,(_,name)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’',ndash:'–',mdash:'—'})[name]);
}
const normalized=value=>decode(String(value)).replace(/<[^>]*>/g,' ').replace(/\\[nrt]/g,' ').normalize('NFKC').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
function attrs(tag){
 const found={};
 for(const [,name,quotedSingle,quotedDouble,bare] of tag.matchAll(/([\w:-]+)\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+))/g))found[name.toLowerCase()]=decode(quotedSingle??quotedDouble??bare??'');
 return found;
}
function meta(html,name){
 for(const [tag] of html.matchAll(/<meta\b[^>]*>/gi)){
  const data=attrs(tag);
  if(data.name===name||data.property===name)return data.content||'';
 }
 return '';
}
function linked(html,url){
 return [...html.matchAll(/<a\b[^>]*>/gi)].some(([tag])=>attrs(tag).href?.split('#')[0]===url);
}
function readerInterface(html,label){
 const internalClasses=new Set(['ed-draft-strip','ed-inline-review','ed-article-review','ed-review-responses','ed-review-panel']);
 const internalAnchors=new Set(['revisao-do-artigo','respostas-de-revisao','painel-editorial']);
 for(const [tag] of html.matchAll(/<[a-z][\w:-]*\b[^>]*>/gi)){
  const data=attrs(tag);
  for(const token of (data.class||'').split(/\s+/))check(!internalClasses.has(token),`${label}: internal review UI rendered: ${token}`);
  check(!internalAnchors.has(data.id),`${label}: internal review section rendered: ${data.id}`);
  const fragment=(data.href||'').split('#')[1];
  check(!internalAnchors.has(fragment),`${label}: internal review navigation rendered: #${fragment}`);
 }
 const content=normalized(html).toLocaleLowerCase('pt-BR');
 for(const marker of ['Nota de revisão deste trecho','Checagem pontual registrada nesta migração.','Checagem específica pendente.','Fonte a substituir antes da publicação.','REVISÃO DO TITULAR','Origem, créditos e próximos passos.']){
  check(!content.includes(normalized(marker).toLocaleLowerCase('pt-BR')),`${label}: internal audit wording rendered: ${marker}`);
 }
 check(!/\bnota original \d+\s*:/i.test(content),`${label}: research response notes rendered in the reader`);
}
function scripts(html,name){
 const json=[];
 for(const [,attributes,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  const data=attrs(attributes);
  const inert=/^application\/(?:ld\+)?json$/i.test(data.type||'');
  check(inert||Boolean(data.src)||!body.trim(),`${name}: executable inline script violates the deployed CSP`);
  if(data.type==='application/ld+json'){
   try{json.push(JSON.parse(body));}catch{failures.push(`${name}: invalid JSON-LD`);}
  }
 }
 return json;
}
function findKeys(value,test,found=[]){
 if(!value||typeof value!=='object')return found;
 for(const [key,entry] of Object.entries(value)){
  if(test(key,entry))found.push({key,value:entry});
  findKeys(entry,test,found);
 }
 return found;
}
function headerRules(text){
 const rules=[];
 let current;
 for(const line of text.split(/\r?\n/)){
  if(!line.trim()||line.trim().startsWith('#'))continue;
  if(!/^\s/.test(line)){
   current={pattern:line.trim(),headers:{}};rules.push(current);
  }else if(current){
   const match=line.trim().match(/^([^:]+):\s*(.*)$/);
   if(match){const key=match[1].toLowerCase();current.headers[key]=[current.headers[key],match[2]].filter(Boolean).join(', ');}
  }
 }
 return rules;
}
function patternMatches(pattern,url){
 if(!pattern.startsWith('/'))return false;
 const escaped=pattern.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*').replace(/:[a-zA-Z][\w-]*/g,'[^/]+');
 return new RegExp(`^${escaped}$`).test(url);
}
function noindexHeader(rules,url){
 return rules.some(rule=>patternMatches(rule.pattern,url)&&/\bnoindex\b/i.test(rule.headers['x-robots-tag']||''));
}
function blockContent(block){
 return [block.text||'',...(block.items||[]),...(block.columns||[]),...(block.rows||[]).flat()].filter(nonempty);
}
function validateArticle(article,filename){
 const label=article.slug||filename;
 for(const field of ['slug','title','subtitle','description','category','migratedAt'])check(nonempty(article[field]),`${label}: missing ${field}`);
 check(Boolean(expected[article.slug]),`${label}: unexpected article slug`);
 check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug||''),`${label}: unsafe slug`);
 check(['relations','neuro','profession','behavior','listening','care'].includes(article.theme),`${label}: invalid theme`);
 check(article.draft===true&&article.reviewed===false,`${label}: source must remain draft=true and reviewed=false`);
 check(article.approvedForPublication!==true&&!article.publishedAt,`${label}: publication approval/date cannot be invented`);
 check(/^\d{4}-\d{2}-\d{2}$/.test(article.migratedAt||'')&&!Number.isNaN(Date.parse(article.migratedAt)),`${label}: invalid migration date`);
 const source=article.source||{};
 check(nonempty(source.file)&&/^(?:01_EDICOES_PRIORITARIAS\/)?[^/\\]+\.pdf$/i.test(source.file||''),`${label}: invalid source PDF path`);
 check(source.totalPages===expected[article.slug]?.pages,`${label}: source page count differs from the archive inventory`);
 check(source.sha256===expected[article.slug]?.hash,`${label}: source SHA-256 differs from the archive inventory`);
 const validPages=pages=>Array.isArray(pages)&&pages.length>0&&pages.every(page=>Number.isInteger(page)&&page>=1&&page<=source.totalPages)&&new Set(pages).size===pages.length;
 const credit=article.credit||{};
 check(nonempty(credit.name)&&nonempty(credit.label)&&typeof credit.authorshipConfirmedBySource==='boolean',`${label}: missing source credit/role`);
 check(validPages(credit.sourcePages),`${label}: invalid credit source pages`);
 const adaptation=article.adaptationCredit;
 check(adaptation?.name==='Gabriel Alves Batista'&&adaptation?.label==='Texto e curadoria'&&adaptation?.confirmedByHolder===true&&adaptation?.confirmedAt==='2026-10-17',`${label}: holder-confirmed adaptation credit is missing or changed`);
 check(Array.isArray(article.reviewNotes)&&article.reviewNotes.length>0&&article.reviewNotes.every(nonempty),`${label}: review notes missing`);
 check(article.researchReviewedAt==='2026-10-17',`${label}: source review date missing`);
 check(nonempty(article.seoTitle),`${label}: descriptive search title missing`);
 check(Array.isArray(article.reviewResponses)&&article.reviewResponses.length>0,`${label}: research responses missing`);
 for(const response of article.reviewResponses||[]){
  check(['note','response','action'].every(key=>nonempty(response[key]))&&['resolved','editorial-decision','pending-source'].includes(response.status),`${label}: malformed research response`);
  for(const source of response.sources||[])check(nonempty(source.label)&&/^https:\/\/[^\s]+$/.test(source.url||''),`${label}: unsafe response source URL`);
 }
 const ids=new Set();
 check(Array.isArray(article.sections)&&article.sections.length>0,`${label}: sections missing`);
 for(const section of article.sections||[]){
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section.id||'')&&!ids.has(section.id),`${label}: invalid/duplicate chapter id ${section.id}`);ids.add(section.id);
  check(nonempty(section.title)&&validPages(section.pages),`${label}/${section.id}: title or source pages invalid`);
  check(Array.isArray(section.blocks)&&section.blocks.length>0,`${label}/${section.id}: blocks missing`);
  for(const block of section.blocks||[]){
   check(['p','quote','list','table','exercise','note'].includes(block.type),`${label}/${section.id}: unknown block type ${block.type}`);
   if(['p','quote','note'].includes(block.type))check(nonempty(block.text),`${label}/${section.id}: empty ${block.type}`);
   if(['list','exercise'].includes(block.type))check((Array.isArray(block.items)&&block.items.length>0&&block.items.every(nonempty))||nonempty(block.text),`${label}/${section.id}: empty ${block.type}`);
   if(block.type==='table')check(Array.isArray(block.columns)&&block.columns.length>0&&block.columns.every(nonempty)&&Array.isArray(block.rows)&&block.rows.length>0&&block.rows.every(row=>Array.isArray(row)&&row.length===block.columns.length&&row.every(nonempty)),`${label}/${section.id}: malformed table`);
  }
 }
 check(Array.isArray(article.references)&&article.references.length>0,`${label}: references missing`);
 for(const reference of article.references||[]){
  check(nonempty(reference.label)&&['verified','pending','replace'].includes(reference.verification),`${label}: malformed reference`);
  if(reference.url)check(/^https:\/\/[^\s]+$/i.test(reference.url),`${label}: unsafe reference URL`);
 }
}

if(!fs.existsSync(build)||!fs.statSync(build).isDirectory()){
 console.error(JSON.stringify({mode,build,failures:['Build directory does not exist. Build first.']},null,2));process.exit(2);
}
const articles=[];
for(const slug of slugs){
 const file=path.join(dataDirectory,`${slug}.json`);
 try{const article=JSON.parse(fs.readFileSync(file,'utf8'));validateArticle(article,file);articles.push(article);}
 catch(error){failures.push(`${slug}: cannot read source JSON: ${error.message}`);}
}
const actualDataFiles=fs.readdirSync(dataDirectory).filter(file=>file.endsWith('.json'));
check(actualDataFiles.length===6,'Expected exactly six editorial source JSON files');
const files=walk(build);
const htmlFiles=files.filter(file=>file.endsWith('.html'));
const rules=headerRules(read(path.join(build,'_headers')));
check(rules.length>0,'Build must emit _headers');
const sitemap=read(path.join(build,'sitemap.xml'));
check(Boolean(sitemap),'Build must emit sitemap.xml');
for(const slug of slugs)check(!sitemap.includes(routeUrl(slug)),`${slug}: unapproved draft leaked into sitemap`);
for(const route of institutional)check(fs.existsSync(path.join(build,route,'index.html')),`Institutional route missing: /${route}/`);
for(const file of htmlFiles)scripts(read(file),relative(file));
const landing=read(path.join(build,'psicologia-em-pauta','index.html'));
const editionManifest=JSON.parse(read(path.join(project,'src/data/editorial-pdf-manifest.json'))||'{"editions":[]}');
for(const edition of editionManifest.editions){
 const emitted=path.join(build,'psicologia-em-pauta','edicoes',`${edition.slug}.pdf`);
 if(mode==='public'){check(!fs.existsSync(emitted),`${edition.slug}: unapproved revised PDF leaked into public build`);continue;}
 const source=path.join(project,edition.source);
 check(fs.existsSync(source)&&sha256(fs.readFileSync(source))===edition.sourceSha256,`${edition.slug}: revised PDF is stale relative to article JSON`);
 check(fs.existsSync(emitted),`${edition.slug}: revised PDF missing`);
 if(fs.existsSync(emitted))check(sha256(fs.readFileSync(emitted))===edition.pdfSha256,`${edition.slug}: revised PDF differs from checked manifest`);
 check(noindexHeader(rules,`/psicologia-em-pauta/edicoes/${edition.slug}.pdf`),`${edition.slug}: revised PDF lacks noindex header`);
}
const draftArtifacts=files.filter(file=>/^psicologia-em-pauta\/(?:originais|acervo|imagens|sociais)\//.test(relative(file)));
const summaries=[];

if(mode!=='public'){
 check(htmlFiles.length===23,`Draft build must have 23 HTML files (15 institutional routes, six articles, editorial privacy and 404); found ${htmlFiles.length}`);
 readerInterface(landing,'editorial landing');
 const titles=new Set(),descriptions=new Set(),socials=new Set();
 for(const article of articles){
  const url=routeUrl(article.slug),file=routeFile(article.slug),html=read(file),label=article.slug;
  check(Boolean(html),`${label}: individual HTML missing`);
  check(linked(landing,url),`${label}: landing does not link to individual article`);
  check(linked(landing,sourceUrl(label)),`${label}: landing does not offer the original PDF`);
  readerInterface(html,label);
  check(html.includes(`data-editorial-article="${label}"`)&&html.includes('data-draft="true"')&&html.includes('data-reviewed="false"'),`${label}: draft state missing from rendered article`);
  check((html.match(/<h1(?:\s|>)/gi)||[]).length===1,`${label}: requires one H1`);
  const title=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'';
  const description=meta(html,'description');
  check(nonempty(title)&&!titles.has(normalized(title))&&normalized(title).includes(normalized(article.seoTitle||article.title)),`${label}: title is missing, repeated or unrelated`);titles.add(normalized(title));
  check(normalized(description)===normalized(article.description)&&!descriptions.has(normalized(description)),`${label}: description missing, repeated or not article-specific`);descriptions.add(normalized(description));
  check(/\bnoindex\b/i.test(meta(html,'robots')),`${label}: draft robots meta must remain noindex even in an indexable build`);
  check(noindexHeader(rules,url),`${label}: draft URL lacks X-Robots-Tag noindex`);
  check(![...html.matchAll(/<link\b[^>]*>/gi)].some(([tag])=>(attrs(tag).rel||'').split(/\s+/).includes('canonical')),`${label}: unapproved draft must not emit canonical`);
  check(!meta(html,'article:published_time'),`${label}: draft must not emit publication time`);
  const structured=scripts(html,label);
  check(!structured.some(data=>findKeys(data,key=>/^(?:datePublished|dataPublished|publishedAt)$/i.test(key)).length),`${label}: structured data invents publication date`);
  if(!article.credit.authorshipConfirmedBySource&&!article.adaptationCredit?.confirmedByHolder){
   check(!structured.some(data=>findKeys(data,key=>key.toLowerCase()==='author').length),`${label}: curatorship/unconfirmed credit promoted to structured author`);
  }
  const content=normalized(html);
  check(content.includes(normalized(`${article.adaptationCredit.label} de ${article.adaptationCredit.name}`)),`${label}: confirmed adaptation byline missing`);
  let missingFragments=0;
  for(const section of article.sections){
   check(html.includes(`id="${section.id}"`)&&content.includes(normalized(section.title)),`${label}: chapter missing ${section.id}`);
   for(const block of section.blocks)for(const fragment of blockContent(block))if(!content.includes(normalized(fragment))){
    missingFragments+=1;
    if(missingFragments<=3)failures.push(`${label}/${section.id}: source content missing from HTML: ${fragment.slice(0,110)}`);
   }
  }
  if(missingFragments>3)failures.push(`${label}: ${missingFragments} content fragments are absent in total`);
  check(html.includes('id="referencias"'),`${label}: references section missing`);
  check(html.includes('id="baixar-edicao"')&&linked(html,sourceUrl(label)),`${label}: original PDF download section missing`);
  check([...html.matchAll(/<a\b[^>]*>/gi)].some(([tag])=>attrs(tag).href==='#baixar-edicao'),`${label}: article index does not link to the PDF section`);
  for(const reference of article.references)check(content.includes(normalized(reference.label)),`${label}: reference omitted: ${reference.label.slice(0,100)}`);
  const original=outputFile(sourceUrl(label));
  check(fs.existsSync(original),`${label}: original PDF missing`);
  if(fs.existsSync(original)){
   const bytes=fs.readFileSync(original);
   check(bytes.subarray(0,5).toString()==='%PDF-',`${label}: original is not a PDF`);
   check(sha256(bytes)===article.source.sha256,`${label}: emitted original differs from inventoried source SHA-256`);
  }
  check(noindexHeader(rules,sourceUrl(label)),`${label}: original PDF lacks noindex header`);
  const social=meta(html,'og:image');
  let socialPath='';
  try{socialPath=new URL(social,'https://preview.invalid').pathname;}catch{failures.push(`${label}: invalid social image URL`);}
  check(socialPath===socialUrl(label)&&!socials.has(socialPath),`${label}: social image must belong to this article`);socials.add(socialPath);
  check(meta(html,'twitter:image')===social,`${label}: sharing images do not agree`);
  const socialFile=outputFile(socialUrl(label));
  check(fs.existsSync(socialFile),`${label}: social image not emitted`);
  if(fs.existsSync(socialFile))check(fs.readFileSync(socialFile).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`${label}: social image is not PNG`);
  check(noindexHeader(rules,socialUrl(label)),`${label}: social image lacks noindex header`);
  {
   const cover=photography.assets[photography.editions[label]?.cover];
   const photoUrl=cover?.url||imageUrl(label);
   const illustration=outputFile(photoUrl);
   check(Boolean(cover)&&html.includes(photoUrl)&&fs.existsSync(illustration),`${label}: editorial cover photography missing`);
   if(fs.existsSync(illustration))check(fs.readFileSync(illustration).subarray(0,2).equals(Buffer.from([255,216])),`${label}: illustration is not JPEG`);
   check(noindexHeader(rules,photoUrl),`${label}: photography lacks noindex header`);
  }
  summaries.push({slug:label,chapters:article.sections.length,references:article.references.length,missingContentFragments:missingFragments,originalPdfLinked:linked(html,sourceUrl(label)),internalReviewUiAllowed:false,sourceSha256:article.source.sha256});
 }
 const expectedArtifacts=new Set(articles.flatMap(article=>[
  sourceUrl(article.slug).slice(1),socialUrl(article.slug).slice(1),
  ...Object.values(photography.assets).map(photo=>photo.url.slice(1)),
 ]));
 const legacySource='psicologia-em-pauta/originais/analise-do-comportamento.pdf';
 expectedArtifacts.add(legacySource);
 const redirectFile=path.join(build,'_redirects');
 check(fs.existsSync(redirectFile)&&fs.readFileSync(redirectFile,'utf8').split(/\r?\n/).includes(`/${legacySource} /psicologia-em-pauta/edicoes/analise-do-comportamento.pdf 302`),'Legacy PDF must redirect to the revised edition');
 const legacyFile=path.join(build,legacySource);
 check(fs.existsSync(legacyFile)&&sha256(fs.readFileSync(legacyFile))===articles.find(article=>article.slug==='analise-do-comportamento')?.source.sha256,'Legacy source bytes must remain preserved');
 for(const artifact of draftArtifacts)check(expectedArtifacts.has(relative(artifact)),`Unexpected editorial draft artifact: ${relative(artifact)}`);
 check(draftArtifacts.length===expectedArtifacts.size,`Expected ${expectedArtifacts.size} inventoried source/image/social assets including the archived source; found ${draftArtifacts.length} files`);
 for(const [id,photo] of Object.entries(photography.assets)){
  const emitted=outputFile(photo.url);
  check(fs.existsSync(emitted),`${id}: photography asset missing`);
  if(fs.existsSync(emitted))check(fs.readFileSync(emitted).subarray(0,2).equals(Buffer.from([255,216])),`${id}: photography is not JPEG`);
  check(nonempty(photo.alt)&&nonempty(photo.credit)&&Number.isInteger(photo.source?.page),`${id}: missing photography description or provenance`);
  check(noindexHeader(rules,photo.url),`${id}: photography asset lacks noindex header`);
 }
}else{
 check(htmlFiles.length===17,`Public build must retain 17 HTML files / 15 institutional routes, editorial privacy and 404; found ${htmlFiles.length}`);
 for(const slug of slugs){
  check(!fs.existsSync(routeFile(slug)),`${slug}: draft HTML exists in public build`);
  check(!linked(landing,routeUrl(slug)),`${slug}: public landing exposes draft link`);
 }
 check(draftArtifacts.length===0,`Public build contains ${draftArtifacts.length} editorial source/image/social artifacts`);
 // Ignore phrases already present in the existing public source. Reusing a
 // general educational sentence is not evidence that a private dossier leaked.
 const publicSource=walk(path.join(project,'src')).filter(file=>/\.(?:astro|ts|mjs|json)$/.test(file)&&!file.startsWith(dataDirectory+path.sep)&&file!==path.join(project,'src','data','editorial.ts')).map(read).map(normalized).join(' ');
 const indicators=[];
 for(const article of articles){
  indicators.push({slug:article.slug,kind:'title',text:normalized(article.title)});
  indicators.push({slug:article.slug,kind:'source filename',text:path.basename(article.source.file)});
  for(const section of article.sections)for(const block of section.blocks)for(const text of blockContent(block)){
   const candidate=normalized(text);
   if(candidate.length>=100&&!publicSource.includes(candidate))indicators.push({slug:article.slug,kind:'dossier text',text:candidate.slice(0,200)});
  }
 }
 const textFiles=files.filter(file=>/\.(?:html|[cm]?js|json|map|txt|xml|css)$/i.test(file));
 for(const file of textFiles){
  const raw=read(file),content=normalized(raw);
  for(const indicator of indicators)if(content.includes(indicator.text)){
   failures.push(`${relative(file)}: unapproved ${indicator.kind} leaked from ${indicator.slug}`);break;
  }
  for(const slug of slugs)check(!raw.includes(routeUrl(slug))&&!raw.includes(sourceUrl(slug))&&!raw.includes(imageUrl(slug))&&!raw.includes(socialUrl(slug)),`${relative(file)}: draft URL leaked for ${slug}`);
 }
 summaries.push({scannedTextFiles:textFiles.length,privateTextIndicators:indicators.length,privateArchiveRequired:false});
}

console.log(JSON.stringify({mode,build,htmlFiles:htmlFiles.length,sourceArticles:articles.length,draftArtifacts:draftArtifacts.length,checks:summaries,warnings,failures},null,2));
if(failures.length)process.exitCode=1;
