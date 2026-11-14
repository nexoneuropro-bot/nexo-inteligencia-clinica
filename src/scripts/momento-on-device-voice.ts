/**
 * Ditado local somente quando o navegador confirma o pacote pt-BR já disponível.
 * FALHA FECHADA: nunca ativa o serviço tradicional de reconhecimento remoto.
 * Não cria MediaRecorder, Blob, áudio, upload, armazenamento ou log.
 * A transcrição somente entra no formulário após a pessoa revisá-la.
 */
type LocalResult={results:ArrayLike<ArrayLike<{transcript:string}>>};
type LocalError={error?:string};
type LocalRecognizer={
 lang:string;continuous:boolean;interimResults:boolean;maxAlternatives:number;processLocally:boolean;
 onresult:((event:LocalResult)=>void)|null;
 onerror:((event:LocalError)=>void)|null;
 onend:(()=>void)|null;
 start:()=>void;abort:()=>void;
};
type LocalRecognizerCtor={
 new():LocalRecognizer;
 readonly prototype:LocalRecognizer;
 available?:(options:{langs:string[];processLocally:boolean})=>Promise<string>;
 install?:(options:{langs:string[];processLocally?:boolean})=>Promise<boolean>;
};
export function createLocalDictation(handlers:{
 onTranscript:(value:string)=>void;
 onMessage:(text:string)=>void;
 onFinish:()=>void;
}){
 const host=window as unknown as {SpeechRecognition?:LocalRecognizerCtor;webkitSpeechRecognition?:LocalRecognizerCtor};
 const Ctor=host.SpeechRecognition??host.webkitSpeechRecognition;
 let recognizer:LocalRecognizer|null=null;
 let supported=false;
 let downloadable=false;
 let active=false;
 async function check():Promise<boolean>{
  supported=false;
  downloadable=false;
  if(!window.isSecureContext||!Ctor||typeof Ctor.available!=='function'||!('processLocally'in Ctor.prototype))return false;
  try{
   const state=await Ctor.available({langs:['pt-BR'],processLocally:true});
   supported=state==='available';
   downloadable=(state==='downloadable'||state==='downloading')&&typeof Ctor.install==='function';
  }catch{supported=false;downloadable=false;}
  return supported;
 }
 // A instalação só ocorre após uma escolha explícita da pessoa, nunca em segundo plano.
 async function install():Promise<boolean>{
  if(!downloadable||!Ctor||typeof Ctor.install!=='function')return false;
  try{
   handlers.onMessage('Preparando o pacote de português para ditado no dispositivo...');
   const installed=await Ctor.install({langs:['pt-BR'],processLocally:true});
   const ready=await check();
   return Boolean(installed&&ready);
  }catch{
   await check();
   return false;
  }
 }
 function stop(){
  if(!recognizer)return;
  const old=recognizer;recognizer=null;active=false;
  old.onresult=null;old.onerror=null;old.onend=null;
  try{old.abort();}catch{}
  handlers.onFinish();
 }
 function start(){
  if(!supported||active||!Ctor)return false;
  const speech=new Ctor();
  speech.lang='pt-BR';speech.continuous=false;speech.interimResults=false;speech.maxAlternatives=1;
  speech.processLocally=true; // Nunca permitir fallback para reconhecimento remoto.
  recognizer=speech;active=true;
  speech.onresult=(event)=>{
   const transcript=event.results[0]?.[0]?.transcript?.trim();
   if(transcript)handlers.onTranscript(transcript);
  };
  speech.onerror=()=>handlers.onMessage('Não foi possível transcrever localmente. Você pode escrever ou reservar o tema para a sessão.');
  speech.onend=()=>{recognizer=null;active=false;handlers.onFinish();};
  try{speech.start();return true;}catch{
   recognizer=null;active=false;handlers.onFinish();return false;
  }
 }
 return {check,install,start,stop,get active(){return active;},get canInstall(){return downloadable;}};
}
