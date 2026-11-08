/** Phase 1 content: fictional choices only. No clinical instrument is applied here. */
export const consentVersion = 'demo-2026-11-08';

export interface DemoOption {
  readonly id: string;
  readonly label: string;
}

export interface DemoQuestion {
  readonly id: string;
  readonly theme: string;
  readonly title: string;
  readonly intro: string;
  readonly options: readonly (DemoOption & { readonly summary: string })[];
}

const notInformed: DemoOption = Object.freeze({ id: 'not-informed', label: 'Prefiro não informar' });

export const profileFields: readonly {
  readonly id: string;
  readonly label: string;
  readonly options: readonly DemoOption[];
}[] = [
  {
    id: 'nickname', label: 'Nome ou pseudônimo de exemplo',
    options: [notInformed, { id: 'alex', label: 'Alex (personagem de exemplo)' }, { id: 'sam', label: 'Sam (personagem de exemplo)' }, { id: 'dani', label: 'Dani (personagem de exemplo)' }],
  },
  {
    id: 'age', label: 'Faixa etária',
    options: [notInformed, { id: '18-24', label: '18–24 anos' }, { id: '25-34', label: '25–34 anos' }, { id: '35-44', label: '35–44 anos' }, { id: '45-54', label: '45–54 anos' }, { id: '55-plus', label: '55 anos ou mais' }],
  },
  {
    id: 'gender', label: 'Identidade de gênero',
    options: [notInformed, { id: 'woman', label: 'Mulher' }, { id: 'man', label: 'Homem' }, { id: 'non-binary', label: 'Pessoa não binária' }, { id: 'another', label: 'Outra identidade' }],
  },
  {
    id: 'education', label: 'Escolaridade',
    options: [notInformed, { id: 'no-formal-schooling', label: 'Sem escolarização formal' }, { id: 'primary-incomplete', label: 'Ensino fundamental incompleto' }, { id: 'primary-complete', label: 'Ensino fundamental completo' }, { id: 'secondary-incomplete', label: 'Ensino médio incompleto' }, { id: 'secondary-complete', label: 'Ensino médio completo' }, { id: 'higher-incomplete', label: 'Ensino superior incompleto' }, { id: 'higher-complete', label: 'Ensino superior completo' }, { id: 'postgraduate', label: 'Pós-graduação' }],
  },
  {
    id: 'activity', label: 'Trabalho ou estudo no momento',
    options: [notInformed, { id: 'work', label: 'Trabalho' }, { id: 'study', label: 'Estudo' }, { id: 'work-study', label: 'Trabalho e estudo' }, { id: 'seeking-work', label: 'Estou procurando trabalho' }, { id: 'unpaid-care', label: 'Trabalho doméstico ou de cuidado não remunerado' }, { id: 'retirement', label: 'Aposentadoria ou benefício' }, { id: 'another', label: 'Outra situação' }],
  },
  {
    id: 'region', label: 'Região aproximada',
    options: [notInformed, { id: 'north', label: 'Norte' }, { id: 'northeast', label: 'Nordeste' }, { id: 'midwest', label: 'Centro-Oeste' }, { id: 'southeast', label: 'Sudeste' }, { id: 'south', label: 'Sul' }, { id: 'outside-brazil', label: 'Fora do Brasil' }],
  },
];

export const placeOptions: readonly DemoOption[] = [
  { id: 'home', label: 'Em casa' },
  { id: 'work', label: 'No trabalho ou estudo' },
  { id: 'shared', label: 'Em um lugar público ou compartilhado' },
  { id: 'other', label: 'Em outro lugar' },
  notInformed,
];

export const privacyOptions: readonly DemoOption[] = [
  { id: 'yes', label: 'Sim, tenho privacidade' },
  { id: 'partial', label: 'Mais ou menos' },
  { id: 'no', label: 'Não agora' },
];

