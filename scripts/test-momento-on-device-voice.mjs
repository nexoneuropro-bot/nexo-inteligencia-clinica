import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createLocalDictation} from '../src/scripts/momento-on-device-voice.ts';

test('microfone não inicia sem confirmação de capacidade de processamento local',async()=>{
 const events=[];
 let count=0;
 class SpeechFake{
  static async available(){return 'downloadable';}
  start(){count++;}
  abort(){}
 }
 Object.defineProperty(SpeechFake.prototype,'processLocally',{value:false,writable:true});
 globalThis.window={isSecureContext:true,SpeechRecognition:SpeechFake};
 const speech=createLocalDictation({onTranscript:v=>events.push(v),onMessage:v=>events.push(v),onFinish:()=>{}});
 assert.equal(await speech.check(),false);
 assert.equal(speech.start(),false);
 assert.equal(count,0);
 assert.deepEqual(events,[]);
});

test('microfone local só inicia por chamada direta e resultado vira texto, não áudio',async()=>{
 const events=[];let instance;
 class SpeechFake{
  static async available(options){
   assert.deepEqual(options,{langs:['pt-BR'],processLocally:true});
   return 'available';
  }
  constructor(){instance=this;}
  start(){assert.equal(this.processLocally,true);assert.equal(this.lang,'pt-BR');}
  abort(){}
 }
 Object.defineProperty(SpeechFake.prototype,'processLocally',{value:false,writable:true});
 globalThis.window={isSecureContext:true,SpeechRecognition:SpeechFake};
 const speech=createLocalDictation({onTranscript:v=>events.push(v),onMessage:v=>events.push(v),onFinish:()=>{}});
 assert.equal(await speech.check(),true);
 assert.equal(speech.active,false);
 assert.equal(speech.start(),true);
 assert.equal(speech.active,true);
 instance.onresult({results:[[{transcript:' Gostaria de conversar na sessão. '}]]});
 assert.deepEqual(events,['Gostaria de conversar na sessão.']);
 speech.stop();
 assert.equal(speech.active,false);
});

test('módulo de ditado não utiliza captura ou envio de áudio e política libera apenas percurso convidado',async()=>{
 const code=await readFile(new URL('../src/scripts/momento-on-device-voice.ts',import.meta.url),'utf8');
 const config=await readFile(new URL('../astro.config.mjs',import.meta.url),'utf8');
 assert.ok(code.includes('speech.processLocally=true'));
 assert.ok(code.includes('Ctor.available'));
 assert.doesNotMatch(code,/MediaRecorder|getUserMedia|XMLHttpRequest|fetch\s*\(/);
 assert.ok(config.includes('microphone=()'));
 assert.ok(config.includes('microphone=(self)'));
 assert.ok(config.includes('/conhecendo-meu-momento/responder'));
});
