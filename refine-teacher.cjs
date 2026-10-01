// Curated primary-source research and proposed study plans; rerunnable by record ID.
const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'research-data.json');
const db=JSON.parse(fs.readFileSync(file,'utf8')),date='2026-10-01';
function source(id,title,org,url,kind,note){db.sources[id]={title,org,url,kind,checked:date,access:'已读取公开页面 / 不包含未公开的报告、代码和实验数据',note};}
source('tju-design-2026','天津大学 2026 机械产品数字化设计赛获奖报道','天津大学机械工程学院','https://me.tju.edu.cn/info/1042/53451.htm','高校获奖报道','2026-09-03 发布；设计类和数字孪生类的全国一等奖分别列示。报道不提供可复现代码。');
source('yangtze-fish-2026','长江大学 2026 机械创新设计竞赛获奖项目','长江大学','https://news.yangtzeu.edu.cn/info/1002/37952.htm','高校获奖报道','2026-07-29 发布；机械创新设计竞赛全国一等奖，包含多工序杀鱼机结构介绍。');
source('neu-fischertechnik-2026','东北大学 2026 慧鱼组竞赛获奖报道','东北大学','https://neunews.neu.edu.cn/info/1006/973321.htm','高校获奖报道','2026-04-24 发布；奖项属于慧鱼组竞赛，不能写成常规赛同一组别。');
source('wuyi-life-2026','武夷学院 2026 生命科学竞赛获奖项目名单','武夷学院','https://www.wuyiu.edu.cn/2026/0804/c701a140251/page.htm','高校获奖名单','2026-08-04 发布；表格区分科学探究类与创新创业类，未公开完整实验方案。');
source('tsu-life-2026','泰山学院 2026 生命科学竞赛获奖情况','泰山学院生物与酿酒工程学院','https://swxy.tsu.edu.cn/2026/0803/c9086a139008/page.htm','高校获奖名单','2026-08-03 发布；鱼水霉病项目为创新类省级三等奖，不能提升为国赛一等奖。');
source('hbue-survey-2026','湖北经济学院 2026 市场调查大赛本科组获奖项目','湖北经济学院','https://www.hbue.edu.cn/aa/9a/c9264a371354/page.htm','高校获奖名单','2026-06-01 发布；第十六届本科组，分别列出国家级一、二等奖题名；不是第十七届报名通知。');
source('ciesc-final-2026','第二十届全国大学生化工设计竞赛决赛与获奖名单','中国化工学会','https://www.ciesc.cn/site/content/4906.html','主办方结果公告','2026-08-20 发布；统一题目为苯乙烯清洁生产分厂设计。未公开各队独有流程细节。');
source('csust-thesis-2026','2026 届优秀毕业设计（论文）推荐公示','长沙理工大学计算机与通信工程学院','https://www.csust.edu.cn/jtxy/info/1997/29095.htm','高校毕设推荐公示','2026-06-12 发布；仅题名和推荐公示，不是最终获奖认定，不含论文正文或开源代码。');
source('cmes-calendar-2026','2026 中国大学生机械工程创新创意大赛赛事日程','中国机械工程学会','https://www.cmes.org/cmes/upload/2026/03-18/09-51-2008271591192214.pdf','主办方赛程 PDF','赛事日程只支持准备时序；具体赛道资格、提交材料、下一届日期须查对应通知。');
const groupMajors=groups=>db.majors.filter(m=>groups.includes(m.group)).map(m=>m.id);
function upsert(id,type,title,summary,groups,sourceIds,tags,sections,extra={}){const value={id,type,title,summary,groups,majors:groupMajors(groups),sourceIds,tags,sections,level:'',priority:type==='case'?8:type==='guide'?17:3,status:type==='case'?'公开获奖记录':type==='guide'?'研究组织建议':'公开研究素材',date,...extra};const i=db.records.findIndex(r=>r.id===id);if(i<0)db.records.push(value);else db.records[i]=value;}
const section=(heading,...items)=>({heading,items});
function award(id,title,summary,groups,src,facts,adapt,limits,topics){upsert(id,'case',title,summary,groups,[src],['2026','获奖选题','以赛带学'],[section('原始事实与奖项',facts),section('借鉴到自己的选题 · 调研分析',adapt),section('公开材料的边界',limits)],{relatedTopicIds:topics});}
award('case-tju-twin','天津大学：制造物流数字孪生与排程（全国一等奖）','把机械搬运、数字孪生与生产排程结合。可从小规模仿真起步，研究约束和验证。',['machines','business','math','computing'],'tju-design-2026','2026 机械产品数字化设计赛数字孪生类：智联孪生智造未来获全国一等奖。报道提到 AGV、夹爪、轨迹干涉检查及 CP-SAT 与 MES 排程。','先定义 3 台设备、2 类工件、固定工序与换型时间；对照先来先服务和 CP-SAT。逐步加入故障、运输约束，保留不可行输入与求解时间。机械负责工序限制，数学负责约束，计算机负责实验脚本。','报道没有给出数据集、源码、性能表；上述缩小方案由资料库提出，不是获奖团队原方案。',['advanced-11','topic-06','topic-33']);
award('case-tju-rescue','天津大学：水陆救援辅助机器人（全国一等奖）','针对洞潜混合地形的结构与遥控设计。入门可先做运动模式仿真和可达性验证。',['machines','computing','design'],'tju-design-2026','2026 机械产品数字化设计赛设计类：澜隧行者水陆变形式救援辅助机器人获全国一等奖，学校介绍其变形结构与水陆运动能力。','以干燥场景的双模式移动仿真作为起点，记录切换失败、路径长度、障碍距离；再由导师判断是否具备制作防水样机条件。机械设计与电子控制分别提交接口尺寸和控制状态表。','公开报道不证明救援部署资格或可靠性；本资料库未获得完整工程图、代码与测试结果。',['advanced-09','topic-30']);
award('case-yangtze-fish','长江大学：多工序自动杀鱼机（全国一等奖）','食品加工需求驱动机械设计。可拆成输送定位、单工序处理和动作配合三个研究问题。',['machines','agri'],'yangtze-fish-2026','2026 全国大学生机械创新设计大赛：侠“鲈”先锋多工序一体化自动杀鱼机获全国一等奖，报道介绍输送、去鳞、夹紧、开膛、去内脏与传动子系统。','先使用几何替代件做定位误差仿真或夹具实验；定义尺寸分布、卡滞率和重复定位误差。食品专业提出工艺需求，机械负责机构，自动化负责节拍，不直接复刻整机。','学校报道未公开整套加工图纸和原始试验数据；实体刀具与食品接触试验需纳入实验室条件评估。',['topic-06','advanced-11','topic-50']);
award('case-neu-shell','东北大学：扇贝多工位处理机（慧鱼组全国一等奖）','把农产品加工任务拆为连续工位与动作协同。强调在具体赛道条件内理解成果。',['machines','agri'],'neu-fischertechnik-2026','2026 第十二届机械创新设计大赛慧鱼组竞赛：事半功“贝”箱形扇贝多工位剥壳取柱处理机获全国一等奖。','先设计多工位动作顺序与互锁表，以标准尺寸替代件验证转运；比较串行和流水工位的节拍、等待时间。进阶再做尺寸变化下的稳定性实验。','慧鱼组模型与生产整机不同；报道未提供可用于生产的安全、卫生或长期可靠性验证。',['topic-05','topic-06']);
award('case-wuyi-tea','武夷学院：茶园间作生态机制（创新创业类全国一等奖）','区域农业问题与机制研究结合。可以借鉴“明确处理组—收集证据—分析机制”的研究组织方式。',['agri','environment'],'wuyi-life-2026','2026 第十一届生命科学竞赛创新创业类：学校名单将茶树与麦冬间作、根际代谢物及土壤微生物生态机制项目列为全国一等奖。','园艺负责提出间作或土壤变量，生物工程负责测量方法，数据专业负责样本组织和效应估计。没有实验资源时先做公开文献证据表；不能用图像分类替代原有机制研究。','题名与奖项可核验，实验数据和完整论文未公开。实施田间试验需导师确认周期、样本和检测成本。',['topic-51','advanced-21']);
award('case-tsu-fish','泰山学院：鱼水霉病病原研究（省级三等奖）','动物医学和生物工程的真实研究题名参考：病原鉴定与生物学特性，不把行为识别等同于疾病诊断。',['agri'],'tsu-life-2026','2026 生命科学竞赛创新创业类名单中，泰山螭霖鱼水霉病病原菌鉴定与生物学特性研究获创新类省级三等奖。','先做病原检测方法与样本条件的文献矩阵；行为监测方向可研究异常提示与观察记录的一致性。动物医学负责定义诊断边界，电子负责采集，计算机负责跨个体验证。','题名并不提供菌株、培养方法与实验数据。疾病诊断和病原实验不能由通用传感器模型替代。',['topic-54','advanced-20']);
award('case-hbue-toy','湖北经济学院：潮玩消费机制（本科组全国一等奖）','围绕具体商品、具体人群与消费机制形成调查问题，适合营销、工商、统计和设计协作。',['business','math','design'],'hbue-survey-2026','2026 第十六届市场调查与分析大赛本科组，学校将基于 Labubu 的 Z 世代潮玩消费机制研究列为国家级一等奖。','换成能接触到的校园产品：明确目标人群、抽样框、量表和预期混杂因素，先访谈再小规模预测试；用留出样本比较模型，输出可执行的产品信息改进方案。','公开名单提供题名与奖项，没有问卷、原始数据和统计结果。不能推定报道使用过某一种模型。',['topic-45','advanced-25','advanced-26']);
award('case-chemical-2026','2026 化工设计：苯乙烯清洁生产分厂（主办方特等奖名单）','全流程设计竞赛的真实题目与获奖结果入口，适合将物料衡算、流程模拟、节能和经济评价分工。',['environment','materials','business'],'ciesc-final-2026','主办方公布第二十届竞赛统一题目为苯乙烯清洁生产分厂设计；结果名单中浙江大学获冠军，华东理工大学、南京工业大学分列亚军和季军。','起步限定一条工艺路线与一个工况，核对物料衡算和参数来源；进阶比较两种热回收方案及成本敏感性。化工负责流程，环境负责排放边界，管理负责经济假设。','名单并未公开获奖队的独有工艺、模拟文件或报价；这些细节不能由奖项推断。此届已结束，下一届题目另查通知。',['topic-16','advanced-18']);
upsert('material-thesis-csust','resource','公开毕设题名：嵌入式、网络安全与分子建模','长沙理工大学 2026 届优秀毕设推荐公示，供比较题目边界和技术组合；仅有题名，不含论文正文。',['computing','circuits','medicine'],['csust-thesis-2026'],['毕设素材','推荐公示','STM32','网络流量','药物靶点'],[section('公开题名可以说明什么','公示涉及 STM32 辅助出行与家居、网络流量恶意行为检测、蛋白结构和分子图联合预测等方向。这里概括题目主题，完整题名请查原始公示。','题名能展示任务、对象和技术组合；不能证明系统功能、实验精度、最终获奖或可获取代码。'),section('怎样转成自己的选题','先选择一个可测试的子问题，例如通信断连后的恢复、按会话划分的误报率、按分子骨架划分的泛化；查官方工具或数据来源，再请导师确认范围。','检索式：STM32 语音 辅助出行 毕业设计；network traffic anomaly group split；protein structure molecular graph prediction。'),section('图书馆补充资料','用学校图书馆订购平台查“对象 + 方法 + 验证”的学位论文和综述，记录作者、年份、DOI、摘要与访问条件。推荐公示不是论文全文下载入口。')],{relatedTopicIds:['topic-22','topic-23','advanced-23']});
upsert('material-cmes-calendar','resource','机械竞赛准备：主办方赛程与赛道确认','官方 2026 赛事日程可作为团队筹备线索；资格、题目、提交文件和下一届安排需要对应赛道的通知。',['machines','design','materials'],['cmes-calendar-2026'],['竞赛准备','赛程','团队分工'],[section('先确认自己参加哪一项','不要把机械创新设计、机械产品数字化设计、慧鱼组、金相技能和毕业设计相关竞赛当作同一赛道。先查赛事全称、主办单位、当前届次与赛道。'),section('建立准备清单','记录校内选拔负责人、是否跨校组队、设备与软件条件、赛程及文件格式。信息未确认时标记“待确认”，不要按往届日期自动外推。','同一项目可积累不同成果，但能否同时投稿、是否有知识产权或重复参赛限制，需要按各赛道规则核对。')]);
upsert('guide-team-research','guide','以赛带学：选题、证据与跨专业协作','先研究获奖题目与规则，再把方向缩成可验证的项目；用统一材料包与分工形成持续学习路线。',db.groups.map(g=>g.id),['ciciec','mechanical','life','survey-new','csust-thesis-2026'],['跨专业协作','以赛带学','毕设素材','团队材料包'],[section('先交一份能讨论的材料','每个候选方向用一页说明：真实问题、目标使用者、公开依据、可用数据或设备、最小原型、对照方法、验证指标、难度和待导师确认事项。避免只提交链接列表。'),section('三个候选方向怎样比较','分别给“纯仿真/公开数据”“现有硬件原型”“导师平台项目”各一个方向。用先修基础、资源成本、数据可得性、验证可行性和跨专业接口比较，选定一个起步方向。'),section('团队如何组织','每队先设需求/领域负责人、实现负责人、验证与资料负责人；可以一人兼任，不能无人负责原始来源和实验记录。每周短会只讨论新增证据、失败点和下周交付。','汇总材料应包含来源表、选题对照表、可运行最小实验、对照结果、失败样例、分工与里程碑。图书馆文献仅分享可合法访问的链接和笔记。'),section('竞赛和毕设共用什么','规格、代码版本、数据字典、实验日志和来源表可以持续积累；竞赛侧按当届规则准备展示，毕设侧按学院要求解释方法、对照与结论。题目先经导师沟通，不能把竞赛宣传写成论文结论。')]);
const plans={
 circuits:{contests:['contest-ic','contest-soc','contest-electronic'],cases:['case-riscv','case-tensor','case-fzu-analog'],roles:[['m21','RTL、接口或电路模型','规格、仿真波形与版本化实现'],['m16','自动化验证与数据处理','可复现脚本、测试集和失败样例']],en:'digital circuit verification benchmark'},
 computing:{contests:['contest-soc','contest-ai'],cases:['case-vision'],roles:[['m16','算法与软件实现','可运行基线和固定测试接口'],['m33','数据划分与评价','对象级划分、指标置信区间和错误分析']],en:'software system evaluation reproducibility'},
 machines:{contests:['contest-mech','contest-electronic'],cases:['case-tju-twin','case-tju-rescue','case-neu-shell'],roles:[['m02','机构或控制对象建模','接口尺寸、动力学假设和工况表'],['m05','控制实现与系统联调','状态机、仿真日志和故障场景']],en:'mechanical system simulation validation'},
 materials:{contests:['contest-meta','contest-math'],cases:[],roles:[['m08','材料机理与参数核对','参数来源、单位和适用条件'],['m33','建模与统计验证','按材料族划分的对照和敏感性分析']],en:'materials property prediction uncertainty'},
 civil:{contests:['contest-structure','contest-math'],cases:['case-fosu-structure'],roles:[['m06','结构或空间场景定义','边界条件、加载或地图假设'],['m33','优化与误差分析','收敛检查、对照场景和敏感性结果']],en:'civil engineering simulation sensitivity validation'},
 environment:{contests:['contest-chem','contest-math'],cases:['case-chemical-2026'],roles:[['m12','流程和质量守恒','物料衡算表、参数出处和流程图'],['m14','环境边界与评价','排放假设、功能单位和比较条件']],en:'environmental process modelling mass balance'},
 agri:{contests:['contest-life','contest-math'],cases:['case-wuyi-tea','case-tsu-fish'],roles:[['m53','生物/动物任务和标签定义','观察标准、个体信息和文献证据'],['m16','数据处理与模型评价','跨个体划分、基线和错误分析']],en:'agriculture biological data validation'},
 medicine:{contests:['contest-life','contest-math'],cases:[],roles:[['m57','领域定义和适用边界','变量含义、质控规则和排除条件'],['m33','模型与统计评价','独立测试集、误报漏报和局限记录']],en:'biomedical data validation quality control'},
 business:{contests:['contest-survey','contest-math'],cases:['case-hbue-toy'],roles:[['m44','需求访谈与调查设计','抽样框、问题表和预测试记录'],['m33','统计与证据审查','缺失处理、模型诊断和解释边界']],en:'survey sampling consumer behavior reproducibility'},
 human:{contests:['contest-english','contest-survey'],cases:[],roles:[['m34','任务或文本编码','编码手册、样本范围和版本记录'],['m33','评价设计与分析','一致性检验、预注册和效果估计']],en:'education text analysis research evaluation'},
 design:{contests:['contest-ad','contest-mech'],cases:['case-hbue-toy','case-tju-rescue'],roles:[['m31','原型和操作任务','可测试原型、任务步骤和设计依据'],['m16','交互实现与可用性测量','操作日志、键盘测试和任务指标']],en:'product design usability evaluation'},
 math:{contests:['contest-math','contest-survey'],cases:['case-tju-twin','case-hbue-toy'],roles:[['m33','模型和验证协议','变量表、训练测试划分和基线'],['m47','实际约束与结果解释','场景假设、约束检查和业务误差成本']],en:'optimization statistical model validation'}
};
for(const r of db.records.filter(r=>r.type==='topic')){
 // Prefer the topic's first actual major over its broad technology tag.
 const primary=r.id.startsWith('ic')?'circuits':r.groups.find(g=>['agri','medicine','civil','environment','business','human','design','materials','machines'].includes(g))||r.groups[0],p=plans[primary];
 const animal=/牛|动物/.test(r.title),digital=/FIFO|RISC|点积|矩阵|DMA|数字 IP|PWM/.test(r.title),analog=/运放|ADC/.test(r.title);
 let cases=p.cases,contests=p.contests,roles=p.roles,english=p.en;
 if(animal){cases=['case-tsu-fish'];contests=['contest-life','contest-soc'];roles=[['m53','行为类别、观察标准与误判意义','跨个体标签规则和文献证据'],['m21','采集与端侧资源预算','采样接口、量化误差和存储/延迟报告'],['m16','跨个体模型评价','按动物划分的数据集和错误样例']];}
 else if(digital){cases=['case-riscv','case-tensor'];contests=['contest-ic'];roles=plans.circuits.roles;english=plans.circuits.en;}
 else if(analog){cases=['case-fzu-analog'];contests=['contest-ic','contest-electronic'];roles=[['m21','电路模型、仿真条件与参数','电路规格、工况和可复现仿真文件'],['m16','自动化扫参与结果分析','参数脚本、误差表和边界工况报告']];english='analog circuit simulation corner analysis';}
 else if(primary==='computing'){cases=/尺寸|视觉/.test(r.title)?['case-vision']:/活动/.test(r.title)?['case-wearable']:[];}
 else if(primary==='civil'){cases=/结构|竹材/.test(r.title)?['case-fosu-structure']:[];}
 else if(primary==='agri'){cases=/叶|园艺|生物序列/.test(r.title)?['case-wuyi-tea']:[];}
 else if(primary==='business'){cases=/购买|采用|调查|旅游|文旅/.test(r.title)?['case-hbue-toy']:[];}
 else if(primary==='design'){cases=/外壳/.test(r.title)?['case-tju-rescue']:[];}
 else if(primary==='math'){cases=/排程|优化/.test(r.title)?['case-tju-twin']:[];}
 else if(primary==='machines'){cases=/路径/.test(r.title)?['case-tju-rescue']:/排程|产线/.test(r.title)?['case-tju-twin']:[];}
 if(primary==='business'&&/宏观|披露|贸易|纵向/.test(r.title))roles=[['m43','指标口径、背景与结果解释','变量字典、公开资料出处与适用范围'],['m33','时序划分与统计检验','时间留出、稳健性对照与解释边界']];
 if(!animal){roles=roles.map(v=>[v[0],v[1],v[2]]);roles[0][0]=(digital||analog?r.majors.find(id=>db.majors.find(m=>m.id===id)?.group==='circuits'):r.majors.find(id=>db.majors.find(m=>m.id===id)?.group===primary))||roles[0][0];}
 const resourceIds=db.records.filter(v=>v.type==='resource'&&v.sourceIds.some(id=>r.sourceIds.includes(id))).map(v=>v.id);
 if(!resourceIds.length){const fallback=analog?'resource-v2-ngspice':primary==='civil'?'resource-scipy':primary==='circuits'?'resource-cocotb':'resource-smartedu';resourceIds.push(fallback);const rr=db.records.find(v=>v.id===fallback);r.sourceIds=[...new Set([...r.sourceIds,...rr.sourceIds])];}
 if(['computing','circuits','medicine'].includes(primary))resourceIds.push('material-thesis-csust');
 r.researchBridge={contestIds:contests,caseIds:cases,resourceIds:[...new Set(resourceIds)],
  contestNote:'候选学习渠道，并非已经确认可报的赛题。先查当届题目、校内选拔、团队资格与重复参赛限制；匹配后再调整范围。',
  caseNote:cases.length?(animal?'借鉴领域问题与证据边界；病原研究与行为监测是不同任务，不能把异常提示当作疾病诊断。':'借鉴需求拆分、验证或协作方法；关联案例不代表本题已获奖，也不保证同赛道可直接参赛。'):'尚未收录与本题足够接近的获奖题名；先查候选竞赛的官方结果与题目，再补充证据，避免用不相关案例凑数。',
  roles:roles.map(([id,role,deliverable])=>({majorIds:[id],role,deliverable})),
  milestones:[`第 1–3 天：将“${r.title}”收敛成一个可测问题，列出输入、输出、适用边界和 3 个待确认假设。`,`第 4–7 天：${r.difficultyProfile.minimum.replace(/[。；.!?]+$/,'')}。优先完成基线与一个可运行样例，锁定软件版本、参数和样本来源。`,'第 8–10 天：设置至少一个合理对照，加入边界或失败样例；记录任务指标及时间、内存、成本等适用资源指标。','第 11–14 天：汇总一页选题表、来源清单、最小原型与初步结果；由团队和导师决定继续、缩题或更换方向。这是预研计划，不保证两周完成整项毕设。'],
  mentorQuestions:[`当前 ${r.difficulty} 范围是否符合本专业培养与毕设要求，应该删掉哪一项扩展？`,`能否取得这些资源：${r.difficultyProfile.resources.join('；')}？由谁负责，最迟何时确认？`,'对照方法、评价单位和最低交付是什么？数据许可、实验条件和团队知识产权有什么要求？'],
  librarySearch:[`${r.title} 综述 毕业设计`,`${(r.tags||[]).slice(0,2).join(' ')} ${digital||analog?'仿真 测试 平台':primary==='human'||primary==='design'||primary==='business'?'文献 评价 方法':'数据集 实验 对照'}`,english+' '+(r.tags||[]).filter(t=>/[a-z]/i.test(t)).slice(0,2).join(' ')]};
}
db.researchMethod={version:'2.0',assessed:date,note:'选题与协作路线由资料库分析提出；原始案例和题名单独列证据。关联入口不等于报名资格，跨专业分工需团队和导师确认。'};
fs.writeFileSync(file,JSON.stringify(db,null,2)+'\n');
console.log(JSON.stringify({records:db.records.length,sources:Object.keys(db.sources).length,bridges:db.records.filter(r=>r.researchBridge).length}));
