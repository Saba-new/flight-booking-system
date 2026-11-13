const AIRPORTS = [
  {iataCode:'JFK',airportName:'John F. Kennedy International Airport',city:'New York',country:'United States'},
  {iataCode:'LAX',airportName:'Los Angeles International Airport',city:'Los Angeles',country:'United States'},
  {iataCode:'ORD',airportName:"O'Hare International Airport",city:'Chicago',country:'United States'},
  {iataCode:'LHR',airportName:'Heathrow Airport',city:'London',country:'United Kingdom'},
  {iataCode:'CDG',airportName:'Charles de Gaulle Airport',city:'Paris',country:'France'},
  {iataCode:'FRA',airportName:'Frankfurt Airport',city:'Frankfurt',country:'Germany'},
  {iataCode:'IST',airportName:'Istanbul Airport',city:'Istanbul',country:'Türkiye'},
  {iataCode:'DXB',airportName:'Dubai International Airport',city:'Dubai',country:'United Arab Emirates'},
  {iataCode:'AMM',airportName:'Queen Alia International Airport',city:'Amman',country:'Jordan'},
  {iataCode:'SIN',airportName:'Changi Airport',city:'Singapore',country:'Singapore'}
];
const CLASSES = [
  {classID:'C1',name:'Business',priceCoeff:2.5,bg:'#FBE3B8',border:'#B26A00',color:'#4A2C00',rows:[1,3]},
  {classID:'C2',name:'Premium Economy',priceCoeff:1.5,bg:'#D5E4FB',border:'#3C6FD1',color:'#0F2A5C',rows:[4,7]},
  {classID:'C3',name:'Economy',priceCoeff:1,bg:'#FFFFFF',border:'#8392A8',color:'#0F1B2D',rows:[8,20]}
];
const COLS = ['A','B','C','D','E','F'];
const classOfRow = r => CLASSES.find(c => r >= c.rows[0] && r <= c.rows[1]);
const AIRPLANES = [
  {airplaneID:'AP-0412',model:'Airbus A320neo',capacity:120},
  {airplaneID:'AP-0377',model:'Boeing 737-800',capacity:120},
  {airplaneID:'AP-0501',model:'Airbus A321',capacity:120},
  {airplaneID:'AP-0288',model:'Boeing 787-9',capacity:120},
  {airplaneID:'AP-0615',model:'Airbus A330-300',capacity:120}
];
const ap = code => AIRPORTS.find(a => a.iataCode === code);
const hash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h };

function offersFor(dep, arr, date){
  const seed = hash(dep + arr);
  const base = 140 + (seed % 380);
  return [0,1,2,3,4].map(i => ({
    flightID: 'F' + (seed % 900 + 100) + '-' + i,
    flightNo: 'FB ' + (100 + (seed % 800) + i * 6),
    basePrice: base + [0,-22,25,61,-38][i],
    airplane: AIRPLANES[(seed + i) % AIRPLANES.length]
  }));
}
const isTaken = (flightID, r, c) => hash(flightID + r + c) % 100 < 26;

