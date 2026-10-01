(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ResearchSearch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const aliases=[['risc-v','riscv','risc v'],['芯片','集成电路','ic'],['人工智能','ai'],['动科','动物科学'],['动医','动物医学'],['数模','数学建模'],['毕设','毕业设计'],['fpga','现场可编程门阵列'],['mcu','单片机','微控制器'],['tinyml','端侧机器学习'],['验证','verification'],['fifo','先进先出']];
  const fold=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/risc[\s_-]*v/g,'riscv').replace(/\s+/g,' ').trim();
  const labels={title:'标题',summary:'摘要',tags:'标签',major:'专业',body:'详细方案',difficulty:'难度与先修',bridge:'竞赛与协作',sources:'来源',report:'完整调研报告'};
  const weights={title:16,summary:8,tags:10,major:5,body:4,difficulty:3,bridge:3,sources:2,report:1};
  function parse(q,mode='all'){
    if(mode==='phrase')return q.trim()?[{raw:q.trim(),variants:[fold(q)],exact:true}]:[];
    const result=[];for(const m of q.replace(/\brisc[\s_-]+v\b/gi,'RISC-V').matchAll(/"([^"]+)"|“([^”]+)”|(\S+)/g)){
      const raw=m[1]||m[2]||m[3],quoted=!!(m[1]||m[2]),n=fold(raw),group=quoted?null:aliases.find(a=>a.some(v=>fold(v)===n));
      if(n)result.push({raw,variants:[...new Set((group||[raw]).map(fold))],exact:quoted});
    }return result;
  }
  function position(text,term){let start=0,p;while((p=text.indexOf(term,start))>=0){if(!/^[a-z0-9]{1,3}$/.test(term)||(!/[a-z0-9_]/.test(text[p-1]||'')&&!/[a-z0-9_]/.test(text[p+term.length]||'')))return p;start=p+1;}return -1;}
  function rawPosition(text,term){const pattern=term==='riscv'?'risc[\\s_-]*v':term.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&').replace(/ /g,'\\s+');for(const m of String(text).matchAll(new RegExp(pattern,'gi')))if(!/^[a-z0-9]{1,3}$/.test(term)||(!/[a-z0-9_]/i.test(text[m.index-1]||'')&&!/[a-z0-9_]/i.test(text[m.index+m[0].length]||'')))return m.index;return -1;}
  function create(db){
    const records=new Map(db.records.map(r=>[r.id,r])),majors=new Map(db.majors.map(m=>[m.id,m])),tiers=new Map(db.difficultyLevels.map(t=>[t.id,t]));
    const index=db.records.map(r=>{
      const parts=[],add=(field,values)=>{for(const text of Array.isArray(values)?values:[values])if(text)parts.push({field,text:String(text),folded:fold(text)});};
      add('title',r.title);add('summary',r.summary);add('tags',[...(r.tags||[]),r.type==='topic'?'毕业设计 毕设 选题':'']);add('major',(r.majors||[]).map(id=>majors.get(id)?.name));
      for(const s of r.sections||[])add('body',s.items.map(item=>s.heading+'：'+item));
      if(r.difficultyProfile){const p=r.difficultyProfile;add('difficulty',[r.difficulty,tiers.get(r.difficulty)?.name,r.level,p.reason,...p.prerequisites,...p.resources,p.minimum,p.stretch,p.effort,p.team]);}
      if(r.researchBridge){const b=r.researchBridge;add('bridge',[...(b.contestIds||[]),...(b.caseIds||[]),...(b.resourceIds||[])].map(id=>records.get(id)?.title));add('bridge',[b.contestNote,b.caseNote,...b.librarySearch,...b.milestones,...b.mentorQuestions,...b.roles.flatMap(v=>[v.role,v.deliverable,...v.majorIds.map(id=>majors.get(id)?.name)])]);}
      add('sources',(r.sourceIds||[]).flatMap(id=>{const s=db.sources[id];return s?[s.title,s.org,s.url,s.note]:[]}));
      if(r.report)add('report',db.report);return {r,parts};
    });
    return {
      search(state={}){
        const terms=parse(state.q||'',state.mode),scope=state.scope||'all',allowed=p=>scope==='all'||(scope==='title'?p.field==='title':scope==='sources'?p.field==='sources':['body','difficulty','bridge','report'].includes(p.field));
        const output=[];
        for(const {r,parts} of index){
          if(state.type&&state.type!=='all'&&r.type!==state.type||state.group&&state.group!=='all'&&!r.groups.includes(state.group)||state.major&&state.major!=='all'&&!r.majors.includes(state.major)||state.level&&state.level!=='all'&&r.level!==state.level||state.difficulty&&state.difficulty!=='all'&&r.difficulty!==state.difficulty)continue;
          const hits=[],found=new Set();let score=0;const scored=new Set();
          for(const part of parts.filter(allowed)){
            const matched=[];for(let i=0;i<terms.length;i++){const t=terms[i],variant=t.variants.find(v=>position(part.folded,v)>=0);if(!variant)continue;found.add(i);matched.push(variant);const key=i+':'+part.field;if(!scored.has(key)){score+=weights[part.field]+(position(part.folded,fold(t.raw))>=0?weights[part.field]/2:0);scored.add(key);}}
            if(matched.length){const raw=matched.map(v=>rawPosition(part.text,v)).filter(v=>v>=0),pos=raw.length?Math.min(...raw):Math.min(...matched.map(v=>position(part.folded,v)));hits.push({field:part.field,label:labels[part.field],text:part.text,position:pos,terms:matched,weight:weights[part.field]});}
          }
          if(terms.length&&(state.mode==='any'?found.size===0:found.size!==terms.length))continue;
          hits.sort((a,b)=>b.terms.length-a.terms.length||b.weight-a.weight);
          output.push({r,score:terms.length?score+(r.priority||0)/100:(r.priority||0),hits,matchedTerms:found.size,totalTerms:terms.length});
        }
        return output.sort((a,b)=>state.sort==='title'?a.r.title.localeCompare(b.r.title,'zh-CN'):state.sort==='date'?b.r.date.localeCompare(a.r.date)||b.score-a.score:state.sort==='difficulty'?(tiers.get(a.r.difficulty)?.rank||99)-(tiers.get(b.r.difficulty)?.rank||99)||b.score-a.score:b.score-a.score||a.r.title.localeCompare(b.r.title,'zh-CN'));
      }
    };
  }
  return {create,parse,fold,position,rawPosition};
});
