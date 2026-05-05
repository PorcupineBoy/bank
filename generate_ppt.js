const pptxgen = require("pptxgenjs");
const fs = require("fs");

// ============================================================
// 样式常量（匹配原PPT风格）
// ============================================================
const COLORS = {
  darkBlue: "1A3A5C",     // 封面深蓝背景
  primaryBlue: "1A5276",  // 主要蓝色
  accentBlue: "4A90E2",   // 强调蓝
  lightBlue: "5DADE2",    // 浅蓝
  white: "FFFFFF",
  titleGray: "2C3E50",    // 标题深灰
  bodyGray: "34495E",     // 正文深灰
  subtitleGray: "7F8C8D", // 副标题灰
  lightBg: "EBF5FB",      // 浅蓝背景
  highlight: "E74C3C",    // 强调红
  green: "27AE60",        // 绿色
  orange: "E67E22",       // 橙色
  divider: "4A90E2",      // 分隔线蓝
  cardBg: "F8FAFC",       // 卡片背景
  borderGray: "D5D8DC",   // 边框灰
  badgeGray: "E8E8E8",    // 标签灰
};

const FONTS = {
  title: "Arial",
  body: "Arial",
  cn: "Microsoft YaHei",  // 中文字体
};

// ============================================================
// 辅助函数
// ============================================================
function hexToRGB(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

// ============================================================
// 生成器
// ============================================================
async function generatePPT() {
  const pptx = new pptxgen();

  // 页面设置：宽屏 13.33 x 7.5
  pptx.layout = "LAYOUT_WIDE";
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";

  // ============================================================
  // SLIDE 1: 封面
  // ============================================================
  const slide1 = pptx.addSlide();
  // 深蓝背景
  slide1.background = { color: COLORS.darkBlue };

  // 顶部装饰线
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 主标题
  slide1.addText("AI原生研发赋能", {
    x: 0.8, y: 1.8, w: 11.73, h: 1.0,
    fontSize: 44, fontFace: FONTS.title, color: COLORS.white, bold: true,
    align: "center", valign: "middle",
  });
  slide1.addText("手机银行核心业务", {
    x: 0.8, y: 2.7, w: 11.73, h: 0.9,
    fontSize: 40, fontFace: FONTS.title, color: COLORS.white, bold: true,
    align: "center", valign: "middle",
  });

  // 分隔线
  slide1.addShape(pptx.ShapeType.rect, {
    x: 4.5, y: 3.8, w: 4.33, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 副标题
  slide1.addText("基于 MCP-Skill 架构的智能银行系统", {
    x: 0.8, y: 4.1, w: 11.73, h: 0.6,
    fontSize: 18, fontFace: FONTS.body, color: "AABBCC",
    align: "center", valign: "middle",
  });

  // 底部信息
  slide1.addText("手机银行核心业务系统 · 项目展示", {
    x: 0.8, y: 5.6, w: 11.73, h: 0.5,
    fontSize: 14, fontFace: FONTS.body, color: "8899AA",
    align: "center", valign: "middle",
  });

  // Speaker Notes
  slide1.addNotes(`【开场白，1分钟】
各位评委老师好！今天我为大家带来的项目是"AI原生研发赋能·手机银行核心业务"。

这个项目的核心思想是：利用AI技术贯穿整个研发周期，构建一套安全、完整的手机银行系统。
我们不仅用AI来写代码，更用AI来设计架构、治理文档、保障安全。

接下来，我会从项目目标、背景需求、AI研发过程、创新点与难点、成果与收获几个方面为大家做介绍。`);

  // ============================================================
  // SLIDE 2: 目录
  // ============================================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLORS.white };

  // 顶部蓝色条
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide2.addText("目  录", {
    x: 0.8, y: 0.4, w: 4, h: 0.8,
    fontSize: 32, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
    align: "left", valign: "middle",
  });
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.1, w: 1.5, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  const tocItems = [
    { num: "01", title: "项目目标", desc: "公司战略视角：场景验证·能力沉淀·价值探索", color: COLORS.accentBlue },
    { num: "02", title: "背景与需求", desc: "行业痛点、竞赛要求与功能需求", color: COLORS.green },
    { num: "03", title: "AI 研发过程", desc: "AI原生研发全流程、技术架构与MCP-Skill创新", color: COLORS.orange },
    { num: "04", title: "创新点与难点", desc: "真实困难：意图识别·代码校验·前后端集成", color: "8E44AD" },
    { num: "05", title: "成果与收获", desc: "项目成果、个人成长与可复用打法", color: COLORS.highlight },
    { num: "06", title: "总结与展望", desc: "AI研发的认知升级与推广建议", color: COLORS.primaryBlue },
  ];

  tocItems.forEach((item, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 0.8 + col * 6.2;
    const y = 1.6 + row * 1.8;

    // 数字圈
    slide2.addShape(pptx.ShapeType.ellipse, {
      x: x, y: y + 0.1, w: 0.6, h: 0.6,
      fill: { color: item.color },
    });
    slide2.addText(item.num, {
      x: x, y: y + 0.1, w: 0.6, h: 0.6,
      fontSize: 16, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });

    // 标题
    slide2.addText(item.title, {
      x: x + 0.8, y: y, w: 4.8, h: 0.45,
      fontSize: 20, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "left", valign: "middle",
    });

    // 描述
    slide2.addText(item.desc, {
      x: x + 0.8, y: y + 0.45, w: 4.8, h: 0.4,
      fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
      align: "left", valign: "top",
    });

    // 分隔线
    if (col === 0) {
      slide2.addShape(pptx.ShapeType.rect, {
        x: x + 0.8, y: y + 0.95, w: 5.2, h: 0.01, fill: { color: COLORS.borderGray },
      });
    }
  });

  slide2.addNotes(`【目录，0.5分钟】
本次汇报分六个部分：

第一，项目目标——从公司战略视角，定位这个项目的核心目标是什么；
第二，背景与需求——以手机银行为场景载体的原因和竞赛要求；
第三，AI研发过程——AI如何贯穿每一个环节，以及我们沉淀的技术架构；
第四，创新点与难点——真实遇到的困难和我们的解决方案；
第五，成果与收获——不仅是项目数据，更是个人和团队的认知升级；
最后是总结与展望。

整个汇报大约15分钟，下面我们进入第一部分。`);

 // ============================================================
  // SLIDE 3: 项目目标
  // ============================================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLORS.white };

  // 顶部蓝色条
  slide3.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide3.addText("项目目标", {
    x: 0.8, y: 0.3, w: 4, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
    align: "left", valign: "middle",
  });
  slide3.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 0.95, w: 1.2, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 核心定位说明
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.3, w: 11.73, h: 0.85,
    fill: { color: COLORS.lightBg },
    cornerRadius: 0.15,
    line: { color: COLORS.accentBlue, width: 0.5 },
  });
  slide3.addText(`项目定位：以手机银行为场景载体，完整经历AI原生研发全流程，验证可复用、可推广的AI研发打法`, {
    x: 1.2, y: 1.3, w: 10.93, h: 0.85,
    fontSize: 15, fontFace: FONTS.body, color: COLORS.primaryBlue, bold: true,
    align: "center", valign: "middle",
  });

  // 四个战略目标
  const goals = [
    { icon: "🎯", title: "场景验证——跑通全流程", desc: "以手机银行业务为真实场景，从需求分析→架构设计→编码→测试→文档→部署，完整走完AI原生研发的全生命周期，验证各环节的可行性与效率提升" },
    { icon: "🧩", title: "能力沉淀——形成可复用架构", desc: "通过MCP-Skill架构的设计与落地，验证AI能力的标准化封装、动态注册、安全分级机制是否具备跨场景复用的条件，形成可推广的技术组件" },
    { icon: "💡", title: "价值探索——评估落地可行性", desc: "在消费分析、意图识别、结构化卡片交互等AI功能中，评估哪些具备实际业务落地价值，哪些仍需优化——为公司AI投入提供决策依据" },
    { icon: "📋", title: "组织赋能——沉淀研发打法", desc: "总结AI原生研发中的经验与教训，形成提示词工程规范、AI代码校验流程、文档治理标准——让下一支团队可以复用这套方法论" },
  ];

  goals.forEach((g, i) => {
    const x = 0.8 + (i % 2) * 6.0;
    const y = 2.5 + Math.floor(i / 2) * 2.2;

    // 卡片背景
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 5.7, h: 1.95,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.12,
      line: { color: COLORS.borderGray, width: 0.5 },
    });

    // 图标
    slide3.addText(g.icon, {
      x: x + 0.3, y: y + 0.2, w: 0.6, h: 0.6,
      fontSize: 28, align: "center", valign: "middle",
    });

    // 标题
    slide3.addText(g.title, {
      x: x + 1.1, y: y + 0.15, w: 4.2, h: 0.45,
      fontSize: 15, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "left", valign: "middle",
    });

    // 描述
    slide3.addText(g.desc, {
      x: x + 1.1, y: y + 0.6, w: 4.2, h: 1.15,
      fontSize: 11, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "top",
      lineSpacingMultiple: 1.3,
    });
  });

  slide3.addNotes(`【项目目标，2分钟】
这个项目我给自己定了四个目标，它不是从产品需求出发，而是从公司战略视角出发：

第一，场景验证。手机银行只是载体，我的真实目的是完整走一遍AI原生研发全流程，验证每个环节能不能跑通，效率提升多少——这是我们判断AI研发是否可行的第一步。

第二，能力沉淀。光跑通不够，还要看沉淀下来的东西能不能复用。MCP-Skill架构就是我设计的标准化AI能力框架——如果它在这个场景能用，换一个场景应该也能用。

第三，价值探索。消费分析、意图识别这些AI功能，到底哪些是真的有价值的，哪些还只是噱头。我需要给公司一个真实的评估。

第四，组织赋能。最终要沉淀出一套打法——提示词怎么写、AI代码怎么校验、文档怎么管——让后面的人不用从头再来。

这四个目标层层递进，从"能不能做"到"能不能推广"。`);

  // ============================================================
  // SLIDE 4: 背景与需求
  // ============================================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: COLORS.white };

  slide4.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide4.addText("背景与需求", {
    x: 0.8, y: 0.3, w: 4, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide4.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 0.95, w: 1.2, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 左侧：行业痛点
  slide4.addText("行业痛点", {
    x: 0.8, y: 1.3, w: 3, h: 0.4,
    fontSize: 16, fontFace: FONTS.title, color: COLORS.primaryBlue, bold: true,
  });

  const pains = [
    "信息孤岛，系统间数据难以打通",
    "响应滞后，人工处理时效性差",
    "重复劳动，80%咨询为标准化问题",
    "风险识别不及时，事后补救成本高",
    "人力成本刚性上升，效率瓶颈突出",
  ];
  pains.forEach((p, i) => {
    slide4.addText(`• ${p}`, {
      x: 1.0, y: 1.8 + i * 0.4, w: 5.2, h: 0.35,
      fontSize: 11, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "middle",
    });
  });

  // 右侧：竞赛需求
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.2, w: 5.73, h: 5.5,
    fill: { color: COLORS.lightBg },
    cornerRadius: 0.15,
    line: { color: COLORS.borderGray, width: 0.5 },
  });
  slide4.addText("竞赛需求：手机银行核心业务", {
    x: 7.1, y: 1.35, w: 5.2, h: 0.4,
    fontSize: 14, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });

  const modules = [
    { icon: "🔐", title: "账户与登录", items: "注册 / 密码登录 / 短信验证码登录\n会话管理 / 单设备控制 / 密码找回" },
    { icon: "💳", title: "银行卡管理", items: "四要素验证绑卡 / 解绑\n默认卡设置 / 余额查询" },
    { icon: "💰", title: "交易与查询", items: "转账汇款 / 生活缴费\n账单查询 / 常用收款方管理" },
    { icon: "🛡️", title: "基础安全", items: "交易密码 / 限额控制\n风险提示 / 二次确认 / 操作日志" },
  ];

  modules.forEach((m, i) => {
    const y = 1.9 + i * 1.2;
    slide4.addText(m.icon, {
      x: 7.3, y: y, w: 0.5, h: 0.5,
      fontSize: 22, align: "center", valign: "middle",
    });
    slide4.addText(m.title, {
      x: 7.8, y: y, w: 2, h: 0.5,
      fontSize: 13, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "left", valign: "middle",
    });
    slide4.addText(m.items, {
      x: 7.8, y: y + 0.45, w: 4.4, h: 0.6,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "top",
      lineSpacingMultiple: 1.2,
    });
  });

  slide4.addNotes(`【背景与需求，1.5分钟】
先看行业背景。当前银行系统面临五大痛点：信息孤岛、响应滞后、重复劳动、风险识别不及时、人力成本刚性上升。

这也正是我们做这个项目的驱动力。

竞赛需求方面，要求构建一套简易手机银行核心业务系统，涵盖四大模块：

第一，账户与登录——注册、密码登录、验证码登录，以及会话管理和单设备控制；
第二，银行卡管理——重点是绑卡时的四要素验证；
第三，交易与查询——转账、缴费、账单查询，这是最核心的业务流；
第四，基础安全——交易密码、限额控制、风险提示和操作日志。

每个模块背后都有严格的金融安全要求，这决定了我们后续的技术选型和架构设计。`);

  // ============================================================
  // SLIDE 5: AI原生研发全流程
  // ============================================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: COLORS.white };

  slide5.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide5.addText("AI原生研发全流程", {
    x: 0.8, y: 0.3, w: 5, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide5.addText("从需求分析到部署运维，AI深度参与研发的每一个环节", {
    x: 5.5, y: 0.4, w: 7.03, h: 0.5,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
    align: "right", valign: "middle",
  });
  slide5.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 0.95, w: 1.2, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 流程卡片 - 用圆形流程展示
  const stages = [
    { num: "1", title: "需求分析", items: "AI辅助解析PRD\n梳理业务规则与约束\n产出技术方案文档", color: COLORS.accentBlue },
    { num: "2", title: "架构设计", items: "AI驱动架构决策\n定义MCP-Skill规范\n设计安全防护体系", color: COLORS.green },
    { num: "3", title: "编码实现", items: "AI生成核心业务代码\n后端Service+Controller\n前端Vue组件+API层", color: COLORS.orange },
    { num: "4", title: "测试验证", items: "AI辅助编写单元测试\n接口自动化校验\n业务流程端到端验证", color: "8E44AD" },
    { num: "5", title: "文档治理", items: "AI撰写7份专业文档\n版本化修订管控\n交叉引用一致性", color: COLORS.highlight },
    { num: "6", title: "部署交付", items: "Docker容器化打包\nDocker Compose编排\n配置外部化+环境隔离", color: COLORS.primaryBlue },
  ];

  // 顶部流程线
  slide5.addShape(pptx.ShapeType.rect, {
    x: 1.3, y: 1.5, w: 11.2, h: 0.04, fill: { color: COLORS.borderGray },
  });

  stages.forEach((s, i) => {
    const x = 0.7 + i * 2.1;

    // 数字圆
    slide5.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.6, y: 1.2, w: 0.65, h: 0.65,
      fill: { color: s.color },
    });
    slide5.addText(s.num, {
      x: x + 0.6, y: 1.2, w: 0.65, h: 0.65,
      fontSize: 22, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });

    // 标题
    slide5.addText(s.title, {
      x: x, y: 2.0, w: 1.85, h: 0.4,
      fontSize: 14, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "center", valign: "middle",
    });

    // 内容卡片
    slide5.addShape(pptx.ShapeType.roundRect, {
      x: x, y: 2.5, w: 1.85, h: 1.6,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.1,
      line: { color: COLORS.borderGray, width: 0.3 },
    });
    slide5.addText(s.items, {
      x: x + 0.1, y: 2.6, w: 1.65, h: 1.4,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "center", valign: "middle",
      lineSpacingMultiple: 1.4,
    });
  });

  // 底部AI贯穿标注
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 3.5, y: 4.5, w: 6.33, h: 0.55,
    fill: { color: COLORS.lightBg },
    cornerRadius: 0.1,
    line: { color: COLORS.accentBlue, width: 0.5, dashType: "dash" },
  });
  slide5.addText("AI  协  同  贯  穿", {
    x: 3.5, y: 4.5, w: 6.33, h: 0.55,
    fontSize: 14, fontFace: FONTS.body, color: COLORS.accentBlue, bold: true,
    align: "center", valign: "middle",
    letterSpacing: 6,
  });

  // AI参与度指标
  slide5.addText("AI参与度覆盖研发全生命周期  |  代码AI生成率 ≥70%  |  文档AI撰写率 100%", {
    x: 0.8, y: 5.4, w: 11.73, h: 0.4,
    fontSize: 11, fontFace: FONTS.body, color: COLORS.subtitleGray,
    align: "center", valign: "middle",
  });

  // 底部装饰
  slide5.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.9, w: 13.33, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  slide5.addNotes(`【AI研发过程，2分钟】
这是我们项目最大的亮点——AI原生研发。

我们把它定义为六个环节，环环相扣：

第一，需求分析阶段——AI辅助解析PRD文档，自动梳理业务规则，产出技术方案文档；
第二，架构设计阶段——AI辅助我们设计了核心的MCP-Skill架构和安全防护体系；
第三，编码实现阶段——AI生成了70%以上的核心代码，从后端Service到前端Vue组件；
第四，测试验证阶段——AI辅助编写JUnit单元测试和接口校验；
第五，文档治理阶段——AI撰写7份专业文档并保持版本一致性和交叉引用；
第六，部署交付阶段——Docker容器化、环境隔离，一键部署。

AI不是替代人，而是作为强大辅助，让我们聚焦在架构设计和业务逻辑这些真正创造价值的事情上。
整个生命周期中，AI代码生成率超过70%，文档全部由AI参与撰写。`);

  // ============================================================
  // SLIDE 6: 系统技术架构总览
  // ============================================================
  const slide6 = pptx.addSlide();
  slide6.background = { color: COLORS.white };

  slide6.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide6.addText("系统技术架构总览", {
    x: 0.8, y: 0.3, w: 5, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide6.addText("Spring Boot 2.7 + Vue 2 + MySQL 8.0 + Redis 7.x", {
    x: 5.5, y: 0.4, w: 7.03, h: 0.5,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
    align: "right", valign: "middle",
  });
  slide6.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 0.95, w: 1.2, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 六层架构 - 从底向上
  const layers = [
    { label: "⑥ 客户端层", title: "Vue 2 + Vant 2（移动端H5）", desc: "路由懒加载 · 组件按需加载 · Axios拦截器 · Vant UI组件库", color: "8E44AD" },
    { label: "⑤ 接入层", title: "Nginx + Spring Boot Controller", desc: "统一JSON响应 · JWT令牌校验 · ReqBasic请求基类 · 全局异常处理", color: COLORS.accentBlue },
    { label: "④ AI推理层", title: "AiChatService（MCP-Skill 意图引擎）", desc: "意图识别（关键词+正则）· 参数提取 · McpGateway路由调用", color: COLORS.orange },
    { label: "③ 业务服务层", title: "6大核心Service（P0需求全覆盖）", desc: "AuthService · BankCardService · TransactionService · SecurityService · UserService · AiChatService", color: COLORS.green },
    { label: "② 数据持久层", title: "MyBatis-Plus + MySQL + Redis", desc: "参数化查询 · 敏感数据AES-256加密 · Redis会话缓存 · 原子计数防重放", color: COLORS.primaryBlue },
    { label: "① 基础设施层", title: "Docker + Docker Compose", desc: "MySQL 8.0容器 · Redis 7.x容器 · 数据卷持久化 · AOF持久化", color: COLORS.titleGray },
  ];

  layers.forEach((layer, i) => {
    const y = 1.2 + i * 0.95;

    // 层背景
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 0.6, y: y, w: 12.13, h: 0.8,
      fill: { color: layer.color },
      cornerRadius: 0.08,
    });

    // 左标签
    slide6.addText(layer.label, {
      x: 0.8, y: y, w: 1.6, h: 0.8,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "left", valign: "middle",
    });

    // 中标题
    slide6.addText(layer.title, {
      x: 2.5, y: y, w: 4.5, h: 0.5,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "left", valign: "middle",
    });

    // 下描述
    slide6.addText(layer.desc, {
      x: 2.5, y: y + 0.4, w: 7.5, h: 0.4,
      fontSize: 9, fontFace: FONTS.body, color: "E8E8E8",
      align: "left", valign: "top",
    });

    // 右侧技术标签
    if (i === 0) {
      slide6.addText("Docker", {
        x: 10.5, y: y + 0.15, w: 1.8, h: 0.5,
        fontSize: 10, fontFace: FONTS.body, color: COLORS.white,
        align: "center", valign: "middle",
      });
    }
  });

  slide6.addNotes(`【技术架构，1.5分钟】
这是我们的六层技术架构，从下往上看：

第一层，基础设施——MySQL和Redis全部容器化，Docker Compose一键启动；
第二层，数据持久层——MyBatis-Plus操作数据库，Redis做会话缓存和防重放，敏感字段AES-256加密；
第三层，业务服务层——6大核心Service，Auth、BankCard、Transaction、Security、User、AiChat，P0需求全覆盖；
第四层，AI推理层——这是最核心的创新，AiChatService作为MCP-Skill意图引擎，做意图识别和路由调用；
第五层，接入层——Nginx反向代理，JWT统一校验，全局异常处理；
第六层，客户端层——Vue 2 + Vant 2适配移动端，组件按需加载。

整体是经典的分层架构，但AI推理层的引入是我们的特色。`);

  // ============================================================
  // SLIDE 7: 核心创新：MCP-Skill 架构
  // ============================================================
  const slide7 = pptx.addSlide();
  slide7.background = { color: COLORS.white };

  slide7.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide7.addText("核心创新：MCP-Skill 架构", {
    x: 0.8, y: 0.3, w: 6, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide7.addText(`大模型只负责"理解与推理"，实际业务操作通过 Skill 委托给后端 API 执行`, {
    x: 0.8, y: 0.9, w: 11.73, h: 0.4,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
    align: "left", valign: "middle",
  });
  slide7.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.3, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  // 六大特性 - 2行3列
  const features = [
    { num: "01", title: "标准化接口", desc: "McpSkill接口定义统一契约\n• getMeta() 暴露元数据\n• execute() 执行业务逻辑", color: COLORS.accentBlue },
    { num: "02", title: "动态注册机制", desc: "@Component自动扫描注册\n• ConcurrentHashMap热插拔\n• 新增Skill零代码侵入", color: COLORS.green },
    { num: "03", title: "安全分级控制", desc: "QUERY级：查询类直接返回\n• OPERATION级：两阶段确认\n• 资金操作必须跳转密码页", color: COLORS.orange },
    { num: "04", title: "结构化返回", desc: "SkillResult = 回复文本\n• + 结构化数据(前端卡片渲染)\n• + 动作导航(跳转/确认)", color: "8E44AD" },
    { num: "05", title: "LLM无关设计", desc: "当前关键词匹配→未来可切LLM\n• MCP网关和Skill层无需改动\n• 渐进式智能升级路径", color: COLORS.highlight },
    { num: "06", title: "可扩展生态", desc: "新增能力仅需三步：\n① 新建类 ② 实现McpSkill接口\n③ @Component注解", color: COLORS.primaryBlue },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 4.2;
    const y = 1.5 + row * 2.7;

    // 卡片
    slide7.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 2.4,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.12,
      line: { color: COLORS.borderGray, width: 0.5 },
    });

    // 顶部色条
    slide7.addShape(pptx.ShapeType.rect, {
      x: x, y: y, w: 3.9, h: 0.06, fill: { color: f.color },
    });

    // 编号
    slide7.addText(f.num, {
      x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5,
      fontSize: 18, fontFace: FONTS.title, color: f.color, bold: true,
      align: "left", valign: "middle",
    });

    // 标题
    slide7.addText(f.title, {
      x: x + 0.7, y: y + 0.2, w: 3, h: 0.5,
      fontSize: 15, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "left", valign: "middle",
    });

    // 描述
    slide7.addText(f.desc, {
      x: x + 0.2, y: y + 0.8, w: 3.5, h: 1.4,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "top",
      lineSpacingMultiple: 1.5,
    });
  });

  slide7.addNotes(`【MCP-Skill架构，3分钟——这是重点】
MCP-Skill架构是我们项目最核心的技术创新。

核心理念：大模型只负责"理解与推理"，实际业务操作通过Skill委托给后端API执行。
这样做的好处是——大模型不需要知道业务细节，它只需要做自然语言理解。

它有六大特性：

第一，标准化接口——所有Skill都实现McpSkill接口，保证统一契约；
第二，动态注册机制——加一个@Component就能注册新Skill，完全零侵入；
第三，安全分级控制——查询类直接返回，资金操作必须两阶段确认；
第四，结构化返回——不只是返回文本，还返回结构化数据，前端可以自动渲染卡片；
第五，LLM无关设计——现在用关键词匹配，将来切换到大模型不需要改任何代码；
第六，可扩展生态——新增能力仅需三步：新建类、实现接口、加注解。

这个架构最大的价值：让AI能力变得可管理、可扩展、安全可控。`);

  // ============================================================
  // SLIDE 8: 落地实践：三个MCP Skill
  // ============================================================
  const slide8 = pptx.addSlide();
  slide8.background = { color: COLORS.white };

  slide8.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide8.addText("落地实践：三个 MCP Skill", {
    x: 0.8, y: 0.3, w: 6, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide8.addText("目前已实现3个核心Skill，覆盖智能客服助手主要场景", {
    x: 0.8, y: 0.85, w: 11.73, h: 0.4,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
    align: "left", valign: "middle",
  });
  slide8.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.2, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  const skills = [
    {
      icon: "💰", title: "QueryBalance", tag: "查询类", tagColor: COLORS.green,
      trigger: '用户说："查余额"\n"工商银行卡还有多少钱"',
      action: "查询所有银行卡余额，支持按银行筛选",
      params: "query_balance(bank_name='工商银行')",
      render: "balance_card 卡片 ▶ AI回复各卡余额+总资产",
    },
    {
      icon: "📋", title: "QueryTransactions", tag: "查询类", tagColor: COLORS.green,
      trigger: '用户说："最近交易"\n"我上个月花了多少"',
      action: "查询交易记录，支持按类型和时间筛选",
      params: "query_transactions(trans_type='transfer', time_range='7d')",
      render: "transaction_list 卡片 ▶ AI回复最近交易摘要",
    },
    {
      icon: "🔄", title: "TransferPrepare", tag: "操作类", tagColor: COLORS.orange,
      trigger: '用户说："转给张三500元"\n"给妈妈转账1000"',
      action: "转账预执行——提取参数，生成确认卡片",
      params: "transfer_prepare(payee_name='张三', amount=500)",
      render: "transfer_preview 卡片 ▶ 用户确认后跳转密码页执行",
    },
  ];

  skills.forEach((s, i) => {
    const x = 0.6 + i * 4.2;
    const y = 1.4;

    // 卡片背景
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 5.4,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.12,
      line: { color: COLORS.borderGray, width: 0.5 },
    });

    // 头部色块
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 0.9,
      fill: { color: s.tagColor },
      cornerRadius: 0.0,
    });

    // 图标+标题
    slide8.addText(`${s.icon} ${s.title}`, {
      x: x, y: y, w: 3.9, h: 0.9,
      fontSize: 16, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });

    // 标签
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 1.0, w: 1.0, h: 0.35,
      fill: { color: s.tagColor },
      cornerRadius: 0.05,
    });
    slide8.addText(s.tag, {
      x: x + 0.2, y: y + 1.0, w: 1.0, h: 0.35,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });

    // 触发条件
    slide8.addText("📌 用户触发", {
      x: x + 0.2, y: y + 1.5, w: 3.5, h: 0.3,
      fontSize: 10, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
    });
    slide8.addText(s.trigger, {
      x: x + 0.2, y: y + 1.8, w: 3.5, h: 0.65,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.bodyGray,
      lineSpacingMultiple: 1.3,
    });

    // 行为
    slide8.addText("⚙️ AI动作", {
      x: x + 0.2, y: y + 2.5, w: 3.5, h: 0.3,
      fontSize: 10, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
    });
    slide8.addText(s.action, {
      x: x + 0.2, y: y + 2.8, w: 3.5, h: 0.4,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.bodyGray,
    });

    // 参数
    slide8.addText("📝 调用参数", {
      x: x + 0.2, y: y + 3.2, w: 3.5, h: 0.3,
      fontSize: 10, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
    });
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 3.5, w: 3.5, h: 0.45,
      fill: { color: "F5F5F5" },
      cornerRadius: 0.05,
    });
    slide8.addText(s.params, {
      x: x + 0.3, y: y + 3.5, w: 3.3, h: 0.45,
      fontSize: 8, fontFace: "Courier New", color: COLORS.primaryBlue,
      align: "left", valign: "middle",
    });

    // 渲染
    slide8.addText("🎨 前端渲染", {
      x: x + 0.2, y: y + 4.1, w: 3.5, h: 0.3,
      fontSize: 10, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
    });
    slide8.addText(s.render, {
      x: x + 0.2, y: y + 4.4, w: 3.5, h: 0.55,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.bodyGray,
      lineSpacingMultiple: 1.3,
    });

    // 安全提示
    if (i === 2) {
      slide8.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.2, y: y + 4.9, w: 3.5, h: 0.35,
        fill: { color: "FDEDEC" },
        cornerRadius: 0.05,
      });
      slide8.addText("⚠️ 仅提取参数，不执行转账", {
        x: x + 0.2, y: y + 4.9, w: 3.5, h: 0.35,
        fontSize: 8, fontFace: FONTS.body, color: COLORS.highlight, bold: true,
        align: "center", valign: "middle",
      });
    }
  });

  slide8.addNotes(`【Skill演示，1.5分钟】
这是我们实际落地的三个Skill：

第一个，QueryBalance——用户说"查余额"或"工商银行卡还有多少钱"，
AI自动调用这个Skill查询所有银行卡余额，前端渲染成余额卡片，展示各卡余额和总资产。

第二个，QueryTransactions——用户说"最近交易"或"上个月花了多少"，
返回交易列表卡片，每笔交易的金额、类型、时间都清晰展示，支持按类型和时间筛选。

第三个，TransferPrepare——这个最特殊，它是操作级Skill。
用户说"转给张三500元"，AI提取参数生成转账预览卡片，
用户点击"去转账"后跳转到标准确认页，输入交易密码后才真正执行。

这就是两阶段确认——AI只做参数提取，不执行实际资金操作。
这保证了资金安全，也符合金融监管要求。`);

  // ============================================================
  // SLIDE 9: 金融级安全防护体系
  // ============================================================
  const slide9 = pptx.addSlide();
  slide9.background = { color: COLORS.white };

  slide9.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide9.addText("金融级安全防护体系", {
    x: 0.8, y: 0.3, w: 6, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide9.addText("银行系统的核心是安全。我们构建了四层安全防护矩阵", {
    x: 0.8, y: 0.85, w: 11.73, h: 0.4,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
  });
  slide9.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.2, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  const secLayers = [
    {
      icon: "🛡️", title: "身份认证层", color: COLORS.accentBlue,
      items: [
        "JWT令牌签发 + 拦截器统一校验",
        "单设备登录（Redis覆盖旧令牌）",
        "滑动窗口30分钟续期",
        "无操作15分钟自动退出",
      ],
    },
    {
      icon: "🔒", title: "数据安全层", color: COLORS.green,
      items: [
        "密码 bcrypt 加盐哈希（cost≥12）",
        "身份证/银行卡号 AES-256 加密",
        "全链路 HTTPS / TLS 1.2+",
        "前端脱敏展示（仅显示后四位）",
      ],
    },
    {
      icon: "⛔", title: "防攻击层", color: COLORS.orange,
      items: [
        "登录5次错误 → 锁定30分钟",
        "交易密码5次错误 → 冻结24小时",
        "同一收款方30秒防重复（原子SETNX）",
        "验证码60s频率 + 日限10条",
      ],
    },
    {
      icon: "📋", title: "审计合规层", color: "8E44AD",
      items: [
        "AOP切面自动记录操作日志",
        "敏感信息脱敏后记录",
        "操作类型全覆盖（登录/转账/绑卡等）",
        "日志保留≥5年，满足审计要求",
      ],
    },
  ];

  secLayers.forEach((layer, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 6.2;
    const y = 1.5 + row * 2.7;

    // 卡片
    slide9.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 5.9, h: 2.4,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.12,
      line: { color: COLORS.borderGray, width: 0.5 },
    });

    // 左侧色条
    slide9.addShape(pptx.ShapeType.rect, {
      x: x, y: y, w: 0.08, h: 2.4, fill: { color: layer.color },
    });

    // 图标
    slide9.addText(layer.icon, {
      x: x + 0.3, y: y + 0.15, w: 0.5, h: 0.5,
      fontSize: 22, align: "center", valign: "middle",
    });

    // 标题
    slide9.addText(layer.title, {
      x: x + 0.85, y: y + 0.15, w: 3, h: 0.5,
      fontSize: 16, fontFace: FONTS.title, color: layer.color, bold: true,
      align: "left", valign: "middle",
    });

    // 分项
    slide9.addText(layer.items.map((item, idx) => `• ${item}`).join("\n"), {
      x: x + 0.4, y: y + 0.7, w: 5.2, h: 1.5,
      fontSize: 11, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "top",
      lineSpacingMultiple: 1.5,
    });
  });

  slide9.addNotes(`【安全体系，2分钟】
银行系统的安全不是功能，是底线。我们构建了四层防护：

第一层，身份认证——JWT统一校验、单设备登录控制，同一个账号在新设备登录后，旧设备会立刻退出。

第二层，数据安全——密码用bcrypt加盐哈希，cost≥12；身份证和银行卡号用AES-256加密；全链路HTTPS；前端展示全部脱敏。

第三层，防攻击——登录5次错误锁定30分钟，交易密码5次错误冻结24小时，同一收款方30秒内不能重复转账——这些都是真实银行系统验证过的策略。

第四层，审计合规——所有操作通过AOP切面自动记录，敏感信息脱敏后写入，保留超过5年，满足金融监管审计要求。`);

  // ============================================================
  // SLIDE 10: AI能力亮点
  // ============================================================
  const slide10 = pptx.addSlide();
  slide10.background = { color: COLORS.white };

  slide10.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide10.addText("AI 能力亮点", {
    x: 0.8, y: 0.3, w: 5, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide10.addText("不只是智能客服——消费分析、智能分类、洞察引擎全面覆盖", {
    x: 0.8, y: 0.85, w: 11.73, h: 0.4,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
  });
  slide10.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.2, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  // 三大能力
  const capabilities = [
    {
      icon: "🤖", title: "智能客服助手", color: COLORS.accentBlue,
      desc: "自然语言对话完成银行业务",
      features: [
        "关键词+正则表达式意图识别",
        "McpGateway路由到对应Skill",
        "结构化数据→前端卡片渲染",
        "⚠️ 资金操作两阶段确认",
      ],
    },
    {
      icon: "📊", title: "智能消费分析", color: COLORS.orange,
      desc: "交易自动分类 + 月度消费报告",
      features: [
        "10大分类、200+关键词匹配规则引擎",
        "月度总支出+环比趋势+分类占比",
        "AI自动生成洞察文案",
        "用户可手动修正，反哺规则优化",
      ],
    },
    {
      icon: "🧠", title: "AI洞察引擎", color: "8E44AD",
      desc: "自动生成消费洞察与建议",
      features: [
        "规则模板生成分析文案",
        "Top1分类提示+环比增长率",
        "支出结构建议",
        '示例："您本月餐饮占比37.6%，建议关注支出结构"',
      ],
    },
  ];

  capabilities.forEach((cap, i) => {
    const x = 0.6 + i * 4.2;
    const y = 1.4;

    // 卡片
    slide10.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 5.0,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.12,
      line: { color: COLORS.borderGray, width: 0.5 },
    });

    // 顶部色块
    slide10.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 1.2,
      fill: { color: cap.color },
      cornerRadius: 0.0,
    });

    // 图标+标题
    slide10.addText(`${cap.icon} ${cap.title}`, {
      x: x, y: y + 0.1, w: 3.9, h: 0.6,
      fontSize: 18, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });
    slide10.addText(cap.desc, {
      x: x, y: y + 0.65, w: 3.9, h: 0.4,
      fontSize: 10, fontFace: FONTS.body, color: "E8E8E8",
      align: "center", valign: "middle",
    });

    // 特性列表
    cap.features.forEach((f, fi) => {
      const fy = y + 1.5 + fi * 0.8;
      slide10.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.2, y: fy, w: 3.5, h: 0.65,
        fill: { color: i === 0 ? "EBF5FB" : i === 1 ? "FEF5E7" : "F4ECF7" },
        cornerRadius: 0.06,
      });
      slide10.addText(f, {
        x: x + 0.3, y: fy, w: 3.3, h: 0.65,
        fontSize: 10, fontFace: FONTS.body, color: COLORS.bodyGray,
        align: "left", valign: "middle",
        lineSpacingMultiple: 1.2,
      });
    });
  });

  slide10.addNotes(`【AI能力亮点，2分钟】
除了智能客服，我们还有两个值得一提的AI能力：

第一，智能消费分析——实现了规则引擎，对交易自动分类，餐饮、购物、交通等10个大类，超过200个关键词匹配。生成月度消费报告，包含总支出、环比趋势和AI洞察文案。

第二，AI洞察引擎——不是简单的大模型生成，而是通过规则模板加数据分析自动产生洞察。比如"您本月餐饮占比37.6%，建议关注支出结构"。

这里强调一个设计原则：所有资金操作类意图，AI只做参数提取和确认卡片展示，实际转账必须跳转到标准密码输入页。这在金融场景中非常关键。`);

  // ============================================================
  // SLIDE 11: 项目难点与技术突破
  // ============================================================
  const slide11 = pptx.addSlide();
  slide11.background = { color: COLORS.white };

  slide11.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide11.addText("项目难点与技术突破", {
    x: 0.8, y: 0.3, w: 6, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide11.addText("在实现过程中面临的核心挑战及我们的解决方案", {
    x: 0.8, y: 0.85, w: 11.73, h: 0.4,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
  });
  slide11.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.2, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  const challenges = [
    {
      icon: "🎯", title: "AI意图识别精度", color: COLORS.accentBlue,
      challenge: `用户自然语言输入千变万化\n"查余额"和"看看我还有多少钱"是同一意图\n边界情况持续出现，规则引擎永远有盲区`,
      solution: "关键词+正则双模式匹配+兜底引导\n支持银行名/金额/人名的参数提取\n持续补充边界规则，覆盖率达90%+",
    },
    {
      icon: "🔍", title: "AI生成代码的业务校验", color: COLORS.orange,
      challenge: "AI代码语法正确但业务语义错误\n金额符号存反、字段溢出、分类规则漏匹配\n——运行时才暴露，人工Review难发现",
      solution: "建立AI代码校验清单：金额符号→分类规则→字段长度\n前后端契约测试：参数名→路径→响应结构\n提示词中精确描述业务约束，减少歧义",
    },
    {
      icon: "🔗", title: "前后端集成契约对齐", color: COLORS.highlight,
      challenge: "前端和后端由AI独立生成，天然存在契约断裂\nAPI路径不一致、参数命名不匹配、响应结构预期差异",
      solution: "统一API契约规范（ReqBase/统一响应格式）\n前端组件与后端接口结对生成\n集成测试前置，尽早暴露契约问题",
    },
  ];

  challenges.forEach((c, i) => {
    const x = 0.6 + i * 4.2;
    const y = 1.4;

    // 卡片
    slide11.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 5.4,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.12,
      line: { color: COLORS.borderGray, width: 0.5 },
    });

    // 顶部色块
    slide11.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 3.9, h: 0.9,
      fill: { color: c.color },
      cornerRadius: 0.0,
    });

    // 标题
    slide11.addText(`${c.icon} ${c.title}`, {
      x: x, y: y, w: 3.9, h: 0.9,
      fontSize: 16, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });

    // 挑战标题
    slide11.addText("❓ 挑战", {
      x: x + 0.2, y: y + 1.1, w: 3.5, h: 0.35,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.highlight, bold: true,
    });

    // 挑战内容
    slide11.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 1.45, w: 3.5, h: 1.2,
      fill: { color: "FDEDEC" },
      cornerRadius: 0.08,
    });
    slide11.addText(c.challenge, {
      x: x + 0.3, y: y + 1.5, w: 3.3, h: 1.1,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "middle",
      lineSpacingMultiple: 1.4,
    });

    // 方案标题
    slide11.addText("✅ 方案", {
      x: x + 0.2, y: y + 2.9, w: 3.5, h: 0.35,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.green, bold: true,
    });

    // 方案内容
    slide11.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 3.25, w: 3.5, h: 1.8,
      fill: { color: "E8F8F5" },
      cornerRadius: 0.08,
    });
    slide11.addText(c.solution, {
      x: x + 0.3, y: y + 3.3, w: 3.3, h: 1.7,
      fontSize: 10, fontFace: FONTS.body, color: COLORS.bodyGray,
      align: "left", valign: "middle",
      lineSpacingMultiple: 1.5,
    });
  });

  slide11.addNotes(`【项目难点，2分钟】
讲一下这个项目真实遇到的三个核心挑战——这些才是AI研发中真正"卡住"的地方：

第一个，AI意图识别精度。用户说话千变万化，"查余额"和"看看我还有多少钱"是同一意图，但正则怎么写才能不漏？而且边界情况层出不穷——这是规则引擎的固有缺陷，需要持续补充。

第二个，AI生成代码的业务校验。这是我认为最难的一点——AI生成的代码语法上完全正确，但业务语义可能是错的。比如金额符号存反了、字段长度不够溢出了、分类规则大小写没对齐——这些只有跑起来才知道。

第三个，前后端集成契约对齐。AI前端和后端是两套独立的生成，天然存在契约断裂。API路径不一致、参数名不匹配、响应结构预期差异——需要一个统一的契约规范来兜底。`);

  // ============================================================
  // SLIDE 12: 成果与收获
  // ============================================================
  const slide12 = pptx.addSlide();
  slide12.background = { color: COLORS.white };

  slide12.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: COLORS.accentBlue },
  });

  slide12.addText("成果与收获", {
    x: 0.8, y: 0.3, w: 5, h: 0.7,
    fontSize: 28, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
  });
  slide12.addText("项目成果数据 + 个人与团队的真实收获", {
    x: 0.8, y: 0.85, w: 11.73, h: 0.4,
    fontSize: 12, fontFace: FONTS.body, color: COLORS.subtitleGray,
  });
  slide12.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.2, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  // 上半部分：项目成果指标（压缩为一行）
  const metrics = [
    { num: "30+", label: "API接口", sub: "6大业务模块", color: COLORS.accentBlue },
    { num: "8", label: "数据库表", sub: "物理设计+索引", color: COLORS.green },
    { num: "23", label: "前端页面", sub: "完整业务交互", color: COLORS.orange },
    { num: "6", label: "核心Service", sub: "P0全覆盖", color: "8E44AD" },
    { num: "7", label: "专业文档", sub: "全流程资产", color: COLORS.highlight },
    { num: "3", label: "MCP Skill", sub: "可插拔AI单元", color: COLORS.primaryBlue },
  ];

  metrics.forEach((m, i) => {
    const x = 0.5 + i * 2.1;
    const y = 1.4;

    slide12.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: 1.9, h: 1.4,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.1,
      line: { color: COLORS.borderGray, width: 0.5 },
    });
    slide12.addShape(pptx.ShapeType.rect, {
      x: x, y: y, w: 1.9, h: 0.05, fill: { color: m.color },
    });
    slide12.addText(m.num, {
      x: x, y: y + 0.1, w: 1.9, h: 0.5,
      fontSize: 26, fontFace: FONTS.title, color: m.color, bold: true,
      align: "center", valign: "middle",
    });
    slide12.addText(m.label, {
      x: x, y: y + 0.6, w: 1.9, h: 0.3,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "center", valign: "middle",
    });
    slide12.addText(m.sub, {
      x: x, y: y + 0.9, w: 1.9, h: 0.3,
      fontSize: 8, fontFace: FONTS.body, color: COLORS.subtitleGray,
      align: "center", valign: "middle",
    });
  });

  // 分隔
  slide12.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 3.0, w: 11.73, h: 0.02, fill: { color: COLORS.borderGray },
  });

  // 下半部分：收获与成长（左右两栏）
  // 左栏：个人收获
  slide12.addText("我的收获与成长", {
    x: 0.8, y: 3.2, w: 5.5, h: 0.45,
    fontSize: 16, fontFace: FONTS.title, color: COLORS.accentBlue, bold: true,
  });

  const learnings = [
    { icon: "🧠", title: "对AI研发的深度认知", desc: `从"AI是写代码工具"到"AI是研发协作者"的认知跃迁——AI最强的是生成速度，最弱的是业务语义理解` },
    { icon: "✍️", title: "提示词工程经验", desc: "业务约束必须在提示词中显式声明。一句话说清楚业务规则，比后续花10分钟修BUG更高效" },
    { icon: "🔬", title: "AI代码验证方法论", desc: "AI代码的业务语义验证才是真正的难点——建立了AI代码校验清单和前后端契约测试流程" },
    { icon: "🏗️", title: "可复用的架构思维", desc: "MCP-Skill架构的设计原则不仅适用于AI，更是一种通用的能力抽象方法论，可迁移到其他系统" },
  ];

  learnings.forEach((l, i) => {
    const y = 3.75 + i * 0.85;
    slide12.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: y, w: 5.8, h: 0.75,
      fill: { color: COLORS.cardBg },
      cornerRadius: 0.08,
      line: { color: COLORS.borderGray, width: 0.3 },
    });
    slide12.addText(l.icon, {
      x: 0.95, y: y + 0.1, w: 0.5, h: 0.5,
      fontSize: 20, align: "center", valign: "middle",
    });
    slide12.addText(l.title, {
      x: 1.5, y: y + 0.05, w: 4.8, h: 0.3,
      fontSize: 12, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "left", valign: "middle",
    });
    slide12.addText(l.desc, {
      x: 1.5, y: y + 0.35, w: 4.8, h: 0.35,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.subtitleGray,
      align: "left", valign: "top",
    });
  });

  // 右栏：可复用的打法
  slide12.addText("沉淀的可复用打法", {
    x: 7.2, y: 3.2, w: 5.53, h: 0.45,
    fontSize: 16, fontFace: FONTS.title, color: COLORS.green, bold: true,
  });

  const playbook = [
    { num: "01", title: "MCP-Skill组件化框架", desc: "标准化AI能力封装→动态注册→安全分级→跨场景复用" },
    { num: "02", title: "AI代码校验清单", desc: "金额符号→字段长度→分类规则→契约测试，系统化减少隐式BUG" },
    { num: "03", title: "提示词工程规范", desc: "业务约束显式化·参数边界明确化·预期结果可验证化" },
    { num: "04", title: "文档与代码一致性机制", desc: "AI保障7份专业文档版本化管理，需求→设计→实现可追溯" },
    { num: "05", title: "两阶段安全确认模式", desc: "AI只做参数提取+卡片预览，资金操作跳转标准密码页——金融级安全设计模式" },
  ];

  playbook.forEach((p, i) => {
    const y = 3.75 + i * 0.68;

    slide12.addShape(pptx.ShapeType.roundRect, {
      x: 7.2, y: y, w: 0.4, h: 0.4,
      fill: { color: COLORS.green },
      cornerRadius: 0.05,
    });
    slide12.addText(p.num, {
      x: 7.2, y: y, w: 0.4, h: 0.4,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.white, bold: true,
      align: "center", valign: "middle",
    });

    slide12.addText(p.title, {
      x: 7.75, y: y, w: 4.8, h: 0.22,
      fontSize: 11, fontFace: FONTS.title, color: COLORS.titleGray, bold: true,
      align: "left", valign: "middle",
    });
    slide12.addText(p.desc, {
      x: 7.75, y: y + 0.22, w: 4.8, h: 0.3,
      fontSize: 9, fontFace: FONTS.body, color: COLORS.subtitleGray,
      align: "left", valign: "top",
    });
  });

  slide12.addNotes(`【成果与收获，2分钟】
先看左边，这是我个人在这个项目中的四个核心收获：

第一，对AI研发的深度认知。以前我觉得AI就是个代码生成器，现在我的认知完全变了——AI最强的不是写代码，而是理解和推理；但最弱的恰恰是业务语义理解。代码没错但业务逻辑错了，这是AI研发特有的难题。

第二，提示词工程经验。我最大的教训是：业务约束必须显式写在提示词里，你以为AI知道的，它不知道。一句话说清楚规则，比后续花10分钟修BUG更高效。

第三，AI代码验证方法论。我建立了一套校验清单，从金额符号到字段长度到分类规则，每一步都有检查点——这成了我后续做AI研发的标准流程。

第四，可复用的架构思维。MCP-Skill的设计原则不仅适用于这个项目，它是一种通用的能力抽象方法论。

再看右边，这是我认为可以真正推广的五套打法。如果公司后续要做AI原生研发，这些东西可以直接复用。`);

  // ============================================================
  // SLIDE 13: 感谢聆听
  // ============================================================
  const slide13 = pptx.addSlide();
  slide13.background = { color: COLORS.darkBlue };

  // 顶部装饰线
  slide13.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 主标题
  slide13.addText("感谢聆听", {
    x: 0.8, y: 1.8, w: 11.73, h: 1.0,
    fontSize: 44, fontFace: FONTS.title, color: COLORS.white, bold: true,
    align: "center", valign: "middle",
  });

  // 分隔线
  slide13.addShape(pptx.ShapeType.rect, {
    x: 4.5, y: 2.9, w: 4.33, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  // 副标题
  slide13.addText("AI原生研发 · 手机银行核心业务系统", {
    x: 0.8, y: 3.2, w: 11.73, h: 0.6,
    fontSize: 18, fontFace: FONTS.body, color: "AABBCC",
    align: "center", valign: "middle",
  });

  // 金句
  slide13.addText("当所有人都在用 AI 生成代码，", {
    x: 0.8, y: 4.2, w: 11.73, h: 0.5,
    fontSize: 16, fontFace: FONTS.body, color: COLORS.white,
    align: "center", valign: "middle",
  });
  slide13.addText("我们选择用 AI 设计架构、治理文档、守住安全底线。", {
    x: 0.8, y: 4.6, w: 11.73, h: 0.5,
    fontSize: 16, fontFace: FONTS.body, color: COLORS.accentBlue, bold: true,
    align: "center", valign: "middle",
  });

  // 底部联系方式
  slide13.addShape(pptx.ShapeType.rect, {
    x: 0, y: 6.5, w: 13.33, h: 0.04, fill: { color: COLORS.accentBlue },
  });

  slide13.addNotes(`【收尾，0.5分钟】
各位评委老师，以上就是我们的项目展示。

我想用一句话来总结：
"当所有人都在用AI生成代码的时候，我们选择用AI设计架构、治理文档、守住安全底线。"

谢谢大家！欢迎提问。`);

  // ============================================================
  // 保存文件
  // ============================================================
  const outputDir = "f:\\code\\bank\\bank";
  const outputPath = `${outputDir}\\AI竞赛讲解_手机银行核心业务_优化版_v2.pptx`;

  // 避免 EBUSY 错误：如果文件存在先删除
  try {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  } catch (e) {}

  await pptx.writeFile({ fileName: outputPath });
  console.log(`✅ PPT generated successfully: ${outputPath}`);
  console.log(`📊 Total slides: 13`);

  return outputPath;
}

generatePPT().catch((err) => {
  console.error("❌ Error generating PPT:", err);
  process.exit(1);
});
