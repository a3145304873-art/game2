// 组装 3D 版：复用 2D 版的 head/CSS/DOM，替换游戏核心为 game3d.module.js
// 用法：node build-3d.js
const fs = require('fs');
const DIR = __dirname;

const lite = fs.readFileSync(DIR + '/pasture-goose-lite.html', 'utf8');
const game3d = fs.readFileSync(DIR + '/game3d.module.js', 'utf8');
const MARK = '<!--ASSETS-->';
const cut = lite.indexOf(MARK);
if (cut < 0) { console.log('lite 缺少标记'); process.exit(1); }

const headPart = lite.slice(0, cut)
  .replace('<title>鹅鹅牧场 · 攒金币</title>', '<title>鹅鹅牧场 3D · 攒金币</title>');

// 内联 importmap：vendor 文件齐则以 data:URL 注入（单文件离线可用），否则回落 CDN
// 注意：GLTFLoader 源码里的相对导入('../utils/BufferGeometryUtils.js')在 data:URL 模块中
// 无法解析（没有基准路径），构建时统一改写为裸导入
function makeImportmap() {
  const files = {
    "three": "vendor_three.module.js",
    "three/addons/loaders/GLTFLoader.js": "vendor_GLTFLloader.js",
    "three/addons/libs/meshopt_decoder.module.js": "vendor_meshopt.js",
    "three/addons/utils/BufferGeometryUtils.js": "vendor_BufferGeometryUtils.js",
  };
  const imports = {};
  let offline = true;
  for (const [k, f] of Object.entries(files)) {
    const p = DIR + '/assets_ref/' + f;
    if (fs.existsSync(p)) imports[k] = 'data:text/javascript;base64,' + fs.readFileSync(p).toString('base64');
    else offline = false;
  }
  if (offline) {
    // 改写 GLTFLoader 的相对导入为裸导入
    imports["three/addons/loaders/GLTFLoader.js"] =
      'data:text/javascript;base64,' +
      Buffer.from(
        fs.readFileSync(DIR + '/assets_ref/vendor_GLTFLloader.js', 'utf8')
          .replace(/from\s*'\.\.\/utils\/BufferGeometryUtils\.js'/, "from 'three/addons/utils/BufferGeometryUtils.js'"),
        'utf8'
      ).toString('base64');
    console.log('vendor 内联完成（单文件离线可用）');
    return JSON.stringify({ imports }, null, 1);
  }
  console.log('vendor 不全，回落 CDN importmap（需联网）');
  return JSON.stringify({ imports: {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  } }, null, 1);
}

const out = headPart
  + '<script type="importmap">\n' + makeImportmap() + '\n</script>\n'
  + MARK + '\n'
  + '<script type="module">\n' + game3d + '</script>\n'
  + '</body>\n</html>\n';

fs.writeFileSync(DIR + '/pasture-goose-3d.html', out);
console.log('pasture-goose-3d.html 已生成:', (fs.statSync(DIR + '/pasture-goose-3d.html').size / 1024).toFixed(0) + 'KB（未注入素材）');
