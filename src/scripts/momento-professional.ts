import {startAuthentication,startRegistration} from '@simplewebauthn/browser';
import {screeningInstruments} from '../data/momento-instruments';
import {buildProfessionalCues} from '../lib/momento-professional-cues';
import {appendIntegratedProfessionalReport} from './momento-report-view';
import {mountInstrumentLibrary} from './momento-instrument-library';
import {clarificationQuestions} from '../data/momento-clarifications';
import {profileFields,questions} from '../data/momento-demo';

type Data=Record<string,unknown>;
const object=(value:unknown):Data=>value&&typeof value==='object'&&!Array.isArray(value)?value as Data:{};
const records=(value:unknown):Data[]=>Array.isArray(value)?value.map(object):[];
const textValue=(value:unknown)=>typeof value==='string'||typeof value==='number'?String(value):'Não informado';
let disposeProfessional:(()=>void)|undefined;

function startProfessional(){
 const candidate=document.querySelector<HTMLElement>('[data-momento-professional]');if(!candidate)return;const root:HTMLElement=candidate;
 const life=new AbortController();const{signal}=life;let csrf='',currentId='',currentRecord:Data|undefined,currentMetadata:Data|undefined,inviteCode='',inviteUrl='',busy=false,authenticated=false;
 const element=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>(`#${id}`)!;
 const updateInstrumentLibrary=mountInstrumentLibrary(root,signal);
 const error=element('pro-error'),status=element('pro-status');
 function setPanel(panel:'access'|'enrollment'|'workspace'){root.querySelectorAll<HTMLElement>('[data-pro-panel]').forEach(item=>{item.hidden=item.dataset.proPanel!==panel;});}
 function notice(text:string){status.textContent=text;}
 function fail(text:string){error.textContent=text;}
 function clearRecord(){updateInstrumentLibrary();currentRecord=undefined;currentMetadata=undefined;currentId='';element('pro-record').replaceChildren();element('pro-record-section').hidden=true;element<HTMLInputElement>('pro-delete-confirm').checked=false;}
 function hideInvite(){inviteCode='';inviteUrl='';element('pro-invite-code').textContent='';element('pro-invite-expiry').textContent='';element('pro-created-invite').hidden=true;}
 function clearWorkspace(){csrf='';authenticated=false;clearRecord();hideInvite();element('pro-invites').replaceChildren();element('pro-submissions').replaceChildren();element('pro-identity').textContent='';element<HTMLInputElement>('pro-enrollment-code').value='';setPanel('access');}
 function humanDate(value:unknown){if(typeof value!=='string')return'Não informado';const date=new Date(value);return Number.isFinite(date.getTime())?date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Não informado';}
 async function api(path:string,body?:unknown){
  const response=await fetch(`/api/momento/${path}`,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(csrf?{'X-Nexo-CSRF':csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),credentials:'same-origin',cache:'no-store',referrerPolicy:'no-referrer',signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){if(response.status===401&&authenticated){clearWorkspace();throw new Error('expired');}throw new Error(response.status===429?'rate_limited':response.status===401||response.status===403?'access_denied':'unavailable');}
  return object(data);
 }
 function message(err:unknown){return err instanceof Error&&err.message==='expired'?'Seu acesso expirou. Entre novamente com sua chave de acesso.':err instanceof Error&&err.message==='rate_limited'?'Houve várias tentativas em pouco tempo. Aguarde antes de tentar novamente.':err instanceof Error&&err.message==='access_denied'?'Não foi possível verificar este acesso. Confira seu código ou tente a chave de acesso novamente.':'Não foi possível concluir a operação. Nenhuma confirmação foi emitida. Tente novamente.';}
 function paragraph(parent:HTMLElement,text:string){const p=document.createElement('p');p.textContent=text;parent.append(p);return p;}
 function heading(parent:HTMLElement,text:string){const h=document.createElement('h3');h.textContent=text;parent.append(h);}
 function pair(list:HTMLElement,label:string,value:string){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;list.append(dt,dd);}
 function listContainer(id:string,items:Data[],empty:string,render:(item:Data,article:HTMLElement)=>void){const list=element(id);list.replaceChildren();if(!items.length){paragraph(list,empty);return;}for(const item of items){const article=document.createElement('article');article.className='mc-pro-item';render(item,article);list.append(article);}}
 async function loadLists(){
  const [invites,submissions]=await Promise.all([api('invites'),api('submissions')]);
  listContainer('pro-invites',records(invites.invites),'Nenhum convite disponível nesta lista.',(item,article)=>{paragraph(article,`Convite ${textValue(item.id)}`);paragraph(article,`Criado em ${humanDate(item.createdAt)} · Válido até ${humanDate(item.expiresAt)}`);paragraph(article,item.submitted===true?'Respostas recebidas.':item.redeemedAt?'Convite utilizado; preenchimento ainda sem recebimento confirmado.':'Aguardando utilização.');if(item.submitted!==true&&typeof item.id==='string'){const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span'),button=document.createElement('button');input.type='checkbox';input.dataset.proRevokeConfirm=item.id;span.textContent='Confirmo que desejo revogar este convite e encerrar seu acesso.';label.className='mc-confirm';label.append(input,span);button.type='button';button.className='mc-button';button.dataset.proRevoke=item.id;button.textContent='Revogar convite confirmado';button.disabled=true;article.append(label,button);}});
  listContainer('pro-submissions',records(submissions.submissions),'Nenhuma resposta disponível nesta lista.',(item,article)=>{paragraph(article,`Recebimento ${textValue(item.id)}`);paragraph(article,`Recebido em ${humanDate(item.createdAt)} · Acesso ativo até ${humanDate(item.expiresAt)}`);paragraph(article,item.feedbackCompletedAt?`Devolutiva registrada em ${humanDate(item.feedbackCompletedAt)}.`:'Devolutiva ainda sem registro de realização.');paragraph(article,item.notificationSent===true?'Aviso neutro de recebimento enviado.':'Aviso de e-mail sem confirmação; o registro permanece disponível aqui.');const button=document.createElement('button');button.type='button';button.className='mc-button';button.dataset.proOpen=typeof item.id==='string'?item.id:'';button.textContent='Abrir registro protegido';button.disabled=!button.dataset.proOpen;article.append(button);});
 }
 async function loadWorkspace(){const me=await api('me');if(typeof me.csrf!=='string')throw new Error('access_denied');csrf=me.csrf;authenticated=true;element('pro-identity').textContent=`Acesso autenticado: ${textValue(me.email)}.`;setPanel('workspace');await loadLists();}
 async function availability(){
  const view=element('pro-availability'),login=root.querySelector<HTMLButtonElement>('[data-pro-action="login"]')!;login.disabled=true;view.textContent='Conferindo a disponibilidade.';
  const config=await api('status');
  if(config.enabled!==true){view.textContent='A infraestrutura clínica ainda não está habilitada. O acesso a respostas reais permanece fechado.';setPanel('access');return;}
  if(config.needsEnrollment===true){setPanel('enrollment');view.textContent='Primeiro acesso: cadastre a chave de acesso do responsável.';return;}
  setPanel('access');login.disabled=false;view.textContent='Acesso disponível para o responsável cadastrado.';
  try{await loadWorkspace();}catch(err){if(err instanceof Error&&['access_denied','expired'].includes(err.message))return;throw err;}
 }
 async function enrollmentRequest(){const data=await api('enrollment/request',{});element<HTMLInputElement>('pro-enrollment-code').value='';notice(data.sent===true?'O serviço confirmou o envio do código ao endereço administrativo. Confira sua caixa de entrada.':'Solicitação processada, mas o envio do código não foi confirmado. Tente novamente se nenhuma mensagem chegar.');}
 async function enroll(){
  const input=element<HTMLInputElement>('pro-enrollment-code'),code=input.value.trim();if(!/^\d{8}$/.test(code)){fail('Informe o código de oito dígitos recebido no e-mail administrativo.');input.focus();return;}
  const data=await api('enrollment/options',{code});const options=data.optionsJSON??data.options;
  if(!options||typeof data.challengeId!=='string')throw new Error('unavailable');
  notice('Confirme o cadastro da chave no seu dispositivo.');
  const response=await startRegistration({optionsJSON:options as Parameters<typeof startRegistration>[0]['optionsJSON']});
  const verified=await api('enrollment/verify',{challengeId:data.challengeId,response});
  if(verified.verified!==true)throw new Error('access_denied');input.value='';if(typeof verified.csrf==='string')csrf=verified.csrf;
  await loadWorkspace();notice('Chave cadastrada e acesso verificado.');
 }
 async function login(){
  const data=await api('login/options',{}),options=data.optionsJSON??data.options;
  if(!options||typeof data.challengeId!=='string')throw new Error('unavailable');
  notice('Confirme sua chave de acesso no dispositivo.');
  const response=await startAuthentication({optionsJSON:options as Parameters<typeof startAuthentication>[0]['optionsJSON']});
  const verified=await api('login/verify',{challengeId:data.challengeId,response});if(verified.verified!==true)throw new Error('access_denied');if(typeof verified.csrf==='string')csrf=verified.csrf;
  await loadWorkspace();notice('Acesso verificado.');
 }
 async function createInvite(){
  const days=Number(element<HTMLSelectElement>('pro-expiry').value);if(![1,3,7,14].includes(days))return;
  hideInvite();const data=await api('invites',{expiresInDays:days});
  if(typeof data.code!=='string'||typeof data.url!=='string')throw new Error('unavailable');
  const url=new URL(data.url,window.location.origin);if(url.origin!==window.location.origin||url.pathname!=='/conhecendo-meu-momento/responder/'||url.search||url.hash)throw new Error('unavailable');
  inviteCode=data.code;inviteUrl=url.href;element('pro-invite-code').textContent=inviteCode;element<HTMLAnchorElement>('pro-invite-url').href=inviteUrl;element('pro-invite-url').textContent=inviteUrl;element('pro-invite-expiry').textContent=`Válido até ${humanDate(data.expiresAt)}. O código não será exibido novamente nesta lista.`;element('pro-created-invite').hidden=false;await loadLists();notice('Convite criado. Compartilhe o endereço e o código pessoal separadamente pelo canal combinado.');
 }
 function renderRecord(record:Data,metadata:Data){
  const panel=element('pro-record');panel.replaceChildren();
  const details=document.createElement('dl');pair(details,'Recebimento',humanDate(metadata.createdAt??record.createdAt));pair(details,'Acesso ativo até',humanDate(metadata.expiresAt??record.expiresAt));pair(details,'Versão de consentimento',textValue(object(record.consent).version));pair(details,'Regra de pontuação',textValue(record.scoringRulesVersion));panel.append(details);
  const completion=object(record.completion);
   heading(panel,'Situação da participação');
   if(completion.kind==='partial'){
     paragraph(panel,'A pessoa escolheu compartilhar somente o que havia respondido até o momento da interrupção. Nenhum motivo foi atribuído automaticamente.');
     const stageLabel=String(completion.lastShownId||'');
     const known=[...questions.map(q=>({id:q.id,label:q.title})),...screeningInstruments.flatMap(q=>[...q.items.map((label,index)=>({id:`${q.id}-${index}`,label})),{id:`${q.id}-impact`,label:q.impactQuestion}]),...clarificationQuestions.map(q=>({id:`clarification-${q.id}`,label:q.title}))].find(q=>q.id===stageLabel);
     paragraph(panel,'Pergunta que estava no percurso no momento da escolha: '+(known?.label??'Não informada')+'. Isso não permite determinar a razão da interrupção.');
   }else paragraph(panel,'Respostas enviadas após a etapa final do percurso. A conclusão do formulário não indica, por si só, ausência de dificuldades.');
   heading(panel,'Contexto informado');const profile=object(record.profile),list=document.createElement('dl');pair(list,'Nome ou pseudônimo',typeof profile.nickname==='string'&&profile.nickname?profile.nickname:'Não informado');
  for(const field of profileFields.filter(field=>field.id!=='nickname'))pair(list,field.label,field.options.find(option=>option.id===profile[field.id])?.label||'Não informado');panel.append(list);
  heading(panel,'Assuntos trazidos para a conversa');const authorAnswers=object(record.authorAnswers),authorList=document.createElement('dl');for(const question of questions)pair(authorList,question.title,question.options.find(option=>option.id===authorAnswers[question.id])?.label||'Sem resposta');panel.append(authorList);
  const results=object(record.results??record.screeningResults),impact=object(record.impact);
  for(const instrument of screeningInstruments){
   heading(panel,instrument.name);const result=object(results[instrument.id]),values=Array.isArray(record[instrument.id])?record[instrument.id] as unknown[]:[];
   if(result.complete===true)paragraph(panel,`Total técnico: ${textValue(result.score)}. Faixa de intensidade de sintomas: ${textValue(result.band)}. Resultado de rastreio, sem conclusão diagnóstica automática.`);else paragraph(panel,'Instrumento incompleto. Total e faixa não calculados; respostas ausentes permanecem sem resposta.');
   if(instrument.id==='phq9'&&result.item9AlertFlag===true){const p=paragraph(panel,'A resposta ao item 9 exige revisão humana e contato conforme o fluxo de segurança aprovado, independentemente do total. Não equivale, isoladamente, à conclusão de risco iminente.');p.className='mc-care-note';}
   else if(instrument.id==='phq9'&&result.item9AlertFlag==null)paragraph(panel,'Item 9 sem resposta. A ausência de resposta não estabelece segurança clínica.');
   else if(instrument.id==='phq9')paragraph(panel,'Item 9 respondido como zero. Esse resultado não exclui outros sinais de risco que precisem de investigação.');
   const questionList=document.createElement('ol');instrument.items.forEach((question,index)=>{const item=document.createElement('li');item.textContent=question+' — '+(instrument.options.find(option=>option.value===values[index])?.label??'Sem resposta');questionList.append(item);});panel.append(questionList);
   paragraph(panel,'Impacto funcional: '+(instrument.impactOptions.find(option=>option.value===impact[instrument.id])?.label??'Sem resposta')+'. Não integra o total do instrumento.');
   const source=document.createElement('a');source.href=instrument.sourceUrl;source.textContent='Consultar a fonte da versão utilizada ↗';source.target='_blank';source.rel='noopener noreferrer';source.className='mc-link';panel.append(source);
  }
  heading(panel,'Complementos opcionais, separados das escalas');
   const clarifications=object(record.clarifications);
   for(const question of clarificationQuestions){
     const answer=question.options.find(option=>option.id===clarifications[question.id]);
     const phq=Array.isArray(record.phq9)?record.phq9 as unknown[]:[];
     if(typeof phq[question.triggerPhqIndex]==='number'&&Number(phq[question.triggerPhqIndex])>0){
       paragraph(panel,question.title+' '+(answer?.label??'Sem resposta.'));
     }else paragraph(panel,question.title+' Não se aplicou com base nas respostas disponíveis.');
   }
   heading(panel,'Pistas descritivas para a entrevista · revisão profissional');
  paragraph(panel,'As pistas abaixo têm origem indicada e servem apenas para preparar perguntas. Não são diagnósticos, classificações de risco ou indicações automáticas de testes e tratamentos. O DSM-5-TR pode orientar a investigação humana.');
  for(const cue of buildProfessionalCues(record)){
    const section=document.createElement('section');section.className='mc-pro-cue';
    heading(section,cue.titulo);
    const axis=paragraph(section,'Eixo: '+cue.eixo+'.');axis.className='mc-caption';
    if(cue.evidencias.length){
      const evidence=document.createElement('ul');
      for(const fact of cue.evidencias){const li=document.createElement('li');li.textContent=fact;evidence.append(li);}
      section.append(evidence);
    } else paragraph(section,'Sem indicadores pontuados suficientes para esta seção.');
    paragraph(section,'Investigar: '+cue.investigar);
    const limit=paragraph(section,'Limite interpretativo: '+cue.limite);limit.className='mc-caption';
    panel.append(section);
  }
  heading(panel,'Perguntas para explorar no encontro');paragraph(panel,'Considere as condições biológicas, psicológicas, sociais e os efeitos no cotidiano. Distinga o que a pessoa declarou das hipóteses que ainda dependem de entrevista. As alternativas escolhidas, isoladamente, não estabelecem função comportamental, diagnóstico ou encaminhamento.');
  const annex=document.createElement('details');annex.className='mc-report-annex';const summary=document.createElement('summary');summary.textContent='Anexo técnico · respostas completas e rastreios originais';annex.append(summary);
  while(panel.firstChild)annex.append(panel.firstChild);
  panel.append(annex);
  appendIntegratedProfessionalReport(panel,record);
 }
 async function openRecord(id:string){
  if(!/^[a-zA-Z0-9_-]{8,100}$/.test(id))throw new Error('unavailable');clearRecord();const data=await api(`submissions/${encodeURIComponent(id)}`),record=object(data.record),metadata=object(data.metadata);if(!Object.keys(record).length)throw new Error('unavailable');currentId=id;currentRecord=record;currentMetadata=metadata;renderRecord(record,metadata);updateInstrumentLibrary(record);element('pro-record-id').textContent=`Identificador ${id}. Acesso ao conteúdo registrado para auditoria.`;element('pro-record-section').hidden=false;const h=element('pro-record-title');h.focus({preventScroll:true});h.scrollIntoView({block:'start',behavior:'instant'});
 }
 async function copy(text:string,success:string){if(!text)return;try{await navigator.clipboard.writeText(text);notice(success);}catch{fail('Não foi possível copiar. Você pode selecionar o texto exibido.');}}
 async function run(action:()=>Promise<void>){if(busy)return;busy=true;error.textContent='';root.setAttribute('aria-busy','true');try{await action();}catch(err){if(err instanceof Error&&['NotAllowedError','AbortError'].includes(err.name))fail('A confirmação no dispositivo foi cancelada ou não foi concluída. Você pode tentar novamente.');else fail(message(err));}finally{busy=false;root.removeAttribute('aria-busy');}}
 root.addEventListener('click',async event=>{
  const target=event.target;if(busy||!(target instanceof Element))return;
  const revoke=target.closest<HTMLButtonElement>('button[data-pro-revoke]');if(revoke?.dataset.proRevoke&&!revoke.disabled){await run(async()=>{const id=revoke.dataset.proRevoke!;if(!/^[a-zA-Z0-9_-]{8,100}$/.test(id))throw new Error('unavailable');const data=await api(`invites/${encodeURIComponent(id)}/revoke`,{});if(data.revoked!==true)throw new Error('unavailable');notice('Revogação do convite confirmada pelo servidor.');await loadLists();});return;}
  const open=target.closest<HTMLButtonElement>('button[data-pro-open]');if(open?.dataset.proOpen){await run(()=>openRecord(open.dataset.proOpen!));return;}
  const button=target.closest<HTMLButtonElement>('button[data-pro-action]');if(!button||button.disabled)return;
  switch(button.dataset.proAction){case'refresh':await run(availability);break;case'request-code':await run(enrollmentRequest);break;case'enroll':await run(enroll);break;case'login':await run(login);break;case'create-invite':await run(createInvite);break;case'reload-workspace':await run(loadLists);break;case'hide-invite':hideInvite();notice('Código ocultado desta tela.');break;case'copy-link':await copy(inviteUrl,'Endereço copiado.');break;case'copy-code':await copy(inviteCode,'Código pessoal copiado. Compartilhe somente com a pessoa convidada.');break;case'close-record':clearRecord();notice('Conteúdo do registro fechado nesta tela.');break;case'logout':await run(async()=>{await api('logout',{});clearWorkspace();notice('Acesso encerrado.');await availability();});break;case'print-report':if(currentId&&currentRecord){notice('O navegador abrirá a impressão. Se desejar, selecione Salvar como PDF. Proteja o documento por conter dados sensíveis.');window.print();}break;case'export-record':if(currentId&&currentRecord){const url=URL.createObjectURL(new Blob([JSON.stringify({record:currentRecord,metadata:currentMetadata},null,2)],{type:'application/json;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`nexo-registro-${currentId}.json`;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Arquivo criado sob seu controle. Proteja o conteúdo e respeite a política de retenção.');}break;case'feedback-completed':if(currentId)await run(async()=>{await api(`submissions/${encodeURIComponent(currentId)}/feedback`,{completed:true});notice('Realização da devolutiva registrada.');await loadLists();});break;case'delete-record':if(currentId){if(!element<HTMLInputElement>('pro-delete-confirm').checked){fail('Confirme a exclusão deste registro antes de continuar.');element('pro-delete-confirm').focus();return;}await run(async()=>{const data=await api(`submissions/${encodeURIComponent(currentId)}/delete`,{});if(data.deleted!==true&&data.success!==true)throw new Error('unavailable');clearRecord();notice('Exclusão do registro ativo confirmada pelo servidor.');await loadLists();});}break;}
 },{signal});
 root.addEventListener('change',event=>{const input=event.target;if(input instanceof HTMLInputElement&&input.dataset.proRevokeConfirm){const button=input.closest('article')?.querySelector<HTMLButtonElement>('[data-pro-revoke]');if(button)button.disabled=!input.checked;}},{signal});
 void run(availability);
 return()=>{clearWorkspace();life.abort();};
}
function bootProfessional(){disposeProfessional?.();disposeProfessional=startProfessional();}
bootProfessional();document.addEventListener('astro:page-load',bootProfessional);document.addEventListener('astro:before-swap',()=>{disposeProfessional?.();disposeProfessional=undefined;});window.addEventListener('pagehide',()=>{disposeProfessional?.();disposeProfessional=undefined;});window.addEventListener('pageshow',event=>{if(event.persisted)bootProfessional();});
