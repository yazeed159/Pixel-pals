/* Real sunrise and sunset (Setup > Look & feel > Sky follows).
   With "Sunrise and sunset where I am" on, the sky blend in art/core.js (resolveTime) uses today's real sunrise and sunset
   for your coordinates instead of the fixed hours. Coordinates are saved in cfg.loc, rounded to about 10 km, stay in this
   browser (they are in backups, never sent to the AI), and are only requested when you press "Use my location".
   Hours are read as clock hours on this device, so the device time zone should match the place. */
cfg.sun=cfg.sun||'0';

/* NOAA-style sunrise equation. Returns {rise,set} as local clock hours (0..24), or null where the sun does not rise or set that day. */
function sunTimes(lat,lon,date){
  const R=Math.PI/180,y=date.getFullYear(),mo=date.getMonth(),d=date.getDate();
  const N=Math.round((Date.UTC(y,mo,d)-Date.UTC(y,0,0))/864e5),lng=lon/15;
  const calc=rising=>{
    const t=N+((rising?6:18)-lng)/24,M=.9856*t-3.289;
    let L=M+1.916*Math.sin(M*R)+.02*Math.sin(2*M*R)+282.634;L=((L%360)+360)%360;
    let RA=Math.atan(.91764*Math.tan(L*R))/R;RA=((RA%360)+360)%360;
    RA+=Math.floor(L/90)*90-Math.floor(RA/90)*90;RA/=15;
    const sd=.39782*Math.sin(L*R),cd=Math.cos(Math.asin(sd));
    const cH=(Math.cos(90.833*R)-sd*Math.sin(lat*R))/(cd*Math.cos(lat*R));
    if(cH>1||cH<-1)return null;
    const H=(rising?360-Math.acos(cH)/R:Math.acos(cH)/R)/15;
    const T=H+RA-.06571*t-6.622,UT=(((T-lng)%24)+24)%24;
    const dt=new Date(Date.UTC(y,mo,d)+UT*36e5);
    return dt.getHours()+dt.getMinutes()/60;
  };
  const rise=calc(true),set=calc(false);
  return rise===null||set===null||!(rise<set)?null:{rise,set};
}
const fmtH=h=>{const m=Math.round(h*60)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};

/* the key frames used by resolveTime(): the same shape as the fixed ones (dawn peaks just before sunrise, sunset just before the sun goes) */
let sunCache={k:'',kf:null};
function sunKF(){
  if(cfg.sun!=='1'||!cfg.loc)return null;
  const dk=today()+'|'+cfg.loc.lat+'|'+cfg.loc.lon;
  if(sunCache.k===dk)return sunCache.kf;
  const s=sunTimes(cfg.loc.lat,cfg.loc.lon,new Date());let kf=null;
  if(s){
    const a=[[0,'night'],[s.rise-1.75,'night'],[s.rise-.25,'dawn'],[s.rise+1.75,'day'],[s.set-1.75,'day'],[s.set-.25,'sunset'],[s.set+1.25,'dusk'],[s.set+3.25,'night'],[24,'night']]
      .map(([h,p])=>[Math.min(24,Math.max(0,h)),p]);
    if(a.every((x,i)=>!i||x[0]>=a[i-1][0]))kf=a;
  }
  sunCache={k:dk,kf};return kf;
}

/* ---- Setup controls ---- */
const sunMsg=$('#sunmsg');
function parseLoc(t){
  const m=String(t).match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/);if(!m)return null;
  const lat=+m[1],lon=+m[2];return Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat:Math.round(lat*10)/10,lon:Math.round(lon*10)/10}:null;
}
function sunStatus(){
  if(!cfg.loc){sunMsg.textContent='No location set yet: the sky uses fixed hours.';return}
  const s=sunTimes(cfg.loc.lat,cfg.loc.lon,new Date());
  sunMsg.textContent=s?'Today: sunrise '+fmtH(s.rise)+', sunset '+fmtH(s.set)+(cfg.sun==='1'?'. The sky follows these.':'. Turn the setting on to use them.')
    :'The sun does not rise and set normally there today, so fixed hours are used.';
}
function sunFill(){$('#sunloc').value=cfg.loc?cfg.loc.lat+', '+cfg.loc.lon:'';sunStatus()}
function setLoc(l){cfg.loc=l;sunCache.k='';store();sunFill();draw()}
$('#gear').addEventListener('click',sunFill);
$('#sun').addEventListener('change',()=>{cfg.sun=$('#sun').value;sunCache.k='';store();sunStatus();draw()});
$('#sunloc').addEventListener('change',()=>{
  const v=$('#sunloc').value.trim();
  if(!v){delete cfg.loc;sunCache.k='';store();sunStatus();draw();return}
  const l=parseLoc(v);
  if(l)setLoc(l);else sunMsg.textContent='Write it as latitude, longitude, for example 30.0, 31.2';
});
$('#sunuse').onclick=()=>{
  if(!navigator.geolocation){sunMsg.textContent='This browser cannot share a location. Type latitude, longitude instead.';return}
  sunMsg.textContent='Asking for your location...';
  navigator.geolocation.getCurrentPosition(
    p=>{setLoc({lat:Math.round(p.coords.latitude*10)/10,lon:Math.round(p.coords.longitude*10)/10});
      if(cfg.sun!=='1'){cfg.sun='1';$('#sun').value='1';store();sunStatus();draw()}},
    ()=>{sunMsg.textContent='No location was shared. You can type latitude, longitude instead.'},
    {timeout:12000,maximumAge:864e5});
};
