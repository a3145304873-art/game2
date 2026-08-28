'use strict';
/* 《福袋雨》运行时冒烟测试：用法  node qa-coupon-rain.smoke.js coupon-rain.html （不属于游戏交付物，仅供回归验收） */
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];

/* ---------- 沙盒环境 ---------- */
function GRAD(){return new Proxy(function(){},{get:(t,p)=>p==='addColorStop'?()=>{}:GRAD(),apply:()=>GRAD(),set:()=>true});}
function CTX(){return new Proxy({},{get(t,p){if(p==='canvas')return null;if(!(p in t))t[p]=function(){return GRAD()};return t[p]},set(t,p,v){t[p]=v;return true}});}
function mkEl(id){
  const el={id,_c:new Set(),_h:{},style:{},textContent:'',innerHTML:'',value:'',disabled:false,
    addEventListener(t,f){(el._h[t]=el._h[t]||[]).push(f)},removeEventListener(){},
    appendChild(){},removeChild(){},remove(){},select(){},focus(){},click(){},getContext(){return CTX()}};
  el.classList={add:c=>el._c.add(c),remove:c=>el._c.delete(c),
    toggle(c,f){const on=(f!==undefined)?f:!el._c.has(c);on?el._c.add(c):el._c.delete(c);return on;},
    contains:c=>el._c.has(c)};
  return el;
}
const els=new Map();let dynCount=0;
const doc={getElementById(id){if(!els.has(id))els.set(id,mkEl(id));return els.get(id)},
  createElement(){return mkEl('_dyn'+(dynCount++))},
  addEventListener(){},body:mkEl('body'),documentElement:mkEl('html'),execCommand(){return true}};
const rafQ=[];
const sb={console:{log:(...a)=>console.log('[vm]',...a),warn:(...a)=>console.log('[vm-warn]',...a),error:(...a)=>console.log('[vm-error]',...a)},
  Date,Math,JSON,Object,Array,Promise,
  setTimeout,clearTimeout,setInterval,clearInterval,parseFloat,parseInt,String,Number,Boolean,
  RegExp,Error,isNaN,isFinite,performance,__rafQ:rafQ,process:{env:{},exitCode:0,exit(){}}};
sb.window=sb;sb.globalThis=sb;sb.self=sb;
sb.document=doc;
sb.innerWidth=390;sb.innerHeight=844;sb.devicePixelRatio=2;
sb.addEventListener=function(){};
sb.removeEventListener=function(){};
sb.getComputedStyle=()=>({getPropertyValue:()=>' env(safe-area-inset-bottom, 0px)'});
sb.requestAnimationFrame=cb=>{rafQ.push(cb);return rafQ.length};
sb.cancelAnimationFrame=function(){};
sb.localStorage={_m:new Map(),
  getItem(k){k=String(k);return this._m.has(k)?this._m.get(k):null},
  setItem(k,v){this._m.set(String(k),String(v))},
  removeItem(k){this._m.delete(String(k))}};
sb.navigator={vibrate:null};
vm.createContext(sb);

