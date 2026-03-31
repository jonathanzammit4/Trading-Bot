/* ── THEME ── */
function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  const btn=document.getElementById('btn'+t.charAt(0).toUpperCase()+t.slice(1));
  if(btn)btn.classList.add('on');
  localStorage.setItem('ciq-theme',t);
}
(function(){
  const s=localStorage.getItem('ciq-theme');
  if(s){document.documentElement.setAttribute('data-theme',s);document.addEventListener('DOMContentLoaded',()=>setTheme(s));}
})();

/* ── MEGA NAV ── */
document.addEventListener('DOMContentLoaded',()=>{
  const wrap=document.getElementById('navIndicators');
  const dd=document.getElementById('megaDropdown');
  if(!wrap||!dd)return;
  let t;
  const show=()=>{clearTimeout(t);dd.classList.add('show')};
  const hide=()=>{t=setTimeout(()=>dd.classList.remove('show'),140)};
  wrap.addEventListener('mouseenter',show);wrap.addEventListener('mouseleave',hide);
  dd.addEventListener('mouseenter',show);dd.addEventListener('mouseleave',hide);
});

/* ── SCROLL REVEAL ── */
document.addEventListener('DOMContentLoaded',()=>{
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),i*65);obs.unobserve(e.target);}});
  },{threshold:.07});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
});

/* ── MODAL ENGINE ── */
function openModal(key){
  const d=window.INDICATORS&&window.INDICATORS[key];
  if(!d)return;
  document.getElementById('mTag').textContent=d.tag;
  document.getElementById('mTag').style.cssText='background:'+d.tagBg+';color:'+d.tagColor;
  document.getElementById('mHeadBar').style.background=d.accentColor;
  document.getElementById('mTitle').textContent=d.title;
  document.getElementById('mFull').textContent=d.full;
  document.getElementById('mIntro').textContent=d.intro;
  document.getElementById('modalBody').innerHTML=
    '<div class="chart-wrap"><p class="chart-lbl">// interactive visualization</p><div id="vizContainer"></div></div>'+
    '<div class="msec"><h3>How it works</h3>'+d.how.split('\n\n').map(p=>'<p>'+p+'</p>').join('')+'<div class="formula">'+d.formula.replace(/\n/g,'<br>')+'</div></div>'+
    '<div class="msec"><h3>Signals</h3><div class="sig-grid">'+d.signals.map(s=>'<div class="sig-card '+s.t+'"><p class="sig-lbl">'+s.l+'</p><p>'+s.d+'</p></div>').join('')+'</div></div>'+
    '<div class="msec"><h3>Key tips</h3><div class="tips-list">'+d.tips.map(t=>'<div class="tip-item"><span class="tip-ico">💡</span><span>'+t+'</span></div>').join('')+'</div></div>';
  document.body.classList.add('locked');
  document.getElementById('overlay').classList.add('show');
  setTimeout(()=>{
    const el=document.getElementById('vizContainer');
    if(el&&VIZBUILDERS[key])VIZBUILDERS[key](el);
    else if(el)VIZBUILDERS._default(el);
  },60);
}

function closeModal(){document.getElementById('overlay').classList.remove('show');document.body.classList.remove('locked');}
function handleOvClick(e){if(e.target===document.getElementById('overlay'))closeModal();}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
const VIZBUILDERS = {

sma(el){
  el.innerHTML='<canvas id="smaC" style="width:100%;height:180px;display:block"></canvas><div style="display:flex;align-items:center;gap:10px;margin-top:10px;font-size:12px;color:#8a97a8;flex-wrap:wrap">Fast SMA <input type="range" id="smaN1" min="3" max="20" value="10" step="1" style="width:80px"> <span id="smaN1v">10</span> &nbsp; Slow SMA <input type="range" id="smaN2" min="15" max="50" value="30" step="1" style="width:80px"> <span id="smaN2v">30</span></div><div id="smaSignal" style="margin-top:8px;padding:7px 14px;border-radius:6px;font-size:13px;font-weight:700;transition:all .3s;background:rgba(255,255,255,.06);color:#8a97a8"></div>';
  const cv=el.querySelector('#smaC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=360;cv.style.height='180px';
  const W=cv.width,H=cv.height;
  const raw=[42,44,43,45,44,46,48,47,50,52,51,54,53,55,57,56,59,61,60,58,57,55,54,52,50,48,47,46,48,50,52,54,56,55,58,60,62,61,63,65];
  const smaFn=(d,n)=>d.map((_,i)=>i<n-1?null:d.slice(i-n+1,i+1).reduce((a,b)=>a+b)/n);
  function draw(){
    const n1=+el.querySelector('#smaN1').value,n2=+el.querySelector('#smaN2').value;
    el.querySelector('#smaN1v').textContent=n1;el.querySelector('#smaN2v').textContent=n2;
    const fast=smaFn(raw,n1),slow=smaFn(raw,n2);
    cx.clearRect(0,0,W,H);
    const mn=Math.min(...raw)-2,mx=Math.max(...raw)+2;
    const px=x=>20+(x*(W-40))/(raw.length-1),py=y=>H-20-((y-mn)/(mx-mn))*(H-40);
    cx.strokeStyle='rgba(255,255,255,0.2)';cx.lineWidth=1.5;cx.beginPath();raw.forEach((v,i)=>{i===0?cx.moveTo(px(i),py(v)):cx.lineTo(px(i),py(v));});cx.stroke();
    const dl=(arr,col,dash)=>{cx.strokeStyle=col;cx.lineWidth=3;cx.setLineDash(dash?[8,4]:[]);cx.beginPath();let s=false;arr.forEach((v,i)=>{if(v===null)return;s?cx.lineTo(px(i),py(v)):cx.moveTo(px(i),py(v));s=true;});cx.stroke();cx.setLineDash([]);};
    dl(fast,'#00d4aa',false);dl(slow,'#f59e0b',true);
    let cross='',col='';
    for(let i=1;i<raw.length;i++){if(fast[i]!==null&&slow[i]!==null&&fast[i-1]!==null&&slow[i-1]!==null){if(fast[i-1]<=slow[i-1]&&fast[i]>slow[i]){cross='GOLDEN CROSS — BUY signal';col='#00d4aa';}if(fast[i-1]>=slow[i-1]&&fast[i]<slow[i]){cross='DEATH CROSS — SELL signal';col='#e05252';}}}
    const sig=el.querySelector('#smaSignal');sig.textContent=cross||'No crossover — adjust sliders';sig.style.background=cross?(col==='#00d4aa'?'rgba(0,212,170,.15)':'rgba(224,82,82,.15)'):'rgba(255,255,255,.06)';sig.style.color=cross?col:'#8a97a8';
  }
  el.querySelector('#smaN1').oninput=el.querySelector('#smaN2').oninput=draw;draw();
},

ema(el){
  el.innerHTML='<canvas id="emaC" style="width:100%;height:190px;display:block"></canvas><div style="display:flex;gap:20px;margin-top:8px;font-size:12px"><span style="color:#00d4aa;font-weight:600">─ EMA reacts fast</span><span style="color:#4d9ef7;font-weight:600">– – SMA lags behind</span><span style="color:rgba(255,255,255,0.3)">· Price</span></div><p style="margin-top:6px;font-size:12px;color:#8a97a8">Notice EMA snaps to the spike immediately while SMA takes several bars to catch up.</p>';
  const cv=el.querySelector('#emaC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=380;cv.style.height='190px';
  const W=cv.width,H=cv.height;
  const prices=[50,51,52,50,53,54,53,55,56,55,70,68,65,62,60,58,57,56,55,54,53,52,51,50];
  const n=8,k=2/(n+1);const ema=[];prices.forEach((p,i)=>ema.push(i===0?p:(p-ema[i-1])*k+ema[i-1]));
  const sma=prices.map((_,i)=>i<n-1?null:prices.slice(i-n+1,i+1).reduce((a,b)=>a+b)/n);
  const mn=48,mx=73;const px=x=>20+(x*(W-40))/(prices.length-1),py=y=>H-10-((y-mn)/(mx-mn))*(H-20);
  cx.strokeStyle='rgba(255,255,255,0.18)';cx.lineWidth=1.5;cx.beginPath();prices.forEach((v,i)=>{i===0?cx.moveTo(px(i),py(v)):cx.lineTo(px(i),py(v));});cx.stroke();
  const dl=(arr,col,dash,w=3)=>{cx.strokeStyle=col;cx.lineWidth=w;cx.setLineDash(dash?[8,4]:[]);cx.beginPath();let s=false;arr.forEach((v,i)=>{if(v===null)return;s?cx.lineTo(px(i),py(v)):cx.moveTo(px(i),py(v));s=true;});cx.stroke();cx.setLineDash([]);};
  dl(sma,'#4d9ef7',true);dl(ema,'#00d4aa',false);
  cx.fillStyle='rgba(255,255,255,0.7)';cx.font='bold 22px sans-serif';cx.fillText('Spike!',px(10)-30,py(70)-12);
  cx.beginPath();cx.moveTo(px(10),py(70)-4);cx.lineTo(px(10),py(70)+8);cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=2;cx.stroke();
},

trendlines(el){
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  el.innerHTML='<canvas id="tlC" style="width:100%;height:200px;cursor:crosshair;border-radius:8px;background:'+(isDark?'#0f1318':'#edecea')+'"></canvas><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button id="tlUp" style="padding:6px 12px;border-radius:6px;border:1px solid rgba(0,212,170,.4);background:rgba(0,212,170,.1);color:#00d4aa;font-size:12px;cursor:pointer;font-family:inherit">Uptrend</button><button id="tlDown" style="padding:6px 12px;border-radius:6px;border:1px solid rgba(224,82,82,.4);background:rgba(224,82,82,.1);color:#e05252;font-size:12px;cursor:pointer;font-family:inherit">Downtrend</button><button id="tlReset" style="padding:6px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#8a97a8;font-size:12px;cursor:pointer;font-family:inherit">Reset</button></div><div id="tlMsg" style="margin-top:8px;font-size:12px;color:#8a97a8">Click two points on the chart to draw a trend line.</div>';
  const cv=el.querySelector('#tlC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;
  const W=cv.width,H=cv.height;
  const prices=[55,53,56,54,58,56,60,58,62,60,63,61,65,63,67,65,68,66,70,68];
  const mn=50,mx=73,px=x=>30+(x*(W-60))/(prices.length-1),py=y=>H-20-((y-mn)/(mx-mn))*(H-44);
  let pts=[],mode='up',lines=[];
  function drawBase(){
    cx.clearRect(0,0,W,H);
    cx.strokeStyle=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';cx.lineWidth=1;
    for(let i=0;i<5;i++){const y=20+i*(H-40)/4;cx.beginPath();cx.moveTo(20,y);cx.lineTo(W-20,y);cx.stroke();}
    prices.forEach((p,i)=>{const x=px(i),color=i%2===0?'#00d4aa':'#e05252';const o=py(p*0.998),c=py(p*1.002),hi=py(p*1.006),lo=py(p*0.993);cx.strokeStyle=color;cx.lineWidth=2;cx.beginPath();cx.moveTo(x,hi);cx.lineTo(x,lo);cx.stroke();cx.fillStyle=color;cx.fillRect(x-6,Math.min(o,c),12,Math.abs(o-c)||2);});
    lines.forEach(l=>{cx.strokeStyle=l.mode==='up'?'rgba(0,212,170,0.8)':'rgba(224,82,82,0.8)';cx.lineWidth=3;cx.setLineDash([]);cx.beginPath();const slope=(l.y2-l.y1)/(l.x2-l.x1);cx.moveTo(0,l.y1-slope*l.x1);cx.lineTo(W,l.y1+slope*(W-l.x1));cx.stroke();});
    pts.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,7,0,Math.PI*2);cx.fillStyle='rgba(255,255,255,0.8)';cx.fill();});
  }
  cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect();const p={x:(e.clientX-r.left)*(W/r.width),y:(e.clientY-r.top)*(H/r.height)};pts.push(p);if(pts.length===2){lines.push({x1:pts[0].x,y1:pts[0].y,x2:pts[1].x,y2:pts[1].y,mode});pts=[];}drawBase();el.querySelector('#tlMsg').textContent=pts.length===1?'Click a second point to complete the line.':'Click two points to draw another line.';});
  el.querySelector('#tlUp').onclick=()=>{mode='up';el.querySelector('#tlMsg').textContent='Uptrend: click two swing lows.';};
  el.querySelector('#tlDown').onclick=()=>{mode='down';el.querySelector('#tlMsg').textContent='Downtrend: click two swing highs.';};
  el.querySelector('#tlReset').onclick=()=>{lines=[];pts=[];drawBase();el.querySelector('#tlMsg').textContent='Reset. Click two points to draw a line.';};
  drawBase();
},

