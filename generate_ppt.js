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
  slide.addText(text, { x: 8.0, y: 6.85, w: 4.53, h: 0.3, fontSize: 10, fontFace: F.body, color: C.subtitleGray, align: "right" });
  slide.addText("\u2192", { x: 12.5, y: 6.85, w: 0.3, h: 0.3, fontSize: 12, fontFace: F.body, color: C.accentBlue, align: "left" });
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
  s1.addNotes(`【开场白，1分钟】
各位评委好！今天我的分享分三部分：先看成果，再讲历程，最后谈反思。
我们从一份需求文档起步，用AI原生研发方式完整构建了一个手机银行核心系统。这条路怎么走的？我们开始。`);

  // ============================================================
  // SLIDE 2: 目录
  // ============================================================
  const s2 = pptx.addSlide();
  s2.background = { color: C.white };
  addSlideHeader(s2, pptx, "\u76EE\u5F55", "\u4E09\u90E8\u5206\u6784\u6210\u5168\u90E8\u5185\u5BB9");

  const parts = [
    { label: "Part 1", title: "\u6210\u679C\u5C55\u793A", desc: "\u7CFB\u7EDF\u5168\u666F\u4E0E\u6838\u5FC3\u521B\u65B0", color: C.accentBlue },
    { label: "Part 2", title: "\u7814\u53D1\u5386\u7A0B", desc: "\u4ECE\u75DB\u70B9\u3001\u987F\u609F\u5230\u65B9\u6CD5\u8BBA", color: C.orange },
    { label: "Part 3", title: "\u53CD\u601D\u4E0E\u5C55\u671B", desc: "\u8BA4\u77E5\u5347\u7EA7\u4E0E\u601D\u8003", color: C.green },
  ];

  parts.forEach((p, i) => {
    const x = 1.0 + i * 4.1;
    addCard(s2, pptx, x, 1.5, 3.7, 2.5);
    s2.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: 3.7, h: 0.55, fill: { color: p.color }, cornerRadius: 0 });
    s2.addText(p.label, { x, y: 1.5, w: 3.7, h: 0.55, fontSize: 14, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s2.addText(p.title, { x: x + 0.3, y: 2.3, w: 3.1, h: 0.5, fontSize: 18, fontFace: F.title, color: C.titleGray, bold: true, align: "center" });
    s2.addText(p.desc, { x: x + 0.3, y: 2.9, w: 3.1, h: 0.6, fontSize: 12, fontFace: F.body, color: C.subtitleGray, align: "center" });
  });

  // 底部三块之间的连接箭头
  s2.addText("Part 1 \u2192 Part 2 \u2192 Part 3", {
    x: 2.0, y: 4.5, w: 9.33, h: 0.4, fontSize: 12, fontFace: F.body, color: C.subtitleGray, align: "center", letterSpacing: 5,
  });

  // 底部说明——三部分导读
  s2.addText("\u2460 \u6210\u679C\u5C55\u793A \u2192 \u2461 \u7814\u53D1\u5386\u7A0B \u2192 \u2462 \u53CD\u601D\u4E0E\u5C55\u671B", {
    x: 2.0, y: 5.2, w: 9.33, h: 0.5, fontSize: 15, fontFace: F.body, color: C.accentBlue, bold: true, align: "center",
  });
  s2.addText("\u5168\u7A0B\u7EA720\u5206\u949F\uFF0C\u6BCF\u90E8\u5206\u76F8\u4E92\u547C\u5E94", {
    x: 3.0, y: 5.7, w: 7.33, h: 0.3, fontSize: 11, fontFace: F.body, color: C.subtitleGray, align: "center",
  });

  s2.addNotes(`【目录，30秒】
今天分三部分。第一，先看成果——系统到底长什么样，AI能力有多强。第二，再讲历程——我们是怎么做出来的，中间经历了什么。第三，最后谈反思——做完之后对研发的理解发生了什么变化。
一句话：先证明系统存在，再讲创新故事，最后留思考。`);

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

  addTransition(s3, pptx, "\u4E0D\u4EC5\u6709\u5B8C\u6574\u7CFB\u7EDF\uFF0C\u8FD8\u6709\u4E09\u5927AI\u521B\u65B0\u80FD\u529B");

  s3.addNotes(`【功能全景，1分钟】
大家看左边——这是我们的系统首页，真实的运行截图。
总资产 17万，五快捷功能，AI入口，银行卡管理——全部实现了。
但这只是基础。接下来看我们的核心创新——AI能力。`);

  // ============================================================
  // SLIDE 4: AI创新——三大核心能力
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

  addTransition(s4, pptx, "\u7CFB\u7EDF\u770B\u5230\u4E86\uFF0C\u90A3\u5B83\u662F\u600E\u4E48\u505A\u51FA\u6765\u7684\uFF1F");

  s4.addNotes(`【AI创新，1.5分钟】
三大AI能力，每个都有真实截图。
左边：智能客服——用户说"我要看我最近的消费记录"，AI理解意图，返回结构化交易列表。
中间：消费分析——自动分类、AI洞察文案，比如"您本月最大支出为其他，占比38.5%"。
右边：安全转账——用户说"转账给张三100块"，AI提取参数，两阶段确认。
这三个截图证明：AI能力不是噱头，是真的能在实际场景中跑通。
所有能力都基于后面会讲到的MCP-Skill架构。`);

  // ============================================================
  // SLIDE 5: 痛点驱动
  // ============================================================
  const s5 = pptx.addSlide();
  s5.background = { color: C.white };
  addSlideHeader(s5, pptx, "\u75DB\u70B9\u9A71\u52A8", "\u4F20\u7EDF\u7814\u53D1\u4E2D\u4EB2\u8EAB\u7ECF\u5386\u7684\u4E09\u4E2A\u95EE\u9898");

  const pains = [
    { p: "\u9700\u6C42\u4E00\u53D8\u66F4\uFF0C\u4EE3\u7801\u548C\u6587\u6863\u7ACB\u523B\u5206\u88C2\uFF0C\u7EF4\u62A4\u6210\u672C\u98D9\u5347", s: "\u6587\u6863\u5373\u4EE3\u7801\uFF1A\u6539\u6587\u6863\u63CF\u8FF0=\u6539\u7CFB\u7EDF\u884C\u4E3A\uFF0C\u5929\u7136\u4E00\u81F4" },
    { p: "\u5927\u90E8\u5206\u65F6\u95F4\u82B1\u5728\u91CD\u590DCRUD\uFF0C\u67B6\u6784\u601D\u8003\u65F6\u95F4\u88AB\u538B\u7F29", s: "AI\u4EE3\u519970%\u4EE3\u7801\uFF0C\u4EBA\u805A\u7126\u67B6\u6784\u8BBE\u8BA1\u4E0EAI\u8C03\u6559" },
    { p: "\u6C9F\u901A\u94FE\u6761\uFF1A\u4EA7\u54C1\u2192\u6587\u6863\u2192\u5F00\u53D1\uFF0C\u5C42\u5C42\u7406\u89E3\u504F\u5DEE", s: "\u6587\u6863\u76F4\u63A5\u9762\u5411AI\uFF0C\u4EBA-AI\u4E4B\u95F4\u6CA1\u6709\u7406\u89E3\u635F\u8017" },
  ];

  s5.addText("\u4F20\u7EDF\u7814\u53D1\u7684\u75DB\u70B9", { x: 0.8, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, fontFace: F.title, color: C.highlight, bold: true });
  pains.forEach((item, i) => {
    const y = 1.9 + i * 1.6;
    addCard(s5, pptx, 0.8, y, 5.5, 1.3);
    s5.addText(`\u26A0\uFE0F  \u75DB\u70B9 ${i + 1}`, { x: 1.0, y: y + 0.1, w: 5.1, h: 0.35, fontSize: 11, fontFace: F.title, color: C.highlight, bold: true });
    s5.addText(item.p, { x: 1.0, y: y + 0.5, w: 5.1, h: 0.6, fontSize: 11, fontFace: F.body, color: C.bodyGray, valign: "top" });
  });

  s5.addText("AI\u539F\u751F\u7814\u53D1\u7684\u56DE\u7B54", { x: 7.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, fontFace: F.title, color: C.green, bold: true });
  pains.forEach((item, i) => {
    const y = 1.9 + i * 1.6;
    addCard(s5, pptx, 7.0, y, 5.5, 1.3);
    s5.addShape(pptx.ShapeType.rect, { x: 7.0, y, w: 0.08, h: 1.3, fill: { color: C.green } });
    s5.addText(item.s, { x: 7.3, y: y + 0.2, w: 5.0, h: 0.9, fontSize: 11, fontFace: F.body, color: C.bodyGray, valign: "middle", lineSpacingMultiple: 1.4 });
  });

  s5.addText("\u203B MVP=\u6700\u5C0F\u53EF\u884C\u4EA7\u54C1\uFF1BP0/P1/P2=\u9700\u6C42\u4F18\u5148\u7EA7\u7B49\u7EA7", { x: 0.8, y: 6.9, w: 11.73, h: 0.3, fontSize: 9, fontFace: F.body, color: C.subtitleGray, italic: true });
  addTransition(s5, pptx, "\u6240\u4EE5\u6211\u4EEC\u51B3\u5B9A\u7528AI\u539F\u751F\u7814\u53D1\u6D4B\u8BD5\u4E00\u4E0B");

  s5.addNotes(`【痛点，1分钟】
系统你们看到了。那它是怎么做出来的？因为我们遇到了三个问题。
痛点1：文档和代码分裂——这直接导致了认知拐点的发现。
痛点2：重复CRUD——这也是为什么我们尝试让AI写代码。
痛点3：沟通损耗——文档直接给AI，反而更精确。`);

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

  addTransition(s6, pptx, "\u90A3\u5177\u4F53\u600E\u4E48\u8C03\u6559\uFF1F");

  s6.addNotes(`【认知拐点，1.5分钟】
这个页面是整个项目最重要的一个顿悟。
最开始做法是"让AI写代码→出BUG直接改代码"。但老BUG在新功能中反复出现。
花了一天才发现：AI不是基于最新代码理解的——它是基于文档。
从此改了规矩：先改文档，再生成代码。代码变更是文档变更的编译结果。`);

  // ============================================================
  // SLIDE 7: 调教方法论 + 五条纪律
  // ============================================================
  const s7 = pptx.addSlide();
  s7.background = { color: C.white };
  addSlideHeader(s7, pptx, "\u8C03\u6559\u65B9\u6CD5\u8BBA", "\u95ED\u73AF\u8FED\u4EE3 + \u4E94\u6761\u7EAA\u5F8B");

  s7.addShape(pptx.ShapeType.ellipse, { x: 5.2, y: 1.3, w: 2.8, h: 1.0, fill: { color: C.accentBlue } });
  s7.addText("\u6587\u6863", { x: 5.2, y: 1.3, w: 2.8, h: 1.0, fontSize: 26, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });

  const loopPts = [
    { label: "\u8C03\u6559\uFF08\u4FEE\u6539\u6587\u6863\uFF09", x: 4.8, y: 0.4, color: C.orange },
    { label: "AI\u751F\u6210\u4EE3\u7801", x: 9.3, y: 1.8, color: C.green },
    { label: "\u4EE3\u7801Review", x: 4.8, y: 3.2, color: C.primaryBlue },
    { label: "\u53D1\u73B0\u95EE\u9898", x: 0.4, y: 1.8, color: C.highlight },
  ];
  loopPts.forEach(p => {
    s7.addShape(pptx.ShapeType.roundRect, { x: p.x, y: p.y, w: 3.2, h: 0.5, fill: { color: p.color }, cornerRadius: 0.08 });
    s7.addText(p.label, { x: p.x, y: p.y, w: 3.2, h: 0.5, fontSize: 10, fontFace: F.body, color: C.white, bold: true, align: "center", valign: "middle" });
  });
  s7.addText("\u5931\u8D25\u6BD4\u4F8B > \u6210\u529F\u6BD4\u4F8B\uFF1A\u6BCF\u6B21\u6210\u529F\u8C03\u6559\u80CC\u540E\u67093-4\u6B21\u5931\u8D25\u63CF\u8FF0\u5C1D\u8BD5", { x: 0.8, y: 3.9, w: 6.0, h: 0.3, fontSize: 9, fontFace: F.body, color: C.highlight });

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
    s7.addText(d.desc, { x: x + 0.15, y: y + 0.5, w: 2.2, h: 0.6, fontSize: 9, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.3 });
  });

  s7.addShape(pptx.ShapeType.roundRect, { x: 2.0, y: 5.9, w: 9.33, h: 0.45, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s7.addText("\u4EE5\u524D\u6211\u662F\u7F16\u7801\u8005\uFF0C\u73B0\u5728\u6211\u662F\u8C03\u6559\u5E08", {
    x: 2.0, y: 5.9, w: 9.33, h: 0.45, fontSize: 13, fontFace: F.body, color: C.accentBlue, bold: true, align: "center", valign: "middle", letterSpacing: 2,
  });

  s7.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 6.4, w: 11.73, h: 0.6, fill: { color: "F5F5F5" }, cornerRadius: 0.06 });
  s7.addText("\u8C03\u6559\u65E5\u5FD7\u8282\u9009\uFF1A[2026-04-25] \u9700\u6C42F-TRANS-003 | \u8F6C\u8D26\u91D1\u989D\u7B26\u53F7\u95EE\u9898 | \u6587\u6863\u4ECE\u201C\u6B63\u6570\u6536\u5165\u8D1F\u6570\u652F\u51FA\u201D\u6539\u4E3A\u201C\u4EA4\u6613\u91D1\u989D\u4EE5\u65B9\u5411\u7B26\u53F7\u6807\u8BC6\uFF0C\u6536\u5165=+\u652F\u51FA=-\u201D | AI\u4EE3\u7801\u6B63\u786E\u533A\u5206", {
    x: 1.0, y: 6.4, w: 11.33, h: 0.6, fontSize: 9, fontFace: "Courier New", color: C.subtitleGray, valign: "middle",
  });

  addTransition(s7, pptx, "\u8FD9\u6837\u8C03\u6559\u8DDF\u4F20\u7EDF\u5F00\u53D1\u6709\u4EC0\u4E48\u672C\u8D28\u4E0D\u540C\uFF1F");

  s7.addNotes(`【调教方法论，1.5分钟】
核心闭环：以文档为中心不断迭代。注意失败比例标注。
下面是五条纪律，特别强调第4条——记录变更。右边是真实调教日志。`);

  // ============================================================
  // SLIDE 8: 传统 vs AI原生
  // ============================================================
  const s8 = pptx.addSlide();
  s8.background = { color: C.white };
  addSlideHeader(s8, pptx, "AI\u539F\u751F vs \u4F20\u7EDF\u7814\u53D1", "\u4E00\u573A\u98CE\u9669\u7684\u9006\u8F6C\u4E0E\u89D2\u8272\u7684\u91CD\u5851");

  const colX = [0.8, 3.5, 7.5];
  const colW = [2.5, 3.8, 5.0];
  ["\u7EF4\u5EA6", "\u4F20\u7EDF\u7814\u53D1", "AI\u539F\u751F\u7814\u53D1"].forEach((c, i) => {
    s8.addShape(pptx.ShapeType.roundRect, { x: colX[i], y: 1.3, w: colW[i], h: 0.5, fill: { color: i === 0 ? C.titleGray : i === 1 ? "95A5A6" : C.accentBlue }, cornerRadius: 0.06 });
    s8.addText(c, { x: colX[i], y: 1.3, w: colW[i], h: 0.5, fontSize: 13, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
  });

  const rows = [
    ["\u6838\u5FC3\u4EA7\u7269", "\u4EE3\u7801", "\u6587\u6863"],
    ["\u4EBA\u7684\u89D2\u8272", "\u7F16\u7801\u8005", "\u8C03\u6559\u5E08 / \u89C4\u683C\u5DE5\u7A0B\u5E08"],
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

  s8.addShape(pptx.ShapeType.roundRect, { x: 2.0, y: 6.3, w: 9.33, h: 0.55, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s8.addText("\u5982\u679C\u6267\u884C\u98CE\u9669\u964D\u4E3A\u96F6\uFF0C\u90A3\u4F60\u7684\u6838\u5FC3\u7ADE\u4E89\u529B\u5728\u54EA\u91CC\uFF1F", {
    x: 2.0, y: 6.3, w: 9.33, h: 0.55, fontSize: 14, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s8, pptx, "\u8FD9\u5957\u65B9\u6CD5\u9700\u8981\u4EC0\u4E48\u6280\u672F\u652F\u6491\uFF1F");

  s8.addNotes(`【对比，1分钟】
核心在最后两行：执行风险和设计风险的反转。
传统最怕代码跑不通，AI写的语法一定对——但设计风险高了，最难的是精确告诉AI要什么。`);

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
    s9.addText(l.desc, { x: 2.3, y, w: 2.8, h: 0.45, fontSize: 8, fontFace: F.body, color: "E8E8E8", valign: "middle" });
  });

  s9.addText("MCP-Skill\u6838\u5FC3\u7279\u6027", { x: 5.8, y: 1.2, w: 5, h: 0.35, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  const feats = ["\u2460 \u6807\u51C6\u5316\u63A5\u53E3+ \u52A8\u6001\u6CE8\u518C", "\u2461 \u5B89\u5168\u5206\u7EA7\uFF1AQUERY/\u6267\u884C\u4E24\u9636\u6BB5", "\u2462 \u7ED3\u6784\u5316\u8FD4\u56DE\uFF1A\u56DE\u590D+\u6570\u636E+\u5BFC\u822A", "\u2463 LLM\u65E0\u5173\u8BBE\u8BA1\uFF1A\u5F53\u524D\u89C4\u5219\uFF0C\u672A\u6765\u53EF\u5207LLM"];
  feats.forEach((f, i) => { s9.addText(f, { x: 5.8, y: 1.65 + i * 0.42, w: 6.5, h: 0.38, fontSize: 9, fontFace: F.body, color: C.bodyGray, valign: "middle" }); });

  s9.addText("\u5B89\u5168\u4FDD\u62A4", { x: 5.8, y: 3.5, w: 5, h: 0.3, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  s9.addText("\u8EAB\u4EFD\u8BA4\u8BC1 | \u6570\u636E\u52A0\u5BC6(bcrypt+AES) | \u9632\u653B\u51FB(\u9501\u5B9A+30s\u9632\u91CD\u590D) | AOP\u5BA1\u8BA1\u65E5\u5FD7", { x: 5.8, y: 3.85, w: 6.5, h: 0.35, fontSize: 8, fontFace: F.body, color: C.bodyGray, valign: "middle" });

  s9.addText("AI\u80FD\u529B", { x: 5.8, y: 4.3, w: 5, h: 0.3, fontSize: 13, fontFace: F.title, color: C.titleGray, bold: true });
  s9.addText("\u667A\u80FD\u5BA2\u670D | \u6D88\u8D39\u5206\u6790(10\u7C7B+\u6708\u62A5) | AI\u6D1E\u5BDF\u5F15\u64CE", { x: 5.8, y: 4.65, w: 6.5, h: 0.35, fontSize: 8, fontFace: F.body, color: C.bodyGray, valign: "middle" });

  s9.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 5.2, w: 11.73, h: 0.7, fill: { color: "FFF8E1" }, cornerRadius: 0.08 });
  s9.addText("\u4FE1\u4EFB\u9677\u9631\u6848\u4F8B\uFF1A\u4F59\u989D\u6B63\u8D1F\u53F7\u2014\u2014\u201C\u6B63\u8D1F\u53F7\u201D\u5728\u8D22\u52A1\u8BED\u5883\u4E2D\u4E0D\u662F\u6570\u5B66\u6B63\u8D1F\uFF0C\u800C\u662F\u201C\u6536\u5165\u4E3A\u6B63\u3001\u652F\u51FA\u4E3A\u8D1F\u201D\u3002AI\u6309\u539F\u59CB\u6570\u5B66\u7B26\u53F7\u5904\u7406\u5BFC\u81F4\u90E8\u5206\u6536\u5165\u663E\u793A\u7EA2\u8272\uFF08\u9519\u8BEF\uFF09\uFF0C\u7ECF\u8FC73\u6B21\u4FEE\u6539\u6587\u6863\u63CF\u8FF0\u540E\u624D\u6B63\u786E\u533A\u5206\u3002", {
    x: 1.0, y: 5.25, w: 11.33, h: 0.6, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "middle", lineSpacingMultiple: 1.3,
  });

  s9.addText("\u203B MCP-Skill=\u81EA\u7814AI\u80FD\u529B\u5C01\u88C5\u6846\u67B6\uFF1A\u610F\u56FE\u63A8\u7406\u4E0E\u4E1A\u52A1\u6267\u884C\u89E3\u8026", { x: 0.8, y: 6.0, w: 11.73, h: 0.3, fontSize: 9, fontFace: F.body, color: C.subtitleGray, italic: true });

  s9.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 6.4, w: 11.73, h: 0.35, fill: { color: "E8F8F5" }, cornerRadius: 0.06 });
  s9.addText("\u8C03\u6559\u56DE\u770B\uFF1A\u67B6\u6784\u6BCF\u5C42\u7684\u6587\u6863\u63CF\u8FFD\u8FED\u4EE3\u4E863-5\u7248\u624D\u8FBE\u7A33\u5B9A\uFF0CMCP-Skill\u8FB9\u754C\u5B9A\u4E49\u662F\u6700\u96BE\u8C03\u7684\u90E8\u5206", {
    x: 1.0, y: 6.4, w: 11.33, h: 0.35, fontSize: 9, fontFace: F.body, color: C.green, valign: "middle",
  });

  addTransition(s9, pptx, "\u6280\u672F\u6846\u67B6\u642D\u597D\u4E86\uFF0C\u4F46\u771F\u6B63\u505A\u8D77\u6765\u624D\u53D1\u73B0");

  s9.addNotes(`【技术框架，1分钟】
快速过。架构、MCP-Skill、安全、AI能力都在一页上。
重点在底部的"信任陷阱"案例——余额正负号问题。
AI代码语法完全正确，但业务语义是错的。这就是最危险的地方。`);

  // ============================================================
  // SLIDE 10: 真实挑战
  // ============================================================
  const s10 = pptx.addSlide();
  s10.background = { color: C.white };
  addSlideHeader(s10, pptx, "\u771F\u5B9E\u6311\u6218", "\u8C03\u6559\u4E2D\u8E29\u8FC7\u7684\u5751");

  const challenges = [
    { icon: "A", title: "AI\u610F\u56FE\u8BC6\u522B\u7CBE\u5EA6", color: C.accentBlue,
      challenge: "\u540C\u4E00\u610F\u56FE\u591A\u79CD\u8868\u8FBE\uFF0C\u8FB9\u754C\u60C5\u51B5\u5C42\u51FA\u4E0D\u7A77\u3002\u6210\u529F\u8C03\u65591\u4E2A\u610F\u56FE\u5E73\u5747\u5931\u8D253-4\u6B21\u3002",
      solution: "\u5173\u952E\u8BCD+\u6B63\u5219\u53CC\u6A21\u5F0F+\u515C\u5E95\u5F15\u5BFC\u3002" },
    { icon: "B", title: "AI\u4EE3\u7801\u7684\u4E1A\u52A1\u6821\u9A8C", color: C.orange,
      challenge: "AI\u4EE3\u7801\u8BED\u6CD5\u5B8C\u7F8E\uFF0C\u6B63\u56E0\u5982\u6B64\u66F4\u5BB9\u6613\u88AB\u4FE1\u4EFB\u3002\u4F46\u4E1A\u52A1\u8BED\u4E49\u53EF\u80FD\u662F\u9519\u7684\u3002",
      solution: "\u5EFA\u7ACB\u6821\u9A8C\u6E05\u5355\uFF1A\u91D1\u989D\u7B26\u53F7\u2192\u5B57\u6BB5\u957F\u5EA6\u2192\u5206\u7C7B\u89C4\u5219\u3002" },
    { icon: "C", title: "\u524D\u540E\u7AEF\u5951\u7EA6\u5BF9\u9F50", color: C.highlight,
      challenge: "\u524D\u540E\u7AEF\u7531AI\u72EC\u7ACB\u751F\u6210\uFF0C\u5929\u7136\u5B58\u5728\u5951\u7EA6\u65AD\u88C2\u3002",
      solution: "\u7EDF\u4E00ReqBase\u89C4\u8303 + \u524D\u540E\u7AEF\u7ED3\u5BF9\u751F\u6210\u3002" },
  ];

  challenges.forEach((c, i) => {
    const x = 0.6 + i * 4.2;
    const y = 1.3;
    addCard(s10, pptx, x, y, 3.9, 4.2);
    s10.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.9, h: 0.65, fill: { color: c.color }, cornerRadius: 0 });
    s10.addText(`${c.icon} ${c.title}`, { x, y, w: 3.9, h: 0.65, fontSize: 14, fontFace: F.title, color: C.white, bold: true, align: "center", valign: "middle" });
    s10.addText("\u6311\u6218", { x: x + 0.2, y: y + 0.85, w: 3.5, h: 0.3, fontSize: 11, fontFace: F.title, color: C.highlight, bold: true });
    s10.addShape(pptx.ShapeType.roundRect, { x: x + 0.2, y: y + 1.15, w: 3.5, h: 1.0, fill: { color: "FDEDEC" }, cornerRadius: 0.06 });
    s10.addText(c.challenge, { x: x + 0.3, y: y + 1.2, w: 3.3, h: 0.9, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.4 });
    s10.addText("\u5E94\u5BF9", { x: x + 0.2, y: y + 2.3, w: 3.5, h: 0.3, fontSize: 11, fontFace: F.title, color: C.green, bold: true });
    s10.addShape(pptx.ShapeType.roundRect, { x: x + 0.2, y: y + 2.6, w: 3.5, h: 1.0, fill: { color: "E8F8F5" }, cornerRadius: 0.06 });
    s10.addText(c.solution, { x: x + 0.3, y: y + 2.65, w: 3.3, h: 0.9, fontSize: 10, fontFace: F.body, color: C.bodyGray, valign: "top", lineSpacingMultiple: 1.4 });
  });

  // 底部失败比例标注
  s10.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 5.8, w: 10.33, h: 0.55, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s10.addText("\u771F\u5B9E\u6570\u636E\uFF1A\u6210\u529F\u8C03\u65591\u4E2A\u610F\u56FE\uFF0C\u5E73\u5747\u5931\u8D253-4\u6B21\u63CF\u8FF0\u5C1D\u8BD5\u3002AI\u4EE3\u7801\u8D8A\u6F02\u4EAE\uFF0C\u8D8A\u9700\u8981\u8B66\u60D5\u4E1A\u52A1\u8BED\u4E49\u9519\u8BEF\u3002", {
    x: 1.7, y: 5.8, w: 9.93, h: 0.55, fontSize: 12, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s10, pptx, "\u6BCF\u4E00\u4E2A\u6311\u6218\uFF0C\u90FD\u662F\u8BA4\u77E5\u5347\u7EA7\u7684\u6765\u6E90");

  s10.addNotes(`【挑战，1分钟】
三个挑战。重点说前两个：意图识别的失败比例和AI代码的信任陷阱。
"AI代码越漂亮越危险"——这听起来反直觉，但余额正负号案例就是最好的证明。`);

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
  s11.addText("AI\u80FD\u519970%\u7684\u4EE3\u7801\u2014\u2014\u4F46\u90A330%\u7684\u67B6\u6784\u51B3\u7B56\u548C\u4E1A\u52A1\u7406\u89E3\uFF0C\u624D\u662F\u4F60\u4E0D\u53EF\u66FF\u4EE3\u7684\u4EF7\u503C\u3002", {
    x: 1.7, y: 6.3, w: 9.93, h: 0.55, fontSize: 13, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s11, pptx, "\u90A3\u5B9E\u9645\u6210\u679C\u5462\uFF1F");

  s11.addNotes(`【认知升级，1分钟】
这四条是从项目中真正沉淀下来的认知。
第一条最重要——回到认知拐点的"文档是源代码"。
第三条——规格表达能力比编码能力更值钱。
第四条——从"把代码写对"到"让AI理解对"，这是核心转变。`);

  // ============================================================
  // SLIDE 12: 成果数据
  // ============================================================
  const s12 = pptx.addSlide();
  s12.background = { color: C.white };
  addSlideHeader(s12, pptx, "\u6210\u679C\u6570\u636E", "\u91CF\u5316\u9A8C\u8BC1");

  const metrics = [
    { num: "30+", label: "API\u63A5\u53E3", sub: "6\u5927\u4E1A\u52A1\u6A21\u5757", color: C.accentBlue },
    { num: "8", label: "\u6570\u636E\u5E93\u8868", sub: "\u7269\u7406\u8BBE\u8BA1+\u7D22\u5F15", color: C.green },
    { num: "24", label: "\u524D\u7AEF\u9875\u9762", sub: "\u5B8C\u6574\u4EA4\u4E92\u4F53\u9A8C", color: C.orange },
    { num: "7", label: "\u4E13\u4E1A\u6587\u6863", sub: "\u5168\u6D41\u7A0B\u53EF\u8FFD\u6EAF", color: "8E44AD" },
    { num: "70%+", label: "\u4EE3\u7801AI\u751F\u6210\u7387", sub: "\u4EBA\u5DE5\u805A\u7126\u51B3\u7B56", color: C.highlight },
    { num: "3", label: "MCP Skill", sub: "\u53EF\u63D2\u62D4AI\u5355\u5143", color: C.primaryBlue },
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
    s12.addText(m.sub, { x, y: y + 1.0, w: 2.9, h: 0.3, fontSize: 9, fontFace: F.body, color: C.subtitleGray, align: "center", valign: "middle" });
  });

  // 顶部截图缩略证明
  try {
    s12.addImage({ path: path.join(SCREENSHOTS, "home.png"), x: 0.5, y: 5.0, w: 1.0, h: 1.7, sizing: { type: "contain", w: 1.0, h: 1.7 } });
  } catch (e) {}
  try {
    s12.addImage({ path: path.join(SCREENSHOTS, "ai-transaction.png"), x: 1.7, y: 5.0, w: 1.0, h: 1.7, sizing: { type: "contain", w: 1.0, h: 1.7 } });
  } catch (e) {}
  try {
    s12.addImage({ path: path.join(SCREENSHOTS, "consumption-analysis.png"), x: 2.9, y: 5.0, w: 1.0, h: 1.7, sizing: { type: "contain", w: 1.0, h: 1.7 } });
  } catch (e) {}

  s12.addText("\u6570\u636E\u6765\u6E90\u8BC1\u636E\uFF1A\u5DE6\u8D77=AI\u5BF9\u8BDD\u622A\u56FE / \u6D88\u8D39\u5206\u6790\u622A\u56FE / \u9996\u9875\u622A\u56FE", {
    x: 4.2, y: 5.4, w: 8, h: 0.4, fontSize: 9, fontFace: F.body, color: C.subtitleGray, valign: "middle",
  });

  s12.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 6.4, w: 10.33, h: 0.5, fill: { color: C.lightBg }, cornerRadius: 0.1, line: { color: C.accentBlue, width: 0.5, dashType: "dash" } });
  s12.addText("\u8FD9\u4E9B\u6570\u636E\u8BC1\u660E\uFF1AAI\u539F\u751F\u7814\u53D1\u4E0D\u4EC5\u53EF\u884C\uFF0C\u800C\u4E14\u80FD\u771F\u6B63\u4EA7\u51FA\u53EF\u7528\u4EA7\u54C1\u3002\u4F46\u6BD4\u6570\u636E\u66F4\u91CD\u8981\u7684\u662F\u8BA4\u77E5\u5347\u7EA7\u3002", {
    x: 1.7, y: 6.4, w: 9.93, h: 0.5, fontSize: 12, fontFace: F.body, color: C.primaryBlue, bold: true, align: "center", valign: "middle",
  });

  addTransition(s12, pptx, "\u56DE\u5230\u6700\u521D\u7684\u95EE\u9898");

  s12.addNotes(`【成果，1分钟】
6个数据卡片。底部放了三张截图缩略作为"数据来源于这些真实界面"的视觉证据。`);

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

  s13.addNotes(`【收尾，1分钟】
各位评委，今天我从三个部分分享了这次AI原生研发的实践：先展示了系统截图证明了完成度，再讲述了从痛点到方法论的心路历程，最后是四条认知升级。
最后我有一个问题留给各位：如果AI能写70%的代码，那么一个优秀的研发人员的核心竞争力应该是什么？
是写更快的代码？还是让AI更好地理解业务？
谢谢大家，欢迎提问。`);

  // ============================================================
  // 保存文件
  // ============================================================
  const outputDir = __dirname;
  const outputPath = path.join(outputDir, "AI\u7ADE\u8D5B\u8BB2\u89E3_\u624B\u673A\u94F6\u884C\u6838\u5FC3\u4E1A\u52A1_\u4F18\u5316\u7248_v5.pptx");

  try {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  } catch (e) {}

  await pptx.writeFile({ fileName: outputPath });
  console.log(`PPT generated: ${outputPath}`);
  console.log(`Total slides: 13`);
  return outputPath;
}

generatePPT().catch(err => {
  console.error("Error generating PPT:", err);
  process.exit(1);
});
