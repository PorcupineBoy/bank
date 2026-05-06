const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ============================================================
// 样式常量
// ============================================================
const C = {
  darkBlue: "1A3A5C", primaryBlue: "1A5276", accentBlue: "4A90E2",
  white: "FFFFFF", titleGray: "2C3E50", bodyGray: "34495E",
  subtitleGray: "7F8C8D", lightBg: "EBF5FB", highlight: "E74C3C",
  green: "27AE60", orange: "E67E22", cardBg: "F8FAFC",
  borderGray: "D5D8DC",
};
const F = { title: "Arial", body: "Arial", cn: "Microsoft YaHei" };
const SCREENSHOTS = path.join(__dirname, "screenshots");

// ============================================================
// 通用辅助函数
// ============================================================
function addSlideHeader(slide, pptx, title, subtitle) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.accentBlue } });
  slide.addText(title, { x: 0.8, y: 0.3, w: 5, h: 0.7, fontSize: 28, fontFace: F.title, color: C.titleGray, bold: true });
  if (subtitle) slide.addText(subtitle, { x: 5.5, y: 0.4, w: 7.03, h: 0.5, fontSize: 12, fontFace: F.body, color: C.subtitleGray, align: "right", valign: "middle" });
  slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.accentBlue } });
}

function addCard(slide, pptx, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: C.cardBg }, cornerRadius: 0.12, line: { color: C.borderGray, width: 0.5 } });
}

function addTransition(slide, pptx, text) {
  slide.addText(text, { x: 7.5, y: 6.7, w: 5.03, h: 0.35, fontSize: 12, fontFace: F.body, color: C.subtitleGray, align: "right" });
  slide.addText("\u2192", { x: 12.5, y: 6.7, w: 0.3, h: 0.35, fontSize: 14, fontFace: F.body, color: C.accentBlue, align: "left" });
}

