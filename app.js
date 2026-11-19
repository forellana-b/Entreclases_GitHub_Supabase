"use strict";
const PATHS={pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',book:'<path d="M3 5q5-2 9 1 4-3 9-1v13q-5-2-9 1-4-3-9-1Z"/><path d="M12 6v13"/>',leaf:'<path d="M4 19C2 10 7 4 20 4c0 11-5 17-14 14M4 20 15 9"/>',eat:'<path d="M5 3v6q0 4 3 4t3-4V3M8 3v18M18 3q-4 4-4 10h4m0-10v18"/>',sliders:'<path d="M3 7h6m4 0h8M3 17h10m4 0h4"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',star:'<path d="m12 2 2.2 7.5L22 12l-7.8 2.3L12 22l-2.4-7.7L2 12l7.6-2.5Z"/>',walk:'<circle cx="14" cy="4" r="2"/><path d="m5 13 4-2 2-4 4 1 2 5h4m-9-5-2 7 4 3 2 4m-6-8-2 5-4 3"/>',plug:'<path d="M7 3v5m7-5v5M4 8h13v2a6 6 0 0 1-6 6v4m0-1q0 3 4 3"/>',quiet:'<path d="M3 9h4l5-5v16l-5-5H3Zm13 0 5 6m0-6-5 6"/>',group:'<path d="M3 10h18v4H3zm2 4v6m14-6v6M7 5h3m4 0h3"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',roof:'<path d="m2 11 10-8 10 8M5 10v11h14V10"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',chat:'<path d="M3 5h18v12H9l-6 4Z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'};
const I = n => '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24">'+(PATHS[n]||'')+'</svg>';
const ACTICON={estudiar:"book",descansar:"leaf",comer:"eat"};
const esc = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const $=q=>document.querySelector(q);
const KEY="entreclases-san-joaquin-v2";
const start=()=>({offset:Date.UTC(2026,0,12,11)-Date.now(),reports:[],incidents:[],reviews:[]});
let data;
try{data=JSON.parse(localStorage.getItem(KEY));if(!data||!Number.isFinite(data.offset)||!Array.isArray(data.reports))data=start()}catch{data=start()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}}
if(!Array.isArray(data.incidents))data.incidents=[];
if(!Array.isArray(data.reviews))data.reviews=[];
save();
const now=()=>Date.now()+data.offset;
let activity="estudiar", filters=[],exploreAct="", searchTerm="", returnView="inicio", currentDialog="", lastMinute="",toastTimer;
function route(){const a=location.hash.slice(1).split("/");return a[0]==="espacio"&&byId(a[1])?{view:"detail",id:a[1]}:{view:a[0]==="explorar"?"explorar":"inicio"}}
function alertText(message){clearTimeout(toastTimer);$("#toast").textContent=message;toastTimer=setTimeout(()=>$("#toast").textContent="",3500)}
const tags=(p,limit=3)=>'<div class="tags">'+p.features.slice(0,limit).map(f=>'<span>'+I(FEATURES[f][1])+FEATURES[f][0]+'</span>').join('')+'</div>';
const pill=s=>'<span class="pill '+s.type+'"><i></i>'+s.label+'</span>';
const activitiesOf = p => p.acts.map(a => ACTIVITIES[a]).join(" · ");
function directions(p,style){
 let url;
 try{url=new URL(p.directionsUrl)}catch{}
 if(!url || !["https:","http:"].includes(url.protocol)){
  return '<span class="route-pending">'+I("pin")+'Cómo llegar · enlace pendiente</span>';
 }
 return '<a class="'+style+'" href="'+esc(url.href)+'" target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar a '+esc(p.name)+' (abre otra pestaña)">'+I("pin")+'Cómo llegar ↗</a>';
}
function photo(p,kind){
 const icon=p.acts.includes("estudiar")?"book":p.features.includes("venta")?"eat":"leaf";
 const tone=p.features.includes("venta")?"clay":p.features.includes("aire")?"sage":"blue";
 const fallback='<div class="photo-empty '+tone+'"'+(p.photo?' hidden':'')+'><span class="photo-glyph">'+I(icon)+'</span><span>Foto no disponible</span></div>';
 const image=p.photo?'<img class="place-photo" src="'+esc(p.photo)+'" alt="'+esc(p.name)+'" '+(kind==="thumb"?'loading="lazy"':'')+'>':'';
 return '<div class="photo-frame '+kind+'">'+fallback+image+'</div>';
}
document.addEventListener("error",e=>{
 if(e.target.classList?.contains("place-photo")){
  const placeholder=e.target.parentElement.querySelector(".photo-empty");
  if(placeholder)placeholder.hidden=false;
  e.target.remove();
 }
},true);
let sharedReviews = [];
let reviewStatus = "loading";
let fetchNumber = 0;
async function cargarResenas(){
 const number = ++fetchNumber;
 try {
  const rows = await Resenas.leer();
  if (number !== fetchNumber) return;
  sharedReviews = rows;
  reviewStatus = "ready";
 } catch(error) {
  if (number !== fetchNumber) return;
  reviewStatus = "error";
  console.warn("Lectura de reseñas:",error.message);
 }
 if (!d.open && document.activeElement?.id !== "search-places") render();
}
function reviewsFor(id){return sharedReviews.filter(r=>r.id===id)}
function reviewScore(reviews){
 if(!reviews.length)return "";
 const average=reviews.reduce((total,r)=>total+r.stars,0)/reviews.length;
 return average.toLocaleString("es-CL",{minimumFractionDigits:1,maximumFractionDigits:1});
}
function ratingLine(p){
 const reviews=reviewsFor(p.id);
 return reviews.length?'<span class="rating-summary">★ '+reviewScore(reviews)+' · '+reviews.length+' '+(reviews.length===1?'reseña':'reseñas')+'</span>':'';
}
const op=p=>String(p.open).padStart(2,'0')+':00–'+String(p.close).padStart(2,'0')+':00';
function activityButtons(value,all=false){return '<div class="intent" role="group" aria-label="Actividad">'+(all?'<button class="chip '+(!value?'on':'')+'" aria-pressed="'+!value+'" data-act="">Todos</button>':'')+Object.entries(ACTIVITIES).map(([k,v])=>'<button class="chip '+(k===value?'on':'')+'" aria-pressed="'+(k===value)+'" data-act="'+k+'">'+I(ACTICON[k])+v+'</button>').join('')+'</div>'}
function filterButton(){return '<button data-do="filters" class="filterbtn" aria-label="Filtros de espacios'+(filters.length?', '+filters.length+' activos':'')+'">'+I("sliders")+'<span class="filterlabel">Filtros</span>'+(filters.length?' ('+filters.length+')':'')+'</button>'}
function filterTags(){return filters.length?'<div class="activefilters">'+filters.map(f=>'<button data-remove="'+f+'" aria-label="Quitar filtro '+FEATURES[f][0]+'">'+FEATURES[f][0]+' ×</button>').join('')+'</div>':''}
function placeLink(p){return '#espacio/'+p.id}
function card({p,s}){
 return '<a class="card" href="'+placeLink(p)+'"><div class="card-image">'+photo(p,"thumb")+pill(s)+'</div><div class="cardcopy"><div class="row"><h3>'+esc(p.name)+'</h3><span class="roundarrow">'+I("arrow")+'</span></div><div class="meta">'+esc(p.loc||activitiesOf(p))+'</div>'+ratingLine(p)+'<div class="barfoot">'+tags(p,3)+'</div></div></a>';
}
function feature({p,s}){
 return '<article class="feature"><div class="feature-art">'+photo(p,"feature-photo")+'<span class="flag">'+I("star")+'Mejor opción</span></div><div class="feature-copy">'+pill(s)+'<h2>'+esc(p.name)+'</h2><div class="meta">'+esc(p.loc||activitiesOf(p))+'</div><p>'+esc(p.desc)+'</p>'+tags(p)+'<div class="actions"><a class="btn" href="'+placeLink(p)+'">Ver espacio '+I("arrow")+'</a>'+directions(p,"textbtn")+'</div></div></article>';
}
function intro(label,title,subtitle){return '<div class="intro"><div class="eyebrow">'+I("pin")+label+'</div><h1>'+title+'</h1><p>'+subtitle+'</p></div>'}
const fold = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function exploreResults(t){
 const query=fold(searchTerm.trim());
 const rows=rankPlaces(exploreAct,filters,t,data.reports).filter(({p})=>fold(p.name+" "+p.loc).includes(query));
 return '<p class="res" role="status">'+rows.length+' de '+PLACES.length+' espacios</p>'+(rows.length?'<div class="cards">'+rows.map(card).join('')+'</div>':'<div class="empty"><p>No encontramos espacios con esta combinación.</p><button class="btn alt" data-do="show-all">Ver los 20 espacios</button></div>');
}
function listing(view,t){
 const explore=view==="explorar", act=explore?exploreAct:activity;
 const controls='<div class="hero-ctrl">'+activityButtons(act,explore)+filterButton()+'</div>'+filterTags();
 if(explore){
  return intro('Campus San Joaquín','Explora los espacios.','Consulta los 20 lugares del campus y encuentra uno por nombre, actividad o equipamiento.')+
   '<div class="catalog-search"><label for="search-places">Buscar por nombre o edificio</label><input id="search-places" type="search" placeholder="Ej. Lassen, CAI, Starbucks…" value="'+esc(searchTerm)+'"></div>'+controls+'<div id="explore-results">'+exploreResults(t)+'</div>';
 }
 const rows=rankPlaces(act,filters,t,data.reports),hero=rows.find(x=>x.s.rank<3),rest=rows.filter(x=>x!==hero).slice(0,3);
 const empty='<div class="empty"><p>'+(rows.length?'Los espacios compatibles están llenos o cerrados a esta hora.':'Ningún espacio coincide con esta combinación.')+'</p>'+(filters.length?'<button class="btn alt" data-do="clear-filters">Quitar filtros</button>':'<button class="btn alt" data-do="show-all">Explorar todos los espacios</button>')+'</div>';
 const other=rest.length?'<div class="section-head"><h2 class="section-title">Otras opciones</h2><a class="minilink" data-related href="#explorar">Ver todas '+I("arrow")+'</a></div><div class="cards">'+rest.map(card).join('')+'</div>':'';
 return intro('Campus San Joaquín','Encuentra tu espacio.','¿Qué quieres hacer entre clases? Elige una actividad para ver dónde ir.')+controls+(hero?feature(hero):empty)+other;
}
function historyChart(p){const series=p.levels,peak=Math.max(...series),hours=series.map((v,i)=>v===peak?i+p.open:null).filter(h=>h!==null);
 return '<div class="panel"><h2>Ocupación por hora</h2><p>Mayor ocupación habitual entre las <b>'+hours[0]+':00 y '+(hours[0]+1)+':00</b>.</p><div class="chart" role="img" aria-label="Perfil horario simulado. Máximo de '+peak+' por ciento a las '+hours[0]+' horas.">'+series.map((v,i)=>'<span class="'+(v===peak?'peak':'')+'" style="height:'+v+'%" title="'+(p.open+i)+':00 · '+v+'%"></span>').join('')+'</div><div class="chartlabels"><span>'+p.open+':00</span><span>'+Math.floor((p.open+p.close)/2)+':00</span><span>'+p.close+':00</span></div><small class="hint">Perfil de un día de clases simulado.</small></div>'}
