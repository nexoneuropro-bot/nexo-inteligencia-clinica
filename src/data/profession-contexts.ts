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
    title: 'Como você pensa, sente e vive.',
    summary:
      'A avaliação neuropsicológica investiga como atenção, memória e outras funções cognitivas se relacionam com emoções, comportamento e vida cotidiana. Entrevistas, observações e instrumentos adequados à demanda são interpretados em conjunto, à luz da história e do contexto da pessoa.',
    points: [
      'Compreender recursos e dificuldades.',
      'Relacionar os achados à vida cotidiana.',
      'Integrar informações, além de uma pontuação isolada.',
    ],
    question: 'O que uma dificuldade significa na sua história?',
    link: { label: 'Conhecer a avaliação neuropsicológica', href: '/avaliacao-neuropsicologica/' },
    sourceTitle: 'CFP · Manual Neuropsicologia: Ciência e Profissão',
    sourceUrl: 'https://site.cfp.org.br/wp-content/uploads/2023/09/Neuropsicologia_manual-4.pdf',
  },
  {
    id: 'psychiatry',
    label: 'Psiquiatria',
    eyebrow: 'Acrescentar o olhar médico',
    title: 'Outra pergunta pode ampliar o cuidado.',
    summary:
      'A Psiquiatria pode acrescentar uma avaliação médica à compreensão do sofrimento e das mudanças no funcionamento. Quando há indicação, o encontro considera a história de saúde, os sintomas e as possibilidades de cuidado, discutidas com a pessoa atendida.',
    points: [
      'Avaliação conforme a necessidade individual.',
      'Integração proposta quando indicada, sem etapa obrigatória.',
      'Prescrição considerada conforme avaliação, nunca presumida.',
    ],
    question: 'Quando um olhar médico pode contribuir?',
    link: { label: 'Entender a interface com Psiquiatria', href: '/integracao-psiquiatrica/' },
    sourceTitle: 'ABP · Programas de Formação',
    sourceUrl: 'https://www.abp.org.br/programas-de-formacao',
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
