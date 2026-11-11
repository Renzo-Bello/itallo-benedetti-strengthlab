'use strict';
const DAY_MS=86400000;
const dayNumber=value=>Date.parse(value+'T00:00:00Z')/DAY_MS;
const addDays=(value,n)=>new Date((dayNumber(value)+n)*DAY_MS).toISOString().slice(0,10);
function programStart(){return state.programStart||recordedSessions()[0]?.date||today();}

let reportIndex=Math.max(0,Math.min(7,Math.floor((dayNumber(today())-dayNumber(programStart()))/7)));
function weekInfo(index){const start=addDays(programStart(),index*7);return {start,end:addDays(start,6),month:Math.floor(index/4)+1,week:index%4+1};}
function weekSessions(index){const w=weekInfo(index);return recordedSessions().filter(s=>s.date>=w.start&&s.date<=w.end);}
function updatePeriodCaption(){const i=Math.floor((dayNumber(date)-dayNumber(programStart()))/7);$('session-period').textContent=i>=0&&i<8?`Mes ${Math.floor(i/4)+1} / Semana ${i%4+1}`:'Fuera de las 8 semanas del programa';}
function renderReportControls(){
 $('program-start').value=programStart();
 document.querySelectorAll('[data-month]').forEach(b=>{const active=Number(b.dataset.month)===Math.floor(reportIndex/4);b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 const base=Math.floor(reportIndex/4)*4;
 $('report-weeks').innerHTML=Array.from({length:4},(_,n)=>{const i=base+n,w=weekInfo(i),count=weekSessions(i).filter(s=>s.finished).length;return `<button data-week="${i}" class="week ${i===reportIndex?'active':''}" aria-pressed="${i===reportIndex}"><span>Semana ${n+1}</span><small>${w.start.slice(8)}/${w.start.slice(5,7)} — ${w.end.slice(8)}/${w.end.slice(5,7)}</small><i>${count} ${count===1?'sesión':'sesiones'}</i></button>`;}).join('');
 $('report-weeks').querySelectorAll('button').forEach(b=>b.onclick=()=>selectWeek(Number(b.dataset.week)));
 const w=weekInfo(reportIndex);$('report-range').textContent=`${pretty(w.start)} — ${pretty(w.end)}`;
}
function selectWeek(index){reportIndex=index;renderReportControls();$('report-output').innerHTML='<div class="empty">Genera el reporte de la semana seleccionada.</div>';}
document.querySelectorAll('[data-month]').forEach(b=>b.onclick=()=>selectWeek(Number(b.dataset.month)*4));
$('program-start').onchange=()=>{const value=$('program-start').value;if(!value||!Number.isFinite(dayNumber(value))){$('program-start').value=programStart();return;}window.Cloud.saveStart(value).then(ok=>{if(ok){state.programStart=value;Plan.refreshEmptySessions(state);persist();render();updatePeriodCaption();selectWeek(reportIndex);}else $('program-start').value=programStart();});};
function weekMaximum(sessions,id){const values=sessions.flatMap(s=>s.entries[id]||[]).filter(v=>v?.done&&v.kg!=='').map(v=>Number(v.kg));return values.length?Math.max(...values):null;}
function reportRows(list){const rows=[];for(const s of list)if(s.cardioRequired||s.cardioDone)rows.push({date:s.date,day:s.day,name:'Bicicleta estática',index:'—',type:'Final',target:'15 min',kg:'',reps:'',done:s.cardioDone===true,body:false,cardio:true,skipped:s.cardioSkipped===true});for(const s of list)for(const ex of routineFor(s).exercises)setsFor(ex).forEach((set,i)=>{const v=s.entries[ex.id]?.[i];if(v&&(v.kg!==''||v.reps!==''||(v.rir??'')!==''||v.done))rows.push({date:s.date,day:s.day,name:ex.name,index:i+1,type:set.type,target:set.reps,kg:v.kg,reps:v.reps,targetRir:ex.targetRir?.[i]||'',actualRir:v.rir??'',done:v.done,body:ex.body});});return rows;}
function generateReport(){
 const w=weekInfo(reportIndex),list=weekSessions(reportIndex),prev=reportIndex?weekSessions(reportIndex-1):[],rows=reportRows(list),done=list.filter(s=>s.finished).length,series=rows.filter(r=>r.done&&!r.cardio).length;
 const comparisons=uniqueExercises.map(ex=>({ex,current:weekMaximum(list,ex.id),previous:weekMaximum(prev,ex.id)})).filter(x=>x.current!==null);
 const table=()=>list.flatMap(s=>{const selected=rows.filter(r=>r.date===s.date&&r.day===s.day);return selected.length?[`<div class="report-session"><div class="report-session-title"><h4>Día ${s.day+1} · ${escapeHTML(routineFor(s).name)}</h4><span>${pretty(s.date)} · ${s.finished?'Completada':'En curso'}</span></div><div class="table-scroll"><table><thead><tr><th>Ejercicio</th><th>Serie / bloque</th><th>Repeticiones objetivo</th><th>Kg</th><th>Reps</th><th>RIR pautado</th><th>RIR real</th><th>Estado</th></tr></thead><tbody>${selected.map(r=>`<tr><td>${escapeHTML(r.name)}${r.body?'<small>Lastre añadido</small>':''}</td><td>${r.index} · ${escapeHTML(r.type)}</td><td>${escapeHTML(r.target)}</td><td>${r.kg===''?'—':fmt(r.kg)}</td><td>${r.reps===''?'—':fmt(r.reps)}</td><td>${escapeHTML(r.targetRir||'—')}</td><td>${escapeHTML(r.actualRir||'—')}</td><td>${r.done?'✓ Hecha':r.skipped?'Omitida por molestias':'Pendiente'}</td></tr>`).join('')}</tbody></table></div></div>`]:[];}).join('');
 $('report-output').innerHTML=`<div class="report-actions"><span class="mono">REPORTE GENERADO</span><div><button id="report-csv" class="quiet" ${rows.length?'':'disabled'}>Descargar CSV</button><button id="report-pdf" class="primary">Descargar PDF ↓</button><button id="share-pdf" class="quiet">Compartir PDF ↗</button></div></div><article class="report-paper" id="print-report"><div class="report-heading"><div><p class="eyebrow">STRENGTHLAB · REPORTE DEMO</p><h2>${escapeHTML(window.demoName || "(usuario)")}</h2></div><div><strong>Mes ${w.month} / Semana ${w.week}</strong><p>${pretty(w.start)} — ${pretty(w.end)}</p></div></div><div class="report-summary"><div><b>${done}</b><span>Sesiones completas</span></div><div><b>${series}</b><span>Series completadas</span></div><div><b>${new Set(list.filter(s=>completedCount(s)>0).map(s=>s.day)).size} / ${ROUTINE.length}</b><span>Días de rutina registrados</span></div><div><b>${rows.filter(r=>r.cardio&&r.done).length}</b><span>Bicicletas de 15 min</span></div></div><div class="report-day-status">${ROUTINE.map((d,i)=>{const found=list.filter(s=>s.day===i);return `<span><b>Día ${i+1}</b> ${found.some(s=>s.finished)?'Completado':found.length?'En curso':'Sin registro'}</span>`;}).join('')}</div>${list.length?`${comparisons.length?`<h3>Cargas máximas</h3><p class="report-note">Solo series completadas. Comparación con la semana anterior del programa; los kg en fondos y dominadas corresponden al lastre.</p><div class="table-scroll"><table><thead><tr><th>Ejercicio</th><th>Esta semana</th><th>Anterior</th><th>Cambio</th></tr></thead><tbody>${comparisons.map(({ex,current,previous})=>`<tr><td>${escapeHTML(ex.name)}</td><td>${fmt(current)} kg</td><td>${previous===null?'—':fmt(previous)+' kg'}</td><td>${previous===null?'Sin comparación':(current-previous>0?'+':'')+fmt(current-previous)+' kg'}</td></tr>`).join('')}</tbody></table></div>`:''}<h3>Detalle por sesión</h3>${table()}`:'<div class="report-empty">Sin registros para esta semana.</div>'}<p class="report-note report-end">Generado el ${pretty(today())}. Los campos «—» no fueron registrados. Datos ficticios de demostración.</p></article>`;
 const buildPDF=()=>{
  if(!window.jspdf){toast('No se pudo cargar el generador de PDF. Recarga la página.');return;}
  const pdf=new window.jspdf.jsPDF();
  const clean=s=>String(s).replace(/[–—]/g,'-').replace(/✓/g,'');
  pdf.setFont('helvetica','bold');pdf.setFontSize(10);pdf.setTextColor(145,113,60);pdf.text('STRENGTHLAB',14,18);
  pdf.setTextColor(25);pdf.setFontSize(24);pdf.text(window.demoName || '(usuario)',14,32);
  pdf.setFont('helvetica','normal');pdf.setFontSize(11);pdf.text(`Mes ${w.month} / Semana ${w.week}`,14,42);
  pdf.setTextColor(90);pdf.setFontSize(9);pdf.text(clean(`${pretty(w.start)} — ${pretty(w.end)}`),14,49);
  pdf.text(`${done} sesiones completas  /  ${series} series completadas  /  ${rows.filter(r=>r.cardio&&r.done).length} sesiones de bicicleta`,14,59);
  let y=69;
  const options={theme:'grid',styles:{font:'helvetica',fontSize:8,cellPadding:3,lineColor:[225,225,225],lineWidth:.1},headStyles:{fillColor:[31,29,26],textColor:[255,255,255]},alternateRowStyles:{fillColor:[249,247,243]},margin:{left:14,right:14,top:16,bottom:18}};
  if(comparisons.length){pdf.setTextColor(25);pdf.setFontSize(12);pdf.text('Cargas máximas · kg',14,y);pdf.autoTable({...options,startY:y+5,head:[['Ejercicio','Esta semana','Anterior','Cambio']],body:comparisons.map(({ex,current,previous})=>[ex.name,fmt(current),previous===null?'-':fmt(previous),previous===null?'-':(current>previous?'+':'')+fmt(current-previous)])});y=pdf.lastAutoTable.finalY+12;}
  if(rows.length){if(y>240){pdf.addPage();y=22;}pdf.setTextColor(25);pdf.setFontSize(12);pdf.text('Detalle por sesión',14,y);pdf.autoTable({...options,startY:y+5,head:[['Fecha / Día','Ejercicio','Serie / Bloque','Repeticiones objetivo','Kg','Reps','RIR pautado','RIR real','Estado']],body:rows.map(r=>[r.date+' / D'+(r.day+1),r.name+(r.body?' (lastre)':''),r.index+' / '+r.type,clean(r.target),r.kg===''?'-':fmt(r.kg),r.reps===''?'-':fmt(r.reps),r.targetRir||'-',r.actualRir||'-',r.done?'Hecha':r.skipped?'Omitida por molestias':'Pendiente'])});}
  else{pdf.setFontSize(11);pdf.text('Sin registros para esta semana.',14,y);}
  const pages=pdf.internal.getNumberOfPages();for(let i=1;i<=pages;i++){pdf.setPage(i);pdf.setFontSize(7);pdf.setTextColor(110);pdf.text('RIR: repeticiones en reserva. F: fallo. Vacío: sin registrar. Fondos/dominadas: lastre.',14,285);pdf.text(`${i} / ${pages}`,195,285,{align:'right'});}
  return pdf;
 };
 const pdfName=`usuario-demo-mes-${w.month}-semana-${w.week}.pdf`;
 $('report-pdf').onclick=()=>buildPDF()?.save(pdfName);
 $('share-pdf').onclick=async()=>{
  const pdf=buildPDF();if(!pdf)return;
  const file=new File([pdf.output('blob')],pdfName,{type:'application/pdf'});
  if(navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file],title:'Reporte semanal · Usuario demo',text:'Renzo, te comparto mi reporte semanal de entrenamiento.'});}
   catch(error){if(error.name!=='AbortError'){pdf.save(pdfName);toast('PDF descargado. Adjunta el archivo en tu conversación con Renzo.');}}
  }else{pdf.save(pdfName);toast('PDF descargado. Adjunta el archivo en WhatsApp para enviarlo a Renzo.');}
 };
 $('report-csv').onclick=()=>{const values=[['Mes','Semana','Fecha','Día','Ejercicio','Serie','Bloque','Repeticiones objetivo','Kg','Reps','RIR pautado','RIR real','Estado'],...rows.map(r=>[w.month,w.week,r.date,r.day+1,r.name,r.index,r.type,r.target,r.kg,r.reps,r.targetRir||'',r.actualRir||'',r.done?'Hecha':r.skipped?'Omitida por molestias':'Pendiente'])];download(`usuario-demo-mes-${w.month}-semana-${w.week}.csv`,'\uFEFF'+values.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');};
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('report-output').animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
}
$('generate-report').onclick=generateReport;
updatePeriodCaption();renderReportControls();
// A single navigation marker follows the selected section and adapts on resize.
const nav=document.querySelector('nav'),marker=document.createElement('i');marker.className='nav-marker';nav.appendChild(marker);
function moveMarker(){const active=nav.querySelector('button.active');marker.hidden=!active;if(!active)return;marker.style.width=active.offsetWidth+'px';marker.style.transform=`translateX(${active.offsetLeft}px)`;}
new MutationObserver(moveMarker).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});new ResizeObserver(moveMarker).observe(nav);document.fonts.ready.then(moveMarker);moveMarker();


