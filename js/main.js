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