function details(id,t){
 const p=byId(id),s=placeState(p,t,data.reports),notes=data.reports.filter(r=>r.id===id&&r.time<=t&&t-r.time<DAY).sort((a,b)=>b.time-a.time);
 const reportLink='<button data-do="report" class="btn alt">'+I("chat")+' Reportar</button>';
 const signal=s.base.pct===null?'Fuera del horario de apertura.':'Estimación simulada de ocupación: '+s.base.pct+' % del aforo.';
 const noteHtml=notes.length?notes.slice(0,12).map(r=>'<div class="comment"><small>'+fmt(r.time)+' · '+(r.actor==="local"?"Tu reporte":"Participante simulado")+'</small><strong>'+(r.vote==="full"?'Está lleno':r.vote==="free"?'Hay lugar':'Comentario')+'</strong>'+(r.text?'<p>'+esc(r.text)+'</p>':'')+'</div>').join(''):'<p>Todavía no hay reportes en este espacio. Si estás aquí, puedes contar qué encontraste.</p>';
 const recentIncidents=(data.incidents||[]).filter(i=>i.id===id&&i.time<=t&&t-i.time<DAY);
 const audit=recentIncidents.length?'<div class="notice"><strong>Discrepancias en las últimas 24 h: '+recentIncidents.length+'.</strong> Último aviso a las '+fmt(Math.max(...recentIncidents.map(i=>i.time)))+'. Conviene contrastar el conteo con los puestos utilizables.</div>':'';
 return '<a class="detailback" href="#'+returnView+'">'+I("back")+' Volver '+(returnView==="explorar"?'a explorar':'a recomendaciones')+'</a><div class="detailhero"><div class="detailcopy">'+pill(s)+'<h1 class="detail-title">'+esc(p.name)+'</h1><div class="meta">'+esc(p.loc||'Campus San Joaquín')+'</div><p>'+esc(p.desc)+'</p>'+tags(p,6)+'<div class="actions">'+directions(p,"btn alt")+' <button class="textbtn" data-do="report">'+I("chat")+' Reportar</button></div></div>'+photo(p,"detail-photo")+'</div><div class="panels"><section class="panel"><h2>Datos del espacio</h2><dl class="specs">'+[['Aforo simulado',p.cap+' personas'],['Horario simulado',op(p)],['Enchufes',p.features.includes('enchufe')?'Sí':'No'],['Actividades',p.acts.map(a=>ACTIVITIES[a]).join(' · ')]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl><p>'+signal+'</p>'+(s.alert?'<div class="notice"><b>Medición por revisar.</b> '+s.full+' reportes recientes indican que está lleno. La recomendación usa esta alerta.</div>':'')+'</section>'+historyChart(p)+'</div><section class="panel reportpanel"><div class="split"><div><h2>Reportes del lugar</h2><p>¿Coincide con lo que ves?</p></div>'+reportLink+'</div>'+noteHtml+audit+'<small class="hint">Comentarios de las últimas 24 h de la demo, visibles en este navegador.</small></section>'+reviewPanel(p);
}
function reviewPanel(p){
 const reviews=reviewsFor(p.id),summary=reviews.length?'★ '+reviewScore(reviews)+' de 5 · '+reviews.length+' '+(reviews.length===1?'reseña':'reseñas'):reviewStatus==="loading"?"Cargando reseñas…":reviewStatus==="error"?"No se pudieron cargar las reseñas. Recarga la página para reintentar.":"Aún no hay reseñas.";
 const entries=[...reviews].reverse().map(r=>'<article class="comment"><small>'+esc(r.author||"Estudiante")+'</small><span class="review-stars" aria-label="'+r.stars+' de 5 estrellas">'+('★'.repeat(r.stars))+('☆'.repeat(5-r.stars))+'</span>'+(r.text?'<p>'+esc(r.text)+'</p>':'')+'</article>').join('');
 return '<section class="panel reportpanel"><div class="split"><div><h2>Reseñas del lugar</h2><p>'+summary+'</p></div><button class="btn alt" data-do="review">Escribir reseña</button></div>'+entries+'<small class="hint">Reseñas públicas de estudiantes.</small></section>';
}
function showReview(){
 const p=byId(route().id);
 modal("review","Tu reseña de "+esc(p.name),'<form id="reviewform"><p>¿Cómo fue tu experiencia en este lugar?</p><fieldset class="rating-field"><legend>Puntuación</legend><div class="star-picker">'+[1,2,3,4,5].map(n=>'<label><input required type="radio" name="stars" value="'+n+'" aria-label="'+n+' '+(n===1?'estrella':'estrellas')+'"><span aria-hidden="true">★</span></label>').join('')+'</div><span id="rating-label" class="hint" aria-live="polite">Elige de 1 a 5 estrellas</span></fieldset><label class="lbl" for="review-author">Nombre o alias (opcional)</label><input class="review-author" id="review-author" maxlength="40" placeholder="Estudiante"><label class="lbl" for="review-text">Tu experiencia (opcional)</label><textarea id="review-text" maxlength="360" placeholder="¿Qué le serviría saber a otro estudiante?"></textarea><p class="hint">Tu reseña será pública. Para avisar que el lugar está lleno, usa Reportar.</p><button class="btn">Guardar reseña</button></form>');
}
function render(){const r=route(),t=now();$("#clock").textContent=fmt(t);lastMinute=Math.floor(t/MIN);document.querySelectorAll("[data-nav]").forEach(a=>{const on=a.dataset.nav===(r.view==="detail"?returnView:r.view);if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});$("#main").innerHTML=r.view==="detail"?details(r.id,t):listing(r.view,t);document.title=(r.view==="detail"?byId(r.id).name:r.view==="explorar"?"Explorar espacios":"Encuentra tu espacio")+" · Entreclases"}
const d=$("#modal");
function modal(type,top,body){currentDialog=type;$("#modal-body").innerHTML='<div class="drawer"><div class="modal-top"><div><div class="eyebrow">Entreclases</div><h2 id="modaltitle">'+top+'</h2></div><button aria-label="Cerrar" class="close" data-do="close">'+I("close")+'</button></div>'+body+'</div>';d.setAttribute("aria-labelledby","modaltitle");if(!d.open)d.showModal()}
function close(){if(d.open)d.close();currentDialog=""}
function showFilters(){modal("filters","Filtrar espacios",'<form id="filterform"><p>Muestra solo lugares que cumplan con todo lo que elijas.</p><div class="checks">'+Object.entries(FEATURES).map(([f,[txt,icon]])=>'<label class="check"><input type="checkbox" name="feature" value="'+f+'" '+(filters.includes(f)?'checked':'')+'>'+I(icon)+txt+'</label>').join('')+'</div><div class="modal-actions"><button class="btn">Aplicar filtros</button><button type="button" class="textbtn" data-do="clear-filters">Quitar filtros</button></div></form>')}
function showReport(){const id=route().id;if(!id)return;modal("report","Reportar en "+esc(byId(id).name),'<form id="reportform"><p>Cuenta cómo está el lugar ahora. Los reportes recientes se comparan con la estimación.</p><label class="lbl" for="vote">¿Qué encontraste?</label><select id="vote"><option value="full">Está lleno</option><option value="free">Hay lugar</option><option value="">Solo quiero comentar</option></select><label class="lbl" for="comment">Comentario <span class="hint">(opcional si marcas un estado)</span></label><textarea maxlength="240" id="comment" placeholder="Ej. Hay asientos libres, pero las mesas grupales están ocupadas."></textarea><p class="hint">Se guardará en este navegador. Evita incluir datos personales.</p><button class="btn">Guardar reporte '+I("arrow")+'</button></form>')}
function demo(){const t=now(),r=route(),p=r.id?byId(r.id):rankPlaces(activity,filters,t,data.reports).find(x=>x.s.rank<3)?.p||PLACES[0];modal("demo","Controles de simulación",'<p>Prueba cómo cambia la recomendación a lo largo del día. La demo empieza a las 11:00 y el reloj avanza mientras pasa el tiempo.</p><form id="timeform"><label class="lbl" for="hour">Hora simulada de Campus San Joaquín</label><select id="hour">'+Array.from({length:24},(_,h)=>'<option value="'+h+'" '+(h===hh(t)?'selected':'')+'>'+String(h).padStart(2,'0')+':00</option>').join('')+'</select><div class="modal-actions"><button class="btn">Aplicar hora</button></div></form><hr><h2>Probar reportes</h2><p>Añade dos participantes ficticios que encontraron lleno un espacio. Tu propio reporte puede ser el tercero.</p><label class="lbl" for="target">Espacio de la prueba</label><select id="target">'+PLACES.map(x=>'<option value="'+x.id+'" '+(x.id===p.id?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select><div class="modal-actions"><button class="btn alt" data-do="simulate">Añadir dos reportes de «Está lleno»</button></div><hr><button class="textbtn" data-do="reset">Reiniciar la demo desde las 11:00</button>')}
function showHow(){
 modal("how","Cómo funciona Entreclases",'<p><b>Elige una actividad.</b> Busca dónde estudiar, descansar y recrearte, o comer en Campus San Joaquín. Los filtros se aplican juntos. Un lugar puede servir para comer algo que llevas sin tener venta de comida.</p><p><b>Compara la disponibilidad.</b> Se elige un lugar abierto según su categoría de ocupación y, en caso de empate, el menor porcentaje estimado. Las opciones llenas se excluyen de la primera recomendación. Los horarios, aforos y niveles de ocupación son simulados.</p><p><b>Reporta lo que ves.</b> Tres participantes distintos que indiquen «Está lleno» en 15 minutos, y sean más que quienes indiquen «Hay lugar», activan una alerta temporal. La ficha conserva la estimación original.</p><p><b>Valora tu experiencia.</b> Las reseñas de 1 a 5 estrellas tienen su propio promedio. La disponibilidad se calcula de forma independiente. Las reseñas se comparten entre visitantes. Los reportes de ocupación son locales durante la simulación.</p><p><b>Cómo llegar</b> abre la página de indicaciones de cada lugar cuando se ha cargado su enlace.</p><button class="btn" data-do="close">Entendido</button>');
}
function addReport(id,actor,vote,txt,t){
 const p=byId(id),was=placeState(p,t,data.reports).alert;
 data.reports.push({id,actor,vote,text:txt,time:t});
 if(!was && placeState(p,t,data.reports).alert)data.incidents.push({id,time:t});
}
$("#demo-open").onclick=demo;$("#how").onclick=showHow;
document.addEventListener("click",e=>{
 const a=e.target.closest("a.card,a.btn[href^='#espacio']");if(a&&route().view!=="detail")returnView=route().view;
 if(e.target.closest("[data-related]")){exploreAct=activity;searchTerm=""}
 const el=e.target.closest("[data-act],[data-do],[data-remove]");if(!el)return;
 if(el.hasAttribute("data-act")){if(route().view==="explorar")exploreAct=el.dataset.act;else activity=el.dataset.act;render();$("#main [data-act='"+el.dataset.act+"']")?.focus({preventScroll:true});return}
 if(el.dataset.remove){filters=filters.filter(f=>f!==el.dataset.remove);render();return}
 switch(el.dataset.do){
 case "close":close();break;
 case "filters":showFilters();break;
 case "clear-filters":filters=[];close();render();break;
 case "show-all":filters=[];exploreAct="";searchTerm="";if(route().view==="explorar")render();else location.hash="explorar";break;
 case "report":showReport();break;
 case "review":showReview();break;
 case "simulate":{const id=$("#target").value,t=now();addReport(id,"demo-a","full","",t-1000);addReport(id,"demo-b","full","",t);save();close();if(route().view!=="detail")returnView=route().view;location.hash="espacio/"+id;render();alertText("Dos participantes simulados reportaron que está lleno.");break}
 case "reset":modal("reset","¿Reiniciar la prueba?",'<p>Se borrarán los reportes de ocupación de esta demo y el horario volverá a las 11:00.</p><div class="modal-actions"><button class="btn" data-do="reset-confirm">Reiniciar</button><button class="btn alt" data-do="close">Cancelar</button></div>');break;
 case "reset-confirm":data={...start(),reviews:data.reviews};activity="estudiar";filters=[];exploreAct="";searchTerm="";returnView="inicio";save();close();location.hash="inicio";render();alertText("Demo reiniciada.");break;
 }
});
document.addEventListener("submit",async e=>{if(!["filterform","reportform","timeform","reviewform"].includes(e.target.id))return;e.preventDefault();
 if(e.target.id==="reviewform"){
  const stars=Number(new FormData(e.target).get("stars"));
  if(!(Number.isInteger(stars)&&stars>=1&&stars<=5))return;
  const form=e.target;
  const submit=form.querySelector('button[type="submit"],button:not([type])');
  if(submit.disabled)return;
  submit.disabled=true;
  const place=route().id;
  try {
   await Resenas.guardar(place,stars,$("#review-author").value.trim(),$("#review-text").value.trim());
  }catch(error){
   console.warn("Escritura de reseña:",error.message);
   let msg=form.querySelector(".review-error");
   if(!msg){msg=document.createElement("p");msg.className="review-error";msg.setAttribute("role","alert");form.append(msg)}
   msg.textContent=error.code==="23505"?"Ya enviaste una reseña para este lugar desde esta sesión.":"No se pudo guardar la reseña. Revisa la conexión o la configuración de Supabase.";
   submit.disabled=false;
   return;
  }
  if(form.isConnected && d.open)close();
  alertText("Tu reseña se guardó en Supabase.");
  await cargarResenas();
  return;
 }
 if(e.target.id==="filterform")filters=new FormData(e.target).getAll("feature");
 if(e.target.id==="timeform"){const t=now();data.offset=Math.floor(t/DAY)*DAY+Number($("#hour").value)*60*MIN-Date.now();save()}
 if(e.target.id==="reportform"){const txt=$("#comment").value.trim(),vote=$("#vote").value;if(!txt&&!vote){$("#comment").setCustomValidity("Escribe un comentario o selecciona un estado.");$("#comment").reportValidity();return}addReport(route().id,"local",vote,txt,now());save();alertText("Tu reporte se guardó.")}
 close();render();
});
document.addEventListener("input",e=>{
 if(e.target.id==="search-places"){searchTerm=e.target.value;$("#explore-results").innerHTML=exploreResults(now())}
 if(e.target.name==="stars"){
  const stars=Number(e.target.value);
  d.querySelectorAll(".star-picker label").forEach((label,i)=>label.classList.toggle("chosen",i<stars));
  $("#rating-label").textContent=stars+(stars===1?" estrella":" estrellas");
 }
});
d.addEventListener("input",()=>{if($("#comment"))$("#comment").setCustomValidity("")});
d.addEventListener("click",e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close()}});
window.addEventListener("hashchange",()=>{close();render();window.scrollTo(0,0);$("#main").focus({preventScroll:true})});
window.addEventListener("storage",e=>{if(e.key===KEY&&e.newValue){try{const x=JSON.parse(e.newValue);if(Number.isFinite(x.offset)&&Array.isArray(x.reports)&&Array.isArray(x.reviews)&&Array.isArray(x.incidents)){data=x;render()}}catch{}}});
setInterval(()=>{if(!d.open&&document.activeElement?.id!=="search-places"&&Math.floor(now()/MIN)!==lastMinute)render()},3000);
render();

cargarResenas();
window.addEventListener("focus",cargarResenas);
