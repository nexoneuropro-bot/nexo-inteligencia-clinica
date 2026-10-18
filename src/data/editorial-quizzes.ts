import type { EditorialQuizDefinition } from '../lib/editorial-quiz.mjs';

/** Authorial educational exercise. Feedback is selected per theme; no score. */
export const editorialQuizzes: EditorialQuizDefinition[] = [{
  id: 'conexoes-no-cotidiano',
  version: 1,
  articleSlug: 'relacoes-reciprocidade',
  author: 'Texto e curadoria de Gabriel Alves Batista · Psicólogo · CRP-SP 06/176184',
  references: [{ label: 'Contexto e referências da edição Relações e reciprocidade', url: '/psicologia-em-pauta/relacoes-reciprocidade/#referencias' }],
  title: 'Como suas conexões aparecem no cotidiano?',
  introduction: 'Pense em situações recentes, sem procurar uma resposta certa. Quatro perguntas ajudam a observar relações, apoio e possibilidades de ação. Você pode voltar e mudar qualquer escolha.',
  resultTitle: 'Quatro pistas para continuar sua reflexão',
  resultIntroduction: 'Esta devolutiva acompanha as situações que você escolheu. Ela não descreve sua personalidade nem mede sua saúde mental. Os contextos mudam; suas possibilidades também.',
  contextIntroductions: {
    personal: 'No uso pessoal, observe episódios da sua própria vida e quais apoios estão acessíveis nas suas condições.',
    company: 'No contexto de uma empresa, use estas perguntas para pensar sobre convivência, possibilidades de apoio e condições de participação. O exercício não avalia funcionários, aptidão, desempenho ou riscos ocupacionais e não substitui uma avaliação organizacional.',
  },
  resultClosing: 'Um exercício não substitui uma conversa nem uma avaliação profissional. Se houver sofrimento persistente ou dificuldades que afetem sua vida, buscar apoio pode ajudar a compreender sua situação com mais cuidado.',
  questions: [{
    id: 'reciprocidade',
    theme: 'Trocas nas relações',
    prompt: 'Quando você precisa de ajuda, o que costuma acontecer nas suas relações?',
    help: 'Considere um exemplo concreto, em vez de julgar toda a relação por um único episódio.',
    options: [
      { id: 'conversamos', label: 'Costumo conseguir conversar e combinar uma forma de apoio.', feedback: 'Você reconhece situações em que pedir ajuda encontra uma resposta. Observar o que facilita essas conversas pode tornar esse apoio mais claro para todos.', nextStep: 'Que atitude da outra pessoa faz você se sentir ouvido? Você consegue agradecer ou explicar isso de forma específica?' },
      { id: 'varia', label: 'Varia bastante conforme a pessoa e a situação.', feedback: 'A disponibilidade de apoio pode mudar conforme a relação, o momento e o tipo de necessidade. Essa variação merece ser observada antes de virar uma conclusão sobre você ou sobre os outros.', nextStep: 'Quem costuma oferecer escuta, quem ajuda em tarefas e quem pode orientar em uma dificuldade específica?' },
      { id: 'dificil', label: 'É difícil pedir ou encontrar apoio neste momento.', feedback: 'Dificuldade de apoio pode envolver poucas oportunidades de contato, experiências anteriores, limites materiais ou relações pouco disponíveis. Isso não é uma falha pessoal.', nextStep: 'Existe uma pessoa, serviço ou espaço comunitário com quem seria possível iniciar um contato pequeno e seguro?' },
      { id: 'refletir', label: 'Prefiro observar melhor antes de escolher uma situação.', feedback: 'Você pode usar a pergunta como convite para observar o cotidiano, sem precisar se definir agora.', nextStep: 'Na próxima vez em que precisar de algo, observe o que pediu, em qual contexto e qual resposta recebeu.' },
    ],
  }, {
    id: 'rede',
    theme: 'Rede de apoio',
    prompt: 'Além de uma relação próxima, que possibilidades de apoio existem hoje à sua volta?',
    help: 'Apoio pode ser afetivo, prático ou comunitário; não precisa vir da mesma pessoa.',
    options: [
      { id: 'diversa', label: 'Reconheço pessoas ou espaços diferentes a que posso recorrer.', feedback: 'Ter diferentes possibilidades pode ajudar a distribuir necessidades e respeitar os limites de cada vínculo. A presença de contatos não garante disponibilidade em todo momento.', nextStep: 'Qual dessas conexões você gostaria de cultivar com uma conversa, uma visita ou uma atividade compartilhada?' },
      { id: 'concentrada', label: 'Quase tudo se concentra em uma pessoa ou em um único espaço.', feedback: 'Uma conexão importante pode oferecer muito apoio. Ao mesmo tempo, concentrar todas as necessidades nela pode limitar alternativas quando essa pessoa ou espaço não está disponível.', nextStep: 'Há outra relação ou atividade que poderia ser retomada aos poucos, respeitando suas condições e seu tempo?' },
      { id: 'construindo', label: 'Minha rede ainda está sendo construída ou está pouco acessível.', feedback: 'Uma rede pode precisar ser construída ou reconstruída, sobretudo após mudanças. Distância, tempo, recursos e oportunidades de convivência também influenciam esse processo.', nextStep: 'Pense em um espaço acessível de convivência, estudo, cultura, trabalho ou cuidado. Qual contato inicial seria viável?' },
      { id: 'refletir', label: 'Ainda não parei para mapear essas possibilidades.', feedback: 'Mapear apoio ajuda a distinguir ter muitos contatos de conseguir ajuda em uma situação concreta.', nextStep: 'Anote, se quiser, três possibilidades: alguém para escutar, alguém para ajuda prática e um serviço que você saiba procurar.' },
    ],
  }, {
    id: 'mudancas',
    theme: 'Mudanças e contexto',
    prompt: 'Quando sua rotina, cidade ou grupo de convivência muda, o que mais chama sua atenção?',
    help: 'Mudanças podem abrir oportunidades e também exigir adaptação; as duas experiências podem coexistir.',
    options: [
      { id: 'oportunidades', label: 'As possibilidades de conhecer pessoas, lugares e modos de viver.', feedback: 'Você destaca oportunidades de exploração. Isso pode coexistir com saudade, incerteza ou tarefas de adaptação, sem diminuir o valor da mudança.', nextStep: 'Que hábito ou conexão você gostaria de preservar enquanto experimenta o novo?' },
      { id: 'perdas', label: 'A distância de pessoas conhecidas e a falta de referências.', feedback: 'Um ambiente desconhecido e a distância da rede de apoio podem trazer solidão, tensão ou dificuldades de adaptação. O efeito varia conforme a história, as condições da mudança e os apoios disponíveis.', nextStep: 'Que referência tornaria o cotidiano um pouco mais familiar: um contato regular, uma atividade ou conhecer um serviço da região?' },
      { id: 'mistura', label: 'Uma mistura de oportunidades, esforço e sentimentos diferentes.', feedback: 'Reações diferentes podem aparecer ao mesmo tempo. Observar o que acontece em cada situação pode ser mais útil do que exigir de si uma única forma de sentir.', nextStep: 'Em que momentos a mudança fica mais difícil e em quais momentos algo novo se torna possível?' },
      { id: 'sem-mudanca', label: 'Não vivi uma mudança recente ou prefiro apenas refletir.', feedback: 'Você não precisa ter vivido uma mudança recente para pensar sobre as referências que sustentam sua rotina.', nextStep: 'Que pessoas, lugares e hábitos ajudam você a se orientar no cotidiano?' },
    ],
  }, {
    id: 'possibilidades',
    theme: 'Um próximo passo possível',
    prompt: 'Qual pequeno movimento faz mais sentido para seu momento?',
    help: 'Escolha algo possível nas suas condições; este exercício não é uma lista de obrigações.',
    options: [
      { id: 'conversa', label: 'Conversar de forma mais concreta sobre uma necessidade ou um limite.', feedback: 'Explicar uma necessidade em uma situação específica pode abrir espaço para combinar expectativas. A resposta da outra pessoa também depende da disponibilidade e dos limites dela.', nextStep: 'Como você descreveria o que aconteceu, o que precisa e o que seria um acordo possível, sem precisar resolver tudo de uma vez?' },
      { id: 'aproximar', label: 'Retomar um contato ou experimentar um espaço de convivência.', feedback: 'Uma aproximação pequena pode ampliar oportunidades de troca. Construir confiança costuma depender de tempo, segurança e experiências compartilhadas.', nextStep: 'Qual primeiro contato caberia na sua semana, inclusive considerando deslocamento, custo e energia disponível?' },
      { id: 'apoio', label: 'Procurar apoio para compreender uma dificuldade que se repete.', feedback: 'Reconhecer uma dificuldade recorrente pode orientar uma busca de ajuda. Uma conversa profissional considera seu contexto, sua história e o que está acontecendo agora.', nextStep: 'Que exemplo concreto você gostaria de levar a essa conversa? O que essa dificuldade muda no seu cotidiano?' },
      { id: 'observar', label: 'Por enquanto, observar melhor o que acontece comigo e à minha volta.', feedback: 'Observar também pode ser um começo. Descrever situações, ações e consequências ajuda a perceber diferenças que uma avaliação geral de si pode esconder.', nextStep: 'Escolha um episódio desta semana: o que aconteceu antes, o que você fez e o que aconteceu depois?' },
    ],
  }],
}];

export const editorialQuizForArticle = (articleSlug: string) => editorialQuizzes.find(quiz => quiz.articleSlug === articleSlug);
