/**
 * NEXO · biblioteca de candidatos a instrumentos.
 *
 * Importa METADADOS SOMENTE de um catálogo obtido legitimamente pelo
 * profissional. Nunca lê respostas ou arquivos de pacientes; não acessa
 * o painel externo nem envia dados. A importação NÃO valida SATEPSI,
 * licenças, direitos ou modalidade de aplicação.
 *
 * A saída é uma lista de possibilidades PARA REVISÃO HUMANA, nunca
 * decisão diagnóstica nem indicação automática de teste.
 */
export const CATALOG_SCHEMA='nexo-catalogo-metadados-v1';
export const MAX_CATALOG_BYTES=96000;
export type CatalogDomain='humor'|'ansiedade'|'sono'|'funcionamento'|'autocritica'|'atencao'|'vinculos'|'alimentacao'|'apoio-social';
export type CatalogModality='presencial'|'remoto'|'ambos'|'nao-informado';
export type Candidate=Readonly<{
 id:string;name:string;domains:readonly CatalogDomain[];
 modality:CatalogModality;version:string;source:string;rights:string;
}>;
export type CatalogSuggestion=Readonly<{
 candidate:Candidate;matches:readonly string[];relevance:'investigar'|'sem-indicacao-especifica';
 requiresSafetyReview:boolean;status:'catalogado-nao-validado';
}>;
type Dict=Record<string,unknown>;
const domains:readonly CatalogDomain[]=['humor','ansiedade','sono','funcionamento','autocritica','atencao','vinculos','alimentacao','apoio-social'];
const modalities:readonly CatalogModality[]=['presencial','remoto','ambos','nao-informado'];
const asRecord=(value:unknown):Dict=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Dict:{};
const keysExact=(value:Dict,allowed:readonly string[]):boolean=>Object.keys(value).every(key=>allowed.includes(key));
const safeText=(value:unknown,min:number,max:number):value is string=>typeof value==='string'&&value.trim().length>=min&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value);
const itemResponse=(values:unknown,index:number):number|null=>{
 const v=Array.isArray(values)?values[index]:null;
 return typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=3?v:null;
};
export function readCatalogMetadata(value:unknown):readonly Candidate[]{
 const data=asRecord(value);
 if(data.schema!==CATALOG_SCHEMA||!keysExact(data,['schema','instruments'])||!Array.isArray(data.instruments)||data.instruments.length>70)throw new Error('Catálogo inválido: envie somente metadados conforme o modelo NEXO (até 70 instrumentos).');
 const seen=new Set<string>(),items:Candidate[]=[];
 for(const raw of data.instruments){
  const entry=asRecord(raw);
  if(!keysExact(entry,['id','name','domains','modality','version','source','rights'])||
   !safeText(entry.id,2,50)||!/^[a-z0-9][a-z0-9_-]{1,49}$/.test(entry.id)||
   !safeText(entry.name,3,140)||!Array.isArray(entry.domains)||!entry.domains.length||entry.domains.length>5||
   !entry.domains.every(d=>domains.includes(d as CatalogDomain))||new Set(entry.domains).size!==entry.domains.length||
   !modalities.includes(entry.modality as CatalogModality)||!safeText(entry.version,1,90)||
   !safeText(entry.source,1,240)||!safeText(entry.rights,1,180)||
   seen.has(entry.id)
  )throw new Error('Catálogo inválido: item incompleto, duplicado, com campos extras ou incompatível com o modelo NEXO.');
  seen.add(entry.id);
  items.push(Object.freeze({
   id:entry.id,name:entry.name.trim(),domains:Object.freeze([...entry.domains] as CatalogDomain[]),
   modality:entry.modality as CatalogModality,version:entry.version.trim(),
   source:entry.source.trim(),rights:entry.rights.trim()
  }));
 }
 return Object.freeze(items);
}
export function suggestCatalogCandidates(catalog:readonly Candidate[],input:unknown):readonly CatalogSuggestion[]{
 const record=asRecord(input),phq=record.phq9,gad=record.gad7,impact=asRecord(record.impact),author=asRecord(record.authorAnswers);
 const p=(i:number)=>itemResponse(phq,i),g=(i:number)=>itemResponse(gad,i);
 const safety=(p(8)===null||p(8)!>0);
 const evidence=new Map<CatalogDomain,string[]>();
 const add=(d:CatalogDomain,reason:string)=>evidence.set(d,[...(evidence.get(d)||[]),reason]);
 if([0,1].some(i=>(p(i)??0)>0))add('humor','Alterações de humor/interesse registradas no PHQ-9.');
 if([0,1,2,3].some(i=>(g(i)??0)>0))add('ansiedade','Preocupações ou tensão relatadas no GAD-7.');
 if((p(2)??0)>0)add('sono','Mudança de sono relatada no PHQ-9.');
 if((p(4)??0)>0)add('alimentacao','Mudança de apetite relatada no PHQ-9.');
 if((p(5)??0)>0)add('autocritica','Item de autopercepção endossado; não caracteriza traço de personalidade.');
 if((p(6)??0)>0)add('atencao','Dificuldade de concentração relatada; investigar relação com sono, humor e contexto.');
 if((typeof impact.phq9==='number'&&impact.phq9>=2)||(typeof impact.gad7==='number'&&impact.gad7>=2))add('funcionamento','Interferência importante em atividades ou relações foi declarada.');
 if(typeof author.situacao==='string'&&author.situacao&&author.situacao!=='prefiro-nao-responder')add('vinculos','Existe relato de contexto ou demanda; aprofundar em entrevista antes de selecionar medidas.');
 const ranking=catalog.map(candidate=>{
  const matches=candidate.domains.flatMap(d=>evidence.get(d)||[]);
  return Object.freeze({
   candidate,matches:Object.freeze([...new Set(matches)]),
   relevance:matches.length?'investigar' as const:'sem-indicacao-especifica' as const,
   requiresSafetyReview:safety,status:'catalogado-nao-validado' as const
  });
 });
 return Object.freeze(ranking.sort((a,b)=>Number(b.matches.length>0)-Number(a.matches.length>0)||b.matches.length-a.matches.length||a.candidate.name.localeCompare(b.candidate.name,'pt-BR')));
}
