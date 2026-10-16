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
    intro: 'Nem tudo o que sentimos conseguimos compreender imediatamente. O primeiro passo pode ser uma conversa sobre o que está acontecendo e sobre o que você procura.',
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
    ctaLabel: 'Saber mais sobre psicoterapia',
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
    ctaLabel: 'Conversar sobre a avaliação',
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
    ctaLabel: 'Entender os caminhos de cuidado',
    ctaType: 'personal',
  },
  {
    slug: 'para-sua-empresa',
    title: 'NR-1 e saúde mental nas empresas.',
    description: 'Saúde mental nas empresas e NR-1: conheça a atuação NEXO em riscos psicossociais, organização do trabalho e planejamento de ações de prevenção.',
    eyebrow: 'Para sua empresa',
    intro: 'NR-1 e saúde mental no trabalho começam por compreender as condições em que as pessoas trabalham: demandas, autonomia, apoio e relações. Avaliar ajuda a transformar essa compreensão em prioridades de prevenção.',
    sections: [
      {
        title: 'O que mudou na NR-1?',
        body: [
          'Desde 26 de maio de 2026, a redação vigente do capítulo 1.5 da NR-1 inclui expressamente os fatores de risco psicossociais relacionados ao trabalho no Gerenciamento de Riscos Ocupacionais (GRO).',
          'Para a empresa, isso significa considerar esses fatores na análise das condições de trabalho e na prevenção, articulando NR-1 e NR-17. A avaliação ajuda a reconhecer exposições e fundamentar decisões; sua utilidade continua na implementação e no acompanhamento das medidas.',
        ],
      },
      {
        title: 'Que condições merecem atenção?',
        body: ['Demandas excessivas, pouca autonomia, apoio insuficiente, conflitos de papéis e situações de violência ou assédio são exemplos que podem exigir investigação. A relevância e o nível de risco dependem das atividades, das exposições e das condições concretas de cada organização.'],
        items: [
          'Demandas: volume, ritmo, recursos e exigências da atividade.',
          'Autonomia: possibilidades de organizar e realizar o trabalho.',
          'Apoio e relações: comunicação, cooperação e acesso à liderança.',
          'Papéis: clareza de responsabilidades e compatibilidade das orientações.',
        ],
      },
      {
        title: 'Como a NEXO pode contribuir?',
        body: [
          'A conversa inicial delimita atividades, unidades de avaliação, demandas e responsabilidades. A proposta pode envolver avaliação de fatores psicossociais, devolutiva organizacional, apoio à priorização de medidas e acompanhamento, conforme o escopo e a competência técnica necessários.',
          'O trabalho se articula com os responsáveis por Segurança e Saúde no Trabalho (SST), a gestão e os trabalhadores. Desenvolvimento de lideranças e comunicação pode complementar as medidas sobre a organização do trabalho, conforme os achados.',
        ],
      },
      {
        title: 'Avaliar para decidir e acompanhar.',
        body: [
          'Conhecer o trabalho real ajuda a definir quais condições precisam mudar, quem ficará responsável e como acompanhar os resultados. O processo deve permitir rever medidas insuficientes e reconhecer novas exposições.',
          'O projeto organizacional trata das condições de trabalho. Avaliações clínicas individuais têm outra finalidade e preservam seus próprios canais de cuidado e sigilo. A responsabilidade da empresa pelo GRO permanece, sem garantia de adequação automática ou certificação pela contratação de uma consultoria.',
        ],
      },
    ],
    ctaLabel: 'Conversar sobre sua organização',
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
    ctaLabel: 'Apresentar a demanda da empresa',
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
    ctaLabel: 'Conhecer a proposta de cuidado',
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
