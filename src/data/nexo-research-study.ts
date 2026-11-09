/**
 * NEXO · Pesquisa social de opinião, questionário AUTORAL, sem escalas clínicas.
 * Relatos retrospectivos não demonstram causalidade da pandemia.
 * O projeto segue desativado até decisão explícita do responsável.
 */
export const RESEARCH_STUDY_ID='acessibilidade-pos-pandemia-v1';
export const RESEARCH_STUDY_VERSION='nexo-social-2026-11-09-v1';
export const RESEARCH_CONSENT_VERSION='nexo-social-consent-2026-11-09-v1';
export const RESEARCH_STUDY=Object.freeze({
 id:RESEARCH_STUDY_ID,version:RESEARCH_STUDY_VERSION,
 title:'Acessibilidade no pós-pandemia e seus reflexos sociais',
 subtitle:'Dos achismos às evidências',
 audience:'Pessoas com 18 anos ou mais residentes no Brasil',
 purpose:'Ouvir experiências sobre barreiras digitais, acesso a serviços, trabalho, educação e convivência social na fase posterior à pandemia de Covid-19.',
 methodology:'Pesquisa social transversal e descritiva, com participação voluntária e amostra não probabilística. Percepções retrospectivas não estabelecem causalidade.',
 estimatedMinutes:6,
 period:'Comparações com antes de março de 2020 referem-se à lembrança da pessoa participante, não à medição objetiva anterior.',
 questions:Object.freeze([
  {id:'age',prompt:'Qual é sua faixa etária?',options:[['18-24','18 a 24 anos'],['25-34','25 a 34 anos'],['35-44','35 a 44 anos'],['45-59','45 a 59 anos'],['60-plus','60 anos ou mais']]},
  {id:'region',prompt:'Em qual região do Brasil você mora?',options:[['norte','Norte'],['nordeste','Nordeste'],['centro-oeste','Centro-Oeste'],['sudeste','Sudeste'],['sul','Sul']]},
  {id:'community',prompt:'Você vive em área...',options:[['urbana','Urbana'],['rural','Rural'],['nao-sei','Não sei informar']]},
  {id:'connection',prompt:'Qual descreve melhor seu acesso à internet atualmente?',options:[['celular','Principalmente pelo celular'],['varios','Por celular e computador ou tablet'],['compartilhado','Por conexão ou equipamento compartilhado'],['limitado','Com acesso raro ou instável'],['nao-sei','Não sei dizer']]},
  {id:'connection-compare',prompt:'Em comparação com antes da pandemia, seu acesso à internet está...',options:[['melhor','Melhor'],['igual','Parecido'],['pior','Pior'],['nao-utilizava','Não utilizava antes'],['nao-lembro','Não lembro ou não consigo comparar']]},
  {id:'digital-barrier',prompt:'Qual dificuldade digital mais atrapalha seu dia a dia?',options:[['custo','Custo da internet ou dos equipamentos'],['conexao','Conexão ruim ou instável'],['usabilidade','Serviços digitais difíceis de usar'],['acessibilidade','Falta de leitura acessível, legendas ou recursos de navegação'],['seguranca','Medo de golpes e problemas de privacidade'],['nenhuma','Não encontro dificuldade importante'],['outra','Outra situação']]},
  {id:'services',prompt:'Em qual área você percebe mais dificuldade para obter atendimento ou participar?',options:[['saude','Saúde'],['educacao','Educação'],['trabalho','Trabalho e renda'],['documentos','Serviços públicos e documentos'],['mobilidade','Mobilidade e transporte'],['convivencia','Cultura, lazer e convivência'],['nenhuma','Nenhuma dessas']]},
  {id:'digital-only',prompt:'Quando um serviço só oferece atendimento digital, normalmente você...',options:[['sozinho','Consegue resolver sem ajuda'],['ajuda','Precisa da ajuda de outra pessoa'],['desiste','Às vezes desiste ou adia'],['presencial','Procura atendimento presencial'],['nao-passei','Não vivi essa situação']]},
  {id:'work-school',prompt:'O acesso remoto a trabalho ou estudo trouxe para você...',options:[['mais','Mais oportunidades'],['menos','Menos oportunidades'],['misto','Vantagens e desvantagens'],['igual','Pouca diferença'],['nao-aplica','Não se aplica'],['nao-comparo','Não consigo comparar']]},
  {id:'social-life',prompt:'Comparada à época anterior à pandemia, sua convivência presencial hoje é...',options:[['mais','Mais frequente'],['igual','Parecida'],['menos','Menos frequente'],['nao-comparo','Não consigo comparar']]},
  {id:'participation',prompt:'O que mais dificulta sua participação em atividades e serviços?',options:[['custo','Custo'],['distancia','Distância e transporte'],['horarios','Horários incompatíveis'],['fisicas','Barreiras físicas de acessibilidade'],['digitais','Barreiras digitais ou de comunicação'],['acolhimento','Falta de acolhimento adequado'],['nenhuma','Não tenho dificuldade relevante']]},
  {id:'sources',prompt:'Ao ouvir uma afirmação sobre consequências sociais da pandemia, você costuma...',options:[['fontes','Conferir dados e fontes'],['comparar','Comparar diferentes fontes'],['conhecidos','Confiar mais na experiência de conhecidos'],['nao-verifico','Raramente verificar a origem'],['nao-sei','Não sei dizer']]},
  {id:'priority',prompt:'Qual iniciativa você considera mais importante para tornar serviços acessíveis?',options:[['internet','Internet e equipamentos com menor custo'],['presencial','Manter alternativas presenciais'],['desenho','Sites e aplicativos acessíveis'],['educacao','Orientação digital gratuita'],['transporte','Transporte acessível'],['comunidade','Espaços e redes comunitárias']]},
 ].map(item=>Object.freeze({id:item.id,prompt:item.prompt,options:Object.freeze(item.options.map(([id,label])=>Object.freeze({id,label} as const)))}))),
 sources:Object.freeze([
  {name:'Cetic.br · TIC Domicílios 2025',url:'https://www.cetic.br/pt/tics/domicilios/2025/individuos/'},
  {name:'IBGE · PNAD Contínua TIC 2025',url:'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/47410-internet-chega-a-95-de-domicilios-do-pais-em-2025'},
  {name:'CNS · Resolução nº 510/2016',url:'https://www.gov.br/conselho-nacional-de-saude/pt-br/atos-normativos/resolucoes/2016/resolucao-no-510.pdf/view'},
 ])
});
export type SocialResearchAnswer=Record<string,string|null>;
export function validateSocialResearchAnswers(data:unknown):SocialResearchAnswer|null{
 if(data===null||typeof data!=='object'||Array.isArray(data)||Object.getPrototypeOf(data)!==Object.prototype)return null;
 const input=data as Record<string,unknown>,ids=new Set(RESEARCH_STUDY.questions.map(q=>q.id));
 if(Object.keys(input).length!==ids.size||Object.keys(input).some(id=>!ids.has(id)))return null;
 const result:SocialResearchAnswer={};let answered=0;
 for(const q of RESEARCH_STUDY.questions){
  const v=input[q.id];
  if(v!==null&&(typeof v!=='string'||!q.options.some(o=>o.id===v)))return null;
  result[q.id]=v as string|null;
  if(v!==null)answered++;
 }
 return answered>=1?result:null;
}
