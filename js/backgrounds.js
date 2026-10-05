/* Custom backgrounds: import your own pixel art as a scene (Setup > Look & feel > Import your own scenes).
   Each one is saved in cfg.bgs as a 160x90 PNG data URL plus placement settings, so it travels with your backups, and is
   registered as an ordinary scene (key 'bg_<id>'), so chat, history, weather, seasons and the Together menu all work in it.
   Loads after look.js and before main.js (which builds the scene list). */
cfg.bgs=cfg.bgs||[];
const BGIMG={};
const bgKey=b=>'bg_'+b.id;
function regBg(b){
  const key=bgKey(b),im=new Image();im.src=b.img;BGIMG[key]=im;
  const where=b.setting||'in a place the person drew themselves';
  SCENES[key]={label:'🖼 '+b.name,icon:'🖼️',name:'Friend',outdoor:!!b.outdoor,setting:where,
    prompt:'You are {pet}, a friendly companion in a place the person made for you: '+where+'. Speak naturally and warmly, and let the place color what you notice. Don\'t lecture. Use an action in asterisks only occasionally.',
    greet:'*looks around* Oh, this place is yours. I like it here. What\'s on your mind?',back:'*smiles* Back in our spot.',
    hot:[],draw:()=>drawBg(key,b)};
}
function drawBg(key,b){
  const im=BGIMG[key];
  if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,0,0,160,90);else rpx(0,0,160,90,'#201a36');
  if(b.tint!==0)tintTime(ctx,160,90);
  const k=+b.size||3,X=Math.round(b.x/100*(160-16*k)),Y=Math.round(b.y/100*(90-16*k));
  if(PC)drawChar(PC,X,Y,k);else dog(X,Y,k);
}
/* darken and cool the picture as the sky does, so a daytime drawing is not bright at midnight */
function tintTime(g,w,h){
  const k=1-DAYF;if(k<.02)return;
  g.save();g.globalCompositeOperation='multiply';g.fillStyle=mix('#ffffff','#5f68b0',k*.85);g.fillRect(0,0,w,h);g.restore();
}
(cfg.bgs).forEach(regBg);
function fillPlaces(){
  $('#place').innerHTML=Object.entries(SCENES).map(([k,v])=>`<option value="${k}">${esc(v.label)}</option>`).join('');
  $('#place').value=SCENES[cfg.place]?cfg.place:'bed';
}