export const questions: readonly DemoQuestion[] = [
  {
    id: 'situacao', theme: 'O que merece espaço',
    title: 'O que você gostaria de trazer para a conversa?',
    intro: 'Você pode escolher uma possibilidade ou deixar esta pergunta para depois.',
    options: [
      { id: 'rotina', label: 'Organização da rotina e dos compromissos.', summary: 'A organização da rotina e dos compromissos foi escolhida como tema para a conversa.' },
      { id: 'mudancas', label: 'Uma mudança recente no meu cotidiano.', summary: 'Uma mudança recente no cotidiano foi escolhida como tema para a conversa.' },
      { id: 'relacoes', label: 'Combinados e relações com outras pessoas.', summary: 'Os combinados e as relações com outras pessoas foram escolhidos como tema para a conversa.' },
      { id: 'explorar', label: 'Ainda estou tentando encontrar por onde começar.', summary: 'A pessoa do exemplo gostaria de encontrar, com apoio, um ponto de partida para a conversa.' },
    ],
  },
  {
    id: 'contexto', theme: 'O contexto da situação',
    title: 'Em que situações isso costuma aparecer?',
    intro: 'Pensar em um momento concreto pode ajudar a organizar o relato.',
    options: [
      { id: 'muitas-demandas', label: 'Quando várias demandas chegam ao mesmo tempo.', summary: 'Na situação escolhida, várias demandas chegam ao mesmo tempo.' },
      { id: 'orientacoes', label: 'Quando preciso de uma orientação mais clara.', summary: 'Na situação escolhida, a pessoa precisa esclarecer uma orientação.' },
      { id: 'combinados', label: 'Quando um combinado precisa ser revisto.', summary: 'Na situação escolhida, há um combinado que precisa ser revisto.' },
      { id: 'sem-padrao', label: 'Ainda não percebi um momento que se repete.', summary: 'A pessoa do exemplo ainda não identificou um momento que se repete.' },
    ],
  },
  {
    id: 'resposta', theme: 'Seu jeito de lidar',
    title: 'O que você costuma fazer quando isso acontece?',
    intro: 'Há diferentes maneiras de lidar com uma situação. Aqui não há resposta certa.',
    options: [
      { id: 'primeiro-passo', label: 'Escolho uma parte menor para começar.', summary: 'No exemplo, a pessoa escolhe uma parte menor para começar.' },
      { id: 'pedir-apoio', label: 'Procuro alguém para conversar ou pedir apoio.', summary: 'No exemplo, a pessoa procura alguém para conversar ou pedir apoio.' },
      { id: 'pausa', label: 'Faço uma pausa antes de decidir como continuar.', summary: 'No exemplo, a pessoa faz uma pausa antes de decidir como continuar.' },
      { id: 'outra-atividade', label: 'Vou para outra atividade e deixo o assunto para depois.', summary: 'No exemplo, a pessoa passa a outra atividade e deixa o assunto para depois.' },
    ],
  },
  {
    id: 'proximo-encontro', theme: 'O que vem depois',
    title: 'O que você percebe depois e gostaria de compreender melhor?',
    intro: 'Escolha uma possibilidade para explorar na conversa, sem precisar chegar a uma conclusão.',
    options: [
      { id: 'retomar', label: 'Algumas tarefas ficam para depois; quero compreender como retomar.', summary: 'A pessoa do exemplo relata que algumas tarefas ficam para depois e quer compreender como retomá-las.' },
      { id: 'rever-combinados', label: 'Preciso rever combinados; quero conversar sobre como fazer isso.', summary: 'A prioridade escolhida é conversar sobre como rever combinados.' },
      { id: 'condicoes', label: 'Às vezes consigo continuar; quero entender o que ajuda nesses momentos.', summary: 'A prioridade escolhida é compreender as condições que ajudam a continuar uma atividade.' },
      { id: 'explorar', label: 'Ainda não sei; gostaria de explorar a situação com calma.', summary: 'A pessoa do exemplo prefere explorar a situação com calma, sem uma conclusão pronta.' },
    ],
  },
];

// Keep the fictional dictionary closed even when the module is used at runtime.
for (const field of profileFields) {
  field.options.forEach(option => Object.freeze(option));
  Object.freeze(field.options);
  Object.freeze(field);
}
for (const question of questions) {
  question.options.forEach(option => Object.freeze(option));
  Object.freeze(question.options);
  Object.freeze(question);
}
for (const list of [placeOptions, privacyOptions]) {
  list.forEach(option => Object.freeze(option));
  Object.freeze(list);
}
Object.freeze(profileFields);
Object.freeze(questions);
