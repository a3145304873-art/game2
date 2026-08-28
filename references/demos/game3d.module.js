/* =====================================================================
 * 鹅鹅牧场 3D —— Three.js 第三人称跟随视角（对标《大鹅吃草》参照设计）
 * 由 build-3d.js 组装进 pasture-goose-3d.html；DOM/奖励层与 2D 版完全一致
 * 依赖：CDN three@0.160（评审期走 CDN；上线打包时内联即可，见 README）
 * ===================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const Q = new URLSearchParams(location.search);   // ?shot=1 自动回传截图 / ?test=1 自动行走
addEventListener('error',e=>{ if(Q.get('shot')) fetch('/save/diag.txt',{method:'POST',body:'ERR '+e.message+' @line'+e.lineno}).catch(()=>{}); });

/* ---------- 0. 可调配置（与 2D 版同源，单位换成了世界坐标） ---------- */
const CFG = {
  DURATION : 60,      // 一局时长(秒)
  SPEED    : 4.6,     // 大鹅速度 世界单位/秒
  EAT_R    : 1.25,    // 进食判定半径
  HALF     : 17,      // 草地半宽（±17）
  SPAWN_MAX: 30,      // 场上草垛上限
  GOLD_P   : 0.07,    // 金麦穗概率
  CHEST_P  : 0.015,   // 宝箱彩蛋概率
  LEVELS   : [10, 25, 50],
  COMBO_GAP: 1.2,
};

/* 奖项配置：condition 从高到低命中即停；base 必须兜底 */
const REWARDS = [
  { id:'top',  name:'三十连金牌幸运箱', pic:'🏆', desc:'恭喜抽中最高档大奖！', tier:'至尊大奖', tierColor:'#e0482e', lottery:true,
    condition:(s)=> s.score >= 80 },
  { id:'mid',  name:'黄金牧草礼包',     pic:'🎁', desc:'表现优异，进阶好礼已备好～', tier:'进阶奖励', tierColor:'#d3862a',
    condition:(s)=> s.score >= 40 },
  { id:'base', name:'牧场体验券',       pic:'🎫', desc:'感谢参与，基础福利人人有份～', tier:'保底福利', tierColor:'#7a9c46',
    condition:( )=> true },
];
/* 二选一奖面（同档位两种奖励皮肤；选择仅影响展示，判定以 tier 为准） */
const FLAVORS=[
  { id:'fubag',  name:'惊喜福袋', picKey:'gift_mid',  emoji:'🧧' },
  { id:'jinang', name:'侠客锦囊', picKey:'gift_base', emoji:'📜' },
];
let pickedFlavor=0, currentTier=null;

/* ---------- 1. 服务端接口占位（对接时只改这里） ---------- */
const API = {
  getConfig(){ return Promise.resolve({ remainingPlays: 3 }); },
  submitScore(payload){ console.info('[埋点上报] submitScore', payload); return Promise.resolve({ ok:true }); },
  claimReward(rewardId){
    console.info('[领奖请求] claimReward', rewardId);
    return new Promise(r=>setTimeout(()=>r({ success:true, code:'DEMO-'+Math.random().toString(36).slice(2,8).toUpperCase(), stockOut:false }),900));
  },
};
const TRACK = {
  onGameStart(){ console.info('[埋点] game_start'); },
  onGameOver(s){ console.info('[埋点] game_over', s); },
  rewardShow(id){ console.info('[埋点] reward_show', id); },
  rewardClaimSuccess(id){ console.info('[埋点] reward_claim_success', id); },
  rewardStockOut(){ console.info('[埋点] reward_stockout'); },
};
function shareToFriend(){ toast('已唤起分享（演示占位，请接 JS-SDK）'); console.info('[分享] shareToFriend'); }

/* ---------- 2. 三维场景基座 ---------- */
const appEl=document.getElementById('app');
const renderer=new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:Q.get('shot')});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
appEl.appendChild(renderer.domElement);

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9ecdf2);
scene.fog=new THREE.Fog(0x9ecdf2,20,58);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,200);
camera.position.set(0,6.8,9);

scene.add(new THREE.HemisphereLight(0xffffff,0x88aa66,1.05));
const sun=new THREE.DirectionalLight(0xfff2d8,1.25); sun.position.set(6,10,4);
sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:60});
sun.shadow.bias=-0.0005;
scene.add(sun);

