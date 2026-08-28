// 素材打包注入脚本（可反复执行，幂等）：
//   - 从 assets_ref/ 读取素材（可选文件缺失自动跳过）
//   - 支持二类注入：image(dataURI，供 <img>/drawImage) 与 raw(纯 base64，供 atob 解码二进制)
//   - 按目标文件各自需要的键集合注入，先移除旧块再写入
// 用法：node inject-assets.js
const fs = require('fs');
const DIR = __dirname;

// 键名 → [文件, 类型]；类型 image=带 data: 前缀 / raw=纯 base64
const MAP = {
  gift_top:     ['ref_1.png',       'image'],
  gesture_hand: ['ref_2.png',       'image'],
  gift_base:    ['ref_3.png',       'image'],
  gift_mid:     ['ref_6.png',       'image'],
  goose:        ['goose.png',       'image'],
  goose_strip:  ['goose_strip.png', 'image'],
  bg_tile:      ['bg_tile.png',     'image'],
  food_grass:   ['food_grass.png',  'image'],
  food_gold:    ['food_gold.png',   'image'],
  goose_glb:    ['goose.glb',       'raw'],   // 3D 版用：原始 GLB 二进制
};

// 每个目标文件注入哪些键
const TARGETS = [
  { file: 'pasture-goose-lite.html', keys: ['gift_top','gesture_hand','gift_base','gift_mid','goose','goose_strip','bg_tile','food_grass','food_gold'] },
  { file: 'pasture-goose-3d.html',   keys: ['gift_top','gesture_hand','gift_base','gift_mid','goose_glb'] },
];

function loadAsset([file, type]) {
  const buf = fs.readFileSync(DIR + '/assets_ref/' + file);
  const b64 = buf.toString('base64');
  return type === 'raw' ? b64 : 'data:image/png;base64,' + b64;
}

let fail = false;
for (const t of TARGETS) {
  const fp = DIR + '/' + t.file;
  if (!fs.existsSync(fp)) { console.log('目标不存在，跳过:', t.file); continue; }
  let html = fs.readFileSync(fp, 'utf8');
  const assets = {};
  for (const k of t.keys) {
    try { assets[k] = loadAsset(MAP[k]); }
    catch (e) { console.log('跳过(缺文件):', k, '<-', MAP[k][0]); }
  }
  // 幂等：移除旧资源块，再写回 <!--ASSETS--> 标记处
  html = html.replace(/<script>window\.ASSETS=[\s\S]*?<\/script>\n?/, '');
  const MARK = '<!--ASSETS-->';
  if (!html.includes(MARK)) { console.log('缺少', MARK, '标记:', t.file); fail = true; continue; }
  html = html.replace(MARK, '<script>window.ASSETS=' + JSON.stringify(assets) + ';</script>\n' + MARK);
  fs.writeFileSync(fp, html);
  console.log('[' + t.file + '] 注入键:', Object.keys(assets).join(', '), '| 大小:', (fs.statSync(fp).size/1024).toFixed(0) + 'KB');
}

// 语法校验（module 脚本单独处理）
for (const t of TARGETS) {
  const fp = DIR + '/' + t.file;
  if (!fs.existsSync(fp)) continue;
  const html = fs.readFileSync(fp, 'utf8');
  const blocks = [...html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)];
  blocks.forEach((x, i) => {
    const isModule = /type="module">/.test(x[0]);
    try {
      if (isModule) {
        fs.writeFileSync(DIR + '/_check.mjs', x[1]);
        require('child_process').execSync(`node --check "${DIR}/_check.mjs"`);
        fs.unlinkSync(DIR + '/_check.mjs');
      } else {
        new Function(x[1]);
      }
      console.log(`[${t.file}] script#${i}${isModule?'(module)':''} 语法 OK`);
    } catch (e) {
      try { fs.unlinkSync(DIR + '/_check.mjs'); } catch (_) {}
      console.log(`[${t.file}] script#${i} 语法错误:`, e.message);
      fail = true;
    }
  });
}
process.exit(fail ? 1 : 0);
