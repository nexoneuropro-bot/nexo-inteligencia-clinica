export interface EditorialBlock {
  type:'p'|'quote'|'list'|'table'|'exercise'|'note';
  text?:string;
  items?:string[];
  columns?:string[];
  rows?:string[][];
  attribution?:string;
  review?:string;
}
export interface EditorialArticle {
  slug:string;
  title:string;
  seoTitle?:string;
  subtitle:string;
  description:string;
  category:string;
  theme:'relations'|'neuro'|'profession'|'behavior'|'listening'|'care';
  draft:boolean;
  reviewed:boolean;
  approvedForPublication?:boolean;
  publishedAt?:string;
  migratedAt:string;
  researchReviewedAt?:string;
  source:{file:string;totalPages:number;sha256:string};
  credit:{name:string;label:string;sourcePages:number[];authorshipConfirmedBySource:boolean};
  adaptationCredit?:{name:string;label:string;confirmedByHolder:boolean;confirmedAt:string};
  sections:{id:string;title:string;pages:number[];blocks:EditorialBlock[]}[];
  references:{label:string;url?:string;verification:'verified'|'pending'|'replace';note?:string}[];
  reviewNotes:string[];
  reviewResponses?:{note:string;response:string;action:string;status:'resolved'|'editorial-decision'|'pending-source';sources?:{label:string;url:string}[]}[];
}
export const editorialLocalPreview=import.meta.env.PUBLIC_EDITORIAL_PREVIEW==='true';
export const editorialSharedPreview=import.meta.env.PUBLIC_EDITORIAL_SHARED_PREVIEW==='true';
export const editorialPreview=editorialLocalPreview||editorialSharedPreview;
const modules=import.meta.glob<EditorialArticle>('./editorial/*.json',{eager:true,import:'default'});
const order=['relacoes-reciprocidade','neurodivergencia-comunicacao','o-que-faz-um-psicologo','analise-do-comportamento','escuta-atencao-e-relacoes','quem-cuida-de-quem-cuida'];
export const editorialArticles=Object.values(modules).sort((a,b)=>order.indexOf(a.slug)-order.indexOf(b.slug));
// A build flag alone never constitutes approval to publish a source dossier.
export const hasConfirmedEditorialAuthorship=(article:EditorialArticle)=>article.adaptationCredit?.confirmedByHolder===true||article.credit.authorshipConfirmedBySource;
export const editorialAuthorName=(article:EditorialArticle)=>article.adaptationCredit?.confirmedByHolder?article.adaptationCredit.name:article.credit.name;
export const editorialByline=(article:EditorialArticle)=>article.adaptationCredit?.confirmedByHolder?`${article.adaptationCredit.label} de ${article.adaptationCredit.name}`:`${article.credit.authorshipConfirmedBySource?(/curadoria/i.test(article.credit.label)?'Texto e curadoria':'Texto'):(/curadoria/i.test(article.credit.label)?'Curadoria':'Crédito editorial')}: ${article.credit.name}`;
export const publicEditorialArticles=editorialArticles.filter(article=>!article.draft&&article.reviewed&&article.approvedForPublication===true&&Boolean(article.publishedAt)&&hasConfirmedEditorialAuthorship(article));
export const visibleEditorialArticles=editorialPreview?editorialArticles:publicEditorialArticles;
export const articleUrl=(slug:string)=>`/psicologia-em-pauta/${slug}/`;
export const articleWordCount=(article:EditorialArticle)=>article.sections.flatMap(section=>section.blocks.flatMap(block=>[block.text||'',...(block.items||[]),...(block.columns||[]),...(block.rows||[]).flat()])).join(' ').trim().split(/\s+/).length;
export const articleReadingMinutes=(article:EditorialArticle)=>Math.max(1,Math.ceil(articleWordCount(article)/200));
export const pageLabel=(pages:number[])=>pages.map((page,index)=>index>0&&page===pages[index-1]+1?`–${page}`:`${index?', ':''}${page}`).join('').replace(/–\d+(?=–)/g,'');
