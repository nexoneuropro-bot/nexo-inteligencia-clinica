import {screeningInstruments} from '../data/momento-instruments';

type Data=Record<string,unknown>;
type Api=(path:string,body?:unknown)=>Promise<Data>;
const object=(v:unknown):Data=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Data:{};
const make=<K extends keyof HTMLElementTagNameMap>(tag:K,cls?:string):HTMLElementTagNameMap[K]=>{
 const el=document.createElement(tag);if(cls)el.className=cls;return el;
};
const text=(parent:HTMLElement,value:string,cls?:string)=>{const el=make('p',cls);el.textContent=value;parent.append(el);return el;};

export function appendProfessionalInstrumentAssignments(panel:HTMLElement,record:Data,sourceSubmissionId:string,api:Api){
 const section=make('section','mc-guide-section mc-followup-section');
 const heading=make('h3');heading.textContent='NEXO · Instrumentos complementares no acompanhamento';section.append(heading);
 text(section,'O profissional seleciona uma avaliação que já está disponível no NEXO. O instrumento é oferecido por código individual no mesmo site. Não há envio automático, interpretação diagnóstica ou liberação de packs pendentes.','mc-report-quiet');
 const initialPhq=Array.isArray(record.phq9)?record.phq9 as unknown[]:[];
 const safetyReviewNeeded=initialPhq[8]===undefined||initialPhq[8]===null||
   typeof initialPhq[8]!=='number'||initialPhq[8]>0;
 if(safetyReviewNeeded){
  text(section,'Revisão prioritária de segurança: o item 9 do PHQ-9 foi assinalado ou não foi respondido. O encaminhamento não substitui a entrevista e a proteção necessária.','mc-guide-catalog-alert');
 }
 const form=make('div','mc-followup-controls');
 const instrumentLabel=make('label');instrumentLabel.textContent='Instrumento a considerar';
 const instrumentSelect=make('select');
 for(const instrument of screeningInstruments){
  const option=make('option');option.value=instrument.id;option.textContent=instrument.name+' · '+instrument.items.length+' perguntas';
  instrumentSelect.append(option);
 }
 instrumentLabel.append(instrumentSelect);form.append(instrumentLabel);
 const modeLabel=make('label');modeLabel.textContent='Modalidade';
 const mode=make('select');
 for(const choice of [{id:'between-sessions',name:'Atividade entre encontros'},{id:'session',name:'Durante a sessão'}]){
  const option=make('option');option.value=choice.id;option.textContent=choice.name;mode.append(option);
 }
 modeLabel.append(mode);form.append(modeLabel);
 const validityLabel=make('label');validityLabel.textContent='Prazo para o convite';
 const validity=make('select');for(const days of [1,3,7,14]){
  const opt=make('option');opt.value=String(days);opt.textContent=days===1?'1 dia':days+' dias';validity.append(opt);
 }
 validityLabel.append(validity);form.append(validityLabel);
 const reviewLabel=make('label','mc-guide-check'),review=make('input');
 review.type='checkbox';reviewLabel.append(review);
 const rtext=make('span');rtext.textContent='Revisei a pertinência clínica, a versão e as condições de aplicação deste instrumento.';reviewLabel.append(rtext);
 form.append(reviewLabel);
 const safetyLabel=make('label','mc-guide-check'),safety=make('input');
 safety.type='checkbox';safetyLabel.append(safety);
 const stext=make('span');stext.textContent='Realizei a avaliação de segurança necessária e decidi que este encaminhamento é apropriado agora.';safetyLabel.append(stext);
 safetyLabel.hidden=!safetyReviewNeeded;form.append(safetyLabel);
 const create=make('button','mc-button mc-primary');create.type='button';create.textContent='Gerar convite individual NEXO';form.append(create);
 const status=text(form,'','mc-report-quiet');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const inviteBox=make('div','mc-followup-invite');inviteBox.hidden=true;
 const issuedCode=make('code');const issuedLink=make('a');issuedLink.rel='noopener noreferrer';issuedLink.target='_blank';
 issuedLink.textContent='Abrir percurso complementar no NEXO';
 const copyCode=make('button','mc-button');copyCode.type='button';copyCode.textContent='Copiar código';
 const copyLink=make('button','mc-button');copyLink.type='button';copyLink.textContent='Copiar endereço';
 inviteBox.append(issuedCode,issuedLink,copyCode,copyLink);form.append(inviteBox);
 const history=make('section');const historyTitle=make('h4');historyTitle.textContent='Acompanhamento dos encaminhamentos';history.append(historyTitle);
 section.append(form,history);panel.append(section);
 let code='',url='';
 const copy=async(value:string)=>{try{await navigator.clipboard.writeText(value);status.textContent='Copiado. Compartilhe pelo canal reservado que vocês combinaram.';}
  catch{status.textContent='O navegador não permitiu copiar. Selecione o texto mostrado.';}};
 copyCode.addEventListener('click',()=>void copy(code));
 copyLink.addEventListener('click',()=>void copy(url));
 create.addEventListener('click',async()=>{
  if(!review.checked||(safetyReviewNeeded&&!safety.checked)){
   status.textContent='Confirme a revisão profissional e a avaliação de segurança, quando necessária, antes de oferecer um instrumento.';return;
  }
  create.disabled=true;status.textContent='Conferindo o encaminhamento no servidor protegido.';
  inviteBox.hidden=true;code='';url='';
  try{
   const result=await api('instruments/assign',{submissionId:sourceSubmissionId,instrumentId:instrumentSelect.value,
    expiresInDays:Number(validity.value),administrationMode:mode.value,clinicianReviewed:true,
    safetyReviewed:safetyReviewNeeded?safety.checked:false});
   if(typeof result.code!=='string'||typeof result.url!=='string')throw new Error('sem confirmação');
   const parsed=new URL(result.url,window.location.origin);
   if(parsed.origin!==window.location.origin||parsed.pathname!=='/conhecendo-meu-momento/instrumento/'||parsed.search||parsed.hash)
    throw new Error('endereço não verificado');
   code=result.code;url=parsed.href;
   issuedCode.textContent=code;issuedLink.href=url;inviteBox.hidden=false;
   status.textContent='Convite criado e registrado. Compartilhe o código separadamente do endereço. O envio ao paciente não é automático.';
   await loadHistory();
  }catch{status.textContent='Não foi possível gerar o convite. A operação não foi confirmada. Verifique se o banco clínico recebeu a migração de instrumentos.';}
  finally{create.disabled=false;}
 });
 async function loadHistory(){
  history.querySelectorAll('.mc-followup-item').forEach(item=>item.remove());
  try{
   const response=await api('instruments');
   const assignments=Array.isArray(response.assignments)?response.assignments.map(object).filter(x=>x.sourceSubmissionId===sourceSubmissionId):[];
   if(!assignments.length){const p=text(history,'Nenhum instrumento adicional encaminhado neste acompanhamento.','mc-followup-item mc-report-quiet');return;}
   for(const item of assignments){
    const card=make('article','mc-followup-item mc-guide-tool');
    const inst=screeningInstruments.find(x=>x.id===item.instrumentId);
    text(card,(inst?.name||'Instrumento')+' · '+(item.submitted?'Recebido':item.revoked?'Revogado':item.redeemed?'Convite utilizado, aguardando conclusão':'Aguardando acesso'),'mc-report-mini');
    if(item.submitted===true&&typeof item.id==='string'){
     const open=make('button','mc-button');open.type='button';open.textContent='Abrir resultado complementar';
     const resultPanel=make('div');card.append(open,resultPanel);
     open.addEventListener('click',async()=>{
      open.disabled=true;resultPanel.replaceChildren();
      try{
       const response=await api('instruments/'+encodeURIComponent(String(item.id))+'/result');
       const result=object(response.record),score=object(result.result);
       text(resultPanel,'Resultado técnico: '+(score.complete===true?String(score.score):'incompleto')+'. Faixa sintomática: '+(score.band||'não calculada')+'. Não equivale a diagnóstico.');
       if(result.instrumentId==='phq9'&&score.item9AlertFlag!==false)
        text(resultPanel,'Item 9 positivo ou ausente: esclarecer segurança diretamente. A plataforma não oferece monitoramento de emergência.','mc-care-note');
       const values=Array.isArray(result.answers)?result.answers:[];
       const questions=inst?.items||[];
       const list=make('ol');
       questions.forEach((q,i)=>{const li=make('li');li.textContent=q+' · '+(inst?.options.find(opt=>opt.value===values[i])?.label||'Sem resposta');list.append(li);});
       resultPanel.append(list);
       text(resultPanel,'Impacto funcional (fora do escore): '+(inst?.impactOptions.find(o=>o.value===result.impact)?.label||'Não informado')+'.','mc-report-quiet');
       text(resultPanel,'Versão aplicada: '+String(result.instrumentVersion)+'. Regra: '+String(result.scoringRulesVersion)+'.','mc-report-quiet');
       const originalScore=object(object(record.results)[String(result.instrumentId)]).score;
       if(typeof originalScore==='number'&&typeof score.score==='number')
        text(resultPanel,'Comparação descritiva entre os dois momentos: '+originalScore+' → '+score.score+'. Interpretar com intervalo, contexto e repercussão; não inferir causalidade.','mc-report-quiet');
      }catch{text(resultPanel,'Não foi possível confirmar a leitura deste resultado.');}
      finally{open.disabled=false;}
     });
    }else if(item.submitted!==true&&item.revoked!==true&&typeof item.id==='string'){
     const revoke=make('button','mc-button');revoke.type='button';revoke.textContent='Revogar convite não respondido';
     revoke.addEventListener('click',async()=>{
      if(!window.confirm('Deseja revogar este convite? Esta ação invalida o acesso ainda não respondido.'))return;
      revoke.disabled=true;
      try{await api('instruments/'+encodeURIComponent(String(item.id))+'/revoke',{});await loadHistory();}
      catch{revoke.disabled=false;status.textContent='Não foi possível confirmar a revogação.';}
     });
     card.append(revoke);
    }
    history.append(card);
   }
  }catch{text(history,'O histórico de instrumentos não está disponível neste momento.','mc-followup-item mc-report-quiet');}
 }
 void loadHistory();
}
