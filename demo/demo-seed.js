'use strict';
window.makeDemoState = () => {
 const iso = offset => {const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const sample={version:1,athlete:'usuario-demo',routineRevision:2,programStart:iso(-14),sessions:{}};
 for(let week=0;week<2;week++) for(let day=0;day<3;day++) {
  const date=iso(-14+week*7+day*2),plan=structuredClone(ROUTINE[day]),entries={};
  plan.exercises.forEach((ex,index)=>{entries[ex.id]=ex.blocks.flatMap(block=>Array.from({length:block.sets},()=>({kg:(index===0?40:15)+week*2.5,reps:parseInt(block.reps,10)||10,rir:'1',done:true})));});
  sample.sessions[date+'_'+day]={date,day,plan,entries,finished:true,cardioRequired:true,cardioDone:true,cardioSkipped:false};
 }
 return sample;
};
try {if(!localStorage.getItem('strengthlab-demo-v1'))localStorage.setItem('strengthlab-demo-v1',JSON.stringify(window.makeDemoState()));}catch{}
