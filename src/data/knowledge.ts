/**
 * Constelação editorial: posições e conexões são recursos narrativos.
 * Não representam uma genealogia de influências nem uma cronologia universal.
 * As perguntas em `connection` são autorais, sem atribuição aos pensadores.
 * Referências e critérios: docs/REFERENCIAS-EXPERIENCIA.md.
 */
export type KnowledgeNode = {
  id: string;
  era: string;
  yearLabel: string;
  name: string;
  discipline: string;
  summary: string;
  connection: string;
  sourceTitle: string;
  sourceUrl: string;
  quote?: {
    /** Texto literal da fonte consultada; nem sempre no idioma do autor. */
    original: string;
    /** Tradução livre própria, identificada como tal na interface. */
    translation: string;
    attribution: string;
    sourceTitle: string;
    sourceUrl: string;
  };
  position: { x: number; y: number };
  group: 'filosofia' | 'matematica' | 'psicologia' | 'sociedade' | 'cognicao';
};

export const knowledgeNodes: KnowledgeNode[] = [
  {
    id: 'socrates',
    era: 'Grécia antiga · tradição socrática',
    yearLabel: 'Século V a.C.',
    name: 'Sócrates',
    discipline: 'Filosofia · a pergunta',
    summary: 'Na Apologia de Platão, Sócrates examina as afirmações de quem acredita saber. O personagem reconhece limites no próprio conhecimento e insiste no exercício da investigação.',
    connection: 'Que pergunta você ainda não fez sobre aquilo que considera certo?',
    sourceTitle: 'Platão · Apologia — Internet Classics Archive, MIT',
    sourceUrl: 'https://classics.mit.edu/Plato/apology.html',
    position: { x: 18, y: 20 },
    group: 'filosofia',
  },
  {
    id: 'aristoteles',
    era: 'Grécia antiga · filosofia da natureza',
    yearLabel: 'Século IV a.C.',
    name: 'Aristóteles',
    discipline: 'Filosofia · memória',
    summary: 'Em Sobre a memória e a reminiscência, Aristóteles distingue lembrar de buscar uma lembrança. Trata-se de uma formulação filosófica antiga, situada em uma concepção de natureza de seu tempo.',
    connection: 'O que muda entre uma lembrança que surge e outra que você procura?',
    sourceTitle: 'Aristóteles · On Memory and Reminiscence — MIT',
    sourceUrl: 'https://classics.mit.edu/Aristotle/memory.html',
    quote: {
      original: 'ALL men by nature desire to know.',
      translation: 'Todos os seres humanos, por natureza, desejam conhecer.',
      attribution: 'Aristóteles · Metafísica, livro I, parte 1',
      sourceTitle: 'Metaphysics · tradução inglesa de W. D. Ross — MIT',
      sourceUrl: 'https://classics.mit.edu/Aristotle/metaphysics.1.i.html',
    },
    position: { x: 46, y: 20 },
    group: 'filosofia',
  },
  {
    id: 'al-khwarizmi',
    era: 'Mundo islâmico medieval · matemática em árabe',
    yearLabel: 'Século IX',
    name: 'Al-Khwarizmi',
    discipline: 'Matemática · o desconhecido',
    summary: 'Al-Khwarizmi contribuiu para o desenvolvimento da álgebra no mundo islâmico medieval. Seus métodos se relacionavam também a necessidades práticas de comércio, direito e engenharia.',
    connection: 'Como dar forma a uma questão quando parte da resposta ainda é desconhecida?',
    sourceTitle: 'Science & Islam · Mathematics — History of Science Museum, Oxford',
    sourceUrl: 'https://www.mhs.ox.ac.uk/scienceislam/mathematics.html',
    position: { x: 78, y: 23 },
    group: 'matematica',
  },
  {
    id: 'wundt',
    era: 'Alemanha · psicologia experimental',
    yearLabel: '1879',
    name: 'Wilhelm Wundt',
    discipline: 'Psicologia · investigar',
    summary: 'Em Leipzig, o trabalho experimental organizado por Wundt ganhou um marco institucional em 1879. Estudantes passaram a investigar processos psicológicos com aparelhos e procedimentos de laboratório.',
    connection: 'O que uma observação cuidadosa pode revelar além da primeira impressão?',
    sourceTitle: 'Arquivo Wundt · a formação do instituto — Universidade de Leipzig',
    sourceUrl: 'https://home.uni-leipzig.de/wundtbriefe/wwcd/chapters/wundt.htm',
    position: { x: 19, y: 44 },
    group: 'psicologia',
  },
  {
    id: 'pavlov-skinner',
    era: 'Século XX · programas distintos de pesquisa',
    yearLabel: '1904 · 1953',
    name: 'Pavlov · Skinner',
    discipline: 'Psicologia · aprendizagem',
    summary: 'Pavlov investigou reflexos condicionados e relações entre estímulos e respostas. Skinner estudou o comportamento operante e suas relações com as consequências das ações.',
    connection: 'Quais relações entre situações, ações e consequências despertam sua curiosidade?',
    sourceTitle: 'Skinner · Science and Human Behavior, capítulos IV e V — B. F. Skinner Foundation',
    sourceUrl: 'https://www.bfskinner.org/wp-content/uploads/2014/02/ScienceHumanBehavior.pdf',
    position: { x: 49, y: 38 },
    group: 'psicologia',
  },
  {
    id: 'piaget-vygotsky',
    era: 'Século XX · debates sobre desenvolvimento',
    yearLabel: 'Década de 1930',
    name: 'Piaget · Vygotsky',
    discipline: 'Psicologia · linguagem',
    summary: 'Piaget e Vygotsky formularam interpretações diferentes sobre a fala infantil dirigida a si mesmo. Em Pensamento e linguagem, Vygotsky discute a proposta de Piaget e relaciona essa fala à formação da fala interior.',
    connection: 'Como as palavras participam da maneira como você organiza uma tarefa?',
    sourceTitle: 'Vygotsky · Thinking and Speech, capítulo 7 — arquivo digital da obra',
    sourceUrl: 'https://www.marxists.org/archive/vygotsky/works/words/ch07.htm',
    position: { x: 81, y: 45 },
    group: 'psicologia',
  },
  {
    id: 'durkheim',
    era: 'França · constituição da sociologia',
    yearLabel: '1895',
    name: 'Émile Durkheim',
    discipline: 'Sociedade · contextos',
    summary: 'Em As regras do método sociológico, Durkheim propõe estudar os fatos sociais como um objeto próprio de investigação. Normas e práticas coletivas entram em cena, além das explicações centradas no indivíduo.',
    connection: 'O que em sua rotina também pertence à história dos grupos dos quais participa?',
    sourceTitle: 'Durkheim · Les règles de la méthode sociologique — Les Classiques des sciences sociales',
    sourceUrl: 'https://classiques.uqam.ca/classiques/Durkheim_emile/regles_methode/regles_methode_tdm.html',
    position: { x: 21, y: 67 },
    group: 'sociedade',
  },
  {
    id: 'arendt',
    era: 'Século XX · pensamento político',
    yearLabel: 'Século XX',
    name: 'Hannah Arendt',
    discipline: 'Pensamento político · pluralidade',
    summary: 'Hannah Arendt investigou a ação, a vida pública e a pluralidade humana. Em sua reflexão política, compartilhar um mundo envolve a presença de pessoas diferentes.',
    connection: 'O que passa a ser visível quando você escuta uma perspectiva diferente da sua?',
    sourceTitle: 'World of Hannah Arendt · Hannah Arendt Papers — Library of Congress',
    sourceUrl: 'https://www.loc.gov/collections/hannah-arendt-papers/articles-and-essays/world-of-hannah-arendt/',
    quote: {
      original: 'Nein, ich will verstehen.',
      translation: 'Não, eu quero compreender.',
      attribution: 'Hannah Arendt · entrevista a Günter Gaus, 1964',
      sourceTitle: 'Zur Person · entrevista de 28/10/1964 — arquivo da rbb',
      sourceUrl: 'https://www.rbb-online.de/zurperson/interview_archiv/arendt_hannah.html',
    },
    position: { x: 46, y: 74 },
    group: 'sociedade',
  },
  {
    id: 'foucault',
    era: 'França · história dos sistemas de pensamento',
    yearLabel: '1970–1984',
    name: 'Michel Foucault',
    discipline: 'Filosofia · saber e instituições',
    summary: 'No Collège de France, Foucault investigou relações entre saberes, discursos e relações de poder. Seu trabalho examina historicamente instituições e modos de conduzir comportamentos.',
    connection: 'Quais regras do seu ambiente se tornam perceptíveis quando você muda o ponto de vista?',
    sourceTitle: 'Histoire des systèmes de pensée · Michel Foucault — Collège de France',
    sourceUrl: 'https://www.college-de-france.fr/fr/chaire/michel-foucault-histoire-des-systemes-de-pensee-chaire-statutaire',
    position: { x: 77, y: 69 },
    group: 'sociedade',
  },
  {
    id: 'cognicao',
    era: 'Ciência contemporânea · processos em relação',
    yearLabel: 'Pesquisa contemporânea',
    name: 'Atenção · memória',
    discipline: 'Cognição · funções executivas',
    summary: 'A memória de trabalho ajuda a manter e usar informações por um curto período. Controle inibitório e flexibilidade cognitiva participam da organização da atenção e da adaptação a mudanças.',
    connection: 'O que você precisa manter em mente quando uma tarefa muda de direção?',
    sourceTitle: 'A Guide to Executive Function — Center on the Developing Child, Harvard',
    sourceUrl: 'https://developingchild.harvard.edu/resource-guides/guide-executive-function/',
    position: { x: 63, y: 56 },
    group: 'cognicao',
  },
];

export type XMeaning = { id: string; title: string; text: string };

export const xMeanings: XMeaning[] = [
  {
    id: 'incognita',
    title: 'Uma incógnita',
    text: 'Na álgebra, x pode representar um valor desconhecido. Aqui, abre espaço para investigar: qual parte da sua história pede uma nova pergunta?',
  },
  {
    id: 'numeral',
    title: 'Um número',
    text: 'Na numeração romana, X representa dez. A mesma forma pode participar de sistemas de escrita e de contagem com sentidos diferentes.',
  },
  {
    id: 'letra',
    title: 'Uma letra',
    text: 'X é uma letra do alfabeto latino. A letra grega chi, Χ, tem forma semelhante na maiúscula, mas é outra letra, de outro alfabeto.',
  },
  {
    id: 'encontro',
    title: 'Um encontro',
    text: 'Na narrativa da NEXO, o X é uma metáfora de interseção e descoberta: corpo, experiência e contexto se encontram. É uma escolha poética desta experiência, sem pretensão de significado universal.',
  },
];