/* 地面：512 CanvasTexture 写实草地（双色草皮/顺风草叶/割草纹/裸土斑/雏菊）+ 起伏地形 */
function bakeGrassTexture(){
  const S=512, c=document.createElement('canvas'); c.width=c.height=S;
  const g=c.getContext('2d');
  g.fillStyle='#5d8a3f'; g.fillRect(0,0,S,S);
  for(let i=0;i<140;i++){ // 深浅草皮色斑
    g.fillStyle=`rgba(${52+Math.random()*36|0},${104+Math.random()*44|0},${44+Math.random()*26|0},.30)`;
    g.beginPath();
    g.ellipse(Math.random()*S,Math.random()*S,18+Math.random()*46,14+Math.random()*30,Math.random()*3,0,7);
    g.fill();
  }
  for(let pass=0;pass<2;pass++){ // 草叶笔触两遍：深色底+浅色梢，顺风向弯
    g.lineWidth=pass?1.1:1.6;
    for(let i=0;i<1400;i++){
      const x=Math.random()*S,y=Math.random()*S,lean=(Math.random()*3-1.5)+(pass?.6:-.6);
      g.strokeStyle=pass?'rgba(150,190,96,.20)':'rgba(40,74,28,.30)';
      g.beginPath(); g.moveTo(x,y);
      g.quadraticCurveTo(x+lean*.5,y-4,x+lean,y-7-Math.random()*4); g.stroke();
    }
  }
  g.fillStyle='rgba(255,255,240,.05)'; // 割草纹（竖向带宽，可无缝平铺）
  for(let x=0;x<S;x+=128) g.fillRect(x,0,64,S);
  for(let i=0;i<8;i++){ // 裸土磨损斑
    g.fillStyle='rgba(122,102,62,.20)';
    g.beginPath();
    g.ellipse(Math.random()*S,Math.random()*S,10+Math.random()*22,7+Math.random()*14,Math.random()*3,0,7);
    g.fill();
  }
  for(let i=0;i<24;i++){ // 小雏菊
    const x=Math.random()*S,y=Math.random()*S;
    g.fillStyle='rgba(245,245,240,.9)';
    for(let p=0;p<5;p++){ const a=p/5*6.283; g.beginPath(); g.arc(x+Math.cos(a)*2.4,y+Math.sin(a)*2.4,1.5,0,7); g.fill(); }
    g.fillStyle='#e8b93a'; g.beginPath(); g.arc(x,y,1.3,0,7); g.fill();
  }
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(5,5); t.anisotropy=8;
  return t;
}
/* 草丛镂空贴图与交叉面片（替代低多边形锥体，观感拟真） */
function bakeTuftTexture(gold){
  const S=128,c=document.createElement('canvas');c.width=c.height=S;
  const g=c.getContext('2d');
  for(let i=0;i<14;i++){
    const x0=S/2+(i-7)*4.2, top=S*.14+Math.random()*S*.24;
    const lean=(i-7)*3+(Math.random()*6-3), w=3+Math.random()*2.5;
    const grd=g.createLinearGradient(0,S,0,top);
    if(gold){ grd.addColorStop(0,'#a87408'); grd.addColorStop(1,'#ffd76a'); }
    else{ grd.addColorStop(0,'#2c5820'); grd.addColorStop(1,'#82b45a'); }
    g.strokeStyle=grd; g.lineWidth=w; g.lineCap='round';
    g.beginPath(); g.moveTo(x0,S);
    g.quadraticCurveTo(x0+lean*.4,S*.55,x0+lean,top); g.stroke();
  }
  const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t;
}
const TUFT_TEX=bakeTuftTexture(false), GOLD_TEX=bakeTuftTexture(true);
function makeTuftMesh(tex,s){
  const mat=new THREE.MeshLambertMaterial({map:tex,alphaTest:.45,side:THREE.DoubleSide});
  const g=new THREE.Group();
  const p1=new THREE.Mesh(new THREE.PlaneGeometry(s,s),mat); p1.position.y=s/2;
  const p2=p1.clone(); p2.rotation.y=Math.PI/2;
  g.add(p1,p2); return g;
}
/* 地形高度函数（地面网格与草叶落点共用，保证贴合） */
function groundH(x,z){ return Math.sin(x*.5)*.06+Math.cos(z*.45)*.06+Math.sin(x*1.7-z*.9)*.03; }

{
  const geo=new THREE.PlaneGeometry(CFG.HALF*2+4,CFG.HALF*2+4,40,40);
  const pos=geo.attributes.position; // 轻微地形起伏
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i);
    pos.setZ(i,groundH(x,-y));
  }
  geo.computeVertexNormals();
  const ground=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:bakeGrassTexture()}));
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
}

