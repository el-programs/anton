import * as db from "./db.js";

/* ---------- Hilfen ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let NOW=new Date();
const sod=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const at=(d,h,m)=>{const x=new Date(d);x.setHours(h,m||0,0,0);return x};
const key=d=>{const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
const same=(a,b)=>key(a)===key(b);
let TODAY=sod(NOW);
function tick(){NOW=new Date();TODAY=sod(NOW)}
const WD=["So","Mo","Di","Mi","Do","Fr","Sa"];
const WDL=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
const MON=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const hm=d=>String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
const dmy=d=>d.getDate()+". "+MON[d.getMonth()];
const daysBetween=(a,b)=>Math.round((sod(b)-sod(a))/864e5);
const toLocalInput=d=>d?key(d)+"T"+hm(d):"";

/* ---------- Typen ---------- */
const TYPES={
  "Erinnerung":{i:"bell",c:"#d9a35b",due:1,rep:1},
  "Notiz":{i:"note",c:"#7fb2bf"},
  "Gedanke":{i:"thought",c:"#a593c4"},
  "Checkliste":{i:"checks",c:"#7fb08a"},
  "To-do":{i:"todo",c:"#7d9cc4",due:1,rep:1},
  "Challenge":{i:"flag",c:"#cdb86a",due:1},
  "Termin":{i:"cal",c:"#c98a94",due:1,rep:1}
};
const TYPE_ORDER=["Erinnerung","Notiz","Gedanke","Checkliste","To-do","Challenge","Termin"];
const icon=t=>`<span class="ic" style="background:${TYPES[t].c}17;color:${TYPES[t].c}">${L(TYPES[t].i)}</span>`;
const SRC={Outlook:"#7d9cc4",Proton:"#a593c4"};
const ACCENTS=[["Petrol","#6aa9a6"],["Salbei","#8fb89c"],["Sand","#cfb183"],["Taubenblau","#8ea6c6"],["Altrosa","#c99a9a"],["Lavendel","#a69bd0"],["Blau","#6f9fd8"],["Terrakotta","#c98a6b"],["Oliv","#a3a86a"],["Silber","#a0a4aa"]];

/* ---------- SVG-Symbole ---------- */
const LP={
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  note:'<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
  thought:'<path d="M7.5 17.5h8a4.5 4.5 0 0 0 .6-8.96A5.5 5.5 0 0 0 5.6 10.4 3.6 3.6 0 0 0 7.5 17.5z"/><circle cx="6" cy="20.5" r="1"/>',
  checks:'<path d="M4 6.5l1.6 1.6L8.5 5M4 12.5l1.6 1.6 2.9-3.1M4 18.5l1.6 1.6 2.9-3.1"/><path d="M11.5 7h8.5M11.5 13h8.5M11.5 19h8.5"/>',
  todo:'<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.5 2.5 4.9-5"/>',
  flag:'<path d="M5 21V4M5 4.5h11.5l-2 3.75 2 3.75H5"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8.5 8.5"/>',
  camera:'<path d="M4 8.5A2 2 0 0 1 6 6.5h1.8l1.4-2h5.6l1.4 2H18a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  repeat:'<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-1a5 5 0 0 1 5-5h11M7 21.5l-3-3 3-3"/><path d="M20 12.5v1a5 5 0 0 1-5 5H4"/>',
  star:'<path d="M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z"/>',
  hourglass:'<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4 8 5 8 8.5s-8 4.5-8 8.5M16 3.5c0 4-8 5-8 8.5s8 4.5 8 8.5"/>',
  start:'<circle cx="12" cy="12" r="8.5"/><path d="M10.5 9l4 3-4 3z"/>',
  stop:'<circle cx="12" cy="12" r="8.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>',
  template:'<rect x="4.5" y="3.5" width="15" height="17" rx="2.5"/><path d="M8.5 3.5v3h7v-3M8.5 11h7M8.5 15h4.5"/>',
  copy:'<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  alarm:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M4.5 4.5l2.5-2M19.5 4.5l-2.5-2"/>',
  down:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  up:'<path d="M12 20V9M7.5 13.5L12 9l4.5 4.5M5 4.5h14"/>',
  trash:'<path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5l1-13"/>',
  all:'<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'
};
const L=(n,sz)=>`<svg viewBox="0 0 24 24" width="${sz||18}" height="${sz||18}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LP[n]}</svg>`;
const SV={
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  arch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4"/></svg>',
  stat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 20V12M12 20V5M19 20v-9"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="#9a9aa0"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.6" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="2" stroke-linecap="round">'+[0,45,90,135,180,225,270,315].map(a=>`<line x1="12" y1="2.2" x2="12" y2="4.6" transform="rotate(${a} 12 12)"/>`).join("")+'</g></svg>',
  grip:'<svg viewBox="0 0 14 14" fill="currentColor"><circle cx="4" cy="3" r="1.3"/><circle cx="10" cy="3" r="1.3"/><circle cx="4" cy="7" r="1.3"/><circle cx="10" cy="7" r="1.3"/><circle cx="4" cy="11" r="1.3"/><circle cx="10" cy="11" r="1.3"/></svg>',
  search:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>'
};

/* ---------- Daten ---------- */
let NID=1;
function mk(o){return Object.assign({id:NID++,type:"Notiz",title:"",body:"",cat:"Privat",due:null,repeat:"Nie",star:false,status:"open",created:new Date(),archived:null,items:[],links:[],photos:[],chal:null,order:0},o)}
const entries=[];
const events=[]; // Termine aus Outlook und Proton, Abruf folgt
const templates=[];

/* ---------- Zustand ---------- */
const S={view:"dash",cat:"Alle",type:null,ignored:new Set(),accent:"#6aa9a6",calMode:"month",calMonth:new Date(TODAY.getFullYear(),TODAY.getMonth(),1),calSel:new Date(TODAY),calCat:"Alle",calType:null,period:"Jahr",nightFrom:"21:00",alarm:"06:30",cleanup:"90",archF:"Alle",archQ:"",archSel:null,syncedAt:null,lastBackup:null,lastMorning:null,lastNight:null,alarmSet:null};
const SAVED_SETTINGS=["accent","nightFrom","alarm","cleanup","lastBackup","lastMorning","lastNight","alarmSet"];
function setAccent(c){S.accent=c;document.documentElement.style.setProperty("--accent",c)}

/* ---------- Speichern ---------- */
// Einträge werden als JSON gespeichert; nur geänderte Einträge werden geschrieben.
const iso=d=>d?new Date(d).toISOString():null;
const date=v=>v?new Date(v):null;
function toRec(e){return{id:e.id,type:e.type,title:e.title,body:e.body,cat:e.cat,due:iso(e.due),repeat:e.repeat,star:e.star,status:e.status,created:iso(e.created),archived:iso(e.archived),
  items:e.items,links:e.links,photos:e.photos,order:e.order,chal:e.chal?{start:iso(e.chal.start),end:iso(e.chal.end),days:[...e.chal.days],result:e.chal.result}:null}}
function fromRec(r){return Object.assign(mk({}),r,{due:date(r.due),created:date(r.created)||new Date(),archived:date(r.archived),items:r.items||[],links:r.links||[],photos:r.photos||[],
  chal:r.chal?{start:date(r.chal.start),end:date(r.chal.end),days:new Set(r.chal.days||[]),result:r.chal.result||null}:null})}
const snap=new Map();
let saveTimer=null,saving=Promise.resolve();
function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(flush,120)}
function flush(){
  clearTimeout(saveTimer);
  const put=[],seen=new Set();
  for(const e of entries){const r=toRec(e);const j=JSON.stringify(r);seen.add(e.id);if(snap.get(e.id)!==j){snap.set(e.id,j);put.push(r)}}
  const del=[];for(const id of snap.keys())if(!seen.has(id)){del.push(id);snap.delete(id)}
  const settings={};SAVED_SETTINGS.forEach(k=>settings[k]=S[k] instanceof Date?S[k].toISOString():S[k]);settings.ignored=[...S.ignored];
  const sj=JSON.stringify(settings),tj=JSON.stringify(templates);
  saving=saving.then(async()=>{
    await db.writeEntries(put,del);
    if(sj!==flush.s){await db.setKV("settings",settings);flush.s=sj}
    if(tj!==flush.t){await db.setKV("templates",JSON.parse(tj));flush.t=tj}
  }).catch(err=>{console.error(err);toast("Speichern fehlgeschlagen. Ist der Speicher des iPhones voll?")});
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flush()});
window.addEventListener("pagehide",flush);

/* ---------- Fotos ---------- */
// Fotos liegen als Blob in der Datenbank; Einträge speichern nur die Foto-ID.
const photoUrls=new Map(),pendingPhotos=new Map();
const newPhotoId=()=>"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function photoImg(id,alt){const u=photoUrls.get(id);return `<img data-photo="${id}" ${u?`src="${u}"`:""} alt="${alt}">`}
async function hydratePhotos(root){
  for(const img of (root||document).querySelectorAll("img[data-photo]:not([src])")){
    const id=img.dataset.photo;let u=photoUrls.get(id);
    if(!u){const b=pendingPhotos.get(id)||await db.getPhoto(id);if(!b)continue;u=URL.createObjectURL(b);photoUrls.set(id,u)}
    img.src=u;
  }
}

const isOpen=e=>e.status==="open";
const byId=id=>entries.find(e=>e.id===+id);
const isOver=e=>isOpen(e)&&e.due&&e.due<NOW&&e.type!=="Termin";
const visibleEvents=()=>events.filter(x=>!S.ignored.has(x.id));
function streak(ch){if(!ch||!ch.days)return 0;let n=0,d=new Date(TODAY);if(!ch.days.has(key(d)))d=addD(d,-1);while(ch.days.has(key(d))){n++;d=addD(d,-1)}return n}
function dueText(e){
  if(!e.due)return "";const d=e.due,dd=daysBetween(TODAY,d);
  if(isOver(e)){if(dd===0)return `<span class="over">Überfällig · heute ${hm(d)}</span>`;if(dd===-1)return '<span class="over">Überfällig · gestern</span>';return `<span class="over">Überfällig · seit ${-dd} Tagen</span>`}
  if(dd===0)return "Heute "+hm(d);if(dd===1)return "Morgen "+hm(d);
  return WD[d.getDay()]+" "+d.getDate()+"."+(d.getMonth()+1)+". "+hm(d);
}
function attachText(e){const p=[];if(e.links.length)p.push(e.links.length+(e.links.length>1?" Links":" Link"));if(e.photos.length)p.push(e.photos.length+(e.photos.length>1?" Fotos":" Foto"));return p.join(" · ")}
function chalInfo(e){const c=e.chal;if(!c||!c.start)return null;const total=daysBetween(c.start,c.end)+1;const day=Math.min(total,Math.max(1,daysBetween(c.start,TODAY)+1));return{total,day,pct:Math.round(day/total*100)}}

