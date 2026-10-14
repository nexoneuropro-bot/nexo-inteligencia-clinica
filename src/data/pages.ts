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
    description: 'Conheça a proposta de cuidado da NEXO: psicoterapia, avaliação neuropsicológica e interface com Psiquiatria quando indicada.',
    eyebrow: 'Para você',
    intro: 'Nem tudo o que sentimos conseguimos compreender imediatamente. O primeiro passo pode ser uma conversa sobre o que está acontecendo e sobre o que você procura.',
    sections: [
      {
        title: 'Começar pela sua pergunta.',
        body: [
          'Cada pessoa chega com uma história, um contexto e uma necessidade. O acolhimento ajuda a compreender a demanda e a conversar sobre os caminhos possíveis, sem antecipar conclusões.',
          'A proposta considera corpo e funcionamento, pensamentos e emoções, relações e ambiente. Você participa das decisões e pode esclarecer suas dúvidas ao longo do processo.',
        ],
      },
      {
        title: 'Caminhos de cuidado.',
        body: ['O acompanhamento é definido a partir da necessidade individual. A combinação de serviços não é uma etapa obrigatória.'],
        items: [
          'Psicoterapia: espaço de escuta qualificada e intervenções orientadas por objetivos construídos no acompanhamento.',
          'Avaliação neuropsicológica: investigação planejada da demanda, integração dos resultados e devolutiva.',
          'Interface com Psiquiatria: avaliação médica quando houver indicação e concordância sobre a integração do cuidado.',
        ],
      },
      {
        title: 'Uma conversa inicial, com cuidado.',
        body: [
          'Entre em contato para receber informações sobre modalidades, disponibilidade e organização dos atendimentos. Essas condições serão esclarecidas antes do início do serviço.',
          'No primeiro contato comercial, basta dizer que deseja informações. Preserve documentos, diagnósticos, medicações e outros dados de saúde para um canal de acolhimento adequadamente combinado.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre atendimento',
    ctaType: 'personal',
  },
  {
    slug: 'psicoterapia',
    title: 'Dar espaço ao que precisa de escuta.',
    description: 'Conheça a proposta de psicoterapia da NEXO: escuta qualificada, objetivos de cuidado e duração definida pela avaliação individual.',
    eyebrow: 'Psicoterapia',
    intro: 'Um espaço para compreender experiências, reconhecer perguntas e construir possibilidades de mudança com acompanhamento psicológico.',
    sections: [
      {
        title: 'Compreender antes de concluir.',
        body: [
          'O atendimento psicológico parte da escuta da sua história e do que motivou a busca por acompanhamento. Pensamentos, emoções, comportamento e relações são considerados em seu contexto.',
          'Os objetivos do trabalho são conversados e podem ser revistos ao longo do processo. O cuidado respeita a individualidade e o ritmo de cada pessoa.',
        ],
      },
      {
        title: 'O tempo de cada processo.',
        body: [
          'Em situações compatíveis com a avaliação individual, pode ser proposta uma intervenção breve, com ciclos aproximados de 10 a 20 sessões.',
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
    ctaLabel: 'Saber mais sobre psicoterapia',
    ctaType: 'personal',
  },
  {
    slug: 'avaliacao-neuropsicologica',
    title: 'Investigar com método. Compreender em contexto.',
    description: 'Entenda as etapas da proposta de avaliação neuropsicológica da NEXO, da anamnese à devolutiva e ao laudo psicológico quando cabível.',
    eyebrow: 'Avaliação neuropsicológica',
    intro: 'A pergunta que orienta a avaliação importa tanto quanto os instrumentos. O processo busca integrar informações sobre cognição, comportamento e história individual.',
    sections: [
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
    ctaLabel: 'Conversar sobre a avaliação',
    ctaType: 'personal',
  },
  {
    slug: 'integracao-psiquiatrica',
    title: 'Olhares que podem se complementar.',
    description: 'Entenda a proposta de integração entre Neuropsicologia e Psiquiatria na NEXO, conforme indicação clínica, consentimento e responsabilidades próprias.',
    eyebrow: 'Interface com Psiquiatria',
    intro: 'Em algumas histórias, a compreensão da demanda pode se beneficiar do diálogo entre profissionais. A indicação parte do acolhimento e da avaliação individual.',
    sections: [
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
          'Laudo psicológico e documento médico não são apresentados como um documento único obrigatório. As condições de oferta e os registros dos profissionais devem ser validados antes da publicação definitiva deste serviço.',
        ],
      },
    ],
    ctaLabel: 'Entender os caminhos de cuidado',
    ctaType: 'personal',
  },
  {
    slug: 'para-sua-empresa',
    title: 'Pessoas também constroem resultados.',
    description: 'Conheça a proposta NEXO para organizações: consultoria, desenvolvimento de lideranças, relações de trabalho e saúde mental no contexto organizacional.',
    eyebrow: 'Para sua empresa',
    intro: 'O que os indicadores mostram e as pessoas ainda não conseguiram dizer? Compreender o trabalho também exige olhar para relações, cultura e contexto.',
    sections: [
      {
        title: 'Começar pela realidade da organização.',
        body: [
          'A jornada empresarial parte de uma conversa com gestores, lideranças e Recursos Humanos. O objetivo inicial é compreender a demanda e delimitar um escopo coerente com as necessidades da organização.',
          'A proposta conecta comportamento humano, relações de trabalho e desenvolvimento organizacional. Cada projeto exige definição de objetivos, responsabilidades e condições de execução.',
        ],
      },
      {
        title: 'Possibilidades de atuação.',
        body: ['As frentes abaixo orientam a construção de propostas. A oferta definitiva de serviços com requisitos específicos depende de validação técnica.'],
        items: [
          'Consultoria em saúde mental no trabalho.',
          'Avaliação de fatores de risco psicossociais relacionados ao trabalho.',
          'Orientações pertinentes ao gerenciamento de riscos ocupacionais e à NR-1.',
          'Desenvolvimento de lideranças, comunicação e relações interpessoais.',
          'Treinamentos e desenvolvimento humano.',
          'Cultura organizacional e apoio a estratégias institucionais de bem-estar.',
        ],
      },
      {
        title: 'Clareza de escopo, responsabilidade na entrega.',
        body: [
          'A consultoria organizacional não transforma diagnósticos clínicos individuais em produtos empresariais. A abordagem considera o trabalho e as relações institucionais, com limites definidos em cada projeto.',
          'Não há promessa de adequação legal automática nem oferta de certificação. Questões normativas e requisitos de cada serviço precisam ser verificados antes da contratação e da divulgação definitiva.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre sua organização',
    ctaType: 'business',
  },
  {
    slug: 'riscos-psicossociais-nr1',
    title: 'Compreender o trabalho para orientar ações.',
    description: 'Conheça a proposta de avaliação de fatores de risco psicossociais relacionados ao trabalho e de orientação sobre gerenciamento de riscos ocupacionais.',
    eyebrow: 'Trabalho e riscos psicossociais',
    intro: 'O contexto organizacional pede perguntas que conectem pessoas, relações e a forma como o trabalho acontece.',
    sections: [
      {
        title: 'Olhar para o contexto.',
        body: [
          'A proposta da NEXO contempla possibilidades de avaliação de fatores de risco psicossociais relacionados ao trabalho e de orientações pertinentes ao gerenciamento de riscos ocupacionais.',
          'O ponto de partida é compreender a demanda institucional, delimitar o escopo e verificar os requisitos técnicos necessários. Não se trata de oferecer diagnósticos clínicos individuais à empresa.',
        ],
      },
      {
        title: 'Uma proposta a ser delimitada.',
        body: ['Antes da definição de um projeto, é necessário conversar sobre seu contexto e suas condições de execução.'],
        items: [
          'Demanda da organização e perguntas que precisam ser investigadas.',
          'Abrangência do trabalho e responsabilidades dos envolvidos.',
          'Procedimentos adequados e requisitos de qualificação profissional.',
          'Cuidados com privacidade, sigilo e comunicação das informações.',
          'Possibilidades de orientação e desenvolvimento organizacional.',
        ],
      },
      {
        title: 'Sobre a referência à NR-1.',
        body: [
          'Esta página apresenta uma frente prevista no briefing institucional; não substitui a análise técnica das obrigações aplicáveis à sua organização.',
          'A redação normativa, sua vigência e os requisitos de execução do serviço ainda precisam de validação técnica e jurídica antes da divulgação definitiva. Não são afirmados aqui prazos, exigências detalhadas, certificações ou adequação legal automática.',
        ],
      },
    ],
    ctaLabel: 'Apresentar a demanda da empresa',
    ctaType: 'business',
  },
  {
    slug: 'nossa-abordagem',
    title: 'Antes das respostas, uma boa pergunta.',
    description: 'Conheça os princípios da NEXO: olhar biopsicossocial, ciência, ética, escuta e respeito à singularidade de pessoas e organizações.',
    eyebrow: 'Nossa abordagem',
    intro: 'O X representa uma incógnita. Ele abre espaço para investigar, escutar e compreender o que ainda não encontrou uma formulação.',
    sections: [
      {
        title: 'Um olhar biopsicossocial.',
        body: [
          'Corpo, história individual e contexto social se encontram na experiência humana. A proposta da NEXO é considerar essas relações sem reduzir uma pessoa a uma única característica.',
          'Esse olhar orienta perguntas e ajuda a organizar informações. Ele não estabelece uma explicação pronta para todas as histórias.',
        ],
        items: [
          'Biológica: corpo, cérebro, sistema nervoso, saúde e funcionamento.',
          'Psicológica: pensamentos, emoções, comportamento, cognição e história individual.',
          'Social: cultura, trabalho, relações, família, ambiente e sociedade.',
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
    ctaLabel: 'Conhecer a proposta de cuidado',
    ctaType: 'personal',
  },
  {
    slug: 'profissionais',
    title: 'Conhecimento com responsabilidade.',
    description: 'Conheça os nomes e registros informados para a equipe NEXO. Dados profissionais, títulos e especialidades aguardam conferência nos conselhos.',
    eyebrow: 'Profissionais',
    intro: 'Uma atuação responsável começa pela clareza sobre quem atende e sobre os limites de cada atribuição. Os dados abaixo foram fornecidos no briefing e aguardam validação.',
    sections: [
      {
        title: 'Gabriel Alves Batista',
        body: [
          'Registro informado: CRP-SP 06/176184.',
          'Apresentado no briefing como neuropsicólogo, com responsabilidade pela avaliação neuropsicológica e pela elaboração dos documentos psicológicos pertinentes, respeitadas sua habilitação e suas atribuições.',
          'O registro, o título e a habilitação deverão ser conferidos no conselho profissional antes da publicação definitiva.',
        ],
      },
      {
        title: 'Ivo Peixoto Barbosa Júnior',
        body: [
          'Registro informado: CRM-SP 193133.',
          'Apresentado no briefing para a atuação médica psiquiátrica, com avaliação, orientações e condutas médicas, prescrição quando clinicamente indicada e emissão dos documentos médicos pertinentes.',
          'O registro, o título e a especialidade ainda precisam de conferência. O registro de qualificação de especialista (RQE) não foi fornecido e deverá ser verificado conforme os requisitos de publicidade médica.',
        ],
      },
      {
        title: 'Informações com transparência.',
        body: [
          'Esta é uma prévia institucional. A apresentação final da equipe depende da validação dos registros e das qualificações e da aprovação dos profissionais.',
          'Os retratos reais fornecidos para o projeto estão integrados à prévia. A aprovação para uso público das fotografias permanece pendente.',
          'Não foram incluídos currículos, instituições de formação, certificações ou experiências adicionais sem documentação. As responsabilidades de Psicologia e Medicina permanecem distintas, inclusive quando há integração de cuidado.',
        ],
      },
    ],
    ctaLabel: 'Solicitar informações',
    ctaType: 'personal',
  },
  {
    slug: 'psicologia-em-pauta',
    title: 'Conhecimento que abre perguntas.',
    description: 'Conheça a proposta editorial Psicologia em Pauta, da NEXO. Artigos e materiais científicos serão publicados após revisão e aprovação.',
    eyebrow: 'Psicologia em Pauta',
    intro: 'Uma área para aproximar ciência, vida cotidiana e pensamento crítico, com linguagem clara e fontes identificáveis.',
    sections: [
      {
        title: 'Uma biblioteca em preparação.',
        body: [
          'Os primeiros artigos ainda não foram fornecidos, revisados e aprovados. Esta prévia apresenta a proposta editorial, sem atribuir autoria ou revisão profissional a textos não validados.',
          'A publicação será organizada para que cada conteúdo tenha uma pergunta clara, explicações compreensíveis, referências e caminhos para continuar a leitura.',
        ],
      },
      {
        title: 'Temas que queremos colocar em pauta.',
        body: ['As linhas editoriais previstas conectam experiência individual e contexto social.'],
        items: [
          'Neurodivergência, funções cognitivas e Neuropsicologia.',
          'Comunicação assertiva, relacionamentos e desenvolvimento humano.',
          'Saúde mental, comportamento e autoconhecimento.',
          'Psicologia, sociedade, direitos e cidadania.',
          'Saúde mental no trabalho e relações nas organizações.',
          'Avaliação neuropsicológica e seus processos.',
        ],
      },
      {
        title: 'O compromisso de cada publicação.',
        body: [
          'Cada artigo deverá apresentar título e endereço próprios, data de publicação, revisão quando aplicável, autoria e qualificação comprováveis, referências e metadados de busca.',
          'Materiais científicos e dossiês deverão seguir o rigor de citação adequado. Conteúdos de saúde só serão apresentados como aprovados depois da revisão efetiva.',
          'As perguntas exploratórias do site convidam à reflexão e não substituem avaliação individual ou orientação profissional.',
        ],
      },
    ],
    ctaLabel: 'Conhecer os atendimentos',
    ctaType: 'personal',
  },
  {
    slug: 'contato',
    title: 'Toda história merece ser compreendida.',
    description: 'Fale com a NEXO pelo WhatsApp ou telefone +55 (11) 5444-4366 para informações sobre atendimento ou soluções para organizações.',
    eyebrow: 'Vamos conversar',
    intro: 'Você não precisa chegar com todas as respostas. O primeiro contato pode começar com um pedido de informações.',
    sections: [
      {
        title: 'Para você.',
        body: [
          'Receba informações sobre psicoterapia, avaliação neuropsicológica e possibilidades de integração do cuidado. Modalidades, disponibilidade e condições do serviço serão esclarecidas no contato.',
          'O botão de contato abre o WhatsApp com uma mensagem inicial que você pode editar antes de enviar. Nenhuma mensagem é enviada automaticamente.',
        ],
      },
      {
        title: 'Para sua organização.',
        body: [
          'Apresente a demanda da sua empresa e inicie uma conversa sobre consultoria, desenvolvimento humano e relações de trabalho. O escopo será construído a partir das necessidades e dos requisitos de cada projeto.',
          'Na área Para Sua Empresa, o contato já começa com uma mensagem voltada à sua organização.',
        ],
      },
      {
        title: 'Canais e privacidade.',
        body: [
          'Telefone e WhatsApp: +55 (11) 5444-4366.',
          'Use o primeiro contato para informações gerais. Evite enviar diagnósticos, receitas, exames, documentos de pacientes ou outros dados sensíveis antes de combinar o canal e as condições de acolhimento.',
          'Não há formulário de envio nesta prévia. E-mail, endereço físico, horários e modalidades de atendimento ainda aguardam confirmação e não são apresentados como canais operacionais.',
        ],
      },
    ],
    ctaLabel: 'Iniciar conversa no WhatsApp',
    ctaType: 'personal',
  },
  {
    slug: 'politica-de-privacidade',
    title: 'Privacidade também é cuidado.',
    description: 'Saiba como a prévia do site NEXO trata navegação, experiências interativas e links de contato. Política em preparação para validação antes da publicação.',
    eyebrow: 'Privacidade · versão preliminar',
    intro: 'Este aviso descreve a prévia institucional. A política definitiva depende da confirmação da operação, dos responsáveis e dos serviços de hospedagem utilizados.',
    sections: [
      {
        title: 'Navegação e experiências exploratórias.',
        body: [
          'A prévia não inclui formulário comercial nem ferramenta de analytics. As interações não pedem diagnósticos, medicações ou documentos de pacientes e não são utilizadas para produzir perfis de saúde.',
          'As escolhas na experiência servem para explorar conteúdos e reflexões. Elas não constituem testes psicológicos, avaliação clínica ou diagnóstico.',
          'O navegador guarda temporariamente, em sessionStorage, apenas se a introdução já foi vista ou pulada nesta sessão. Esse registro evita repetir a abertura e não contém respostas, dados clínicos ou identificadores pessoais.',
          'As reflexões variam por seleção aleatória, sem guardar suas escolhas. Qualquer futura ferramenta de análise ou coleta deverá ser avaliada antes de sua ativação.',
        ],
      },
      {
        title: 'WhatsApp e telefone.',
        body: [
          'Os links de contato são acionados pelo visitante. Ao escolher o WhatsApp, você acessa um serviço externo, sujeito aos seus próprios termos e práticas de privacidade. A mensagem inicial pode ser editada e só é enviada por sua ação.',
          'Para preservar sua privacidade, use o primeiro contato para informações gerais. O compartilhamento de informações de saúde deve ocorrer em condições de acolhimento e sigilo adequadamente combinadas.',
        ],
      },
      {
        title: 'Hospedagem e registros técnicos.',
        body: [
          'O serviço de hospedagem, quando configurado, poderá tratar registros técnicos necessários à entrega e à segurança do site. A identificação do fornecedor, as categorias de dados, os prazos e as responsabilidades precisam ser confirmados na implantação.',
          'Não são publicados dados de pacientes, registros clínicos ou instrumentos psicológicos restritos nesta experiência.',
        ],
      },
      {
        title: 'Antes da publicação definitiva.',
        body: [
          'Ainda precisam ser definidos e revisados: a identificação do controlador, o canal de privacidade, as finalidades e bases legais aplicáveis, os prazos de retenção, os eventuais operadores e os procedimentos para atendimento aos direitos dos titulares.',
          'Para esclarecer dúvidas sobre esta prévia, o contato institucional informado é +55 (11) 5444-4366. Esse número não é apresentado como canal formal de encarregado de dados.',
          'Este texto é um rascunho operacional para revisão. Não substitui a validação jurídica e técnica da política que acompanhará a operação definitiva.',
        ],
      },
    ],
    ctaLabel: 'Entrar em contato',
    ctaType: 'personal',
  },
];
