import {exportSyntheticPilotCase} from '../data/momento-synthetic-case';

const root=document.querySelector<HTMLElement>('[data-momento-synthetic-panel]');
if(root){
  const life=new AbortController(),{signal}=life;
  const reset=()=>root.querySelectorAll<HTMLSelectElement>('[data-msp-review]').forEach(select=>{select.value='pending';});
  root.addEventListener('click',event=>{
    const target=event.target;if(!(target instanceof Element))return;
    const button=target.closest<HTMLButtonElement>('button[data-msp-action]');if(!button)return;
    const status=root.querySelector<HTMLElement>('#msp-status')!;
    if(button.dataset.mspAction==='reset'){reset();status.textContent='As escolhas locais de revisão foram limpas.';}
    if(button.dataset.mspAction==='export'){
      const url=URL.createObjectURL(new Blob([exportSyntheticPilotCase()],{type:'application/json;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='nexo-caso-inteiramente-ficticio-13-7.json';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='Arquivo do caso fictício criado. Nenhuma escolha de revisão ou resposta desta visita foi incluída.';
    }
  },{signal});
  window.addEventListener('pagehide',()=>{reset();life.abort();},{once:true});
}