// ============================================================
// 生成器主函数
// ============================================================
async function generatePPT() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";

  // ============================================================
  // SLIDE 1: 封面
  // ============================================================
  const s1 = pptx.addSlide();
  s1.background = { color: C.darkBlue };
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.04, fill: { color: C.accentBlue } });
  s1.addText("\u6E90\u4E8E\u7ADE\u8D5B\uFF0C\u4E0D\u6B62\u4E8E\u7ADE\u8D5B", {
    x: 0.8, y: 1.6, w: 11.73, h: 1.0, fontSize: 44, fontFace: F.title, color: C.white, bold: true, align: "center",
  });
  s1.addText("AI\u539F\u751F\u7814\u53D1\u7684\u8BA4\u77E5\u8DC3\u8FC1", {
    x: 0.8, y: 2.6, w: 11.73, h: 0.8, fontSize: 32, fontFace: F.title, color: C.white, align: "center",
  });
  s1.addShape(pptx.ShapeType.rect, { x: 4.5, y: 3.6, w: 4.33, h: 0.04, fill: { color: C.accentBlue } });
  s1.addText("\u4EE5\u624B\u673A\u94F6\u884C\u4E3A\u8F7D\u4F53\u7684\u8C03\u6559\u5B9E\u5F55", {
    x: 0.8, y: 3.9, w: 11.73, h: 0.6, fontSize: 16, fontFace: F.body, color: "AABBCC", align: "center",
  });
  s1.addText("\u624B\u673A\u94F6\u884C\u6838\u5FC3\u4E1A\u52A1\u7CFB\u7EDF \u00B7 \u9879\u76EE\u5C55\u793A", {
    x: 0.8, y: 5.6, w: 11.73, h: 0.5, fontSize: 14, fontFace: F.body, color: "8899AA", align: "center",
  });
  s1.addNotes(`各位评委好。今天我分享的主题是“源于竞赛，不止于竞赛”——我们从一个AI竞赛出发，最终收获的却不只是竞赛本身。\n在短短几周内，我们用AI原生的研发方式，从零构建了一个完整的手机银行核心系统。更重要的，是在这个过程中，我们对“研发”这件事本身有了全新的理解。\n今天的分享分三个篇章：先看成果证明完成度，再听历程讲述方法，最后我们一起思考——AI时代，一个研发人员的核心竞争力究竟是什么。`);

  // ============================================================
  // SLIDE 2: 开篇Hook——AI代码的信任危机
  // ============================================================
  const s2 = pptx.addSlide();
  s2.background = { color: C.white };
  
  // 标题区——戏剧性开场
  s2.addText("200字功能描述，两周构建一个银行系统", {
    x: 0.8, y: 0.2, w: 11.73, h: 0.6, fontSize: 26, fontFace: F.title, color: C.highlight, bold: true, align: "center",
  });
  s2.addText("让AI扮演五个角色生成七份文档——但我们发现了一个有趣的悖论", {
    x: 0.8, y: 0.75, w: 11.73, h: 0.35, fontSize: 13, fontFace: F.body, color: C.titleGray, align: "center",
  });
  
  // 核心悖论——居中大号文字
  s2.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 1.5, w: 10.33, h: 2.0, fill: { color: "FFF5F5" }, cornerRadius: 0.12, line: { color: C.highlight, width: 1 } });
  s2.addText("AI写的代码语法完美、测试通过——\n但业务语义的偏差，恰恰因为太完美而更难发现", {
    x: 1.8, y: 1.6, w: 9.73, h: 1.8, fontSize: 20, fontFace: F.title, color: C.highlight, bold: true, align: "center", valign: "middle", lineSpacingMultiple: 1.4,
  });
  
  // 底部核心观点
  s2.addShape(pptx.ShapeType.roundRect, { x: 2.0, y: 4.2, w: 9.33, h: 0.6, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s2.addText("不是代码的问题——是AI理解业务的方式需要重新设计", {
    x: 2.2, y: 4.2, w: 8.93, h: 0.6, fontSize: 14, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });
    
  addTransition(s2, pptx, "▸ 接下来：先看我们用这套方法构建了什么");
  
  s2.addNotes(`各位评委好。我们的起点只有一段200字的功能描述——就是竞赛给定的那一行文字。然后我们做了一件事：让AI扮演了五个角色——产品经理写需求文档、系统架构师写设计方案、后端开发写开发规范、前端开发写前端规范、测试工程师写测试用例。七份文档构成了完整的研发基线。基于这些文档，AI生成了完整的银行系统——30多个API、24个前端页面、7张数据库表。但这条路我们发现了一个有趣的悖论：AI写的代码语法完美、注释齐全、测试通过——恰恰因为太完美，一个业务语义的偏差反而潜伏了很久才被发现。我们经历了三次典型的教训——相同的BUG反复出现因为文档没更新、交易金额方向符号被AI按数学逻辑处理（支出存正数+100.00）而不是财务语义（支出必须为负）、一个转账意图平均要失败三四次才能说清楚。这些教训让我们重新思考了一个根本性的问题：AI原生研发，到底应该怎么做？`);

  // ============================================================
  // SLIDE 3: 功能全景——系统总览
  // ============================================================
  const s3 = pptx.addSlide();
  s3.background = { color: C.white };
  addSlideHeader(s3, pptx, "\u529F\u80FD\u5168\u666F", "\u624B\u673A\u94F6\u884C\u6838\u5FC3\u7CFB\u7EDF\u5B9E\u666F");

  // 左侧：首页截图
  try {
    s3.addImage({ path: path.join(SCREENSHOTS, "home.png"), x: 0.4, y: 1.1, w: 3.2, h: 5.7, sizing: { type: "contain", w: 3.2, h: 5.7 } });
  } catch (e) {
    s3.addText("[ \u622A\u56FE\u52A0\u8F7D\u5931\u8D25 ]", { x: 0.4, y: 1.1, w: 3.2, h: 5.7, fontSize: 12, fontFace: F.body, color: C.subtitleGray, align: "center", valign: "middle" });
  }

  // 右侧：三个标注区
  const annots = [
    { num: "\u2460", title: "\u603B\u8D44\u4EA7\u5B9E\u65F6\u67E5\u770B", desc: "\u5B9E\u65F6\u8D26\u6237\u4F59\u989D\uFF0C\u6B63\u8D1F\u53F7\u533A\u5206\u6536\u652F\u65B9\u5411", x: 4.0, color: C.accentBlue },
    { num: "\u2461", title: "5\u5927\u5FEB\u6377\u529F\u80FD", desc: "\u8F6C\u8D26\u3001\u4EA4\u6613\u8BB0\u5F55\u3001\u751F\u6D3B\u7F34\u8D39\u3001\u94F6\u884C\u5361\u3001\u5B89\u5168\u4E2D\u5FC3", x: 4.0, color: C.green },
    { num: "\u2462", title: "AI\u80FD\u529B\u96C6\u6210\u5165\u53E3", desc: "AI\u52A9\u624B+\u6D88\u8D39\u5206\u6790\u4E24\u5927AI\u6838\u5FC3\u80FD\u529B\u4E00\u952E\u8FDB\u5165", x: 4.0, color: C.orange },
  ];

  annots.forEach((a, i) => {
    const y = 1.2 + i * 1.7;
    addCard(s3, pptx, a.x, y, 8.5, 1.4);
    s3.addShape(pptx.ShapeType.ellipse, { x: a.x + 0.3, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: a.color } });
    s3.addText(a.num, { x: a.x + 0.3, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 16, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s3.addText(a.title, { x: a.x + 1.1, y: y + 0.15, w: 7, h: 0.4, fontSize: 15, fontFace: F.title, color: C.titleGray, bold: true });
    s3.addText(a.desc, { x: a.x + 1.1, y: y + 0.6, w: 7, h: 0.5, fontSize: 11, fontFace: F.body, color: C.bodyGray, valign: "top" });
  });

  // 底部总结条
  s3.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 6.7, w: 11.73, h: 0.4, fill: { color: C.lightBg }, cornerRadius: 0.08 });
  s3.addText("10\u5927\u529F\u80FD\u6A21\u5757 \u00B7 30+ API\u63A5\u53E3 \u00B7 24\u9875\u524D\u7AEF \u00B7 \u5168\u90E8AI\u539F\u751F\u7814\u53D1\u5B8C\u6210", {
    x: 1.0, y: 6.7, w: 11.33, h: 0.4, fontSize: 11, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s3, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u652F\u6491\u8FD9\u4E9B\u80FD\u529B\u7684\u6280\u672F\u6838\u5FC3\u2014\u2014MCP-Skill");

  s3.addNotes(`先看成果。左侧是我们的系统首页——真实的运行截图。总资产十七万多，正负号清晰区分收支方向；五大快捷功能覆盖转账、查询、缴费等核心场景；两个AI能力入口内置在首页上。这不是概念设计，这是已经跑通的系统。十大功能模块、三十多个API接口、二十四个前端页面，全部由AI原生研发方式完成。`);

  // ============================================================
  // SLIDE 4: MCP-Skill核心创新
  // ============================================================
  const s_mcp = pptx.addSlide();
  s_mcp.background = { color: C.white };
  addSlideHeader(s_mcp, pptx, "MCP-Skill\u6838\u5FC3\u521B\u65B0", "\u8BA9AI\u5B89\u5168\u64CD\u4F5C\u94F6\u884C\u7CFB\u7EDF\u7684\u67B6\u6784");

  // \u5DE6\u4FA7\uFF1A\u8BF7\u6C42\u6D41\u7A0B
  s_mcp.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.3, w: 5.5, h: 4.8, fill: { color: C.lightBg }, cornerRadius: 0.12 });
  s_mcp.addText("\u8BF7\u6C42\u6D41\u7A0B", { x: 0.8, y: 1.4, w: 5.1, h: 0.35, fontSize: 14, fontFace: F.title, color: C.titleGray, bold: true, align: "center" });

  const mcpSteps = [
    { label: "\u7528\u6237\u8F93\u5165", desc: "\u201C\u5E2E\u6211\u8F6C\u8D26\u7ED9\u5F20\u4E09\u4E00\u767E\u5757\u201D", color: C.accentBlue },
    { label: "\u610F\u56FE\u8BC6\u522B\u5C42", desc: "LLM\u7406\u89E3\u81EA\u7136\u8BED\u8A00 \u2192 \u68C0\u7D22\u5339\u914DSkill\u5E93", color: C.orange },
    { label: "Skill\u8DEF\u7531\u5F15\u64CE", desc: "\u547C\u53EB\u540E\u7AEFAPI\uFF0C\u5B89\u5168\u7EA7\u522B\u6821\u9A8C\uFF08QUERY/\u6267\u884C\u4E24\u9636\u6BB5\uFF09", color: C.highlight },
    { label: "\u4E1A\u52A1\u6267\u884C\u5C42", desc: "\u540E\u7AEFService\u6267\u884C\u64CD\u4F5C\uFF0C\u7ED3\u6784\u5316\u8FD4\u56DE\uFF08\u56DE\u590D+\u6570\u636E+\u5BFC\u822A\uFF09", color: C.green },
  ];
  mcpSteps.forEach((s, i) => {
    const y = 1.9 + i * 1.0;
    s_mcp.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 5.1, h: 0.8, fill: { color: C.white }, cornerRadius: 0.08, line: { color: s.color, width: 1 } });
    s_mcp.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 0.15, h: 0.8, fill: { color: s.color }, cornerRadius: 0 });
    s_mcp.addText(s.label, { x: 1.2, y: y + 0.05, w: 4.5, h: 0.3, fontSize: 13, fontFace: F.title, color: s.color, bold: true });
    s_mcp.addText(s.desc, { x: 1.2, y: y + 0.38, w: 4.5, h: 0.35, fontSize: 11, fontFace: F.body, color: C.bodyGray });
    if (i < mcpSteps.length - 1) {
      s_mcp.addText("\u2193", { x: 3.0, y: y + 0.78, w: 0.6, h: 0.25, fontSize: 16, fontFace: F.body, color: C.subtitleGray, align: "center" });
    }
  });

  // \u53F3\u4FA7\uFF1A\u56DB\u5927\u6838\u5FC3\u7279\u6027
  s_mcp.addText("\u56DB\u5927\u6838\u5FC3\u7279\u6027", { x: 6.6, y: 1.3, w: 6, h: 0.35, fontSize: 14, fontFace: F.title, color: C.titleGray, bold: true });
  const mcpFeats = [
    { n: "01", t: "\u6807\u51C6\u5316\u63A5\u53E3 + \u52A8\u6001\u6CE8\u518C", d: "\u6BCF\u4E2ASKill\u7EDF\u4E00\u6807\u51C6\uFF0C\u53EF\u52A8\u6001\u6CE8\u518C\u548C\u5378\u8F7D\uFF0C\u65B0\u589E\u80FD\u529B\u65E0\u9700\u91CD\u542F\u7CFB\u7EDF\u3002" },
    { n: "02", t: "\u5B89\u5168\u5206\u7EA7\uFF1AQUERY / \u6267\u884C\u4E24\u9636\u6BB5", d: "\u67E5\u8BE2\u64CD\u4F5C\u81EA\u52A8\u653E\u884C\uFF0C\u5199\u5165\u64CD\u4F5C\u5FC5\u987B\u7528\u6237\u786E\u8BA4 + \u9632\u6B3A\u9A97\u8B66\u544A\u3002" },
    { n: "03", t: "\u7ED3\u6784\u5316\u8FD4\u56DE\uFF1A\u56DE\u590D+\u6570\u636E+\u5BFC\u822A", d: "AI\u8FD4\u56DE\u7ED3\u6784\u5316\u5BF9\u8BDD+\u4E1A\u52A1\u6570\u636E+\u7ED3\u7B97\u9875\u5BFC\u822A\uFF0C\u524D\u7AEF\u81EA\u7531\u6E32\u67D3\u3002" },
    { n: "04", t: "LLM\u65E0\u5173\u8BBE\u8BA1\uFF1A\u5F53\u524D\u89C4\u5219\uFF0C\u672A\u6765\u53EF\u5207\u6362", d: "\u610F\u56FE\u63A8\u7406\u4E0E\u4E1A\u52A1\u6267\u884C\u89E3\u8026\uFF0C\u53EF\u66FF\u6362\u4EFB\u4F55LLM\u800C\u4E0D\u5F71\u54CD\u4E1A\u52A1\u903B\u8F91\u3002" },
  ];
  mcpFeats.forEach((f, i) => {
    const y = 1.85 + i * 1.0;
    s_mcp.addShape(pptx.ShapeType.roundRect, { x: 6.6, y, w: 6.0, h: 0.8, fill: { color: C.cardBg }, cornerRadius: 0.08, line: { color: C.borderGray, width: 0.5 } });
    s_mcp.addShape(pptx.ShapeType.ellipse, { x: 6.8, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: C.accentBlue } });
    s_mcp.addText(f.n, { x: 6.8, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 12, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s_mcp.addText(f.t, { x: 7.5, y: y + 0.05, w: 5.0, h: 0.3, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
    s_mcp.addText(f.d, { x: 7.5, y: y + 0.35, w: 5.0, h: 0.4, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.2 });
  });
  
  // MCP-Skill科普：术语解释脚注
  s_mcp.addShape(pptx.ShapeType.roundRect, { x: 6.6, y: 5.75, w: 6.0, h: 0.4, fill: { color: "FFF8E1" }, cornerRadius: 0.06 });
  s_mcp.addText("术语解释：MCP=Model Context Protocol（开放标准） | Skill=自研AI能力封装层 | MCP-Skill=解耦意图与执行的安全架构", {
    x: 6.8, y: 5.75, w: 5.6, h: 0.4, fontSize: 10, fontFace: F.body, color: "8D6E63", align: "center", valign: "middle",
  });
  
  // 底部强调——Why Better
  s_mcp.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 6.3, w: 10.33, h: 0.65, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s_mcp.addText("\u76F8\u6BD4\u76F4\u63A5\u8BA9LLM\u8C03\u7528API\uFF1AMCP-Skill\u591A\u4E86\u5B89\u5168\u5206\u7EA7\u6821\u9A8C\u3001\u53C2\u6570Schema\u6821\u9A8C\u3001\u7ED3\u6784\u5316\u8FD4\u56DE\u5951\u7EA6\u2014\u2014\u8BA9\u4E1A\u52A1\u64CD\u4F5C\u53EF\u5BA1\u8BA1\u3001\u53EF\u7BA1\u63A7\u3001\u53EF\u66FF\u6362\u3002\u8FD9\u4E0D\u662F\u201C\u7528AI\u5199\u4EE3\u7801\u201D\uFF0C\u8FD9\u662F\u201C\u8BA9AI\u5B89\u5168\u5730\u64CD\u4F5C\u4E00\u4E2A\u94F6\u884C\u7CFB\u7EDF\u201D\u3002", {
    x: 1.7, y: 6.3, w: 9.93, h: 0.65, fontSize: 11, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle", lineSpacingMultiple: 1.3,
  });

  addTransition(s_mcp, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1AAI\u521B\u65B0\u4E09\u5927\u80FD\u529B\u7684\u771F\u5B9E\u6F14\u793A");

  s_mcp.addNotes(`先解释一下MCP-Skill是什么。MCP是Model Context Protocol的缩写，即模型上下文协议，是个开放的开源标准。Skill是我们在这个协议之上自研的能力封装层。MCP-Skill=在MCP标准协议上构建的安全业务操作框架，核心思想非常简洁：大模型只负责理解和推理，不直接操作任何业务。所有的业务操作——查余额、转账、绑卡——都封装成标准的Skill，由路由引擎根据AI识别的意图来调用。右侧是MCP-Skill的四大特性，特别值得关注的是第四点——LLM无关设计，当前这套规则与具体的大模型无关，未来可以切换到任何LLM。`);

  // ============================================================
  // SLIDE 5: AI创新——三大核心能力
  // ============================================================
  const s4 = pptx.addSlide();
  s4.background = { color: C.white };
  addSlideHeader(s4, pptx, "AI\u521B\u65B0\u80FD\u529B", "\u667A\u80FD\u5BA2\u670D \u00B7 \u6D88\u8D39\u5206\u6790 \u00B7 \u5B89\u5168\u8F6C\u8D26");

  const aiCols = [
    { img: "ai-transaction.png", title: "\u667A\u80FD\u5BA2\u670D", desc1: "\u81EA\u7136\u8BED\u8A00\u2192\u610F\u56FE\u8BC6\u522B", desc2: "\u2192 Skill\u8DEF\u7531\u2192\u7ED3\u6784\u5316\u8FD4\u56DE", color: C.accentBlue },
    { img: "consumption-analysis.png", title: "\u6D88\u8D39\u5206\u6790", desc1: "10\u5927\u5206\u7C7B\u00B7200+\u5173\u952E\u8BCD", desc2: "AI\u81EA\u52A8\u5206\u6790\u00B7\u6708\u5EA6\u62A5\u544A\u6587\u6848", color: C.orange },
    { img: "ai-transfer.png", title: "\u5B89\u5168\u8F6C\u8D26", desc1: "\u4E24\u9636\u6BB5\u786E\u8BA4\u6D41\u7A0B", desc2: "\u8F6C\u8D26\u5BC6\u7801\u00B7\u9632\u6B3A\u9A97\u8B66\u544A", color: C.green },
  ];

  aiCols.forEach((col, i) => {
    const x = 0.5 + i * 4.2;
    const y = 1.2;

    // 卡片背景
    addCard(s4, pptx, x, y, 3.9, 5.3);
    s4.addShape(pptx.ShapeType.rect, { x, y, w: 3.9, h: 0.06, fill: { color: col.color } });

    // 标题
    s4.addText(col.title, { x: x + 0.3, y: y + 0.2, w: 3.3, h: 0.4, fontSize: 16, fontFace: F.title, color: col.color, bold: true, align: "center" });

    // 截图
    const imgPath = path.join(SCREENSHOTS, col.img);
    try {
      s4.addImage({ path: imgPath, x: x + 0.5, y: y + 0.7, w: 2.9, h: 3.6, sizing: { type: "contain", w: 2.9, h: 3.6 } });
    } catch (e) {
      s4.addText("[ \u622A\u56FE\u52A0\u8F7D\u5931\u8D25 ]", { x: x + 0.5, y: y + 0.7, w: 2.9, h: 3.6, fontSize: 10, fontFace: F.body, color: C.subtitleGray, align: "center", valign: "middle" });
    }

    // 描述
    s4.addText(col.desc1, { x: x + 0.3, y: y + 4.4, w: 3.3, h: 0.35, fontSize: 11, fontFace: F.body, color: C.bodyGray, align: "center" });
    s4.addText(col.desc2, { x: x + 0.3, y: y + 4.75, w: 3.3, h: 0.35, fontSize: 11, fontFace: F.body, color: C.bodyGray, align: "center" });
  });

  // 底部技术标注
  s4.addText("\u203B \u4EE5\u4E0A\u80FD\u529B\u5747\u57FA\u4E8E\u81EA\u7814MCP-Skill\u67B6\u6784\u5B9E\u73B0\uFF1A\u5927\u6A21\u578B\u53EA\u8D1F\u8D23\u7406\u89E3\u4E0E\u63A8\u7406\uFF0C\u4E1A\u52A1\u64CD\u4F5C\u901A\u8FC7Skill\u59D4\u6258\u7ED9\u540E\u7AEFAPI", {
    x: 0.8, y: 6.65, w: 11.73, h: 0.3, fontSize: 9, fontFace: F.body, color: C.subtitleGray, italic: true, align: "center",
  });

  addTransition(s4, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u8FD9\u4E9B\u80FD\u529B\u4E3A\u4EC0\u4E48\u4F1A\u88AB\u521B\u9020\u51FA\u6765\uFF1F");

  s4.addNotes(`三个AI能力，每个都有真实截图。左边是智能客服——用户说“我要看我最近的消费记录”，AI理解意图，返回结构化的交易列表。中间是消费分析——十大消费分类，两百多个关键词，自动生成月度洞察文案。右边是安全转账——用户说“转账给张三一百块”，AI提取参数，两阶段确认流程。每个能力都跑通了从用户输入到业务完成的全链路。所有能力都基于我们自研的MCP-Skill架构——大模型只负责理解和推理，业务操作通过Skill委托给后端API。`);

  // ============================================================
  // SLIDE 6: 认知拐点
  // ============================================================
  const s6 = pptx.addSlide();
  s6.background = { color: C.white };
  addSlideHeader(s6, pptx, "\u8BA4\u77E5\u62D0\u70B9", "\u4E00\u6B21\u8C03\u6559\u4E2D\u7684\u987F\u609F\u65F6\u523B");

  addCard(s6, pptx, 0.6, 1.2, 5.8, 5.2);
  s6.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.2, w: 5.8, h: 0.06, fill: { color: C.highlight } });
  s6.addText("Before\uFF1A\u4EE3\u7801\u4F18\u5148", { x: 0.8, y: 1.4, w: 5.4, h: 0.45, fontSize: 18, fontFace: F.title, color: C.highlight, bold: true });
  s6.addText("1. \u62FF\u5230\u9700\u6C42 \u2192 \u8BA9AI\u5199\u4EE3\u7801\n\n2. \u51FABUG \u2192 \u76F4\u63A5\u6539\u4EE3\u7801\u4FEE\u590D\n\n3. \u65B0\u9700\u6C42 \u2192 AI\u91CD\u65B0\u751F\u6210\n\n4. \u8001BUG\u518D\u73B0\u2014\u2014\u56E0\u4E3A\u6587\u6863\u6CA1\u6709\u540C\u6B65\u4FEE\u6539", {
    x: 1.0, y: 2.0, w: 5.0, h: 3.0, fontSize: 12, fontFace: F.body, color: C.bodyGray, lineSpacingMultiple: 1.6, valign: "top",
  });
  s6.addText("\u8FD9\u4E0D\u662F\u4EE3\u7801\u7684\u95EE\u9898\uFF0C\u662F\u6587\u6863\u7684\u95EE\u9898\u3002", { x: 1.0, y: 5.3, w: 5.0, h: 0.5, fontSize: 12, fontFace: F.body, color: C.highlight, bold: true, italic: true });

  addCard(s6, pptx, 6.9, 1.2, 5.8, 5.2);
  s6.addShape(pptx.ShapeType.rect, { x: 6.9, y: 1.2, w: 5.8, h: 0.06, fill: { color: C.green } });
  s6.addText("After\uFF1A\u6587\u6863\u5148\u884C", { x: 7.1, y: 1.4, w: 5.4, h: 0.45, fontSize: 18, fontFace: F.title, color: C.green, bold: true });
  s6.addText("1. \u62FF\u5230\u9700\u6C42 \u2192 \u5148\u4FEE\u6539\u6587\u6863\n\n2. \u8BA9AI\u6309\u65B0\u6587\u6863\u751F\u6210\u4EE3\u7801\n\n3. Review \u2192 \u53D1\u73B0\u8BED\u4E49\u504F\u5DEE\n\n4. \u56DE\u5934\u4FEE\u6539\u6587\u6863\u63CF\u8FF0 \u2192 \u518D\u751F\u6210\n\n5. \u4EE3\u7801\u53D8\u66F4\u662F\u6587\u6863\u53D8\u66F4\u7684\u201C\u7F16\u8BD1\u7ED3\u679C\u201D", {
    x: 7.3, y: 2.0, w: 5.0, h: 3.5, fontSize: 12, fontFace: F.body, color: C.bodyGray, lineSpacingMultiple: 1.6, valign: "top",
  });

  s6.addShape(pptx.ShapeType.ellipse, { x: 5.8, y: 3.2, w: 1.73, h: 0.6, fill: { color: C.orange } });
  s6.addText("\u987F\u609F", { x: 5.8, y: 3.2, w: 1.73, h: 0.6, fontSize: 16, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });

  s6.addShape(pptx.ShapeType.roundRect, { x: 2.5, y: 6.6, w: 8.33, h: 0.5, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s6.addText("\u6587\u6863\u4E0D\u662F\u8BF4\u660E\u4E66\uFF0C\u6587\u6863\u662F\u6E90\u4EE3\u7801\u3002\u4EE3\u7801\u53D8\u66F4\u53EA\u662F\u6587\u6863\u53D8\u66F4\u7684\u7F16\u8BD1\u7ED3\u679C\u3002", {
    x: 2.7, y: 6.6, w: 7.93, h: 0.5, fontSize: 13, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s6, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u57FA\u4E8E\u8FD9\u4E2A\u8BA4\u77E5\uFF0C\u6211\u4EEC\u5F62\u6210\u4E86\u95ED\u73AF\u65B9\u6CD5");

  s6.addNotes(`这一页是整个项目最重要的一个顿悟。最开始我们的做法很简单——让AI写代码，出BUG直接改代码。听起来很高效，对吧？但一个现象反复出现：修好的老BUG，在新功能中又冒出来了。花了一整天才意识到——AI不是基于我们最新代码来理解的，它是基于文档来理解的。你不改文档，AI根本不知道你做过什么修改。而且我们还发现了一个更前置的关键：文档本身也是AI生成的——让AI扮演产品经理、架构师、开发、测试等不同角色，从不同视角编写标准化文档。从那一刻起，规矩彻底变了：先改文档，再生成代码。代码变更，只是文档变更的编译结果。`);

  // ============================================================
  // SLIDE 7: 调教方法论 + 五条纪律
  // ============================================================
  const s7 = pptx.addSlide();
  s7.background = { color: C.white };
  addSlideHeader(s7, pptx, "\u6587\u6863\u9A71\u52A8\u95ED\u73AF", "\u4EE5\u6587\u6863\u4E3A\u4E2D\u5FC3\u7684\u8FED\u4EE3\u95ED\u73AF");

  s7.addShape(pptx.ShapeType.ellipse, { x: 5.2, y: 1.3, w: 2.8, h: 1.0, fill: { color: C.accentBlue } });
  s7.addText("文档", { x: 5.2, y: 1.3, w: 2.8, h: 1.0, fontSize: 26, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
   s7.addText("（由AI扮演五大角色编写）", { x: 4.6, y: 2.3, w: 3.8, h: 0.3, fontSize: 9, fontFace: F.body, color: C.subtitleGray, align: "center", valign: "middle" });

  const loopPts = [
    { label: "\u4FEE\u6539\u6587\u6863", x: 4.8, y: 0.4, color: C.orange },
    { label: "AI\u751F\u6210\u4EE3\u7801", x: 9.3, y: 1.8, color: C.green },
    { label: "\u4EE3\u7801Review", x: 4.8, y: 3.2, color: C.primaryBlue },
    { label: "\u53D1\u73B0\u95EE\u9898", x: 0.4, y: 1.8, color: C.highlight },
  ];
  loopPts.forEach(p => {
    s7.addShape(pptx.ShapeType.roundRect, { x: p.x, y: p.y, w: 3.2, h: 0.5, fill: { color: p.color }, cornerRadius: 0.08 });
    s7.addText(p.label, { x: p.x, y: p.y, w: 3.2, h: 0.5, fontSize: 10, fontFace: F.body, color: C.white, bold: true, align: "center", valign: "middle" });
  });

  // 闭环箭头指示（连接4个节点形成顺时针闭环）
  const arr = { fontSize: 16, fontFace: F.body, color: C.accentBlue, bold: true, align: "center", valign: "middle" };
  // ① 修改文档→AI生成代码（顶部节点右侧，指向右）
  s7.addText("\u25B6", { x: 8.0, y: 0.65, w: 1.3, h: 0.35, ...arr });
  // ② AI生成代码→代码Review（右节点下方，指向下）
  s7.addText("\u25BC", { x: 10.9, y: 2.3, w: 0.35, h: 0.9, ...arr });
  // ③ 代码Review→发现问题（底节点左侧，指向左）
  s7.addText("\u25C0", { x: 4.8, y: 3.2, w: 1.3, h: 0.35, ...arr });
  // ④ 发现问题→修改文档（左节点上方，指向上）
  s7.addText("\u25B2", { x: 4.0, y: 0.9, w: 0.35, h: 0.9, ...arr });
  s7.addText("\u5931\u8D25\u6BD4\u4F8B > \u6210\u529F\u6BD4\u4F8B\uFF1A\u6BCF\u6B21\u6210\u529F\u8C03\u6559\u80CC\u540E\u67093-4\u6B21\u5931\u8D25\u63CF\u8FF0\u5C1D\u8BD5", { x: 0.8, y: 3.9, w: 6.0, h: 0.3, fontSize: 10, fontFace: F.body, color: C.highlight });

  s7.addShape(pptx.ShapeType.rect, { x: 0.8, y: 4.3, w: 11.73, h: 0.02, fill: { color: C.borderGray } });

  const disciplines = [
    { num: "01", title: "\u6587\u6863\u5148\u884C", desc: "\u5148\u6539\u6587\u6863\u518D\u6539\u4EE3\u7801\u3002\u6587\u6863\u662F\u201C\u8C03\u6559\u53C2\u6570\u201D\uFF0C\u4EE3\u7801\u662F\u8F93\u51FA\u3002" },
    { num: "02", title: "\u589E\u91CF\u53D8\u66F4", desc: "\u6539\u4E00\u5904\u751F\u6210\u4E00\u5904\uFF0C\u4E0D\u5168\u91CF\u8986\u76D6\u3002" },
    { num: "03", title: "\u4E0D\u6539\u65E7\u4EE3\u7801", desc: "\u5DF2\u8C03\u597D\u7684\u903B\u8F91\u4E0D\u52A8\uFF0C\u53EA\u901A\u8FC7\u6539\u6587\u6863\u89E6\u53D1\u65B0\u751F\u6210\u3002" },
    { num: "04", title: "\u8BB0\u5F55\u53D8\u66F4", desc: "\u6BCF\u6B21\u8C03\u6559\u8BB0\u5F55\uFF1A\u6539\u4E86\u5565\u2192\u4E3A\u4EC0\u4E48\u2192\u7ED3\u679C\u3002" },
    { num: "05", title: "\u540C\u6B65\u66F4\u65B0", desc: "\u8C03\u6559\u4E2D\u6C89\u6DC0\u7684\u89C4\u5219\u5373\u65F6\u5199\u56DE\u6587\u6863\u3002" },
  ];
  disciplines.forEach((d, i) => {
    const x = 0.5 + i * 2.5;
    const y = 4.6;
    s7.addShape(pptx.ShapeType.ellipse, { x: x + 0.15, y, w: 0.4, h: 0.4, fill: { color: C.accentBlue } });
    s7.addText(d.num, { x: x + 0.15, y, w: 0.4, h: 0.4, fontSize: 12, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s7.addText(d.title, { x: x + 0.7, y, w: 1.8, h: 0.4, fontSize: 12, fontFace: F.title, color: C.titleGray, bold: true, valign: "middle" });
    s7.addText(d.desc, { x: x + 0.15, y: y + 0.5, w: 2.2, h: 0.6, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.3 });
  });

  s7.addShape(pptx.ShapeType.roundRect, { x: 2.0, y: 5.9, w: 9.33, h: 0.45, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s7.addText("\u4EE5\u524D\u6211\u662F\u7F16\u7801\u8005\uFF0C\u73B0\u5728\u6211\u662F\u8C03\u6559\u5E08", {
    x: 2.0, y: 5.9, w: 9.33, h: 0.45, fontSize: 13, fontFace: F.body, color: C.accentBlue, bold: true, align: "center", valign: "middle", letterSpacing: 2,
  });

  s7.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 6.2, w: 11.73, h: 0.5, fill: { color: "F5F5F5" }, cornerRadius: 0.06 });
  s7.addText("\u8C03\u6559\u65E5\u5FD7\u8282\u9009\uFF1A[2026-04-25] \u9700\u6C42F-TRANS-003 | \u4EA4\u6613\u91D1\u989D\u65B9\u5411\u7B26\u53F7 | \u6587\u6863\u4ECE\u201C\u652F\u51FA\u5B58\u6B63\u6570\u201D\u6539\u4E3A\u201C\u652F\u51FA\u5B58\u8D1F\u6570(amount.negate())\u201D | AI\u4EE3\u7801\u7ACB\u5373\u6B63\u786E", {
    x: 1.0, y: 6.2, w: 11.33, h: 0.5, fontSize: 10, fontFace: "Courier New", color: C.subtitleGray, valign: "middle",
  });

  addTransition(s7, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u65B0\u65B9\u6CD5\u4E0E\u4F20\u7EDF\u7684\u672C\u8D28\u5DEE\u5F02");

  s7.addNotes(`基于这个认知，我们形成了以文档为中心的闭环迭代法。核心模型在这一页：文档在中央——但这里的关键一步是：这些文档不是我们手写的，是让AI扮演不同角色编写的。产品经理写需求文档、系统架构师写设计方案、开发写开发规范、测试写测试用例。这七份文档全部由AI以特定角色视角生成，构成了完整的研发基线。然后我们在文档基础上做四步循环——修改文档，AI生成代码，代码Review，发现问题，再回到修改文档。下面是我们从实操中沉淀的五条纪律：文档先行、增量变更、不改旧代码、记录变更、同步更新。每一条都是从真实的失败中总结出来的。最下面是我真实的调教日志节选——二六年四月二十五日，交易金额方向符号问题。文档从“支出存正数”改为“支出存负数(amount.negate())”。就这一句话的改动，AI代码立刻正确。这就是文档驱动闭环的力量。`);

  // ============================================================
  // SLIDE 8: 研发范式对比——传统 vs AI原生
  // ============================================================
  const s8 = pptx.addSlide();
  s8.background = { color: C.white };
  addSlideHeader(s8, pptx, "研发范式对比", "传统研发与AI原生研发的本质差异");
  
  const colX = [0.8, 3.5, 7.5];
  const colW = [2.5, 3.8, 5.0];
  ["\u7EF4\u5EA6", "\u4F20\u7EDF\u7814\u53D1", "AI\u539F\u751F\u7814\u53D1"].forEach((c, i) => {
    s8.addShape(pptx.ShapeType.roundRect, { x: colX[i], y: 1.3, w: colW[i], h: 0.5, fill: { color: i === 0 ? C.titleGray : i === 1 ? "95A5A6" : C.accentBlue }, cornerRadius: 0.06 });
    s8.addText(c, { x: colX[i], y: 1.3, w: colW[i], h: 0.5, fontSize: 13, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
  });
  
  const rows = [
    ["\u6838\u5FC3\u4EA7\u7269", "\u4EE3\u7801", "\u6587\u6863\uFF08\u4EE3\u7801\u662F\u7F16\u8BD1\u7ED3\u679C\uFF09"],
    ["\u4EBA\u7684\u89D2\u8272", "\u7F16\u7801\u8005", "\u89C4\u683C\u5DE5\u7A0B\u5E08"],
    ["Debug\u5BF9\u8C61", "\u8BED\u6CD5\u9519\u8BEF / \u903B\u8F91BUG", "\u8BED\u4E49\u6B67\u4E49 / AI\u7406\u89E3\u504F\u5DEE"],
    ["\u53D8\u66F4\u65B9\u5F0F", "\u6539\u4EE3\u7801 \u2192 \u8865\u6587\u6863", "\u6539\u6587\u6863 \u2192 \u518D\u751F\u4EE3\u7801"],
    ["\u6267\u884C\u98CE\u9669", "\u9AD8\uFF08\u80FD\u4E0D\u80FD\u8DD1\u901A\uFF09", "\u4F4E\uFF08AI\u5199\u7684\u8BED\u6CD5\u4E00\u5B9A\u5BF9\uFF09"],
    ["\u8BBE\u8BA1\u98CE\u9669", "\u4F4E\uFF08\u8981\u505A\u4EC0\u4E48\u5F88\u6E05\u695A\uFF09", "\u9AD8\uFF08\u6700\u96BE\u662F\u7CBE\u786E\u544A\u8BC9AI\uFF09"],
  ];
  
  rows.forEach((r, i) => {
    const y = 1.95 + i * 0.7;
    const bgColor = i % 2 === 0 ? C.white : C.lightBg;
    r.forEach((cell, j) => {
      s8.addShape(pptx.ShapeType.roundRect, { x: colX[j], y, w: colW[j], h: 0.6, fill: { color: bgColor }, cornerRadius: 0.04, line: { color: C.borderGray, width: 0.3 } });
      const isSpecial = (i >= 4 && j >= 1);
      s8.addText(cell, {
        x: colX[j], y, w: colW[j], h: 0.6, fontSize: 11, fontFace: F.body,
        color: (j === 0 ? C.titleGray : isSpecial && j === 1 ? C.highlight : isSpecial && j === 2 ? C.orange : C.bodyGray),
        bold: (j === 0 || isSpecial), align: "center", valign: "middle",
      });
    });
  });
  
  // 底部强调——实证数据
  s8.addShape(pptx.ShapeType.rect, { x: 0.8, y: 6.3, w: 11.73, h: 0.02, fill: { color: C.borderGray } });
  s8.addText("\u5B9E\u8BC1\u6570\u636E\uFF1AAI\u4EE3\u7801\u751F\u6210\u7387~90% \u00B7 7\u4EFD\u4E13\u4E1A\u6587\u6863\u5168\u6D41\u7A0B\u9A71\u52A8 \u00B7 3\u4E2AMCP-Skill\u8986\u76D6\u6838\u5FC3\u573A\u666F\u2014\u2014\u4ECE\u201C\u8BA9AI\u5199\u4EE3\u7801\u201D\u5230\u201C\u8BA9AI\u7406\u89E3\u4E1A\u52A1\u201D\uFF0C\u4EBA\u7684\u4EF7\u503C\u4ECE\u7F16\u7801\u901F\u5EA6\u8F6C\u53D8\u4E3A\u89C4\u683C\u8868\u8FBE\u80FD\u529B\u3002", {
    x: 1.0, y: 6.45, w: 11.33, h: 0.35, fontSize: 12, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });
  
  addTransition(s8, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u652F\u6491\u8FD9\u5957\u65B9\u6CD5\u7684\u6280\u672F\u67B6\u6784");
  
  s8.addNotes(`接下来看这套方法与传统的研发方式到底有什么本质区别。这张对比表从六个维度展开。最关键的还不是前三行，是最后两行——执行风险和设计风险的逆转。在传统研发中，最大的风险是代码能不能跑通。但在AI原生研发中，AI写的代码语法一定是对的，所以执行风险降到了零。但设计风险却升高了——最难的事情变成了如何精确告诉AI你要什么。我们的实证数据如下方所示：AI代码生成率接近90%、七份专业文档全流程驱动、三个MCP-Skill覆盖核心场景。这就带来一个深刻的问题：如果你的核心竞争力不再是写代码的速度，那应该是什么？我们的答案是：规格表达能力——让AI理解业务的能力。`);

  // ============================================================
  // SLIDE 9: 技术框架
  // ============================================================
  const s9 = pptx.addSlide();
  s9.background = { color: C.white };
  addSlideHeader(s9, pptx, "\u6280\u672F\u6846\u67B6", "\u8C03\u6559\u7684\u6280\u672F\u57FA\u77F3");

  s9.addText("\u7CFB\u7EDF\u67B6\u6784", { x: 0.8, y: 1.2, w: 4, h: 0.35, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  const layers = [
    { label: "6 \u5BA2\u6237\u7AEF", desc: "Vue 2 + Vant 2", color: "8E44AD" },
    { label: "5 \u63A5\u5165\u5C42", desc: "JWT\u7EDF\u4E00\u6821\u9A8C", color: C.accentBlue },
    { label: "4 \u610F\u56FE\u63A8\u7406\u5C42", desc: "MCP-Skill\u5F15\u64CE\u203B", color: C.orange },
    { label: "3 \u4E1A\u52A1\u670D\u52A1\u5C42", desc: "6\u5927\u6838\u5FC3Service", color: C.green },
    { label: "2 \u6570\u636E\u6301\u4E45\u5C42", desc: "MyBatis-Plus+MySQL\u52A0\u5BC6", color: C.primaryBlue },
    { label: "1 \u57FA\u7840\u8BBE\u65BD", desc: "Docker\u5BB9\u5668\u5316", color: C.titleGray },
  ];
  layers.forEach((l, i) => {
    const y = 1.6 + i * 0.55;
    s9.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 4.5, h: 0.45, fill: { color: l.color }, cornerRadius: 0.05 });
    s9.addText(l.label, { x: 1.0, y, w: 1.2, h: 0.45, fontSize: 9, fontFace: F.title, color: C.white, bold: true, valign: "middle" });
    s9.addText(l.desc, { x: 2.3, y, w: 2.8, h: 0.45, fontSize: 9, fontFace: F.body, color: "E8E8E8", valign: "middle" });
  });

  s9.addText("MCP-Skill\u6838\u5FC3\u7279\u6027", { x: 5.8, y: 1.2, w: 5, h: 0.35, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  const feats = ["\u2460 \u6807\u51C6\u5316\u63A5\u53E3+ \u52A8\u6001\u6CE8\u518C", "\u2461 \u5B89\u5168\u5206\u7EA7\uFF1AQUERY/\u6267\u884C\u4E24\u9636\u6BB5", "\u2462 \u7ED3\u6784\u5316\u8FD4\u56DE\uFF1A\u56DE\u590D+\u6570\u636E+\u5BFC\u822A", "\u2463 LLM\u65E0\u5173\u8BBE\u8BA1\uFF1A\u5F53\u524D\u89C4\u5219\uFF0C\u672A\u6765\u53EF\u5207LLM"];
  feats.forEach((f, i) => { s9.addText(f, { x: 5.8, y: 1.65 + i * 0.42, w: 6.5, h: 0.38, fontSize: 9, fontFace: F.body, color: C.bodyGray, valign: "middle" }); });

  s9.addText("\u5B89\u5168\u4FDD\u62A4", { x: 5.8, y: 3.5, w: 5, h: 0.3, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  s9.addText("\u8EAB\u4EFD\u8BA4\u8BC1 | \u6570\u636E\u52A0\u5BC6(bcrypt+AES) | \u9632\u653B\u51FB(\u9501\u5B9A+30s\u9632\u91CD\u590D) | AOP\u5BA1\u8BA1\u65E5\u5FD7", { x: 5.8, y: 3.85, w: 6.5, h: 0.35, fontSize: 9, fontFace: F.body, color: C.bodyGray, valign: "middle" });

  s9.addText("AI\u80FD\u529B", { x: 5.8, y: 4.3, w: 5, h: 0.3, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  s9.addText("\u667A\u80FD\u5BA2\u670D | \u6D88\u8D39\u5206\u6790(10\u7C7B+\u6708\u62A5) | AI\u6D1E\u5BDF\u5F15\u64CE", { x: 5.8, y: 4.65, w: 6.5, h: 0.35, fontSize: 9, fontFace: F.body, color: C.bodyGray, valign: "middle" });

  // MCP-Skill\u811A\u6CE8\uFF08\u79FB\u81F3y=5.0\uFF09
  s9.addText("\u203B MCP-Skill=\u81EA\u7814AI\u80FD\u529B\u5C01\u88C5\u6846\u67B6\uFF1A\u610F\u56FE\u63A8\u7406\u4E0E\u4E1A\u52A1\u6267\u884C\u89E3\u8026", { x: 0.8, y: 5.0, w: 11.73, h: 0.3, fontSize: 9, fontFace: F.body, color: C.subtitleGray, italic: true });

  // \u4FE1\u4EFB\u9677\u9631\u6848\u4F8B\u5F15\u7528\u2192 Slide 10
  s9.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 5.4, w: 11.73, h: 0.5, fill: { color: C.lightBg }, cornerRadius: 0.08 });
  s9.addText("\u4FE1\u4EFB\u9677\u9631\u6848\u4F8B\uFF1A\u4EA4\u6613\u91D1\u989D\u65B9\u5411\u7B26\u53F7\u2014\u2014\u8BE6\u89C1\u4E0B\u4E00\u9875\u201C\u771F\u5B9E\u6311\u6218\u201D\u7BC7\u7AE0", {
    x: 1.0, y: 5.4, w: 11.33, h: 0.5, fontSize: 12, fontFace: F.body, color: C.primaryBlue, valign: "middle", align: "center", bold: true,
  });

  addTransition(s9, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u6280\u672F\u67B6\u6784\u80CC\u540E\u7684\u771F\u5B9E\u6311\u6218\u4E0E\u5E94\u5BF9");

  s9.addNotes(`这套方法需要技术的支撑。我们采用了全栈架构，六层结构从客户端到数据持久化层。核心是中间这一层——我们自研的MCP-Skill引擎，实现了意图推理与业务执行的解耦。右侧是MCP-Skill的四个核心特性，特别强调第四点——LLM无关设计，当前这套规则未来可以切换任何大语言模型。关于信任陷阱的典型案例——交易金额方向符号问题，我们在下一章"真实挑战"中详细展开。`);

  // ============================================================
  // SLIDE 10: \u771F\u5B9E\u6311\u6218
  // ============================================================
  const s10 = pptx.addSlide();
  s10.background = { color: C.white };
  addSlideHeader(s10, pptx, "\u771F\u5B9E\u6311\u6218", "\u8C03\u6559\u4E2D\u8E29\u8FC7\u7684\u5751");
  
  const challenges = [
    { icon: "A", title: "AI\u610F\u56FE\u8BC6\u522B\u7CBE\u5EA6", color: C.accentBlue,
      challenge: "\u7528\u6237\u8BF4\u201C\u67E5\u4F59\u989D\u201D\u3001\u201C\u770B\u770B\u6211\u8FD8\u6709\u591A\u5C11\u94B1\u201D\u3001\u201C\u6211\u5361\u91CC\u8FD8\u6709\u591A\u5C11\u201D\u2014\u2014\u540C\u4E00\u4E2A\u610F\u56FE\uFF0C\u4E09\u79CD\u8868\u8FBE\u3002\u5199\u4E865\u7248\u6B63\u5219\u3001\u8BD5\u4E868\u7EC4\u5173\u952E\u8BCD\uFF0C\u7B2C9\u7248\u624D\u8986\u76D690%\u7684\u8F93\u5165\u3002\u6700\u96BE\u7684\u4E0D\u662F\u8BA9AI\u7406\u89E3\uFF0C\u800C\u662F\u7A77\u4E3E\u4EBA\u7C7B\u53EF\u80FD\u7684\u6240\u6709\u8BF4\u6CD5\u3002",
      solution: "\u5173\u952E\u8BCD+\u6B63\u5219\u53CC\u6A21\u5F0F\u5339\u914D + LLM\u515C\u5E95\u3002\u8FB9\u754Ccase\u9010\u4E00\u8865\u5145\u5230\u573A\u666F\u5E93\uFF0C\u6BCF\u65B0\u589E\u4E00\u4E2A\u8868\u8FBE\u5373\u523B\u66F4\u65B0\u6587\u6863\u3002" },
    { icon: "B", title: "AI\u4EE3\u7801\u7684\u4E1A\u52A1\u6821\u9A8C", color: C.orange,
      challenge: "\u8F6C\u8D26100\u5143\uFF0C\u6570\u636E\u5E93\u5B58\u4E86100.00\u2014\u2014AI\u6309\u7528\u6237\u8F93\u5165\u7684\u5B57\u9762\u503C\u5B58\u50A8\uFF0C\u903B\u8F91\u4E0A\u6CA1\u6BDB\u75C5\u3002\u4F46\u94F6\u884C\u7CFB\u7EDF\u91CC\uFF0C\u8F6C\u8D26\u662F\u652F\u51FA\uFF0C\u652F\u51FA\u5FC5\u987B\u4E3A\u8D1F\u3002\u4EE3\u7801\u8BED\u6CD5\u5B8C\u7F8E\u3001\u6CE8\u91CA\u9F50\u5168\u3001\u5355\u5143\u6D4B\u8BD5\u901A\u8FC7\u2014\u2014\u6B63\u56E0\u5982\u6B64\uFF0C\u8FD9\u4E2Abug\u5728\u7B2C\u4E00\u8F6Ereview\u65F6\u5B8C\u5168\u6CA1\u4EBA\u53D1\u73B0\u3002\u4FEE\u590D\u53EA\u82B1\u4E86\u4E00\u5206\u949F\uFF1A\u52A0\u4E86\u4E2A.negate()\u3002\u4F46\u627E\u5230\u5B83\u82B1\u4E86\u534A\u5929\u2014\u2014\u56E0\u4E3A\u6211\u4EEC\u4E00\u76F4\u9ED8\u8BA4AI\u7684\u4EE3\u7801\u662F\u5BF9\u7684\u3002",
      solution: "\u5EFA\u7ACB\u4E1A\u52A1\u6821\u9A8C\u6E05\u5355\uFF1A\u91D1\u989D\u65B9\u5411\u2192\u5B57\u6BB5\u7CBE\u5EA6\u2192\u5206\u7C7B\u89C4\u5219\u3002\u6838\u5FC3\u539F\u5219\uFF1AAI\u4EE3\u7801\u8D8A\u6F02\u4EAE\uFF0C\u5BA1\u67E5\u8D8A\u8981\u8B66\u60D5\u8BED\u4E49\u9519\u8BEF\u3002\u6BCF\u53D1\u73B0\u4E00\u4E2A\u8BED\u4E49bug\uFF0C\u540C\u6B65\u66F4\u65B0\u6821\u9A8C\u6E05\u5355\u3002" },
    { icon: "C", title: "\u524D\u540E\u7AEF\u5951\u7EA6\u5BF9\u9F50", color: C.highlight,
      challenge: "\u540E\u7AEF\u66B4\u9732/api/transactions\uFF0C\u524D\u7AEF\u8BF7\u6C42/api/transaction\u2014\u2014\u5DEE\u4E00\u4E2As\u3002\u540E\u7AEF\u53EBbankName\uFF0C\u524D\u7AEF\u4F20bank_name\u3002AI\u524D\u7AEF\u548CAI\u540E\u7AEF\u662F\u4E24\u6BB5\u72EC\u7ACB\u7684\u751F\u6210\uFF0C\u6CA1\u6709\u5171\u540C\u8BB0\u5FC6\u3002\u6BCF\u4E2A\u63A5\u53E3\u8DEF\u5F84\u3001\u53C2\u6570\u540D\u3001\u54CD\u5E94\u7ED3\u6784\u90FD\u9700\u8981\u4EBA\u5DE5\u5BF9\u9F50\uFF0C\u53EA\u80FD\u4E00\u4E2A\u4E00\u4E2A\u627E\uFF0C\u8D39\u65F6\u8FD8\u5BB9\u6613\u6F0F\u3002",
      solution: "\u62BD\u8C61ReqBase\u7EDF\u4E00\u8BF7\u6C42\u89C4\u8303\uFF0C\u524D\u540E\u7AEFAI\u5171\u4EAB\u540C\u4E00\u4EFD\u5951\u7EA6\u6A21\u677F\u3002\u65B0\u589E\u63A5\u53E3\u65F6\u5FC5\u987B\u5148\u66F4\u65B0\u5951\u7EA6\u6587\u6863\uFF0C\u518D\u5206\u522B\u751F\u6210\u524D\u7AEF\u548C\u540E\u7AEF\u4EE3\u7801\u3002" },
  ];
  
  challenges.forEach((c, i) => {
    const x = 0.6 + i * 4.2;
    const y = 1.3;
    addCard(s10, pptx, x, y, 3.9, 4.2);
    s10.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.9, h: 0.65, fill: { color: c.color }, cornerRadius: 0 });
    s10.addText(`${c.icon} ${c.title}`, { x, y, w: 3.9, h: 0.65, fontSize: 14, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s10.addText("\u6311\u6218", { x: x + 0.2, y: y + 0.85, w: 3.5, h: 0.25, fontSize: 11, fontFace: F.title, color: C.highlight, bold: true });
    s10.addShape(pptx.ShapeType.roundRect, { x: x + 0.2, y: y + 1.1, w: 3.5, h: 1.4, fill: { color: "FDEDEC" }, cornerRadius: 0.06 });
    s10.addText(c.challenge, { x: x + 0.3, y: y + 1.15, w: 3.3, h: 1.3, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.4 });
    s10.addText("\u5E94\u5BF9", { x: x + 0.2, y: y + 2.65, w: 3.5, h: 0.25, fontSize: 11, fontFace: F.title, color: C.green, bold: true });
    s10.addShape(pptx.ShapeType.roundRect, { x: x + 0.2, y: y + 2.9, w: 3.5, h: 0.8, fill: { color: "E8F8F5" }, cornerRadius: 0.06 });
    s10.addText(c.solution, { x: x + 0.3, y: y + 2.95, w: 3.3, h: 0.7, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.3 });
  });
  
  // \u5E95\u90E8\u603B\u7ED3\u2014\u2014\u8DF3\u51FA\u4E09\u4E2A\u6311\u6218\u7684\u5171\u540C\u8BA4\u8BC6
  s10.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 5.8, w: 10.33, h: 0.45, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s10.addText("\u771F\u5B9E\u6570\u636E\uFF1A\u6210\u529F\u8C03\u65591\u4E2A\u610F\u56FE\uFF0C\u5E73\u5747\u5931\u8D253-4\u6B21\u63CF\u8FF0\u5C1D\u8BD5\u3002AI\u4EE3\u7801\u8D8A\u6F02\u4EAE\uFF0C\u8D8A\u9700\u8981\u8B66\u60D5\u4E1A\u52A1\u8BED\u4E49\u9519\u8BEF\u3002", {
    x: 1.7, y: 5.8, w: 9.93, h: 0.45, fontSize: 12, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s10, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u6311\u6218\u4E4B\u540E\u6C89\u6DC0\u7684\u8BA4\u77E5\u5347\u7EA7");

  s10.addNotes(`当然，过程中充满了挑战。我重点分享三个。第一个，AI意图识别精度——"查余额""看看我还有多少钱""我卡里还有多少"，同一个意图三种表达，我们写了5版正则才覆盖90%。第二个，AI代码的业务校验——这是最典型的信任陷阱。转账100元，AI按字面值存在了数据库里，代码语法完美、注释齐全、测试通过。但银行系统里转账是支出，支出必须为负。修复只花了一分钟——.negate()。但发现这个bug花了半天，因为我们都默认AI的代码是对的。第三个，前后端契约对齐——/api/transactions少了s变成/api/transaction，bankName变成bank_name。AI前端和AI后端没有共同记忆。底部的这句话是我最深的感触：AI代码越漂亮，越需要警惕业务语义的错误。`);

  // ============================================================
  // SLIDE 11: 认知升级
  // ============================================================
  const s11 = pptx.addSlide();
  s11.background = { color: C.white };
  addSlideHeader(s11, pptx, "\u8BA4\u77E5\u5347\u7EA7", "\u56DB\u6761\u9012\u8FDB\u7684\u91CD\u65B0\u7406\u89E3");

  const upLevels = [
    { icon: "1", title: "\u4ECE\u300C\u4EE3\u7801\u662F\u4EA7\u7269\u300D\u5230\u300C\u6587\u6863\u662F\u4EA7\u7269\u300D", desc: "\u4EE3\u7801\u53D8\u66F4\u662F\u6587\u6863\u53D8\u66F4\u7684\u7F16\u8BD1\u7ED3\u679C\u3002\u6587\u6863\u8D28\u91CF\u51B3\u5B9A\u4EE3\u7801\u8D28\u91CF\u3002" },
    { icon: "2", title: "\u4ECE\u300CAI\u5199\u4EE3\u7801\u300D\u5230\u300CAI\u7406\u89E3\u4E1A\u52A1\u300D", desc: "AI\u6700\u5F3A\u7684\u4E0D\u662F\u751F\u6210\u4EE3\u7801\uFF0C\u800C\u662F\u7406\u89E3\u6587\u6863\u540E\u751F\u6210\u4EE3\u7801\u3002\u5173\u952E\u5728\u6587\u6863\u5199\u5F97\u5BF9\u3002" },
    { icon: "3", title: "\u4ECE\u300C\u7F16\u7801\u80FD\u529B\u300D\u5230\u300C\u89C4\u683C\u8868\u8FBE\u80FD\u529B\u300D", desc: "\u6700\u6709\u4EF7\u503C\u7684\u4E0D\u662F\u5199\u4EE3\u7801\u7684\u901F\u5EA6\uFF0C\u800C\u662F\u628A\u4E1A\u52A1\u89C4\u5219\u7CBE\u786E\u63CF\u8FF0\u7ED9AI\u7684\u80FD\u529B\u3002" },
    { icon: "4", title: "\u4ECE\u300C\u628A\u4EE3\u7801\u5199\u5BF9\u300D\u5230\u300C\u8BA9AI\u7406\u89E3\u5BF9\u300D", desc: "\u672A\u6765\u6838\u5FC3\u7ADE\u4E89\u529B\uFF1A\u4E0D\u662F\u4F60\u4F1A\u5199\u4EC0\u4E48\uFF0C\u800C\u662F\u4F60\u80FD\u5426\u8BA9AI\u6B63\u786E\u7406\u89E3\u4F60\u8981\u4EC0\u4E48\u3002" },
  ];

  upLevels.forEach((u, i) => {
    const y = 1.4 + i * 1.2;
    s11.addShape(pptx.ShapeType.ellipse, { x: 0.8, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: C.accentBlue } });
    s11.addText(u.icon, { x: 0.8, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 16, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s11.addText(u.title, { x: 1.6, y: y - 0.05, w: 10, h: 0.4, fontSize: 15, fontFace: F.title, color: C.titleGray, bold: true });
    s11.addShape(pptx.ShapeType.rect, { x: 1.6, y: y + 0.4, w: 10, h: 0.01, fill: { color: C.borderGray } });
    s11.addText(u.desc, { x: 1.6, y: y + 0.5, w: 10, h: 0.4, fontSize: 11, fontFace: F.body, color: C.bodyGray, valign: "top" });
  });

  s11.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 6.3, w: 10.33, h: 0.55, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s11.addText("AI能写近90%的代码——但剩下的10%的架构决策和业务理解，才是你不可替代的价值。", {
    x: 1.7, y: 6.3, w: 9.93, h: 0.55, fontSize: 13, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s11, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u91CF\u5316\u6210\u679C\u4E0E\u6570\u636E\u9A8C\u8BC1");

  s11.addNotes(`每一个挑战的背后，都是一次认知的升级。这是四条递进式的重新理解。第一条也是最根本的——从“代码是产物”到“文档是产物”。代码变更只是文档变更的编译结果。第二条——从“AI写代码”到“AI理解业务”。AI最强的不是生成代码，而是理解文档后生成代码。第三条——从“编码能力”到“规格表达能力”。最有价值的不是写代码的速度，而是把业务规则精确描述给AI的能力。第四条——从“把代码写对”到“让AI理解对”。未来核心竞争力不是你会写什么代码，而是你能否让AI正确理解你要什么。`);

  // ============================================================
  // SLIDE 12: 成果数据
  // ============================================================
  const s12 = pptx.addSlide();
  s12.background = { color: C.white };
  addSlideHeader(s12, pptx, "\u6210\u679C\u6570\u636E", "\u91CF\u5316\u9A8C\u8BC1");

  const metrics = [
    { num: "30+", label: "API\u63A5\u53E3", sub: "P0/P1\u5168\u90E8\u573A\u666F\u8986\u76D6", color: C.accentBlue },
    { num: "8", label: "\u6570\u636E\u5E93\u8868", sub: "\u540E\u7AEF\u5168\u90E8\u573A\u666F\u8986\u76D6", color: C.green },
    { num: "24", label: "\u524D\u7AEF\u9875\u9762", sub: "\u5B8C\u6574\u8986\u76D6MVP\u5168\u90E8\u573A\u666F", color: C.orange },
    { num: "7", label: "\u4E13\u4E1A\u6587\u6863", sub: "\u5168\u6D41\u7A0B\u6587\u6863\u9A71\u52A8\u4F53\u73B0", color: "8E44AD" },
    { num: "~90%", label: "代码AI生成率", sub: "人工聚焦架构与决策", color: C.highlight },
    { num: "3", label: "MCP Skill", sub: "\u610F\u56FE\u63A8\u7406\u4E0E\u6267\u884C\u89E3\u8026", color: C.primaryBlue },
  ];

  metrics.forEach((m, i) => {
    const col = i % 4;
    const row = i >= 4 ? 1 : 0;
    const x = 0.5 + col * 3.15;
    const y = 1.4 + row * 1.8;
    addCard(s12, pptx, x, y, 2.9, 1.5);
    s12.addShape(pptx.ShapeType.rect, { x, y, w: 2.9, h: 0.05, fill: { color: m.color } });
    s12.addText(m.num, { x, y: y + 0.15, w: 2.9, h: 0.5, fontSize: 26, fontFace: F.title, color: m.color, bold: true, align: "center", valign: "middle" });
    s12.addText(m.label, { x, y: y + 0.65, w: 2.9, h: 0.35, fontSize: 12, fontFace: F.title, color: C.titleGray, bold: true, align: "center", valign: "middle" });
    s12.addText(m.sub, { x, y: y + 1.0, w: 2.9, h: 0.3, fontSize: 10, fontFace: F.body, color: C.subtitleGray, align: "center", valign: "middle" });
  });

  // 顶部截图缩略证明
  try {
    s12.addImage({ path: path.join(SCREENSHOTS, "home.png"), x: 0.5, y: 4.7, w: 1.0, h: 1.6, sizing: { type: "contain", w: 1.0, h: 1.6 } });
  } catch (e) {}
  try {
    s12.addImage({ path: path.join(SCREENSHOTS, "ai-transaction.png"), x: 1.7, y: 4.7, w: 1.0, h: 1.6, sizing: { type: "contain", w: 1.0, h: 1.6 } });
  } catch (e) {}
  try {
    s12.addImage({ path: path.join(SCREENSHOTS, "consumption-analysis.png"), x: 2.9, y: 4.7, w: 1.0, h: 1.6, sizing: { type: "contain", w: 1.0, h: 1.6 } });
  } catch (e) {}

  s12.addText("\u6570\u636E\u6765\u6E90\u8BC1\u636E\uFF1A\u5DE6\u8D77=AI\u5BF9\u8BDD\u622A\u56FE / \u6D88\u8D39\u5206\u6790\u622A\u56FE / \u9996\u9875\u622A\u56FE", {
    x: 4.2, y: 5.4, w: 8, h: 0.4, fontSize: 10, fontFace: F.body, color: C.subtitleGray, valign: "middle",
  });

  s12.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 6.4, w: 10.33, h: 0.5, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s12.addText("\u4ECE\u9700\u6C42\u5230\u4E0A\u7EBF\uFF0C\u5168\u6D41\u7A0B\u6587\u6863\u9A71\u52A8\uFF0C\u6700\u7EC8\u4EA7\u51FA\u53EF\u7528\u4EA7\u54C1\u3002\u6BCF\u4E2A\u6570\u636E\u80CC\u540E\u90FD\u6709\u771F\u5B9E\u622A\u56FE\u4F5C\u4E3A\u8BC1\u636E\u3002", {
    x: 1.7, y: 6.4, w: 9.93, h: 0.5, fontSize: 12, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s12, pptx, "\u25B8 \u63A5\u4E0B\u6765\uFF1A\u56DE\u5F52\u672C\u6E90");

  s12.addNotes(`认知升级是内在的收获，但外在的成果同样重要。这六个数据卡片展示了项目的量化成果：三十多个API接口覆盖了P0和P1级别的全部场景；二十四个前端页面完整覆盖了MVP所需的所有功能；接近百分之九十的代码由AI生成，人工聚焦在架构设计和关键决策上；七份专业文档体现了全流程文档驱动的方法论。底部这三张截图就是数据的来源证据——AI对话截图、消费分析截图、首页截图。从需求到上线，全流程文档驱动，最终产出可用的产品。`);

  // ============================================================
  // SLIDE 13: 总结
  // ============================================================
  const s13 = pptx.addSlide();
  s13.background = { color: C.darkBlue };
  s13.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.04, fill: { color: C.accentBlue } });

  s13.addText("\u4EE5\u524D\u6211\u4EEC\u5B66\u4E60\u5199\u4EE3\u7801", { x: 0.8, y: 1.6, w: 11.73, h: 0.7, fontSize: 28, fontFace: F.body, color: C.white, align: "center", valign: "middle" });
  s13.addText("\u8BA9\u8BA1\u7B97\u673A\u7406\u89E3\u6211\u4EEC\u7684\u903B\u8F91", { x: 0.8, y: 2.2, w: 11.73, h: 0.7, fontSize: 28, fontFace: F.body, color: C.white, align: "center", valign: "middle" });
  s13.addShape(pptx.ShapeType.rect, { x: 4.5, y: 3.1, w: 4.33, h: 0.04, fill: { color: C.accentBlue } });
  s13.addText("\u73B0\u5728\u6211\u4EEC\u5B66\u4E60\u5199\u6587\u6863", { x: 0.8, y: 3.5, w: 11.73, h: 0.7, fontSize: 28, fontFace: F.body, color: C.white, align: "center", valign: "middle" });
  s13.addText("\u8BA9AI\u7406\u89E3\u6211\u4EEC\u7684\u4E1A\u52A1", { x: 0.8, y: 4.1, w: 11.73, h: 0.7, fontSize: 28, fontFace: F.body, color: C.accentBlue, bold: true, align: "center", valign: "middle" });

  s13.addText("\u6E90\u4E8E\u7ADE\u8D5B\uFF0C\u4E0D\u6B62\u4E8E\u7ADE\u8D5B", { x: 0.8, y: 5.2, w: 11.73, h: 0.5, fontSize: 16, fontFace: F.body, color: "8899AA", align: "center", valign: "middle" });
  s13.addShape(pptx.ShapeType.rect, { x: 0, y: 6.5, w: 13.33, h: 0.04, fill: { color: C.accentBlue } });

  s13.addNotes(`各位评委，今天我从三个篇章分享了这次AI原生研发的实践。如果AI能写近百分之九十的代码，那么一个优秀的研发人员的核心竞争力应该是什么？是更快的编码速度，还是让AI更好地理解业务的能力？以前我们学习写代码，是为了让计算机理解我们的逻辑。现在我们学习写文档，是为了让AI理解我们的业务。这个转变，可能比我们想象的更加深刻。谢谢大家，欢迎提问。`);
  
  // ============================================================
  // SLIDE 14: 致谢
  // ============================================================
  const s14 = pptx.addSlide();
  s14.background = { color: C.darkBlue };
  s14.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.04, fill: { color: C.accentBlue } });
  
  s14.addText("\u611F\u8C22\u8046\u542C", {
    x: 0.8, y: 1.8, w: 11.73, h: 1.2, fontSize: 48, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle",
  });
  s14.addShape(pptx.ShapeType.rect, { x: 4.5, y: 3.2, w: 4.33, h: 0.04, fill: { color: C.accentBlue } });
  s14.addText("\u6E90\u4E8E\u7ADE\u8D5B\uFF0C\u4E0D\u6B62\u4E8E\u7ADE\u8D5B", {
    x: 0.8, y: 3.5, w: 11.73, h: 0.7, fontSize: 22, fontFace: F.body, color: "8899AA", align: "center", valign: "middle",
  });
  s14.addText("\u624B\u673A\u94F6\u884C\u6838\u5FC3\u4E1A\u52A1\u7CFB\u7EDF \u00B7 AI\u539F\u751F\u7814\u53D1\u5B9E\u8DF5", {
    x: 0.8, y: 4.2, w: 11.73, h: 0.5, fontSize: 14, fontFace: F.body, color: "8899AA", align: "center", valign: "middle",
  });
  s14.addShape(pptx.ShapeType.rect, { x: 0, y: 6.5, w: 13.33, h: 0.04, fill: { color: C.accentBlue } });
  
  s14.addNotes(`以上就是我们团队在AI原生研发方面的实践分享。感谢各位评委的聆听与指导，期待大家的宝贵意见。`);
  
  // ============================================================
  // \u4FDD\u5B58\u6587\u4EF6
  // ============================================================
  const outputDir = __dirname;
  const outputPath = path.join(outputDir, "AI竞赛讲解_手机银行核心业务_优化版_v10.pptx");

  try {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  } catch (e) {}

  await pptx.writeFile({ fileName: outputPath });
  console.log(`PPT generated: ${outputPath}`);
  console.log(`Total slides: 14`);
  return outputPath;
}

generatePPT().catch(err => {
  console.error("Error generating PPT:", err);
  process.exit(1);
});
