export type ProfessionContextId = 'neuropsychology' | 'psychiatry' | 'dialogue';

export type ProfessionContext = {
  id: ProfessionContextId;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  points: string[];
  question?: string;
  link: { label: string; href: string };
  sourceTitle: string;
  sourceUrl: string;
};

/** Educational context about the professions; these descriptions do not certify individual credentials. */
export const professionContexts: ProfessionContext[] = [
  {
    id: 'neuropsychology',
    label: 'Neuropsicologia',
    eyebrow: 'Investigar o funcionamento',
    title: 'Atenção, memória e planejamento na vida real.',
    summary:
      'A avaliação neuropsicológica investiga recursos e dificuldades que aparecem ao estudar, trabalhar ou organizar a rotina. Entrevistas, observações e instrumentos são interpretados em conjunto com a história e as condições de vida, para esclarecer a demanda e orientar recomendações.',
    points: [
      'Investigar atenção, memória, planejamento e outras funções conforme a demanda.',
      'Traduzir os achados em orientações para o cotidiano e próximos passos.',
      'Integrar informações sem reduzir a pessoa a uma pontuação.',
    ],
    question: 'Em quais situações uma dificuldade aparece ou diminui?',
    link: { label: 'Conhecer a avaliação neuropsicológica', href: '/avaliacao-neuropsicologica/' },
    sourceTitle: 'CFP · Manual Neuropsicologia: Ciência e Profissão',
    sourceUrl: 'https://site.cfp.org.br/wp-content/uploads/2023/09/Neuropsicologia_manual-4.pdf',
  },
  {
    id: 'psychiatry',
    label: 'Psiquiatria',
    eyebrow: 'Acrescentar o olhar médico',
    title: 'Avaliação médica e opções de tratamento.',
    summary:
      'Quando indicada, a Psiquiatria pode investigar sintomas e condições médicas que participam da demanda e discutir opções de tratamento. Se houver prescrição, o acompanhamento avalia benefícios e efeitos adversos. As decisões consideram a história de saúde e a participação da pessoa atendida.',
    points: [
      'Acrescentar perguntas e investigação próprias da Medicina.',
      'Discutir tratamentos e acompanhar sua evolução conforme a necessidade.',
      'Integrar o cuidado quando indicado, sem prescrição ou etapa obrigatória.',
    ],
    question: 'Quando um olhar médico pode contribuir?',
    link: { label: 'Entender a interface com Psiquiatria', href: '/integracao-psiquiatrica/' },
    sourceTitle: 'American Psychiatric Association · O que é Psiquiatria (em inglês)',
    sourceUrl: 'https://www.psychiatry.org/about-apa--psychiatry',
  },
  {
    id: 'dialogue',
    label: 'Diálogo no cuidado',
    eyebrow: 'Conectar com responsabilidade',
    title: 'Olhares distintos. Uma história que continua sua.',
    summary:
      'Quando o diálogo entre profissionais é pertinente, a integração é conversada com a pessoa atendida e observa consentimento, sigilo e finalidade de cuidado. Cada profissional preserva sua autonomia técnica e responde por sua avaliação, suas condutas e seus documentos.',
    points: [
      'Participação da pessoa nas decisões.',
      'Compartilhamento limitado às informações pertinentes.',
      'Responsabilidades psicológicas e médicas próprias.',
    ],
    question: 'O que precisa ser compreendido em conjunto?',
    link: { label: 'Conhecer os caminhos de cuidado', href: '/para-voce/' },
    sourceTitle: 'CFP · Código de Ética Profissional do Psicólogo',
    sourceUrl:
      'https://site.cfp.org.br/wp-content/uploads/2022/05/WEB_29535_Codigo_de_etica_da_profissao_14.04.pdf',
  },
];