/* ---------- Tab-Leiste ---------- */
function renderTabs(){
  const t=(v,ic,l)=>`<button class="tab${S.view===v?" on":""}" data-act="tab" data-v="${v}" aria-label="${l}">${SV[ic]}${l}</button>`;
  $("#tabs").innerHTML=t("dash","list","Dashboard")+t("cal","cal","Kalender")+`<button class="plus" id="plusBtn" aria-label="Neuer Eintrag (lange drücken: schneller Gedanke)">${SV.plus}</button>`+t("arch","arch","Archiv")+t("stat","stat","Statistik");
  bindPlus();
}

/* ---------- Dashboard ---------- */
function sortedOpen(){
  return entries.filter(e=>isOpen(e)&&e.type!=="Termin").filter(e=>(S.cat==="Alle"||e.cat===S.cat)&&(!S.type||e.type===S.type))
    .sort((a,b)=>{const ga=isOver(a)?0:a.star?1:2,gb=isOver(b)?0:b.star?1:2;return ga-gb||a.order-b.order});
}
function rowHTML(e){
  const t=e.type;let meta=[];let prog="";
  if(t==="Checkliste"){const d=e.items.filter(i=>i.d).length;meta.push(d+" von "+e.items.length);prog=`<div class="prog"><i style="width:${e.items.length?d/e.items.length*100:0}%"></i></div>`}
  if(t==="Challenge"){const ci=chalInfo(e);if(ci){meta.push(`Tag ${ci.day} von ${ci.total} · ${streak(e.chal)} in Folge`);prog=`<div class="prog"><i style="width:${ci.pct}%"></i></div>`}else meta.push("Ohne Zeitraum")}
  const dt=dueText(e);if(dt)meta.unshift(dt);
  const at=attachText(e);if(at)meta.push(at);
  if(!meta.length&&e.body)meta.push(esc(e.body.slice(0,40)));
  return `<div class="row" data-id="${e.id}"><div class="sw-bg"><span class="l">✓ Erledigt</span><span class="r">Löschen</span></div>
  <div class="item" data-act="open" data-id="${e.id}">${icon(t)}<div class="txt"><div class="ttl">${e.star?'<span class="star">★</span> ':""}${esc(e.title)}</div><div class="meta">${meta.join(" · ")}<span class="tag">${e.cat}</span></div>${prog}</div><span class="grip" aria-label="Verschieben">${SV.grip}</span></div></div>`;
}
function todayItems(){
  const ev=visibleEvents().filter(x=>same(x.start,TODAY)).map(x=>({t:x.start,title:x.title,src:x.src,col:SRC[x.src],act:"event",id:x.id}));
  const own=entries.filter(e=>isOpen(e)&&e.type==="Termin"&&e.due&&same(e.due,TODAY)).map(e=>({t:e.due,title:e.title,src:"Anton",col:TYPES.Termin.c,act:"open",id:e.id}));
  return ev.concat(own).sort((a,b)=>a.t-b.t);
}
function renderDash(){
  const list=sortedOpen();
  const dueN=entries.filter(e=>isOpen(e)&&e.type!=="Termin"&&e.due&&(e.due<NOW||same(e.due,TODAY))).length;
  const ti=todayItems();
  const chips=["Alle","Privat","Arbeit"].map(c=>`<button class="chip${S.cat===c?" on":""}" data-act="cat" data-v="${c}">${c}</button>`).join("")+`<button class="chip${S.type?" on":""}" data-act="typeFilter">${S.type?esc(S.type)+" ✕":"Art ▾"}</button>`;
  $("#app").innerHTML=`
  <header class="head"><h1>${WDL[NOW.getDay()]}</h1><span class="date">${dmy(NOW)} · ${dueN} fällig</span><span class="sp"></span>
  <button class="iconbtn" data-act="night" aria-label="Gute Nacht">${SV.moon}</button><button class="iconbtn" data-act="settings" aria-label="Einstellungen">${SV.gear}</button></header>
  <div class="chips">${chips}</div>
  <div class="sec"><span>Heute</span><b>${ti.length} ${ti.length===1?"Termin":"Termine"}</b></div>
  ${S.syncedAt?`<div class="sync">Outlook und Proton abgerufen um ${hm(S.syncedAt)}</div>`:""}
  <div class="events">${ti.length?ti.map(x=>`<button class="ev" data-act="${x.act}" data-id="${x.id}"><span class="t">${hm(x.t)}</span><span class="bar" style="background:${x.col}"></span><span class="nm">${esc(x.title)}</span><span class="src">${x.src}</span></button>`).join(""):'<div class="empty">Heute keine Termine</div>'}</div>
  <div class="sec"><span>Einträge</span><span>${list.length}</span></div>
  <div class="list" id="dlist">${list.length?list.map(rowHTML).join(""):emptyDash()}</div>
  ${list.length?'<p class="hint">Nach rechts wischen: erledigt · nach links: löschen · am Griff ziehen: verschieben</p>':""}`;
  document.querySelectorAll("#dlist .row").forEach(r=>{swipe(r,{right:id=>{if(byId(id).type==="Challenge"){render();chalResult(id)}else archive(id,"done")},left:id=>archive(id,"deleted")});dragSort(r)});
}
function emptyDash(){
  const any=entries.some(e=>isOpen(e)&&e.type!=="Termin");
  if(any)return '<div class="empty">Keine Einträge für diesen Filter.</div>';
  return `<div class="welcome"><span class="ic" style="background:color-mix(in srgb,var(--accent) 16%,#000);color:var(--accent)">${L("note",20)}</span><h2>Noch keine Einträge</h2><p>Tippe unten auf +, um deinen ersten Eintrag anzulegen. Lange drücken öffnet direkt einen Gedanken.</p></div>`;
}
function chalResult(id){const e=byId(id);sheet(`<h2>${esc(e.title)}</h2><p class="sub">Wie ist die Challenge ausgegangen?</p><div class="btnrow"><button class="btn" data-act="chRes" data-id="${id}" data-v="ok" type="button">Geschafft</button><button class="btn red" data-act="chRes" data-id="${id}" data-v="fail" type="button">Versagt</button></div><button class="btn ghost" data-act="closeSheet" type="button">Abbrechen</button>`)}
function nextDue(d,r){const x=new Date(d);const step=()=>{if(r==="Täglich")x.setDate(x.getDate()+1);else if(r==="Wöchentlich")x.setDate(x.getDate()+7);else if(r==="Monatlich")x.setMonth(x.getMonth()+1);else x.setFullYear(x.getFullYear()+1)};step();while(x<NOW)step();return x}
function archive(id,st){
  const e=byId(id);e.status=st;e.archived=new Date();let nx=null;
  if(st==="done"&&e.due&&e.repeat&&e.repeat!=="Nie"){nx=mk({...e,id:undefined,status:"open",archived:null,created:new Date(),due:nextDue(e.due,e.repeat),items:e.items.map(i=>({...i,d:false})),links:e.links.slice(),photos:e.photos.slice()});nx.id=NID++;entries.push(nx)}
  render();
  toast(st==="done"?(nx?"Erledigt · nächster Termin "+dueText(nx).replace(/<[^>]+>/g,""):"Erledigt · ins Archiv verschoben"):"Gelöscht · im Archiv",()=>{e.status="open";e.archived=null;if(nx)entries.splice(entries.indexOf(nx),1);render()});
}

/* ---------- Wischen mit Abbruch ---------- */
function swipe(row,{right,left,rl,ll}){
  const it=row.querySelector(".item");let sx=0,sy=0,dx=0,on=false,dec=false,hz=false,pid=null,block=false;
  if(rl)row.querySelector(".sw-bg .l").textContent=rl;if(ll)row.querySelector(".sw-bg .r").textContent=ll;
  const TH=()=>Math.min(150,row.offsetWidth*.4);
  row.addEventListener("pointerdown",e=>{if(e.target.closest(".grip")||e.button>0)return;sx=e.clientX;sy=e.clientY;dx=0;on=true;dec=false;hz=false;pid=e.pointerId});
  row.addEventListener("pointermove",e=>{
    if(!on)return;const mx=e.clientX-sx,my=e.clientY-sy;
    if(!dec){if(Math.abs(mx)<10&&Math.abs(my)<10)return;dec=true;hz=Math.abs(mx)>Math.abs(my)*1.3;if(!hz){on=false;return}try{row.setPointerCapture(pid)}catch(_){}row.classList.add("drag")}
    dx=mx;it.style.transform=`translateX(${dx}px)`;row.dataset.dir=dx>0?"r":"l";row.classList.toggle("arm",Math.abs(dx)>TH());
  });
  const end=()=>{
    if(!on)return;on=false;if(!hz)return;block=true;setTimeout(()=>block=false,50);row.classList.remove("drag");
    const id=+row.dataset.id;
    if(dx>TH()&&right){it.style.transform=`translateX(${row.offsetWidth}px)`;setTimeout(()=>right(id),170)}
    else if(dx<-TH()&&left){it.style.transform=`translateX(${-row.offsetWidth}px)`;setTimeout(()=>left(id),170)}
    else{it.style.transform="";row.classList.remove("arm");setTimeout(()=>{delete row.dataset.dir},180)}
  };
  row.addEventListener("pointerup",end);row.addEventListener("pointercancel",()=>{if(on&&hz){dx=0;end()}on=false});
  row.addEventListener("click",e=>{if(block){e.stopPropagation();e.preventDefault()}},true);
}

