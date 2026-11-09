/**
 * NEXO · Biblioteca de instrumentos e procedimentos para revisão profissional.
 *
 * Este arquivo contém SOMENTE metadados públicos, jamais itens protegidos,
 * respostas de participantes, escores ou autorizações presumidas.
 * "integrado" significa integrado ao acolhimento inicial existente, NÃO
 * reenvio isolado nem aprovação genérica para aplicação em qualquer modalidade.
 */
import {buildProfessionalCues} from '../lib/momento-professional-cues.ts';

export type InstrumentStatus='integrado'|'curadoria'|'procedimento';
export type InstrumentEntry=Readonly<{
 id:string;
 name:string;
 kind:'escala'|'medida transversal'|'roteiro não padronizado'|'procedimento profissional';
 domains:readonly string[];
 status:InstrumentStatus;
 audience:string;
 purpose:string;
 useNotes:string;
 sourceUrl?:string;
 origin:string;
}>;

const entries:InstrumentEntry[]=[
 {
  id:'phq9',name:'PHQ-9',kind:'escala',domains:['humor','funcionamento'],
  status:'integrado',audience:'Adultos encaminhados ao percurso clínico NEXO.',
  purpose:'Rastreio de sintomas depressivos e impacto funcional, sem estabelecer diagnóstico.',
  useNotes:'Versão pt-BR, 9 itens, últimas 2 semanas. Formulário já implementado no acolhimento; reaplicação digital disponível somente após ativação operacional do módulo complementar e decisão do profissional.',
  sourceUrl:'https://multiculturalmentalhealth.ca/wp-content/uploads/2019/07/PHQ-9-Portuguese.pdf',
  origin:'Implementação clínica NEXO; fonte e versão documentadas em docs/MOMENTO-BATERIA-FONTES-E-ATIVACAO.md.'
 },
 {
  id:'gad7',name:'GAD-7',kind:'escala',domains:['ansiedade','funcionamento'],
  status:'integrado',audience:'Adultos encaminhados ao percurso clínico NEXO.',
  purpose:'Rastreio de sintomas ansiosos e interferência referida, sem diagnosticar transtorno.',
  useNotes:'Versão pt-BR, 7 itens, últimas 2 semanas. Formulário já implementado no acolhimento; reaplicação digital depende de ativação operacional e aprovação do terapeuta.',
  sourceUrl:'https://www.funesa.se.gov.br/wp-content/uploads/2025/03/protocolo-clinico-terapeutico-digital-final.pdf',
  origin:'Implementação clínica NEXO; fonte e versão documentadas em docs/MOMENTO-BATERIA-FONTES-E-ATIVACAO.md.'
 },
 {
  id:'isi',name:'ISI · Insomnia Severity Index',kind:'escala',domains:['sono'],
  status:'curadoria',audience:'Verificar população e versão brasileira específica.',
  purpose:'Aprofundamento de queixas de insônia quando a entrevista justificar.',
  useNotes:'Incluído no acervo para seleção e planejamento profissional. A definição integral da versão pt-BR não foi recuperada no repositório; o questionário digital ainda não está cadastrado. Reutilizar a autorização anteriormente obtida, quando documentada, e verificar as condições da versão/modo usados.',
  origin:'Referência histórica do projeto; definição integral não localizada.'
 },
 {
  id:'dsm-cross-level1',name:'DSM-5-TR · Medida transversal de sintomas, nível 1 (adultos)',kind:'medida transversal',
  domains:['multidomínio','humor','ansiedade','sono','funcionamento'],
  status:'curadoria',audience:'Adultos, conforme especificações da APA; tradução pt-BR e equivalência digital não verificadas.',
  purpose:'Mapear domínios amplos que possam orientar a entrevista e medidas de nível 2.',
  useNotes:'A existência de formulário da APA não autoriza presumir tradução, direitos de reprodução ou formato remoto brasileiro. Revisar versão, pesquisa, consentimento e condições antes de configurar itens.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Referência DSM-5-TR discutida para o motor de hipóteses.'
 },
 {
  id:'promis-depression',name:'PROMIS · Emotional Distress, Depression (nível 2, adultos)',kind:'medida transversal',
  domains:['humor'],status:'curadoria',audience:'Adultos; versão e normas brasileiras a conferir.',
  purpose:'Aprofundar domínio de humor quando houver pergunta clínica específica.',
  useNotes:'Selecionável para planejamento profissional. Para aplicação digital falta cadastrar a versão, pontuação e condições da tradução específica; preservar autorizações anteriores que já cubram o uso pretendido.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'promis-anxiety',name:'PROMIS · Emotional Distress, Anxiety (nível 2, adultos)',kind:'medida transversal',
  domains:['ansiedade'],status:'curadoria',audience:'Adultos; versão e normas brasileiras a conferir.',
  purpose:'Aprofundar sintomas ansiosos quando o GAD-7 e a entrevista não esclarecerem a pergunta clínica.',
  useNotes:'Não disponível para aplicação no NEXO. Conferir tradução, versão, regras de pontuação, licença e modalidade.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'promis-sleep',name:'PROMIS · Sleep Disturbance (nível 2, adultos)',kind:'medida transversal',
  domains:['sono'],status:'curadoria',audience:'Adultos; versão e normas brasileiras a conferir.',
  purpose:'Aprofundar alterações de sono após esclarecer se a queixa é insônia, hipersonia, ritmo ou outra.',
  useNotes:'Selecionável para planejamento profissional. Falta o formulário eletrônico da versão portuguesa com suas regras de pontuação e condições de uso.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'asrm',name:'ASRM · Altman Self-Rating Mania Scale (nível 2, adultos)',kind:'escala',
  domains:['humor','ativação episódica'],status:'curadoria',audience:'Adultos; versão e adaptação brasileira a conferir.',
  purpose:'Investigação complementar de ativação episódica, quando entrevista longitudinal indicar pertinência.',
  useNotes:'Jamais inferir transtorno bipolar automaticamente. Pode ser considerado na entrevista e no planejamento; não há formulário digital verificado cadastrado. Confirmar a versão, as condições e a pertinência antes da aplicação.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'phq15',name:'PHQ-15 · Sintomas somáticos (nível 2, adultos)',kind:'escala',
  domains:['saúde física','somatização'],status:'curadoria',audience:'Adultos; verificar versão e população brasileira.',
  purpose:'Caracterizar queixas corporais em integração com avaliação médica e contexto biopsicossocial.',
  useNotes:'Não usar para atribuir origem psicológica a sintomas físicos. Conferir conteúdo, direitos, equivalência digital e evidência.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'promis-anger',name:'PROMIS · Anger (nível 2, adultos)',kind:'medida transversal',
  domains:['irritabilidade'],status:'curadoria',audience:'Adultos; verificar versão brasileira.',
  purpose:'Aprofundar irritabilidade quando a queixa e a entrevista justificarem.',
  useNotes:'Conferir direitos e modo de aplicação; não equiparar irritabilidade a diagnóstico.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'foci',name:'FOCI · pensamentos e comportamentos repetitivos (nível 2, adultos)',kind:'escala',
  domains:['pensamentos repetitivos'],status:'curadoria',audience:'Adultos; versão brasileira a conferir.',
  purpose:'Investigar domínio específico quando a pessoa relatar pensamentos intrusivos e/ou neutralização.',
  useNotes:'Não deduzir TOC de preocupação isolada. Conferir versão, adaptação e condições de utilização.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'nida-assist',name:'NIDA-Modified ASSIST · uso de substâncias (nível 2, adultos)',kind:'medida transversal',
  domains:['substâncias'],status:'curadoria',audience:'Adultos; adaptação e disponibilidade brasileira a conferir.',
  purpose:'Aprofundar relato de uso de substâncias com consentimento e acolhimento.',
  useNotes:'Conferir versão, direitos e fluxo de segurança. Não presumir uso de substâncias a partir de queixas inespecíficas.',
  sourceUrl:'https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures',
  origin:'Família de medidas DSM-5-TR/APA, somente referência.'
 },
 {
  id:'whodas12',name:'WHODAS 2.0 · 12 itens',kind:'escala',
  domains:['funcionamento'],status:'curadoria',audience:'Adultos; versão de aplicação, idioma e adaptação a conferir.',
  purpose:'Descrever funcionamento e participação ao longo da evolução.',
  useNotes:'O manual da OMS disponibiliza o WHODAS 2.0 em domínio público, com registro de usuário previsto. Selecionável para planejamento; a versão pt-BR de 12 itens e a aplicação digital ainda precisam ser cadastradas, sem alteração dos itens.',
  sourceUrl:'https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health/who-disability-assessment-schedule',
  origin:'Referência OMS para avaliação funcional discutida no projeto.'
 },
 {
  id:'diario-sono',name:'Diário contextual de sono',kind:'roteiro não padronizado',
  domains:['sono'],status:'procedimento',audience:'Conforme pertinência e condições da pessoa.',
  purpose:'Registrar horários, despertares, descanso e contexto para conversar na sessão.',
  useNotes:'Procedimento descritivo opcional, não é escala validada nem possui escore. Pode ser feito em papel. Formulário digital e envio longitudinal ainda não implementados.',
  origin:'Procedimento exploratório já proposto no guia de entrevista NEXO.'
 },
 {
  id:'entrevista-atencao',name:'Entrevista dirigida de atenção e funções executivas',kind:'roteiro não padronizado',
  domains:['atenção'],status:'procedimento',audience:'Pessoa com dificuldades referidas e entrevista pertinente.',
  purpose:'Investigar início, sono, funcionamento, contexto, história escolar e desenvolvimento.',
  useNotes:'Roteiro clínico individualizado; não é teste psicológico nem diagnostica TDAH. Testes formais precisam de validação e autorização específicas.',
  origin:'Domínio de investigação neuropsicológica acordado no projeto.'
 },
 {
  id:'historia-desenvolvimento',name:'Entrevista de história do desenvolvimento',kind:'roteiro não padronizado',
  domains:['neurodesenvolvimento'],status:'procedimento',audience:'Quando história clínica e consentimento justificarem.',
  purpose:'Explorar marcos do desenvolvimento, infância, escola e funcionamento em contextos distintos.',
  useNotes:'Não presumir TEA ou TDAH a partir de características isoladas; não equivale a escala padronizada.',
  origin:'Domínio de investigação neuropsicológica acordado no projeto.'
 },
 {
  id:'nimh-bssa',name:'NIMH/BSSA · avaliação breve de segurança',kind:'procedimento profissional',
  domains:['segurança'],status:'procedimento',audience:'Condução humana profissional, conforme protocolo e situação.',
  purpose:'Investigar segurança atual diante de relatos de morte, autoagressão ou informação ausente relevante.',
  useNotes:'NÃO encaminhar como formulário assíncrono isolado. Exige entrevista profissional e decisão clínica. Não estima risco por algoritmo.',
  sourceUrl:'https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials/adult-outpatient/adult-outpatient-brief-suicide-safety-assessment-worksheet',
  origin:'Roteiro profissional incluído no guia de entrevista NEXO.'
 }
];
export const instrumentLibrary:readonly InstrumentEntry[]=Object.freeze(entries.map(entry=>Object.freeze({...entry,domains:Object.freeze([...entry.domains])})));

