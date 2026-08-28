// 末世后30天 · 平衡模拟器 v2（真实规则复刻版）
// 规则来源：web/index.html（SCAN_POOL / cookMul / goReport / 夜袭公式）
// 用法：node tools/simulate_balance.js

// —— 真实搜刮池（权重, 标签, 效果）——
const SCAN=[
  [20,'食物 +0.5',s=>s.food+=0.5],
  [16,'饮水 +0.5',s=>s.water+=0.5],
  [16,'燃料 +0.5',s=>s.fuel+=0.5],
  [12,'药品 +1',s=>s.meds+=1],
  [6, '工具',s=>s.tools=1],
  [6, '零食',s=>s.candy+=1],
  [14,'一无所获',s=>{}],
  [10,'可交易',s=>s.trade=true],
  [8, '受伤',s=>s.injury++],
  [2, '受伤',s=>s.injury++],
];
const TW=SCAN.reduce((a,r)=>a+r[0],0);
function scan(s,rand){
  let x=rand()*TW;
  for(const r of SCAN){ x-=r[0]; if(x<=0){ r[2](s); return r[1]; } }
  return SCAN[0][1];
}
function foodIdx(day){ return day<=35?1:day<=45?1+(day-35)*.2:day<=50?3:day<=52?4:4-(day-52)*.1875; }

// —— 搜刮点位期望表（近似真实池）——
const EXP={
  near:{f:.0909,w:.0727,fu:.0727,med:.109,inj:.091},
  mart:{f:.26,w:.07,fu:.03,med:.04,inj:.03},
  hosp:{f:.05,w:.04,fu:0,med:.22,inj:.16},
  park:{f:.05,w:.10,fu:.08,med:0,inj:.04},
};