/* ---------- Verschieben am Griff ---------- */
function dragSort(row){
  const g=row.querySelector(".grip");if(!g)return;
  g.addEventListener("pointerdown",e=>{
    e.preventDefault();e.stopPropagation();const list=row.parentNode;const it=row.querySelector(".item");
    const grab=e.clientY-row.getBoundingClientRect().top;row.classList.add("lift");
    const place=y=>{it.style.transform=`translateY(${y-grab-row.getBoundingClientRect().top}px) scale(1.02)`};
    const move=ev=>{
      const y=ev.clientY;const sib=[...list.querySelectorAll(".row")];const idx=sib.indexOf(row);
      for(let i=0;i<sib.length;i++){const s=sib[i];if(s===row)continue;const r=s.getBoundingClientRect();const mid=r.top+r.height/2;
        if(i<idx&&y<mid){list.insertBefore(row,s);break}
        if(i>idx&&y>mid){list.insertBefore(row,s.nextSibling)}}
      place(y);
    };
    const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);
      row.classList.remove("lift");it.style.transform="";
      [...list.querySelectorAll(".row")].forEach((r,i)=>{byId(r.dataset.id).order=i});
      const m=byId(row.dataset.id);if(isOver(m)||m.star)toast("Überfällige und markierte Einträge bleiben oben angeheftet.");render()};
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  });
}

/* ---------- Plus und langer Druck ---------- */
function bindPlus(){
  const b=$("#plusBtn");let t=null,long=false;
  b.addEventListener("pointerdown",()=>{long=false;t=setTimeout(()=>{long=true;openForm({type:"Gedanke"},true)},480)});
  const cancel=()=>clearTimeout(t);
  b.addEventListener("pointerup",()=>{cancel();if(!long)openTypeSheet()});
  b.addEventListener("pointerleave",cancel);b.addEventListener("pointercancel",cancel);
  b.addEventListener("contextmenu",e=>e.preventDefault());
}
function openTypeSheet(){
  sheet(`<h2>Neuer Eintrag</h2><p class="sub">Was möchtest du festhalten?</p>
  <div class="tgrid">${TYPE_ORDER.map(t=>`<button class="tcard" data-act="newType" data-v="${t}">${icon(t)}${t}</button>`).join("")}</div>
  <button class="dashed" data-act="fromTpl">${L("template")} Aus Vorlage erstellen <b>${templates.length} Vorlagen ›</b></button>
  <p class="sub" style="margin:14px 0 0;text-align:center">Tipp: + lange drücken öffnet direkt einen Gedanken.</p>`);
}
function openTplSheet(){
  sheet(`<h2>Aus Vorlage</h2><p class="sub">Vorlage wählen, danach anpassen.</p>
  <div class="grp">${templates.map((t,i)=>`<button class="r" data-act="useTpl" data-v="${i}">${icon(t.type)}<span>${esc(t.title||t.type)}</span><span class="v">${t.type} ›</span></button>`).join("")||'<div class="empty">Noch keine Vorlagen</div>'}</div>`);
}

/* ---------- Formular ---------- */
let F=null;
function openForm(init,quick,editId){
  closeSheet();
  const base=editId?byId(editId):null;
  F={editId:editId||null,type:init.type,title:init.title||"",body:init.body||"",cat:init.cat||(S.cat!=="Alle"?S.cat:"Privat"),due:init.due?new Date(init.due):(init.type==="Termin"?at(NOW,NOW.getHours()+1):null),repeat:init.repeat||"Nie",star:!!init.star,
     items:(init.items||[]).map(i=>({t:i.t,q:i.q||"",d:!!i.d})),links:(init.links||[]).map(l=>({...l})),photos:(init.photos||[]).slice(),
     period:!!(init.chal&&init.chal.start),pstart:init.chal&&init.chal.start?new Date(init.chal.start):new Date(TODAY),pend:init.chal&&init.chal.end?new Date(init.chal.end):addD(TODAY,29),err:false,tpl:false,quick};
  if(F.type==="Challenge"&&!editId)F.due=null;
  page(formHTML(),"form");
  if(quick||!editId)setTimeout(()=>{const t=$("#fTitle");t&&t.focus()},300);
}
function formHTML(){
  const t=F.type,T=TYPES[t];
  let rows="";
  if(t==="Challenge"){
    rows+=`<button class="r" data-act="fPeriod" type="button"><span class="ri">${L("hourglass",16)}</span>Zeitraum<span class="tog${F.period?" on":""}"></span></button>`;
    if(F.period)rows+=`<div class="r"><span class="ri">${L("start",16)}</span>Start<input type="date" id="fStart" value="${key(F.pstart)}"></div><div class="r"><span class="ri">${L("stop",16)}</span>Ende<input type="date" id="fEnd" value="${key(F.pend)}"></div>`;
    rows+=`<div class="r"><span class="ri">${L("cal",16)}</span>Fällig<input type="datetime-local" id="fDue" value="${toLocalInput(F.due)}"></div>`;
  } else if(T.due){
    rows+=`<div class="r"><span class="ri">${L("cal",16)}</span>${t==="Termin"?"Beginn":"Fällig"}<input type="datetime-local" id="fDue" value="${toLocalInput(F.due)}"></div>`;
  }
  if(T.rep)rows+=`<div class="r"><span class="ri">${L("repeat",16)}</span>Wiederholen<select id="fRep">${["Nie","Täglich","Wöchentlich","Monatlich","Jährlich"].map(o=>`<option${o===F.repeat?" selected":""}>${o}</option>`).join("")}</select></div>`;
  rows+=`<button class="r" data-act="fStar" type="button"><span class="ri">${L("star",16)}</span>Wichtig<span class="tog${F.star?" on":""}"></span></button>`;
  const items=t==="Checkliste"?`<div class="cap2">Punkte</div><div class="grp">${F.items.map((i,n)=>`<div class="ci${i.d?" done":""}"><button class="box" data-act="fItem" data-v="${n}" type="button" aria-label="Abhaken">${i.d?"✓":""}</button><span class="cn">${esc(i.t)}</span><span class="q">${esc(i.q)}</span><button data-act="fItemDel" data-v="${n}" type="button" class="muted" aria-label="Entfernen">✕</button></div>`).join("")||'<div class="empty">Noch keine Punkte</div>'}</div>
    <div class="addline"><input class="inp" id="fItemT" placeholder="Neuer Punkt"><input class="inp q" id="fItemQ" placeholder="Menge"><button data-act="fItemAdd" type="button" aria-label="Punkt hinzufügen">+</button></div>`:"";
  return `<div class="nav"><button class="x" data-act="closePage" type="button">Abbrechen</button><span class="mid">${icon(t)}${t}</span><button class="ok" data-act="fSave" type="button">Sichern</button></div>
  <div class="pad">
  <input class="f-title" id="fTitle" placeholder="${t==="Gedanke"?"Was geht dir durch den Kopf?":"Titel"}" value="${esc(F.title)}" autocomplete="off">
  ${F.err?'<div class="err">Bitte gib einen Titel ein.</div>':""}
  <textarea class="f-body" id="fBody" placeholder="Text (Mikrofon auf der Tastatur zum Diktieren)">${esc(F.body)}</textarea>
  <div class="seg">${["Privat","Arbeit"].map(c=>`<button type="button" class="${F.cat===c?"on":""}" data-act="fCat" data-v="${c}">${c}</button>`).join("")}</div>
  ${items}
  <div class="grp">${rows}</div>
  <div class="att"><button type="button" data-act="fLinkToggle"><span>${L("link",22)}</span>Link</button><label><span>${L("image",22)}</span>Mediathek<input type="file" accept="image/*" multiple class="sr" id="fLib"></label><label><span>${L("camera",22)}</span>Kamera<input type="file" accept="image/*" capture="environment" class="sr" id="fCam"></label></div>
  <div class="linkform" id="fLinkForm" hidden><input class="inp" id="fLinkT" placeholder="Eigener Titel"><input class="inp" id="fLinkU" placeholder="Adresse einfügen, z. B. example.com" inputmode="url" autocapitalize="off"><button class="btn ghost" data-act="fLinkAdd" type="button">Link hinzufügen</button></div>
  ${F.links.length?`<div class="grp">${F.links.map((l,n)=>`<div class="r"><span class="ri">${L("link",16)}</span>${esc(l.title)}<span class="v">${esc(l.url.replace(/^https?:\/\//,""))}</span><button data-act="fLinkDel" data-v="${n}" type="button" class="muted" aria-label="Link entfernen">✕</button></div>`).join("")}</div>`:""}
  ${F.photos.length?`<div class="photos">${F.photos.map((p,n)=>`<div class="ph">${photoImg(p,"Angehängtes Foto")}<button class="phx" data-act="fPhotoDel" data-v="${n}" type="button" aria-label="Foto entfernen">✕</button></div>`).join("")}</div>`:""}
  <button class="foot" data-act="fTpl" type="button">${F.tpl?"✓ Wird als Vorlage gespeichert":"Als Vorlage speichern"}</button>
  </div>`;
}
function readForm(){
  const g=id=>document.getElementById(id);
  if(g("fTitle"))F.title=g("fTitle").value;if(g("fBody"))F.body=g("fBody").value;
  if(g("fDue"))F.due=g("fDue").value?new Date(g("fDue").value):null;
  if(g("fRep"))F.repeat=g("fRep").value;
  if(g("fStart")&&g("fStart").value)F.pstart=new Date(g("fStart").value+"T00:00");
  if(g("fEnd")&&g("fEnd").value)F.pend=new Date(g("fEnd").value+"T00:00");
}
function refreshForm(){readForm();if(F.title.trim())F.err=false;const p=$("#layer .page.form");const st=p.scrollTop;p.innerHTML=formHTML();p.scrollTop=st;bindFormFiles();hydratePhotos(p)}
function bindFormFiles(){
  ["fLib","fCam"].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.addEventListener("change",()=>{
    const files=[...el.files];if(!files.length)return;let left=files.length;
    files.forEach(f=>shrink(f,blob=>{if(blob){const id=newPhotoId();pendingPhotos.set(id,blob);F.photos.push(id)}if(--left===0)refreshForm()}));
  })});
}
// Verkleinert Fotos auf höchstens 2000 px, damit Screenshots lesbar bleiben und der Speicher nicht vollläuft.
function shrink(file,cb){const url=URL.createObjectURL(file);const img=new Image();
  img.onload=()=>{const m=2000,s=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(b=>cb(b||file),"image/jpeg",.85)};
  img.onerror=()=>{URL.revokeObjectURL(url);toast("Dieses Bild konnte nicht geladen werden.");cb(null)};img.src=url}
