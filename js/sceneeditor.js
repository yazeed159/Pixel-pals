/* Scene editor (Setup > Look & feel > Import your own scenes > Draw or generate art).
   A 160x90 pixel canvas with pencil, fill, line, box and color picker, an undo stack, and a preview of the character standing in
   the scene. "AI scene art" asks the chosen provider for a simple SVG of a described place, draws it at 160x90, then cleans it up:
   median-cut reduction to a few colors and a majority filter that removes specks. The result is only a starting point for hand
   touch-ups. "Use this picture" hands the PNG to the scene manager in backgrounds.js (draft, draftImg, bgPrev, readForm are shared globals).
   Also here: Share this scene (a small .pixelscene.json file) and Add a shared scene. Loads after backgrounds.js. */
const edd=$('#edd'),edc=$('#edc'),eg=edc.getContext('2d',{willReadFrequently:true}),eo=$('#edo'),eog=eo.getContext('2d');
eg.imageSmoothingEnabled=false;eog.imageSmoothingEnabled=false;
const PAL16=['#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179','#29366f','#3b5dc9','#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57'];
let eTool='pencil',eCol=PAL16[10],eSize=1,eUndo=[],eDown=false,eStart=null,eLast=null,eSnap=null,eRaw=null,eDirty=false,eBusy=false;
const edMsg=t=>{$('#edmsg').textContent=t};

/* ---- colors and tools ---- */
function setCol(c){eCol=c.toLowerCase();$('#edcol').value=eCol;[...$('#edpal').children].forEach(b=>b.classList.toggle('on',b.dataset.c===eCol))}
$('#edpal').innerHTML=PAL16.map(c=>'<button type="button" data-c="'+c+'" style="background:'+c+'" aria-label="Color '+c+'"></button>').join('');
$('#edpal').onclick=e=>{const b=e.target.closest('button');if(b)setCol(b.dataset.c)};
$('#edcol').oninput=e=>setCol(e.target.value);
document.querySelectorAll('.edt').forEach(b=>b.onclick=()=>{
  eTool=b.dataset.t;document.querySelectorAll('.edt').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)})});
$('#edsize').onchange=e=>{eSize=+e.target.value};

const eSave=()=>{eUndo.push(eg.getImageData(0,0,160,90));if(eUndo.length>40)eUndo.shift()};
const dot=(x,y)=>{eg.fillStyle=eCol;eg.fillRect(x-(eSize>>1),y-(eSize>>1),eSize,eSize)};
function eLine(a,b){ /* Bresenham, so fast strokes leave no gaps */
  let [x0,y0]=a;const [x1,y1]=b,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
  for(;;){dot(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}
}
function eRect(a,b){eg.fillStyle=eCol;const x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]);eg.fillRect(x,y,Math.abs(a[0]-b[0])+1,Math.abs(a[1]-b[1])+1)}
function eFill(x,y){
  const im=eg.getImageData(0,0,160,90),u=new Uint32Array(im.data.buffer),[r,g,b]=hex(eCol),rep=((255<<24)|(b<<16)|(g<<8)|r)>>>0,t=u[y*160+x];
  if(t===rep)return;const st=[[x,y]];
  while(st.length){const [px0,py]=st.pop();if(px0<0||py<0||px0>159||py>89||u[py*160+px0]!==t)continue;u[py*160+px0]=rep;st.push([px0+1,py],[px0-1,py],[px0,py+1],[px0,py-1])}
  eg.putImageData(im,0,0);
}
function ePos(e){const r=edc.getBoundingClientRect();return [Math.max(0,Math.min(159,Math.floor((e.clientX-r.left)/r.width*160))),Math.max(0,Math.min(89,Math.floor((e.clientY-r.top)/r.height*90)))]}
const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
edc.addEventListener('pointerdown',e=>{
  e.preventDefault();const p=ePos(e);
  if(eTool==='pick'){const d=eg.getImageData(p[0],p[1],1,1).data;setCol(toHex(d[0],d[1],d[2]));return}
  edc.setPointerCapture(e.pointerId);eSave();eDown=true;eDirty=true;eStart=eLast=p;
  if(eTool==='pencil')dot(p[0],p[1]);
  else if(eTool==='fill'){eFill(p[0],p[1]);eDown=false}
  else eSnap=eg.getImageData(0,0,160,90);
});
edc.addEventListener('pointermove',e=>{
  if(!eDown)return;const p=ePos(e);
  if(eTool==='pencil'){eLine(eLast,p);eLast=p}
  else{eg.putImageData(eSnap,0,0);if(eTool==='line')eLine(eStart,p);else eRect(eStart,p)}
});
['pointerup','pointercancel'].forEach(n=>edc.addEventListener(n,()=>{eDown=false}));
$('#edundo').onclick=()=>{const u=eUndo.pop();if(u)eg.putImageData(u,0,0)};
$('#edclear').onclick=()=>{eSave();eDirty=true;eg.fillStyle=eCol;eg.fillRect(0,0,160,90)};

