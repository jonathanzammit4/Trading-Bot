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
  if(s){
    document.documentElement.setAttribute('data-theme',s);
    document.addEventListener('DOMContentLoaded',()=>setTheme(s));
  }
})();

/* ── MEGA NAV ── */
document.addEventListener('DOMContentLoaded',()=>{
  const wrap=document.getElementById('navIndicators');
  const dd=document.getElementById('megaDropdown');
  if(!wrap||!dd)return;
  let t;
  const show=()=>{clearTimeout(t);dd.classList.add('show')};
  const hide=()=>{t=setTimeout(()=>dd.classList.remove('show'),140)};
  wrap.addEventListener('mouseenter',show);
  wrap.addEventListener('mouseleave',hide);
  dd.addEventListener('mouseenter',show);
  dd.addEventListener('mouseleave',hide);
});

/* ── SCROLL REVEAL ── */
document.addEventListener('DOMContentLoaded',()=>{
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('in'),i*65);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.07});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
});

/* ── MODAL ENGINE ── */
let activeChart=null;

function openModal(key){
  const d=window.INDICATORS&&window.INDICATORS[key];
  if(!d)return;
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';

  // Head
  document.getElementById('mTag').textContent=d.tag;
  document.getElementById('mTag').style.cssText=`background:${d.tagBg};color:${d.tagColor}`;
  document.getElementById('mHeadBar').style.background=d.accentColor;
  document.getElementById('mTitle').textContent=d.title;
  document.getElementById('mFull').textContent=d.full;
  document.getElementById('mIntro').textContent=d.intro;

  // Body
  document.getElementById('modalBody').innerHTML=`
    <div class="chart-wrap">
      <p class="chart-lbl">// chart simulation</p>
      <canvas id="mc" style="max-height:185px"></canvas>
    </div>
    <div class="msec">
      <h3>How it works</h3>
      ${d.how.split('\n\n').map(p=>`<p>${p}</p>`).join('')}
      <div class="formula">${d.formula.replace(/\n/g,'<br>')}</div>
    </div>
    <div class="msec">
      <h3>Signals</h3>
      <div class="sig-grid">
        ${d.signals.map(s=>`<div class="sig-card ${s.t}"><p class="sig-lbl">${s.l}</p><p>${s.d}</p></div>`).join('')}
      </div>
    </div>
    <div class="msec">
      <h3>Key tips</h3>
      <div class="tips-list">
        ${d.tips.map(t=>`<div class="tip-item"><span class="tip-ico">💡</span><span>${t}</span></div>`).join('')}
      </div>
    </div>
  `;

  document.body.classList.add('locked');
  document.getElementById('overlay').classList.add('show');

  setTimeout(()=>{
    const ctx=document.getElementById('mc');
    if(!ctx)return;
    if(activeChart){activeChart.destroy();activeChart=null;}
    if(typeof Chart==='undefined')return;
    const cfg=buildChart(key,isDark);
    if(cfg)activeChart=new Chart(ctx,cfg);
  },55);
}

function closeModal(){
  document.getElementById('overlay').classList.remove('show');
  document.body.classList.remove('locked');
}