/* 静态装饰草丛（交叉面片镂空，加透视层次与遮挡关系） */
{
  for(let i=0;i<90;i++){
    const x=(Math.random()*2-1)*(CFG.HALF-1), z=(Math.random()*2-1)*(CFG.HALF-1);
    const d=makeTuftMesh(TUFT_TEX,.9+Math.random()*.7);
    d.position.set(x,groundH(x,z),z);
    d.rotation.y=Math.random()*6.28;
    scene.add(d);
  }
}

/* 风吹草浪：3800 株实例化草叶，顶点着色器风场（风向/湍流/频率，参数对标原作）+
 * 片元根梢渐变与逆光透光（拟真关键） */
const WIND={
  uTime:{value:0}, uWindStrength:{value:.14}, uWindSpeed:{value:1.3},
  uWindFrequency:{value:.55}, uWindTurbulence:{value:.2}, uWindLean:{value:.04},
  uWindDirection:{value:new THREE.Vector2(.82,.57).normalize()},
  uGrassBottom:{value:new THREE.Color('#4f7c13')}, uGrassTop:{value:new THREE.Color('#91b936')},
  uBacklightColor:{value:new THREE.Color('#c1e54d')}, uBacklightStrength:{value:.38},
};
{
  const COUNT=3800;
  const blade=new THREE.PlaneGeometry(.1,.5,1,3);
  blade.translate(0,.25,0);
  { // 顶部收窄成叶形
    const pos=blade.attributes.position;
    for(let i=0;i<pos.count;i++){ const y=pos.getY(i)/.5; pos.setX(i,pos.getX(i)*(1-y*.8)); }
  }
  const mat=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,WIND);
    sh.vertexShader=
      'uniform float uTime,uWindStrength,uWindSpeed,uWindFrequency,uWindTurbulence,uWindLean;\n'+
      'uniform vec2 uWindDirection;\nvarying float vH;\nattribute float aPhase;\n'+
      sh.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
         float hFac=max(position.y,0.0)/0.5; vH=hFac;
         #ifdef USE_INSTANCING
           float pn=fract(sin(dot(floor(instanceMatrix[3].xz),vec2(127.1,311.7)))*43758.5453);
         #else
           float pn=aPhase;
         #endif
         float wt=uTime*uWindSpeed+pn*6.283;
         float sway=(sin(wt)*uWindStrength+sin(wt*4.7)*uWindTurbulence)*pow(hFac,1.5);
         transformed.x+=uWindDirection.x*sway;
         transformed.z+=uWindDirection.y*sway;
         transformed.x+=normal.x*uWindLean*hFac;
         transformed.z+=normal.z*uWindLean*hFac;`);
    sh.fragmentShader=
      'uniform vec3 uGrassBottom,uGrassTop,uBacklightColor;\nuniform float uBacklightStrength;\nvarying float vH;\n'+
      sh.fragmentShader.replace('#include <color_fragment>',
        `#include <color_fragment>
         diffuseColor.rgb*=mix(uGrassBottom,uGrassTop,vH);
         diffuseColor.rgb+=uBacklightColor*pow(vH,1.8)*uBacklightStrength;`);
  };
  const inst=new THREE.InstancedMesh(blade,mat,COUNT);
  inst.receiveShadow=true;
  const dummy=new THREE.Object3D(), col=new THREE.Color();
  for(let i=0;i<COUNT;i++){
    const x=(Math.random()*2-1)*(CFG.HALF-.5), z=(Math.random()*2-1)*(CFG.HALF-.5);
    dummy.position.set(x,groundH(x,z),z);
    dummy.rotation.y=Math.random()*Math.PI;
    dummy.rotation.x=(Math.random()-.5)*.3;
    dummy.scale.setScalar(.7+Math.random()*.8);
    dummy.updateMatrix(); inst.setMatrixAt(i,dummy.matrix);
    col.setHSL(.26+Math.random()*.06,.45+Math.random()*.2,.30+Math.random()*.14);
    inst.setColorAt(i,col);
  }
  blade.setAttribute('aPhase',new THREE.InstancedBufferAttribute(
    new Float32Array(Array.from({length:COUNT},()=>Math.random()*6.28)),1));
  scene.add(inst);
}

/* 边界树篱 */
{
  const m=new THREE.MeshLambertMaterial({color:0x2f5424});
  const H=CFG.HALF+2;
  [[0,-H,44,1],[0,H,44,1],[-H,0,1,44],[H,0,1,44]].forEach(([x,z,w,d])=>{
    const hedge=new THREE.Mesh(new THREE.BoxGeometry(w,.9,d),m);
    hedge.position.set(x,.45,z); scene.add(hedge);
  });
}

/* ---------- 3. 大鹅：优先 ASSETS 内嵌 GLB，失败回落程序化模型 ---------- */
const ASSETS = window.ASSETS || {};
const gooseG=new THREE.Group(); scene.add(gooseG);          // 只管位置与朝向(yaw)
const gooseInner=new THREE.Group(); gooseG.add(gooseInner); // 管俯仰/摇摆/啄草
let walkBones=null;   // 程序化走路用四肢骨骼（模型有 rig 无动画剪辑）

(async()=>{
  let model=null;
  if(ASSETS.goose_glb){
    try{
      const bin=Uint8Array.from(atob(ASSETS.goose_glb),c=>c.charCodeAt(0));
      const loader=new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
      model=await new Promise((ok,err)=>loader.parse(bin.buffer,'',g=>ok(g.scene),err));
      const box=new THREE.Box3().setFromObject(model);
      const size=box.getSize(new THREE.Vector3()), ctr=box.getCenter(new THREE.Vector3());
      const k=1.15/size.y;
      model.scale.setScalar(k);
      model.position.set(-ctr.x*k,-box.min.y*k,-ctr.z*k);   // 落地 & 居中
      // 标定结论：该模型默认朝 +X，行走朝向由 targetYaw 公式统一处理
      gooseInner.add(model);
      model.traverse(o=>{ if(o.isMesh) o.castShadow=true; });   // 真实阴影（对标原作）
      // 骨骼抓取：左右大腿/小腿（names: tripo::0_Left_Limb_0 等），驱动程序化走路
      const B={};
      model.traverse(o=>{ if(o.isBone){
        if(/Left_Limb_0$/.test(o.name))B.L0=o;
        else if(/Right_Limb_0$/.test(o.name))B.R0=o;
        else if(/Left_Limb_1$/.test(o.name))B.L1=o;
        else if(/Right_Limb_1$/.test(o.name))B.R1=o;
      }});
      if(B.L0&&B.R0){
        B.base={L0:B.L0.rotation.z,R0:B.R0.rotation.z,L1:B.L1?B.L1.rotation.z:0,R1:B.R1?B.R1.rotation.z:0};
        walkBones=B;
        console.info('[3D] 骨骼走路已接管:', Object.keys(B).filter(k=>k!=='base').join('/'));
      }
      console.info('[3D] 使用《大鹅吃草》原版鹅模型');
    }catch(e){ console.warn('GLB 解析失败，回落程序化鹅：',e); model=null; }
  }
  if(!model){ // 程序化兜底（约定同 GLB：默认朝 +X）
    const white=new THREE.MeshLambertMaterial({color:0xf4f2ea});
    const body=new THREE.Mesh(new THREE.SphereGeometry(.42,18,14),white);
    body.scale.set(1.15,.85,1); gooseInner.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.2,14,12),white);
    head.position.set(.42,.55,0); gooseInner.add(head);
    const bill=new THREE.Mesh(new THREE.ConeGeometry(.09,.3,8),new THREE.MeshLambertMaterial({color:0xf2a93b}));
    bill.rotation.z=-Math.PI/2; bill.position.set(.68,.52,0); gooseInner.add(bill);
    gooseInner.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  }
})();

/* ---------- 4. 食物 / 粒子 ---------- */
const foods=[], dying=[], parts=[];
function makeTuft(gold){ return makeTuftMesh(gold?GOLD_TEX:TUFT_TEX,.85); }
function makeChest(){
  const g=new THREE.Group();
  const wood=new THREE.MeshLambertMaterial({color:0x6e4a22});
  const gold=new THREE.MeshLambertMaterial({color:0xd9a83c,emissive:0x5a3f08});
  const base=new THREE.Mesh(new THREE.BoxGeometry(.62,.3,.46),wood); base.position.y=.15;
  const lid =new THREE.Mesh(new THREE.BoxGeometry(.66,.14,.5),wood); lid.position.y=.37;
  const band=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,.48),gold); band.position.y=.24;
  g.add(base,lid,band); return g;
}
function spawnFood(forcePlain){
  for(let t=0;t<12;t++){
    const x=(Math.random()*2-1)*(CFG.HALF-1.5), z=(Math.random()*2-1)*(CFG.HALF-1.5);
    if(Math.hypot(x-gooseG.position.x,z-gooseG.position.z)<3) continue;
    const r=Math.random();
    const kind=forcePlain?'grass':r<CFG.CHEST_P?'chest':r<CFG.CHEST_P+CFG.GOLD_P?'gold':'grass';
    const m=kind==='chest'?makeChest():makeTuft(kind==='gold');
    if(kind==='chest') m.traverse(o=>{ if(o.isMesh) o.castShadow=true; });  // 镂空草丛不投影(避免方形影)
    m.position.set(x,0,z); m.rotation.y=Math.random()*6.28;
    scene.add(m); foods.push({m,kind,gold:kind==='gold'});
    return;
  }
}
function burst(x,y,z,color){
  for(let i=0;i<8;i++){
    const p=new THREE.Mesh(new THREE.SphereGeometry(.05,6,5),new THREE.MeshBasicMaterial({color}));
    p.position.set(x,y,z);
    parts.push({m:p,vx:(Math.random()-.5)*3,vy:2+Math.random()*2.5,vz:(Math.random()-.5)*3,life:.55});
    scene.add(p);
  }
}

/* ---------- 5. 输入：虚拟摇杆（带可视化） + 键盘 ----------
 * 三通道兜底（pointer/mouse/touch）：部分环境（自动化注入、旧 WebView）只派发
 * 鼠标或触摸事件流；joy 标志位互斥，防止双通道重复处理 */
const $=id=>document.getElementById(id);
let joy=null;         // {sx,sy,dx,dy,moved}
const keys=new Set();
const stickEl=$('stick'), knobEl=$('stick-knob');
function pd(x,y){
  if(mode!=='play')return;                    // 菜单阶段点按钮不生成摇杆
  joy={sx:x,sy:y,dx:0,dy:0,moved:false};
  stickEl.style.left=x+'px'; stickEl.style.top=y+'px';
  stickEl.style.display='block'; knobEl.style.transform='translate(-50%,-50%)';
}
function pm(x,y){
  if(!joy)return;
  const dx=x-joy.sx, dy=y-joy.sy, l=Math.hypot(dx,dy);
  if(l>8){ joy.dx=dx/l; joy.dy=dy/l; if(!joy.moved){ joy.moved=true; hideGesture(); } }
  else { joy.dx=0; joy.dy=0; }
  const k=Math.min(l,40), nx=l?dx/l:0, ny=l?dy/l:0;
  knobEl.style.transform=`translate(calc(-50% + ${nx*k}px), calc(-50% + ${ny*k}px))`;
}
function pu(){
  if(joy&&Q.get('shot')) fetch('/save/diag.txt',{method:'POST',
    body:'drag-end goose=['+gooseG.position.toArray().map(n=>n.toFixed(1))+'] yaw='+G.yaw.toFixed(2)}).catch(()=>{});
  joy=null; stickEl.style.display='none';
}
addEventListener('pointerdown',e=>pd(e.clientX,e.clientY));
addEventListener('pointermove',e=>{ if(joy)pm(e.clientX,e.clientY); });
addEventListener('pointerup',()=>{ if(joy)pu(); });
addEventListener('mousedown',e=>{ if(!joy)pd(e.clientX,e.clientY); });
addEventListener('mousemove',e=>{ if(joy)pm(e.clientX,e.clientY); });
addEventListener('mouseup',()=>{ if(joy)pu(); });
addEventListener('touchstart',e=>{ const t=e.touches[0]; if(t&&!joy)pd(t.clientX,t.clientY); },{passive:true});
addEventListener('touchmove',e=>{ const t=e.touches[0]; if(t&&joy)pm(t.clientX,t.clientY); },{passive:true});
addEventListener('touchend',()=>{ if(joy)pu(); });
addEventListener('keydown',e=>keys.add(e.key));
addEventListener('keyup',e=>keys.delete(e.key));

/* ---------- 6. 游戏状态与主循环 ---------- */
let mode='menu';
const G={score:0,timeLeft:CFG.DURATION,combo:0,lastEat:0,level:1,yaw:Math.PI/2};
let moveBlend=0, walkPhase=0, peckT=0;   // 走路混合系数/步伐相位/啄草相位
const hudScore=$('score'),hudTime=$('time'),hudLv=$('lv');

let lastT=performance.now(),spawnAcc=0,testWalked=false;
function tick(now){
  const dt=Math.min((now-lastT)/1000,.05); lastT=now;
  if(mode==='play') step(dt,now/1000);
  WIND.uTime.value=now/1000;   // 风吹草浪（风向+湍流）
  // 相机跟随：固定屏幕方位角的跟尾视角（参考对标）
  const p=gooseG.position;
  camera.position.lerp(new THREE.Vector3(p.x,6.8,p.z+9),.06);
  camera.lookAt(p.x,.6,p.z);
  renderer.render(scene,camera);
}
requestAnimationFrame(function loop(now){ requestAnimationFrame(loop); tick(now); });
/* rAF 停摆兜底：部分嵌入环境/后台标签会节流 rAF，>400ms 无帧时改用定时器驱动，
 * 保证"模型不会动"的极端环境也能玩 */
setInterval(()=>{ if(performance.now()-lastT>400) tick(performance.now()); },33);

function step(dt,t){
  G.timeLeft-=dt; hudTime.textContent=Math.max(0,Math.ceil(G.timeLeft));
  if(G.timeLeft<=0){ finishGame(); return; }

  // 方向：摇杆 > 键盘 > 测试模式自动行走
  let dx=0,dz=0;
  if(joy&&(joy.dx||joy.dy)){ dx=joy.dx; dz=joy.dy; }
  else{
    if(keys.has('ArrowUp')||keys.has('w'))dz-=1;
    if(keys.has('ArrowDown')||keys.has('s'))dz+=1;
    if(keys.has('ArrowLeft')||keys.has('a'))dx-=1;
    if(keys.has('ArrowRight')||keys.has('d'))dx+=1;
  }
  if(Q.get('test')&&!testWalked&&CFG.DURATION-G.timeLeft>.8){ dx=0;dz=-1; if(CFG.DURATION-G.timeLeft>2.1)testWalked=true; }
  const l=Math.hypot(dx,dz);
  let roll=0;
  if(l>0){
    dx/=l; dz/=l;
    const p=gooseG.position;
    p.x=THREE.MathUtils.clamp(p.x+dx*CFG.SPEED*dt,-CFG.HALF+.8,CFG.HALF-.8);
    p.z=THREE.MathUtils.clamp(p.z+dz*CFG.SPEED*dt,-CFG.HALF+.8,CFG.HALF-.8);
    // 标定：模型默认朝 +X → 朝向 (dx,dz) 需要 yaw=atan2(-dz,dx)
    const targetYaw=Math.atan2(-dz,dx);
    let d=targetYaw-G.yaw; while(d>Math.PI)d-=6.283; while(d<-Math.PI)d+=6.283;
    G.yaw+=d*Math.min(1,dt*10); gooseG.rotation.y=G.yaw;
    moveBlend=Math.min(1,moveBlend+dt*6); walkPhase+=dt*11;
    gooseInner.position.y=Math.abs(Math.sin(walkPhase))*.07*moveBlend;
    roll=Math.sin(walkPhase)*.06*moveBlend;
  }else{
    moveBlend=Math.max(0,moveBlend-dt*8);
    walkPhase+=dt*3*moveBlend;              // 停下时步伐缓收
    gooseInner.position.y*=.8; roll=gooseInner.rotation.z*.8;
  }
  // 程序化骨骼走路：双腿正弦摆动 + 提膝屈腿
  if(walkBones){
    const s=Math.sin(walkPhase), amp=.5*moveBlend;
    walkBones.L0.rotation.z=walkBones.base.L0+s*amp;
    walkBones.R0.rotation.z=walkBones.base.R0-s*amp;
    if(walkBones.L1)walkBones.L1.rotation.z=walkBones.base.L1+Math.max(0,-s)*amp*.9;
    if(walkBones.R1)walkBones.R1.rotation.z=walkBones.base.R1+Math.max(0,s)*amp*.9;
  }
  // 啄草（对标原作 neckPivot）：活动时周期性低头点啄
  peckT+=dt;
  const peck=Math.pow(Math.max(0,Math.sin(peckT*4.5)),2)*(moveBlend>.15?1:.35);
  gooseInner.rotation.z=roll-peck*.3;

  // 进食
  for(let i=foods.length-1;i>=0;i--){
    const f=foods[i];
    if(Math.hypot(f.m.position.x-gooseG.position.x,f.m.position.z-gooseG.position.z)<CFG.EAT_R){
      scene.remove(f.m); foods.splice(i,1);
      const gap=t-G.lastEat;
      G.combo=(gap<CFG.COMBO_GAP)?G.combo+1:1;
      G.lastEat=f.kind==='grass'?t:-9;
      let gain=f.kind==='chest'?10:f.gold?5:1;
      if(f.kind==='chest'){ setBanner('宝箱 +10','#e8c878'); burst(f.m.position.x,.4,f.m.position.z,0xffd76a); jingle(); }
      else if(f.gold){ setBanner('金麦穗 +5','#ffc63c'); burst(f.m.position.x,.4,f.m.position.z,0xffdf7e); }
      if(G.combo>0&&G.combo%5===0){ gain+=2; setBanner(`连击 ×${G.combo}  +${gain}`,'#ffb14e'); }
      addScore(gain);
      burst(f.m.position.x,.35,f.m.position.z,f.gold?0xcfe89a:0x7fb95a);
      beep(f.kind==='chest'?1046:f.gold?880:520+(G.combo%5)*40,.08);
    }
  }
  // 刷草
  spawnAcc+=dt;
  if(spawnAcc>.35&&foods.length<CFG.SPAWN_MAX){ spawnAcc=0; spawnFood(false); }
  // 粒子
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i]; p.life-=dt;
    p.m.position.x+=p.vx*dt; p.m.position.y+=p.vy*dt; p.m.position.z+=p.vz*dt; p.vy-=7*dt;
    if(p.life<=0){ scene.remove(p.m); parts.splice(i,1); }
  }
}

function addScore(v){
  G.score+=v; hudScore.textContent=G.score;
  for(let li=0;li<CFG.LEVELS.length;li++)
    if(G.score>=CFG.LEVELS[li]&&G.level===li+1){ G.level++; hudLv.textContent='Lv.'+G.level;
      setBanner('Lv.'+G.level+' 牧场伙食变好了！','#9fe070'); jingle(); }
}

/* ---------- 7. 流程控制（奖励层与 2D 版完全一致） ---------- */
function startGame(){
  Object.assign(G,{score:0,timeLeft:CFG.DURATION,combo:0,lastEat:0,level:1,yaw:Math.PI/2});
  gooseG.position.set(0,0,0); gooseG.rotation.set(0,G.yaw,0);
  hudScore.textContent='0'; hudLv.textContent='Lv.1';
  foods.forEach(f=>scene.remove(f.m)); foods.length=0;
  for(let i=0;i<26;i++) spawnFood(true);
  mode='play'; TRACK.onGameStart();
  show('ov-menu',false); show('ov-result',false); show('ov-gift',false); show('ov-code',false);
}
async function finishGame(){
  mode='end'; joy=null;
  TRACK.onGameOver(G.score);
  $('final-score').textContent=G.score;
  const best=Math.max(G.score,+(localStorage.getItem('goose3d_best')||0));
  localStorage.setItem('goose3d_best',best); $('best-score').textContent=best;
  await API.submitScore({score:G.score,duration:CFG.DURATION,ts:Date.now()});
  show('ov-result',true);
}
$('btn-to-gift').onclick=async()=>{
  const tier=[...REWARDS].find(r=>r.condition(G));
  TRACK.rewardShow(tier.id);
  if(tier.lottery){ show('lottery',true); await wait(1700); show('lottery',false); }
  $('gift-tier').textContent=tier.tier; $('gift-tier').style.background=tier.tierColor+'22';
  $('gift-tier').style.color=tier.tierColor;
  currentTier=tier;
  const row=$('flavor-row');
  if(tier.lottery){
    row.style.display='none'; $('gift-pic').style.display='block';
    applyGiftPic(tier);
    $('gift-name').textContent=tier.name; $('gift-desc').textContent=tier.desc;
    $('btn-claim').textContent='立即领取';
  }else{
    row.style.display='flex'; $('gift-pic').style.display='none';
    row.innerHTML=FLAVORS.map((f,i)=>{
      const src=ASSETS[f.picKey];
      const visual=src?`<img src="${src}">`:`<span class="f-emoji">${f.emoji}</span>`;
      return `<div class="flavor${i===0?' sel':''}" data-i="${i}">${visual}<div class="f-name">${f.name}</div></div>`;
    }).join('');
    pickedFlavor=0;
    $('gift-name').textContent='恭喜获得 '+tier.name;
    $('gift-desc').textContent=tier.desc+' 两项福利二选一～';
    [...row.children].forEach(el=>el.onclick=()=>{
      pickedFlavor=+el.dataset.i;
      [...row.children].forEach(c=>c.classList.toggle('sel',c===el));
      refreshClaimText(tier);
    });
    refreshClaimText(tier);
  }
  show('ov-result',false); show('ov-gift',true);
};
function refreshClaimText(tier){
  $('btn-claim').textContent=tier.lottery?'立即领取':'领取「'+FLAVORS[pickedFlavor].name+'」';
}
function applyGiftPic(tier){
  const el=$('gift-pic'),src=ASSETS['gift_'+tier.id];
  el.innerHTML=src?`<img src="${src}">`:tier.pic;
}
$('btn-claim').onclick=async ev=>{
  const btn=ev.currentTarget;
  console.info('[埋点] gift_click',currentTier.id);
  btn.disabled=true; btn.textContent='领取中…';
  const res=await API.claimReward(currentTier.id);
  btn.textContent='立即领取';
  if(res.stockOut){ TRACK.rewardStockOut(); toast('本场福利已被抢完啦～'); btn.disabled=false; return; }
  if(res.success){
    TRACK.rewardClaimSuccess(currentTier.id);
    $('code-text').textContent=res.code;
    show('ov-gift',false); show('ov-code',true);
    btn.classList.remove('breathing'); btn.textContent='已领取';
  }else{ btn.disabled=false; toast('领取失败，请稍后再试'); }
};
$('btn-start').onclick=startGame;
$('btn-again').onclick=startGame;
$('btn-share').onclick=shareToFriend;
$('btn-invite-menu').onclick=shareToFriend;
$('btn-finish').onclick=()=>show('ov-code',false);
$('code-copy').onclick=()=>{
  const txt=$('code-text').textContent;
  (navigator.clipboard?.writeText(txt)||Promise.reject()).then(()=>toast('已复制')).catch(()=>{
    const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); toast('已复制'); });
};
API.getConfig().then(c=>{
  $('plays-left').textContent=c.remainingPlays;
  if(c.remainingPlays<=0){ $('btn-start').textContent='今日次数已用完'; $('btn-start').disabled=true; }
});

/* ---------- 8. 工具函数 ---------- */
function show(id,on){ $(id).classList.toggle('show',on); }
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
let bannerTimer=null;
function setBanner(text,color){ const b=$('banner'); b.textContent=text; b.style.color=color||'#fff';
  b.classList.add('show'); clearTimeout(bannerTimer); bannerTimer=setTimeout(()=>b.classList.remove('show'),1100); }
function hideGesture(){ const g=$('gesture'); if(!g.dataset.used){ g.dataset.used=1; setTimeout(()=>g.classList.add('hide'),600);} }
if(ASSETS.gesture_hand){
  $('gesture').innerHTML=`<img src="${ASSETS.gesture_hand}" style="height:58px;display:block;margin:0 auto 4px">👉 按住屏幕拖动，小鹅朝手指方向走`;
}
addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });

/* 音效：WebAudio 合成零资源 */
let AC=null,muted=false;
function ac(){ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); return AC; }
function beep(f,d,type='triangle',g=.12){ if(muted)return; try{ const a=ac(),o=a.createOscillator(),gn=a.createGain();
  o.type=type; o.frequency.value=f; gn.gain.value=g; o.connect(gn).connect(a.destination);
  o.start(); gn.gain.exponentialRampToValueAtTime(.001,a.currentTime+d); o.stop(a.currentTime+d);}catch(e){} }
function jingle(){ [660,784,988].forEach((f,i)=>setTimeout(()=>beep(f,.12,'square',.09),i*90)); }

/* ---------- 9. 自动化验收钩子 ---------- */
if(Q.get('autostart')||Q.get('test')){
  setTimeout(()=>{ startGame(); },600);
  if(Q.get('shot')) setTimeout(async()=>{
      try{
        // 后台标签页 rAF 被节流：同步泵帧 3.5s，保证逻辑推进与画面渲染
        const simDt=1/60;
        for(let i=0;i<210;i++){
          if(mode==='play') step(simDt,performance.now()/1000+i*simDt);
          const p=gooseG.position;
          camera.position.lerp(new THREE.Vector3(p.x,6.8,p.z+9),.08);
          camera.lookAt(p.x,.6,p.z);
          renderer.render(scene,camera);
        }
        const diag=`mode=${mode} foods=${foods.length} parts=${parts.length} cam=[${camera.position.toArray().map(n=>n.toFixed(1))}] goose=[${gooseG.position.toArray().map(n=>n.toFixed(1))}] glb=${!!ASSETS.goose_glb} gooseKids=${gooseG.children.length}`;
        await fetch('/save/diag.txt',{method:'POST',body:diag});
        const cv=renderer.domElement;
        const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
        await fetch('/save/shot3d.png',{method:'POST',body:blob});
        document.title='SHOT OK';
      }catch(e){ document.title='SHOT ERR'; try{ await fetch('/save/diag.txt',{method:'POST',body:'SHOTERR '+e.message}); }catch(_){}}
    },3200);
  }
