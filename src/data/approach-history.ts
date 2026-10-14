/**
 * Sete encontros editoriais com a história das perguntas sobre a experiência humana.
 * Esta seleção não é uma história universal, uma genealogia da NEXO ou uma escala
 * de progresso. Os saberes coexistem, divergem e permanecem sujeitos à crítica.
 * Perguntas e conexões são autorais; citações e traduções estão identificadas.
 * Ver fontes, recortes e limites em docs/REFERENCIAS-ABORDAGEM.md.
 */
export type ApproachEra = {
  id: string;
  yearLabel: string;
  title: string;
  discipline: string;
  summary: string;
  question: string;
  quote?: {
    text: string;
    attribution: string;
    sourceTitle: string;
    sourceUrl: string;
    translationLabel?: string;
  };
  sourceTitle: string;
  sourceUrl: string;
};

export const approachEras: ApproachEra[] = [
  {
    id: 'pergunta',
    yearLabel: 'Séculos V–IV a.C.',
    title: 'A pergunta abre o mundo.',
    discipline: 'Filosofia · reconhecer o desconhecido',
    summary: 'Na Apologia de Platão, Sócrates interroga certezas e examina os limites do próprio saber. Aristóteles inicia a Metafísica pelo desejo de conhecer. São vozes distintas da Grécia antiga: aqui, elas abrem uma pergunta que atravessa esta experiência, sem esgotar a história da filosofia.',
    question: 'Qual certeza muda de forma quando você a transforma em pergunta?',
    quote: {
      text: 'Todos os seres humanos, por natureza, desejam conhecer.',
      attribution: 'Aristóteles · Metafísica, livro I, parte 1',
      sourceTitle: 'Metaphysics · tradução inglesa de W. D. Ross — MIT',
      sourceUrl: 'https://classics.mit.edu/Aristotle/metaphysics.1.i.html',
      translationLabel: 'Tradução livre do trecho em inglês',
    },
    sourceTitle: 'Platão · Apologia — tradução de Benjamin Jowett, MIT',
    sourceUrl: 'https://classics.mit.edu/Plato/apology.html',
  },
  {
    id: 'metodo',
    yearLabel: '1620',
    title: 'Aprender a desconfiar da primeira impressão.',
    discipline: 'Filosofia da investigação · observação e método',
    summary: 'Em Novum Organum, Francis Bacon discute obstáculos ao conhecimento: hábitos do pensamento, palavras e doutrinas podem distorcer o que se observa. Sua proposta de investigação é uma entre diferentes tradições. Para esta travessia, fica uma tensão fértil: observar também exige examinar as lentes de quem observa.',
    question: 'Que parte do que você percebe vem da situação — e que parte vem da lente?',
    sourceTitle: 'Francis Bacon · Novum Organum, livro I, aforismos XXXVIII–XLVI',
    sourceUrl: 'https://www.gutenberg.org/files/45988/45988-h/45988-h.htm',
  },
  {
    id: 'psiquiatria',
    yearLabel: '1801 · 1806',
    title: 'O sofrimento entra no arquivo clínico.',
    discipline: 'História da psiquiatria · pessoas e instituições',
    summary: 'O tratado de Philippe Pinel, publicado em 1801 e traduzido para o inglês em 1806, reúne descrições e classificações do que então se chamava alienação mental. Esse arquivo permite interrogar modos de observar, nomear e tratar o sofrimento. Seus termos e práticas pertencem ao período; não são orientações para o cuidado atual.',
    question: 'O que uma classificação ajuda a perceber — e o que da pessoa pode ficar fora dela?',
    sourceTitle: 'Philippe Pinel · A Treatise on Insanity (1806) — acervo Wellcome',
    sourceUrl: 'https://wellcomecollection.org/works/ydkdmffr',
  },
  {
    id: 'psicologia',
    yearLabel: '1879 · 1890',
    title: 'A experiência encontra o laboratório.',
    discipline: 'Psicologia · fenômenos e condições',
    summary: 'Em Leipzig, o laboratório de Wilhelm Wundt torna 1879 um marco institucional da psicologia experimental. Em 1890, William James investiga a vida mental e suas condições, incluindo atenção, memória e hábito. Não se trata de uma origem única: métodos diferentes tornam aspectos diferentes da experiência investigáveis.',
    question: 'O que aparece quando você observa como presta atenção, lembra ou repete?',
    quote: {
      text: 'A psicologia é a ciência da vida mental…',
      attribution: 'William James · The Principles of Psychology, vol. I, cap. I, 1890',
      sourceTitle: 'The Principles of Psychology · texto integral — Project Gutenberg',
      sourceUrl: 'https://www.gutenberg.org/files/57628/57628-h/57628-h.htm',
      translationLabel: 'Tradução livre de um trecho; a frase continua na obra',
    },
    sourceTitle: 'Arquivo Wundt · fundação do instituto em 1879 — Universidade de Leipzig',
    sourceUrl: 'https://home.uni-leipzig.de/wundtbriefe/wwcd/chapters/wundt.htm',
  },
  {
    id: 'contexto',
    yearLabel: '1934',
    title: 'Uma palavra também tem história.',
    discipline: 'Psicologia do desenvolvimento · linguagem e relações',
    summary: 'Em Pensamento e linguagem, Vygotsky investiga as relações entre pensamento e palavra e sustenta que o significado das palavras se desenvolve. Em diálogo crítico com outras propostas, sua pesquisa situa a linguagem no desenvolvimento humano. A experiência deixa de parecer imóvel: os sentidos também se transformam.',
    question: 'Há uma palavra sobre você cujo significado mudou com o tempo?',
    sourceTitle: 'Lev Vygotsky · Thinking and Speech (1934), capítulo 7 — arquivo da obra',
    sourceUrl: 'https://www.marxists.org/archive/vygotsky/works/words/ch07.htm',
  },
  {
    id: 'biopsicossocial',
    yearLabel: '1977',
    title: 'Corpo, experiência e contexto se encontram.',
    discipline: 'Medicina · modelo biopsicossocial',
    summary: 'Em 1977, George L. Engel propõe um modelo biopsicossocial e critica a exclusão das dimensões psicológicas, sociais e comportamentais do adoecimento. É uma proposta de ampliar a investigação e o cuidado. A imagem de três campos que se encontram é nossa metáfora visual; não representa um exame ou diagnóstico.',
    question: 'O que fica mais visível quando corpo, experiência e contexto entram na mesma conversa?',
    quote: {
      text: '…as dimensões sociais, psicológicas e comportamentais do adoecimento.',
      attribution: 'George L. Engel · Science, 1977, resumo do artigo',
      sourceTitle: 'The Need for a New Medical Model: A Challenge for Biomedicine',
      sourceUrl: 'https://doi.org/10.1126/science.847460',
      translationLabel: 'Tradução livre de um trecho do resumo',
    },
    sourceTitle: 'Engel · Science 196 (4286), 129–136 · DOI 10.1126/science.847460',
    sourceUrl: 'https://doi.org/10.1126/science.847460',
  },
  {
    id: 'nexo',
    yearLabel: 'Aqui · agora',
    title: 'A próxima conexão começa com uma escuta.',
    discipline: 'NEXO · pergunta, escuta e contexto',
    summary: 'Esta travessia chega ao presente com perguntas em aberto. Na proposta da NEXO, escutar a história, investigar com responsabilidade e considerar o contexto ajudam a construir caminhos de cuidado. Psicologia e Psiquiatria têm atuações próprias; uma integração pode ser considerada quando indicada, a partir do acolhimento e da anamnese.',
    question: 'Qual parte da sua história precisa encontrar espaço para ser escutada?',
    sourceTitle: 'NEXO · apresentação profissional e responsabilidade pelo cuidado',
    sourceUrl: '/profissionais/',
  },
];
