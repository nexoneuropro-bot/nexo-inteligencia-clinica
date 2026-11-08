/**
 * Perguntas autorais complementares ao rastreio.
 * Não integram o PHQ-9 ou GAD-7 e nunca modificam o escore.
 * Apresentar somente depois dos instrumentos, se o item-gatilho foi endossado.
 */
export const clarificationQuestions = Object.freeze([
  Object.freeze({
    id:'sleep',
    triggerPhqIndex:2,
    theme:'Para compreender melhor seu cotidiano',
    title:'Quando seu sono muda, o que acontece com mais frequência?',
    intro:'Esta pergunta é opcional. Ela ajuda o profissional a compreender sua resposta anterior.',
    options:Object.freeze([
      Object.freeze({id:'less-sleep',label:'Tenho dificuldade para adormecer ou continuar dormindo.'}),
      Object.freeze({id:'more-sleep',label:'Tenho dormido mais do que de costume.'}),
      Object.freeze({id:'both-sleep',label:'As duas situações acontecem em momentos diferentes.'}),
      Object.freeze({id:'other-sleep',label:'Acontece de outro jeito.'}),
      Object.freeze({id:'not-informed',label:'Prefiro não informar.'}),
    ]),
  }),
  Object.freeze({
    id:'appetite',
    triggerPhqIndex:4,
    theme:'Para compreender melhor seu cotidiano',
    title:'Quando percebe mudanças no apetite ou na alimentação, o que costuma acontecer?',
    intro:'Esta pergunta é opcional e não altera nenhum resultado do rastreio.',
    options:Object.freeze([
      Object.freeze({id:'less-appetite',label:'Sinto menos vontade de comer.'}),
      Object.freeze({id:'more-appetite',label:'Sinto mais vontade de comer ou como mais.'}),
      Object.freeze({id:'both-appetite',label:'As duas situações acontecem em momentos diferentes.'}),
      Object.freeze({id:'other-appetite',label:'Acontece de outro jeito.'}),
      Object.freeze({id:'not-informed',label:'Prefiro não informar.'}),
    ]),
  }),
]);