function handleOvClick(e){
  if(e.target===document.getElementById('overlay'))closeModal();
}

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ── CHART BUILDER ── */
function buildChart(key,isDark){
  const gc=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';
  const pc=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.2)';
  const prices=[50,51,52,50,53,55,54,57,59,58,61,64,63,66,68,67,65,62,60,57,55,52,50,48,46,45,47,49,51,53];
  const labels=prices.map((_,i)=>`D${i+1}`);
  const ema=(d,n)=>{const k=2/(n+1);let e=[d[0]];for(let i=1;i<d.length;i++)e.push((d[i]-e[i-1])*k+e[i-1]);return e;};
  const smaFn=(d,n)=>d.map((_,i)=>i<n-1?null:d.slice(i-n+1,i+1).reduce((a,b)=>a+b)/n);
  const baseOpts={
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:isDark?'#6b7a8d':'#8a97a8',font:{size:10,family:'DM Mono'},boxWidth:10,padding:16}}},
    scales:{
      x:{ticks:{color:gc,maxTicksLimit:8,font:{size:10}},grid:{color:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)'}},
      y:{ticks:{color:gc,font:{size:10}},grid:{color:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)'}}
    }
  };

  const cat=window.INDICATORS[key]&&window.INDICATORS[key]._chartType;

  if(cat==='rsi'||cat==='stoch'){
    const rsiV=prices.map((_,i)=>{if(i<5)return 50;const sl=prices.slice(Math.max(0,i-14),i+1);let g=0,l=0;for(let j=1;j<sl.length;j++){const d=sl[j]-sl[j-1];if(d>0)g+=d;else l-=d;}const ag=g/sl.length,al=l/sl.length;return al===0?100:100-(100/(1+(ag/al)));});
    return{type:'line',data:{labels,datasets:[{label:'RSI',data:rsiV,borderColor:'#4d9ef7',borderWidth:2,pointRadius:0,tension:.4},{label:'Overbought (70)',data:Array(30).fill(70),borderColor:'rgba(224,82,82,.5)',borderWidth:1,borderDash:[6,4],pointRadius:0},{label:'Oversold (30)',data:Array(30).fill(30),borderColor:'rgba(0,212,170,.5)',borderWidth:1,borderDash:[6,4],pointRadius:0}]},options:{...baseOpts,scales:{...baseOpts.scales,y:{...baseOpts.scales.y,min:0,max:100}}}};
  }
  if(cat==='macd'){
    const e12=ema(prices,12),e26=ema(prices,26);
    const ml=prices.map((_,i)=>e12[i]-e26[i]);
    const sl=ema(ml,9);
    const hist=ml.map((m,i)=>m-sl[i]);
    return{type:'bar',data:{labels,datasets:[{type:'bar',label:'Histogram',data:hist,backgroundColor:hist.map(v=>v>=0?'rgba(0,212,170,0.5)':'rgba(224,82,82,0.5)'),yAxisID:'y'},{type:'line',label:'MACD',data:ml,borderColor:'#f97316',borderWidth:2,pointRadius:0,tension:.4,yAxisID:'y'},{type:'line',label:'Signal',data:sl,borderColor:isDark?'rgba(255,255,255,.6)':'rgba(0,0,0,.5)',borderWidth:1.5,borderDash:[4,3],pointRadius:0,tension:.4,yAxisID:'y'}]},options:baseOpts};
  }
  if(cat==='bb'){
    const n=20,u=[],lo=[],mid=[];
    prices.forEach((_,i)=>{if(i<n-1){u.push(null);lo.push(null);mid.push(null);return;}const sl=prices.slice(i-n+1,i+1);const m=sl.reduce((a,b)=>a+b)/n;const sd=Math.sqrt(sl.map(p=>(p-m)**2).reduce((a,b)=>a+b)/n);mid.push(m);u.push(m+2*sd);lo.push(m-2*sd);});
    return{type:'line',data:{labels,datasets:[{label:'Upper',data:u,borderColor:'rgba(201,168,76,.6)',borderWidth:1.5,pointRadius:0,tension:.4,fill:'+1',backgroundColor:'rgba(201,168,76,.05)'},{label:'Middle',data:mid,borderColor:'#c9a84c',borderWidth:2,pointRadius:0,tension:.4},{label:'Lower',data:lo,borderColor:'rgba(201,168,76,.6)',borderWidth:1.5,pointRadius:0,tension:.4},{label:'Price',data:prices,borderColor:isDark?'rgba(255,255,255,.7)':'rgba(0,0,0,.5)',borderWidth:2,pointRadius:0,tension:.3}]},options:baseOpts};
  }
  if(cat==='ema'){
    const e10=ema(prices,10),s10=smaFn(prices,10);
    return{type:'line',data:{labels,datasets:[{label:'Price',data:prices,borderColor:pc,borderWidth:1.5,pointRadius:0,tension:.3},{label:'SMA 10',data:s10,borderColor:'#4d9ef7',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:.4},{label:'EMA 10',data:e10,borderColor:'#00d4aa',borderWidth:2.5,pointRadius:0,tension:.4}]},options:baseOpts};
  }
  if(cat==='volume'){
    const vol=[20,18,25,15,30,45,20,18,55,25,40,60,20,35,70,30,25,45,20,38,60,50,30,20,18,42,35,28,50,40];
    return{type:'bar',data:{labels,datasets:[{type:'line',label:'Price',data:prices,borderColor:'#00d4aa',borderWidth:2,pointRadius:0,tension:.3,yAxisID:'yp'},{type:'bar',label:'Volume',data:vol,backgroundColor:prices.map((p,i)=>i===0?'rgba(77,158,247,.4)':p>=prices[i-1]?'rgba(0,212,170,.4)':'rgba(224,82,82,.4)'),yAxisID:'yv'}]},options:{...baseOpts,scales:{xp:{display:false},yp:{position:'left',ticks:{color:gc,font:{size:10}},grid:{display:false}},yv:{position:'right',ticks:{color:gc,font:{size:10}},grid:{color:isDark?'rgba(255,255,255,.03)':'rgba(0,0,0,.04)'}},x:baseOpts.scales.x}}};
  }
  // default: price + two SMAs
  const s10=smaFn(prices,10),s20=smaFn(prices,20);
  return{type:'line',data:{labels,datasets:[{label:'Price',data:prices,borderColor:pc,borderWidth:1.5,pointRadius:0,tension:.3},{label:'SMA 10',data:s10,borderColor:'#00d4aa',borderWidth:2,pointRadius:0,tension:.4},{label:'SMA 20',data:s20,borderColor:'#c9a84c',borderWidth:2,pointRadius:0,tension:.4,borderDash:[5,4]}]},options:baseOpts};
}
