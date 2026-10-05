/* Pace and motion (Setup > Pace & motion, and the first-run screen).
   cfg.motion is one of:
     normal  everything moves
     calm    scene ticks at half speed; no body sway, nods, restless rocking, visitors, fireworks, bats
     still   a true static scene: one picture, no ticking at all (see the loop in main.js, Face in art/face.js)
   still(), quietMotion() and basePace() live in config.js so every file can use them. Typing speed (cfg.spd) is separate. */
const MOTION_OPTS=[['normal','Normal'],['calm','Calm: half speed, no sway or visitors'],['still','Static scene: nothing in the picture moves']];
['#motion'].forEach(s=>{$(s).innerHTML=MOTION_OPTS.map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('')});
if(!MOTION_OPTS.some(o=>o[0]===cfg.motion))cfg.motion='normal';

function applyMotion(){
  const m=cfg.motion,a=$('#app');
  a.classList.toggle('still',m==='still');a.classList.toggle('calmm',m==='calm');
  document.documentElement.classList.toggle('still',m==='still');
  pace=calm?Math.max(700,basePace()):basePace(); /* breathing and grounding slow things further, never below the chosen pace */
  if(m!=='normal'&&typeof LIFE!=='undefined'&&LIFE.pv&&!LIFE.pv.forced&&typeof endVisitor==='function')endVisitor();
  if(m==='still'){tick=0;moodT=0;jolt=0}
  draw();
}
const _applyUIp=applyUI;
applyUI=function(){_applyUIp();applyMotion()};
