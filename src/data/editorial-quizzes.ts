import type { EditorialQuizDefinition } from '../lib/editorial-quiz.mjs';

const author = 'Texto e curadoria de Gabriel Alves Batista · Psicólogo · CRP-SP 06/176184';
const frequencyOptions = () => [
  { id: 'nunca', label: '0 · Nunca', points: 0 },
  { id: 'raramente', label: '1 · Raramente', points: 1 },
  { id: 'as-vezes', label: '2 · Às vezes', points: 2 },
  { id: 'frequentemente', label: '3 · Frequentemente', points: 3 },
];
const listeningBarriers = [
  'Enquanto alguém fala, preparo mentalmente a minha resposta.',
  'Interrompo para corrigir detalhes ou explicar o que eu penso.',
  'Completo frases de outras pessoas.',
  'Olho notificações ou mexo no celular durante conversas importantes.',
  'Quando me sinto criticado, começo a me defender antes de a pessoa terminar.',
  'Dou conselhos antes de perguntar se a pessoa quer conselho.',
  'Transformo rapidamente a experiência da pessoa em uma história minha.',
  'Mudo de assunto quando a conversa começa a me deixar desconfortável.',
  'Faço perguntas principalmente para provar meu ponto.',
  'Presumo saber o que a pessoa quis dizer antes de verificar.',
  'Uso ironia, sarcasmo ou mudança de foco quando discordo.',
  'Depois da conversa, lembro pouco do que a pessoa realmente disse.',
];
const listeningRepertoire = [
  'Faço perguntas ligadas ao que a pessoa acabou de dizer.',
  'Tolero alguns segundos de silêncio sem preencher imediatamente.',
  'Verifico se entendi corretamente antes de tirar conclusões.',
  'Reconheço uma emoção sem precisar concordar com a conclusão.',
  'Consigo ouvir uma crítica inteira antes de começar a me defender.',
  'Pergunto se a pessoa quer escuta, opinião ou ajuda para resolver.',
  'Deixo o celular de lado em conversas importantes.',
  'Percebo mudanças relevantes no tom, ritmo ou expressão do outro.',
  'Consigo admitir quando uma informação mudou minha interpretação.',
  'Lembro depois de informações importantes que alguém compartilhou.',
  'Quando interrompo ou entendo errado, consigo reparar e devolver a palavra.',
  'Demonstro curiosidade por realidades diferentes das minhas.',
];

/**
 * Original authorial educational exercises, original arithmetic and editorial
 * bands. The bands are not clinical cut-offs or validated measures.
 * Source texts checked against the kit PDFs and work/pauta-audit extractions.
 * New IDs do not reuse the former four-question demonstration.
 */
