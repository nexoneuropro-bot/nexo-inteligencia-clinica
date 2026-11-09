/**
 * Sugestão conservadora de discussão, não recrutamento automático.
 * Uma HD psicopatológica, por si só, nunca torna a pessoa elegível para pesquisa.
 * Critérios são sobre relato contextual e não são prova de barreira.
 */
export type SocialResearchCue=Readonly<{evidence:readonly string[];question:string;limit:string}>;
type Dict=Record<string,unknown>;
const dict=(x:unknown):Dict=>x&&typeof x==='object'&&!Array.isArray(x)?x as Dict:{};
export function socialResearchRelevance(value:unknown):SocialResearchCue|null{
 const record=dict(value),answers=dict(record.authorAnswers),profile=dict(record.profile),impact=dict(record.impact);
 const details:string[]=[];
 const functional=[impact.phq9,impact.gad7].some(v=>typeof v==='number'&&Number.isInteger(v)&&v>=2&&v<=3);
 if(answers.situacao==='mudancas'&&answers.contexto==='orientacoes')
  details.push('A pessoa indicou mudanças no cotidiano e necessidade de orientações claras.');
 if(answers.situacao==='mudancas'&&profile.activity==='seeking-work')
  details.push('Relatou mudanças no cotidiano e busca de trabalho.');
 if(answers.situacao==='relacoes'&&functional)
  details.push('Trouxe relações sociais como tema e declarou interferência no cotidiano.');
 if(!details.length)return null;
 return Object.freeze({
  evidence:Object.freeze(details),
  question:'Na experiência desta pessoa, há barreiras reais de acesso a serviços, meios digitais, trabalho ou participação social? Ela gostaria livremente de contribuir com uma pesquisa de opinião?',
  limit:'O acolhimento não investiga diretamente acessibilidade nem estabelece relações causais com a pandemia. Somente a entrevista pode confirmar pertinência; nunca condicionar atendimento à participação.'
 });
}