async function saveForm(){
  readForm();if(!F.title.trim()){F.err=true;refreshForm();$("#fTitle").focus();return}
  try{for(const id of F.photos){const b=pendingPhotos.get(id);if(b){await db.putPhoto(id,b);pendingPhotos.delete(id)}}}
  catch(err){console.error(err);toast("Foto konnte nicht gespeichert werden. Ist der Speicher voll?");return}
  const data={type:F.type,title:F.title.trim(),body:F.body,cat:F.cat,due:F.due,repeat:F.repeat,star:F.star,items:F.items,links:F.links,photos:F.photos};
  if(F.type==="Challenge"){const old=F.editId?byId(F.editId).chal:null;data.chal={start:F.period?F.pstart:null,end:F.period?F.pend:null,days:old?old.days:new Set(),result:null}}
  if(F.tpl)templates.push({type:F.type,title:F.title.trim(),body:F.body,cat:F.cat,items:F.items.map(i=>({t:i.t,q:i.q}))});
  if(F.editId){Object.assign(byId(F.editId),data);closePage();closePage();openDetail(F.editId);toast("Gespeichert")}
  else{const min=Math.min(...entries.filter(isOpen).map(e=>e.order),0);entries.push(mk({...data,order:min-1,created:new Date()}));closePage();if(S.type&&S.type!==F.type)S.type=null;if(S.cat!=="Alle"&&S.cat!==F.cat)S.cat="Alle";render();toast(F.type+" angelegt"+(F.tpl?" · Vorlage gespeichert":""))}
}

/* ---------- Detail ---------- */
function openDetail(id,readonly){const p=page(detailHTML(id,readonly),"detail",id);if(readonly)p.dataset.ro="1";return p}
function detailHTML(id,ro){
  const e=byId(id);const t=e.type;const arch=!isOpen(e);ro=ro||arch;
  const st=arch?(e.status==="deleted"?'<span class="pill d">Gelöscht</span>':e.chal&&e.chal.result==="fail"?'<span class="pill d">Versagt</span>':e.chal&&e.chal.result==="ok"?'<span class="pill a">Geschafft</span>':'<span class="pill a">Erledigt</span>'):"";
  let html=`<div class="nav"><button class="x" data-act="closePage" type="button">‹ Zurück</button><span class="mid">${icon(t)}${t}</span>${ro?"<span></span>":`<button class="ok" data-act="edit" data-id="${id}" type="button">Bearbeiten</button>`}</div><div class="pad">
  <h2 class="d-title">${e.star?'<span class="star">★</span> ':""}${esc(e.title)}</h2>
  <div class="d-meta">${st}<span class="pill">${e.cat}</span>${e.due?`<span class="pill${isOver(e)?" d":""}">${t==="Termin"?"Beginn":"Fällig"}: ${WD[e.due.getDay()]} ${dmy(e.due)}, ${hm(e.due)}</span>`:""}${e.repeat&&e.repeat!=="Nie"?`<span class="pill">↻ ${e.repeat}</span>`:""}<span class="pill">Erstellt ${dmy(e.created)}</span></div>
  ${e.body?`<p class="d-body">${esc(e.body)}</p>`:""}`;
  if(t==="Checkliste"){const d=e.items.filter(i=>i.d).length;
    html+=`<div class="cap2">${d} von ${e.items.length} erledigt</div><div class="prog" style="margin:0 4px 12px"><i style="width:${e.items.length?d/e.items.length*100:0}%"></i></div>
    <div class="grp" id="dItems">${e.items.map((i,n)=>`<div class="ci${i.d?" done":""}" data-n="${n}">${ro?`<span class="box">${i.d?"✓":""}</span>`:`<button class="box" data-act="dItem" data-id="${id}" data-v="${n}" type="button" aria-label="Abhaken">${i.d?"✓":""}</button>`}<span class="cn">${esc(i.t)}</span><span class="q">${esc(i.q)}</span>${ro?"":`<span class="grip" aria-label="Verschieben">${SV.grip}</span>`}</div>`).join("")}</div>
    ${ro?"":`<div class="addline"><input class="inp" id="dItemT" placeholder="Neuer Punkt"><input class="inp q" id="dItemQ" placeholder="Menge"><button data-act="dItemAdd" data-id="${id}" type="button" aria-label="Punkt hinzufügen">+</button></div>`}`}
  if(t==="Challenge"){const c=e.chal,ci=chalInfo(e);
    if(ci){const doneToday=c.days.has(key(TODAY));const n=c.days.size;
      html+=`<div class="chal"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="big">Tag ${ci.day} <span class="muted" style="font-size:16px;font-weight:500">von ${ci.total}</span></span><span class="muted">${streak(c)} in Folge</span></div>
      <div class="prog" style="margin-top:10px"><i style="width:${ci.pct}%"></i></div><div class="muted" style="font-size:13px;margin-top:8px">${n} von ${ci.day} Tagen geschafft · ${dmy(c.start)} bis ${dmy(c.end)}</div>
      ${ro?"":`<button class="btn" style="margin-top:14px${doneToday?";background:var(--surface);color:var(--accent)":""}" data-act="chToday" data-id="${id}" type="button">${doneToday?"✓ Heute geschafft":"Heute geschafft"}</button>`}
      <div class="daygrid">${Array.from({length:ci.total},(_,k)=>{const d=addD(c.start,k);const fut=d>TODAY;return `<button class="dg${c.days.has(key(d))?" ok":""}${fut?" fut":""}${same(d,TODAY)?" today":""}" ${ro||fut?"disabled":`data-act="chDay" data-id="${id}" data-v="${key(d)}"`} type="button" aria-label="${dmy(d)}">${d.getDate()}</button>`}).join("")}</div>
      ${ro?"":'<p class="muted" style="font-size:12px;margin:10px 0 0">Vergangene Tage lassen sich nachträglich antippen.</p>'}</div>`}
    if(!ro)html+=`<div class="cap2">Ergebnis bewerten</div><div class="btnrow"><button class="btn" data-act="chRes" data-id="${id}" data-v="ok" type="button">Geschafft</button><button class="btn red" data-act="chRes" data-id="${id}" data-v="fail" type="button">Versagt</button></div>`;
  }
  if(e.links.length)html+=`<div class="cap2">Links</div><div class="grp">${e.links.map(l=>`<a class="linkrow" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="r"><span class="ri">${L("link",16)}</span></span>${esc(l.title)}<span class="u">${esc(l.url.replace(/^https?:\/\//,""))}</span></a>`).join("")}</div>`;
  if(e.photos.length)html+=`<div class="cap2">Fotos</div><div class="photos">${e.photos.map(p=>`<button class="ph" data-act="photo" data-v="${p}" type="button" aria-label="Foto groß anzeigen">${photoImg(p,"Foto zum Eintrag")}</button>`).join("")}</div>`;
  if(arch){html+=`<div style="height:10px"></div><button class="btn" data-act="restore" data-id="${id}" type="button">Wiederherstellen</button><div style="height:10px"></div><button class="btn red" data-act="purge" data-id="${id}" type="button">Endgültig entfernen</button>`}
  else{
    html+=`<div class="cap2">Aktionen</div><div class="grp">
    ${TYPES[t].due&&e.due?`<button class="r" data-act="snooze" data-id="${id}" type="button"><span class="ri">${L("clock",16)}</span>Zurückstellen<span class="v">›</span></button>`:""}
    <button class="r" data-act="dStar" data-id="${id}" type="button"><span class="ri">${L("star",16)}</span>${e.star?"Markierung entfernen":"Als wichtig markieren"}<span class="v"></span></button>
    <button class="r" data-act="dTpl" data-id="${id}" type="button"><span class="ri">${L("template",16)}</span>Als Vorlage speichern<span class="v"></span></button>
    <button class="r" data-act="dDup" data-id="${id}" type="button"><span class="ri">${L("copy",16)}</span>Duplizieren<span class="v"></span></button></div>
    <div class="btnrow">${t==="Challenge"?"":`<button class="btn" data-act="dDone" data-id="${id}" type="button">Erledigt</button>`}<button class="btn red" data-act="dDel" data-id="${id}" type="button" ${t==="Challenge"?'style="grid-column:1/-1"':""}>Löschen</button></div>`}
  return html+"</div>";
}
function refreshDetail(id){const p=$("#layer .page.detail");if(!p)return;const st=p.scrollTop;p.innerHTML=detailHTML(id,p.dataset.ro==="1");p.scrollTop=st;bindDetailSort(id);hydratePhotos(p);persist()}
function bindDetailSort(id){
  const box=$("#dItems");if(!box)return;const e=byId(id);
  box.querySelectorAll(".ci .grip").forEach(g=>{
    g.addEventListener("pointerdown",ev=>{ev.preventDefault();const row=g.closest(".ci");row.style.background="var(--raise)";
      const move=m=>{const sib=[...box.children].filter(c=>c!==row);for(const s of sib){const r=s.getBoundingClientRect();if(m.clientY>r.top&&m.clientY<r.bottom){if(m.clientY>r.top+r.height/2)box.insertBefore(row,s.nextSibling);else box.insertBefore(row,s);break}}};
      const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);row.style.background="";const ord=[...box.children].map(c=>+c.dataset.n);e.items=ord.map(n=>e.items[n]);refreshDetail(id)};
      window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up)});
  });
}

