'use strict';
const Plan = (()=>{
 const RIR=['','5+','5','4','3','2','1','0','F'];
 const all=()=>ROUTINE.flatMap(d=>d.exercises);
 const count=ex=>ex.blocks.reduce((n,b)=>n+b.sets,0);
 function safeVideo(value){if(!value)return '';try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password&&value.length<=2048?u.href:'';}catch{return '';}}
 function validate(input){
  if(!input||input.version!==1||input.revision!==2||input.athlete!=='usuario-demo'||!Array.isArray(input.exercises)||input.exercises.length!==all().length)throw Error('Pauta inválida para usuario.');
  const seen=new Set();const exercises=input.exercises.map(v=>{const ex=all().find(e=>e.id===v?.id);if(!ex||seen.has(v.id)||!Array.isArray(v.rir)||v.rir.length!==v.sets||v.rir.some(r=>!RIR.includes(r))||!Number.isInteger(v.sets)||v.sets<1||v.sets>8||typeof v.reps!=='string'||v.reps.length>60||typeof v.video!=='string'||(v.video&&!safeVideo(v.video)))throw Error('Revisa los valores RIR y las direcciones de los videos.');seen.add(v.id);return {id:v.id,sets:v.sets,reps:v.reps,rir:[...v.rir],video:safeVideo(v.video)};});
  return {version:1,revision:2,athlete:'usuario-demo',exercises};
 }
 function current(){return {version:1,revision:2,athlete:'usuario-demo',exercises:all().map(e=>({id:e.id,sets:count(e),reps:e.blocks.map(b=>b.reps).every(r=>r===e.blocks[0].reps)?e.blocks[0].reps:e.blocks.map(b=>b.reps).join(' / '),rir:Array.from({length:count(e)},(_,i)=>e.targetRir?.[i]||''),video:e.video||''}))};}
 function apply(input){const clean=validate(input);for(const item of clean.exercises){const ex=all().find(e=>e.id===item.id);const oldReps=ex.blocks.map(b=>b.reps).every(r=>r===ex.blocks[0].reps)?ex.blocks[0].reps:ex.blocks.map(b=>b.reps).join(' / ');if(count(ex)!==item.sets||oldReps!==item.reps)ex.blocks=[{type:'Main',sets:item.sets,reps:item.reps||'Por pautar'}];if(['hack','leg-extension','leg-curl','aductores'].includes(ex.id)&&item.reps&&item.reps!=='Por pautar')ex.note='Sigue el recorrido y las cargas indicadas por tu entrenador. Detén el ejercicio si aparece dolor.';ex.targetRir=item.rir;ex.video=item.video;}return clean;}
 function hasRecord(s){return s.cardioDone||s.cardioSkipped||s.finished||Object.values(s.entries||{}).some(a=>a.some(v=>v&&(v.kg!==''||v.reps!==''||(v.rir??'')!==''||v.done)));}
 function forDate(day,date,state){const plan=structuredClone(ROUTINE[day]);const start=state.programStart||Object.values(state.sessions||{}).filter(hasRecord).map(s=>s.date).sort()[0]||date;const offset=(Date.parse(date+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000;return plan;}
 function refreshEmptySessions(state){for(const s of Object.values(state.sessions||{}))if(!hasRecord(s)&&ROUTINE[s.day])s.plan=forDate(s.day,s.date,state);}
 function upgrade(input){if(input?.revision===2)return validate(input);if(input?.athlete!=='usuario-demo'||input?.version!==1||!Array.isArray(input.exercises))throw Error('Pauta anterior inválida.');const next=current(),changed=new Set(['jalon','remo-unilateral','triceps-v']);for(const e of next.exercises){const old=input.exercises.find(v=>v?.id===e.id);if(!old)continue;if(!changed.has(e.id)){e.sets=old.sets;e.reps=old.reps;e.rir=Array.from({length:Number.isInteger(old.sets)&&old.sets>=1&&old.sets<=8?old.sets:0},()=>e.rir[0]);}e.video=old.video;}return validate(next);}
 function encode(plan){return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(validate(plan))))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
 function decode(text){if(text.length>60000)throw Error('Enlace demasiado largo.');const bytes=Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));return validate(JSON.parse(new TextDecoder().decode(bytes)));}
 return {RIR,safeVideo,validate,current,apply,upgrade,forDate,hasRecord,refreshEmptySessions,encode,decode};
})();

