const ACTIVITIES = {estudiar:"Estudio", descansar:"Descanso y recreación", comer:"Comer"};
const FEATURES = {enchufe:["Enchufes","plug"], silencio:["Silencio","quiet"], grupo:["Mesas grupales","group"], aire:["Aire libre","sun"], techo:["Bajo techo","roof"], venta:["Venta de comida","eat"]};
const ACT_CODES = {E:"estudiar", D:"descansar", C:"comer"};
const FEATURE_CODES = {1:"enchufe", 2:"silencio", 3:"grupo", 4:"aire", 5:"techo", 6:"venta"};
const PLACES = CATALOGO.map(item => ({
  id:item.id, name:item.nombre, loc:item.ubicacion, desc:item.descripcion,
  acts:item.actividades.map(code => ACT_CODES[code]),
  features:item.caracteristicas.map(code => FEATURE_CODES[code]),
  photo:item.foto.trim(), directionsUrl:item.comoLlegar.trim(),
  cap:item.aforo, open:item.apertura, close:item.cierre, levels:item.ocupacionPorHora
}));
const byId = id => PLACES.find(p=>p.id===id);
const DAY = 86400000, MIN = 60000, WINDOW = 15*MIN;
const hh = t => new Date(t).getUTCHours();
const mm = t => new Date(t).getUTCMinutes();
const fmt = t => String(hh(t)).padStart(2,"0")+":"+String(mm(t)).padStart(2,"0");
function baseState(p,t){
 const h=hh(t);
 if(h<p.open||h>=p.close)return {type:"closed",label:"Cerrado",pct:null,rank:5};
 const a=p.levels[h-p.open],b=h+1===p.close?a:p.levels[h-p.open+1];
 const pct=Math.round(a+(b-a)*mm(t)/60);
 if(pct>=90)return {type:"full",label:"Lleno",rank:3,pct};
 if(pct>=75)return {type:"tight",label:"Casi lleno",rank:2,pct};
 if(pct>=50)return {type:"mid",label:"Ocupación media",rank:1,pct};
 return {type:"free",label:"Disponible",rank:0,pct};
}
function latestVotes(reports,id,t){
 const latest=new Map();
 reports.filter(r=>r.id===id&&r.time<=t&&t-r.time<WINDOW&&r.vote).sort((a,b)=>a.time-b.time).forEach(r=>latest.set(r.actor,r.vote));
 return [...latest.values()];
}
function placeState(p,t,reports){
 const base=baseState(p,t), votes=latestVotes(reports,p.id,t);
 const full=votes.filter(v=>v==="full").length,free=votes.filter(v=>v==="free").length;
 const alert=base.rank<3&&full>=3&&full>free;
 return {...base,base,full,free,alert,...(alert?{type:"full",rank:3,label:"Lleno según reportes"}:{})};
}
function rankPlaces(activity,filters,t,reports){
 return PLACES.filter(p=>(!activity||p.acts.includes(activity))&&filters.every(f=>p.features.includes(f))).map(p=>({p,s:placeState(p,t,reports)})).sort((a,b)=>a.s.rank-b.s.rank||(a.s.pct??101)-(b.s.pct??101)||a.p.name.localeCompare(b.p.name,"es"));
}