/* the chosen character, drawn over the canvas the way it will stand in the scene */
function eChar(){
  eog.clearRect(0,0,320,180);
  const c=draft&&charById(draft.char);
  if(c&&$('#edshow').checked){const k=draft.size||3;paint(eog,c,Math.round(draft.x/100*(160-16*k))*2,Math.round(draft.y/100*(90-16*k))*2,k*2)}
}
$('#edshow').onchange=eChar;

/* ---- open / close ---- */
function starter(){
  ['#41a6f6','#5fb8f8','#73c8f9','#8fd9fb','#b7ecfd'].forEach((c,i)=>{eg.fillStyle=c;eg.fillRect(0,i*14,160,14)});
  eg.fillStyle='#38b764';eg.fillRect(0,70,160,20);eg.fillStyle='#257179';eg.fillRect(0,80,160,10);
}
$('#bgdraw').onclick=()=>{
  if(!draft)return;readForm();eUndo=[];eRaw=null;eDirty=false;eDown=false;
  if(draftImg&&draftImg.complete&&draftImg.naturalWidth){eg.drawImage(draftImg,0,0,160,90)}else starter();
  setCol(eCol);eChar();
  edMsg(charById(draft.char)?'':'Pick a character under "Who is here" to see them on the canvas. The default dog is added when the scene is shown.');
  edd.showModal();
};
$('#edcancel').onclick=()=>edd.close();
$('#eddone').onclick=()=>{
  if(!draft)return;
  draft.img=edc.toDataURL('image/png');draftImg=new Image();draftImg.onload=bgPrev;draftImg.src=draft.img;srcImg=null;
  if(!draft.name){draft.name='My drawing';$('#bgname').value=draft.name}
  $('#bgmsg').textContent='Picture ready. Press Save scene to keep it.';
  edd.close();
};

