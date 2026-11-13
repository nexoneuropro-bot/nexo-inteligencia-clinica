import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');

test('contato direto aparece na home e na rota contato, sem captura automática no servidor',()=>{
 const form=read('src/components/NexoContactForm.astro');
 assert.match(read('src/components/ExperienceHome.astro'),/<NexoContactForm\s*\/>/);
 assert.match(read('src/pages/[...slug].astro'),/page\.slug==='contato'&&<NexoContactForm\s*\/>/);
 assert.ok(form.includes('mailto:nexoneuropro@gmail.com'));
 assert.ok(form.includes('https://wa.me/551154444366?text='));
 assert.ok(form.includes("window.open("));
 assert.ok(form.includes('window.location.href='));
 assert.ok(form.includes("form.reportValidity()"));
 assert.ok(!form.includes('fetch('),'nenhuma informação é enviada silenciosamente à API');
});

test('apoio emergencial só é montado nas três experiências de rastreio e oculto fora de suas etapas',()=>{
 const layout=read('src/layouts/MomentoLayout.astro');
 const support=read('src/components/MomentoSupport.astro');
 assert.ok(layout.includes('screeningSupport=false'));
 assert.ok(layout.includes('screeningSupport&&<MomentoSupport/>'));
 assert.ok(support.includes('<aside class="nexo-support" hidden'));
 assert.ok(support.includes("screening.dataset.screeningActive==='true'"));
 for(const p of ['responder','demonstracao','complementar'])
   assert.ok(read('src/pages/conhecendo-meu-momento/'+p+'.astro').includes('screeningSupport'));
 for(const p of ['src/pages/pesquisa/relacionamento-aberto.astro','src/pages/conhecendo-meu-momento/index.astro'])
   assert.ok(!read(p).includes('screeningSupport'));
 assert.ok(read('src/scripts/momento-clinical.ts').includes("['scale','impact','clarification'].includes"));
 assert.ok(read('src/scripts/meu-momento.ts').includes("['scale','impact','clarifier'].includes"));
 assert.ok(read('src/scripts/momento-followup.ts').includes("root.dataset.screeningActive=String(next==='questions')"));
});