/* ---------- Kalender ---------- */
function dayItems(d,flt){
  const out=[];
  visibleEvents().filter(x=>same(x.start,d)).forEach(x=>out.push({t:x.start,title:x.title,s:x.src,col:SRC[x.src],act:"event",id:x.id,cat:x.src==="Proton"?"Privat":"Arbeit",type:"Termin"}));
  entries.filter(e=>isOpen(e)&&e.due&&same(e.due,d)).forEach(e=>out.push({t:e.due,title:e.title,s:e.type==="Termin"?"Anton":e.type,col:TYPES[e.type].c,act:"open",id:e.id,cat:e.cat,type:e.type}));
  entries.filter(e=>isOpen(e)&&e.type==="Challenge"&&e.chal&&e.chal.start&&d>=sod(e.chal.start)&&d<=sod(e.chal.end)&&same(d,TODAY)).forEach(e=>{const ci=chalInfo(e);out.push({t:null,title:e.title+" · Tag "+ci.day,s:"Challenge",col:TYPES.Challenge.c,act:"open",id:e.id,cat:e.cat,type:"Challenge"})});
  return out.filter(x=>!flt||((S.calCat==="Alle"||x.cat===S.calCat)&&(!S.calType||x.type===S.calType))).sort((a,b)=>(a.t||0)-(b.t||0));
}
const liHTML=x=>`<button class="li" data-act="${x.act}" data-id="${x.id}"><span class="t">${x.t?hm(x.t):(TYPES[x.type]?`<span style="color:${x.col}">${L(TYPES[x.type].i,16)}</span>`:"•")}</span><span class="bar" style="background:${x.col}"></span><span class="nm">${esc(x.title)}</span><span class="s">${x.s}</span></button>`;
function renderCal(){
  const m=S.calMonth,y=m.getFullYear(),mo=m.getMonth();
  const head=`<div class="calhead"><div class="mon"><button data-act="calPrev" aria-label="Vorheriger Monat">‹</button>${MON[mo]} ${y}<button data-act="calNext" aria-label="Nächster Monat">›</button></div>
  <div class="minis"><button class="${S.calMode==="month"?"on":""}" data-act="calMode" data-v="month">Monat</button><button class="${S.calMode==="list"?"on":""}" data-act="calMode" data-v="list">Liste</button></div></div>`;
  let body="";
  if(S.calMode==="month"){
    const first=new Date(y,mo,1);const lead=(first.getDay()+6)%7;const n=new Date(y,mo+1,0).getDate();let cells="";
    for(let i=lead;i>0;i--){cells+=`<div class="day o">${new Date(y,mo,1-i).getDate()}</div>`}
    for(let d=1;d<=n;d++){const dt=new Date(y,mo,d);const its=dayItems(dt);const cols=[...new Set(its.map(x=>x.col))].slice(0,3);
      cells+=`<button class="day${same(dt,S.calSel)?" sel":""}${same(dt,TODAY)?" today":""}" data-act="calDay" data-v="${key(dt)}" aria-label="${d}. ${MON[mo]}, ${its.length} Einträge">${d}<span class="dots">${cols.map(c=>`<i style="background:${c}"></i>`).join("")}</span></button>`}
    const sel=dayItems(S.calSel);
    body=`<div class="wd">${["Mo","Di","Mi","Do","Fr","Sa","So"].map(w=>`<span>${w}</span>`).join("")}</div><div class="days">${cells}</div>
    <div class="daylist"><div class="dayhd${same(S.calSel,TODAY)?" t":""}"><span>${same(S.calSel,TODAY)?"Heute · ":""}${WDL[S.calSel.getDay()]}, ${dmy(S.calSel)}</span><span>${sel.length}</span></div>${sel.map(liHTML).join("")||'<div class="empty">Nichts geplant</div>'}</div>`;
  } else {
    const chips=["Alle","Privat","Arbeit"].map(c=>`<button class="chip${S.calCat===c?" on":""}" data-act="calCat" data-v="${c}">${c}</button>`).join("")+`<button class="chip${S.calType?" on":""}" data-act="calTypeFilter">${S.calType?esc(S.calType)+" ✕":"Art ▾"}</button>`;
    const n=new Date(y,mo+1,0).getDate();let out="";
    for(let d=1;d<=n;d++){const dt=new Date(y,mo,d);const its=dayItems(dt,true);if(!its.length)continue;
      out+=`<div class="dayhd${same(dt,TODAY)?" t":""}"><span>${same(dt,TODAY)?"Heute · ":""}${WD[dt.getDay()]} ${d}.</span><span>${its.length}</span></div>`+its.map(liHTML).join("")}
    body=`<div class="chips" style="padding-top:0">${chips}</div><div class="pad">${out||'<div class="empty">Keine Einträge in diesem Monat</div>'}</div>`;
  }
  $("#app").innerHTML=head+body;
}

/* ---------- Archiv ---------- */
function archList(){
  const q=S.archQ.trim().toLowerCase();
  return entries.filter(e=>!isOpen(e)).filter(e=>S.archF==="Alle"||(S.archF==="Erledigt"?e.status==="done":S.archF==="Gelöscht"?e.status==="deleted":e.type===S.archF))
    .filter(e=>!q||(e.title+" "+e.body).toLowerCase().includes(q)).sort((a,b)=>b.archived-a.archived);
}
function statusChip(e){if(isOpen(e))return '<span class="stchip st-open">Offen</span>';if(e.status==="deleted")return '<span class="stchip st-del">Gelöscht</span>';if(e.chal&&e.chal.result==="fail")return '<span class="stchip st-del">Versagt</span>';if(e.chal&&e.chal.result==="ok")return '<span class="stchip st-ok">Geschafft</span>';return '<span class="stchip st-ok">Erledigt</span>'}
function groupLabel(d){const a=daysBetween(d,TODAY);if(a<7)return "Diese Woche";if(a<14)return "Letzte Woche";return MON[d.getMonth()]+" "+d.getFullYear()}
function archItemsHTML(){
  const list=archList();let html="",last="";
  list.slice(0,80).forEach(e=>{const g=groupLabel(e.archived);if(g!==last){html+=`<div class="sec" style="padding-left:4px;padding-right:4px">${g}</div>`;last=g}
    const sel=S.archSel;
    html+=`<div class="row ar${e.status==="done"?" done":""}" data-id="${e.id}"><div class="sw-bg"><span class="l">↺ Wiederherstellen</span><span class="r">Endgültig entfernen</span></div>
    <div class="item" data-act="${sel?"archPick":"openRO"}" data-id="${e.id}">${sel?`<span class="sel-box${sel.has(e.id)?" on":""}">${sel.has(e.id)?"✓":""}</span>`:""}${icon(e.type)}<div class="txt"><div class="ttl">${esc(e.title)}</div><div class="meta">${e.type} · ${e.cat} · ${dmy(e.archived)}</div></div>${statusChip(e)}</div></div>`});
  if(!list.length)html=entries.some(e=>!isOpen(e))?'<div class="empty">Nichts gefunden. Prüfe Suchbegriff und Filter.</div>':'<div class="empty">Das Archiv ist leer. Erledigte und gelöschte Einträge landen hier.</div>';
  else if(list.length>80)html+=`<p class="hint">${list.length-80} ältere Einträge ausgeblendet. Suche oder Filter grenzen die Liste ein.</p>`;
  return html;
}
function renderArch(){
  const chips=["Alle","Erledigt","Gelöscht"].map(c=>`<button class="chip${S.archF===c?" on":""}" data-act="archF" data-v="${c}">${c}</button>`).join("")+`<button class="chip${TYPES[S.archF]?" on":""}" data-act="archType">${TYPES[S.archF]?esc(S.archF)+" ✕":"Art ▾"}</button>`;
  $("#app").innerHTML=`<header class="head"><h1>Archiv</h1><span class="sp"></span><button class="ok" style="color:var(--accent);font-size:15px" data-act="archSelect">${S.archSel?"Fertig":"Auswählen"}</button></header>
  <label class="search">${SV.search}<input id="archQ" type="search" placeholder="Im Archiv suchen" value="${esc(S.archQ)}" autocomplete="off"></label>
  <div class="chips">${chips}</div><div class="list" id="alist">${archItemsHTML()}</div>
  <p class="hint">Nach rechts wischen: wiederherstellen · nach links: endgültig entfernen</p>
  ${S.archSel?`<div class="selbar"><button class="btn" data-act="archBulk" data-v="restore">Wiederherstellen (${S.archSel.size})</button><button class="btn red" data-act="archBulk" data-v="purge">Entfernen (${S.archSel.size})</button></div>`:""}`;
  $("#archQ").addEventListener("input",ev=>{S.archQ=ev.target.value;$("#alist").innerHTML=archItemsHTML();bindArchSwipes()});
  bindArchSwipes();
}
function bindArchSwipes(){if(S.archSel)return;document.querySelectorAll("#alist .row").forEach(r=>swipe(r,{right:id=>restore(id),left:id=>purge(id)}))}
function restore(id){const e=byId(id);const prev={s:e.status,a:e.archived,r:e.chal&&e.chal.result};e.status="open";e.archived=null;if(e.chal)e.chal.result=null;render();toast("Wiederhergestellt",()=>{e.status=prev.s;e.archived=prev.a;if(e.chal)e.chal.result=prev.r;render()})}
function purge(id){const i=entries.findIndex(e=>e.id===+id);const [e]=entries.splice(i,1);render();toast("Endgültig entfernt",()=>{entries.splice(i,0,e);render()})}

