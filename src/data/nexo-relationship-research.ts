/** Pesquisa AUTORAL sobre significados populares. Não mede acerto, aprovação ou diagnóstico. */
export const RELATION_STUDY_VERSION = 'nexo-saber-popular-relacao-aberta-2026-11-12-v1';
export const RELATION_CONSENT_VERSION = 'nexo-relacionamento-aberto-consent-2026-11-13-v4';
export const RELATION_QUESTIONS = Object.freeze([
  {id:'associacoes',label:'Quando você ouve a expressão “relacionamento aberto”, quais são as primeiras palavras ou ideias que vêm à sua mente?',hint:'Pode escrever uma palavra, uma frase ou várias ideias.'},
  {id:'significado',label:'Com suas próprias palavras, o que você entende por relacionamento aberto?',hint:'Não precisa procurar definições. Queremos ouvir como você entende a expressão.'},
  {id:'funcionamento',label:'Como você imagina que um relacionamento aberto funciona na prática?',hint:'Pode descrever como imagina, mesmo que não tenha certeza.'},
]);
export const BRAZIL_STATES = Object.freeze([
 ['AC','Acre'],['AL','Alagoas'],['AP','Amapá'],['AM','Amazonas'],['BA','Bahia'],['CE','Ceará'],['DF','Distrito Federal'],['ES','Espírito Santo'],['GO','Goiás'],['MA','Maranhão'],['MT','Mato Grosso'],['MS','Mato Grosso do Sul'],['MG','Minas Gerais'],['PA','Pará'],['PB','Paraíba'],['PR','Paraná'],['PE','Pernambuco'],['PI','Piauí'],['RJ','Rio de Janeiro'],['RN','Rio Grande do Norte'],['RS','Rio Grande do Sul'],['RO','Rondônia'],['RR','Roraima'],['SC','Santa Catarina'],['SP','São Paulo'],['SE','Sergipe'],['TO','Tocantins']
] as const);
export const RELATION_PROFILE = Object.freeze([
 {id:'idade',label:'Qual é sua faixa etária?',values:[['18-24','18 a 24 anos'],['25-34','25 a 34 anos'],['35-44','35 a 44 anos'],['45-59','45 a 59 anos'],['60+','60 anos ou mais']]},
 {id:'uf',label:'Em qual estado você mora?',values:BRAZIL_STATES},
 {id:'escolaridade',label:'Qual sua escolaridade?',values:[['fundamental','Ensino fundamental'],['medio','Ensino médio'],['superior-incompleto','Ensino superior incompleto'],['superior-completo','Ensino superior completo'],['pos','Pós-graduação']]},
 {id:'genero',label:'Como você descreve seu gênero?',values:[['mulher','Mulher'],['homem','Homem'],['nao-binario','Pessoa não binária'],['outra','Outra forma de identificação']]},
 {id:'orientacao',label:'Orientação sexual (opcional e sensível)',values:[['heterossexual','Heterossexual'],['gay-lesbica','Gay ou lésbica'],['bissexual','Bissexual'],['pansexual','Pansexual'],['assexual','Assexual'],['outra','Outra forma de identificação']]},
 {id:'situacao',label:'Qual descreve sua situação afetiva hoje?',values:[['solteira','Sem relacionamento atualmente'],['namorando','Namorando'],['casada-uniao','Casada(o) ou em união estável'],['multiplos','Em mais de um vínculo afetivo'],['outra','Outra situação']]},
 {id:'territorio',label:'Você mora em...',values:[['capital','Uma capital'],['metropolitana','Região metropolitana, fora da capital'],['interior','Outra cidade do interior'],['rural','Área rural']]},
 {id:'familiaridade',label:'Antes desta pesquisa, já tinha ouvido a expressão “relacionamento aberto”?',values:[['sim','Sim'],['nao','Não'],['nao-sei','Não tenho certeza']]},
] as const);
export const PROFESSIONAL_SOURCES = Object.freeze([
 {name:'Pew Research Center · Writing Survey Questions',url:'https://www.pewresearch.org/writing-survey-questions/',use:'Ordem, redação neutra, pré-teste e diferenças entre questões abertas e fechadas.'},
 {name:'Cardoso, Pascoal & Maiochi (2021) · Defining Polyamory',url:'https://doi.org/10.1007/s10508-021-02002-y',use:'Referência metodológica de definições populares de um conceito próximo; não equivale ao objeto relacionamento aberto.'},
 {name:'Scoats & Campbell (2022) · What do we know about consensual non-monogamy?',url:'https://doi.org/10.1016/j.copsyc.2022.101468',use:'Revisão de literatura para debate posterior, nunca exibida antes das respostas.'},
 {name:'CNS · Resolução 510/2016',url:'https://bvsms.saude.gov.br/bvs/saudelegis/cns/2016/res0510_07_04_2016.html',use:'Apoio à revisão de enquadramento ético de pesquisa de opinião não identificável.'},
 {name:'ANPD · Guia de dados para estudos e pesquisas',url:'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-tratamento-de-dados-pessoais-para-fins-academicos-e-para-a-realizacao-de-estudos-e-pesquisas',use:'Finalidade, dados sensíveis, segurança, minimização e direitos do participante.'},
 {name:'CFP · Código de Ética Profissional do Psicólogo (Resolução nº 10/2005)',url:'https://transparencia.cfp.org.br/wp-content/uploads/sites/16/2024/08/Resolucao-do-Exercicio-Profissional-10-2005-do-Conselho-Federal-de-Psicologia-BR.pdf',use:'Art. 16: princípios éticos para pesquisas e divulgação de resultados.'},
 {name:'Lei 14.874/2024 e Decreto 12.651/2025',url:'https://www2.camara.leg.br/legin/fed/lei/2024/lei-14874-28-maio-2024-795693-norma-pl.html',use:'Marco normativo de pesquisa com seres humanos; conferir aplicabilidade e tramitação com instância competente.'},
 {name:'MDN · SpeechRecognition.processLocally',url:'https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally',use:'Verificação técnica de transcrição no dispositivo, sem fallback remoto.'},
]);
export type RelationAnswers=Record<'associacoes'|'significado'|'funcionamento',string>;
export type RelationProfile=Record<(typeof RELATION_PROFILE)[number]['id'],string|null>;
export function validateRelationPayload(value:unknown):{answers:RelationAnswers;profile:RelationProfile}|null {
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)return null;
 const raw=value as Record<string,unknown>;
 if(Object.keys(raw).sort().join('|')!=='answers|profile')return null;
 const answers=raw.answers,profile=raw.profile;
 if(!answers||typeof answers!=='object'||Array.isArray(answers)||Object.getPrototypeOf(answers)!==Object.prototype)return null;
 if(!profile||typeof profile!=='object'||Array.isArray(profile)||Object.getPrototypeOf(profile)!==Object.prototype)return null;
 const a=answers as Record<string,unknown>,p=profile as Record<string,unknown>;
 if(Object.keys(a).sort().join('|')!==RELATION_QUESTIONS.map(x=>x.id).sort().join('|'))return null;
 if(Object.keys(p).sort().join('|')!==RELATION_PROFILE.map(x=>x.id).sort().join('|'))return null;
 const result={} as RelationAnswers;let hasMeaning=false;
 for(const q of RELATION_QUESTIONS){
  const v=a[q.id];if(typeof v!=='string'||v.length>1200||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))return null;
  result[q.id as keyof RelationAnswers]=v.trim();
  if(v.trim())hasMeaning=true;
 }
 if(!hasMeaning)return null;
 const clean={} as RelationProfile;
 for(const q of RELATION_PROFILE){
  const v=p[q.id];
  if(v!==null&&(typeof v!=='string'||!q.values.some(([id])=>id===v)))return null;
  clean[q.id]=v as string|null;
 }
 return {answers:result,profile:clean};
}
