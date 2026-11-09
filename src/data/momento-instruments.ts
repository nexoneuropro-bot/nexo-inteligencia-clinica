/** Source-faithful text. Digital use still requires the clinician's review of the protocol. */
export const CLINICAL_CONSENT_VERSION = 'clinical-2026-11-08-v3';
export const FOLLOWUP_CONSENT_VERSION = 'nexo-instrumento-2026-11-09-v1';
export const INSTRUMENT_VERSIONS = Object.freeze({
  phq9: 'pt-BR-Pfizer-PHQ9P-2005-source',
  gad7: 'pt-BR-Pfizer-SESSE-2024-annex-B-source',
});

const options = Object.freeze([
  Object.freeze({ value: 0, label: 'Nenhuma vez' }),
  Object.freeze({ value: 1, label: 'Vários dias' }),
  Object.freeze({ value: 2, label: 'Mais da metade dos dias' }),
  Object.freeze({ value: 3, label: 'Quase todos os dias' }),
]);
const impactOptions = Object.freeze([
  Object.freeze({ value: 0, label: 'Nenhuma dificuldade' }),
  Object.freeze({ value: 1, label: 'Alguma dificuldade' }),
  Object.freeze({ value: 2, label: 'Muita dificuldade' }),
  Object.freeze({ value: 3, label: 'Extrema dificuldade' }),
]);

export type ClinicalInstrument = Readonly<{
  id: 'phq9'|'gad7'; name:string; participantTitle:string; intro:string;
  items:readonly string[]; options:typeof options;
  impactQuestion:string; impactOptions:typeof impactOptions;
  impactSource:'instrument-form'|'context-question';
  sourceUrl:string; version:string;
}>;

export const screeningInstruments: readonly ClinicalInstrument[] = Object.freeze([
  Object.freeze({
    id:'phq9', name:'PHQ-9', participantTitle:'Como têm sido as últimas duas semanas',
    intro:'Durante as últimas 2 semanas, com que freqüência você foi incomodado/a por qualquer um dos problemas abaixo?',
    items:Object.freeze([
      'Pouco interesse ou pouco prazer em fazer as coisas',
      'Se sentir “para baixo”, deprimido/a ou sem perspectiva',
      'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume',
      'Se sentir cansado/a ou com pouca energia',
      'Falta de apetite ou comendo demais',
      'Se sentir mal consigo mesmo/a — ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo/a',
      'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão',
      'Lentidão para se movimentar ou falar, a ponto das outras pessoas perceberem? Ou o oposto – estar tão agitado/a ou irrequieto/a que você fica andando de um lado para o outro muito mais do que de costume',
      'Pensar em se ferir de alguma maneira ou que seria melhor estar morto/a',
    ]),
    options, impactOptions, impactSource:'instrument-form',
    impactQuestion:'Se você assinalou qualquer um dos problemas, indique o grau de dificuldade que os mesmos lhe causaram para realizar seu trabalho, tomar conta das coisas em casa ou para se relacionar com as pessoas?',
    sourceUrl:'https://multiculturalmentalhealth.ca/wp-content/uploads/2019/07/PHQ-9-Portuguese.pdf',
    version:INSTRUMENT_VERSIONS.phq9,
  }),
  Object.freeze({
    id:'gad7', name:'GAD-7', participantTitle:'Um pouco mais sobre essas duas semanas',
    intro:'Durante as últimas 2 semanas, com que freqüência você foi incomodado/a pelos problemas abaixo?',
    items:Object.freeze([
      'Sentir-se nervoso/a, ansioso/a ou muito tenso/a',
      'Não ser capaz de impedir ou de controlar as preocupações',
      'Preocupar-se muito com diversas coisas',
      'Dificuldade para relaxar',
      'Ficar tão agitado/a que se torna difícil permanecer sentado/a',
      'Ficar facilmente aborrecido/a ou irritado/a',
      'Sentir medo como se algo horrível fosse acontecer',
    ]),
    options, impactOptions, impactSource:'context-question',
    // Separate contextual question, not an added GAD-7 item or part of its score.
    impactQuestion:'Como essas experiências interferem no seu trabalho, nas atividades em casa ou nas relações com outras pessoas?',
    sourceUrl:'https://www.funesa.se.gov.br/wp-content/uploads/2025/03/protocolo-clinico-terapeutico-digital-final.pdf#page=62',
    version:INSTRUMENT_VERSIONS.gad7,
  }),
]);

export const clinicalInstrumentAuthorship = 'Desenvolvidos por Robert L. Spitzer, Janet B. W. Williams, Kurt Kroenke e colegas, com apoio educacional da Pfizer Inc.';
