/* Face: one shared system for mouths, blinks and small expressions, used by every character in every scene.
   - While a character talks, the mouth follows the letters being typed (vowels open wide, M/B/P press shut, F/V bite the lip,
     S/Z clench, O/U pucker) and pauses on punctuation. *Actions in asterisks* are not spoken, so the mouth shows an expression instead.
   - At rest it has moods: smile, frown, smirk, "hm", sigh, a sleepy yawn. Mood, tiredness, thinking and what was just said all show.
   - Blinks are irregular (sometimes a double blink, slow and heavy when sleepy) and pass through a half-closed lid.
   - It redraws itself between the 3-fps scene ticks, so mouths and blinks move smoothly.
   Scenes only call Face.mouth(...) and Face.blink(); nothing else needs to know how it works. */
const Face=(()=>{
  const NOW=()=>performance.now();
  const RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  /* ---- mouth shapes. w = open width as a fraction of the mouth, h = rows tall,
     t = teeth on top, g = tongue, r = round (pucker), f = teeth on lower lip, c = clenched teeth, p = lips pressed ---- */
  const V={A:{w:.95,h:3.4,t:1,g:1},E:{w:.85,h:2.4},I:{w:1,h:2,t:1},O:{w:.5,h:3.4,r:1},U:{w:.34,h:2.6,r:1},
    F:{w:.8,h:3,f:1},L:{w:.7,h:2,g:1},S:{w:.9,h:2,c:1},K:{w:.35,h:2},M:{p:1},Z:{z:1}};
  const MAP={a:'A',e:'E',i:'I',o:'O',u:'U',y:'I',w:'U',f:'F',v:'F',m:'M',b:'M',p:'M',l:'L',t:'L',d:'L',n:'L',s:'S',z:'S',c:'S',x:'S',j:'S',k:'K',g:'K',h:'K',q:'K',r:'K'};
  const HOLD={A:90,E:80,I:75,O:95,U:85,F:55,L:50,S:50,K:45,M:65};
  const H=n=>hs(n|0);
  /* non-Latin letters: the open sounds get open mouths, the rest are shut or clenched, anything else is a stable guess */
  const XM={'ا':'A','أ':'A','آ':'A','إ':'E','ى':'A','ة':'A','ع':'A','و':'U','ؤ':'U','ي':'I','ئ':'I','م':'M','ب':'M','ف':'F','ل':'L','ت':'L','د':'L','ن':'L','ط':'L','ض':'L','س':'S','ش':'S','ز':'S','ص':'S','ث':'S','ذ':'S','ظ':'S','ج':'S','ك':'K','ق':'K','غ':'K','خ':'K','ح':'K','ر':'K','ه':'K','ء':'K',
    'א':'A','ע':'A','ה':'A','ו':'U','י':'I','מ':'M','ם':'M','פ':'M','ף':'F','ל':'L','ת':'L','ד':'L','ט':'L','נ':'L','ן':'L','ס':'S','ש':'S','צ':'S','ץ':'S','ז':'S','ג':'K','ק':'K','כ':'K','ך':'K','ח':'K','ר':'K'};
  const xmap=c=>XM[c]||(/\p{L}/u.test(c)?'AEIOUKLSM'[H(c.codePointAt(0))%9]:undefined);
  const sleepy=()=>(typeof LIFE!=='undefined'&&LIFE.st==='tired')||(mood==='sleepy'&&moodT>0);

  /* ---- what was said: a short queue of mouth shapes fed one letter at a time ---- */
  const REST0=()=>({v:'Z',amp:1,until:0,hold:0});
  let q=[],cur=REST0(),fed=0,inAct=false,streaming=false,sLen=0,src='',loud=0,expr=null;
  function begin(text){q=[];cur=REST0();inAct=false;src=text||'';sLen=0;loud=0;fed=0;streaming=false}
  function push(e){
    q.push(e);
    while(q.length>4){let i=q.findIndex(x=>x.v==='K'||x.v==='L'||x.v==='S'||(x.v==='Z'&&x.hold<100));if(i<0)i=q.findIndex(x=>x.v!=='X');if(i<0)break;q.splice(i,1)}
  }
  /* what an *action* looks like on the face */
  const ACT=[[/smil|beam|warm|fond|pleased/,'smile'],[/grin|chuckl|laugh|giggl|snort|amus/,'laugh'],[/sigh|frown|sniff|wince|tear|sad|heav|exhale|slump/,'sigh'],
    [/yawn|drows|sleepy|stretch/,'yawn'],[/gasp|startl|surpris|widen|jump|stare|freez/,'o'],[/smirk|wry|eyebrow|dry|raise/,'smirk'],
    [/hum|ponder|think|consider|hm|mutter|tilt|squint|ahem|pause|look.* (up|away|down)/,'hm']];
  const actKind=s=>{s=s.toLowerCase();for(const [r,k] of ACT)if(r.test(s))return k;return 'rest'};
  function feed(ch,idx){
    fed=NOW();
    if(ch==='*'){
      inAct=!inAct;
      if(inAct){const m=/^\*([^*]*)/.exec(src.slice(idx))||['',''],t=m[1];push({v:'X',e:actKind(t),amp:1,hold:Math.min(1500,380+t.length*24)})}
      else push({v:'Z',amp:1,hold:90});
      return}
    if(inAct)return;
    if(/\p{M}/u.test(ch))return;
    const c=ch.toLowerCase();let v=MAP[c]||xmap(c),hold=HOLD[v]||60,amp=.78+(H(idx*131+c.charCodeAt(0))%42)/100;
    if(loud>0){amp*=1.2;loud--}
    if(ch!==c&&c>='a'&&c<='z')amp+=.18;
    if(ch==='!'){v='Z';hold=300;loud=14}
    else if(ch==='?'||ch==='؟'){v='Z';hold=280}
    else if(ch==='.'||ch==='…'){v='Z';hold=240}
    else if(ch===','||ch===';'||ch===':'||ch==='،'||ch==='؛'){v='Z';hold=170}
    else if(ch==='-'||ch==='—'){v='Z';hold=110}
    else if(!v){if(/\d/.test(ch))v='K';else{if(q.length&&q[q.length-1].v!=='Z'&&q[q.length-1].v!=='X')push({v:'Z',amp:1,hold:30});return}}
    if(v==='Z'&&q.length&&q[q.length-1].v==='Z'){q[q.length-1].hold=Math.max(q[q.length-1].hold,hold);return}
    push({v,amp,hold});
  }
  function stream(t){ /* text arriving from the network, longer each time */
    if(t.length<sLen){begin(t)}
    streaming=true;src=t;
    for(let i=sLen;i<t.length;i++)feed(t[i],i);
    sLen=t.length;
  }
  function end(text){ /* a chunk of speech is done: let the last mark of punctuation color the face for a moment */
    streaming=false;q=[];cur=REST0();inAct=false;
    const t=(text||src||'').replace(/\*[^*]*\*?/g,' ').trim(),l=t.slice(-1),n=NOW();
    if(!t){return}
    if(l==='!')expr={k:'laugh',t0:n,until:n+1700};
    else if(/[?؟]$/.test(t))expr={k:'hm',t0:n,until:n+2200};
    else if(/\.\.\.$|…$/.test(t))expr={k:'sigh',t0:n,until:n+1800};
    else if(/\b(sorry|sad|hard|heavy|miss|lonely)\b/i.test(t))expr={k:'frown',t0:n,until:n+2600};
    else if(/\b(glad|happy|good|great|love|thank|welcome|nice|warm|laugh|haha)\b/i.test(t))expr={k:'smile',t0:n,until:n+3000};
    else if(Math.random()<.35)expr={k:'smile',t0:n,until:n+1600};
  }
  function advance(t){
    while(q.length&&t>=cur.until){cur=q.shift();cur.until=t+cur.hold}
    if(!q.length&&cur.v!=='X'&&cur.v!=='Z'&&t>cur.until+110)cur={v:'Z',amp:1,until:t+1e9,hold:0};
    if(!q.length&&cur.v==='X'&&t>cur.until)cur=REST0();
  }

  /* ---- timing helpers on a real-time clock (ms) ---- */
  let fS=0;
  function fev(per,dur,off,t){const x=t+off,s=Math.floor(x/per),st=H(s*7+off)%(per-dur),r=x-s*per-st;fS=s;return r>=0&&r<dur?r:-1}
  function yawnP(sd,t){
    const sl=sleepy(),r=fev(sl?15000:58000,2700,sd*733,t);if(r<0)return -1;
    if(!sl&&H(fS*5+sd)%3)return -1;return r/2700;
  }
  /* ---- blinking: 0 open, 1 half, 2 closed ---- */
  function phase(sd=0){
    if(forced&&forced.ph!=null)return forced.ph;
    if(still())return 0;
    const t=NOW()+sd*977,sl=sleepy(),P=sl?2500:4200,dur=sl?420:170,s=Math.floor(t/P),st=H(s*5+3+sd)%(P-1100),r=t-s*P-st;
    const one=x=>x<0||x>=dur?0:(x<dur*.25||x>dur*.78)?1:2;
    let p=one(r);
    if(!p&&H(s*11+sd)%4===0)p=one(r-dur-130);  /* now and then a double blink */
    if(!p&&!talking&&!thinking){const y=yawnP(sd,NOW());if(y>.18&&y<.82)p=2}
    if(!p&&expr&&expr.k==='laugh'&&NOW()<expr.until)p=1;
    return p;
  }
  const blink=sd=>phase(sd)===2;

  /* ---- what the mouth is doing right now ---- */
  function restState(sd,t){
    if(expr&&t<expr.until)return {e:expr.k,p:(t-expr.t0)/(expr.until-expr.t0)};
    if(thinking)return {e:(t/1300|0)%3===2?'rest':'hm',p:0};
    if(mood&&moodT>0){
      if(mood==='happy')return {e:fev(5200,1100,sd*211,t)>=0?'grin':'smile',p:0};
      if(mood==='sad'){const r=fev(7000,1500,sd*211,t);return r>=0?{e:'sigh',p:r/1500}:{e:'frown',p:0}}
    }
    const y=yawnP(sd,t);if(y>=0)return {e:'yawn',p:y};
    if(sleepy())return {e:'sleepy',p:0};
    const r=fev(9500,1900,sd*311,t);
    if(r>=0)return {e:['smile','smile','smirk','hm','sigh','smile','rest'][H(fS*3+sd)%7],p:r/1900};
    return {e:'rest',p:0};
  }
  function synth(sd,t){ /* talking with no letters to follow (a live stream between bursts, or a second speaker): plausible chatter */
    const slot=Math.floor(t/105),r=H(slot*7+sd)%100;
    if(((H((slot>>3)*13+sd)%3)===0)&&(slot&7)>=6)return {v:'Z',amp:1};
    const v=r<17?'A':r<32?'E':r<45?'O':r<55?'I':r<62?'U':r<72?'K':r<80?'L':r<88?'M':r<94?'S':'F';
    return {v,amp:.75+(H(slot*3+sd)%42)/100};
  }
  let forced=null; /* for tests and screenshots: Face.force({v:'A',amp:1}) or Face.force({e:'smile'}), Face.force(null) to release */
  function state(sd=0){
    if(forced)return forced;
    if(still())return {e:'rest',p:0};
    const t=NOW();
    if(talking){
      if(fed&&(q.length||t-fed<400||cur.v!=='Z')||(streaming&&q.length)){
        advance(t);
        if(cur.v==='X')return {e:cur.e,p:.5};
        if(cur.v!=='Z'||t<cur.until)return {v:cur.v,amp:cur.amp};
        if(streaming)return synth(sd,t);
        return {v:'Z',amp:1};
      }
      return synth(sd,t);
    }
    return restState(sd,t);
  }

  /* ---- drawing ----
     put(x,y,w,h,color) paints one rectangle; x,y = left edge and the row of the resting lip line; w = width in cells of q pixels. */
  function mouth(put,x,y,o={}){
    const W=o.w||6,q=o.q||1,sd=o.seed||0,s=o.st||state(sd),lip=o.lip||'#2b1d2e',inn=o.inn||'#7a2f3a',teeth=o.teeth||'#f3e3c8',tg=o.tongue||'#d9798f',
      maxH=o.maxH||4,t=NOW(),sm0=o.base==='smile'?1:0,lipS=o.soft?lip+'aa':lip;
    const P=(cx,cy,w,h,c)=>{if(w<=0||h<=0)return;const x0=Math.round(x+cx*q),x1=Math.round(x+(cx+w)*q),y0=Math.round(y+cy*q),y1=Math.round(y+(cy+h)*q);put(x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0),c)};
    const line=(sm,smirk,c=lipS)=>{
      if(smirk){P(0,0,W-1,1,c);P(W-1,-1,1,1,c);return}
      if(sm>0&&W>=4){P(1,0,W-2,1,c);P(0,-1,1,1,c);P(W-1,-1,1,1,c)}
      else if(sm<0&&W>=4){P(1,0,W-2,1,c);P(0,1,1,1,c);P(W-1,1,1,1,c)}
      else P(0,0,W,1,c);
    };
    /* an open mouth, top to bottom: a dark upper lip, then teeth (if any), then the inside with a tongue. The dark lip row is what
       makes teeth and openings readable on a pale muzzle. */
    const open=(d,amp,corner)=>{
      let ow=Math.max(2,Math.round(d.w*W)),oh=Math.max(1,Math.min(maxH+(d.big||0),Math.round(d.h*amp)));
      if((W-ow)%2)ow+=ow<W?1:-1;
      const x0=(W-ow)/2,rd=d.r&&ow>=4;
      if(corner){P(0,-1,1,1,lip);P(W-1,-1,1,1,lip)}
      if(d.f){P(0,0,W,1,lip);P(x0,1,ow,1,teeth);P(x0,2,ow,1,lip);return}
      if(d.c){P(0,0,W,1,lip);P(x0,1,ow,1,teeth);if(ow>2)P(x0+1,2,ow-2,1,lip+'66');return}
      if(rd)P(x0+1,0,ow-2,1,lip);else if(d.r)P(x0,0,ow,1,lip);else P(0,0,W,1,lip);
      for(let r=1;r<oh;r++){
        const last=r===oh-1,cut=rd&&last&&oh>=3?1:0,tooth=d.t&&r===1;
        P(x0+cut,r,ow-cut*2,1,tooth?teeth:inn);
      }
      if(d.g&&oh>=2){const tw=ow>=4?2:1,ty=oh>=3?oh-1:1;P(x0+(ow-tw)/2,ty,tw,1,tg)}
    };
    if(o.led){ /* an LED display: the mouth is a little equalizer */
      const on=s.v&&V[s.v]&&V[s.v].w?V[s.v]:s.e==='laugh'||s.e==='yawn'||s.e==='o'?{w:.75,h:3}:null;
      if(on){const ow=Math.max(2,Math.round(on.w*W)),x0=(W-ow)>>1,tall=Math.min(1,(s.amp||1)*on.h/3.2),bt=Math.floor(t/65);
        for(let c=0;c<ow;c++){const hgt=H(c*17+bt+sd)%100<tall*100;P(x0+c,0,1,1,lip);if(hgt){P(x0+c,-1,1,1,inn);P(x0+c,1,1,1,inn)}}
        return}
    }
    const e=s.e,v=s.v;
    if(v){const d=V[v];
      if(d.z){line(sm0,0)}
      else if(d.p){line(sm0,0,lip);P(1,1,W-2,1,lip+'66')}
      else open(d,s.amp||1,0);
      return}
    const p=s.p||0;
    switch(e){
      case 'smile':line(1,0);break;
      case 'frown':line(-1,0);break;
      case 'smirk':line(0,1);break;
      case 'grin':open({w:1,h:1.8,t:1},1,1);break;
      case 'laugh':open({w:.95,h:2.6,t:1,g:1},.85+.4*(Math.floor(t/85)%2),1);break;
      case 'o':open({w:.45,h:3,r:1},1,0);break;
      case 'hm':P(1,0,W-2,1,lipS);P(H(Math.floor(t/3000)+sd)%2?0:W-1,H(Math.floor(t/3000)+sd+5)%2?-1:1,1,1,lipS);break;
      case 'sigh':if(p<.15||p>.85)line(sm0,0);else open({w:.5,h:2,r:1},p<.55?1:.6,0);break;
      case 'sleepy':if(Math.sin(t/950)>.45)open({w:.34,h:1.4,r:1},1,0);else line(0,0);break;
      case 'yawn':{const a=Math.sin(Math.PI*Math.min(1,p));const oh=Math.round(a*(maxH+1));
        if(oh<1)line(0,0);else open({w:.62,h:1,r:1,g:1,big:1},oh,0);break}
      default:line(sm0,0);
    }
  }
  /* the little nudges a face gives the whole body: a breath, a nod on a stressed syllable, a shake when laughing */
  function pose(){
    if(RM.matches||quietMotion())return;
    const t=NOW();
    if(Math.sin(t/1700)>.62)CH.dy+=1;
    if(talking&&cur.v!=='Z'&&cur.v!=='X'&&cur.amp>1.05)CH.dy+=1;
    if(!talking){const s=restState(0,t);if(s.e==='laugh')CH.dx+=(Math.floor(t/80)%2)?1:-1}
  }
  /* what looks different between frames, so the redraw loop only works when something moved */
  const sig=()=>{const a=state(0),b=state(1),dd=CH.dy;
    return [phase(0),phase(1),a.v||a.e,b.v||b.e,a.amp&&a.amp.toFixed(1),(Math.sin(NOW()/1700)>.62)|0,talking|0,thinking|0].join()};
  let last='';
  setInterval(()=>{if(document.hidden||still())return;const s=sig();if(s!==last){last=s;draw()}},45);
  /* where the eyes point: up and aside while thinking, a glance away now and then while talking */
  function gaze(sd=0){
    const t=NOW();
    if(still())return null;
    if(thinking)return [1,-1];
    if(talking){const r=fev(2600,500,sd*137,t);if(r>=0)return [[1,0],[-1,0],[0,-1]][fS%3]}
    return null;
  }
  return {dbg:()=>({q:q.map(x=>x.v+(x.e||'')+x.hold),cur:cur.v+(cur.e||'')+(cur.until-NOW()|0),inAct,fed:NOW()-fed|0}),force:f=>{forced=f},mouth,state,feed,stream,begin,end,blink,phase,gaze,pose,sig,get streaming(){return streaming}};
})();
function facePose(){Face.pose()}
