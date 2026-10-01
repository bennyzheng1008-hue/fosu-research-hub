const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawn}=require('node:child_process');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('generated client corpus and public download match the source',()=>{
 const source=JSON.parse(read('research-data.json')),context={window:{}};
 vm.runInNewContext(read('dist/data.js'),context,{timeout:1000});
 assert.deepEqual(JSON.parse(JSON.stringify(context.window.RESEARCH_DB)),source);
 assert.equal(read('dist/downloads/ic-research.md'),source.report);
 assert.ok(read('dist/index.html').includes('downloads/ic-research.md'));
 assert.ok(!read('dist/index.html').includes('ic-research.docx'));
 assert.ok(!read('dist/app.js').includes('ic-research.docx'));
});

test('public content has no private conversation, credentials or workstation paths',()=>{
 const forbidden=[/康丹青|王奕章|邦彦|拟发送稿/,/C:[/\\]Users[/\\]/i,/\.codex[/\\]/i,/(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}/,/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/];
 for(const file of ['research-data.json','dist/data.js','dist/downloads/ic-research.md','dist/app.js','dist/index.html','start.ps1','stop.ps1'])for(const pattern of forbidden)assert.ok(!pattern.test(read(file)),`${file} contains an excluded pattern`);
 for(const file of ['server.log','server-error.log','server.pid','dist/downloads/ic-research.docx'])assert.ok(!fs.existsSync(path.join(root,file)),`${file} must remain local`);
});

test('local HTTP service serves the site and contains invalid requests',async t=>{
 const child=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,FOSU_RESEARCH_PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill());
 const address=await new Promise((resolve,reject)=>{
  let stdout='',stderr='';const timer=setTimeout(()=>reject(Error('Server did not become ready')),5000);
  child.once('error',e=>{clearTimeout(timer);reject(e)});
  child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code+': '+stderr))});
  child.stderr.on('data',chunk=>stderr+=chunk);
  child.stdout.on('data',chunk=>{stdout+=chunk;const match=stdout.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0])}});
 });
 const request=(url,options={})=>fetch(address+url,{...options,signal:AbortSignal.timeout(5000)});
 const home=await request('/');assert.equal(home.status,200);assert.match(await home.text(),/选题难度分层/);
 assert.equal(home.headers.get('x-content-type-options'),'nosniff');assert.match(home.headers.get('content-security-policy'),/script-src 'self'/);
 const health=await request('/health');assert.deepEqual(await health.json(),{site:'fosu-research-hub',private:true});
 const script=await request('/app.js',{method:'HEAD'});assert.equal(script.status,200);assert.equal(await script.text(),'');assert.match(script.headers.get('content-type'),/javascript/);
 const report=await request('/downloads/ic-research.md');assert.equal(report.status,200);assert.equal(await report.text(),read('dist/downloads/ic-research.md'));
 assert.equal((await request('/',{method:'POST'})).status,405);
 assert.equal((await request('/%2e%2e%2fserver.cjs')).status,403);
 assert.equal((await request('/%ZZ')).status,400);
 assert.equal((await request('/missing.html')).status,404);
});
