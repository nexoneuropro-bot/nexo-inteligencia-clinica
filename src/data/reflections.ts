export const reflections = [
  {category:'Vida', question:'Em que situações uma dificuldade aparece com mais frequência?', context:'Recordar um episódio concreto pode ajudar a observar o que aconteceu antes, como você reagiu e o que veio depois.', link:'/para-voce/', label:'Conheça o acolhimento'},
  {category:'Ciência', question:'O que muda quando você muda a pergunta?', context:'Investigar envolve formular perguntas, considerar o contexto e reconhecer os limites de uma resposta.', link:'/nossa-abordagem/', label:'Nossa forma de investigar'},
  {category:'Autoconhecimento', question:'O que traz alívio agora também ajuda depois?', context:'Compare consequências imediatas e posteriores de uma situação. Uma observação abre perguntas; sozinha, não explica todo um padrão.', link:'/psicoterapia/', label:'Entenda a Análise do Comportamento'},
  {category:'Filosofia', question:'Quantos sentidos cabem em uma mesma pergunta?', context:'Um X pode representar uma incógnita. Aqui, ele é um convite a investigar, sem antecipar respostas.', link:'/nossa-abordagem/', label:'Explore nossa perspectiva'},
  {category:'Sociedade', question:'O que muda no seu jeito de agir quando o contexto muda?', context:'Relações, cultura e condições de vida participam das possibilidades de cada pessoa. Vale observar diferenças entre situações.', link:'/nossa-abordagem/', label:'Conheça nossa abordagem'},
  {category:'Neuropsicologia', question:'Você é mais do que uma única característica.', context:'A avaliação integra a demanda, a história e diferentes informações. Um resultado isolado não conta toda a história.', link:'/avaliacao-neuropsicologica/', label:'Entenda a avaliação'},
  {category:'Trabalho', question:'O que os indicadores mostram e as pessoas ainda não conseguiram dizer?', context:'Uma pergunta para abrir conversas sobre a organização do trabalho e as relações entre as pessoas.', link:'/riscos-psicossociais-nr1/', label:'Saúde mental no trabalho'},
  {category:'Organizações', question:'O que sua organização deixou de questionar porque passou a chamar de rotina?', context:'Compreender como as pessoas trabalham é um ponto de partida para pensar mudanças.', link:'/para-sua-empresa/', label:'Conheça a consultoria'}
];

export const dimensions = [
  {id:'biologica', title:'Corpo e saúde', number:'01', text:'Corpo e condições de saúde participam de como agimos, percebemos e sentimos.', connection:'Esta é uma dimensão da mesma experiência: sua compreensão se relaciona com a história de vida e as condições presentes.'},
  {id:'psicologica', title:'História e experiência', number:'02', text:'O que fazemos, pensamos e sentimos se relaciona com o que aprendemos e com as situações que vivemos.', connection:'Acontecimentos privados também podem ser investigados a partir do relato e do contexto. Uma experiência não revela uma essência escondida.'},
  {id:'social', title:'Contexto e relações', number:'03', text:'Família, cultura, trabalho e condições de vida ampliam ou restringem nossas possibilidades.', connection:'Estas dimensões são formas de observar relações, não três causas independentes. Perguntamos como a vida acontece em cada contexto.'}
];

export function whatsapp(type:'personal'|'business'='personal', service?:string){
  const subject = service?.trim();
  const message = type === 'business'
    ? subject
      ? `Olá! Conheci a NEXO pelo site e gostaria de conversar sobre ${subject}.`
      : 'Olá! Conheci a NEXO pelo site e gostaria de apresentar uma situação da minha organização. Ainda preciso de ajuda para definir a demanda.'
    : subject
      ? `Olá! Conheci a NEXO pelo site e gostaria de receber informações sobre ${subject}.`
      : 'Olá! Conheci a NEXO pelo site e tenho dúvidas sobre como começar um atendimento. Gostaria de receber informações.';
  return `https://wa.me/551154444366?text=${encodeURIComponent(message)}`;
}
