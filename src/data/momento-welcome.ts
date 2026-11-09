/**
 * Perguntas autorais de acolhimento, distintas dos instrumentos PHQ-9 e GAD-7.
 * Sem pontuação, sem inferência automática. Cada pergunta pode ser respondida
 * por alternativa, texto ou ditado LOCAL, ou reservada para a sessão.
 * O aprofundamento é escolha da pessoa, nunca requisito do atendimento.
 */
export type WelcomePath='essential'|'expanded';
export type WelcomeSetting='solo'|'with-professional';
export type WelcomeStatus='answered'|'later'|'declined'|'unsure';
export type WelcomeMethod='choice'|'text'|'voice';
export type WelcomeResponse={status:WelcomeStatus;method?:WelcomeMethod;choice?:string;text?:string};
export type WelcomeQuestion=Readonly<{id:string;title:string;intro:string;expandedOnly:boolean;sensitive:boolean;options:readonly Readonly<{id:string;label:string}>[]}>;
export const MAX_WELCOME_CHARS=700;
export const welcomeQuestions:readonly WelcomeQuestion[]=Object.freeze([
 {id:'agora',title:'O que fez você procurar esta conversa justamente agora?',intro:'Pode ter sido algo recente, uma situação antiga ou simplesmente a vontade de se conhecer melhor.',expandedOnly:false,sensitive:false,options:[
  {id:'recente',label:'Algo aconteceu recentemente.'},{id:'antigo',label:'É algo que venho vivendo há algum tempo.'},{id:'indicacao',label:'Alguém sugeriu que eu buscasse apoio.'},{id:'autoconhecimento',label:'Quero me conhecer melhor.'},{id:'outro',label:'Quero explicar com minhas palavras.'}
 ]},
 {id:'objetivo',title:'O que gostaria de compreender sobre você ou sobre o que está vivendo?',intro:'Não precisa ter um objetivo definido. Podemos descobrir isso juntos na sessão.',expandedOnly:false,sensitive:false,options:[
  {id:'compreender',label:'Entender melhor o que sinto ou penso.'},{id:'relacoes',label:'Compreender minhas relações.'},{id:'cotidiano',label:'Lidar melhor com o cotidiano.'},{id:'mudanca',label:'Entender uma mudança importante.'},{id:'outro',label:'Gostaria de contar com minhas palavras.'}
 ]},
 {id:'historia',title:'Há alguma experiência da sua história que considera importante para esta conversa?',intro:'Pode ser da infância, adolescência ou vida adulta. Compartilhe somente o que desejar.',expandedOnly:true,sensitive:false,options:[
  {id:'infancia',label:'Uma experiência da infância.'},{id:'adolescencia',label:'Algo vivido na adolescência.'},{id:'recente',label:'Um acontecimento mais recente.'},{id:'sem-tema',label:'Não tenho uma experiência específica em mente.'},{id:'outro',label:'Quero contar com minhas palavras.'}
 ]},
 {id:'apoio',title:'O que costuma ajudar quando as coisas ficam difíceis?',intro:'Pode ser alguém, uma atividade, uma crença ou algo que ainda está descobrindo.',expandedOnly:true,sensitive:false,options:[
  {id:'pessoas',label:'Conversar ou estar com pessoas de confiança.'},{id:'atividades',label:'Atividades, hábitos ou momentos de descanso.'},{id:'espiritualidade',label:'Crenças, espiritualidade ou comunidade.'},{id:'sem-apoio',label:'Ainda não reconheço algo que ajude.'},{id:'outro',label:'Quero contar de outro jeito.'}
 ]},
 {id:'relacionamentos',title:'Como estão suas relações afetivas ou seus vínculos importantes neste momento?',intro:'Pode falar de namoro, casamento, solteirice, diferentes formas de relacionamento ou outros vínculos; não há modelo esperado.',expandedOnly:true,sensitive:true,options:[
  {id:'em-relacao',label:'Estou em um relacionamento ou construindo um vínculo.'},{id:'sem-relacao',label:'Não estou em relacionamento afetivo atualmente.'},{id:'mudancas',label:'Tenho vivido mudanças ou dúvidas sobre vínculos.'},{id:'outro',label:'Prefiro descrever com minhas palavras.'}
 ]},
 {id:'identidade',title:'Há algo sobre sua identidade de gênero, nome ou a forma como gostaria de ser tratado que deseja compartilhar?',intro:'Sua identidade não é tratada como um problema. Só compartilhe o que for importante para seu acolhimento.',expandedOnly:true,sensitive:true,options:[
  {id:'tratamento',label:'Quero esclarecer nome, pronome ou forma de tratamento.'},{id:'experiencia',label:'Gostaria de falar sobre uma experiência relacionada à identidade.'},{id:'sem-ajuste',label:'Não há nada que eu queira acrescentar agora.'},{id:'outro',label:'Quero contar com minhas palavras.'}
 ]},
 {id:'orientacao',title:'Sua orientação afetivo-sexual é um assunto que deseja considerar na conversa?',intro:'A pergunta não pressupõe qualquer orientação nem exige que você se defina.',expandedOnly:true,sensitive:true,options:[
  {id:'importante',label:'Sim, é importante para o que estou vivendo.'},{id:'nao-central',label:'Não é um tema central para mim agora.'},{id:'explorando',label:'Estou explorando ou tentando compreender esse aspecto.'},{id:'outro',label:'Quero contar com minhas palavras.'}
 ]},
 {id:'crencas',title:'Religião, espiritualidade ou alguma filosofia de vida têm importância na sua história?',intro:'Também está tudo bem não ter religião ou não desejar abordar crenças.',expandedOnly:true,sensitive:true,options:[
  {id:'religiao',label:'Uma religião ou comunidade de fé é importante para mim.'},{id:'espiritual',label:'Tenho espiritualidade, sem necessariamente seguir uma religião.'},{id:'nao',label:'Não tenho uma crença religiosa que deseje destacar.'},{id:'outro',label:'Quero contar com minhas palavras.'}
 ]},
 {id:'contexto-social',title:'Há alguma condição da sua vida ou de seu ambiente que gostaria que fosse considerada?',intro:'Por exemplo, trabalho, moradia, responsabilidades, pertencimento, discriminação, saúde ou segurança.',expandedOnly:true,sensitive:true,options:[
  {id:'trabalho',label:'Trabalho, estudo ou condições materiais.'},{id:'familia',label:'Família, responsabilidades ou rede de apoio.'},{id:'pertencimento',label:'Pertencimento, cultura ou experiências sociais.'},{id:'saude',label:'Saúde, autocuidado ou acessibilidade.'},{id:'outro',label:'Quero contar com minhas palavras.'}
 ]},
 {id:'continuidade',title:'Existe algo que poderia dificultar nossos próximos encontros?',intro:'Essa pergunta serve para que o cuidado possa se adaptar às suas condições, sem julgamentos.',expandedOnly:true,sensitive:false,options:[
  {id:'horario',label:'Horários ou compromissos.'},{id:'privacidade',label:'Privacidade ou ambiente adequado.'},{id:'acesso',label:'Conexão, acessibilidade ou deslocamento.'},{id:'emocional',label:'Falar sobre alguns assuntos é difícil para mim.'},{id:'sem-barreira',label:'Não percebo uma dificuldade no momento.'},{id:'outro',label:'Quero explicar de outra forma.'}
 ]}
].map(q=>Object.freeze({...q,options:Object.freeze(q.options.map(o=>Object.freeze(o)))})));
export const welcomeQuestionsFor=(path:WelcomePath)=>welcomeQuestions.filter(q=>path==='expanded'||!q.expandedOnly);