/* ---------- Statistik ---------- */
function inPeriod(d){if(!d)return false;const a=daysBetween(d,TODAY);return S.period==="Woche"?a<7:S.period==="Monat"?a<30:S.period==="Jahr"?a<365:true}
function renderStat(){
  const created=entries.filter(e=>inPeriod(e.created));
  const ch=entries.filter(e=>e.type==="Challenge"&&e.chal&&e.chal.result&&inPeriod(e.archived||e.created));
  const ok=ch.filter(e=>e.chal.result==="ok").length;const q=ch.length?Math.round(ok/ch.length*100):0;
  const per=TYPE_ORDER.map(t=>[t,created.filter(e=>e.type===t).length]).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...per.map(p=>p[1]));
  const wk=entries.filter(e=>e.archived&&daysBetween(e.archived,TODAY)<7);
  const wDone=wk.filter(e=>e.status==="done").length,wOk=wk.filter(e=>e.chal&&e.chal.result==="ok").length,wFail=wk.filter(e=>e.chal&&e.chal.result==="fail").length;
  const best=Math.max(0,...entries.filter(e=>e.type==="Challenge"&&isOpen(e)).map(e=>streak(e.chal)));
  $("#app").innerHTML=`<header class="head"><h1>Statistik</h1></header>
  <div class="pad"><div class="seg">${["Woche","Monat","Jahr","Gesamt"].map(p=>`<button class="${S.period===p?"on":""}" data-act="period" data-v="${p}">${p}</button>`).join("")}</div></div>
  <div class="kpis"><button class="k" data-act="drill" data-v="chal"><div class="n" style="color:var(--accent)">${ch.length?q+" %":"–"}</div><div class="l">Challenge-Quote · ${ok} von ${ch.length} ›</div></button><button class="k" data-act="drill" data-v="all"><div class="n">${created.length}</div><div class="l">Einträge erstellt ›</div></button></div>
  <div class="card"><div class="cap">Einträge pro Art</div>${per.map(([t,v])=>`<button class="bar2" data-act="drill" data-v="${t}"><span class="nm">${t}</span><span class="tr"><i style="width:${v/max*100}%"></i></span><span class="v">${v}</span><span class="ch">›</span></button>`).join("")}</div>
  <div class="card"><div class="cap">Diese Woche</div><p class="wk"><b>${wDone} erledigt</b>, ${wOk} ${wOk===1?"Challenge":"Challenges"} geschafft, ${wFail} versagt. Aktuelle Serie: <b>${best} ${best===1?"Tag":"Tage"}</b>.</p></div>
  <p class="hint">Zahlen und Balken antippen, um die Einträge zu sehen.</p>`;
}
function openDrill(v){
  let L,title;
  if(v==="chal"){L=entries.filter(e=>e.type==="Challenge"&&e.chal&&e.chal.result&&inPeriod(e.archived||e.created));title="Challenges · "+S.period}
  else if(v==="all"){L=entries.filter(e=>inPeriod(e.created));title="Alle Einträge · "+S.period}
  else{L=entries.filter(e=>e.type===v&&inPeriod(e.created));title=v+" · "+S.period}
  L.sort((a,b)=>b.created-a.created);
  const rows=x=>x.slice(0,60).map(e=>`<button class="li" data-act="${isOpen(e)?"openFromSheet":"openROFromSheet"}" data-id="${e.id}">${icon(e.type)}<span class="nm">${esc(e.title)}<br><span class="muted" style="font-size:12px">${dmy(e.created)} · ${e.cat}</span></span>${statusChip(e)}</button>`).join("");
  let body;
  if(v==="chal"){const a=L.filter(e=>e.chal.result==="ok"),b=L.filter(e=>e.chal.result==="fail");body=`<div class="dayhd t"><span>Geschafft</span><span>${a.length}</span></div>${rows(a)}<div class="dayhd"><span>Versagt</span><span>${b.length}</span></div>${rows(b)}`}
  else body=rows(L)+(L.length>60?`<p class="hint">${L.length-60} weitere ausgeblendet</p>`:"");
  sheet(`<h2>${esc(title)}</h2><p class="sub">${L.length} Einträge, offene und archivierte</p>${body||'<div class="empty">Keine Einträge im Zeitraum</div>'}`);
}

/* ---------- Einstellungen ---------- */
function settingsHTML(){
  const name=(ACCENTS.find(a=>a[1]===S.accent)||["Petrol"])[0];
  return `<div class="nav"><span></span><span class="mid">Einstellungen</span><button class="ok" data-act="closePage" type="button">Fertig</button></div><div class="pad">
  <div class="cap2">Darstellung · ${name}</div><div class="grp"><div class="swatches">${ACCENTS.map(([n,c])=>`<button class="swatch${S.accent===c?" on":""}" data-act="accent" data-v="${c}" type="button"><i style="background:${c}"></i>${n}</button>`).join("")}</div></div>
  <div class="cap2">Kalender</div><div class="grp">
   <button class="r" data-act="icsInfo" data-v="Outlook" type="button"><span class="ri" style="background:#7d9cc417;color:#7d9cc4">${L("cal",16)}</span>Outlook<span class="v">nicht verbunden ›</span></button>
   <button class="r" data-act="icsInfo" data-v="Proton" type="button"><span class="ri" style="background:#a593c417;color:#a593c4">${L("cal",16)}</span>Proton<span class="v">nicht verbunden ›</span></button>
   <button class="r" data-act="ignored" type="button"><span class="ri">${L("eye",16)}</span>Ignorierte Termine<span class="v">${S.ignored.size} ›</span></button></div>
  <div class="cap2">Abend und Morgen</div><div class="grp">
   <div class="r"><span class="ri" style="background:#8e8e9324">${SV.moon}</span>Gute Nacht ab<input type="time" id="sNight" value="${S.nightFrom}"></div>
   <button class="r" data-act="shortcut" type="button"><span class="ri">${L("alarm",16)}</span>Wecker-Kurzbefehl<span class="v">${S.alarmSet?"eingerichtet ›":"einrichten ›"}</span></button>
   <button class="r" data-act="morning" type="button"><span class="ri" style="background:#ffd60a24">${SV.sun}</span>Guten Morgen ansehen<span class="v">›</span></button></div>
  <div class="cap2">Daten</div><div class="grp">
   <button class="r" data-act="backup" type="button"><span class="ri">${L("down",16)}</span>Sicherung erstellen<span class="v">${S.lastBackup?(daysBetween(S.lastBackup,TODAY)===0?"heute":"vor "+daysBetween(S.lastBackup,TODAY)+" Tagen"):"noch keine"} ›</span></button>
   <button class="r" data-act="restoreBackup" type="button"><span class="ri">${L("up",16)}</span>Sicherung wiederherstellen<span class="v">›</span></button>
   <div class="r"><span class="ri" style="background:#e5736b17;color:var(--danger)">${L("trash",16)}</span>Archiv bereinigen<select id="sClean">${[["0","Aus"],["30","älter als 30 Tage"],["60","älter als 60 Tage"],["90","älter als 90 Tage"],["180","älter als 180 Tage"]].map(([v,l])=>`<option value="${v}"${S.cleanup===v?" selected":""}>${l}</option>`).join("")}</select></div>
   <button class="r" data-act="tplList" type="button"><span class="ri">${L("template",16)}</span>Vorlagen<span class="v">${templates.length} ›</span></button></div>
  <p class="note">Anton · Version ${VERSION}<br>Alle Daten bleiben auf diesem iPhone.</p></div>`;
}
function openSettings(){page(settingsHTML(),"settings");bindSettings()}
function refreshSettings(){persist();const p=$("#layer .page.settings");if(!p)return;const st=p.scrollTop;p.innerHTML=settingsHTML();p.scrollTop=st;bindSettings()}
function bindSettings(){const n=$("#sNight");n&&n.addEventListener("change",()=>{S.nightFrom=n.value||S.nightFrom;persist();toast("Gute Nacht erscheint ab "+n.value)});const c=$("#sClean");c&&c.addEventListener("change",()=>{S.cleanup=c.value;persist();cleanupArchive();render();toast(c.value==="0"?"Automatische Bereinigung aus":"Archiv wird automatisch bereinigt")})}

/* ---------- Gute Nacht / Guten Morgen ---------- */
// Startet den Kurzbefehl „Anton Wecker“ und übergibt die Weckzeit als Text, z. B. "06:30".
const SHORTCUT="Anton Wecker";
const alarmURL=t=>`shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT)}&input=text&text=${encodeURIComponent(t)}`;
function sleepText(){const [h,m]=S.alarm.split(":").map(Number);const a=new Date();a.setHours(h,m,0,0);if(a<=new Date())a.setDate(a.getDate()+1);const mins=Math.round((a-new Date())/6e4);return Math.floor(mins/60)+" Std. "+(mins%60)+" Min. bis zum Wecker"}
function nightHTML(){
  const tm=addD(TODAY,1);const its=dayItems(tm);
  const chals=entries.filter(e=>isOpen(e)&&e.type==="Challenge"&&chalInfo(e)).map(e=>({t:null,title:e.title+" · Tag "+(chalInfo(e).day+1),s:"Challenge",col:TYPES.Challenge.c,act:"open",id:e.id,type:"Challenge"}));
  const stars=entries.filter(e=>isOpen(e)&&e.star&&e.type!=="Termin"&&!(e.due&&same(e.due,tm))).map(e=>({t:null,title:e.title,s:"★ "+e.type,col:TYPES[e.type].c,act:"open",id:e.id,type:e.type}));
  const all=its.concat(chals,stars);
  return `<div class="nav"><button class="x" data-act="closePage" type="button">‹ Zurück</button><span></span><span></span></div>
  <div class="gn-head" style="padding-top:0"><span class="mi" style="background:#8e8e9322">${SV.moon}</span>Gute Nacht</div>
  <div class="gn-big">Morgen, ${WDL[tm.getDay()]} ${dmy(tm)}</div>
  <div class="alarm"><div class="lb">Wecker</div><input type="time" id="nAlarm" value="${S.alarm}" aria-label="Weckzeit"><div class="h" id="nSleep">${sleepText()}</div>
  <a class="btn" id="nAlarmGo" href="${alarmURL(S.alarm)}" data-act="alarmGo"><span style="display:inline-flex;vertical-align:-3px;margin-right:6px">${L("alarm",18)}</span>Wecker in Uhr-App stellen</a><div class="sm">${S.alarmSet&&S.alarmSet.day===key(TODAY)?`Zuletzt gestellt: ${S.alarmSet.time} · `:""}danach unten über den Home-Balken nach rechts wischen · <button class="lnk" data-act="shortcut" type="button">einrichten</button></div></div></div>
  <div class="sec" style="margin-top:8px"><span>Morgen</span><span>${all.length}</span></div><div class="pad">${all.map(liHTML).join("")||'<div class="empty">Morgen ist nichts geplant</div>'}</div>`;
}
function openNight(){page(nightHTML(),"night");const a=$("#nAlarm");a.addEventListener("input",()=>{S.alarm=a.value||S.alarm;$("#nSleep").textContent=sleepText();$("#nAlarmGo").href=alarmURL(S.alarm);persist()})}
function morningHTML(){
  const ti=todayItems();const due=entries.filter(e=>isOpen(e)&&e.type!=="Termin"&&e.due&&same(e.due,TODAY)&&!isOver(e));const over=entries.filter(isOver);
  const chals=entries.filter(e=>isOpen(e)&&e.type==="Challenge"&&chalInfo(e));
  const first=over.map(e=>`<button class="li" data-act="open" data-id="${e.id}"><span class="t" style="color:var(--danger)">!</span><span class="bar" style="background:var(--danger)"></span><span class="nm">${esc(e.title)}</span><span class="s">Überfällig</span></button>`).join("")
   +ti.map(x=>liHTML({t:x.t,title:x.title,s:x.src,col:x.col,act:x.act,id:x.id})).join("")
   +due.map(e=>liHTML({t:e.due,title:e.title,s:e.type,col:TYPES[e.type].c,act:"open",id:e.id})).join("")
   +chals.map(e=>{const d=e.chal.days.has(key(TODAY));return `<div class="li">${icon("Challenge")}<span class="nm">${esc(e.title)}</span><button class="mini-ok${d?" on":""}" data-act="mChal" data-id="${e.id}" type="button">${d?"✓ Geschafft":"Heute geschafft?"}</button></div>`}).join("");
  return `<div class="nav"><span></span><span></span><button class="ok" data-act="closePage" type="button">Schließen</button></div>
  <div class="gn-head" style="padding-top:0"><span class="mi" style="background:#ffd60a22">${SV.sun}</span>Guten Morgen</div>
  <div class="hello"><div class="g">${WDL[NOW.getDay()]}, ${dmy(NOW)}</div><div class="s">Dein Tag auf einen Blick</div>
  <div class="pills"><div class="pl"><b>${ti.length}</b><span>Termine</span></div><div class="pl"><b>${due.length}</b><span>fällig</span></div><div class="pl r"><b>${over.length}</b><span>überfällig</span></div></div></div>
  <div class="sec" style="margin-top:6px"><span>Heute zuerst</span></div><div class="pad">${first||'<div class="empty">Heute ist nichts dringend</div>'}
  <div style="height:8px"></div><button class="btn ghost" data-act="closePage" type="button" style="color:var(--accent)">Zum Dashboard ›</button></div>`;
}
function refreshMorning(){persist();const p=$("#layer .page.morning");if(p)p.innerHTML=morningHTML()}

