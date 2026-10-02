(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ResearchDetail=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=v=>Array.isArray(v)?v.join('；'):v;
  const list=values=>'<ul>'+values.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>';
  const fold=(title,body,open=false)=>'<details class="research-fold"'+(open?' open':'')+'><summary>'+esc(title)+'</summary><div class="fold-body">'+body+'</div></details>';
  function citation(s){if(!s)return '';let u;try{u=new URL(s.url);}catch{return esc(s.title);}return ['http:','https:'].includes(u.protocol)?'<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a>':esc(s.title);}
  function renderDossier(r,db){const d=r.researchDossier;if(!d)return '';return '<section class="research-dossier" aria-label="深度研究档案"><h3>深度研究档案</h3><p class="assessment-note">拟议实验，尚未执行。文献结论与本题研究假设分开列出；指标与判断规则需预研后冻结。整理 '+esc(d.assessed||db.date)+'</p><div class="question-box"><strong>要回答的问题</strong><p>'+esc(d.question)+'</p></div>'+
    fold('文献脉络与待验证假设',list(d.hypotheses)+d.literature.map(v=>'<article class="literature-note"><strong>'+citation(db.sources[v.sourceId])+'</strong><p><b>来源支持：</b>'+esc(v.finding)+'</p><p><b>本题怎么用：</b>'+esc(v.howToUse)+'</p><p class="assessment-note"><b>适用边界：</b>'+esc(v.limitation)+'</p></article>').join(''))+
    fold('对照方法与实验设计',d.baselines.map(v=>'<article class="protocol-card"><h4>'+esc(v.name)+'</h4><p>'+esc(v.implementation)+'</p><p class="assessment-note">为什么比较：'+esc(v.why)+'</p></article>').join('')+d.experiments.map((v,i)=>'<article class="protocol-card experiment"><h4>实验 '+(i+1)+' · '+esc(v.name)+'</h4><dl>'+[['variables','变量'],['controls','控制条件'],['split','划分与采样'],['metrics','记录指标'],['decision','如何判断']].map(([k,label])=>'<div><dt>'+label+'</dt><dd>'+esc(text(v[k]))+'</dd></div>').join('')+'</dl></article>').join(''),true)+
    fold('指标口径与消融实验',d.metrics.map(v=>'<article class="metric-note"><strong>'+esc(v.name)+'</strong><p>'+esc(v.definition)+'</p><small>单位：'+esc(v.unit)+' · 汇总：'+esc(v.aggregation)+'</small></article>').join('')+'<h4>逐项去掉什么，验证什么</h4>'+list(d.ablations))+
    fold('失败风险与范围收敛',list(d.pitfalls)+'<h4>停止或缩小范围的条件</h4>'+list(d.stopRules))+
    fold('复现材料与验收交付',list(d.reproducibility)+'<h4>最终交付</h4>'+list(d.deliverables))+'</section>';}
  return {renderDossier,fold};
});
