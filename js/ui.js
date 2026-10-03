/* Interface: settings dialog, time-of-day and scene buttons. */
const dlg=$('#dlg');
const FIELDS=['place','time','pos','ts','spd','snd','fur','len','pet','me'];
function applyUI(){$('#dbox').className=cfg.pos==='over'?'over':'';document.documentElement.style.setProperty('--ts',cfg.ts);$('#name').textContent=nm();$('#tb').textContent=TI[cfg.time]||'☀️';$('#pb').textContent=SCENES[cfg.place].icon}
let shown=cfg.provider;
function loadFields(){const p=$('#prov').value;$('#key').value=cfg.keys[p]||'';$('#model').value=cfg.models[p]||MODELS[p];$('#base').value=cfg.base;$('#baseWrap').hidden=p!=='custom'}
function stash(){const p=shown;cfg.keys[p]=$('#key').value.trim();cfg.models[p]=$('#model').value.trim()||MODELS[p];cfg.base=$('#base').value.trim()}
$('#prov').onchange=()=>{stash();shown=$('#prov').value;loadFields()};
$('#gear').onclick=()=>{$('#prov').value=cfg.provider;shown=cfg.provider;loadFields();FIELDS.forEach(f=>$('#'+f).value=cfg[f]);$('#prompt').value=cfg.prompt;dlg.showModal()};
$('#ok').onclick=()=>{const pp=cfg.place;stash();cfg.provider=$('#prov').value;FIELDS.forEach(f=>cfg[f]=$('#'+f).value.trim());cfg.prompt=$('#prompt').value.trim()||DEF.prompt;store();dlg.close();applyUI();draw();if(cfg.place!==pp)greet()};
$('#clear').onclick=()=>{H[cfg.place]=[];store();you.style.display='none';dlg.close();greet()};

const NT={day:'sunset',sunset:'night',night:'day'};
$('#tb').onclick=e=>{e.stopPropagation();cfg.time=NT[cfg.time]||'day';store();applyUI();draw()};
$('#pb').onclick=e=>{e.stopPropagation();const k=Object.keys(SCENES);cfg.place=k[(k.indexOf(cfg.place)+1)%k.length];store();applyUI();draw();greet()};