/* ---------- Overlays ---------- */
const stack=[];
function page(html,cls,id){
  const p=document.createElement("div");p.className="page "+cls+(stack.length?" top":"");p.innerHTML=html;p.setAttribute("role","dialog");if(id)p.dataset.id=id;
  $("#layer").appendChild(p);stack.push(p);requestAnimationFrame(()=>requestAnimationFrame(()=>p.classList.add("show")));
  if(cls==="form")bindFormFiles();if(cls==="detail")bindDetailSort(id);
  hydratePhotos(p);
  return p;
}
function closePage(){const p=stack.pop();if(!p)return;p.classList.remove("show");setTimeout(()=>p.remove(),260);render()}
let curSheet=null;
function sheet(html){
  closeSheet(true);const sc=document.createElement("div");sc.className="scrim";sc.dataset.act="closeSheet";
  const sh=document.createElement("div");sh.className="sheet";sh.setAttribute("role","dialog");sh.innerHTML='<div class="knob"></div><button class="shx" data-act="closeSheet" aria-label="Schließen" type="button">✕</button>'+html;
  $("#layer").append(sc,sh);curSheet=[sc,sh];requestAnimationFrame(()=>requestAnimationFrame(()=>{sc.classList.add("show");sh.classList.add("show")}));
}
function closeSheet(now){if(!curSheet)return;const [a,b]=curSheet;curSheet=null;a.classList.remove("show");b.classList.remove("show");setTimeout(()=>{a.remove();b.remove()},now?0:260)}
let tT=null,tUndo=null;
function toast(msg,undo){$("#toastMsg").textContent=msg;tUndo=undo||null;$("#toastBtn").hidden=!undo;$("#toast").classList.add("show");clearTimeout(tT);tT=setTimeout(()=>$("#toast").classList.remove("show"),undo?4500:2600)}
$("#toastBtn").addEventListener("click",()=>{if(tUndo)tUndo();tUndo=null;$("#toast").classList.remove("show")});

function typePicker(cur,act){sheet(`<h2>Nach Art filtern</h2><p class="sub">Zeigt nur Einträge dieser Art.</p><div class="grp"><button class="r" data-act="${act}" data-v="" type="button"><span class="ri">${L("all",16)}</span>Alle Arten<span class="v">${!cur?"✓":""}</span></button>${TYPE_ORDER.map(t=>`<button class="r" data-act="${act}" data-v="${t}" type="button">${icon(t)}${t}<span class="v a">${cur===t?"✓":""}</span></button>`).join("")}</div>`)}

/* ---------- Render ---------- */
function render(){
  tick();persist();
  renderTabs();
  if(S.view==="dash")renderDash();else if(S.view==="cal")renderCal();else if(S.view==="arch")renderArch();else renderStat();
  const top=stack[stack.length-1];
  if(top&&top.classList.contains("detail")&&byId(top.dataset.id))refreshDetail(+top.dataset.id);
  if(top&&top.classList.contains("morning"))refreshMorning();
}

