/**
 * Recomendação ética de CONVITE OPCIONAL para pesquisa social, sem cruzar
 * respostas clínicas e de pesquisa, sem inferir vulnerabilidade por sintoma.
 */
export type SocialResearchSuggestion=Readonly<{
 title:string;context:string;question:string;reason:string;
 evidence:readonly string[];safetyReviewRequired:boolean;
}>;
export function suggestSocialAccessibilityStudy(raw:unknown):SocialResearchSuggestion|null{
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
 const impacts=v.impact&&typeof v.impact==='object'&&!Array.isArray(v.impact)?
  v.impact as Record<string,unknown>:{};
 const entries=[['phq9','Impacto funcional referido no PHQ-9'],['gad7','Interferência contextual referida após GAD-7']] as const;
 const evidence=entries.filter(([id])=>Number.isInteger(impacts[id])&&(impacts[id] as number)>=2&&(impacts[id] as number)<=3)
  .map(([id,label])=>label+': '+String(impacts[id])+'/3');
 if(!evidence.length)return null;
 const item9=Array.isArray(v.phq9)?v.phq9[8]:undefined;
 return Object.freeze({
  title:'Pesquisa social opcional · Acessibilidade no pós-pandemia',
  context:'Domínio de funcionamento e participação social, não hipótese diagnóstica nem presunção de vulnerabilidade.',
  question:'Além dos sintomas descritos, existem barreiras externas de acesso, tecnologia, mobilidade ou participação que a pessoa queira relatar?',
  reason:'O impacto funcional autorrelatado torna pertinente investigar o contexto. A pesquisa populacional, porém, é separada do atendimento e a pessoa pode recusá-la sem qualquer consequência.',
  evidence:Object.freeze(evidence),
  safetyReviewRequired:item9===undefined||item9===null||(typeof item9==='number'&&item9>0),
 });
}
