// 本地渲染辅助服务：静态托管 demos/ + 接收浏览器渲染器 POST 保存的 PNG
// 用法：node serve-and-save.js   （监听 http://127.0.0.1:8899）
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=__dirname, PORT=8899;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.glb':'model/gltf-binary','.json':'application/json'};

http.createServer((req,res)=>{
  // 保存接口：POST /save/<文件名>，body 为原始字节
  if(req.method==='POST'&&req.url.startsWith('/save/')){
    const name=path.basename(decodeURIComponent(req.url.slice(6)));
    const chunks=[];
    req.on('data',c=>chunks.push(c));
    req.on('end',()=>{
      try{
        const buf=Buffer.concat(chunks);
        fs.writeFileSync(path.join(ROOT,'assets_ref',name),buf);
        console.log('[已保存]',name,(buf.length/1024).toFixed(1)+'KB');
        res.end('ok');
      }catch(e){ res.statusCode=500; res.end(String(e)); }
    });
    return;
  }
  // 静态文件（限制在 demos 目录内）
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/')p='/index.html';
  const fp=path.normalize(path.join(ROOT,p));
  if(!fp.startsWith(ROOT)){ res.statusCode=403; res.end(); return; }
  fs.readFile(fp,(err,data)=>{
    if(err){ res.statusCode=404; res.end('not found'); return; }
    res.setHeader('Content-Type',MIME[path.extname(fp).toLowerCase()]||'application/octet-stream');
    res.end(data);
  });
}).listen(PORT,'127.0.0.1',()=>console.log('demos 目录已托管: http://127.0.0.1:'+PORT));
