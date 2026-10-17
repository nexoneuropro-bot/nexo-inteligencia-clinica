export type BusinessServiceId =
  | 'recrutamento-e-selecao'
  | 'treinamento-e-desenvolvimento'
  | 'avaliacao-psicologica-organizacional'
  | 'desenvolvimento-de-liderancas'
  | 'clima-e-organizacao'
  | 'riscos-psicossociais-nr1';

export interface BusinessService {
  id: BusinessServiceId;
  label: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  demand: string;
  steps: { title: string; text: string }[];
  deliverables: string;
  scope: string;
  href: string;
  linkLabel: string;
}

/** Public, indexable explanations. Instruments and methods depend on the agreed purpose. */
export const businessServices: BusinessService[] = [
  {
    id: 'recrutamento-e-selecao',
    label: 'Recrutamento e seleção',
    shortLabel: 'Selecionar',
    eyebrow: 'DECISÕES DE CONTRATAÇÃO',
    title: 'Conhecer a função. Investigar competências.',
    description: 'O recrutamento e a seleção aproximam as exigências reais do trabalho das experiências e competências de cada pessoa. A Psicologia contribui com critérios claros, entrevistas e procedimentos pertinentes à finalidade da seleção.',
    demand: 'Uma empresa precisa contratar para uma função de atendimento e quer avaliar como os candidatos lidam com demandas simultâneas, comunicação e resolução de problemas.',
    steps: [
      { title: 'Definir o perfil', text: 'Compreender as atividades, as condições de trabalho e as competências necessárias, com critérios relacionados à função e sem discriminação.' },
      { title: 'Investigar com método', text: 'Conduzir entrevistas por competências e outros procedimentos pertinentes. A avaliação psicológica pode integrar o processo quando houver uma finalidade definida e justificativa técnica.' },
      { title: 'Subsidiar a decisão', text: 'Organizar uma devolutiva e a documentação adequada ao serviço realizado, com informações relevantes para a contratação e respeito ao sigilo profissional.' },
    ],
    deliverables: 'Perfil de competências, critérios de seleção, síntese técnica do processo e devolutivas, conforme o escopo contratado. Quando houver avaliação psicológica, os resultados podem ser comunicados em laudo psicológico, conforme a finalidade e as normas aplicáveis.',
    scope: 'A decisão considera o conjunto das evidências e as condições da função. Conclusões, recomendações e limites são discutidos na devolutiva.',
    href: '/recrutamento-e-selecao/',
    linkLabel: 'Entenda o recrutamento e a seleção',
  },
  {
    id: 'treinamento-e-desenvolvimento',
    label: 'Treinamento e desenvolvimento',
    shortLabel: 'Desenvolver',
    eyebrow: 'APRENDIZAGEM NO TRABALHO',
    title: 'Aprender algo que faça diferença na prática.',
    description: 'O treinamento e desenvolvimento de pessoas começa pela pergunta: o que precisa mudar no trabalho? Com objetivos observáveis, prática e acompanhamento, a aprendizagem pode se conectar às demandas das equipes e da organização.',
    demand: 'Uma equipe participou de palestras sobre comunicação, mas as passagens de informação continuam gerando retrabalho. É preciso entender o contexto e praticar novas formas de comunicar.',
    steps: [
      { title: 'Levantar necessidades', text: 'Investigar demandas, atividades, recursos disponíveis e obstáculos. Diferenciar necessidades de aprendizagem de problemas nas condições e na organização do trabalho.' },
      { title: 'Construir a aprendizagem', text: 'Definir objetivos observáveis e propor atividades, simulações e práticas coerentes com o trabalho real, com orientações e feedback.' },
      { title: 'Acompanhar a aplicação', text: 'Avaliar a aprendizagem e sua aplicação no cotidiano, combinar indicadores proporcionais e revisar o percurso com participantes e responsáveis.' },
    ],
    deliverables: 'Levantamento de necessidades, plano de treinamento, oficinas e materiais educativos, critérios de acompanhamento e síntese dos resultados do projeto.',
    scope: 'Treinamentos não substituem mudanças necessárias em carga de trabalho, recursos, processos ou condições de segurança. O desenho do projeto considera essas relações.',
    href: '/treinamento-e-desenvolvimento/',
    linkLabel: 'Conheça o treinamento e desenvolvimento',
  },
  {
    id: 'avaliacao-psicologica-organizacional',
    label: 'Avaliação psicológica no trabalho',
    shortLabel: 'Avaliar',
    eyebrow: 'AVALIAÇÃO COM FINALIDADE DEFINIDA',
    title: 'Uma pergunta de trabalho. Uma investigação responsável.',
    description: 'A avaliação psicológica no contexto organizacional é um processo estruturado para investigar questões psicológicas relacionadas a uma demanda específica. Ela reúne e integra informações; não se resume à aplicação de um teste.',
    demand: 'Uma seleção ou outro projeto organizacional exige compreender aspectos psicológicos relevantes para uma função, com critérios técnicos e uma finalidade previamente esclarecida.',
    steps: [
      { title: 'Esclarecer a demanda', text: 'Definir a finalidade, as decisões que serão subsidiadas, os participantes e os limites do processo. Esclarecer como as informações serão utilizadas.' },
      { title: 'Integrar informações', text: 'Utilizar entrevistas, observação e procedimentos adequados ao contexto. Testes psicológicos, quando indicados, devem estar favoráveis no SATEPSI e ser apropriados à finalidade e à população avaliada.' },
      { title: 'Devolver e documentar', text: 'Integrar os resultados, oferecer devolutiva e elaborar o documento psicológico cabível, preservando informações que não sejam necessárias à finalidade acordada.' },
    ],
    deliverables: 'Devolutiva e laudo psicológico quando decorrentes de avaliação psicológica, conforme a finalidade e as normas profissionais. O documento resulta do processo realizado; não é um relatório genérico de aprovação.',
    scope: 'Finalidade, direitos da pessoa avaliada, acesso aos resultados e limites dos métodos são esclarecidos no planejamento e na devolutiva.',
    href: '/avaliacao-psicologica-organizacional/',
    linkLabel: 'Entenda a avaliação psicológica organizacional',
  },
  {
    id: 'desenvolvimento-de-liderancas',
    label: 'Desenvolvimento de lideranças',
    shortLabel: 'Liderar',
    eyebrow: 'LIDERANÇA NO COTIDIANO',
    title: 'Orientar pessoas também se aprende.',
    description: 'O desenvolvimento de lideranças trabalha práticas de gestão que afetam a vida das equipes: combinar prioridades, oferecer feedback, lidar com conflitos e criar condições para o trabalho acontecer.',
    demand: 'Novas lideranças dominam a parte técnica da função, mas encontram dificuldades para delegar, orientar a equipe e conversar sobre problemas de desempenho.',
    steps: [
      { title: 'Conhecer os desafios', text: 'Compreender as situações de gestão, as responsabilidades e as condições em que a liderança atua, com objetivos construídos para o contexto.' },
      { title: 'Praticar repertórios', text: 'Trabalhar situações concretas de comunicação, feedback, delegação e manejo de conflitos, com prática orientada e análise das consequências.' },
      { title: 'Rever os efeitos', text: 'Acompanhar acordos e mudanças observáveis, escutar a experiência da equipe e ajustar práticas e condições de gestão.' },
    ],
    deliverables: 'Percurso de desenvolvimento, oficinas e acompanhamento de práticas de liderança, com critérios de avaliação definidos para o projeto.',
    scope: 'O trabalho considera a relação entre liderança, equipe e organização. Não atribui a uma única pessoa todos os problemas da gestão nem transforma demandas organizacionais em atendimento clínico.',
    href: '/contato/',
    linkLabel: 'Conversar sobre desenvolvimento de lideranças',
  },
  {
    id: 'clima-e-organizacao',
    label: 'Clima e organização do trabalho',
    shortLabel: 'Compreender',
    eyebrow: 'ESCUTA QUE ORIENTA MUDANÇAS',
    title: 'Escutar a equipe. Compreender as condições.',
    description: 'A Psicologia Organizacional e do Trabalho contribui para compreender relações, processos, comunicação e condições que atravessam a experiência das equipes. A investigação pode apoiar a integração de pessoas, a cooperação e projetos de mudança organizacional.',
    demand: 'Há conflitos recorrentes entre setores, dificuldade de integração de novos profissionais ou percepção de pouca clareza nas decisões. A empresa precisa investigar o contexto antes de escolher uma intervenção.',
    steps: [
      { title: 'Planejar a escuta', text: 'Definir perguntas, participantes, métodos e condições de participação. Esclarecer os limites da confidencialidade e da apresentação dos resultados.' },
      { title: 'Analisar o contexto', text: 'Integrar entrevistas, observações e levantamentos pertinentes. Apresentar resultados agregados, com atenção ao risco de identificação em equipes pequenas.' },
      { title: 'Construir prioridades', text: 'Devolver os achados à organização e aos participantes de forma adequada, estabelecer ações possíveis e acompanhar as mudanças acordadas.' },
    ],
    deliverables: 'Diagnóstico organizacional conforme o escopo, devolutiva de resultados agregados, recomendações e plano de acompanhamento. Pode apoiar integração, comunicação e gestão de mudanças.',
    scope: 'A apresentação dos dados e os acessos combinados preservam a participação dos trabalhadores, inclusive em equipes pequenas. Pesquisa de clima e avaliação de riscos psicossociais têm finalidades próprias.',
    href: '/contato/',
    linkLabel: 'Conversar sobre clima e organização do trabalho',
  },
  {
    id: 'riscos-psicossociais-nr1',
    label: 'Riscos psicossociais e NR-1',
    shortLabel: 'Prevenir',
    eyebrow: 'PREVENÇÃO E ORGANIZAÇÃO DO TRABALHO',
    title: 'Reconhecer fatores de risco. Orientar a prevenção.',
    description: 'A avaliação de fatores de risco psicossociais relacionados ao trabalho investiga condições como exigências, autonomia, apoio e organização das atividades. Sua contribuição é subsidiar a prevenção e a gestão de riscos ocupacionais, em articulação com os responsáveis pela Segurança e Saúde no Trabalho.',
    demand: 'A organização quer compreender fatores de risco psicossociais no contexto do GRO/PGR e precisa transformar a investigação das condições de trabalho em prioridades de ação.',
    steps: [
      { title: 'Compreender o trabalho real', text: 'Investigar atividades, condições e formas de organização, considerando a participação dos trabalhadores e as particularidades de cada contexto.' },
      { title: 'Avaliar e priorizar', text: 'Integrar informações e apoiar a avaliação dos fatores de risco e a definição de prioridades, conforme o escopo e em articulação com os responsáveis pelo GRO/PGR.' },
      { title: 'Agir e acompanhar', text: 'Contribuir para medidas de prevenção, responsabilidades e acompanhamento das mudanças, com foco nas condições de trabalho que precisam ser transformadas.' },
    ],
    deliverables: 'Subsídios técnicos para a identificação e avaliação de fatores de risco psicossociais, recomendações e acompanhamento de ações, conforme as competências profissionais e o escopo contratado.',
    scope: 'Avaliar riscos do trabalho é diferente de diagnosticar transtornos nas pessoas. O projeto não se resume a aplicar um questionário nem garante, isoladamente, a conformidade da empresa com a NR-1.',
    href: '/riscos-psicossociais-nr1/',
    linkLabel: 'Aprofunde a NR-1 e os riscos psicossociais',
  },
];
