const test=require('node:test'),assert=require('node:assert/strict'),Search=require('../dist/search-engine.js'),db=require('../research-data.json');
const search=Search.create(db),ids=options=>search.search(options).map(v=>v.r.id);
test('short abbreviations do not accidentally match inside English words',()=>{
 assert.equal(Search.position(Search.fold('public music publications'),'ic'),-1);
 assert.equal(Search.position(Search.fold('plain training'),'ai'),-1);
 assert.equal(Search.position(Search.fold('IC 设计'),'ic'),0);
 assert.equal(Search.position(Search.fold('端侧 AI 模型'),'ai'),3);
});
test('query composition supports AND, OR, quoted phrases and synonyms',()=>{
 assert.ok(ids({q:'RISC-V 验证'}).includes('advanced-02'));
 assert.deepEqual(ids({q:'RISC V 验证'}),ids({q:'RISC-V 验证'}));
 assert.ok(ids({q:'动科',type:'topic'}).includes('topic-53'));
 assert.equal(ids({q:'RISC-V 不存在的长串字符',mode:'all'}).length,0);
 assert.ok(ids({q:'RISC-V 不存在的长串字符',mode:'any'}).length>0);
 assert.ok(ids({q:'"跨个体" 牛'}).includes('advanced-20'));
 assert.equal(ids({q:'牛 跨个体',mode:'phrase'}).length,0);
});
test('title hits outrank source-only hits regardless of recommendation priority',()=>{
 const fixture={majors:[],difficultyLevels:[],sources:{s:{title:'FIFO source',org:'Lab',url:'https://example.org'}},report:'',records:[{id:'source',title:'Unrelated',summary:'',type:'resource',tags:[],sourceIds:['s'],sections:[],majors:[],groups:[],priority:999,date:'2026-10-01'},{id:'title',title:'FIFO verification',summary:'',type:'topic',tags:[],sourceIds:[],sections:[],majors:[],groups:[],priority:0,date:'2026-10-01'}]};
 assert.equal(Search.create(fixture).search({q:'FIFO'})[0].r.id,'title');
});
test('scope, full-report indexing and simultaneous filters produce usable results',()=>{
 assert.equal(Search.rawPosition('RISC-V '.repeat(40)+'深层实验锚点','深层实验锚点'),280);
 assert.ok(ids({q:'CP-SAT',scope:'body'}).includes('case-tju-twin'));
 assert.ok(ids({q:'长沙理工大学',scope:'sources'}).includes('material-thesis-csust'));
 assert.equal(ids({q:'长沙理工大学',scope:'title'}).length,0);
 const fixture={...db,report:'完整报告独有锚点 ZXQ-report-unique'};
 assert.deepEqual(Search.create(fixture).search({q:'ZXQ-report-unique',scope:'body'}).map(v=>v.r.id),['guide-ic']);
 const list=search.search({q:'FIFO',type:'topic',major:'m21',difficulty:'D2'});
 assert.ok(list.length>0);assert.ok(list.every(v=>v.r.type==='topic'&&v.r.majors.includes('m21')&&v.r.difficulty==='D2'));
 assert.ok(list.every(v=>v.hits.length&&v.hits.some(h=>h.text.includes('FIFO'))));
});
test('every proposed topic has traceable resources and valid cross-major preparation links',()=>{
 const map=new Map(db.records.map(r=>[r.id,r]));
 for(const r of db.records.filter(r=>r.type==='topic')){const b=r.researchBridge;assert.ok(b&&b.resourceIds.length&&b.contestIds.length,r.id);for(const [key,type] of [['caseIds','case'],['resourceIds','resource'],['contestIds','contest']])for(const id of b[key])assert.equal(map.get(id)?.type,type,r.id+' '+id);assert.ok(b.roles.length>=2);assert.equal(b.milestones.length,4);}
});