/* ---- AI scene art ---- */
const EDSYS='You are a pixel-art background painter. Reply with ONE SVG and nothing else: no markdown fences, no explanation. Rules: the root is <svg viewBox="0 0 160 90">. Use flat solid fills (a few linearGradient fills are fine for skies). Use only rect, polygon, circle, ellipse, path, line, g, linearGradient and stop. No text, no filters, no images, no masks, no clip paths, no thin outlines. Use bold simple shapes and large readable forms, never tiny details, and keep it to about 60 shapes. Paint back to front: sky, far shapes, middle shapes, foreground. Keep the bottom middle (x 55 to 105, y 55 to 90) fairly open and calm because a character will stand there. No people or animals. Use one harmonious palette of about 10 colors that suits the mood of the place.';
function svgFrom(t){
  const m=String(t).match(/<svg[\s\S]*<\/svg>/i);if(!m)return null;
  const body=m[0].replace(/^<svg[^>]*>/i,'').replace(/<\/svg>\s*$/i,'');
  if(!body.trim()||/<(script|foreignObject|image|iframe|style|use|animate|set|a)\b|\son\w+\s*=|javascript:|(?:href|src)\s*=|@import|https?:/i.test(body))return null;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" width="160" height="90" preserveAspectRatio="none" shape-rendering="crispEdges">'+body+'</svg>';
}
/* median cut: split the pixels into n boxes along the widest color channel, average each box into a palette color */
function quant(d,n){
  const N=d.length/4,P=new Array(N);for(let i=0;i<N;i++)P[i]=[d[i*4],d[i*4+1],d[i*4+2]];
  const boxes=[P.map((_,i)=>i)];
  const rng=b=>{const lo=[255,255,255],hi=[0,0,0];for(const i of b)for(let c=0;c<3;c++){const v=P[i][c];if(v<lo[c])lo[c]=v;if(v>hi[c])hi[c]=v}return hi.map((h,c)=>h-lo[c])};
  while(boxes.length<n){
    let bi=-1,bs=0,bc=0;
    boxes.forEach((b,j)=>{const r=rng(b),m=Math.max(...r),s=m*Math.sqrt(b.length);if(b.length>1&&m>0&&s>bs){bs=s;bi=j;bc=r.indexOf(m)}});
    if(bi<0)break;
    const b=boxes[bi].sort((x,y)=>P[x][bc]-P[y][bc]),h=b.length>>1;boxes.splice(bi,1,b.slice(0,h),b.slice(h));
  }
  const pal=boxes.map(b=>{const s=[0,0,0];for(const i of b)for(let c=0;c<3;c++)s[c]+=P[i][c];return s.map(v=>Math.round(v/b.length))});
  const idx=new Uint8Array(N),cache=new Map();
  for(let i=0;i<N;i++){
    const k=(P[i][0]<<16)|(P[i][1]<<8)|P[i][2];let j=cache.get(k);
    if(j===undefined){let bd=1e9;j=0;pal.forEach((q,m)=>{const e=(q[0]-P[i][0])**2+(q[1]-P[i][1])**2+(q[2]-P[i][2])**2;if(e<bd){bd=e;j=m}});cache.set(k,j)}
    idx[i]=j;
  }
  return {pal,idx};
}
/* majority filter: a pixel takes the color most of its 3x3 neighbourhood has (at least 5 of 9), so specks and stray edge pixels vanish but real edges stay */
function smooth(idx,W,H,passes){
  for(let p=0;p<passes;p++){
    const out=idx.slice();
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const cnt={},cur=idx[y*W+x];
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const v=idx[ny*W+nx];cnt[v]=(cnt[v]||0)+1}
      let top=cur,tc=cnt[cur];for(const k in cnt)if(cnt[k]>tc&&cnt[k]>=5){top=+k;tc=cnt[k]}
      out[y*W+x]=top;
    }
    idx=out;
  }
  return idx;
}
function eClean(){
  if(!eRaw)return;
  const {pal,idx}=quant(eRaw.data,+$('#edn').value),sm=smooth(idx,160,90,+$('#edsm').value),im=eg.createImageData(160,90);
  for(let i=0;i<sm.length;i++){const c=pal[sm[i]];im.data[i*4]=c[0];im.data[i*4+1]=c[1];im.data[i*4+2]=c[2];im.data[i*4+3]=255}
  eg.putImageData(im,0,0);eDirty=false;
}
['edn','edsm'].forEach(id=>$('#'+id).onchange=e=>{
  if(!eRaw){edMsg('These apply to AI art. Generate a picture first.');return}
  if(eDirty&&!confirm('This redoes the picture from the AI\'s original and removes your hand-drawn changes. Continue?')){return}
  eSave();eClean();edMsg('Cleaned up.');
});
$('#edgen').onclick=async()=>{
  const d=$('#edai').value.trim().slice(0,200);
  if(eBusy)return;
  if(!d){edMsg('Describe a place first.');return}
  if(demo()){edMsg('This needs an API key. Add one in Setup, under AI provider.');return}
  eBusy=true;$('#edgen').disabled=true;edMsg('Asking the AI to paint it...');
  try{
    const out=await complete(EDSYS,[{role:'user',content:'Place: '+d}],null,6000),svg=svgFrom(out);
    if(!svg)throw new Error('The AI did not return a drawing I can safely use. Try again.');
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
    const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('The drawing could not be read. Try again.'));i.src=url}).finally(()=>URL.revokeObjectURL(url));
    const t=document.createElement('canvas');t.width=160;t.height=90;const g=t.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;
    g.fillStyle='#201a36';g.fillRect(0,0,160,90);g.drawImage(im,0,0,160,90);
    eRaw=g.getImageData(0,0,160,90);eSave();eClean();eChar();
    edMsg('Done. Change Colors or Smoothing to tidy it, press Generate again for another take, or draw over it.');
  }catch(e){edMsg(e.message||'Something went wrong.')}
  eBusy=false;$('#edgen').disabled=false;
};

