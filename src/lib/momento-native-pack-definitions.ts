/**
 * NEXO · leitura local de packs completos para conferência profissional.
 *
 * NÃO publica formulários e NÃO permite aplicação em pacientes.
 * Nunca envia, guarda ou exporta respostas individuais. O JSON deve conter
 * exclusivamente definições autorizadas de instrumentos, sem dados clínicos.
 * Metadados de cálculo são apenas descritivos até revisão de fidelidade.
 */
export const PACK_SCHEMA='nexo-definicoes-instrumentos-v1';
export const MAX_PACK_BYTES=512*1024;

type Dict=Record<string,unknown>;
export type PackChoice=Readonly<{id:string;label:string;value:number|null}>;
export type PackQuestion=Readonly<{id:string;prompt:string;help:string;choices:readonly PackChoice[]}>;
export type PackDefinition=Readonly<{
 id:string;name:string;version:string;language:string;source:string;rights:string;
 audience:string;mode:'presencial'|'remoto'|'ambos'|'nao-informado';
 instructions:string;referencePeriod:string;scoringNotes:string;
 questions:readonly PackQuestion[];
 status:'somente-revisao-local';
}>;
const plain=(v:unknown):v is Dict=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const exactly=(obj:Dict,keys:readonly string[]):boolean=>Object.keys(obj).every(key=>keys.includes(key));
const printable=(v:unknown,min:number,max:number):v is string=>typeof v==='string'&&v.trim().length>=min&&v.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
const optionalText=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
const identifier=(v:unknown):v is string=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,63}$/.test(v);
const mode=(v:unknown):v is PackDefinition['mode']=>['presencial','remoto','ambos','nao-informado'].includes(String(v));
const invalid=(where:string):never=>{throw new Error('Pack NEXO inválido: '+where+'. Confira o formato e remova informações de participantes.');};
export function readPackDefinitions(value:unknown):readonly PackDefinition[]{
 if(!plain(value)||!exactly(value,['schema','packs'])||value.schema!==PACK_SCHEMA||!Array.isArray(value.packs)||value.packs.length>70)invalid('estrutura ou quantidade de packs');
 const ids=new Set<string>();
 const packs:PackDefinition[]=[];
 const candidatePacks=(value as {packs:unknown[]}).packs;
 for(const raw of candidatePacks){
  if(!plain(raw)||!exactly(raw,['id','name','version','language','source','rights','audience','mode','instructions','referencePeriod','scoringNotes','questions']))invalid('campos inesperados em pack');
  const entry=raw as Dict;
  if(!identifier(entry.id)||ids.has(entry.id)||!printable(entry.name,3,160)||!printable(entry.version,1,110)||!printable(entry.language,2,16)||
     !printable(entry.source,3,280)||!printable(entry.rights,3,240)||!printable(entry.audience,2,150)||!mode(entry.mode)||
     !optionalText(entry.instructions,2400)||!optionalText(entry.referencePeriod,400)||!optionalText(entry.scoringNotes,2500)||
     !Array.isArray(entry.questions)||entry.questions.length<1||entry.questions.length>120)invalid('metadados ou quantidade de perguntas');
  ids.add(entry.id as string);
  const questionIds=new Set<string>();
  const questions:PackQuestion[]=[];
  for(const q of entry.questions as unknown[]){
   if(!plain(q)||!exactly(q,['id','prompt','help','choices']))invalid('campos inesperados em pergunta');
   const question=q as Dict;
   if(!identifier(question.id)||questionIds.has(question.id)||
      !printable(question.prompt,3,1400)||!optionalText(question.help,1100)||!Array.isArray(question.choices)||question.choices.length<2||question.choices.length>12)invalid('perguntas ou alternativas');
   questionIds.add(question.id as string);
   const choiceIds=new Set<string>(),choices:PackChoice[]=[];
   for(const choice of question.choices as unknown[]){
    if(!plain(choice)||!exactly(choice,['id','label','value']))invalid('campos inesperados em alternativa');
    const option=choice as Dict;
    if(!identifier(option.id)||choiceIds.has(option.id)||
       !printable(option.label,1,350)||!(option.value===null||(typeof option.value==='number'&&Number.isInteger(option.value)&&option.value>=-20&&option.value<=100)))invalid('alternativa ou escore');
    choiceIds.add(option.id as string);
    choices.push(Object.freeze({id:option.id as string,label:String(option.label).trim(),value:option.value as number|null}));
   }
   questions.push(Object.freeze({id:question.id as string,prompt:String(question.prompt).trim(),help:String(question.help).trim(),choices:Object.freeze(choices)}));
  }
  packs.push(Object.freeze({
   id:entry.id as string,name:String(entry.name).trim(),version:String(entry.version).trim(),language:String(entry.language).trim(),
   source:String(entry.source).trim(),rights:String(entry.rights).trim(),audience:String(entry.audience).trim(),
   mode:entry.mode as PackDefinition['mode'],instructions:String(entry.instructions).trim(),referencePeriod:String(entry.referencePeriod).trim(),
   scoringNotes:String(entry.scoringNotes).trim(),questions:Object.freeze(questions),
   status:'somente-revisao-local' as const
  }));
 }
 return Object.freeze(packs);
}
export function packReviewSummary(packs:readonly PackDefinition[]){
 // Deliberately exclude questions, item text, identifiers, answers and patient data.
 return Object.freeze(packs.map(x=>Object.freeze({
  id:x.id,name:x.name,version:x.version,language:x.language,questionCount:x.questions.length,
  source:x.source,rights:x.rights,mode:x.mode,status:x.status
 })));
}
