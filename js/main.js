/* Startup. Loaded last, after every scene has registered itself. */
if(!SCENES[cfg.place])cfg.place='bed';
fillPlaces();
applyUI();
let stillAt=0;
(function loop(){
  if(still()){tick=0;jolt=0;moodT=0;if(Date.now()-stillAt>30000){stillAt=Date.now();draw()}setTimeout(loop,1000);return} /* static scene: nothing advances */
  tick++;if(jolt>0)jolt--;if(moodT>0)moodT--;draw();setTimeout(loop,pace); /* pace (ms per tick): 300 normal, 600 calm, 700+ during breathing (see basePace in config.js) */
})();
greet();
welcome();

/* close the More menu after picking something from it */
$('#moremenu').addEventListener('click',e=>{if(e.target.closest('button'))$('#more').open=false});
/* the menu floats just above the More button, centered on screen, so the button itself never moves */
$('#more').addEventListener('toggle',()=>{const s=$('#more summary').getBoundingClientRect(),mm=$('#moremenu');mm.style.bottom=(innerHeight-s.top+6)+'px';
  const w=mm.offsetWidth,c=Math.max(w/2+8,Math.min(innerWidth-w/2-8,s.left+s.width/2));mm.style.left=c+'px'});
/* on an upright phone the scene is cropped around the character so it can be big; this keeps the character in view (the canvas is not stretched) */
function panStage(){
  const st=$('#stage'),cv=$('#cv');
  if(getComputedStyle(cv).position!=='absolute'){cv.style.left='';return}
  const a=typeof RXA!=='undefined'&&RXA[cfg.place],fx=(a?a.at[0]+16:80)/160,cw=st.clientHeight*16/9,sw=st.clientWidth;
  cv.style.left=Math.max(sw-cw,Math.min(0,sw/2-fx*cw))+'px';
}
new ResizeObserver(panStage).observe($('#stage'));addEventListener('orientationchange',panStage);
const _applyUIpan=applyUI;applyUI=function(){_applyUIpan.apply(this,arguments);panStage()};panStage();
/* a tap anywhere outside More closes it */
document.addEventListener('click',e=>{const m=$('#more');if(m.open&&!m.contains(e.target))m.open=false});
/* a tap on the dark area outside any dialog (Settings included) closes it, like Cancel. Both the press and the release must be outside, so selecting text never closes it. */
document.querySelectorAll('dialog:not(#wlc)').forEach(d=>{
  let down=false;
  const out=e=>{const r=d.getBoundingClientRect();return e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)};
  d.addEventListener('mousedown',e=>{down=out(e)});
  d.addEventListener('click',e=>{if(down&&out(e))d.close();down=false});
});
