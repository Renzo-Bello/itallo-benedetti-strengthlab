'use strict';
(() => {
 const input=document.getElementById('demo-name');
 function applyName(name){
  window.demoName=name.trim().slice(0,40)||'(usuario)';
  document.getElementById('demo-greeting').textContent=window.demoName;
  document.getElementById('demo-athlete').textContent=window.demoName==='(usuario)'?'Tu espacio personal':window.demoName;
  document.getElementById('demo-avatar').textContent=window.demoName==='(usuario)'?'SL':window.demoName.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  document.title=`Hola ${window.demoName} · StrengthLab Demo`;
  document.getElementById('report-output').innerHTML='<div class="empty">Selecciona una semana para generar su reporte.</div>';
 }
 let saved='';try{saved=localStorage.getItem('strengthlab-demo-name')||'';}catch{}
 input.value=saved;applyName(saved);
 document.getElementById('demo-personalize').onsubmit=e=>{e.preventDefault();applyName(input.value);try{localStorage.setItem('strengthlab-demo-name',input.value.trim().slice(0,40));}catch{}toast('Demo personalizada.');};
 document.getElementById('demo-reset').onclick=()=>{
  if(!confirm('¿Reiniciar la demo? Se borrarán el nombre y los cambios de esta demostración y volverán los datos de ejemplo.'))return;
  try{localStorage.removeItem('strengthlab-demo-v1');localStorage.removeItem('strengthlab-demo-name');localStorage.removeItem('strengthlab-demo-onboarding-v1');}catch{toast('No se pudo reiniciar el almacenamiento.');return;}
  const url=new URL(location.href);url.hash='';location.replace(url.href);
 };
})();
