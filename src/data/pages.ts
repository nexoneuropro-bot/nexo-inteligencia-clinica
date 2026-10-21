export type ContentSection = {
  title: string;
  body: string[];
  items?: string[];
};

export type ContentPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: ContentSection[];
  ctaLabel: string;
  ctaType: 'personal' | 'business';
};

/** Institutional drafts based on the supplied brief. Clinical, professional and legal review is pending. */
export const pages: ContentPage[] = [
  {
    slug: 'para-voce',
    title: 'Sua história merece ser compreendida.',
    description: 'Conheça a psicoterapia em Análise do Comportamento, a avaliação neuropsicológica e a interface com Psiquiatria quando indicada na NEXO.',
    eyebrow: 'Para você',
    intro: 'Quer fazer terapia, compreender dificuldades de atenção e memória ou ainda não sabe por onde começar? Você pode esclarecer dúvidas sobre os atendimentos antes de escolher um caminho.',
    sections: [
      {
        title: 'Começar pela sua pergunta.',
        body: [
          'Cada pessoa chega com uma história, um contexto e uma necessidade. O acolhimento ajuda a compreender a demanda e a conversar sobre os caminhos possíveis, sem antecipar conclusões.',
          'Na psicoterapia em Análise do Comportamento, investigamos relações entre sua história, as situações que vive, o que faz, pensa e sente e as consequências no cotidiano. Você participa das decisões e pode esclarecer suas dúvidas ao longo do processo.',
        ],
      },
      {
        title: 'Caminhos de cuidado.',
        body: ['O autoconhecimento pode ser o ponto de partida. No acolhimento, conversamos sobre o que você deseja compreender; conforme a demanda, podem ser indicados rastreios, uma avaliação mais ampla ou acompanhamento. Esses caminhos não formam uma sequência obrigatória.'],
        items: [
          'Autoconhecimento: reconhecer padrões, emoções e relações que atravessam a vida cotidiana.',
          'Rastreios, quando indicados: reconhecer sinais e orientar a busca por apoio; não substituem uma avaliação completa nem estabelecem diagnóstico por si só.',
          'Psicoterapia breve em Análise do Comportamento: compreender padrões em contexto e trabalhar objetivos combinados no acompanhamento.',
          'Avaliação neuropsicológica: investigação planejada da demanda, integração dos resultados e devolutiva.',
          'Interface com Psiquiatria: avaliação médica quando houver indicação e concordância sobre a integração do cuidado.',
        ],
      },
      {
        title: 'Uma conversa inicial, com cuidado.',
        body: [
          'Você não precisa saber qual atendimento procurar nem chegar com uma explicação pronta. No primeiro contato, pode pedir informações sobre a proposta, as modalidades, a disponibilidade e as condições antes de decidir como seguir.',
          'A conversa para obter informações não substitui atendimento ou avaliação profissional. Para começar, basta dizer sobre qual caminho tem dúvidas; preserve documentos, diagnósticos, medicações e outros dados de saúde para um canal de acolhimento adequadamente combinado.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre minha dúvida',
    ctaType: 'personal',
  },
  {
    slug: 'psicoterapia',
    title: 'Psicoterapia em Análise do Comportamento.',
    description: 'Entenda a psicoterapia em Análise do Comportamento na NEXO: padrões no cotidiano, objetivos de cuidado e organização breve quando indicada.',
    eyebrow: 'Psicoterapia e terapia breve',
    intro: 'A proposta da NEXO parte da Análise do Comportamento: compreender sua história, reconhecer padrões no cotidiano e construir objetivos de cuidado com você.',
    sections: [
      {
        title: 'Compreender o que acontece em contexto.',
        body: [
          'A Análise do Comportamento busca compreender relações entre o que você faz, as situações em que isso acontece e suas consequências. Pensamentos, emoções e história de aprendizagem também fazem parte dessa compreensão.',
          'No acompanhamento, observamos situações concretas: o que aconteceu antes, como você reagiu e o que veio depois, a curto e a longo prazo. Essa investigação ajuda a construir hipóteses sobre padrões e possibilidades de mudança, sem concluir a partir de um episódio isolado.',
          'Os objetivos de cuidado são combinados com você e revistos ao longo do processo. As mudanças são acompanhadas em relação às dificuldades e às condições reais da sua vida.',
        ],
      },
      {
        title: 'Do autoconhecimento à investigação da demanda.',
        body: [
          'Você pode chegar com vontade de se conhecer melhor, com uma dificuldade específica ou com perguntas sobre seu funcionamento. O acolhimento ajuda a definir o que precisa ser compreendido e qual caminho faz sentido.',
          'Quando indicados no acompanhamento, rastreios ajudam a identificar sinais e orientar a busca por apoio. A leitura dos resultados é discutida com o profissional; eles não estabelecem diagnóstico por si só nem substituem uma avaliação psicológica ou neuropsicológica completa.',
          'A escolha dos instrumentos considera a finalidade, o contexto e as condições de uso aplicáveis. A devolutiva pode orientar o acompanhamento, uma avaliação mais ampla ou encaminhamentos, conforme a demanda.',
        ],
      },
      {
        title: 'Como a psicoterapia pode ser breve?',
        body: [
          'Breve é uma forma de organizar a psicoterapia em torno de um foco delimitado, com objetivos e planejamento conversados. A abordagem continua sendo a Análise do Comportamento; o formato é considerado conforme a avaliação da demanda.',
          'Em situações compatíveis com a avaliação individual, podem ser propostos ciclos aproximados de 10 a 20 sessões, com revisão dos objetivos e das necessidades de acompanhamento.',
          'Esse intervalo é uma referência de planejamento. A duração depende da demanda, da avaliação e da evolução do acompanhamento; não representa promessa de resultado nem pacote obrigatório.',
        ],
      },
      {
        title: 'O primeiro contato.',
        body: [
          'Você pode pedir informações sobre a proposta de atendimento, modalidades e disponibilidade. No acolhimento, será possível compreender melhor a demanda e alinhar expectativas sobre o processo.',
          'Quando houver necessidade de outro olhar profissional, os encaminhamentos e uma eventual integração serão discutidos com respeito ao consentimento, ao sigilo e à autonomia técnica.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre psicoterapia',
    ctaType: 'personal',
  },
  {
    slug: 'avaliacao-neuropsicologica',
    title: 'Investigar com método. Compreender em contexto.',
    description: 'Entenda como a avaliação neuropsicológica investiga atenção, memória e planejamento, integrando história, contexto, devolutiva e recomendações.',
    eyebrow: 'Avaliação neuropsicológica',
    intro: 'Atenção, memória e planejamento fazem parte de estudar, trabalhar e organizar a rotina. A avaliação neuropsicológica investiga recursos e dificuldades, integrando a pergunta clínica, a história e o contexto de cada pessoa.',
    sections: [
      {
        title: 'O que esse olhar acrescenta?',
        body: [
          'O conhecimento em Neuropsicologia permite investigar relações entre funções cognitivas, comportamento e condições de saúde. Entrevistas, observações e instrumentos são selecionados e interpretados em conjunto, conforme a demanda.',
          'Na devolutiva, os achados podem orientar recomendações para o cotidiano e próximos passos de cuidado. A avaliação busca esclarecer perguntas; um teste isolado não explica toda dificuldade, e o processo não garante um diagnóstico específico.',
        ],
      },
      {
        title: 'Um percurso construído para a demanda.',
        body: ['O planejamento considera a necessidade clínica de cada pessoa. A bateria de instrumentos não é igual para todos.'],
        items: [
          'Acolhimento e anamnese: conhecer a história e a razão da busca.',
          'Investigação da demanda: delimitar as perguntas que orientarão o processo.',
          'Planejamento: selecionar procedimentos e instrumentos pertinentes.',
          'Aplicação dos instrumentos indicados: reunir informações de forma responsável.',
          'Integração dos resultados: relacionar os achados ao contexto individual.',
          'Documentação: elaborar laudo psicológico de avaliação neuropsicológica quando cabível.',
          'Devolutiva: conversar sobre os resultados e as orientações.',
        ],
      },
      {
        title: 'Instrumentos a serviço da compreensão.',
        body: [
          'A escolha dos instrumentos deve respeitar as normas do Conselho Federal de Psicologia, as exigências aplicáveis do SATEPSI e as boas práticas de avaliação psicológica.',
          'Os resultados são considerados em conjunto. Uma pontuação ou uma característica isolada não resume uma pessoa, e a avaliação não implica promessa de uma conclusão diagnóstica específica.',
        ],
      },
      {
        title: 'Documentos e próximos passos.',
        body: [
          'O laudo psicológico, quando cabível, é um documento de responsabilidade do profissional de Psicologia. A devolutiva permite compreender os achados e discutir orientações pertinentes à demanda.',
          'Uma avaliação médica psiquiátrica pode ser indicada em algumas situações. Ela não é obrigatória para todos, e os documentos psicológicos e médicos mantêm suas finalidades e responsabilidades próprias.',
          'Não há garantia de benefícios jurídicos, previdenciários ou acadêmicos. O objetivo e os limites do processo serão esclarecidos antes de seu início.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre avaliação neuropsicológica',
    ctaType: 'personal',
  },
  {
    slug: 'integracao-psiquiatrica',
    title: 'Olhares que podem se complementar.',
    description: 'Saiba quando a avaliação psiquiátrica pode contribuir para o cuidado: investigação médica, opções de tratamento e integração com consentimento.',
    eyebrow: 'Interface com Psiquiatria',
    intro: 'A Psiquiatria acrescenta a avaliação médica às perguntas sobre saúde mental e funcionamento. Quando indicada, pode ampliar a investigação e discutir possibilidades de tratamento, em diálogo com a pessoa atendida.',
    sections: [
      {
        title: 'Qual é a contribuição da avaliação médica?',
        body: [
          'A consulta pode investigar a história de saúde, sintomas, mudanças no funcionamento e condições médicas que participem da demanda. As opções de cuidado são discutidas conforme a avaliação individual.',
          'Quando medicamentos são indicados, o acompanhamento médico permite avaliar benefícios, efeitos adversos e necessidade de ajustes. A consulta não pressupõe prescrição, e a decisão é considerada com a pessoa atendida.',
        ],
      },
      {
        title: 'Integração quando fizer sentido.',
        body: [
          'A avaliação psiquiátrica não é uma etapa obrigatória da avaliação neuropsicológica nem do acompanhamento psicológico. Sua necessidade será considerada após o acolhimento e a anamnese, conforme a demanda clínica.',
          'A proposta de atuação interdisciplinar respeita o consentimento, o sigilo, a autonomia técnica e a responsabilidade de cada profissional.',
        ],
      },
      {
        title: 'Responsabilidades definidas.',
        body: [
          'A Psicologia responde pela avaliação psicológica e pela elaboração dos documentos psicológicos pertinentes, dentro de suas atribuições.',
          'Quando indicada, a avaliação médica psiquiátrica pode investigar necessidades médicas, discutir possibilidades de tratamento, considerar prescrição e encaminhamentos e emitir os documentos médicos pertinentes.',
          'A conduta é individual. Não há tratamento farmacológico presumido nem promessa de diagnóstico específico.',
        ],
      },
      {
        title: 'Informação compartilhada com cuidado.',
        body: [
          'O diálogo entre profissionais deve ter finalidade de cuidado e observar as condições de consentimento e sigilo aplicáveis. A pessoa atendida pode esclarecer dúvidas sobre essa integração.',
          'Laudo psicológico e documento médico têm finalidades e responsabilidades próprias. A necessidade de cada documento e as condições do atendimento são esclarecidas com a pessoa atendida.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre caminhos de cuidado',
    ctaType: 'personal',
  },
  {
    slug: 'para-sua-empresa',
    title: 'Consultoria em Psicologia para sua empresa.',
    description: 'Consultoria em Psicologia Organizacional: NR-1 e riscos psicossociais, recrutamento e seleção, treinamento, lideranças e apoio às decisões da empresa.',
    eyebrow: 'Para sua empresa',
    intro: 'Precisa lidar com a NR-1, contratar ou desenvolver sua equipe? A consultoria em Psicologia Organizacional começa pela situação da sua empresa para definir o que investigar, quais ações considerar e que entregas podem apoiar suas decisões.',
    sections: [
      {
        title: 'Você não precisa saber o nome do serviço.',
        body: [
          'Você pode apresentar uma dificuldade para preencher vagas, conflitos na equipe, dúvidas sobre a NR-1 ou a necessidade de desenvolver lideranças. Não é preciso escolher previamente entre treinamento, avaliação ou consultoria: começamos esclarecendo a pergunta e as possibilidades de trabalho.',
          'O contato inicial serve para informações sobre possibilidades, disponibilidade e condições. Para um projeto, delimitamos objetivos, funções envolvidas, recursos disponíveis, participação de trabalhadores, lideranças, RH e responsáveis por Segurança e Saúde no Trabalho e as entregas pertinentes. A realização depende de escopo e condições acordados antes da contratação.',
        ],
      },
      {
        title: 'Recrutamento, seleção e avaliação psicológica.',
        body: [
          'O recrutamento e a seleção começam por compreender a função: atividades, condições de execução e competências pertinentes. Entrevistas estruturadas e outros procedimentos definidos para a demanda ajudam a reunir evidências para a decisão de contratação.',
          'Quando houver indicação de avaliação psicológica, entrevistas, observações e instrumentos adequados são integrados em um processo próprio. Os documentos comunicam os resultados pertinentes à finalidade; a escolha entre relatório de seleção e laudo psicológico depende do trabalho realizado e das normas aplicáveis.',
        ],
        items: [
          'Definição do perfil da função e dos critérios de seleção.',
          'Planejamento e condução de etapas de recrutamento e seleção.',
          'Avaliação psicológica organizacional quando pertinente à demanda.',
          'Devolutiva e documentação para subsidiar a decisão, com sigilo e limites esclarecidos.',
        ],
      },
      {
        title: 'Treinamento e desenvolvimento de pessoas.',
        body: [
          'Treinar tem mais sentido quando há uma necessidade definida e condições para aplicar o que se aprende. O levantamento de necessidades orienta objetivos, conteúdos, formatos e acompanhamento, em vez de partir de uma palestra igual para todas as equipes.',
          'Projetos podem trabalhar comunicação, feedback, cooperação, integração de novos profissionais e desenvolvimento de lideranças. Planos de desenvolvimento individual podem apoiar objetivos acordados, com oportunidades de prática e revisão no cotidiano.',
        ],
      },
      {
        title: 'NR-1, riscos psicossociais e condições de trabalho.',
        body: [
          'Desde 26 de maio de 2026, a redação vigente do capítulo 1.5 da NR-1 inclui expressamente os fatores de risco psicossociais relacionados ao trabalho no Gerenciamento de Riscos Ocupacionais (GRO). A análise considera demandas, autonomia, apoio, relações e outras condições das atividades, em articulação com a NR-17.',
          'A avaliação pode apoiar a priorização de medidas e seu acompanhamento com os responsáveis por SST. Treinamentos podem complementar esse trabalho, mas não substituem mudanças necessárias nas condições de trabalho. A empresa mantém suas responsabilidades pelo GRO e pelo PGR.',
        ],
      },
      {
        title: 'Clima, relações e organização do trabalho.',
        body: [
          'Outras demandas podem envolver investigação do clima organizacional, práticas de liderança, cultura, clareza de papéis, cooperação e manejo de conflitos. A finalidade precisa ser delimitada para que a investigação leve a decisões e ações possíveis.',
          'Um levantamento de clima pode mostrar temas que merecem aprofundamento; uma intervenção nas relações pode exigir escuta e construção de acordos. Nenhuma dessas atividades se confunde automaticamente com avaliação de riscos ocupacionais ou atendimento clínico individual.',
        ],
      },
      {
        title: 'Da primeira conversa ao projeto.',
        body: [
          'Comece pelo contexto geral: o que está acontecendo, quais equipes estão envolvidas e qual decisão ou mudança pede apoio. Não envie dados pessoais de trabalhadores ou candidatos neste primeiro contato. Com essas informações, esclarecemos as possibilidades e o que precisaria ser investigado.',
          'Antes de contratar, combinamos finalidade, métodos, participação, cronograma, condições, acesso às informações e devolutivas. Conforme o escopo, as entregas podem incluir critérios de seleção, levantamento de necessidades, plano de desenvolvimento ou recomendações para priorizar ações sobre condições de trabalho. Os critérios de acompanhamento também são definidos para apoiar a revisão das ações.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre minha situação',
    ctaType: 'business',
  },
  {
    slug: 'recrutamento-e-selecao',
    title: 'Recrutamento e seleção com critérios claros.',
    description: 'Recrutamento e seleção na NEXO: perfil da função, entrevistas, avaliação psicológica quando indicada e documentos para apoiar decisões de contratação.',
    eyebrow: 'Psicologia organizacional · Recrutamento e seleção',
    intro: 'Uma seleção começa antes da entrevista: é preciso compreender o trabalho e definir quais evidências são relevantes para a função. A Psicologia pode apoiar esse percurso e a comunicação dos resultados.',
    sections: [
      {
        title: 'Que trabalho a pessoa vai realizar?',
        body: [
          'A definição do perfil considera atividades, responsabilidades, condições de execução e competências necessárias. Essa análise ajuda a distinguir requisitos pertinentes à vaga de preferências pessoais de quem conduz a seleção.',
          'Por exemplo, uma função que envolve coordenar entregas pode exigir investigar como a pessoa organiza prioridades e comunica dificuldades. Os critérios devem se apoiar no trabalho previsto, sem procurar um tipo de personalidade ideal para toda empresa.',
        ],
      },
      {
        title: 'Um processo organizado para a demanda.',
        body: [
          'A proposta pode envolver apoio à descrição da vaga, estratégia de recrutamento, análise de informações profissionais e entrevistas estruturadas. Etapas adicionais são planejadas conforme o objetivo, a complexidade da função e as condições do processo.',
          'Definir previamente critérios e formas de registrar evidências permite comparar informações com maior clareza. A pessoa candidata deve compreender a finalidade das etapas, as condições de participação e como ocorrerá a comunicação dos resultados.',
        ],
        items: [
          'Alinhamento da demanda e dos critérios ocupacionais.',
          'Planejamento do recrutamento e das etapas de seleção.',
          'Entrevistas e procedimentos compatíveis com a finalidade.',
          'Integração das informações, devolutiva e documentação acordada.',
        ],
      },
      {
        title: 'Como os instrumentos participam da seleção?',
        body: [
          'Quando a demanda indicar avaliação psicológica, ela será planejada e conduzida pelo profissional de Psicologia. Entrevistas, observações e testes psicológicos, quando pertinentes, oferecem informações que precisam ser interpretadas em conjunto.',
          'Testes psicológicos utilizados profissionalmente devem ter parecer favorável no SATEPSI e ser adequados à finalidade, à população e ao contexto, respeitando o manual e as condições de aplicação. Um instrumento disponível na internet não é automaticamente adequado à seleção.',
          'Pontuações isoladas não definem a contratação. A análise precisa considerar o conjunto de evidências, suas limitações e os critérios da função, com cuidado para não transformar informações clínicas privadas em filtros de seleção.',
        ],
      },
      {
        title: 'O que a empresa recebe ao final?',
        body: [
          'As entregas podem incluir o perfil acordado, registros das etapas, síntese das evidências relacionadas à função e recomendações para apoiar a decisão. O escopo define o conteúdo e os destinatários de cada entrega.',
          'A documentação para apoiar a contratação é combinada conforme o serviço realizado. O registro ou a síntese de seleção comunica as etapas e as evidências relacionadas à função. Quando há avaliação psicológica, seus resultados são apresentados no documento psicológico cabível, incluindo laudo psicológico conforme a finalidade e as normas profissionais.',
          'O documento apresenta informações pertinentes, fundamentação e limites. A decisão de contratar é da organização e precisa considerar também as demais informações legítimas do processo; a avaliação não garante desempenho futuro ou permanência na empresa.',
        ],
      },
      {
        title: 'Sigilo e devolutiva fazem parte do processo.',
        body: [
          'Antes da coleta, devem ser esclarecidos a finalidade, o uso dos dados, quem terá acesso e como os resultados serão comunicados. O compartilhamento com a empresa se limita às informações pertinentes à demanda, respeitando o sigilo profissional.',
          'A pessoa avaliada recebe a devolutiva e as orientações cabíveis. Protocolos de testes e detalhes íntimos sem relação com a finalidade não compõem um pacote irrestrito para a gestão. Condições de saúde não devem substituir a análise dos requisitos e das condições reais do trabalho.',
        ],
      },
      {
        title: 'Toda seleção precisa de avaliação psicológica?',
        body: [
          'Não. Recrutamento, seleção e avaliação psicológica são atividades relacionadas, com finalidades que precisam ser diferenciadas. A inclusão de uma avaliação depende da demanda, da justificativa técnica e dos requisitos aplicáveis à função.',
          'A conversa inicial ajuda a decidir quais etapas são pertinentes e quais entregas poderão apoiar a empresa. Para apresentar sua demanda, informe a função, o contexto da vaga e o objetivo da seleção, sem encaminhar documentos pessoais de candidatos no primeiro contato.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre recrutamento e seleção',
    ctaType: 'business',
  },
  {
    slug: 'treinamento-e-desenvolvimento',
    title: 'Treinamento e desenvolvimento para o trabalho real.',
    description: 'Treinamento e desenvolvimento de pessoas na NEXO: levantamento de necessidades, lideranças, comunicação, feedback e acompanhamento da aprendizagem.',
    eyebrow: 'Psicologia organizacional · Treinamento e desenvolvimento',
    intro: 'Desenvolver pessoas exige compreender o que precisa mudar, o que já funciona e quais condições permitem aprender e aplicar novas práticas. O projeto começa pela necessidade da empresa e das equipes.',
    sections: [
      {
        title: 'O que precisa ser aprendido e por quê?',
        body: [
          'O levantamento de necessidades de treinamento investiga a distância entre a situação atual e os objetivos do trabalho. Escuta das equipes, análise das atividades e informações da gestão ajudam a definir prioridades.',
          'Nem toda dificuldade decorre de falta de conhecimento ou habilidade. Recursos insuficientes, orientações conflitantes ou pouca autonomia podem impedir uma boa execução mesmo quando a equipe sabe o que fazer. Identificar essas condições evita atribuir todo problema às pessoas.',
        ],
      },
      {
        title: 'Objetivos que podem ser observados no cotidiano.',
        body: [
          'A proposta transforma temas amplos em práticas que podem ser discutidas e acompanhadas. Em comunicação, por exemplo, o objetivo pode ser melhorar a clareza dos combinados e a forma de pedir ajuda, considerando as condições da equipe.',
          'Formatos podem incluir oficinas, encontros de desenvolvimento, atividades com situações de trabalho e acompanhamento das aplicações. Conteúdo, duração, acessibilidade e participação são acordados conforme o público e a finalidade.',
        ],
      },
      {
        title: 'Lideranças, equipes e integração.',
        body: [
          'Os projetos podem abordar feedback, cooperação, condução de conversas difíceis, clareza de papéis e desenvolvimento de lideranças. A integração de novos profissionais pode organizar referências, responsabilidades e oportunidades de aprendizagem no início da jornada.',
          'Um plano de desenvolvimento individual (PDI) pode articular objetivos, ações, apoio necessário e momentos de revisão. O planejamento considera o contexto da função e a participação da pessoa; não se limita a atribuir características ou exigir mudanças sem oferecer condições.',
        ],
      },
      {
        title: 'Entregas combinadas antes de começar.',
        body: [
          'O escopo pode incluir levantamento de necessidades, objetivos de aprendizagem, plano dos encontros, materiais de apoio e orientações para aplicar e acompanhar as práticas. A empresa pode receber uma síntese do percurso e recomendações para continuidade.',
          'A forma de registro e de devolutiva é combinada desde o início. Exposições pessoais durante encontros não devem ser transformadas em avaliações individuais de desempenho sem finalidade, critérios e condições previamente esclarecidos.',
        ],
        items: [
          'Necessidades e objetivos relacionados ao trabalho.',
          'Percurso de aprendizagem e materiais previstos.',
          'Práticas e oportunidades de aplicação no cotidiano.',
          'Critérios de acompanhamento e revisão do projeto.',
        ],
      },
      {
        title: 'Como acompanhar o desenvolvimento?',
        body: [
          'O acompanhamento pode considerar participação, compreensão, aplicação das práticas e dificuldades encontradas após os encontros. Os critérios precisam corresponder aos objetivos e às condições do projeto.',
          'Uma avaliação de satisfação informa como o encontro foi recebido, mas não demonstra, sozinha, aprendizagem ou mudança no trabalho. Observar aplicações e ouvir as equipes ajuda a ajustar o percurso, sem prometer aumentos de produtividade ou resultados iguais para todas as organizações.',
        ],
      },
      {
        title: 'Treinamento resolve os riscos psicossociais da NR-1?',
        body: [
          'Treinamento pode fazer parte de um plano de ação quando responde a uma necessidade identificada. Ele não substitui a investigação e a modificação de condições como sobrecarga, falta de recursos, pouca autonomia ou práticas de gestão que produzam exposição a riscos.',
          'A articulação com a avaliação de riscos psicossociais e os responsáveis por SST ajuda a definir o papel de cada medida. Uma palestra isolada não garante conformidade com a NR-1; a organização precisa implementar e acompanhar as ações pertinentes ao seu contexto.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre treinamento e desenvolvimento',
    ctaType: 'business',
  },
  {
    slug: 'avaliacao-psicologica-organizacional',
    title: 'Avaliação psicológica no contexto organizacional.',
    description: 'Entenda a avaliação psicológica organizacional: demanda, instrumentos adequados, devolutiva, sigilo e documentos para subsidiar decisões nas empresas.',
    eyebrow: 'Psicologia organizacional · Avaliação psicológica',
    intro: 'Uma avaliação psicológica investiga uma pergunta definida por meio de métodos e informações integrados. No contexto organizacional, sua finalidade, seus limites e o uso dos resultados precisam estar claros antes de começar.',
    sections: [
      {
        title: 'Quando uma avaliação pode contribuir?',
        body: [
          'A avaliação pode subsidiar decisões relacionadas a seleção, desenvolvimento ou outras demandas organizacionais compatíveis com a atuação profissional. O primeiro passo é delimitar a questão que será investigada e sua relação com as atividades e condições de trabalho.',
          'A existência de uma vaga ou de uma dificuldade de desempenho não torna a avaliação automaticamente necessária. O profissional considera a pertinência da demanda, os métodos disponíveis e os requisitos aplicáveis, explicando o que o processo poderá esclarecer.',
        ],
      },
      {
        title: 'Um processo que integra informações.',
        body: [
          'O planejamento define procedimentos, fontes de informação e condições de participação. Entrevistas, observações e testes psicológicos, quando indicados, são utilizados conforme a finalidade e interpretados de forma integrada.',
          'A análise considera o contexto e a qualidade das evidências, em vez de converter uma pontuação ou uma impressão isolada em conclusão sobre a pessoa. Os resultados respondem à demanda delimitada e precisam explicitar suas limitações.',
        ],
        items: [
          'Esclarecer a demanda, os destinatários e a finalidade da avaliação.',
          'Planejar e realizar procedimentos tecnicamente pertinentes.',
          'Integrar as informações e fundamentar as conclusões.',
          'Realizar a devolutiva e elaborar o documento cabível.',
        ],
      },
      {
        title: 'Como são escolhidos os instrumentos?',
        body: [
          'A escolha depende da pergunta, das características da população e do contexto de uso. Testes psicológicos utilizados profissionalmente precisam ter parecer favorável no SATEPSI e ser empregados conforme as condições e orientações do manual.',
          'Instrumentos não psicológicos podem oferecer informações complementares quando tecnicamente fundamentados. Questionários genéricos, testes de internet e classificações de personalidade não substituem um processo de avaliação psicológica nem justificam decisões por si só.',
          'As condições de aplicação e as necessidades de acessibilidade também fazem parte do planejamento. A empresa não precisa escolher uma lista de testes: cabe ao profissional justificar os procedimentos pertinentes à demanda.',
        ],
      },
      {
        title: 'Relatório ou laudo psicológico?',
        body: [
          'O tipo de documento acompanha a finalidade e o trabalho realizado. O relatório psicológico comunica a atuação profissional e o desenvolvimento do processo. O laudo psicológico é decorrente de avaliação psicológica e apresenta análise e conclusões fundamentadas para subsidiar decisões, conforme as normas do CFP.',
          'Para apoiar uma contratação ou outra decisão organizacional, são combinados desde o início a demanda, os destinatários, as informações necessárias e o documento cabível. O conteúdo responde ao objetivo e preserva o sigilo.',
          'A devolutiva permite à pessoa avaliada compreender os resultados e seus limites. O documento não autoriza compartilhamento irrestrito de protocolos, informações íntimas ou dados sem relação com a finalidade acordada.',
        ],
      },
      {
        title: 'Confidencialidade e critérios relacionados ao trabalho.',
        body: [
          'Empresa e pessoa avaliada precisam compreender como as informações serão obtidas, utilizadas e comunicadas. Os registros e documentos recebem tratamento compatível com o sigilo profissional e a proteção de dados, com acesso definido conforme a finalidade.',
          'A avaliação organizacional não é um atalho para obter a história clínica de candidatos ou trabalhadores. Diagnósticos e condições privadas não devem substituir critérios ocupacionais pertinentes. Demandas de cuidado individual têm finalidade e condições próprias.',
        ],
      },
      {
        title: 'A avaliação garante uma contratação bem-sucedida?',
        body: [
          'Não há garantia de desempenho futuro, adaptação permanente ou ausência de dificuldades. A avaliação fornece informações fundamentadas para uma decisão situada no tempo e no contexto; condições de trabalho, oportunidades de aprendizagem e relações também participam do percurso profissional.',
          'Ela também não substitui a avaliação de riscos psicossociais do trabalho prevista na NR-1. Para definir o serviço pertinente, apresente a decisão que precisa de apoio e o contexto da empresa, sem enviar dados pessoais ou clínicos de trabalhadores no primeiro contato.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre avaliação na empresa',
    ctaType: 'business',
  },
  {
    slug: 'riscos-psicossociais-nr1',
    title: 'Avaliação de riscos psicossociais na NR-1.',
    description: 'Entenda a avaliação de riscos psicossociais na NR-1 vigente: GRO, PGR, integração com NR-17, participação dos trabalhadores e acompanhamento das ações.',
    eyebrow: 'NR-1 e riscos psicossociais',
    intro: 'Identificar condições de trabalho, avaliar riscos e orientar medidas de prevenção: compreenda como os fatores psicossociais participam do GRO e do PGR, em articulação com a NR-17.',
    sections: [
      {
        title: 'NR-1 vigente: o que mudou?',
        body: [
          'A redação do capítulo 1.5 da NR-1 em vigor desde 26 de maio de 2026 tornou expressa a inclusão dos fatores de risco psicossociais relacionados ao trabalho no GRO. São consideradas as condições em que o trabalho é organizado e realizado, inclusive nos regimes remoto e híbrido.',
          'O GRO é o processo de gestão dos riscos ocupacionais. O Programa de Gerenciamento de Riscos (PGR) materializa esse processo e contempla inventário de riscos e plano de ação, com critérios documentados e acompanhamento das medidas. As obrigações e eventuais dispensas devem ser verificadas para cada organização.',
        ],
      },
      {
        title: 'O que a avaliação investiga?',
        body: [
          'A investigação considera características das atividades, exigências, recursos, relações e formas de organização que possam gerar exposição a riscos. Ouvir os trabalhadores e observar o trabalho real ajuda a compreender diferenças entre setores, funções e situações.',
          'A finalidade é orientar a prevenção nas condições de trabalho. Avaliação médica periódica, rastreio de sintomas e diagnóstico psicológico individual não substituem a identificação de perigos e a avaliação de riscos ocupacionais.',
        ],
      },
      {
        title: 'Como se conectam NR-1, NR-17, AEP e AET?',
        body: [
          'A NR-17 prevê a Avaliação Ergonômica Preliminar (AEP), que pode combinar métodos qualitativos e quantitativos. Seus resultados integram o inventário de riscos do PGR, com medidas previstas no plano de ação.',
          'A Análise Ergonômica do Trabalho (AET) aprofunda a investigação nas situações previstas na NR-17, como necessidade de análise mais detalhada ou insuficiência das medidas adotadas. Ela não é uma etapa automática para toda empresa. A equipe deve verificar a aplicabilidade e as condições específicas da organização.',
        ],
      },
      {
        title: 'Do reconhecimento às ações.',
        body: ['O percurso precisa ligar a informação coletada a decisões sobre o trabalho. A organização define responsáveis com conhecimento técnico compatível; a NR-1 e a NR-17 não reservam, de forma geral, a avaliação a uma única categoria profissional.'],
        items: [
          'Planejar: delimitar atividades e exposições, métodos e participação dos trabalhadores.',
          'Avaliar: reunir evidências, analisar os riscos e registrar critérios e resultados.',
          'Agir: definir medidas de prevenção, responsáveis, prioridades e prazos.',
          'Acompanhar: verificar implementação e resultados e revisar o processo conforme a NR-1.',
        ],
      },
      {
        title: 'Questionário é obrigatório ou suficiente?',
        body: [
          'Não há questionário obrigatório ou instrumento oficial único. As técnicas devem ser adequadas à realidade avaliada e podem envolver observação, entrevistas, abordagens participativas e instrumentos de levantamento.',
          'Um questionário isolado não caracteriza todo o gerenciamento dos riscos. Seus resultados, quando utilizados, precisam de análise técnica e integração com a AEP e o PGR. A coleta também exige cuidados com confidencialidade e identificação indireta, especialmente em grupos pequenos.',
        ],
      },
      {
        title: 'O que combinar antes de contratar?',
        body: [
          'Defina a abrangência, os métodos, a equipe, as entregas, o tratamento das informações e a integração com os responsáveis por SST. Uma devolutiva útil descreve o contexto avaliado, os critérios, as limitações e as recomendações que poderão orientar ações.',
          'A NEXO conversa com sua organização para construir esse escopo. A empresa mantém a responsabilidade pelo PGR e pela implementação das medidas; consultoria, palestra ou relatório isolado não garantem conformidade legal.',
          'Conteúdo informativo consultado em 16 de outubro de 2026, com base nas fontes oficiais do Ministério do Trabalho e Emprego. A aplicação depende das atividades e dos requisitos pertinentes à organização.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre riscos psicossociais',
    ctaType: 'business',
  },
  {
    slug: 'nossa-abordagem',
    title: 'Antes das respostas, uma boa pergunta.',
    description: 'Conheça a Análise do Comportamento na NEXO: história de aprendizagem, pensamentos, sentimentos e relações com as condições da vida cotidiana.',
    eyebrow: 'Nossa abordagem',
    intro: 'O X representa uma relação que ainda precisamos compreender: o que acontece, em quais situações e com quais consequências. A proposta de psicoterapia da NEXO parte da Análise do Comportamento.',
    sections: [
      {
        title: 'Compreender relações, construir possibilidades.',
        body: [
          'A Análise do Comportamento investiga como ações se relacionam com as condições em que acontecem e suas consequências, considerando a história de aprendizagem. Na clínica, isso orienta perguntas sobre padrões e possibilidades de mudança em contextos concretos.',
          'Corpo, experiências de vida e condições sociais participam dessas relações. Organizá-los em dimensões ajuda a observar; eles não constituem três causas independentes nem uma explicação pronta para cada pessoa.',
        ],
        items: [
          'Corpo e saúde: condições que participam de como agimos, percebemos e sentimos.',
          'História e experiência: aprendizagem, ações, pensamentos e sentimentos em relação às situações vividas.',
          'Contexto e relações: família, cultura, trabalho e condições de vida que ampliam ou restringem possibilidades.',
        ],
      },
      {
        title: 'E o que pensamos e sentimos?',
        body: [
          'Pensar e sentir também fazem parte da investigação. Alguns acontecimentos, como pensamentos e sensações, têm acesso direto particular à própria pessoa. Na tradição do behaviorismo radical, essa privacidade não os coloca fora do estudo do comportamento.',
          'Quando usamos a palavra subjetividade, precisamos explicitar do que estamos falando. Ela não equivale, em todos os usos, a comportamento privado. O cuidado investiga a experiência relatada em relação à história e ao contexto, sem procurar uma essência escondida que explicaria tudo.',
        ],
      },
      {
        title: 'Da pesquisa à aplicação clínica.',
        body: [
          'A Análise Experimental do Comportamento (AEC) investiga processos comportamentais por meio de pesquisa experimental. É uma dimensão da Análise do Comportamento, que também inclui produção conceitual e aplicações.',
          'A psicoterapia utiliza conhecimento científico para compreender demandas e construir intervenções individualizadas. Uma conversa clínica ou uma experiência educativa no site não é, por esse motivo, um experimento nem um teste psicológico.',
        ],
      },
      {
        title: 'Ciência com responsabilidade humana.',
        body: [
          'A atuação proposta se apoia em pensamento crítico, evidências e respeito aos limites do conhecimento. Investigar inclui reconhecer incertezas e comunicar o que os dados permitem compreender.',
          'Ética, sigilo, consentimento e autonomia técnica orientam as relações de cuidado e os projetos organizacionais, respeitadas as atribuições de cada profissional.',
        ],
      },
      {
        title: 'O mesmo símbolo, diferentes sentidos.',
        body: [
          'Na matemática, X pode representar uma variável ou uma incógnita. Como numeral romano, corresponde a dez. Na experiência NEXO, os caminhos que se cruzam sugerem encontro e descoberta como interpretações visuais.',
          'Um símbolo pode assumir sentidos distintos conforme o contexto. Essa é a ideia que atravessa o site: perguntas mais cuidadosas ajudam a acolher a singularidade de cada história.',
          'As experiências exploratórias do site são convites à reflexão. Não são testes psicológicos, não produzem diagnósticos e não atribuem pontuações de saúde mental.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre cuidado psicológico',
    ctaType: 'personal',
  },
  {
    slug: 'profissionais',
    title: 'Pessoas que investigam com você.',
    description: 'Conheça Gabriel Alves Batista, psicólogo, e Ivo Peixoto Barbosa Júnior, médico: contribuições da Psicologia e da Medicina para o seu cuidado.',
    eyebrow: 'Profissionais',
    intro: 'Conheça quem participa do cuidado na NEXO e o que cada olhar pode acrescentar à compreensão da sua história, das dificuldades do cotidiano e das possibilidades de acompanhamento.',
    sections: [
      {
        title: 'Gabriel Alves Batista',
        body: [
          'Psicólogo · CRP-SP 06/176184.',
          'Seu trabalho clínico parte da Análise do Comportamento: compreender o que você faz, pensa e sente nas situações que vive, considerando sua história de aprendizagem e as consequências no cotidiano. A psicoterapia combina objetivos com você e acompanha possibilidades de mudança; a organização breve pode ser considerada conforme a demanda.',
          'Na avaliação neuropsicológica, investiga recursos e dificuldades em atenção, memória, planejamento e outras funções pertinentes à pergunta clínica. Entrevistas, observações e instrumentos são integrados à história e ao contexto, com devolutiva e recomendações quando apropriadas.',
          'Você pode procurar esse espaço para compreender padrões nas relações e na rotina ou esclarecer perguntas sobre seu funcionamento. O primeiro encontro ajuda a delimitar a demanda e conversar sobre o percurso de cuidado.',
        ],
      },
      {
        title: 'Ivo Peixoto Barbosa Júnior',
        body: [
          'Médico · CRM-SP 193133.',
          'Acrescenta a avaliação médica às perguntas sobre saúde mental, considerando a história de saúde, os sintomas, as mudanças no funcionamento e suas relações com condições físicas e com a vida cotidiana.',
          'A consulta permite discutir opções de tratamento e decidir os próximos passos com a pessoa atendida. Quando medicamentos são indicados, o acompanhamento considera benefícios, efeitos adversos e necessidade de ajustes. A avaliação não pressupõe prescrição.',
          'O diálogo com a Psicologia pode contribuir quando houver pertinência clínica e consentimento. A avaliação médica é uma possibilidade de cuidado conforme a necessidade individual, sem constituir etapa obrigatória da psicoterapia ou da avaliação neuropsicológica.',
        ],
      },
      {
        title: 'Como os olhares podem se complementar.',
        body: [
          'A Psicologia investiga padrões e funcionamento por seus métodos de avaliação e acompanhamento; a Medicina acrescenta a investigação e as condutas médicas pertinentes. Quando esses olhares se encontram, cada profissional mantém a responsabilidade por sua avaliação, suas orientações e seus documentos.',
          'O compartilhamento de informações tem finalidade de cuidado e respeita consentimento e sigilo. Você participa das decisões sobre a integração e pode esclarecer o que será conversado entre os profissionais.',
          'Antes do primeiro encontro, vale pensar em uma situação que deseja compreender, quando ela começou e como interfere na sua vida. Você não precisa chegar com uma explicação pronta: essas perguntas ajudam a iniciar a conversa e a construir objetivos com o profissional.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre atendimento',
    ctaType: 'personal',
  },
  {
    slug: 'psicologia-em-pauta',
    title: 'Conhecimento que abre perguntas.',
    description: 'Leia e baixe guias educativos da NEXO sobre Análise do Comportamento, caminhos de cuidado e riscos psicossociais no trabalho e NR-1.',
    eyebrow: 'Psicologia em Pauta',
    intro: 'Uma área para aproximar ciência, vida cotidiana e pensamento crítico, com linguagem clara e fontes identificáveis.',
    sections: [
      {
        title: 'Leituras para compreender e continuar.',
        body: [
          'Os guias desta biblioteca aproximam conceitos do cotidiano com perguntas, exemplos e referências. Você pode abrir a leitura nesta página ou baixar cada material para consultar depois.',
          'Comece pelo tema mais próximo da sua pergunta: observar relações no cotidiano, conhecer os caminhos de cuidado ou compreender condições do trabalho e prevenção.',
        ],
      },
      {
        title: 'O que você pode aprender em cada guia?',
        body: ['Cada leitura tem um recorte para ajudar a organizar perguntas e buscar informações com mais clareza.'],
        items: [
          'Observar relações no cotidiano: descrever situações, respostas e consequências e procurar diferenças entre contextos.',
          'Caminhos de cuidado: compreender psicoterapia, organização breve, avaliação neuropsicológica e contribuição médica quando indicada.',
          'Condições de trabalho e NR-1: relacionar investigação das condições reais, avaliação de riscos e medidas de prevenção.',
        ],
      },
      {
        title: 'Informação com contexto e fontes.',
        body: [
          'Cada guia identifica sua edição e as fontes que apoiam as explicações. Os materiais desenvolvem os conteúdos educativos da NEXO, com exemplos fictícios e links para continuar a leitura.',
          'Perguntas e exemplos ajudam a compreender possibilidades, sem atribuir pontuação, diagnóstico ou resultado individual. Uma demanda pessoal ou organizacional deve ser investigada em seu próprio contexto.',
        ],
      },
    ],
    ctaLabel: 'Conhecer os atendimentos',
    ctaType: 'personal',
  },
  {
    slug: 'contato',
    title: 'Uma conversa para esclarecer o próximo passo.',
    description: 'Fale com a NEXO sobre atendimento psicológico ou consultoria organizacional: NR-1, recrutamento, treinamento, lideranças e clima. WhatsApp e telefone.',
    eyebrow: 'Vamos conversar',
    intro: 'Tem dúvidas sobre atendimento ou sobre uma situação da sua empresa? Você não precisa saber o nome do serviço. Comece pedindo informações sobre possibilidades, disponibilidade e condições.',
    sections: [
      {
        title: 'Para você.',
        body: [
          'Você pode perguntar como começar a psicoterapia, esclarecer a finalidade da avaliação neuropsicológica ou entender quando outro olhar profissional pode contribuir. O primeiro contato traz informações sobre os atendimentos; a indicação de um percurso depende da compreensão da demanda.',
          'O botão de contato abre o WhatsApp com uma mensagem inicial que você pode editar antes de enviar. Nenhuma mensagem é enviada automaticamente.',
        ],
      },
      {
        title: 'Para sua organização.',
        body: [
          'Apresente dúvidas sobre NR-1 e riscos psicossociais, recrutamento e seleção, avaliação psicológica organizacional, treinamento, desenvolvimento de lideranças, clima ou relações de trabalho. Você também pode dizer que ainda não sabe qual projeto procurar.',
          'Comece pela situação geral e pela decisão que precisa de apoio, sem enviar dados de trabalhadores ou candidatos. Conversamos sobre possibilidades de atuação e, para um projeto, objetivos, métodos, entregas, cronograma e condições são definidos antes da contratação.',
        ],
      },
      {
        title: 'Canais e privacidade.',
        body: [
          'Telefone e WhatsApp: +55 (11) 5444-4366.',
          'Use o primeiro contato para informações gerais. Evite enviar diagnósticos, receitas, exames, documentos de pacientes ou outros dados sensíveis antes de combinar o canal e as condições de acolhimento.',
          'Os botões abrem o WhatsApp com uma mensagem editável. O envio depende da sua ação. O primeiro contato serve para esclarecer informações e próximos passos; não equivale a atendimento, avaliação ou contratação de um projeto.',
        ],
      },
    ],
    ctaLabel: 'Iniciar conversa no WhatsApp',
    ctaType: 'personal',
  },
  {
    slug: 'politica-de-privacidade',
    title: 'Privacidade também é cuidado.',
    description: 'Entenda a navegação no site NEXO, as interações educativas, o ambiente sonoro, a hospedagem e os cuidados ao entrar em contato pelo WhatsApp.',
    eyebrow: 'Privacidade',
    intro: 'Aqui você encontra informações sobre a navegação, as experiências educativas e os canais de contato da NEXO, para escolher como interagir e o que deseja compartilhar.',
    sections: [
      {
        title: 'Navegação e experiências exploratórias.',
        body: [
          'As experiências permitem explorar conteúdos e refletir sobre situações do cotidiano. O site não solicita respostas pessoais, sintomas ou documentos de saúde, nem oferece cadastro ou formulário de avaliação clínica.',
          'A navegação entre perguntas e conexões acontece no seu navegador. As escolhas dessas experiências não são enviadas para produzir avaliação, perfil de saúde, pontuação ou diagnóstico.',
          'Para evitar repetir a abertura, o site guarda apenas um indicador de apresentação no armazenamento de sessão do navegador (sessionStorage). Ele permanece vinculado à sessão da aba, pode ser removido pelos controles do navegador e não contém respostas, dados clínicos ou identificadores pessoais.',
        ],
      },
      {
        title: 'Ambiente sonoro opcional.',
        body: [
          'O som começa desligado em cada página e só é ativado por sua escolha. Você pode ajustar o volume ou desligá-lo; ao sair da aba, a reprodução é pausada.',
          'A trilha é produzida localmente pelo navegador. Esse recurso não utiliza microfone ou câmera, não grava sua voz e não envia suas escolhas de áudio para a NEXO. A referência de afinação é uma escolha estética, sem finalidade terapêutica.',
        ],
      },
      {
        title: 'Contato e links externos.',
        body: [
          'Os links de contato são acionados pelo visitante. Ao escolher o WhatsApp, você acessa um serviço externo, sujeito aos seus próprios termos e práticas de privacidade. A mensagem inicial pode ser editada e só é enviada por sua ação.',
          'Ao enviar uma mensagem, você compartilha informações no canal escolhido, incluindo o conteúdo da conversa e os dados que o serviço disponibiliza ao destinatário. Para pedir informações, basta indicar sua dúvida ou o serviço que procura.',
          'Para preservar sua privacidade, use o primeiro contato para informações gerais. O compartilhamento de informações de saúde deve ocorrer em condições de acolhimento e sigilo adequadamente combinadas.',
          'As referências de leitura também podem levar a sites de outras organizações. Ao seguir esses links, consulte as informações de privacidade do respectivo serviço.',
        ],
      },
      {
        title: 'Hospedagem e registros técnicos.',
        body: [
          'O site é entregue pela infraestrutura Cloudflare Pages. Para disponibilizar as páginas e proteger o serviço, a hospedagem pode processar registros técnicos, como endereço IP, informações da conexão e solicitações de acesso.',
          'As informações técnicas são processadas no âmbito do serviço de hospedagem e de suas práticas de segurança. As experiências educativas permanecem sem coleta de respostas pessoais.',
          'O conteúdo público do site não inclui dados de pacientes, registros clínicos ou itens de instrumentos psicológicos restritos.',
        ],
      },
      {
        title: 'Dúvidas e solicitações sobre privacidade.',
        body: [
          'Para esclarecer como o site funciona ou encaminhar uma solicitação relacionada às suas informações, entre em contato com a NEXO pelo telefone ou WhatsApp +55 (11) 5444-4366. Comece pela descrição do pedido, sem anexar documentos de saúde.',
          'Esta página descreve a navegação e os contatos do site. Em um atendimento ou projeto organizacional, converse com o profissional sobre a finalidade, o acesso e as condições de sigilo antes de compartilhar dados sensíveis.',
        ],
      },
    ],
    ctaLabel: 'Entrar em contato',
    ctaType: 'personal',
  },
];
