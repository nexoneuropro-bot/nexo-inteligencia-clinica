export const reflections = [
  {category:'Vida', question:'Nem tudo o que sentimos conseguimos compreender imediatamente.', context:'Dar espaço a uma pergunta também pode ser uma forma de cuidado.', link:'/para-voce/', label:'Conheça o acolhimento'},
  {category:'Ciência', question:'O que muda quando você muda a pergunta?', context:'Investigar envolve formular perguntas, considerar o contexto e reconhecer os limites de uma resposta.', link:'/nossa-abordagem/', label:'Nossa forma de investigar'},
  {category:'Autoconhecimento', question:'O que você conhece sobre si e o que aprendeu a acreditar?', context:'Uma reflexão para explorar a própria história. Não há uma resposta certa ou uma pontuação.', link:'/psicoterapia/', label:'Um espaço para se escutar'},
  {category:'Filosofia', question:'Quantos sentidos cabem em uma mesma pergunta?', context:'Um X pode representar uma incógnita. Aqui, ele é um convite a investigar, sem antecipar respostas.', link:'/nossa-abordagem/', label:'Explore nossa perspectiva'},
  {category:'Sociedade', question:'Qual a influência do contexto sobre suas escolhas?', context:'Relações, cultura e condições de vida fazem parte da história que procuramos compreender.', link:'/nossa-abordagem/', label:'Conheça o olhar biopsicossocial'},
  {category:'Neuropsicologia', question:'Você é mais do que uma única característica.', context:'A avaliação integra a demanda, a história e diferentes informações. Um resultado isolado não conta toda a história.', link:'/avaliacao-neuropsicologica/', label:'Entenda a avaliação'},
  {category:'Trabalho', question:'O que os indicadores mostram e as pessoas ainda não conseguiram dizer?', context:'Uma pergunta para abrir conversas sobre a organização do trabalho e as relações entre as pessoas.', link:'/riscos-psicossociais-nr1/', label:'Saúde mental no trabalho'},
  {category:'Organizações', question:'O que sua organização deixou de questionar porque passou a chamar de rotina?', context:'Compreender como as pessoas trabalham é um ponto de partida para pensar mudanças.', link:'/para-sua-empresa/', label:'Conheça a consultoria'}
];

export const dimensions = [
  {id:'biologica', title:'Biológica', number:'01', text:'Corpo, cérebro, sistema nervoso e condições de saúde fazem parte de como vivemos.', connection:'O corpo participa da experiência. Sua compreensão ganha sentido em relação à história e ao contexto.'},
  {id:'psicologica', title:'Psicológica', number:'02', text:'Pensamentos, emoções, cognição, comportamento e história individual se encontram em cada experiência.', connection:'A experiência de cada pessoa se relaciona com seu corpo, seus vínculos e suas condições de vida.'},
  {id:'social', title:'Social', number:'03', text:'Cultura, trabalho, família, relações e ambiente compõem o contexto em que a vida acontece.', connection:'O contexto se conecta às possibilidades, aos sentidos e às formas de viver de cada pessoa.'}
];

export function whatsapp(type:'personal'|'business'='personal', service?:string){
  const message = type === 'business' ? 'Olá! Conheci a NEXO pelo site e gostaria de conversar sobre soluções para minha organização.' : service ? `Olá! Conheci a NEXO pelo site e gostaria de receber informações sobre ${service}.` : 'Olá! Conheci a NEXO pelo site e gostaria de receber informações sobre os atendimentos.';
  return `https://wa.me/551154444366?text=${encodeURIComponent(message)}`;
}