/* ---- sharing: only the picture and place settings, never chats ---- */
const dlFile=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
$('#bgshare').onclick=async()=>{
  if(!draft)return;readForm();const m=$('#bgmsg');
  if(!draft.img){m.textContent='Choose or draw a picture first.';return}
  const o={pixelpals:'scene',v:1,name:draft.name||'My scene',img:draft.img,size:draft.size,x:draft.x,y:draft.y,tint:draft.tint,outdoor:draft.outdoor,setting:draft.setting};
  if(PRESETS.some(p=>p.id===draft.char))o.char=draft.char;
  const fn=(o.name.replace(/[^\w-]+/g,'_')||'scene')+'.pixelscene.json',f=new File([JSON.stringify(o)],fn,{type:'application/json'});
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:o.name});return}}
  catch(e){if(e&&e.name==='AbortError')return}
  dlFile(f,fn);m.textContent='Saved '+fn+'. Send that file to a friend: it holds the picture and place, never your chats.';
};
$('#bgimp').onclick=()=>$('#bgimpf').click();
$('#bgimpf').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;const m=$('#bgmsg');
  if(f.size>600*1024){m.textContent='That file is too big to be a shared scene.';return}
  let o;try{o=JSON.parse(await f.text())}catch(_){m.textContent='That is not a shared scene file.';return}
  if(!o||o.pixelpals!=='scene'||typeof o.img!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(o.img)){m.textContent='That is not a shared scene file.';return}
  const im=new Image();
  im.onerror=()=>{m.textContent='The picture in that file could not be read.'};
  im.onload=()=>{
    if(im.naturalWidth!==160||im.naturalHeight!==90){m.textContent='That scene picture is not 160x90.';return}
    const num=(v,a,b,d)=>Number.isFinite(+v)?Math.min(b,Math.max(a,+v)):d,clean=t=>String(t||'').replace(/[\u0000-\u001f]/g,' ').trim();
    const b={id:Date.now().toString(36),name:clean(o.name).slice(0,24)||'Shared scene',img:o.img,fit:'fill',size:num(o.size,2,4,3),x:num(o.x,0,100,50),y:num(o.y,0,100,100),tint:o.tint===0?0:1,outdoor:o.outdoor?1:0,setting:clean(o.setting).slice(0,160)};
    const ch=PRESETS.some(p=>p.id===o.char)?o.char:'';
    cfg.bgs.push(b);regBg(b);if(ch)cfg.cast[bgKey(b)]=ch;
    store();fillPlaces();syncSetup(bgKey(b),ch);bgListRender();bgForm({...b,char:ch});
    m.textContent='Added "'+b.name+'" to your scenes.';
  };
  im.src=o.img;
};