rsi(el){
  el.innerHTML='<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px"><div id="rsiGauge" style="flex:1;height:26px;border-radius:6px;position:relative;overflow:visible;background:linear-gradient(to right,#00d4aa 0%,#00d4aa 30%,#2d5a52 30%,#2d5a52 42%,rgba(255,255,255,0.1) 42%,rgba(255,255,255,0.1) 58%,#6b3a1e 58%,#6b3a1e 70%,#e05252 70%,#e05252 100%)"><div id="rsiNeedle" style="position:absolute;top:-5px;width:4px;height:36px;background:white;border-radius:2px;transform:translateX(-50%);transition:left .4s ease;left:50%"></div></div><div><div id="rsiVal" style="font-family:DM Mono,monospace;font-size:26px;font-weight:700;transition:color .3s;color:#8a97a8">50</div><div id="rsiLab" style="font-size:12px;font-weight:600;transition:color .3s;color:#8a97a8">Neutral</div></div></div><div style="display:flex;justify-content:space-between;font-size:10px;color:#8a97a8;margin-bottom:10px;font-family:DM Mono,monospace"><span>0 oversold</span><span>30</span><span>50</span><span>70</span><span>100 overbought</span></div><div style="display:flex;align-items:center;gap:10px;font-size:12px;color:#8a97a8">RSI value: <input type="range" id="rsiSlider" min="0" max="100" value="50" step="1" style="flex:1"></div><canvas id="rsiChart" style="width:100%;height:110px;display:block;margin-top:10px"></canvas><div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px"><span style="color:rgba(0,212,170,0.8)">← Oversold zone (buy)</span><span style="color:rgba(224,82,82,0.8)">Overbought zone (sell) →</span></div>';
  const cv=el.querySelector('#rsiChart'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=220;
  const W=cv.width,H=cv.height;
  const prices=[50,51,52,50,53,55,54,57,59,58,61,64,63,66,68,67,65,62,60,57,55,52,50,48,46,45,47,49,51,53];
  function calcRSI(d,n=14){return d.map((_,i)=>{if(i<n)return 50;const sl=d.slice(i-n+1,i+1);let g=0,l=0;for(let j=1;j<sl.length;j++){const df=sl[j]-sl[j-1];df>0?g+=df:l-=df;}const ag=g/n,al=l/n;return al===0?100:100-(100/(1+ag/al));});}
  const rD=calcRSI(prices);
  const py=v=>H-4-((v/100)*(H-8));
  cx.fillStyle='rgba(224,82,82,0.12)';cx.fillRect(0,0,W,py(70));cx.fillStyle='rgba(0,212,170,0.12)';cx.fillRect(0,py(30),W,H-py(30));
  [70,50,30].forEach(v=>{cx.strokeStyle=v===50?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.2)';cx.lineWidth=1.5;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(0,py(v));cx.lineTo(W,py(v));cx.stroke();cx.setLineDash([]);});
  cx.strokeStyle='#4d9ef7';cx.lineWidth=3;cx.beginPath();rD.forEach((v,i)=>{const x=i*(W/(rD.length-1));i===0?cx.moveTo(x,py(v)):cx.lineTo(x,py(v));});cx.stroke();
  function update(v){
    el.querySelector('#rsiNeedle').style.left=v+'%';el.querySelector('#rsiVal').textContent=Math.round(v);
    let lbl,col;if(v<30){lbl='OVERSOLD — potential buy';col='#00d4aa';}else if(v<50){lbl='Below neutral';col='#8a97a8';}else if(v===50){lbl='Neutral';col='#8a97a8';}else if(v<70){lbl='Above neutral';col='#8a97a8';}else{lbl='OVERBOUGHT — potential sell';col='#e05252';}
    el.querySelector('#rsiLab').textContent=lbl;el.querySelector('#rsiLab').style.color=col;el.querySelector('#rsiVal').style.color=col;
  }
  el.querySelector('#rsiSlider').oninput=e=>update(+e.target.value);update(50);
},

macd(el){
  el.innerHTML='<canvas id="macdC" style="width:100%;height:200px;display:block"></canvas><div style="display:flex;gap:14px;margin-top:8px;font-size:12px;flex-wrap:wrap"><span style="color:#f97316;font-weight:600">─ MACD</span><span style="color:rgba(255,255,255,0.5)">── Signal</span><span style="color:#00d4aa;font-weight:600">█ Bullish histogram</span><span style="color:#e05252;font-weight:600">█ Bearish histogram</span></div><div id="macdInfo" style="margin-top:8px;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:600;background:rgba(0,212,170,.1);color:#00d4aa">Hover over the circles to see crossover signals</div>';
  const cv=el.querySelector('#macdC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;cv.style.height='200px';
  const W=cv.width,H=cv.height;
  const prices=[50,51,52,50,53,55,54,57,59,58,61,64,63,66,68,67,65,62,60,57,55,52,50,48,46,45,47,49,51,53];
  const ema=(d,n)=>{const k=2/(n+1);let e=[d[0]];for(let i=1;i<d.length;i++)e.push((d[i]-e[i-1])*k+e[i-1]);return e;};
  const e12=ema(prices,12),e26=ema(prices,26),ml=prices.map((_,i)=>e12[i]-e26[i]),sl=ema(ml,9),hist=ml.map((m,i)=>m-sl[i]);
  const all=[...hist,...ml,...sl],mn=Math.min(...all)-0.3,mx=Math.max(...all)+0.3;
  const px=x=>20+(x*(W-40))/(prices.length-1),py=y=>H/2-((y-((mn+mx)/2))/(mx-mn))*H*0.9;
  const bw=(W-40)/prices.length*0.55;
  cx.strokeStyle='rgba(255,255,255,0.1)';cx.lineWidth=1;cx.beginPath();cx.moveTo(0,py(0));cx.lineTo(W,py(0));cx.stroke();
  hist.forEach((v,i)=>{cx.fillStyle=v>=0?'rgba(0,212,170,0.7)':'rgba(224,82,82,0.7)';const y0=py(0),y1=py(v);cx.fillRect(px(i)-bw/2,Math.min(y0,y1),bw,Math.abs(y0-y1));});
  const dl=(arr,col,dash)=>{cx.strokeStyle=col;cx.lineWidth=3;cx.setLineDash(dash?[8,4]:[]);cx.beginPath();arr.forEach((v,i)=>{i===0?cx.moveTo(px(i),py(v)):cx.lineTo(px(i),py(v));});cx.stroke();cx.setLineDash([]);};
  dl(sl,'rgba(255,255,255,0.5)',true);dl(ml,'#f97316',false);
  const crosses=[];for(let i=1;i<prices.length;i++){if(ml[i-1]<sl[i-1]&&ml[i]>sl[i])crosses.push({i,type:'bull'});if(ml[i-1]>sl[i-1]&&ml[i]<sl[i])crosses.push({i,type:'bear'});}
  crosses.forEach(c=>{cx.beginPath();cx.arc(px(c.i),py(ml[c.i]),14,0,Math.PI*2);cx.fillStyle=c.type==='bull'?'rgba(0,212,170,0.25)':'rgba(224,82,82,0.25)';cx.fill();cx.strokeStyle=c.type==='bull'?'#00d4aa':'#e05252';cx.lineWidth=2.5;cx.stroke();
    cx.font='bold 18px sans-serif';cx.fillStyle=c.type==='bull'?'#00d4aa':'#e05252';cx.textAlign='center';cx.fillText(c.type==='bull'?'BUY':'SELL',px(c.i),py(ml[c.i])-(c.type==='bull'?22:-10));cx.textAlign='start';});
},

stoch(el){
  el.innerHTML='<canvas id="stochC" style="width:100%;height:200px;display:block"></canvas><div style="display:flex;gap:14px;margin-top:8px;font-size:12px;flex-wrap:wrap"><span style="color:#b06ef5;font-weight:600">─ %K fast line</span><span style="color:#f59e0b;font-weight:600">── %D signal line</span></div><p style="margin-top:6px;font-size:12px;color:#8a97a8">When %K crosses above %D in the oversold zone (&lt;20) = buy. When it crosses below %D in overbought (&gt;80) = sell.</p>';
  const cv=el.querySelector('#stochC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;cv.style.height='200px';
  const W=cv.width,H=cv.height;
  const prices=[55,53,56,54,58,52,48,46,44,45,47,50,53,56,59,62,65,63,61,58,55,52,49,46,44,46,49,52,55,58];
  const k14=prices.map((_,i)=>{if(i<13)return null;const sl=prices.slice(i-13,i+1);const lo=Math.min(...sl),hi=Math.max(...sl);return ((prices[i]-lo)/(hi-lo))*100;});
  const d3=k14.map((_,i)=>{if(k14[i]===null)return null;const v=k14.slice(Math.max(0,i-2),i+1).filter(v=>v!==null);return v.reduce((a,b)=>a+b)/v.length;});
  const px=x=>20+(x*(W-40))/(prices.length-1),py=v=>H-10-((v/100)*(H-20));
  cx.fillStyle='rgba(224,82,82,0.1)';cx.fillRect(0,0,W,py(80));cx.fillStyle='rgba(0,212,170,0.1)';cx.fillRect(0,py(20),W,H-py(20));
  [80,50,20].forEach(v=>{cx.strokeStyle=v===50?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.2)';cx.lineWidth=1.5;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(0,py(v));cx.lineTo(W,py(v));cx.stroke();cx.setLineDash([]);});
  cx.font='bold 20px sans-serif';cx.fillStyle='rgba(0,212,170,0.5)';cx.fillText('Oversold (<20)',20,H-12);cx.fillStyle='rgba(224,82,82,0.5)';cx.fillText('Overbought (>80)',20,28);
  const dl=(arr,col,dash)=>{cx.strokeStyle=col;cx.lineWidth=3;cx.setLineDash(dash?[8,4]:[]);cx.beginPath();let s=false;arr.forEach((v,i)=>{if(v===null)return;s?cx.lineTo(px(i),py(v)):cx.moveTo(px(i),py(v));s=true;});cx.stroke();cx.setLineDash([]);};
  dl(d3,'#f59e0b',true);dl(k14,'#b06ef5',false);
  for(let i=1;i<prices.length;i++){if(k14[i]!==null&&d3[i]!==null&&k14[i-1]!==null&&d3[i-1]!==null){if(k14[i-1]<=d3[i-1]&&k14[i]>d3[i]&&k14[i]<30){cx.beginPath();cx.arc(px(i),py(k14[i]),12,0,Math.PI*2);cx.fillStyle='rgba(0,212,170,0.3)';cx.fill();cx.strokeStyle='#00d4aa';cx.lineWidth=2;cx.stroke();}if(k14[i-1]>=d3[i-1]&&k14[i]<d3[i]&&k14[i]>70){cx.beginPath();cx.arc(px(i),py(k14[i]),12,0,Math.PI*2);cx.fillStyle='rgba(224,82,82,0.3)';cx.fill();cx.strokeStyle='#e05252';cx.lineWidth=2;cx.stroke();}}}
},

divergence(el){
  el.innerHTML='<div style="display:flex;gap:6px;margin-bottom:10px"><button id="dBull" onclick="showDivType(\'bull\')" style="flex:1;padding:7px;border-radius:6px;border:1px solid rgba(0,212,170,.4);background:rgba(0,212,170,.15);color:#00d4aa;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Bullish divergence</button><button id="dBear" onclick="showDivType(\'bear\')" style="flex:1;padding:7px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#8a97a8;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Bearish divergence</button></div><canvas id="dPriceC" style="width:100%;height:100px;display:block"></canvas><p style="font-size:11px;color:#8a97a8;text-align:center;margin:2px 0">Price chart</p><canvas id="dRsiC" style="width:100%;height:80px;display:block;margin-top:2px"></canvas><p style="font-size:11px;color:#8a97a8;text-align:center;margin:2px 0">RSI chart</p><div id="dMsg" style="margin-top:8px;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:600"></div>';
  window.showDivType=function(type){
    el.querySelector('#dBull').style.cssText='flex:1;padding:7px;border-radius:6px;border:1px solid '+(type==='bull'?'rgba(0,212,170,.4)':'rgba(255,255,255,.15)')+';background:'+(type==='bull'?'rgba(0,212,170,.15)':'transparent')+';color:'+(type==='bull'?'#00d4aa':'#8a97a8')+';font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
    el.querySelector('#dBear').style.cssText='flex:1;padding:7px;border-radius:6px;border:1px solid '+(type==='bear'?'rgba(224,82,82,.4)':'rgba(255,255,255,.15)')+';background:'+(type==='bear'?'rgba(224,82,82,.15)':'transparent')+';color:'+(type==='bear'?'#e05252':'#8a97a8')+';font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
    const pC=el.querySelector('#dPriceC'),rC=el.querySelector('#dRsiC');
    pC.width=pC.offsetWidth*2;pC.height=200;rC.width=rC.offsetWidth*2;rC.height=160;
    const pX=pC.getContext('2d'),rX=rC.getContext('2d');const W=pC.width,PH=pC.height,RH=rC.height;
    let prices,rsiVals,msg,msgCol;
    if(type==='bull'){prices=[70,65,60,55,52,50,53,50,48,52,56,60,64,68];rsiVals=[55,50,45,38,34,30,35,33,31,38,44,50,56,62];msg='Bullish divergence: price makes lower low (LL) but RSI makes higher low (HL) — selling momentum is exhausted';msgCol='#00d4aa';}
    else{prices=[50,54,58,62,65,68,65,68,70,66,62,58,54,50];rsiVals=[45,50,56,62,65,70,64,68,66,60,54,48,42,36];msg='Bearish divergence: price makes higher high (HH) but RSI makes lower high (LH) — buying momentum is fading';msgCol='#e05252';}
    const pmin=Math.min(...prices)-3,pmax=Math.max(...prices)+3;
    const py=(v,h,mn,mx)=>h-8-((v-mn)/(mx-mn))*(h-16),ppx=(i,n,w)=>20+(i*(w-40))/(n-1);
    pX.clearRect(0,0,W,PH);rX.clearRect(0,0,W,RH);
    pX.strokeStyle='rgba(255,255,255,0.8)';pX.lineWidth=3;pX.beginPath();prices.forEach((v,i)=>{i===0?pX.moveTo(ppx(i,prices.length,W),py(v,PH,pmin,pmax)):pX.lineTo(ppx(i,prices.length,W),py(v,PH,pmin,pmax));});pX.stroke();
    rX.strokeStyle='#4d9ef7';rX.lineWidth=3;rX.beginPath();rsiVals.forEach((v,i)=>{i===0?rX.moveTo(ppx(i,rsiVals.length,W),py(v,RH,20,80)):rX.lineTo(ppx(i,rsiVals.length,W),py(v,RH,20,80));});rX.stroke();
    const peaks=type==='bull'?[4,8]:[5,8];
    const pCol=type==='bull'?'#e05252':'#00d4aa',rCol=type==='bull'?'#00d4aa':'#e05252';
    pX.strokeStyle=pCol;pX.lineWidth=2;pX.setLineDash([8,4]);pX.beginPath();peaks.forEach((idx,j)=>{const x=ppx(idx,prices.length,W),y=py(prices[idx],PH,pmin,pmax);j===0?pX.moveTo(x,y):pX.lineTo(x,y);});pX.stroke();pX.setLineDash([]);
    rX.strokeStyle=rCol;rX.lineWidth=2;rX.setLineDash([8,4]);rX.beginPath();peaks.forEach((idx,j)=>{const x=ppx(idx,rsiVals.length,W),y=py(rsiVals[idx],RH,20,80);j===0?rX.moveTo(x,y):rX.lineTo(x,y);});rX.stroke();rX.setLineDash([]);
    peaks.forEach(idx=>{pX.beginPath();pX.arc(ppx(idx,prices.length,W),py(prices[idx],PH,pmin,pmax),8,0,Math.PI*2);pX.fillStyle=pCol;pX.fill();rX.beginPath();rX.arc(ppx(idx,rsiVals.length,W),py(rsiVals[idx],RH,20,80),8,0,Math.PI*2);rX.fillStyle=rCol;rX.fill();});
    pX.font='bold 20px sans-serif';pX.fillStyle=pCol;pX.fillText(type==='bull'?'↓ LL':'↑ HH',ppx(peaks[0],prices.length,W)+10,py(prices[peaks[0]],PH,pmin,pmax));pX.fillText(type==='bull'?'↓ LL':' HH',ppx(peaks[1],prices.length,W)+10,py(prices[peaks[1]],PH,pmin,pmax));
    rX.font='bold 20px sans-serif';rX.fillStyle=rCol;rX.fillText(type==='bull'?'↑ HL':'↓ LH',ppx(peaks[0],rsiVals.length,W)+10,py(rsiVals[peaks[0]],RH,20,80));rX.fillText(type==='bull'?'↑ HL':'↓ LH',ppx(peaks[1],rsiVals.length,W)+10,py(rsiVals[peaks[1]],RH,20,80));
    const dm=el.querySelector('#dMsg');dm.textContent=msg;dm.style.background=msgCol==='#00d4aa'?'rgba(0,212,170,.12)':'rgba(224,82,82,.12)';dm.style.color=msgCol;
  };
  window.showDivType('bull');
},

bb(el){
  el.innerHTML='<canvas id="bbC" style="width:100%;height:200px;display:block"></canvas><div style="display:flex;align-items:center;gap:10px;margin-top:10px;font-size:12px;color:#8a97a8">Volatility multiplier: <input type="range" id="bbVol" min="0.5" max="5" value="2" step="0.1" style="flex:1"> <span id="bbVolV" style="min-width:90px;font-family:DM Mono,monospace">Normal</span></div><div style="display:flex;gap:14px;margin-top:8px;font-size:12px;flex-wrap:wrap"><span style="color:rgba(201,168,76,.8)">─ Upper/Lower bands</span><span style="color:#c9a84c;font-weight:600">─ Middle SMA(20)</span><span style="color:rgba(255,255,255,.6)">─ Price</span></div>';
  const cv=el.querySelector('#bbC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;cv.style.height='200px';
  const W=cv.width,H=cv.height;
  const base=[50,51,52,50,53,55,54,57,59,58,61,64,63,66,68,67,65,62,60,57,55,52,50,48,46,45,47,49,51,53];
  function draw(mult){
    const labels=['Tight Squeeze (volatility breakout coming!)','Slightly narrow','Normal','Slightly wide','Wide (high volatility)'];
    el.querySelector('#bbVolV').textContent=labels[Math.min(4,Math.floor((mult-0.5)/1.1))];
    const noise=base.map((v,i)=>v+(Math.sin(i*2.1)*mult*1.5));
    const n=20,sma=noise.map((_,i)=>i<n-1?null:noise.slice(i-n+1,i+1).reduce((a,b)=>a+b)/n);
    const sd=noise.map((_,i)=>{if(i<n-1)return null;const sl=noise.slice(i-n+1,i+1);const m=sl.reduce((a,b)=>a+b)/n;return Math.sqrt(sl.map(p=>(p-m)**2).reduce((a,b)=>a+b)/n);});
    const upper=sma.map((m,i)=>m===null?null:m+mult*sd[i]),lower=sma.map((m,i)=>m===null?null:m-mult*sd[i]);
    const all=noise.concat(upper.filter(v=>v!==null),lower.filter(v=>v!==null));
    const mn=Math.min(...all)-1,mx=Math.max(...all)+1;
    const px=x=>20+(x*(W-40))/(noise.length-1),py=y=>H-10-((y-mn)/(mx-mn))*(H-20);
    cx.clearRect(0,0,W,H);
    const fv=upper.findIndex(v=>v!==null);
    if(fv>-1){cx.fillStyle='rgba(201,168,76,0.07)';cx.beginPath();upper.forEach((v,i)=>{if(v===null)return;i===fv?cx.moveTo(px(i),py(v)):cx.lineTo(px(i),py(v));});for(let i=noise.length-1;i>=fv;i--){if(lower[i]===null)continue;cx.lineTo(px(i),py(lower[i]));}cx.closePath();cx.fill();}
    const dl=(arr,col,dash,w=2)=>{cx.strokeStyle=col;cx.lineWidth=w;cx.setLineDash(dash?[6,4]:[]);cx.beginPath();let s=false;arr.forEach((v,i)=>{if(v===null)return;s?cx.lineTo(px(i),py(v)):cx.moveTo(px(i),py(v));s=true;});cx.stroke();cx.setLineDash([]);};
    dl(upper,'rgba(201,168,76,0.7)',true);dl(lower,'rgba(201,168,76,0.7)',true);dl(sma,'#c9a84c',false,3);
    cx.strokeStyle='rgba(255,255,255,0.7)';cx.lineWidth=2.5;cx.beginPath();noise.forEach((v,i)=>{i===0?cx.moveTo(px(i),py(v)):cx.lineTo(px(i),py(v));});cx.stroke();
  }
  el.querySelector('#bbVol').oninput=e=>draw(+e.target.value);draw(2);
},

candlestick(el){
  const patterns={Hammer:{col:'#00d4aa',desc:'Long lower wick, small body near top. Buyers rejected the low after a downtrend — potential reversal up.',bull:true},
    'Shooting Star':{col:'#e05252',desc:'Long upper wick, small body near bottom. Sellers rejected the high after an uptrend — potential reversal down.',bull:false},
    'Doji':{col:'#f59e0b',desc:'Open and close nearly equal. Indecision between buyers and sellers — often signals a trend pause or reversal.',doji:true},
    'Bullish Engulfing':{col:'#00d4aa',desc:'Large green candle fully engulfs the previous red candle. Buyers overwhelmed sellers — strong reversal up.',engulf:'bull'},
    'Bearish Engulfing':{col:'#e05252',desc:'Large red candle fully engulfs the previous green candle. Sellers overwhelmed buyers — strong reversal down.',engulf:'bear'}};
  el.innerHTML='<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'+Object.keys(patterns).map(k=>'<button onclick="selectPattern(\''+k+'\')" data-pat="'+k+'" style="padding:5px 11px;border-radius:6px;font-size:11px;cursor:pointer;font-family:inherit;border:1px solid '+patterns[k].col+'40;background:'+patterns[k].col+'15;color:'+patterns[k].col+'">'+k+'</button>').join('')+'</div><canvas id="csC" style="width:100%;height:150px;display:block;border-radius:8px"></canvas><div id="csDesc" style="margin-top:8px;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600"></div>';
  const cv=el.querySelector('#csC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=300;cv.style.height='150px';
  const W=cv.width,H=cv.height;
  window.selectPattern=function(name){
    const p=patterns[name];cx.clearRect(0,0,W,H);
    cx.fillStyle=document.documentElement.getAttribute('data-theme')==='dark'?'#0f1318':'#f0eeea';cx.fillRect(0,0,W,H);
    const mid=H/2,ch=H*0.6,pad=W*0.1;
    if(p.engulf){
      const x1=W/2-90,x2=W/2+10,cw=70;
      const [c1col,c2col]=p.engulf==='bull'?['#e05252','#00d4aa']:['#00d4aa','#e05252'];
      cx.strokeStyle=c1col;cx.lineWidth=3;cx.beginPath();cx.moveTo(x1+cw/2,mid-ch*0.25);cx.lineTo(x1+cw/2,mid+ch*0.25);cx.stroke();cx.fillStyle=c1col;cx.fillRect(x1,mid-ch*0.1,cw,ch*0.2);
      cx.strokeStyle=c2col;cx.lineWidth=3;cx.beginPath();cx.moveTo(x2+cw/2,mid-ch*0.4);cx.lineTo(x2+cw/2,mid+ch*0.4);cx.stroke();cx.fillStyle=c2col;cx.fillRect(x2,mid-ch*0.3,cw+10,ch*0.6);
    } else if(p.doji){
      const x=W/2-25,cw=50;cx.strokeStyle='#f59e0b';cx.lineWidth=3;cx.beginPath();cx.moveTo(x+cw/2,mid-ch*0.4);cx.lineTo(x+cw/2,mid+ch*0.4);cx.stroke();cx.fillStyle='#f59e0b';cx.fillRect(x,mid-2,cw,4);
    } else if(p.bull){
      const x=W/2-25,cw=50;cx.strokeStyle=p.col;cx.lineWidth=3;cx.beginPath();cx.moveTo(x+cw/2,mid-ch*0.08);cx.lineTo(x+cw/2,mid+ch*0.08);cx.moveTo(x+cw/2,mid+ch*0.25);cx.lineTo(x+cw/2,mid+ch*0.48);cx.stroke();cx.fillStyle=p.col;cx.fillRect(x,mid-ch*0.08,cw,ch*0.33);
    } else {
      const x=W/2-25,cw=50;cx.strokeStyle=p.col;cx.lineWidth=3;cx.beginPath();cx.moveTo(x+cw/2,mid-ch*0.48);cx.lineTo(x+cw/2,mid-ch*0.25);cx.moveTo(x+cw/2,mid+ch*0.08);cx.lineTo(x+cw/2,mid+ch*0.08);cx.stroke();cx.fillStyle=p.col;cx.fillRect(x,mid-ch*0.25,cw,ch*0.33);
    }
    const desc=el.querySelector('#csDesc');desc.textContent=p.desc;desc.style.color=p.col;desc.style.background=p.col+'18';
  };
  window.selectPattern('Hammer');
},

fib(el){
  el.innerHTML='<canvas id="fibC" style="width:100%;height:240px;display:block"></canvas><div style="margin-top:10px;display:flex;align-items:center;gap:10px;font-size:12px;color:#8a97a8">Retracement depth: <input type="range" id="fibR" min="0" max="100" value="62" step="1" style="flex:1"> <span id="fibRV" style="min-width:40px;font-family:DM Mono,monospace;color:#4d9ef7">61.8%</span></div><div id="fibMsg" style="margin-top:8px;font-size:12px;padding:8px 12px;border-radius:6px"></div>';
  const cv=el.querySelector('#fibC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=480;cv.style.height='240px';
  const W=cv.width,H=cv.height;
  const levels=[{r:0,col:'#e05252',lbl:'0% — swing high'},{r:0.236,col:'#f97316',lbl:'23.6%'},{r:0.382,col:'#f59e0b',lbl:'38.2%'},{r:0.5,col:'#00d4aa',lbl:'50% — key zone'},{r:0.618,col:'#4d9ef7',lbl:'61.8% — golden ratio'},{r:0.786,col:'#b06ef5',lbl:'78.6%'},{r:1,col:'rgba(255,255,255,0.45)',lbl:'100% — swing low'}];
  function draw(ret){
    cx.clearRect(0,0,W,H);
    const top=30,bot=H-30;
    levels.forEach(l=>{
      const y=bot-(bot-top)*l.r;
      const active=Math.abs(l.r-ret)<0.04;
      cx.strokeStyle=l.col;cx.lineWidth=active?4:1.5;cx.setLineDash(l.r===0||l.r===1?[]:[6,4]);cx.globalAlpha=active?1:0.55;
      cx.beginPath();cx.moveTo(110,y);cx.lineTo(W-10,y);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1;
      cx.font=(active?'bold ':'')+' 22px DM Mono,monospace';cx.fillStyle=l.col;cx.globalAlpha=active?1:0.6;
      cx.fillText(l.lbl,116,y-5);cx.globalAlpha=1;
    });
    cx.strokeStyle='rgba(255,255,255,0.9)';cx.lineWidth=4;cx.beginPath();cx.moveTo(60,bot);cx.lineTo(60,top);cx.lineTo(110,top);cx.stroke();
    const retY=bot-(bot-top)*ret;
    cx.strokeStyle='rgba(255,255,255,0.35)';cx.lineWidth=3;cx.setLineDash([8,5]);cx.beginPath();cx.moveTo(60,bot);cx.lineTo(60,retY);cx.stroke();cx.setLineDash([]);
    cx.beginPath();cx.arc(60,retY,11,0,Math.PI*2);cx.fillStyle='white';cx.fill();
    const near=levels.find(l=>Math.abs(l.r-ret)<0.04);
    const pct=Math.round(ret*1000)/10;
    el.querySelector('#fibRV').textContent=pct+'%';
    if(near){const m=el.querySelector('#fibMsg');m.style.display='block';m.textContent=near.r===0.618?'Golden ratio (61.8%) — highest-probability bounce zone in all of technical analysis':near.r===0.5?'50% — psychologically important, price often pauses here':near.r===0?'At the top — all gains given back':near.r===1?'Full retracement — trend may have reversed':'Potential support zone at '+near.lbl;m.style.color=near.col;m.style.background=near.col+'18';}
  }
  el.querySelector('#fibR').oninput=e=>draw(e.target.value/100);draw(0.62);
},

fvg(el){
  el.innerHTML='<canvas id="fvgC" style="width:100%;height:220px;display:block"></canvas><div style="display:flex;gap:8px;margin-top:10px"><button onclick="runFVG()" style="flex:1;padding:8px;border-radius:6px;border:1px solid rgba(176,110,245,.4);background:rgba(176,110,245,.12);color:#b06ef5;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">▶ Animate: price fills the gap</button></div><div id="fvgM" style="margin-top:8px;font-size:12px;color:#8a97a8">The purple zone is the Fair Value Gap — price moved through it too fast. Like a magnet, price often comes back to fill it.</div>';
  const cv=el.querySelector('#fvgC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=440;cv.style.height='220px';
  const W=cv.width,H=cv.height;
  const mn=55,mx=95;
  const py=v=>H-16-((v-mn)/(mx-mn))*(H-32);
  const candles=[{o:62,h:65,l:59,c:64},{o:64,h:67,l:62,c:66},{o:66,h:69,l:64,c:68},{o:68,h:86,l:67,c:84},{o:84,h:88,l:82,c:86},{o:86,h:89,l:82,c:83},{o:83,h:84,l:77,c:78}];
  const fvgT=82,fvgB=70;const candleW=Math.floor((W*0.55)/candles.length);
  function drawC(arr,xOff,wMult=1){
    arr.forEach((c,i)=>{const x=xOff+(i*candleW*1.4)+candleW/2,col=c.c>=c.o?'#00d4aa':'#e05252';cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();cx.moveTo(x,py(c.h));cx.lineTo(x,py(c.l));cx.stroke();cx.fillStyle=col;cx.fillRect(x-candleW*0.4,py(Math.max(c.o,c.c)),candleW*0.8,Math.max(2,Math.abs(py(c.o)-py(c.c))));});}
  function drawBase(extra=[]){
    cx.clearRect(0,0,W,H);
    cx.fillStyle='rgba(176,110,245,0.2)';cx.strokeStyle='rgba(176,110,245,0.6)';cx.lineWidth=2;
    cx.fillRect(0,py(fvgT),W,py(fvgB)-py(fvgT));cx.strokeRect(0,py(fvgT),W,py(fvgB)-py(fvgT));
    cx.font='bold 22px sans-serif';cx.fillStyle='#b06ef5';cx.fillText('Fair Value Gap',14,py(fvgT)-8);
    const magY=py(fvgB)+20;cx.font='22px sans-serif';cx.fillStyle='rgba(176,110,245,0.7)';cx.textAlign='center';cx.fillText('⬛ FVG Zone (magnet for price)',W/2,magY+8);cx.textAlign='start';
    drawC(candles,20);
    if(extra.length)drawC(extra,20+candles.length*candleW*1.4);
  }
  window.runFVG=function(){
    const fills=[{o:78,h:79,l:75,c:76},{o:76,h:77,l:72,c:73},{o:73,h:74,l:70,c:72},{o:72,h:74,l:70,c:73},{o:73,h:76,l:71,c:75},{o:75,h:80,l:74,c:79},{o:79,h:86,l:78,c:85}];
    let i=0;const msg=el.querySelector('#fvgM');
    const step=()=>{if(i>=fills.length)return;drawBase(fills.slice(0,i+1));const c=fills[i];if(c.l<=fvgB+1)msg.textContent='Price entering the FVG zone — institutional buyers absorbing orders here!';if(c.c>=fvgT)msg.textContent='FVG filled! ✓ Price bounced from the zone and is now heading back up.';i++;setTimeout(step,380);};
    drawBase([]);setTimeout(step,250);
  };
  drawBase();
},

sr(el){
  el.innerHTML='<canvas id="srC" style="width:100%;height:220px;display:block;cursor:crosshair"></canvas><div id="srMsg" style="margin-top:8px;font-size:12px;color:#8a97a8">Click any price level on the chart to see how strong it is as support or resistance.</div>';
  const cv=el.querySelector('#srC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=440;cv.style.height='220px';
  const W=cv.width,H=cv.height;
  const prices=[55,57,60,58,62,65,63,67,70,68,65,63,60,58,62,65,63,67,70,68,72,74,71,68,65,63,67,70,68,72];
  const mn=52,mx=77,py=v=>H-20-((v-mn)/(mx-mn))*(H-40),cw=Math.floor((W-40)/prices.length);
  function drawChart(hlY){
    cx.clearRect(0,0,W,H);
    cx.strokeStyle='rgba(255,255,255,0.04)';cx.lineWidth=1;
    for(let i=0;i<5;i++){const y=20+i*(H-40)/4;cx.beginPath();cx.moveTo(20,y);cx.lineTo(W-20,y);cx.stroke();}
    prices.forEach((p,i)=>{const x=20+i*cw+cw/2,col=i%2?'#e05252':'#00d4aa';cx.strokeStyle=col;cx.lineWidth=1.5;cx.beginPath();cx.moveTo(x,py(p*1.004));cx.lineTo(x,py(p*0.996));cx.stroke();cx.fillStyle=col;cx.fillRect(x-6,py(p*1.002),12,Math.max(2,Math.abs(py(p*1.002)-py(p*0.998))));});
    if(hlY!==undefined){cx.strokeStyle='rgba(255,255,255,0.65)';cx.lineWidth=2;cx.setLineDash([8,4]);cx.beginPath();cx.moveTo(20,hlY);cx.lineTo(W-20,hlY);cx.stroke();cx.setLineDash([]);}
  }
  cv.addEventListener('click',e=>{
    const r=cv.getBoundingClientRect(),cy=(e.clientY-r.top)*(H/r.height);
    const price=mn+(mx-mn)*(1-(cy-20)/(H-40));
    drawChart(cy);
    const touches=prices.filter(p=>Math.abs(p-price)<1.8).length;
    const msg=el.querySelector('#srMsg');
    if(touches>=3){msg.textContent='Strong level at ~'+price.toFixed(1)+' — touched '+touches+' times. HIGH probability of a reaction here.';msg.style.color='#00d4aa';}
    else if(touches>=1){msg.textContent='Weak level at ~'+price.toFixed(1)+' — only '+touches+' touch(es). Not a strong zone yet.';msg.style.color='#f59e0b';}
    else{msg.textContent='No touches near '+price.toFixed(1)+' — price has never reacted here. Not a meaningful S&R level.';msg.style.color='#8a97a8';}
  });
  drawChart();
},

ms(el){
  el.innerHTML='<div style="display:flex;gap:6px;margin-bottom:10px"><button onclick="drawMSType(\'bull\')" style="flex:1;padding:7px;border-radius:6px;border:1px solid rgba(0,212,170,.4);background:rgba(0,212,170,.15);color:#00d4aa;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Bullish structure (HH+HL)</button><button onclick="drawMSType(\'bear\')" style="flex:1;padding:7px;border-radius:6px;border:1px solid rgba(224,82,82,.4);background:rgba(224,82,82,.12);color:#e05252;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Bearish structure (LL+LH)</button></div><canvas id="msC" style="width:100%;height:200px;display:block"></canvas>';
  const cv=el.querySelector('#msC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;cv.style.height='200px';
  window.drawMSType=function(type){
    cx.clearRect(0,0,cv.width,cv.height);const W=cv.width,H=cv.height;
    const bull=[{x:0.05,y:0.85,l:'Start'},{x:0.2,y:0.45,l:'HH1'},{x:0.32,y:0.62,l:'HL1'},{x:0.52,y:0.18,l:'HH2'},{x:0.64,y:0.38,l:'HL2'},{x:0.84,y:0.08,l:'HH3'}];
    const bear=[{x:0.05,y:0.12,l:'Start'},{x:0.2,y:0.58,l:'LL1'},{x:0.32,y:0.36,l:'LH1'},{x:0.52,y:0.78,l:'LL2'},{x:0.64,y:0.52,l:'LH2'},{x:0.84,y:0.90,l:'LL3'}];
    const pts=type==='bull'?bull:bear;
    const sx=p=>p.x*W,sy=p=>p.y*H;
    const lc=type==='bull'?'rgba(0,212,170,0.7)':'rgba(224,82,82,0.7)';
    cx.strokeStyle=lc;cx.lineWidth=3;cx.beginPath();pts.forEach((p,i)=>{i===0?cx.moveTo(sx(p),sy(p)):cx.lineTo(sx(p),sy(p));});cx.stroke();
    pts.forEach(p=>{
      const isHigh=p.l.startsWith('HH')||p.l.startsWith('LH');
      cx.beginPath();cx.arc(sx(p),sy(p),16,0,Math.PI*2);cx.fillStyle=isHigh?'rgba(224,82,82,0.9)':'rgba(0,212,170,0.9)';cx.fill();
      cx.font='bold 24px sans-serif';cx.fillStyle='white';cx.textAlign='center';cx.fillText(p.l,sx(p),sy(p)+8);cx.textAlign='start';
    });
    const lbls=type==='bull'?['Higher High','Higher Low','Higher High','Higher Low','Higher High']:['Lower Low','Lower High','Lower Low','Lower High','Lower Low'];
    cx.font='18px sans-serif';
    pts.slice(1).forEach((p,i)=>{cx.fillStyle=type==='bull'?'rgba(0,212,170,0.5)':'rgba(224,82,82,0.5)';cx.fillText(lbls[i],sx(p)+20,sy(p)-5);});
  };
  window.drawMSType('bull');
},

bos(el){
  el.innerHTML='<canvas id="bosC" style="width:100%;height:200px;display:block"></canvas><button onclick="animBOS()" style="width:100%;margin-top:10px;padding:9px;border-radius:6px;border:1px solid rgba(0,212,170,.4);background:rgba(0,212,170,.12);color:#00d4aa;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">▶ Animate the BOS breakout</button><div id="bosM" style="margin-top:8px;font-size:12px;color:#8a97a8">A BOS (Break of Structure) confirms trend continuation — price closes above a previous swing high.</div>';
  const cv=el.querySelector('#bosC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;cv.style.height='200px';
  const W=cv.width,H=cv.height;
  const base=[{o:58,h:62,l:56,c:61},{o:61,h:64,l:59,c:63},{o:63,h:66,l:61,c:65},{o:65,h:68,l:63,c:67},{o:67,h:70,l:65,c:68},{o:68,h:71,l:66,c:70},{o:70,h:73,l:68,c:72},{o:72,h:74,l:70,c:73}];
  const sh=74;const mn=54,mx=88;const cW=Math.floor((W*0.4)/base.length);
  function dc(arr,xoff){arr.forEach((c,i)=>{const x=xoff+i*cW*1.5+cW/2,col=c.c>=c.o?'#00d4aa':'#e05252',py=v=>H-16-((v-mn)/(mx-mn))*(H-32);cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();cx.moveTo(x,py(c.h));cx.lineTo(x,py(c.l));cx.stroke();cx.fillStyle=col;cx.fillRect(x-cW*0.4,py(Math.max(c.o,c.c)),cW*0.8,Math.max(2,Math.abs(py(c.o)-py(c.c))));});}
  function drawAll(extra=[]){
    const py=v=>H-16-((v-mn)/(mx-mn))*(H-32);
    cx.clearRect(0,0,W,H);
    cx.strokeStyle='rgba(255,165,0,0.45)';cx.lineWidth=2;cx.setLineDash([8,4]);cx.beginPath();cx.moveTo(0,py(sh));cx.lineTo(W,py(sh));cx.stroke();cx.setLineDash([]);
    cx.font='bold 22px sans-serif';cx.fillStyle='rgba(255,165,0,0.75)';cx.fillText('Previous swing high: '+sh,20,py(sh)-8);
    dc(base,20);if(extra.length)dc(extra,20+base.length*cW*1.5);
  }
  window.animBOS=function(){
    const news=[{o:73,h:74,l:71,c:72},{o:72,h:74,l:70,c:73},{o:73,h:76,l:72,c:75},{o:75,h:80,l:74,c:79},{o:79,h:85,l:78,c:83}];
    let i=0;const msg=el.querySelector('#bosM'),py=v=>H-16-((v-mn)/(mx-mn))*(H-32);
    const step=()=>{drawAll(news.slice(0,i+1));if(news[i].c>sh){cx.font='bold 32px sans-serif';cx.fillStyle='#00d4aa';cx.textAlign='center';cx.fillText('BOS!',W/2,py(sh)-30);cx.textAlign='start';msg.textContent='BOS confirmed! Price closed above the swing high. Trend continues up — look for a pullback to re-enter.';msg.style.color='#00d4aa';}i++;if(i<news.length)setTimeout(step,380);};
    drawAll([]);setTimeout(step,300);
  };
  drawAll();
},

choch(el){
  el.innerHTML='<canvas id="chochC" style="width:100%;height:220px;display:block"></canvas><button onclick="animCHOCH()" style="width:100%;margin-top:10px;padding:9px;border-radius:6px;border:1px solid rgba(224,82,82,.4);background:rgba(224,82,82,.12);color:#e05252;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">▶ Animate the CHoCH warning</button><div id="chochM" style="margin-top:8px;font-size:12px;color:#8a97a8">CHoCH = Change of Character. In an uptrend, price breaking below a Higher Low is the first warning the trend may be reversing.</div>';
  const cv=el.querySelector('#chochC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=440;cv.style.height='220px';
  const W=cv.width,H=cv.height;
  const mn=54,mx=82;const py=v=>H-16-((v-mn)/(mx-mn))*(H-32);const HL=66;
  const bull=[{o:55,h:58,l:53,c:57},{o:57,h:62,l:56,c:61},{o:61,h:64,l:59,c:62},{o:62,h:68,l:61,c:67},{o:67,h:70,l:65,c:66},{o:66,h:72,l:65,c:71},{o:71,h:74,l:69,c:70},{o:70,h:76,l:69,c:75}];
  const cW=Math.floor((W*0.4)/bull.length);
  function dc(arr,xoff){arr.forEach((c,i)=>{const x=xoff+i*cW*1.5+cW/2,col=c.c>=c.o?'#00d4aa':'#e05252';cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();cx.moveTo(x,py(c.h));cx.lineTo(x,py(c.l));cx.stroke();cx.fillStyle=col;cx.fillRect(x-cW*0.4,py(Math.max(c.o,c.c)),cW*0.8,Math.max(2,Math.abs(py(c.o)-py(c.c))));});}
  function drawAll(extra=[]){
    cx.clearRect(0,0,W,H);cx.strokeStyle='rgba(0,212,170,0.45)';cx.lineWidth=2;cx.setLineDash([8,4]);cx.beginPath();cx.moveTo(0,py(HL));cx.lineTo(W,py(HL));cx.stroke();cx.setLineDash([]);
    cx.font='bold 22px sans-serif';cx.fillStyle='rgba(0,212,170,0.75)';cx.fillText('Higher Low: '+HL,20,py(HL)-8);
    dc(bull,20);if(extra.length)dc(extra,20+bull.length*cW*1.5);
  }
  window.animCHOCH=function(){
    const warn=[{o:75,h:77,l:72,c:73},{o:73,h:74,l:69,c:70},{o:70,h:71,l:65,c:66},{o:66,h:67,l:62,c:63}];
    let i=0;const msg=el.querySelector('#chochM');
    const step=()=>{drawAll(warn.slice(0,i+1));if(warn[i].c<HL){cx.font='bold 30px sans-serif';cx.fillStyle='#e05252';cx.textAlign='center';cx.fillText('CHoCH!',W/2,80);cx.textAlign='start';msg.textContent='CHoCH! Price closed below the Higher Low — uptrend structure broken. First warning of potential reversal. Wait for BOS in new direction to confirm.';msg.style.color='#e05252';}i++;if(i<warn.length)setTimeout(step,400);};
    drawAll([]);setTimeout(step,300);
  };
  drawAll();
},

elliott(el){
  el.innerHTML='<canvas id="ewC" style="width:100%;height:200px;display:block;cursor:pointer"></canvas><div id="ewBtns" style="display:flex;gap:4px;margin-top:10px;flex-wrap:wrap"></div><div id="ewD" style="margin-top:8px;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;background:rgba(0,212,170,.1);color:#00d4aa"></div>';
  const cv=el.querySelector('#ewC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=400;cv.style.height='200px';
  const W=cv.width,H=cv.height;
  const waves=[{l:'1',col:'#00d4aa',pts:[{x:.05,y:.88},{x:.18,y:.48}],desc:'Wave 1: Initial impulse up. Often unnoticed — traders think it\'s just a temporary bounce in a downtrend.'},
    {l:'2',col:'#e05252',pts:[{x:.18,y:.48},{x:.28,y:.68}],desc:'Wave 2: Corrective pullback. Retraces most of Wave 1 but NEVER goes below Wave 1\'s origin.'},
    {l:'3',col:'#00d4aa',pts:[{x:.28,y:.68},{x:.55,y:.12}],desc:'Wave 3: THE STRONGEST wave — always the longest impulse. Best entry point. RSI overbought, volume highest here.'},
    {l:'4',col:'#e05252',pts:[{x:.55,y:.12},{x:.65,y:.32}],desc:'Wave 4: Shallow correction. By Elliott\'s rules, CANNOT overlap Wave 1\'s price territory.'},
    {l:'5',col:'#00d4aa',pts:[{x:.65,y:.32},{x:.80,y:.06}],desc:'Wave 5: Final impulse, often weaker than Wave 3. RSI may show bearish divergence — warning the move is ending.'},
    {l:'A',col:'#f97316',pts:[{x:.80,y:.06},{x:.87,y:.28}],desc:'Wave A: First corrective wave down. Many bulls think this is just a pullback — dangerous moment.'},
    {l:'B',col:'#f59e0b',pts:[{x:.87,y:.28},{x:.93,y:.16}],desc:'Wave B: Counter-rally in the correction. Retraces ~50-62% of Wave A. A bull trap — decline not over.'},
    {l:'C',col:'#f97316',pts:[{x:.93,y:.16},{x:1.0,y:.55}],desc:'Wave C: Final corrective wave. Equal or 1.618× Wave A. ABC complete — next impulse cycle begins.'},];
  let sel=2;
  function draw(hi){cx.clearRect(0,0,W,H);const p=20;const sx=x=>p+x*(W-p*2),sy=y=>p+y*(H-p*2);waves.forEach((w,i)=>{const p1=w.pts[0],p2=w.pts[1];cx.strokeStyle=i===hi?w.col:w.col+'50';cx.lineWidth=i===hi?5:2;cx.beginPath();cx.moveTo(sx(p1.x),sy(p1.y));cx.lineTo(sx(p2.x),sy(p2.y));cx.stroke();const mx=(sx(p1.x)+sx(p2.x))/2,my=(sy(p1.y)+sy(p2.y))/2-14;cx.font=(i===hi?'bold ':'')+' 22px sans-serif';cx.fillStyle=i===hi?w.col:w.col+'70';cx.textAlign='center';cx.fillText(w.l,mx,my);});cx.textAlign='start';}
  function sel2(i){sel=i;draw(i);const w=waves[i];const d=el.querySelector('#ewD');d.textContent=w.desc;d.style.color=w.col;d.style.background=w.col+'18';el.querySelectorAll('#ewBtns button').forEach((b,j)=>{b.style.background=j===i?w.col+'20':'transparent';b.style.borderColor=j===i?w.col:'rgba(255,255,255,.15)';b.style.color=j===i?w.col:'#8a97a8';});}
  const btns=el.querySelector('#ewBtns');waves.forEach((w,i)=>{const btn=document.createElement('button');btn.textContent='Wave '+w.l;btn.style.cssText='padding:5px 11px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;border:1px solid rgba(255,255,255,.15);background:transparent;color:#8a97a8';btn.onclick=()=>sel2(i);btns.appendChild(btn);});sel2(2);
},

volume(el){
  el.innerHTML='<canvas id="volC" style="width:100%;height:220px;display:block"></canvas><div style="display:flex;gap:14px;margin-top:8px;font-size:12px;flex-wrap:wrap"><span style="color:#00d4aa;font-weight:600">█ Bullish volume</span><span style="color:#e05252;font-weight:600">█ Bearish volume</span><span style="color:rgba(255,255,255,.5)">─ Price</span></div><div id="volM" style="margin-top:8px;font-size:12px;color:#8a97a8">Click any volume bar to understand what it means.</div>';
  const cv=el.querySelector('#volC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=440;cv.style.height='220px';
  const W=cv.width,H=cv.height;
  const data=[{p:50,v:18,note:'Low volume rally — weak move, no conviction from buyers'},{p:52,v:16},{p:51,v:14},{p:53,v:20},{p:55,v:48,note:'High volume breakout — strong bullish conviction!'},{p:58,v:52,note:'High volume continuation — buyers firmly in control'},{p:57,v:28},{p:59,v:32},{p:62,v:58,note:'Highest volume + price up = maximum bullish conviction'},{p:61,v:38},{p:63,v:26},{p:61,v:62,note:'HIGH volume + price DOWN — warning! Sellers emerging aggressively'},{p:59,v:34},{p:57,v:46,note:'High volume decline — strong bearish conviction, sellers in control'},{p:58,v:18,note:'Low volume bounce — likely a dead-cat bounce, not a real reversal'},{p:56,v:15}];
  const mxV=Math.max(...data.map(d=>d.v));const pH=H*0.4,vH=H*0.45,gH=H*0.05;
  const pmin=53,pmax=65,ppx=i=>20+(i*(W-40))/(data.length-1),ppy=v=>gH+((pmax-v)/(pmax-pmin))*pH,vpy=v=>pH+gH*2+(1-v/mxV)*vH;
  const bw=Math.floor((W-40)/data.length)*0.65;
  cx.strokeStyle='rgba(255,255,255,0.5)';cx.lineWidth=2;cx.beginPath();data.forEach((d,i)=>{i===0?cx.moveTo(ppx(i),ppy(d.p)):cx.lineTo(ppx(i),ppy(d.p));});cx.stroke();
  cx.strokeStyle='rgba(255,255,255,0.08)';cx.lineWidth=1;cx.beginPath();cx.moveTo(20,pH+gH*1.5);cx.lineTo(W-20,pH+gH*1.5);cx.stroke();
  const bars=[];
  data.forEach((d,i)=>{const bull=i===0||d.p>=data[i-1].p;cx.fillStyle=bull?'rgba(0,212,170,0.65)':'rgba(224,82,82,0.65)';const y=vpy(d.v),bH=(pH+gH*2+vH)-y;cx.fillRect(ppx(i)-bw/2,y,bw,bH);bars.push({x:ppx(i)-bw/2,y,w:bw,h:bH,note:d.note,bull,p:d.p,v:d.v});});
  cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),cx2=(e.clientX-r.left)*(W/r.width),cy=(e.clientY-r.top)*(H/r.height);const hit=bars.find(b=>cx2>=b.x&&cx2<=b.x+b.w&&cy>=b.y&&cy<=b.y+b.h);if(hit){const m=el.querySelector('#volM');m.textContent=hit.note||'Volume: '+hit.v+' units. '+(hit.bull?'Bullish candle.':'Bearish candle.');m.style.color=hit.bull?'#00d4aa':'#e05252';}});
},

heikinashi(el){
  el.innerHTML='<canvas id="haC" style="width:100%;height:190px;display:block"></canvas><div style="display:flex;gap:14px;margin-top:8px;font-size:12px"><span style="color:#00d4aa;font-weight:600">█ Bullish HA candle</span><span style="color:#e05252;font-weight:600">█ Bearish HA candle</span></div><p style="margin-top:6px;font-size:12px;color:#8a97a8">Notice how consecutive same-colour candles clearly show the trend direction — much cleaner than regular candles.</p>';
  const cv=el.querySelector('#haC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=380;cv.style.height='190px';
  const W=cv.width,H=cv.height;
  const raw=[{o:50,h:54,l:48,c:52},{o:52,h:56,l:51,c:55},{o:55,h:59,l:53,c:57},{o:57,h:61,l:55,c:60},{o:60,h:65,l:58,c:63},{o:63,h:67,l:61,c:65},{o:65,h:68,l:62,c:64},{o:64,h:66,l:60,c:61},{o:61,h:63,l:57,c:58},{o:58,h:60,l:54,c:55},{o:55,h:57,l:51,c:52},{o:52,h:54,l:48,c:49}];
  const ha=[];raw.forEach((c,i)=>{const hc=(c.o+c.h+c.l+c.c)/4,ho=i===0?c.o:(ha[i-1].o+ha[i-1].c)/2,hh=Math.max(c.h,hc,ho),hl=Math.min(c.l,hc,ho);ha.push({o:ho,h:hh,l:hl,c:hc});});
  const bw=Math.floor((W-40)/ha.length)*0.7,mn=46,mx=70;
  const px=i=>30+(i*(W-60))/(ha.length-1),py=v=>H-10-((v-mn)/(mx-mn))*(H-20);
  ha.forEach((c,i)=>{const col=c.c>=c.o?'#00d4aa':'#e05252';cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();cx.moveTo(px(i),py(c.h));cx.lineTo(px(i),py(c.l));cx.stroke();cx.fillStyle=col;cx.fillRect(px(i)-bw/2,py(Math.max(c.o,c.c)),bw,Math.max(2,Math.abs(py(c.o)-py(c.c))));});
},

_default(el){
  el.innerHTML='<canvas id="defC" style="width:100%;height:180px;display:block"></canvas>';
  const cv=el.querySelector('#defC'),cx=cv.getContext('2d');
  cv.width=cv.offsetWidth*2;cv.height=360;cv.style.height='180px';
  const W=cv.width,H=cv.height;
  const p=[50,51,52,50,53,55,54,57,59,58,61,64,63,66,68,67,65,62,60,57,55,52,50,48,46,45,47,49,51,53];
  const sma=(d,n)=>d.map((_,i)=>i<n-1?null:d.slice(i-n+1,i+1).reduce((a,b)=>a+b)/n);
  const s10=sma(p,10),s20=sma(p,20),mn=43,mx=71;
  const px=x=>20+(x*(W-40))/(p.length-1),py=y=>H-10-((y-mn)/(mx-mn))*(H-20);
  cx.strokeStyle='rgba(255,255,255,0.25)';cx.lineWidth=2;cx.beginPath();p.forEach((v,i)=>{i===0?cx.moveTo(px(i),py(v)):cx.lineTo(px(i),py(v));});cx.stroke();
  const dl=(arr,col)=>{cx.strokeStyle=col;cx.lineWidth=3;cx.beginPath();let s=false;arr.forEach((v,i)=>{if(v===null)return;s?cx.lineTo(px(i),py(v)):cx.moveTo(px(i),py(v));s=true;});cx.stroke();};
  dl(s10,'#00d4aa');dl(s20,'#f59e0b');
}
};

VIZBUILDERS.dynsr=VIZBUILDERS.ema;
VIZBUILDERS.sd=VIZBUILDERS.sr;
VIZBUILDERS.breakout=VIZBUILDERS.bos;
VIZBUILDERS.reversal=VIZBUILDERS.ms;
VIZBUILDERS.harmonic=VIZBUILDERS.fib;
VIZBUILDERS.gann=VIZBUILDERS._default;
VIZBUILDERS.renko=VIZBUILDERS._default;
VIZBUILDERS.moon=VIZBUILDERS._default;
VIZBUILDERS.season=VIZBUILDERS._default;
VIZBUILDERS.trendlines=VIZBUILDERS.trendlines;