const store = {
  get(k,d){try{const v=localStorage.getItem('fb_'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem('fb_'+k,JSON.stringify(v))}catch(e){}}
};
const T = (n,name,pp,seat,cls,st) => ({ticketNumber:'TK-'+n,fullName:name,passportNo:pp,seatNumber:seat,className:cls,ticketStatus:st||'Issued'});
const B = (pnr,time,status,flightNo,date,dep,arr,tickets) => ({pnr,bookingTime:time,status,flightNo,date,dep,arr,tickets});
const SEED_BOOKINGS = [
  B('K7Q2XM','Nov 11, 2026 · 4:52 PM','Confirmed','FB 214','Wed, Nov 25, 2026','JFK','ORD',[
    T(100482,'Maya Chen','P4829173','12A','Economy'),T(100483,'Daniel Chen','P4829174','12B','Economy')]),
  B('B5N3VC','Oct 29, 2026 · 10:26 AM','Confirmed','FB 301','Wed, Nov 18, 2026','ORD','JFK',[
    T(99871,'Maya Chen','P4829173','2A','Business'),T(99872,'Daniel Chen','P4829174','5C','Premium Economy'),T(99873,'Priya Nair','X7731842','14F','Economy','Cancelled')]),
  B('H8V4TW','Nov 8, 2026 · 8:05 PM','Confirmed','FB 640','Mon, Dec 7, 2026','JFK','LHR',[
    T(101120,'Maya Chen','P4829173','1A','Business'),T(101121,'Daniel Chen','P4829174','1B','Business')]),
  B('R4T9LD','Nov 3, 2026 · 9:18 AM','Pending','FB 502','Sat, Dec 12, 2026','LAX','JFK',[
    T(100301,'Maya Chen','P4829173','9D','Economy')]),
  B('P3C7YN','Oct 22, 2026 · 2:40 PM','Confirmed','FB 718','Fri, Dec 18, 2026','LHR','CDG',[
    T(100005,'Maya Chen','P4829173','6A','Premium Economy'),T(100006,'Lina Haddad','M2210956','6B','Premium Economy'),T(100007,'Omar Haddad','M2210957','6C','Premium Economy')]),
  B('D9F2QS','Oct 18, 2026 · 11:12 AM','Pending','FB 833','Tue, Dec 22, 2026','AMM','DXB',[
    T(99940,'Maya Chen','P4829173','15C','Economy')]),
  B('M2W8ZP','Oct 14, 2026 · 7:40 PM','Cancelled','FB 118','Fri, Oct 30, 2026','ORD','LAX',[
    T(98800,'Maya Chen','P4829173','6B','Premium Economy','Cancelled')]),
  B('Z6L1AB','Sep 30, 2026 · 6:30 PM','Confirmed','FB 455','Thu, Oct 8, 2026','IST','FRA',[
    T(97650,'Maya Chen','P4829173','3F','Business'),T(97651,'Daniel Chen','P4829174','11D','Economy')])
];
const API = {
  users(){return store.get('users',[{customerID:'C-100248',fullName:'Maya Chen',email:'maya.chen@example.com',role:'Customer',name:'mchen',password:'password123'}])},
  login(name,pw){return this.users().find(x=>x.name===name&&x.password===pw)||null},
  signup(f){const us=this.users();if(us.some(u=>u.name===f.name))return null;
    const u={customerID:'C-'+(100249+us.length),fullName:f.fullName,email:f.email,role:'Customer',name:f.name,password:f.password};
    us.push(u);store.set('users',us);return u},
  bookings(){return store.get('bookings_'+(session.user?session.user.customerID:''),session.user&&session.user.name==='mchen'?SEED_BOOKINGS:[])},
  addBooking(b){const l=this.bookings();l.unshift(b);store.set('bookings_'+session.user.customerID,l)}
};

const session = {user:store.get('session',null)};
const flow = {dep:'JFK',arr:'LHR',date:'2026-12-07',offer:null,seats:[],lastPnr:null};

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$'+n.toFixed(2);
const fmtDate = iso => new Date(iso+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
const fmtTime = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const badge = (s,k) => `<span class="badge ${k||(['Confirmed','Issued'].includes(s)?'ok':s==='Pending'?'pend':s==='Cancelled'?'bad':'')}">${esc(s)}</span>`;
const field = (id,label,type,ph,val,err) => `<label for="${id}">${label}<input id="${id}" name="${id}" type="${type}" placeholder="${ph}" value="${esc(val||'')}" class="${err?'bad':''}" ${err?`aria-invalid="true" aria-describedby="${id}-e"`:''}>${err?`<span class="err" id="${id}-e">${err}</span>`:''}</label>`;
const GEO = {JFK:[-73.8,40.6],LAX:[-118.4,33.9],ORD:[-87.9,42],LHR:[-0.5,51.5],CDG:[2.5,49],FRA:[8.6,50],IST:[28.8,41.3],DXB:[55.4,25.3],AMM:[36,31.7],SIN:[103.9,1.4]};
const LAND = [
  [[-168,66],[-140,70],[-110,72],[-85,70],[-62,62],[-55,52],[-66,45],[-76,38],[-81,31],[-80,25],[-90,29],[-97,26],[-97,21],[-87,21],[-83,15],[-78,8],[-86,11],[-95,16],[-105,20],[-110,24],[-117,32],[-124,40],[-125,48],[-135,58],[-150,60],[-160,58]],
  [[-55,60],[-45,60],[-20,70],[-20,82],[-55,82],[-70,76]],
  [[-78,8],[-60,10],[-50,0],[-35,-6],[-40,-22],[-48,-27],[-58,-38],[-66,-46],[-72,-52],[-75,-45],[-72,-30],[-70,-18],[-81,-5]],
  [[-10,36],[-9,43],[-2,48],[2,51],[8,54],[10,58],[5,62],[15,69],[28,71],[40,66],[32,58],[30,46],[28,41],[22,37],[15,38],[8,44],[3,43],[-5,36]],
  [[-17,21],[-10,35],[10,37],[32,31],[43,12],[51,12],[40,-5],[40,-16],[33,-27],[20,-35],[12,-18],[9,-1],[5,5],[-8,4],[-17,14]],
  [[28,41],[40,45],[40,66],[60,70],[100,77],[140,72],[180,68],[170,60],[142,52],[135,43],[127,36],[122,30],[120,23],[108,21],[106,10],[100,3],[98,8],[92,22],[80,15],[77,8],[72,21],[60,25],[56,26],[50,30],[44,36]],
  [[35,30],[43,13],[52,17],[59,22],[56,26],[48,30],[40,32]],
  [[113,-22],[130,-12],[142,-11],[153,-26],[147,-38],[135,-35],[115,-34]],
  [[-5,50],[1,51],[0,58],[-6,58]],
  [[130,32],[141,40],[142,45],[137,36]]
];
const LINES = [['JFK','LHR',12,0],['LAX','JFK',14,3],['ORD','CDG',15,6],['LHR','DXB',13,2],['FRA','IST',8,5],['DXB','SIN',12,7],['AMM','CDG',10,1],['JFK','ORD',7,4],['IST','DXB',9,8]];
const PLANE = new Path2D('M10 0 L2 -2.2 L-1 -9 L-3.5 -9 L-2.5 -2.4 L-8 -1.6 L-9 -4 L-11 -4 L-10 0 L-11 4 L-9 4 L-8 1.6 L-2.5 2.4 L-3.5 9 L-1 9 L2 2.2 Z');
const mp = {canvas:null,ctx:null,w:0,h:0,dpr:1,s:1,land:null,raf:0,t0:performance.now()};
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const proj = (lon,lat) => [mp.w/2+(lon-mp.cl)*mp.s, mp.h*0.55-(lat-38)*mp.s];
function inPoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function layoutMap(){
  const c=mp.canvas,r=c.getBoundingClientRect();
  mp.dpr=Math.min(window.devicePixelRatio||1,2);
  mp.w=Math.max(1,Math.round(r.width));mp.h=Math.max(1,Math.round(r.height));
  c.width=mp.w*mp.dpr;c.height=mp.h*mp.dpr;
  mp.s=Math.max(mp.w/340,mp.h/105);
  mp.cl=mp.w>760?8:20;
  mp.ctx=c.getContext('2d');
  const off=document.createElement('canvas');off.width=c.width;off.height=c.height;
  const o=off.getContext('2d');o.scale(mp.dpr,mp.dpr);
  const step=Math.max(2.3,12/mp.s);
  o.fillStyle='rgba(255,255,255,.3)';
  for(let lat=84;lat>-60;lat-=step)for(let lon=-180;lon<=180;lon+=step){
    if(LAND.some(p=>inPoly(lon,lat,p))){const q=proj(lon,lat);if(q[0]>-4&&q[0]<mp.w+4&&q[1]>-4&&q[1]<mp.h+4){o.beginPath();o.arc(q[0],q[1],Math.max(1.1,mp.s*.38),0,6.2832);o.fill()}}
  }
  mp.land=off;
}
const bez = (a,b,k,t) => {const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2-Math.hypot(b[0]-a[0],b[1]-a[1])*k;const u=1-t;return [u*u*a[0]+2*u*t*mx+t*t*b[0],u*u*a[1]+2*u*t*my+t*t*b[1]]};
function drawMap(t){
  const x=mp.ctx;if(!x)return;
  x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,mp.land.width,mp.land.height);
  x.drawImage(mp.land,0,0);
  x.setTransform(mp.dpr,0,0,mp.dpr,0,0);
  const k=.3,airports=new Set();
  LINES.forEach(([A,B,period,phase],n)=>{
    const a=proj(...GEO[A]),b=proj(...GEO[B]);airports.add(A);airports.add(B);
    x.setLineDash([2,7]);x.lineDashOffset=-t*9;x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1.3;
    x.beginPath();x.moveTo(a[0],a[1]);const m=bez(a,b,k,.5);x.quadraticCurveTo(2*m[0]-(a[0]+b[0])/2,2*m[1]-(a[1]+b[1])/2,b[0],b[1]);x.stroke();
    const p=((t+phase)%period)/period,e=p*p*(3-2*p);
    x.setLineDash([]);
    const N=28;x.lineWidth=2.2;
    for(let i=0;i<N;i++){const t0=Math.max(0,e-0.22)+(i/N)*(e-Math.max(0,e-0.22)),t1=Math.max(0,e-0.22)+((i+1)/N)*(e-Math.max(0,e-0.22));const p0=bez(a,b,k,t0),p1=bez(a,b,k,t1);x.strokeStyle='rgba(255,255,255,'+(0.04+0.7*i/N)+')';x.beginPath();x.moveTo(p0[0],p0[1]);x.lineTo(p1[0],p1[1]);x.stroke()}
    const pos=bez(a,b,k,e),nx=bez(a,b,k,Math.min(1,e+.01)),ang=Math.atan2(nx[1]-pos[1],nx[0]-pos[0]);
    x.save();x.translate(pos[0],pos[1]);x.rotate(ang);x.scale(mp.s*.2+.55,mp.s*.2+.55);x.shadowColor='rgba(255,255,255,.9)';x.shadowBlur=10;x.fillStyle='#fff';x.fill(PLANE);x.restore();
  });
  let i=0;
  airports.forEach(code=>{const q=proj(...GEO[code]),ph=((t*.5+i*.31)%1);i++;
    x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(q[0],q[1],2.6,0,6.2832);x.fill();
    x.strokeStyle='rgba(255,255,255,'+(0.4*(1-ph))+')';x.lineWidth=1.4;x.beginPath();x.arc(q[0],q[1],3+ph*14,0,6.2832);x.stroke()});
}
function mapLoop(now){mp.raf=requestAnimationFrame(mapLoop);if(mp.canvas&&mp.canvas.isConnected)drawMap((now-mp.t0)/1000)}
function startMap(){
  const c=document.querySelector('.hero canvas');if(!c)return;
  mp.canvas=c;layoutMap();
  if(reduceMotion()){drawMap(4);return}
  if(!mp.raf)mp.raf=requestAnimationFrame(mapLoop);
}
window.addEventListener('resize',()=>{if(mp.canvas&&mp.canvas.isConnected){layoutMap();if(reduceMotion())drawMap(4)}});
const need = () => { if(!session.user){location.hash='#/login';return false} return true };
const EMAIL = /^\S+@\S+\.\S+$/;
const shell = (title,sub,body,plain) => { $('#app').innerHTML = plain
  ? `<main class="plain"><h1 style="margin:0;font:700 34px 'Space Grotesk',sans-serif">${title}</h1>${body}</main>`
  : `<section class="hero ${sub?'':'sm'}"><canvas aria-hidden="true"></canvas><div class="hero-in"><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div></section><main>${body}</main>`;
  if(!plain)startMap() };

function renderNav(route){
  const li = !!session.user;
  const items=[['search','Search Flights','#/search'],['bookings','My Bookings','#/bookings'],['profile','Profile','#/profile'],['login',li?'Logout':'Login / Sign Up',li?'#/logout':'#/login']];
  const on = route==='booking'?'bookings':['seats','passengers','confirmation'].includes(route)?'search':route;
  $('#nav').innerHTML = items.map(([k,l,h])=>`<a href="${h}" class="${k===on?'on':''} ${k==='login'&&li?'out':''}" ${k===on?'aria-current="page"':''}>${l}</a>`).join('');
}

function pLogin(errs,vals){
  const first = !errs; errs=errs||{};vals=vals||{};
  const ln = vals.ln!==undefined?vals.ln:(first?'mchen':''), lp = first?'password123':'';
  shell('Login / Sign Up','Log in to manage your bookings, or create an account to book your first flight.',`<div class="row">
  <section class="card" aria-labelledby="lh"><form id="fl" novalidate><div class="auth-head"><i aria-hidden="true">🔑</i><h2 id="lh">Login</h2></div>
    ${field('login-name','Name','text','mchen',ln,errs.ln)}${field('login-password','Password','password','••••••••',lp,errs.lp)}
    <button class="btn">Login</button></form></section>
  <section class="card" aria-labelledby="sh"><form id="fs" novalidate><div class="auth-head"><i aria-hidden="true">👤</i><h2 id="sh">Sign Up</h2></div>
    ${field('signup-fullName','Full name','text','Maya Chen',vals.sf,errs.sf)}${field('signup-email','Email','email','maya.chen@example.com',vals.se,errs.se)}
    ${field('signup-name','Name','text','mchen',vals.sn,errs.sn)}${field('signup-password','Password','password','••••••••','',errs.sp)}
    <button class="btn">Sign Up</button></form></section></div>`);
  $('#fl').onsubmit = e => { e.preventDefault();
    const n=$('#login-name').value.trim(),p=$('#login-password').value,er={};
    if(!n)er.ln='Enter your name.'; if(!p)er.lp='Enter your password.';
    if(!Object.keys(er).length){const u=API.login(n,p);if(u){session.user=u;store.set('session',u);location.hash='#/search';return}er.lp='Name or password is incorrect.'}
    pLogin(er,{ln:n}); };
  $('#fs').onsubmit = e => { e.preventDefault();
    const f={fullName:$('#signup-fullName').value.trim(),email:$('#signup-email').value.trim(),name:$('#signup-name').value.trim(),password:$('#signup-password').value},er={};
    if(!f.fullName)er.sf='Enter your full name.'; if(!EMAIL.test(f.email))er.se='Enter a valid email address.';
    if(!f.name)er.sn='Enter a name.'; if(!f.password)er.sp='Enter a password.';
    if(!Object.keys(er).length){const u=API.signup(f);if(u){session.user=u;store.set('session',u);location.hash='#/search';return}er.sn='That name is already taken.'}
    pLogin(er,{ln:'',sf:f.fullName,se:f.email,sn:f.name}); };
}

let openSel=null, lastView='idle', stillOffers=false;
function pSearch(view){
  view=view||'idle'; lastView=view;
  const sel=(key,label)=>{const a=ap(flow[key]);return `<div class="sel"><span class="cap">${label}</span>
    <button type="button" data-sel="${key}" aria-haspopup="listbox" aria-expanded="${openSel===key}"><span><b>${a.iataCode}</b> <span style="color:var(--mute)">${a.city}</span></span><span aria-hidden="true">▾</span></button>
    ${openSel===key?`<div class="opts" role="listbox">${AIRPORTS.map(x=>`<button type="button" role="option" data-pick="${key}:${x.iataCode}" class="${x.iataCode===flow[key]?'on':''}"><b>${x.iataCode}</b><span>${x.airportName}<small>${x.city}, ${x.country}</small></span></button>`).join('')}</div>`:''}</div>`};
  let res='';
  if(view==='idle') res=`<div class="card empty"><div class="ic">✈</div><h2>Where to next?</h2>Choose your airports and date, then press Search to see offers.</div>`;
  else if(view==='loading') res=`<div class="card empty"><div class="spin"></div>Searching offers…</div>`;
  else if(view==='empty') res=`<div class="card empty"><div class="ic">🔍</div><h2>No offers found</h2>There are no offers from ${flow.dep} to ${flow.arr} on ${fmtDate(flow.date)}. Try a different date or airport.</div>`;
  else if(view==='results'){
    const d=ap(flow.dep),a=ap(flow.arr),list=offersFor(flow.dep,flow.arr,flow.date);
    res=`<div class="offers-h"><h2>Offers</h2><p class="sub">${d.city} to ${a.city} · ${fmtDate(flow.date)} · ${list.length} offers</p></div><div class="offers ${stillOffers?'still':''}">`+list.map((f,i)=>`<article class="card offer" style="--i:${i}" aria-label="Offer ${f.flightNo}">
      <div class="fl"><b>${f.flightNo}</b><span>${fmtDate(flow.date)}</span><div class="meta"><span class="chip">${f.airplane.model}</span></div></div>
      <div class="route"><div class="pt"><b>${d.iataCode}</b><span>${d.city}</span></div><div class="line"></div><div class="pt" style="text-align:right"><b>${a.iataCode}</b><span>${a.city}</span></div></div>
      <div class="pr"><small>Base price</small><b>${money(f.basePrice)}</b></div>
      <button class="btn" data-offer="${i}">Select</button></article>`).join('')+`</div>`;
  }
  shell('Search Flights','Find an offer for your route and date, then pick your seats.',
    `<section class="card"><div class="sbar">${sel('dep','Departure Airport')}${sel('arr','Arrival Airport')}
    <label for="sd">Date<input id="sd" type="date" value="${flow.date}"></label><button id="go" class="btn" ${view==='loading'?'disabled':''}>${view==='loading'?'Searching…':'Search'}</button></div></section>${res}`);
  const keepDate=()=>{flow.date=$('#sd').value||flow.date};
  document.querySelectorAll('[data-sel]').forEach(b=>b.onclick=()=>{keepDate();openSel=openSel===b.dataset.sel?null:b.dataset.sel;stillOffers=true;pSearch(view);stillOffers=false});
  document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{keepDate();const p=b.dataset.pick.split(':');flow[p[0]]=p[1];openSel=null;pSearch(view)});
  $('#go').onclick=()=>{keepDate();openSel=null;pSearch('loading');setTimeout(()=>pSearch(flow.dep===flow.arr?'empty':'results'),600)};
  document.querySelectorAll('[data-offer]').forEach(b=>b.onclick=()=>{flow.offer=offersFor(flow.dep,flow.arr,flow.date)[b.dataset.offer];flow.seats=[];location.hash='#/seats'});
}

