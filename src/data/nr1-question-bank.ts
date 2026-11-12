/**
 * Banco autoral NEXO NR-1, versão experimental 2026-11-12.
 * São indicadores para discussão do trabalho real, não uma escala validada,
 * teste psicológico, diagnóstico ou instrumento normativamente obrigatório.
 * Sem itens de saúde mental ou identificação individual.
 */
export const nr1Dimensions = [
 {id:'carga',name:'Carga e ritmo',context:'Demandas, tempo e recursos suficientes para executar o trabalho.'},
 {id:'autonomia',name:'Autonomia e participação',context:'Possibilidade de participar das decisões e ajustar o trabalho.'},
 {id:'clareza',name:'Papéis e comunicação',context:'Previsibilidade das tarefas, metas e responsabilidades.'},
 {id:'apoio',name:'Apoio e recursos',context:'Condições materiais e suporte da liderança e de colegas.'},
 {id:'respeito',name:'Respeito e convivência',context:'Condições para lidar com conflitos e prevenir violência e assédio.'},
 {id:'jornada',name:'Jornada e recuperação',context:'Organização de horários, pausas e comunicação fora do expediente.'},
 {id:'mudancas',name:'Mudanças e segurança organizacional',context:'Comunicação e participação quando processos de trabalho mudam.'},
 {id:'acesso',name:'Acessibilidade e inclusão',context:'Acesso às informações e condições compatíveis com necessidades diversas.'},
] as const;
export const nr1AnswerOptions = [
 {value:'0',label:'Nunca'}, {value:'1',label:'Raramente'},
 {value:'2',label:'Às vezes'}, {value:'3',label:'Frequentemente'},
 {value:'4',label:'Sempre'}, {value:'nao-informado',label:'Não sei / prefiro não responder'},
] as const;
export const nr1Questions = [
 {id:'NEXO-NR1-01',dimension:'carga',label:'O volume de tarefas exige realizar mais trabalho do que o tempo disponível permite.'},
 {id:'NEXO-NR1-02',dimension:'carga',label:'Faltam recursos ou pessoas para cumprir as demandas com segurança.'},
 {id:'NEXO-NR1-03',dimension:'autonomia',label:'Mudanças na forma de executar minhas atividades acontecem sem que eu possa participar.'},
 {id:'NEXO-NR1-04',dimension:'autonomia',label:'Tenho pouca margem para organizar a ordem ou o ritmo das minhas tarefas.'},
 {id:'NEXO-NR1-05',dimension:'clareza',label:'Recebo orientações contraditórias sobre minhas responsabilidades.'},
 {id:'NEXO-NR1-06',dimension:'clareza',label:'As metas ou prioridades mudam sem comunicação suficiente.'},
 {id:'NEXO-NR1-07',dimension:'apoio',label:'Em situações difíceis, faltam orientação e apoio de pessoas responsáveis.'},
 {id:'NEXO-NR1-08',dimension:'apoio',label:'A equipe precisa improvisar por falta de materiais, equipamentos ou informações.'},
 {id:'NEXO-NR1-09',dimension:'respeito',label:'Conflitos ou comentários desrespeitosos são ignorados no ambiente de trabalho.'},
 {id:'NEXO-NR1-10',dimension:'respeito',label:'Faltam canais conhecidos e seguros para comunicar situações de violência ou assédio.'},
 {id:'NEXO-NR1-11',dimension:'jornada',label:'As pausas planejadas são interrompidas pelas exigências das atividades.'},
 {id:'NEXO-NR1-12',dimension:'jornada',label:'Há cobranças de mensagens ou tarefas fora da jornada combinada.'},
 {id:'NEXO-NR1-13',dimension:'mudancas',label:'Novos procedimentos são implantados sem orientação adequada.'},
 {id:'NEXO-NR1-14',dimension:'mudancas',label:'Informações importantes para executar o trabalho chegam tarde demais.'},
 {id:'NEXO-NR1-15',dimension:'acesso',label:'Informações essenciais são apresentadas de um jeito difícil de acessar ou compreender.'},
 {id:'NEXO-NR1-16',dimension:'acesso',label:'Barreiras físicas, digitais ou de comunicação dificultam a participação nas atividades.'},
] as const;
export const nr1References = [
 {label:'MTE · NR-1 (texto vigente desde 26/05/2026)',url:'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1'},
 {label:'MTE · Manual de interpretação do GRO/PGR (2026)',url:'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/manuais-e-publicacoes/2026/manual_gro_pgr_da_nr_1.pdf/view'},
 {label:'Fundacentro · Diretrizes para aplicação da NR-1 (2026)',url:'https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2026/maio/fundacentro-lanca-diretrizes-para-aplicar-nr-1-com-inclusao-dos-riscos-psicossociais'},
] as const;
