/**
 * Ditado SOMENTE local. Nunca faz fallback para o reconhecedor online.
 * O pack de idioma pode precisar de download explícito pelo navegador.
 * O áudio não é gravado, enviado ao NEXO nem retido pelo aplicativo.
 */
type RecognitionResult={isFinal:boolean;0?:{transcript:string}};
type RecognitionEvent={results:ArrayLike<RecognitionResult>;resultIndex:number};
type LocalRecognizer={
 lang:string;continuous:boolean;interimResults:boolean;processLocally:boolean;
 onresult:((event:RecognitionEvent)=>void)|null;onerror:((event:{error:string})=>void)|null;
 onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void;
};
type RecognitionCtor={
 new():LocalRecognizer;
 available:(options:{langs:string[];processLocally:boolean})=>Promise<string>;
 install?:(options:{langs:string[];processLocally:boolean})=>Promise<boolean>;
};
const recognitionConstructor=():RecognitionCtor|undefined=>{
 const browser=window as Window & {SpeechRecognition?:RecognitionCtor};
 return browser.SpeechRecognition;
};
export function createLocalDictation(onTranscription:(text:string)=>void,onStatus:(text:string)=>void){
 let active:LocalRecognizer|undefined,disposed=false;
 const stop=()=>{const prior=active;active=undefined;if(prior){prior.onresult=null;prior.onerror=null;prior.onend=null;try{prior.abort();}catch{}}};
 const supported=()=>{const ctor=recognitionConstructor();if(!ctor||typeof ctor.available!=='function')return false;try{return 'processLocally' in new ctor();}catch{return false;}};
 const start=async()=>{
  stop();if(disposed)return;
  const ctor=recognitionConstructor();
  if(!ctor||!supported()){onStatus('O ditado local não está disponível neste navegador. Você pode escrever, escolher uma opção ou usar o ditado do teclado do dispositivo.');return;}
  try{
   let availability=await ctor.available({langs:['pt-BR'],processLocally:true});
   if(disposed)return;
   if(availability==='downloadable'&&typeof ctor.install==='function'){
    onStatus('Preparando o idioma português para reconhecimento no dispositivo. Isso não envia seu relato.');
    const installed=await ctor.install({langs:['pt-BR'],processLocally:true});
    if(disposed)return;
    if(installed)availability=await ctor.available({langs:['pt-BR'],processLocally:true});
   }
   if(availability!=='available'){onStatus('O reconhecimento local em português não está disponível. Seu relato não será enviado a nenhum serviço remoto. Escreva ou use as alternativas.');return;}
   const recognition=new ctor();
   recognition.lang='pt-BR';recognition.continuous=false;recognition.interimResults=false;recognition.processLocally=true;
   recognition.onresult=(event)=>{
    if(active!==recognition||disposed)return;
    let spoken='';
    for(let i=event.resultIndex;i<event.results.length;i++){const result=event.results[i];if(result?.isFinal)spoken+=' '+(result[0]?.transcript??'');}
    if(spoken.trim())onTranscription(spoken.trim());
   };
   recognition.onerror=()=>{if(active===recognition){active=undefined;onStatus('O ditado foi interrompido. Você pode continuar digitando ou escolher uma resposta.');}};
   recognition.onend=()=>{if(active===recognition){active=undefined;onStatus('Ditado encerrado. Revise o texto antes de enviar.');}};
   active=recognition;recognition.start();onStatus('Ouvindo somente neste dispositivo. Toque em Parar ou aguarde. Revise a transcrição antes de avançar.');
  }catch{stop();onStatus('Não foi possível ativar o reconhecimento local. Nenhum serviço remoto será usado.');}
 };
 const dispose=()=>{disposed=true;stop();};
 return {supported,start,stop,dispose};
}
