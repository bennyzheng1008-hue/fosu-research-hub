const fs=require('node:fs'),path=require('node:path');
const root=__dirname,data=JSON.parse(fs.readFileSync(path.join(root,'research-data.json'),'utf8'));
const errors=[],ids=new Set,majorIds=new Set(data.majors.map(m=>m.id)),sourceIds=new Set(Object.keys(data.sources));
const difficultyIds=new Set(data.difficultyLevels.map(t=>t.id));
for(const r of data.records){if(ids.has(r.id))errors.push('Duplicate record '+r.id);ids.add(r.id);for(const id of r.majors)if(!majorIds.has(id))errors.push('Unknown major '+id);for(const id of r.sourceIds)if(!sourceIds.has(id))errors.push('Unknown source '+id);if(!r.sourceIds.length)errors.push('No source '+r.id);if(!r.sections.length)errors.push('No details '+r.id);}
for(const r of data.records){
 if(r.researchBridge){
  const b=r.researchBridge;
  for(const [key,type] of [['contestIds','contest'],['caseIds','case'],['resourceIds','resource']])for(const id of b[key]||[])if(!data.records.some(v=>v.id===id&&v.type===type))errors.push('Invalid bridge '+r.id+' '+id);
  for(const role of b.roles||[])for(const id of role.majorIds)if(!majorIds.has(id))errors.push('Invalid role major '+r.id+' '+id);
  for(const key of ['roles','milestones','mentorQuestions','librarySearch'])if(!Array.isArray(b[key])||!b[key].length)errors.push('Empty bridge '+r.id+' '+key);
 }
 for(const id of r.relatedTopicIds||[])if(!data.records.some(v=>v.id===id&&v.type==='topic'))errors.push('Unknown related topic '+id);
 if(r.type!=='topic')continue;
 if(!r.researchBridge)errors.push('Missing research bridge '+r.id);
 const p=r.difficultyProfile;
 if(!difficultyIds.has(r.difficulty)||!p){errors.push('Missing difficulty '+r.id);continue;}
 const values=data.difficultyDimensions.map(d=>p.dimensions[d.id]);
 if(values.some(v=>!Number.isInteger(v)||v<1||v>4)||r.difficulty!=='D'+Math.max(...values))errors.push('Inconsistent difficulty '+r.id);
 for(const k of ['reason','minimum','stretch','effort','team'])if(typeof p[k]!=='string'||!p[k].trim())errors.push('Missing '+k+' '+r.id);
 for(const k of ['prerequisites','resources'])if(!Array.isArray(p[k])||!p[k].length||p[k].some(v=>typeof v!=='string'||!v.trim()))errors.push('Missing '+k+' '+r.id);
}
for(const s of Object.values(data.sources)){try{const u=new URL(s.url);if(!['https:','http:'].includes(u.protocol))errors.push('Invalid URL '+s.url)}catch{errors.push('Invalid URL '+s.url)}if(!/^\d{4}-\d{2}-\d{2}$/.test(s.checked))errors.push('Invalid date '+s.title)}
for(const m of data.majors)if(!data.records.some(r=>r.type==='topic'&&r.majors.includes(m.id)))errors.push('No topic for '+m.name);
if(errors.length)throw Error(errors.join('\n'));
fs.writeFileSync(path.join(root,'dist','data.js'),'window.RESEARCH_DB = '+JSON.stringify(data,null,2)+';\n','utf8');
console.log(JSON.stringify({validated:true,majors:data.majors.length,records:data.records.length,sources:sourceIds.size,difficulties:Object.fromEntries(data.difficultyLevels.map(t=>[t.id,data.records.filter(r=>r.difficulty===t.id).length])),types:Object.fromEntries(['topic','contest','case','resource','major','guide'].map(t=>[t,data.records.filter(r=>r.type===t).length]))}));
