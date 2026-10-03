/* Canvas basics: drawing helper, time-of-day palettes, the scene registry and the draw call.
   Scenes register themselves in js/scenes/*.js. */
const ctx=$('#cv').getContext('2d'); ctx.imageSmoothingEnabled=false;
const SC={night:{wall:'#3b3358',w2:'#342c52',floor:'#5a3f4a',f2:'#4e3541',sky:'#151b3d',moon:'#f3e3c8',glow:'255,200,120'},
sunset:{wall:'#6b4a6e',w2:'#5f4064',floor:'#7a4c4a',f2:'#6b4141',sky:'#e8825a',moon:'#ffd27a',glow:'255,170,90'},
day:{wall:'#a9c4d6',w2:'#9dbacd',floor:'#c9a37a',f2:'#bc9670',sky:'#8fd3f4',moon:'#fff3a0',glow:'255,230,170'}};
let tick=0, talking=false, thinking=false;
const px=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
const SCENES={};
function draw(){const s=SC[cfg.time]||SC.night;(SCENES[cfg.place]||SCENES.bed).draw(s)}
