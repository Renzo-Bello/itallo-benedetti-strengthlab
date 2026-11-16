'use strict';
// Navigation uses the existing date/day keys: no record is moved or overwritten.
function trainingWeekIndex(value){return Math.floor((dayNumber(value)-dayNumber(programStart()))/7);}
function openTrainingWeek(index){
 if(!Number.isInteger(index)||index<0||index>3)return;
 const w=weekInfo(index);
 const existing=recordedSessions().filter(s=>s.day===day&&s.date>=w.start&&s.date<=w.end).at(-1);
 date=existing?.date||(today()>=w.start&&today()<=w.end?today():w.start);
 render();
}
function renderTrainingWeeks(){
 const selected=trainingWeekIndex(date),current=trainingWeekIndex(today());
 $('training-current').textContent=current>=0&&current<4?'SEMANA '+(current+1)+' · ACTUAL':'4 SEMANAS';
 $('training-weeks').innerHTML=Array.from({length:4},(_,i)=>{
  const w=weekInfo(i),sessions=weekSessions(i),completed=new Set(sessions.filter(s=>s.finished).map(s=>s.day)).size;
  return '<button type="button" class="training-week '+(i===selected?'active':'')+'" data-training-week="'+i+'" aria-pressed="'+(i===selected)+'"><span>Semana '+(i+1)+'</span><small>'+pretty(w.start)+' — '+pretty(w.end)+'</small><strong>'+(i===current?'Actual':i>current?'Próxima':'Anterior')+'</strong><small>'+completed+' / 3 días completados</small></button>';
 }).join('');
 $('training-weeks').querySelectorAll('button').forEach(b=>b.onclick=()=>openTrainingWeek(Number(b.dataset.trainingWeek)));
 $('training-week-summary').textContent=selected>=0&&selected<4?'Mes 1 → Semana '+(selected+1)+' · Empujes / Tirón / Pierna + brazos':'La fecha seleccionada está fuera del mes 1. Puedes consultar tus registros o volver a una de sus cuatro semanas.';
}
renderTrainingWeeks();