export type InstrumentSuggestion=Readonly<{id:string;reason:string}>;
/** Seleção conservadora baseada em pistas descritivas, exclusivamente para revisão profissional. */
export function suggestInstrumentLibrary(input:Record<string,unknown>):readonly InstrumentSuggestion[]{
 const phq=Array.isArray(input.phq9)?input.phq9:[];
 const safety=phq[8];
 if(typeof safety!=='number'||safety>0){
  return Object.freeze([{id:'nimh-bssa',reason:typeof safety==='number'?
   'Há resposta relacionada a morte/autolesão; esclarecer a segurança atual humanamente antes de instrumentos eletivos.':
   'O item 9 não foi respondido; não presumir ausência de risco. Conferir segurança atual com o profissional.'}]);
 }
 const ids=new Set(buildProfessionalCues(input).map(cue=>cue.id));
 const suggested:InstrumentSuggestion[]=[];
 const add=(id:string,reason:string)=>{if(!suggested.some(s=>s.id===id))suggested.push({id,reason});};
 if(ids.has('sono')){
  add('diario-sono','Há relato de alteração do sono; esclarecer a natureza e o contexto antes de escolher instrumento.');
  add('isi','Se a entrevista identificar queixa de insônia, considerar avaliação específica após validar a versão.');
 }
 if(ids.has('impacto'))add('whodas12','Há impacto funcional referido; considerar medida de funcionamento se ela responder à pergunta clínica.');
 if(ids.has('atencao'))add('entrevista-atencao','Há dificuldade de concentração referida; esclarecer história e condições clínicas antes de testes.');
 if(ids.has('interesse-humor'))add('phq9','Reavaliação futura pode ser considerada, mas envio isolado ainda não está disponível.');
 if(ids.has('preocupacao'))add('gad7','Reavaliação futura pode ser considerada, mas envio isolado ainda não está disponível.');
 return Object.freeze(suggested.map(item=>Object.freeze(item)));
}