/* ---------- Aktionen ---------- */
document.addEventListener("click",ev=>{
  if(ev.target.closest(".grip"))return;const el=ev.target.closest("[data-act]");if(!el)return;
  const a=el.dataset.act,v=el.dataset.v,id=el.dataset.id;
  const A={
    tab:()=>{S.view=v;S.archSel=null;while(stack.length)closePage();window.scrollTo(0,0);render()},
    cat:()=>{S.cat=v;render()},
    typeFilter:()=>{if(S.type){S.type=null;render()}else typePicker(S.type,"setType")},
    setType:()=>{S.type=v||null;closeSheet();render()},
    open:()=>{closeSheet();openDetail(+id)},
    openRO:()=>openDetail(+id,true),
    openFromSheet:()=>{closeSheet();openDetail(+id)},
    openROFromSheet:()=>{closeSheet();openDetail(+id,true)},
    event:()=>{const x=events.find(e=>e.id===id);sheet(`<h2>${esc(x.title)}</h2><p class="sub">${WDL[x.start.getDay()]}, ${dmy(x.start)} · ${hm(x.start)} · aus ${x.src}</p><p class="note">Termine aus ${x.src} sind nur zum Ansehen. Du kannst sie in Anton ausblenden, in ${x.src} bleiben sie bestehen.</p><button class="btn ghost" data-act="ignore" data-id="${x.id}">In Anton ignorieren</button>`)},
    ignore:()=>{S.ignored.add(id);closeSheet();render();toast("Termin ausgeblendet",()=>{S.ignored.delete(id);render()})},
    night:()=>openNight(),
    settings:()=>openSettings(),
    closePage:()=>closePage(),
    closeSheet:()=>closeSheet(),
    newType:()=>openForm({type:v}),
    fromTpl:()=>openTplSheet(),
    useTpl:()=>{const t=templates[+v];openForm({...t,items:t.items.map(i=>({...i,d:false}))})},
    fCat:()=>{readForm();F.cat=v;refreshForm()},
    fStar:()=>{F.star=!F.star;refreshForm()},
    fPeriod:()=>{F.period=!F.period;refreshForm()},
    fTpl:()=>{F.tpl=!F.tpl;refreshForm()},
    fItem:()=>{F.items[+v].d=!F.items[+v].d;refreshForm()},
    fItemDel:()=>{F.items.splice(+v,1);refreshForm()},
    fItemAdd:()=>{const t=$("#fItemT").value.trim();if(!t)return;F.items.push({t,q:$("#fItemQ").value.trim(),d:false});refreshForm();$("#fItemT").focus()},
    fLinkToggle:()=>{const f=$("#fLinkForm");f.hidden=!f.hidden;if(!f.hidden)$("#fLinkU").focus()},
    fLinkAdd:()=>{let u=$("#fLinkU").value.trim();if(!u){$("#fLinkU").focus();return}if(!/^https?:\/\//i.test(u))u="https://"+u;F.links.push({title:$("#fLinkT").value.trim()||u.replace(/^https?:\/\//,""),url:u});refreshForm()},
    fLinkDel:()=>{F.links.splice(+v,1);refreshForm()},
    fSave:()=>saveForm(),
    edit:()=>{const e=byId(id);openForm(e,false,+id)},
    dItem:()=>{const e=byId(id);e.items[+v].d=!e.items[+v].d;refreshDetail(+id)},
    dItemAdd:()=>{const t=$("#dItemT").value.trim();if(!t)return;byId(id).items.push({t,q:$("#dItemQ").value.trim(),d:false});refreshDetail(+id);$("#dItemT").focus()},
    chToday:()=>{const c=byId(id).chal;const k=key(TODAY);c.days.has(k)?c.days.delete(k):c.days.add(k);refreshDetail(+id);if(c.days.has(k))toast("Stark! Tag abgehakt.")},
    chDay:()=>{const c=byId(id).chal;c.days.has(v)?c.days.delete(v):c.days.add(v);refreshDetail(+id)},
    chRes:()=>{const e=byId(id);e.chal.result=v;e.status="done";e.archived=new Date();if(curSheet)closeSheet();else closePage();render();toast(v==="ok"?"Challenge geschafft · im Archiv":"Challenge als versagt bewertet",()=>{e.chal.result=null;e.status="open";e.archived=null;render()})},
    mChal:()=>{const c=byId(id).chal;const k=key(TODAY);c.days.has(k)?c.days.delete(k):c.days.add(k);refreshMorning()},
    snooze:()=>sheet(`<h2>Zurückstellen</h2><p class="sub">Neue Fälligkeit wählen.</p><div class="grp"><button class="r" data-act="snoozeDo" data-id="${id}" data-v="1h">In 1 Stunde<span class="v">${hm(new Date(Date.now()+36e5))}</span></button><button class="r" data-act="snoozeDo" data-id="${id}" data-v="tm">Morgen früh<span class="v">9:00</span></button><button class="r" data-act="snoozeDo" data-id="${id}" data-v="wk">Nächste Woche<span class="v">Mo 9:00</span></button></div>`),
    snoozeDo:()=>{const e=byId(id);const old=e.due;e.due=v==="1h"?new Date(Date.now()+36e5):v==="tm"?at(addD(TODAY,1),9):at(addD(TODAY,((8-TODAY.getDay())%7)||7),9);closeSheet();render();toast("Zurückgestellt auf "+dueText(e).replace(/<[^>]+>/g,""),()=>{e.due=old;render()})},
    dStar:()=>{const e=byId(id);e.star=!e.star;render()},
    dTpl:()=>{const e=byId(id);templates.push({type:e.type,title:e.title,body:e.body,cat:e.cat,items:e.items.map(i=>({t:i.t,q:i.q}))});persist();toast("Als Vorlage gespeichert")},
    dDup:()=>{const e=byId(id);const c=mk({...e,id:undefined,created:new Date(),status:"open",archived:null,items:e.items.map(i=>({...i,d:false})),links:e.links.slice(),photos:e.photos.slice(),chal:e.chal?{start:e.chal.start,end:e.chal.end,days:new Set(),result:null}:null,order:Math.min(...entries.filter(isOpen).map(x=>x.order))-1});c.id=NID++;entries.push(c);closePage();openDetail(c.id);toast("Dupliziert")},
    dDone:()=>{closePage();archive(+id,"done")},
    dDel:()=>{closePage();archive(+id,"deleted")},
    restore:()=>{closePage();restore(+id)},
    purge:()=>{closePage();purge(+id)},
    calPrev:()=>{S.calMonth=new Date(S.calMonth.getFullYear(),S.calMonth.getMonth()-1,1);render()},
    calNext:()=>{S.calMonth=new Date(S.calMonth.getFullYear(),S.calMonth.getMonth()+1,1);render()},
    calMode:()=>{S.calMode=v;render()},
    calDay:()=>{S.calSel=new Date(v+"T00:00");render()},
    calCat:()=>{S.calCat=v;render()},
    calTypeFilter:()=>{if(S.calType){S.calType=null;render()}else typePicker(S.calType,"setCalType")},
    setCalType:()=>{S.calType=v||null;closeSheet();render()},
    archF:()=>{S.archF=v;render()},
    archType:()=>{if(TYPES[S.archF]){S.archF="Alle";render()}else typePicker(null,"setArchType")},
    setArchType:()=>{S.archF=v||"Alle";closeSheet();render()},
    archSelect:()=>{S.archSel=S.archSel?null:new Set();render()},
    archPick:()=>{const n=+id;S.archSel.has(n)?S.archSel.delete(n):S.archSel.add(n);render()},
    archBulk:()=>{const ids=[...S.archSel];if(!ids.length){toast("Erst Einträge antippen, um sie auszuwählen.");return}
      if(v==="restore"){ids.forEach(i=>{const e=byId(i);e.status="open";e.archived=null;if(e.chal)e.chal.result=null});S.archSel=null;render();toast(ids.length+" wiederhergestellt")}
      else{const removed=ids.map(i=>{const k=entries.findIndex(e=>e.id===i);return [k,entries[k]]}).sort((a,b)=>b[0]-a[0]);removed.forEach(([k])=>entries.splice(k,1));S.archSel=null;render();toast(ids.length+" endgültig entfernt",()=>{removed.reverse().forEach(([k,e])=>entries.splice(k,0,e));render()})}},
    period:()=>{S.period=v;render()},
    drill:()=>openDrill(v),
    accent:()=>{setAccent(v);refreshSettings()},
    icsInfo:()=>sheet(`<h2>${v}-Kalender</h2><p class="sub">Schreibgeschütztes Abo per ICS-Link</p><p class="note">Hier fügst du später den Freigabe-Link aus ${v} ein. Anton ruft ihn bei jedem Start ab und zeigt die Termine nur an.</p><p class="note">Diese Funktion folgt in einem der nächsten Updates.</p><button class="btn ghost" data-act="closeSheet">Schließen</button>`),
    ignored:()=>{const list=events.filter(x=>S.ignored.has(x.id));sheet(`<h2>Ignorierte Termine</h2><p class="sub">Einblenden holt den Termin zurück ins Dashboard.</p><div class="grp">${list.map(x=>`<div class="r"><span class="ri" style="background:${SRC[x.src]}17;color:${SRC[x.src]}">${L("cal",16)}</span><span>${esc(x.title)}<br><span class="muted" style="font-size:12px">${dmy(x.start)} · ${x.src}</span></span><button class="v a" data-act="unignore" data-id="${x.id}">Einblenden</button></div>`).join("")||'<div class="empty">Keine ignorierten Termine. Tippe im Dashboard auf einen Outlook- oder Proton-Termin, um ihn auszublenden.</div>'}</div>`)},
    unignore:()=>{S.ignored.delete(id);A.ignored();refreshSettings();render()},
    shortcut:()=>sheet(`<h2>Wecker-Kurzbefehl</h2><p class="sub">Einmal einrichten, danach stellt Anton den Wecker mit einem Tipp.</p>
      <ol class="steps"><li>Öffne die App <b>Kurzbefehle</b> und tippe oben rechts auf <b>+</b>.</li>
      <li>Tippe oben auf den Namen und nenne den Kurzbefehl genau <b>Anton Wecker</b>.</li>
      <li>Füge die Aktion <b>Datumsangaben abrufen</b> hinzu. Als Eingabe wählst du <b>Kurzbefehleingabe</b>.</li>
      <li>Füge die Aktion <b>Wecker erstellen</b> hinzu und setze als Uhrzeit die <b>Datumsangaben</b> aus Schritt 3. Als Bezeichnung kannst du „Anton“ eintragen.</li>
      <li>Tippe unten auf das Info-Symbol und stelle bei <b>Eingabe empfangen</b> den Typ <b>Text</b> ein. Dann auf <b>Fertig</b>.</li></ol>
      <p class="note">Danach hier testen. iOS fragt beim ersten Mal, ob Anton den Kurzbefehl öffnen darf. Zurück zu Anton kommst du, indem du unten über den Home-Balken nach rechts wischst.</p>
      <a class="btn" href="${alarmURL(S.alarm)}" data-act="alarmGo">Testen mit ${S.alarm}</a>`),
    morning:()=>page(morningHTML(),"morning"),
    backup:()=>toast("Die Sicherung in die Dateien-App folgt in einem der nächsten Updates."),
    restoreBackup:()=>toast("Die Wiederherstellung folgt in einem der nächsten Updates."),
    tplList:()=>sheet(`<h2>Vorlagen</h2><p class="sub">Neue Vorlagen speicherst du im Formular oder in der Detailansicht.</p><div class="grp">${templates.map((t,i)=>`<div class="r">${icon(t.type)}<span>${esc(t.title||t.type)}</span><button class="v" data-act="tplDel" data-v="${i}" style="color:var(--danger)">Entfernen</button></div>`).join("")||'<div class="empty">Keine Vorlagen</div>'}</div>`),
    tplDel:()=>{templates.splice(+v,1);A.tplList();refreshSettings()},
    alarmGo:()=>{S.alarmSet={day:key(TODAY),time:S.alarm};persist();location.href=alarmURL(S.alarm)},
    photo:()=>{const u=photoUrls.get(v);if(u)sheet(`<img src="${u}" alt="Foto" style="width:100%;border-radius:14px;display:block;margin-top:24px">`)},
    fPhotoDel:()=>{const [id]=F.photos.splice(+v,1);pendingPhotos.delete(id);refreshForm()}
  };
  if(A[a]){ev.preventDefault();A[a]()}
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){if(curSheet)closeSheet();else if(stack.length)closePage()}
  if(e.key==="Enter"&&e.target.id==="fItemT"){e.preventDefault();document.querySelector('[data-act="fItemAdd"]').click()}
  if(e.key==="Enter"&&e.target.id==="dItemT"){e.preventDefault();document.querySelector('[data-act="dItemAdd"]').click()}
});

/* ---------- Start ---------- */
const VERSION="0.2.1";
function cleanupArchive(){
  const n=+S.cleanup;if(!n)return;
  for(let i=entries.length-1;i>=0;i--){const e=entries[i];if(!isOpen(e)&&e.archived&&daysBetween(e.archived,TODAY)>n)entries.splice(i,1)}
}
// Abends Gute Nacht, morgens beim ersten Öffnen des Tages Guten Morgen.
function autoViews(){
  if(stack.length)return;
  const [nh,nm]=S.nightFrom.split(":").map(Number);const mins=NOW.getHours()*60+NOW.getMinutes();
  const night=mins>=nh*60+nm||NOW.getHours()<4;
  const evening=key(NOW.getHours()<4?addD(TODAY,-1):TODAY);
  if(night){if(S.lastNight!==evening){S.lastNight=evening;openNight()}}
  else if(S.lastMorning!==key(TODAY)&&entries.some(isOpen)){S.lastMorning=key(TODAY);page(morningHTML(),"morning")}
  persist();
}
let shownDay=null;
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState!=="visible")return;
  tick();if(shownDay!==key(TODAY)){shownDay=key(TODAY);cleanupArchive();render()}
  autoViews();
});
async function start(){
  try{
    const data=await db.loadAll();
    data.entries.map(fromRec).forEach(e=>{entries.push(e);snap.set(e.id,JSON.stringify(toRec(e)))});
    NID=entries.reduce((m,e)=>Math.max(m,e.id),0)+1;
    templates.push(...data.templates);flush.t=JSON.stringify(templates);
    if(data.settings){SAVED_SETTINGS.forEach(k=>{if(data.settings[k]!==undefined)S[k]=data.settings[k]});S.ignored=new Set(data.settings.ignored||[]);if(S.lastBackup)S.lastBackup=new Date(S.lastBackup)}
  }catch(err){console.error(err);toast("Daten konnten nicht geladen werden.")}
  setAccent(S.accent);
  db.requestPersistence();
  db.cleanupPhotos(new Set(entries.flatMap(e=>e.photos))).catch(()=>{});
  cleanupArchive();shownDay=key(TODAY);
  render();autoViews();
  if("serviceWorker" in navigator&&location.protocol!=="file:"){
    // Neue Version: einmal neu laden, sobald der neue Service Worker übernimmt.
    const hadController=!!navigator.serviceWorker.controller;let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(hadController&&!reloaded){reloaded=true;flush();setTimeout(()=>location.reload(),150)}});
    navigator.serviceWorker.register("sw.js").catch(err=>console.warn("Service Worker:",err));
  }
}
start();
