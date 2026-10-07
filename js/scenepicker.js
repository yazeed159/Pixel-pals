/* Scene picker: the Scene button on the stage opens a grid of small pictures of every scene; tap one to go there.
   Thumbnails are the real scenes, drawn once onto the main canvas (nothing is painted in between) and copied. */
function goScene(k){
  if(!SCENES[k]||k===cfg.place)return;
  const old=cfg.place;cfg.place=k;leaveScene(old);store();applyUI();draw();greet();
}
function sceneThumb(k,cv){
  const save={place:cfg.place,PC:PC,on:CH.on};
  try{
    cfg.place=k;PC=occ();CH.on=0;
    SCENES[k].draw(CURPAL);
    CH.on=0;
    const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage($('#cv'),0,0,160,90);
  }catch(e){
    const g=cv.getContext('2d');g.fillStyle='#201a36';g.fillRect(0,0,160,90);
  }finally{cfg.place=save.place;PC=save.PC;CH.on=save.on;draw()}
}
function openScenePicker(){
  const grid=$('#spgrid');grid.textContent='';
  Object.keys(SCENES).forEach(k=>{
    const v=SCENES[k],b=document.createElement('button');
    b.type='button';b.className='spcard'+(k===cfg.place?' here':'');
    const c=document.createElement('canvas');c.width=160;c.height=90;
    const l=document.createElement('span');l.textContent=(v.icon||'')+' '+(typeof T==='function'?T(v.label):v.label).replace(/^🖼\s*/,'');
    b.append(c,l);
    b.setAttribute('aria-label',v.label+(k===cfg.place?' (you are here)':''));
    b.onclick=()=>{$('#scenedlg').close();goScene(k)};
    grid.append(b);
    sceneThumb(k,c);
  });
  $('#scenedlg').showModal();
}
/* the Scene button on the stage simply steps to the next scene, then wraps around; the picture menu lives in More and in Settings */
$('#pb').onclick=e=>{e.stopPropagation();const ks=Object.keys(SCENES);goScene(ks[(ks.indexOf(cfg.place)+1)%ks.length])};
$('#scb').onclick=()=>{$('#more').open=false;openScenePicker()};
$('#scpick').onclick=()=>openScenePicker();
$('#spx').onclick=()=>$('#scenedlg').close();