/* ---- the manager ---- */
const bgd=$('#bgd');let draft=null,draftImg=null;
const blank=()=>({id:'',name:'',img:'',fit:'fill',char:'',size:3,x:50,y:100,tint:1,outdoor:0,setting:''});
function toPixelArt(img,fit){
  const c=document.createElement('canvas');c.width=160;c.height=90;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const iw=img.naturalWidth,ih=img.naturalHeight;
  if(fit==='stretch')g.drawImage(img,0,0,160,90);
  else{
    const s=fit==='fit'?Math.min(160/iw,90/ih):Math.max(160/iw,90/ih),w=Math.round(iw*s),h=Math.round(ih*s);
    if(fit==='fit'){const t=document.createElement('canvas');t.width=t.height=1;const tg=t.getContext('2d');tg.drawImage(img,0,0,1,1,0,0,1,1);const d=tg.getImageData(0,0,1,1).data;g.fillStyle='rgb('+d[0]+','+d[1]+','+d[2]+')';g.fillRect(0,0,160,90)}
    g.drawImage(img,Math.round((160-w)/2),Math.round((90-h)/2),w,h);
  }
  return c.toDataURL('image/png');
}
let srcImg=null; /* the file as loaded, kept so "Fit" can be changed without picking it again */
function fillBgChars(cur){
  $('#bgchar').innerHTML='<option value="">Default (Old Pup)</option><optgroup label="Ready-made">'+PRESETS.map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.species+')</option>').join('')+'</optgroup>'
    +(cfg.chars.length?'<optgroup label="Yours">'+cfg.chars.map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.species+')</option>').join('')+'</optgroup>':'');
  $('#bgchar').value=cur||'';
}
function bgForm(b){
  draft=b;$('#bgh').textContent=b.id?'Edit: '+b.name:'New scene';
  $('#bgname').value=b.name;$('#bgfit').value=b.fit;$('#bgsize').value=b.size;$('#bgx').value=b.x;$('#bgy').value=b.y;
  $('#bgtint').value=b.tint?'1':'0';$('#bgout').value=b.outdoor?'1':'0';$('#bgset').value=b.setting;$('#bgfile').value='';
  fillBgChars(b.id?cfg.cast[bgKey(b)]:b.char);srcImg=null;
  if(b.img){draftImg=new Image();draftImg.onload=bgPrev;draftImg.src=b.img}else{draftImg=null}
  bgPrev();
}
function readForm(){
  Object.assign(draft,{name:$('#bgname').value.trim(),fit:$('#bgfit').value,char:$('#bgchar').value,size:+$('#bgsize').value,x:+$('#bgx').value,y:+$('#bgy').value,
    tint:+$('#bgtint').value,outdoor:+$('#bgout').value,setting:$('#bgset').value.trim()});
}
function bgPrev(){
  const v=$('#bgv'),g=v.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#201a36';g.fillRect(0,0,320,180);
  if(draftImg&&draftImg.complete&&draftImg.naturalWidth)g.drawImage(draftImg,0,0,320,180);
  if(draft&&draft.tint!==0)tintTime(g,320,180);
  const c=draft&&charById(draft.char);
  if(c&&draft){const k=draft.size||3;paint(g,c,Math.round(draft.x/100*(160-16*k))*2,Math.round(draft.y/100*(90-16*k))*2,k*2)}
}
function bgListRender(){
  const L=$('#bglist');L.textContent='';
  cfg.bgs.forEach(b=>{
    const e=document.createElement('button');e.type='button';e.className='ghost';e.textContent='✏️ '+b.name;e.onclick=()=>{bgForm({...b,char:cfg.cast[bgKey(b)]||''});$('#bgmsg').textContent=''};
    const d=document.createElement('button');d.type='button';d.className='ghost';d.textContent='🗑';d.setAttribute('aria-label','Delete '+b.name);d.onclick=()=>bgDelete(b);
    L.append(e,d);
  });
}
/* the manager is opened from inside Setup, so keep Setup's pending scene/character choices in step with what was just saved */
function syncSetup(key,chosen){
  if(!dlg.open)return;
  if(key){if(chosen)dr.cast[key]=chosen;else delete dr.cast[key]}
  dp=cfg.place;$('#place').value=cfg.place;fillCast(dp,dr.cast[dp]);$('#pal').value=dr.pals[dp]||'';
}
function bgDelete(b){
  if(!confirm('Delete the scene "'+b.name+'"? Its chat history stays in your backups but will not be shown.'))return;
  const key=bgKey(b);cfg.bgs=cfg.bgs.filter(x=>x.id!==b.id);delete SCENES[key];delete BGIMG[key];delete cfg.cast[key];
  if(cfg.place===key){cfg.place='bed'}
  store();fillPlaces();syncSetup(key,'');bgListRender();bgForm(blank());applyUI();greet();draw();
}
$('#bgman').onclick=()=>{bgListRender();bgForm(blank());$('#bgmsg').textContent='';bgd.showModal()};
$('#bgx2').onclick=()=>bgd.close();
$('#bgnew').onclick=()=>{bgForm(blank());$('#bgmsg').textContent=''};
['bgsize','bgx','bgy','bgtint','bgchar'].forEach(id=>$('#'+id).oninput=()=>{if(!draft)return;readForm();bgPrev()});
$('#bgfit').onchange=()=>{if(!draft)return;readForm();if(srcImg){draft.img=toPixelArt(srcImg,draft.fit);draftImg=new Image();draftImg.onload=bgPrev;draftImg.src=draft.img}};
$('#bgfile').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  if(!/^image\//.test(f.type)){$('#bgmsg').textContent='That does not look like an image.';return}
  if(f.size>8*1024*1024){$('#bgmsg').textContent='That file is over 8 MB. A small pixel-art file is plenty.';return}
  const url=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{
    URL.revokeObjectURL(url);readForm();srcImg=im;
    draft.img=toPixelArt(im,draft.fit);draftImg=new Image();draftImg.onload=bgPrev;draftImg.src=draft.img;
    if(!draft.name){draft.name=f.name.replace(/\.[^.]+$/,'').slice(0,24);$('#bgname').value=draft.name}
    $('#bgmsg').textContent=im.naturalWidth+'x'+im.naturalHeight+' image, resized to 160x90'+(im.naturalWidth*9===im.naturalHeight*16?'.':' (not exactly 16:9, so it was cropped or padded).');
  };
  im.onerror=()=>{URL.revokeObjectURL(url);$('#bgmsg').textContent='Could not read that image.'};
  im.src=url;
};
$('#bgsave').onclick=()=>{
  readForm();
  if(!draft.img){$('#bgmsg').textContent='Choose an image first.';return}
  if(!draft.name)draft.name='My scene';
  const isNew=!draft.id;if(isNew)draft.id=Date.now().toString(36);
  const key=bgKey(draft),chosen=draft.char;delete draft.char;
  const i=cfg.bgs.findIndex(x=>x.id===draft.id);
  if(i>=0)cfg.bgs[i]={...draft};else cfg.bgs.push({...draft});
  regBg({...draft});
  if(chosen)cfg.cast[key]=chosen;else delete cfg.cast[key];
  cfg.place=key;store();fillPlaces();syncSetup(key,chosen);applyUI();bgListRender();
  bgd.close();greet();draw();
};
