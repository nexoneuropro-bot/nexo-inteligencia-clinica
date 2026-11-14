import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('contatos de emergência são textos clicáveis e há indicação de não monitoramento',()=>{
 const html=read('src/components/MomentoSupport.astro');
 for(const number of ['192','188','190','193'])assert.match(html,new RegExp('href="tel:'+number+'"'));
 assert.match(html,/não é monitorado continuamente/);
 assert.match(html,/supportPhoto/);
 const layout=read('src/layouts/MomentoLayout.astro');
 assert.match(layout,/<MomentoSupport\/>/);
});
test('arquivo de respostas usa relatório existente e recalcula instrumentos',()=>{
 const ui=read('src/components/MomentoProfessional.astro');
 const action=read('src/scripts/momento-professional.ts');
 for(const marker of ['pro-import-file','pro-import-report','pro-import-preview'])assert.ok(ui.includes(marker));
 for(const marker of ["scoreScreening('phq9'","scoreScreening('gad7'","appendIntegratedProfessionalReport(destination,normalized)","file.size>512*1024","if(!authenticated)"])assert.ok(action.includes(marker),marker);
 assert.ok(action.includes('clearImported();csrf='));
});
test('NR-1 é exploratório, local, sem endpoint de coleta',()=>{
 const bank=read('src/data/nr1-question-bank.ts');
 const page=read('src/pages/nr1-questionario.astro');
 const ids=[...bank.matchAll(/id:'NEXO-NR1-\d{2}'/g)].map(([v])=>v);
 assert.equal(ids.length,16);
 assert.equal(new Set(ids).size,16);
 assert.match(page,/new FormData\(form\)/);
 assert.match(page,/não é uma escala psicométrica validada/);
 assert.doesNotMatch(page,/fetch\(|sendBeacon\(|localStorage|sessionStorage/);
});