function runGame(strat,start){
  const rand=Math.random;
  const st=start||{food:4,water:3,fuel:3.5,meds:3,candy:1,alive:9};
  let food=st.food, water=st.water, fuel=st.fuel, morale=46, meds=st.meds, candy=st.candy;
  let foodStreak=0, waterStreak=0, alive=st.alive, tradePend=false;
  let snow=0; // 雪灾标志
  const siteQ=(strat.sites||[]).slice();
  for(let d=31;d<=60;d++){
    // —— 士气<20 拒绝工作 ——
    const refuse=(morale<20&&rand()<.15)?1:0;
    let scav=strat.scav-refuse;
    const cooks=strat.cook, melt=strat.melt, guard=strat.guard;
    // 人手检查
    const used=scav+cooks+melt+guard+(strat.heat||1);
    if(used>alive)scav=Math.max(0,scav-(used-alive));
    // —— 搜刮（站点队列：前几次抽高价值点，之后随机周边）——
    const s0={food:0,water:0,fuel:0,meds:0,inj:0};
    for(let i=0;i<scav;i++){
      const site=siteQ.length?siteQ.shift():'near';
      const e=EXP[site]||EXP.near;
      s0.food+=e.f; s0.water+=e.w; s0.fuel+=e.fu; s0.meds+=e.med;
      if(rand()<e.inj&&rand()<.1)alive--;
    }
    food+=s0.food; water+=s0.water; fuel+=s0.fuel; meds+=s0.meds;
    if(rand()<1-Math.pow(1-.09,scav))tradePend=true;
    // —— 做饭消耗（小美0.8 / 有厨0.9 / 无厨1.0）——
    const cookMul=(cooks>0)?(strat.xiaomei?0.8:0.9):1.0;
    food-=cookMul;
    if(cooks>0&&strat.xiaomei)morale+=3;
    if(cooks===0)morale-=2;
    // —— 巡逻顺带捡柴 ——
    if(guard>0)fuel+=guard*0.2;
    // —— 饮水：全员 -1，融雪每人 +0.5（cap 8）——
    water-=1; water=Math.min(8,water+melt*.5);
    // —— 供暖燃料 -0.5 ——
    fuel-=0.5;
    // —— 雪灾：无铲雪者 shelter-10（简化：直接小损）——
    // —— 士气（复刻 goReport 主项）——
    const indoor=(fuel>0.25)?(strat.heat>0?7:5):-8;
    if(indoor<0)morale-=5; else if(indoor<5)morale-=2;
    if(d>=37)morale-=3; else morale+=3;
    if(alive>=3&&morale>30)morale+=3;
    morale=Math.max(0,Math.min(100,morale));
    // —— 夜袭（真实公式：基础10，无守夜人+10，巡逻-10，刘哥守夜再-10）——
    let risk=10+(strat.watch?0:10)-(strat.watch?10:0)-(guard>0?10:0);
    risk+=strat.hate; risk-=strat.intel?10:0;
    if(rand()*100<Math.max(0,risk)){ food=Math.max(0,food-(strat.hate>=60?3:2.5)); water=Math.max(0,water-1.5); morale-=8; }
    // —— Day42 北街超市（成功率70%：+6食 +3水(上限8) +2燃料）——
    if(d===42&&strat.super!==false){
      if(rand()<0.7){ food+=6; water=Math.min(8,water+3); fuel+=2; }
    }
    // —— 黑市：食物紧张就用药换粮 ——
    if(tradePend&&food<2&&meds>=1&&strat.trade){ food+=foodIdx(d); meds-=1; tradePend=false; }
    // —— 断供累计与死亡 ——
    if(food<=0){ food=0; foodStreak++; } else foodStreak=0;
    if(water<=0){ water=0; waterStreak++; } else waterStreak=0;
    if(foodStreak>=4){ alive-=2+(rand()<.3?1:0); if(alive<=0)return{d,d34:'starve'}; }
    if(waterStreak>=2){ alive-=1; if(alive<=0)return{d,d34:'thirst'}; }
    if(morale<=0)return{d,d34:'collapse'};
  }
  return{d:60,alive};
}
function batch(strat,n,start){
  let win=0,total=0;
  for(let i=0;i<n;i++){const r=runGame(strat,start); total+=r.d; if(r.d>=55)win++;}
  return{rate:(win/n*100).toFixed(1),avg:(total/n).toFixed(1)};
}
console.log('===== 末世后30天 · 平衡演算报告 v2（真实规则）=====');
console.log('基础：Day31 快速开始 9 人 / 食物4 水3 燃料3.5 士气46\n');
console.log('策略（cook/melt/scav/guard）    | 活到Day55胜率 | 平均存活');
const grids=[
  ['标准 小美1/融2/搜4/守1',{cook:1,melt:2,scav:4,guard:1,xiaomei:true,watch:true,trade:true}],
  ['无小美 厨1/融2/搜4/守1',{cook:1,melt:2,scav:4,guard:1,xiaomei:false,watch:true,trade:true}],
  ['重搜刮 小美1/融2/搜5/守1',{cook:1,melt:2,scav:5,guard:1,xiaomei:true,watch:true,trade:true}],
  ['省水 小美1/融1/搜5/守1',{cook:1,melt:1,scav:5,guard:1,xiaomei:true,watch:true,trade:true}],
  ['不交易(去超市) 小美1/融2/搜4/守1',{cook:1,melt:2,scav:4,guard:1,xiaomei:true,watch:true,trade:false}],
  ['不交易+不去超市 小美1/融2/搜4/守1',{cook:1,melt:2,scav:4,guard:1,xiaomei:true,watch:true,trade:false,super:false}],
  ['无守夜 小美1/融2/搜5',   {cook:1,melt:2,scav:5,guard:0,xiaomei:true,watch:false,trade:true}],
  ['超市优先×3 小美/融2/搜4/守1',{cook:1,melt:2,scav:4,guard:1,xiaomei:true,watch:true,trade:false,sites:['mart','mart','mart']}],
  ['医院刷药×2 小美/融2/搜4/守1',{cook:1,melt:2,scav:4,guard:1,xiaomei:true,watch:true,trade:true,sites:['hosp','hosp']}],
];
for(const [name,g] of grids){
  const r=batch(g,500);
  console.log(`${name.padEnd(26)} | ${r.rate.padStart(6)}%      | ${r.avg}`);
}
console.log('\n快速开始继承包（Day1-30 囤货）：食物12 水8 燃料7 + 小美 → 复测');
const rich=batch({cook:1,melt:2,scav:4,guard:1,xiaomei:true,watch:true,trade:true},500,{food:12,water:8,fuel:7,meds:6,candy:3,alive:9});
console.log(`继承包标准策略             | ${rich.rate.padStart(6)}%      | ${rich.avg}`);
