'use strict';
const MUSCLES={
 'press-pecho':[['chest','triceps','shoulders'],'Pectoral mayor · tríceps · deltoides anterior'],
 peck:[['chest'],'Pectoral mayor'],
 'militar-mancuernas':[['shoulders','triceps'],'Deltoides · tríceps'],
 laterales:[['shoulders'],'Deltoides lateral'],
 'extension-triceps':[['triceps'],'Tríceps'],
 dominadas:[['back','biceps'],'Dorsal ancho · bíceps · espalda media'],
 jalon:[['back','biceps'],'Dorsal ancho · bíceps'],
 'remo-polea-abierto':[['back','biceps','shoulders'],'Espalda media · dorsal ancho · deltoides posterior · bíceps'],
 'remo-unilateral':[['back','biceps'],'Dorsal ancho · romboides · bíceps'],
 'inclinado-curl':[['biceps'],'Bíceps braquial'],
 hack:[['quads','glutes'],'Cuádriceps · glúteos'],
 'leg-extension':[['quads'],'Cuádriceps'],
 'leg-curl':[['hamstrings'],'Isquiotibiales'],
 aductores:[['adductors'],'Aductores de cadera'],
 'predicador-unilateral':[['biceps'],'Bíceps braquial'],
 'triceps-v':[['triceps'],'Tríceps']
};
function muscleCard(id){
 const [active,names]=MUSCLES[id]||[[],'Consulta la pauta'];
 const path=(group,d)=>`<path class="${active.includes(group)?'muscle-active':'muscle-shape'}" d="${d}"/>`;
 const body='<circle cx="50" cy="17" r="11" fill="#383833" stroke="#777363"/><path d="M43 29L57 29L62 36L73 40L81 68L84 92L76 94L69 70L65 61L63 87L68 102L65 140L62 170L52 170L51 139L50 117L49 139L48 170L38 170L35 140L32 102L37 87L35 61L31 70L24 94L16 92L19 68L27 40L38 36Z" fill="#232420" stroke="#777363" stroke-width="1.2"/>';
 const front=path('chest','M37 43Q43 39 49 43L49 60L38 58Z M51 43Q57 39 63 43L62 58L51 60Z')+path('shoulders','M29 42L36 40L35 56L25 59Z M64 40L71 42L75 59L65 56Z')+path('biceps','M25 61L33 59L29 78L22 77Z M67 59L75 61L78 77L71 78Z')+path('quads','M36 101L44 103L46 133L37 134Z M56 103L64 101L63 134L54 133Z')+path('adductors','M45 101L50 105L48 126L44 115Z M50 105L55 101L56 115L52 126Z');
 const back=path('back','M37 42L50 36L63 42L62 67L55 82L45 82L38 67Z')+path('shoulders','M29 42L36 40L35 56L25 59Z M64 40L71 42L75 59L65 56Z')+path('triceps','M25 61L33 59L29 78L22 77Z M67 59L75 61L78 77L71 78Z')+path('glutes','M38 86L49 88L49 104L35 102Z M51 88L62 86L65 102L51 104Z')+path('hamstrings','M36 106L47 107L45 134L37 134Z M53 107L64 106L63 134L55 134Z');
 return `<div class="muscle-card"><svg viewBox="0 0 204 192" role="img" aria-label="Músculos principales: ${names}"><title>${names}</title><g>${body}${front}</g><g transform="translate(104 0)">${body}${back}</g><text x="50" y="186" text-anchor="middle" fill="#aaa18d" font-size="9">FRENTE</text><text x="154" y="186" text-anchor="middle" fill="#aaa18d" font-size="9">ESPALDA</text></svg><div><strong>Músculos trabajados</strong><p>${names}</p><small>Dorado: grupos principales · Esquema orientativo</small></div></div>`;
}

// Historical session snapshots retain their original exercise IDs.
MUSCLES.militar=MUSCLES["militar-mancuernas"];
MUSCLES.predicador=MUSCLES["predicador-unilateral"];

