// Reapply reviewed research packets without replacing private reports or unrelated records.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,file=path.join(root,'research-data.json'),db=JSON.parse(fs.readFileSync(file,'utf8'));
const packets=fs.readdirSync(path.join(root,'knowledge')).filter(n=>n.endsWith('.json')).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'knowledge',n),'utf8')));
const map=new Map(db.records.map(r=>[r.id,r])),inserted=[];
for(const p of packets){for(const [id,s] of Object.entries(p.sources))db.sources[id]=s;for(const r of p.records){if(!map.has(r.id)){db.records.push(r);inserted.push(r.id);}else Object.assign(map.get(r.id),r);map.set(r.id,r);}}
for(const p of packets)for(const {recordId,...d} of p.dossiers){const r=map.get(recordId);if(!r||r.type!=='topic')throw Error('Dossier target missing: '+recordId);r.researchDossier={...d,assessed:'2026-10-02'};r.sourceIds=[...new Set([...r.sourceIds,...d.literature.map(v=>v.sourceId)])];r.date='2026-10-02';}
// New topics get a concrete preparation bridge; no unsupported award analogies.
for(const r of db.records.filter(r=>r.type==='topic'&&!r.researchBridge)){
 const d=r.researchDossier;
 const primary=r.groups[0],contestByGroup={circuits:['contest-ic','contest-soc'],machines:['contest-mech','contest-math'],materials:['contest-chem','contest-math'],civil:['contest-math'],environment:['contest-math'],agri:['contest-life','contest-math'],medicine:['contest-life','contest-math'],business:['contest-survey','contest-math'],human:['contest-math'],computing:['contest-math','contest-soc'],math:['contest-math'],design:['contest-ad']};
 const candidates=db.records.filter(v=>v.type==='resource').map(v=>({v,score:v.sourceIds.filter(id=>r.sourceIds.includes(id)).length*10+v.groups.filter(id=>r.groups.includes(id)).length})).sort((a,b)=>b.score-a.score);
 const roleMajors=[r.majors.slice(0,1),r.majors.slice(1).length?r.majors.slice(1):['m33']];
 r.researchBridge={contestIds:contestByGroup[primary]||['contest-math'],caseIds:[],resourceIds:candidates.slice(0,3).map(v=>v.v.id),contestNote:'先核对当前届次的任务、组别、作品要求和资格。本题可作为准备方向；命题赛需按当届赛题调整，不能用已有题目代替规定任务。',caseNote:'本轮未确认与本题足够接近的获奖作品全文，暂不绑定案例。优先借鉴同领域的研究过程，避免把历史奖项当作本题效果证明。',roles:[{majorIds:roleMajors[0],role:'定义领域对象、评价口径与任务边界，核对材料适用性。',deliverable:'问题定义、数据字典、限制与纳入规则。'},{majorIds:roleMajors[1],role:'实现基线、分割管线和评价脚本，独立复核指标。',deliverable:'可重跑基线、实验日志、指标和失败案例。'}],milestones:['第 1–3 天：核对资料权限、版本、字段或硬件条件，建立阅读矩阵。','第 4–6 天：完成最小基线：'+r.difficultyProfile.minimum,'第 7–10 天：预检“'+d.experiments[0].name+'”，登记无法执行的条件与风险。','第 11–14 天：提交基线结果或失败记录，和导师冻结变量、指标、范围及正式数据划分。'],mentorQuestions:[d.question,'资源、数据许可和评价单位是否支持该范围？哪些条件缺失时应按停止规则缩小题目？','是否适合当前培养阶段与竞赛组别？正式验证和时间预算如何调整？'],librarySearch:[r.title+' baseline reproducibility',r.tags.slice(0,3).join(' ')+' evaluation dataset']};
}
const wine=map.get('advanced-22');if(wine){wine.title='食品质量预测的合成漂移与解释稳定性';wine.summary='以公开理化数据研究解释稳定性和人为漂移压力；真实跨批次验证需另有可靠批次元数据。';}
db.date='2026-10-02';
db.knowledgeMethod={version:'3.0',assessed:db.date,deepCount:db.records.filter(r=>r.researchDossier).length,note:'仅部分选题增加经核验来源支持的具体研究档案；文献事实、拟议假设、实验和适用边界分别说明。尚未执行实验，不承诺性能或资格。'};
fs.writeFileSync(file,JSON.stringify(db,null,2)+'\n');
console.log(JSON.stringify({inserted:inserted.length,records:db.records.length,sources:Object.keys(db.sources).length,deep:db.knowledgeMethod.deepCount}));