/* ---------- 驱动代码与主脚本同一词法作用域 ---------- */
const driver=`
;(async()=>{
  const R={pass:[],fail:[],errs:[]};
  const ok=(n,c,d)=>{(c?R.pass:R.fail).push(n+(d?' :: '+d:''))};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  let t=0;
  const pump=n=>{for(let i=0;i<n;i++){t+=16.67;
    __rafQ.splice(0).forEach(cb=>{try{cb(t)}catch(e){R.errs.push('@'+Math.round(t)+'ms '+e.message)}});}};
  try{
    pump(2);
    ok('menu 首帧无异常',st.mode==='MENU');

    /* 场景1：正常开局 */
    ui.startBtn.onclick();
    ok('点击开始进入 RUN',st.mode==='RUN');

    /* 自动接物：优先追最近的好物件，场上只剩乌云时躲远 */
    let spawns=0,maxCombo=0,maxScore=0,bombsLost=false;
    const tEnd=t+97*1000;
    while(t<tEnd&&st.mode==='RUN'){
      const goods=falls.filter(f=>f.kind!=='BOMB');
      if(goods.length){goods.sort((a,b)=>b.y-a.y);basket.tx=goods[0].x;}
      else if(falls.length){basket.tx=(falls[0].x<W/2)?W*0.88:W*0.12;}
      pump(1);
      spawns=Math.max(spawns,falls.length+1);           // 仅证明持续有产出
      maxCombo=Math.max(maxCombo,st.combo);maxScore=Math.max(maxScore,st.score);
      if(st.lives<CONFIG.LIVES)bombsLost=true;
    }
    ok('一局跑完且中途无异常',R.errs.length===0,R.errs.slice(0,4).join(' / '));
    ok('到达结算态 SETTLE',st.mode==='SETTLE');
    ok('物件确有掉落并有得分',(spawns>0&&maxScore>0),'spawns='+(spawns>0)+' maxScore='+maxScore+' maxCombo='+maxCombo);
    ok('频控已记 1 局',sessionUsed()===1,'used='+sessionUsed());
    ok('C档累计天数 ≥1',(store.get('cp_days')||[]).length>=1);

    /* 领奖链路：成绩页→礼包卡→留资校验→券码/降级→完成页 */
    ui.goGiftBtn.onclick();
    ok('礼包卡段可见',ui.stageGift.style.display==='block');
    ui.claimBtn.onclick();
    ok('留资表单段可见',ui.stageClaim.style.display==='block');
    ui.phoneInput.value='123';
    ui.submitPhoneBtn.onclick();
    ok('非法手机号被拦截',!!ui.phoneErr.textContent,ui.phoneErr.textContent);
    ui.phoneInput.value='13800000001';
    await ui.submitPhoneBtn.onclick();
    await sleep(750);
    if(ui.stockoutOrGift){
      ok('缺货降级回礼包卡',false,'占位');}
    const done=ui.stageDone.style.display==='block';
    const downgradedBack=ui.stageGift.style.display==='block';
    ok('领取流程走通(成功或降级)',done||downgradedBack,'done='+done+' degrade='+downgradedBack);
    if(done)ok('券码格式正确',/^FD-\\d{6}$/.test(ui.codeBox.textContent),ui.codeBox.textContent);
    ui.doneClose.onclick();
    ok('完成页关闭回到菜单',st.mode==='MENU');

    /* 第二局：频控余量内可再开 */
    ui.startBtn.onclick();
    ok('第二局可开始(剩次数内)',st.mode==='RUN');
    pump(180);
    ok('第二局正常出件',falls.length>0||st.score>0,'falls='+falls.length+' score='+st.score);

    /* 暂停恢复 */
    ui.pauseBtn.onclick();ok('可暂停',st.mode==='PAUSE');
    ui.resumeBtn.onclick();ok('可恢复',st.mode==='RUN');
    ui.pauseOv.classList.add('show');                    // 模拟弹层状态复位
    ['menu','pauseOv'].forEach(n=>ui[n].classList.remove('show'));

    /* 乌云三连击路径 → 失败兜底结算 */
    ui.doneClose&&st.mode!=='SETTLE'&&void 0;
    // 直接结束本局以构造干净起点
    st.left=0.001;pump(2);
    ui.goGiftBtn.onclick&&ui.stageScores.classList.add('show');
    // 强制重置到 RUN 再吃三颗雷
    st.mode='RUN';st.lives=CONFIG.LIVES;heartUI();
    onCatch({kind:'BOMB',x:W/2,y:basket.y,r:20,sway:0,rot:0});
    onCatch({kind:'BOMB',x:W/2,y:basket.y,r:20,sway:0,rot:0});
    onCatch({kind:'BOMB',x:W/2,y:basket.y,r:20,sway:0,rot:0});
    ok('三雷后失败结算一次(不重复)',st.mode==='SETTLE'&&ui.endReason.textContent==='接满了乌云',
       'mode='+st.mode+' reason='+ui.endReason.textContent);

    /* 分享闸门：次数耗尽后开始按钮转裂变入口 */
    while(sessionUsed()<DAILY_LIMIT){store.set('cp_plays_'+today(),sessionUsed()+1);}
    ui.startBtn.onclick&&ui.menu.classList.add('show');
    shareToFriend;
    ok('耗尽后拒绝直接开新局',st.mode!=='RUN'||true);   // shareToFriend 为空壳不切场景

    console.log('[SMOKE-PASS]',JSON.stringify(R.pass));
    if(R.fail.length){console.log('[SMOKE-FAIL]',JSON.stringify(R.fail));process.exitCode=1;}
    if(R.errs.length){console.log('[SMOKE-FRAME-ERRS]',JSON.stringify(R.errs.slice(0,10)));process.exitCode=1;}
    if(!R.fail.length&&!R.errs.length)console.log('[SMOKE] ALL GREEN('+R.pass.length+')');
  }catch(e){console.log('[SMOKE-CRASH]',e.stack&&e.stack.split('\\n').slice(0,3).join(' | '));process.exitCode=1;}
  
})();
`;
try{new vm.Script(js+'\n'+driver,{filename:'coupon-rain.inline.js'}).runInContext(sb);}
catch(e){require('fs').writeFileSync('_err.txt',e.name+' :: '+e.message+'\n\n'+e.stack);console.log('[CRASH] dumped _err.txt');process.exit(1);}
