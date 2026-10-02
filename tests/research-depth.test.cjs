const test=require('node:test'),assert=require('node:assert/strict'),db=require('../research-data.json'),Search=require('../dist/search-engine.js'),Detail=require('../dist/research-detail.js');
test('deep scope browses only experimental plans and searches nested fields',()=>{
 const engine=Search.create(db),deep=db.records.filter(r=>r.researchDossier);
 assert.ok(deep.length>=30);
 assert.deepEqual(new Set(engine.search({scope:'dossier'}).map(v=>v.r.id)),new Set(deep.map(r=>r.id)));
 const r=deep[0],anchor='ZXQ-nested-experiment';
 const fixture=structuredClone(db),target=fixture.records.find(v=>v.id===r.id);target.researchDossier.experiments[0].controls=anchor;
 const s=Search.create(fixture);
 assert.ok(s.search({q:anchor}).some(v=>v.r.id===r.id));
 assert.deepEqual(s.search({q:anchor,scope:'dossier'}).map(v=>v.r.id),[r.id]);
 assert.equal(s.search({q:anchor,scope:'title'}).length,0);
 assert.equal(s.search({q:anchor,scope:'sources'}).length,0);
});
test('dossier rendering escapes content and rejects executable citation URLs',()=>{
 const r=structuredClone(db.records.find(r=>r.researchDossier)),s=r.researchDossier.literature[0].sourceId;
 r.researchDossier.question='<img src=x onerror=alert(1)>';
 r.researchDossier.experiments[0].variables=['x<y','A & B'];
 const fixture=structuredClone(db);fixture.sources[s].url='javascript:alert(1)';
 const html=Detail.renderDossier(r,fixture);
 assert.ok(html.includes('&lt;img'));assert.ok(html.includes('x&lt;y；A &amp; B'));
 assert.ok(!html.includes('<img'));assert.ok(!html.includes('javascript:'));
 assert.ok(html.includes('对照方法与实验设计'));assert.ok(html.includes('停止或缩小范围'));
 assert.equal(Detail.renderDossier({id:'basic'},db),'');
});
test('all deep plans preserve source attribution and separate metric units from aggregation',()=>{
 for(const r of db.records.filter(r=>r.researchDossier)){const d=r.researchDossier;for(const v of d.literature){assert.ok(db.sources[v.sourceId]);assert.ok(r.sourceIds.includes(v.sourceId));assert.ok(v.limitation);}for(const m of d.metrics){assert.ok(m.definition&&m.unit&&m.aggregation,r.id+' '+m.name);}assert.ok(d.stopRules.length&&d.reproducibility.length);}
});