function pSeats(){
  if(!flow.offer){location.hash='#/search';return}
  const f=flow.offer,a=f.airplane;
  let rows='';
  for(let r=1;r<=20;r++){const c=classOfRow(r);
    if(r===c.rows[0]) rows+=`<div class="cabin">${c.name}</div>`;
    rows+=`<div class="sr"><span class="lbl">${r}</span>`+COLS.map((L,i)=>{
      const n=r+L,t=isTaken(f.flightID,r,i),s=flow.seats.includes(n),pr=money(f.basePrice*c.priceCoeff);
      const b=`<button class="seat ${t?'taken':''} ${s?'sel':''}" data-seat="${n}" ${t?'disabled':''} aria-pressed="${s}" aria-label="Seat ${n}, ${c.name}, ${t?'taken':pr}" style="background:${c.bg};border-color:${c.border};color:${c.color}">${n}<span class="p">${t?'taken':'$'+Math.round(f.basePrice*c.priceCoeff)}</span></button>`;
      return (i===3?`<span></span>`:'')+b}).join('')+`<span class="lbl">${r}</span></div>`}
  const hdr=`<div class="sr"><span></span>${['A','B','C'].map(x=>`<span class="lbl">${x}</span>`).join('')}<span></span>${['D','E','F'].map(x=>`<span class="lbl">${x}</span>`).join('')}<span></span></div>`;
  const list=flow.seats.map(n=>{const c=classOfRow(parseInt(n,10));return `<tr><td><b>${n}</b></td><td>${c.name}</td><td>${money(f.basePrice*c.priceCoeff)}</td></tr>`}).join('');
  shell('Seat Selection',`${f.flightNo} · ${ap(flow.dep).city} to ${ap(flow.arr).city} · ${fmtDate(flow.date)}`,`<section class="card"><dl>
    <div><dt>Airplane ID</dt><dd>${a.airplaneID}</dd></div><div><dt>Model</dt><dd>${a.model}</dd></div><div><dt>Capacity</dt><dd>${a.capacity}</dd></div><div><dt>Base price</dt><dd>${money(f.basePrice)}</dd></div></dl></section>
    <div class="seatwrap"><section class="card map" aria-label="Seat map">${hdr}${rows}</section>
    <aside class="side"><section class="card legend"><h2>Class</h2>${CLASSES.map(c=>`<div><span class="sw" style="background:${c.bg};border-color:${c.border}"></span>${c.name}<span class="c">×${c.priceCoeff}</span></div>`).join('')}
      <div><span class="sw" style="background:var(--pri);border-color:var(--pri)"></span>Selected</div><div><span class="sw" style="background:repeating-linear-gradient(135deg,#E8ECF2 0 4px,#D9E0EA 4px 8px);border-color:#C5CFDD"></span>Taken</div></section>
      <section class="card"><h2 style="margin-bottom:10px">Selected seats</h2>${flow.seats.length?`<table class="tbl"><thead><tr><th>Seat</th><th>Class</th><th>Price</th></tr></thead><tbody>${list}</tbody></table>`:`<p class="sub">No seats selected.</p>`}</section>
      <button id="cont" class="btn" ${flow.seats.length?'':'disabled'}>Continue</button></aside></div>`);
  document.querySelectorAll('[data-seat]').forEach(b=>b.onclick=()=>{const y=window.scrollY,n=b.dataset.seat,i=flow.seats.indexOf(n);if(i>=0)flow.seats.splice(i,1);else flow.seats.push(n);
    flow.seats.sort((x,y)=>parseInt(x,10)-parseInt(y,10)||x.localeCompare(y));pSeats();window.scrollTo(0,y)});
  $('#cont').onclick=()=>{if(need())location.hash='#/passengers'};
}

