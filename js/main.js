/* Startup. Loaded last, after every scene has registered itself. */
if(!SCENES[cfg.place])cfg.place='bed';
$('#place').innerHTML=Object.entries(SCENES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');
applyUI();
setInterval(()=>{tick++;draw()},300);draw();
greet();
