'use strict';
(() => {
 const key='strengthlab-itallo-v1';
 const blank=()=>({version:1,athlete:'itallo-benedetti',sessions:{},programStart:''});
 let initial=blank(),readError=false;
 try {const raw=localStorage.getItem(key);if(raw){initial=JSON.parse(raw);if(initial?.athlete!=='itallo-benedetti'||initial.version!==1||!initial.sessions||Array.isArray(initial.sessions))throw Error('Formato inválido');}} catch {initial=blank();readError=true;}
 const now=new Date(),localToday=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 initial.programStart ||= Object.values(initial.sessions).filter(Plan.hasRecord).map(s=>s.date).sort()[0]||localToday;
 if(initial.routineRevision!==2){
  if(initial.coachPlan){initial.previousCoachPlan=initial.coachPlan;try{initial.coachPlan=Plan.upgrade(initial.coachPlan);}catch{delete initial.coachPlan;}}
  initial.routineRevision=2;window.planLoadMessage='Rutina actualizada: RIR de semana 1 y nuevos ejercicios. Tus sesiones registradas se conservan.';
 }
 try{if(initial.coachPlan)Plan.apply(initial.coachPlan);}catch{window.planLoadMessage='No se pudo recuperar la pauta. Puedes volver a importarla.';}
 Plan.refreshEmptySessions(initial);
 try{localStorage.setItem(key,JSON.stringify(initial));}catch{}
 const planHash=new URLSearchParams(location.hash.slice(1)).get('plan');
 if(planHash&&initial.lastPlanLink!==planHash){try{const clean=Plan.decode(planHash);Plan.apply(clean);initial.coachPlan=clean;initial.lastPlanLink=planHash;Plan.refreshEmptySessions(initial);localStorage.setItem(key,JSON.stringify(initial));window.planLoadMessage='Pauta de RIR y videos recibida. Las sesiones anteriores se conservan.';}catch{window.planLoadMessage='No se pudo aplicar el enlace de pauta. Pide un enlace nuevo a Renzo.';}}
 window.initialState=initial;
 const status=text=>{document.getElementById('save-status').textContent=text;};
 window.Cloud={
  save(next){try{localStorage.setItem(key,JSON.stringify(next));status('Guardado en este navegador');return true;}catch{status('No se pudo guardar. Descarga una copia desde Progreso antes de salir.');return false;}},
  async saveStart(value){const next={...state,programStart:value};return this.save(next);},
  applyRole(){},
  validateDay(plan){if(!plan||typeof plan.name!=='string'||typeof plan.subtitle!=='string'||!Array.isArray(plan.exercises)||plan.exercises.length>40)throw Error('Plan inválido');for(const ex of plan.exercises){if(ex?.targetRir!==undefined&&(!Array.isArray(ex.targetRir)||ex.targetRir.length!==ex.blocks?.reduce((n,b)=>n+b.sets,0)||ex.targetRir.some(r=>!Plan.RIR.includes(r))))throw Error('RIR pautado inválido');if(ex?.video!==undefined&&(typeof ex.video!=='string'||(ex.video&&!Plan.safeVideo(ex.video))))throw Error('Video inválido');if(!ex||typeof ex.name!=='string'||!/^[-a-z0-9]+$/.test(ex.id)||typeof ex.note!=='string'||(ex.image!==''&&!/^assets\/[-a-z0-9]+\.(jpg|png|webp)$/.test(ex.image))||typeof ex.body!=='boolean'||!Array.isArray(ex.blocks)||ex.blocks.length>10)throw Error('Ejercicio inválido');for(const b of ex.blocks)if(!b||!['Main','Top set','Back off'].includes(b.type)||!Number.isInteger(b.sets)||b.sets<1||b.sets>20||typeof b.reps!=='string'||b.reps.length>80)throw Error('Series inválidas');}}
 };
 window.addEventListener('DOMContentLoaded',()=>{if(readError)status('No se pudo recuperar el registro local. Importa una copia desde Progreso.');});
})();