export const editorialQuizzes: EditorialQuizDefinition[] = [{
  id: 'original-tres-procuras',
  version: 1,
  articleSlug: 'relacoes-reciprocidade',
  author,
  source: {
    file: 'Psicologia_em_Pauta_Relacoes_Reciprocidade_REV05.pdf',
    pages: [11, 12],
    label: 'Exercício das 3 procuras · edição original REV05 · páginas 11–12',
  },
  references: [{ label: 'Contexto e referências da edição Relações e reciprocidade', url: '/psicologia-em-pauta/relacoes-reciprocidade/#referencias' }],
  title: 'Exercício das 3 procuras',
  introduction: 'Escolha alguém e pense nas 3 últimas vezes em que essa pessoa te procurou. Responda sem tentar “provar” nada. Em cada rodada, marque 1, 2 ou 3 pontos. No final, some.',
  resultTitle: 'O número não sentencia ninguém. Ele organiza perguntas.',
  resultIntroduction: 'Seu índice vai de 3 a 9. Ele não mede amor, caráter ou diagnóstico. Serve para organizar uma pergunta: essa relação existe também quando não há demanda? As mensagens abaixo são as faixas editoriais do exercício autoral original.',
  resultClosing: 'Talvez a pergunta mais importante nem seja “essa pessoa me usa?”. Tente: “Como eu me sinto quando essa pessoa me procura? Eu consigo dizer não? Eu conheço o lugar que esse vínculo ocupa? Minhas expectativas foram combinadas ou imaginadas?”',
  scoring: {
    kind: 'sum',
    criteria: 'Some os pontos das três respostas, sem pesos ou inversões: cada opção vale o número mostrado (1, 2 ou 3). Total de 3 a 9. As faixas autorais são inclusivas: 3–4, 5–7 e 8–9.',
    disclaimer: 'Exercício educativo autoral; não é instrumento psicológico. As faixas organizam reflexão, sem validação clínica ou psicométrica estabelecida, diagnóstico ou medida de amor e caráter. Não substitui avaliação individual.',
    groups: [{
      id: 'tres-procuras',
      title: 'Índice das 3 procuras',
      questionIds: ['procura', 'depois-da-necessidade', 'quando-nao-pode-ajudar'],
      min: 3,
      max: 9,
      sourcePages: [11, 12],
      bands: [{
        min: 3, max: 4, title: 'Utilidade em destaque',
        text: 'A relação parece aparecer principalmente quando existe uma necessidade. Observe se há espaço para você além do que oferece.',
      }, {
        min: 5, max: 7, title: 'Zona de observação',
        text: 'Há vínculo, mas as necessidades parecem ocupar bastante espaço. Vale observar contexto, fase de vida e reciprocidade.',
      }, {
        min: 8, max: 9, title: 'Sinais de reciprocidade',
        text: 'O contato parece sobreviver à ausência de demanda. Isso não garante intimidade, mas sugere interesse que vai além da utilidade.',
      }],
    }],
  },
  questions: [{
    id: 'procura',
    theme: 'Quando essa pessoa te procura…',
    prompt: 'Quando essa pessoa te procura…',
    help: 'Pense nas 3 últimas vezes em que essa pessoa te procurou.',
    options: [
      { id: 'necessidade', label: '1 · Quase sempre precisa de alguma coisa.', points: 1 },
      { id: 'varia', label: '2 · Às vezes precisa; às vezes aparece só pelo contato.', points: 2 },
      { id: 'contato', label: '3 · Também te procura sem precisar de nada.', points: 3 },
    ],
  }, {
    id: 'depois-da-necessidade',
    theme: 'Depois que a necessidade acaba…',
    prompt: 'Depois que a necessidade acaba…',
    help: 'Responda sem tentar “provar” nada.',
    options: [
      { id: 'desaparece', label: '1 · O contato praticamente desaparece.', points: 1 },
      { id: 'esfria', label: '2 · Ainda existe contato, mas esfria bastante.', points: 2 },
      { id: 'continua', label: '3 · A relação continua normalmente.', points: 3 },
    ],
  }, {
    id: 'quando-nao-pode-ajudar',
    theme: 'Quando você não pode ajudar…',
    prompt: 'Quando você não pode ajudar…',
    help: 'Responda sem tentar “provar” nada.',
    options: [
      { id: 'diminui', label: '1 · O interesse tende a diminuir.', points: 1 },
      { id: 'depende', label: '2 · Depende da situação.', points: 2 },
      { id: 'presenca', label: '3 · Sua presença continua tendo valor.', points: 3 },
    ],
  }],
}, {
  id: 'original-escuta-24-itens',
  version: 1,
  articleSlug: 'escuta-atencao-e-relacoes',
  author,
  source: {
    file: 'Psicologia_em_Pauta_Epidemia_da_Nao_Escuta_INTERATIVA.pdf',
    pages: [12, 13, 16, 17],
    label: 'Exercício interativo de escuta · 24 itens originais · páginas 12–13 e anexo 16–17',
  },
  references: [{ label: 'Contexto e referências da edição Escuta, atenção e relações', url: '/psicologia-em-pauta/escuta-atencao-e-relacoes/#referencias' }],
  title: 'Barreiras e repertório de escuta',
  introduction: 'Pense nas últimas quatro semanas. Marque: 0 nunca · 1 raramente · 2 às vezes · 3 frequentemente. O exercício tem duas partes de 12 itens. As duas somas são lidas separadamente, como no original.',
  resultTitle: 'Agora, veja o que os seus dois números sugerem.',
  resultIntroduction: 'Não existe “veredito”. As faixas organizam a frequência autorreferida dos comportamentos para estimular reflexão. As mensagens abaixo reproduzem as faixas editoriais do exercício autoral original.',
  resultClosing: 'Os escores servem para auto-observação e curiosidade. Não são pontos de corte clínicos e não substituem avaliação psicológica ou multiprofissional.',
  scoring: {
    kind: 'sum',
    criteria: 'Cada resposta vale 0, 1, 2 ou 3, conforme a frequência indicada. Some os itens 1–12 para Barreiras à escuta e, separadamente, os itens 13–24 para Repertório de escuta. Cada soma vai de 0 a 36, sem pesos ou inversões. Não há total geral. Cada grupo usa as faixas autorais inclusivas 0–12, 13–24 e 25–36.',
    disclaimer: 'Aferição educativa, exploratória e autorreferida. Não é teste psicológico, não produz diagnóstico e não mede personalidade. Não possui normas populacionais, valor diagnóstico ou validade psicométrica estabelecida. As faixas são orientações editoriais do autor.',
    groups: [{
      id: 'barreiras-escuta',
      title: 'Parte 1 · Barreiras à escuta',
      questionIds: listeningBarriers.map((_, index) => `escuta-${index + 1}`),
      min: 0,
      max: 36,
      sourcePages: [12, 16],
      bands: [{
        min: 0, max: 12, title: 'Barreiras pouco frequentes',
        text: 'Sua atenção tende a sofrer menos interferência desses padrões.',
      }, {
        min: 13, max: 24, title: 'Barreiras aparecem sob tensão',
        text: 'Pressa, defesa, distração ou competição podem atrapalhar em alguns contextos.',
      }, {
        min: 25, max: 36, title: 'Barreiras frequentes',
        text: 'A conversa pode estar virando defesa, esquiva ou disputa com regularidade.',
      }],
    }, {
      id: 'repertorio-escuta',
      title: 'Parte 2 · Repertório de escuta',
      questionIds: listeningRepertoire.map((_, index) => `escuta-${index + 13}`),
      min: 0,
      max: 36,
      sourcePages: [13, 16],
      bands: [{
        min: 0, max: 12, title: 'Em construção',
        text: 'Você pode estar presente sem necessariamente produzir acolhimento percebido.',
      }, {
        min: 13, max: 24, title: 'Presente, mas oscilante',
        text: 'Há recursos de escuta, mas eles podem cair sob tensão ou distração.',
      }, {
        min: 25, max: 36, title: 'Mais consistente',
        text: 'Os comportamentos de atenção, compreensão e reparo aparecem com maior frequência.',
      }],
    }],
  },
  questions: [
    ...listeningBarriers.map((prompt, index) => ({
      id: `escuta-${index + 1}`,
      kind: 'frequency' as const,
      theme: 'Parte 1 · Barreiras à escuta',
      prompt,
      help: 'Pense nas últimas quatro semanas. Marque uma frequência.',
      options: frequencyOptions(),
    })),
    ...listeningRepertoire.map((prompt, index) => ({
      id: `escuta-${index + 13}`,
      kind: 'frequency' as const,
      theme: 'Parte 2 · Repertório de escuta',
      prompt,
      help: 'Use a mesma escala de frequência. Esta parte é somada separadamente.',
      options: frequencyOptions(),
    })),
  ],
}];

export const editorialQuizForArticle = (articleSlug: string) => editorialQuizzes.find(quiz => quiz.articleSlug === articleSlug);
