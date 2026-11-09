/**
 * Bloco autoral de acolhimento. Nunca usar como teste, pontuação, hipótese
 * diagnóstica ou avaliação automática de comportamentos clinicamente relevantes.
 * Se a pessoa escolher conversa breve, estas perguntas não são apresentadas.
 * Se escolher a conversa aprofundada, pode reservar qualquer tema para a sessão.
 */
export const REFLECTION_MAX_CHARS=1400;
export const reflectionQuestions=Object.freeze([
 Object.freeze({
   id:'demanda',
   theme:'O que traz você até aqui',
   title:'O que fez você desejar conversar com um profissional neste momento?',
   intro:'Pode ser um acontecimento, algo que vem se repetindo ou apenas a vontade de se conhecer melhor. Não precisa contar tudo agora.'
 }),
 Object.freeze({
   id:'episodio',
   theme:'Um momento concreto',
   title:'Há alguma situação recente que ajude a compreender o que você está vivendo?',
   intro:'Se desejar, conte o que aconteceu antes, como você reagiu e o que percebeu depois. Não existe resposta certa.'
 }),
 Object.freeze({
   id:'recursos',
   theme:'O que ajuda você',
   title:'O que costuma dar algum apoio ou alívio nos dias mais difíceis?',
   intro:'Podem ser pessoas, atividades, comunidades, crenças, pequenos hábitos ou lugares. Também vale não saber ainda.'
 }),
 Object.freeze({
   id:'identidade-vinculos',
   theme:'Sua história e seus vínculos',
   title:'Há algo sobre seus relacionamentos, história, identidade, crenças ou pertencimento que gostaria que fosse considerado?',
   intro:'Não é preciso informar religião, orientação afetivo-sexual, identidade de gênero ou qualquer detalhe íntimo. Compartilhe apenas o que fizer sentido.'
 }),
 Object.freeze({
   id:'expectativas',
   theme:'O que você espera desse cuidado',
   title:'O que gostaria que o profissional compreendesse melhor sobre você?',
   intro:'Você pode contar o que deseja mudar, entender ou preservar em sua vida. Se preferir, deixe para o encontro.'
 }),
]);
export const reflectionChoices=Object.freeze([
 Object.freeze({id:'answered',label:'Quero contar agora'}),
 Object.freeze({id:'later',label:'Prefiro conversar sobre isso na sessão'}),
 Object.freeze({id:'prefer-not',label:'Prefiro não responder'}),
 Object.freeze({id:'unsure',label:'Ainda não sei dizer'}),
]);