function rnd(n){const s='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<n;i++)o+=s[Math.floor(Math.random()*s.length)];return o}
const DEMO_PAX = [['Daniel Chen','daniel.chen@example.com','P4829174'],['Lina Haddad','lina.haddad@example.com','M2210956'],['Omar Haddad','omar.haddad@example.com','M2210957'],['Sara Nasser','sara.nasser@example.com','K9034417']];
function pPassengers(errs,vals,busy){
  const first = !vals; errs=errs||{};vals=vals||{};
  if(!need())return; if(!flow.seats.length){location.hash='#/seats';return}
  const blocks=flow.seats.map((n,i)=>{const c=classOfRow(parseInt(n,10)),e=errs[n]||{};
    const dp = i===0?[session.user.fullName,session.user.email,'P4829173']:DEMO_PAX[(i-1)%DEMO_PAX.length];
    const v=vals[n]||(first?{fullName:dp[0],email:dp[1],passportNo:dp[2]}:{});
    return `<section class="card tk" aria-labelledby="h${n}"><h2 id="h${n}">Seat ${n} <span class="chip">${c.name}</span></h2>
    ${field(`t-${n}-fullName`,'Full name','text','Maya Chen',v.fullName,e.fullName)}${field(`t-${n}-email`,'Email','email','maya.chen@example.com',v.email,e.email)}${field(`t-${n}-passportNo`,'Passport number','text','P4829173',v.passportNo,e.passportNo)}</section>`}).join('');
  shell('Passenger Details',`${flow.offer.flightNo} · ${ap(flow.dep).iataCode} → ${ap(flow.arr).iataCode} · ${fmtDate(flow.date)}`,`<form id="fp" novalidate style="gap:24px"><div class="grid3">${blocks}</div><div><button class="btn" ${busy?'disabled':''}>${busy?'Confirming…':'Confirm Booking'}</button></div></form>`);
  $('#fp').onsubmit=e=>{e.preventDefault();const vs={},er={};
    flow.seats.forEach(n=>{const g=k=>$(`#t-${n}-${k}`).value.trim();vs[n]={fullName:g('fullName'),email:g('email'),passportNo:g('passportNo')};const x={};
      if(!vs[n].fullName)x.fullName='Enter the passenger’s full name.'; if(!EMAIL.test(vs[n].email))x.email='Enter a valid email address.'; if(!vs[n].passportNo)x.passportNo='Enter a passport number.';
      if(Object.keys(x).length)er[n]=x});
    if(Object.keys(er).length){pPassengers(er,vs);return}
    pPassengers({},vs,true);
    setTimeout(()=>{
      const b={pnr:rnd(6),bookingTime:fmtTime(new Date()),status:'Confirmed',flightNo:flow.offer.flightNo,date:fmtDate(flow.date),dep:flow.dep,arr:flow.arr,
        tickets:flow.seats.map(n=>({ticketNumber:'TK-'+(200000+Math.floor(Math.random()*99999)),fullName:vs[n].fullName,passportNo:vs[n].passportNo,seatNumber:n,className:classOfRow(parseInt(n,10)).name,ticketStatus:'Issued'}))};
      API.addBooking(b);flow.seats=[];flow.lastPnr=b.pnr;location.hash='#/confirmation'},900)};
}

function bookingView(b,title,confirmed){
  const d=ap(b.dep),a=ap(b.arr);
  const body=`${confirmed?`<div class="success"><i aria-hidden="true">✓</i>Your booking is confirmed.</div>`:''}
  <section class="card"><dl><div><dt>PNR</dt><dd style="font-family:'Space Grotesk';letter-spacing:.06em;font-size:22px">${b.pnr}</dd></div><div><dt>Booking time</dt><dd>${b.bookingTime}</dd></div><div><dt>Status</dt><dd>${badge(b.status)}</dd></div></dl></section>
  <section class="card"><dl><div><dt>Flight</dt><dd>${b.flightNo}</dd></div><div><dt>Date</dt><dd>${b.date}</dd></div>
    <div><dt>Departure</dt><dd>${d.iataCode} · ${d.city}<span class="s">${d.airportName}</span></dd></div>
    <div><dt>Arrival</dt><dd>${a.iataCode} · ${a.city}<span class="s">${a.airportName}</span></dd></div></dl></section>
  <section class="card"><h2 style="margin-bottom:12px">Tickets</h2><div class="scroll"><table class="tbl stack"><thead><tr><th>Ticket Number</th><th>Full Name</th><th>Passport No.</th><th>Seat</th><th>Class</th><th>Status</th></tr></thead><tbody>
  ${b.tickets.map(t=>`<tr><td data-l="Ticket Number">${t.ticketNumber}</td><td data-l="Full Name"><b>${esc(t.fullName)}</b></td><td data-l="Passport No.">${esc(t.passportNo)}</td><td data-l="Seat"><b>${t.seatNumber}</b></td><td data-l="Class">${t.className}</td><td data-l="Status">${badge(t.ticketStatus)}</td></tr>`).join('')}</tbody></table></div></section>`;
  shell(title,`${d.city} → ${a.city} · ${b.date}`,body);
}
function pConfirmation(){ if(!need())return; const b=API.bookings().find(x=>x.pnr===flow.lastPnr);
  if(!b){location.hash='#/bookings';return} bookingView(b,'Booking Confirmation',true) }
function pBooking(pnr){ if(!need())return; const b=API.bookings().find(x=>x.pnr===pnr);
  if(!b){location.hash='#/bookings';return} bookingView(b,'Booking Details') }

function pBookings(){ if(!need())return; const l=API.bookings();
  shell('My Bookings',l.length?`${l.length} bookings on your account`:'',l.length?`<section class="card" style="padding:12px 14px"><div class="scroll"><table class="tbl stack"><thead><tr><th>PNR</th><th>Booking time</th><th>Flight</th><th>Route</th><th>Status</th></tr></thead><tbody>
  ${l.map(b=>`<tr><td data-l="PNR"><a class="pnr" href="#/booking/${b.pnr}">${b.pnr}</a></td><td data-l="Booking time">${b.bookingTime}</td><td data-l="Flight"><span><b>${b.flightNo}</b><div class="sub">${b.date}</div></span></td><td data-l="Route"><span><b>${b.dep}</b> → <b>${b.arr}</b><div class="sub">${ap(b.dep).city} to ${ap(b.arr).city}</div></span></td><td data-l="Status">${badge(b.status)}</td></tr>`).join('')}</tbody></table></div></section>`
  :`<section class="card empty"><div class="ic">🧳</div><h2>No bookings yet</h2>Bookings you make will appear here.<a class="btn" href="#/search">Search Flights</a></section>`) }

function pProfile(){ if(!need())return; const u=session.user,ini=u.fullName.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  shell('Profile','',`<section class="card"><div style="display:flex;gap:20px;align-items:center;margin-bottom:28px"><div aria-hidden="true" style="width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#1456C8,#4C8DF6);color:#fff;display:grid;place-items:center;font:700 26px 'Space Grotesk',sans-serif">${esc(ini)}</div><div><h2 style="font-size:24px">${esc(u.fullName)}</h2><p class="sub" style="margin-top:4px">${esc(u.email)}</p></div></div>
  <dl><div><dt>Customer ID</dt><dd>${u.customerID}</dd></div><div><dt>Full name</dt><dd>${esc(u.fullName)}</dd></div><div class="wide"><dt>Email</dt><dd>${esc(u.email)}</dd></div><div><dt>Role</dt><dd>${badge(u.role,'role')}</dd></div><div><dt>Name</dt><dd>${esc(u.name)}</dd></div></dl></section>`) }

function route(){
  const parts=(location.hash||'#/search').split('/'),r=parts[1]||'search',arg=parts[2];
  if(r==='logout'){session.user=null;store.set('session',null);location.hash='#/login';return}
  openSel=null; renderNav(r); window.scrollTo(0,0);
  const app=$('#app'); app.classList.add('in'); clearTimeout(route.t); route.t=setTimeout(()=>app.classList.remove('in'),1000);
  const pages={login:()=>pLogin(),search:()=>pSearch('results'),seats:pSeats,passengers:()=>pPassengers(),confirmation:pConfirmation,bookings:pBookings,booking:()=>pBooking(arg),profile:pProfile};
  (pages[r]||(()=>{location.hash='#/search'}))();
}
window.addEventListener('hashchange',route);
route();
