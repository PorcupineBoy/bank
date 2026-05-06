package com.bank.service.impl;

import com.bank.entity.ChatMessage;
import com.bank.mapper.ChatMessageMapper;
import com.bank.mcp.McpGateway;
import com.bank.mcp.McpSkillRegistry;
import com.bank.mcp.SkillResult;
import com.bank.service.AiChatService;
import com.bank.service.BankCardService;
import com.bank.service.TransactionCategorizationService;
import com.bank.service.TransactionService;
import com.bank.vo.ChatMessageVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import lombok.var;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AI 助手服务实现
 *
 * 架构设计（MCP-Skill 模式）：
 * ┌─────────────────────────────────────────────────────┐
 * │  用户输入自然语言                                       │
 * │     │                                                   │
 * │     ▼                                                   │
 * │  [意图推理引擎] —— 关键词匹配 + 参数提取                   │
 * │     │                                                   │
 * │     ▼                                                   │
 * │  [MCP 调用网关] —— 路由到注册的 Skill                     │
 * │     │  ├── query_balance      → QueryBalanceSkill       │
 * │     │  ├── query_transactions → QueryTransactionsSkill  │
 * │     │  ├── transfer_prepare   → TransferPrepareSkill    │
 * │     │  └── ... (更多 Skill 可扩展)                       │
 * │     ▼                                                   │
 * │  返回 SkillResult（文本回复 + 结构化数据 + 动作导航）      │
 * └─────────────────────────────────────────────────────┘
 *
 * 扩展方式：新功能只需新增一个实现 McpSkill 接口的 @Component 类，
 * 然后在 processIntent() 中添加意图映射。
 */
@Slf4j
@Service
public class AiChatServiceImpl implements AiChatService {

    @Autowired
    private ChatMessageMapper chatMessageMapper;
    @Autowired
    private BankCardService bankCardService;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private TransactionCategorizationService categorizationService;
    @Autowired
    private McpGateway mcpGateway;
    @Autowired
    private McpSkillRegistry skillRegistry;

    private static final int ROLE_USER = 1;
    private static final int ROLE_AI = 2;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ChatMessageVO sendMessage(Long userId, String content, String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = generateNewSessionId();
        }

        saveMessage(userId, sessionId, ROLE_USER, content, null, null);

        ChatResult result = processIntent(userId, content);

        // 如果有结构化数据，序列化到 functionCalled 字段传递
        String functionCalled = result.functionCalled;
        String reply = result.reply;

        ChatMessageVO aiMessage = saveMessage(userId, sessionId, ROLE_AI, reply, result.intent, functionCalled);
        aiMessage.setSessionId(sessionId);
        return aiMessage;
    }

    /**
     * 通过 MCP-Skill 路由处理用户意图
     * 这是 MCP-Skill 意图推理引擎的核心入口
     */
    public SkillResult processIntentWithMcp(Long userId, String skillName, Map<String, Object> params) {
        SkillResult result = mcpGateway.executeSkill(skillName, userId, params);
        log.info("[MCP] Skill {} executed for user {}, reply length: {}", skillName, userId,
                result.getReply() != null ? result.getReply().length() : 0);
        return result;
    }

    @Override
    public List<ChatMessageVO> getChatHistory(Long userId, String sessionId, Integer limit) {
        int safeLimit = (limit == null || limit <= 0) ? 50 : Math.min(limit, 200);
        LambdaQueryWrapper<ChatMessage> wrapper = new LambdaQueryWrapper<ChatMessage>()
                .eq(ChatMessage::getUserId, userId)
                .eq(sessionId != null && !sessionId.isEmpty(), ChatMessage::getSessionId, sessionId)
                .orderByDesc(ChatMessage::getCreatedAt)
                .last("LIMIT " + safeLimit);

        List<ChatMessage> messages = chatMessageMapper.selectList(wrapper);
        Collections.reverse(messages);
        return messages.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public String generateNewSessionId() {
        return "chat_" + System.currentTimeMillis() + "_" + new Random().nextInt(1000);
    }

    private ChatMessageVO saveMessage(Long userId, String sessionId, int role, String content, String intent, String functionCalled) {
        ChatMessage msg = new ChatMessage();
        msg.setUserId(userId);
        msg.setSessionId(sessionId);
        msg.setRole(role);
        msg.setContent(content);
        msg.setIntent(intent);
        msg.setFunctionCalled(functionCalled);
        msg.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Shanghai")));
        chatMessageMapper.insert(msg);
        return convertToVO(msg);
    }

    private ChatMessageVO convertToVO(ChatMessage msg) {
        ChatMessageVO vo = new ChatMessageVO();
        BeanUtils.copyProperties(msg, vo);
        return vo;
    }

    /**
     * 意图推理引擎
     * 将用户自然语言映射到 MCP-Skill，通过 McpGateway 路由执行
     */
    private ChatResult processIntent(Long userId, String content) {
        String lower = content.toLowerCase().trim();

        // 问候
        if (matchAny(lower, "你好", "您好", "嗨", "hello", "hi")) {
            return buildMcpResult("GREETING", null, buildGreetingReply());
        }

        // 帮助
        if (matchAny(lower, "帮助", "能做什么", "怎么用", "功能", "命令")) {
            return buildMcpResult("HELP", null, buildHelpReply());
        }

        // 查询余额 → 路由到 query_balance Skill
        if (matchAny(lower, "余额", "多少钱", "还有多", "剩多少", "查余额", "账户余额")) {
            Map<String, Object> params = extractBankNameParam(content);
            return executeAndBuildResult(userId, "query_balance", params);
        }

        // 消费分析（月度/年度）—— 必须在交易查询之前，因 "消费" 关键词被交易查询共用
        if (matchAny(lower, "分析", "消费分析", "消费报告", "月度报告", "花了什么", "消费结构", "年度分析", "年消费", "年度消费")) {
            // 检测是否按年分析
            String yearStr = extractYear(content);
            if (yearStr != null) {
                return handleConsumptionAnalysisByYear(userId, Integer.parseInt(yearStr));
            }
            if (matchAny(lower, "年度", "年消费", "今年", "去年")) {
                Integer year = LocalDate.now().getYear();
                if (matchAny(lower, "去年")) {
                    year = year - 1;
                }
                return handleConsumptionAnalysisByYear(userId, year);
            }
            return handleConsumptionAnalysis(userId);
        }

        // 查询交易 → 路由到 query_transactions Skill
        if (matchAny(lower, "交易", "账单", "消费", "支出", "花了多少", "最近交易", "转账记录")) {
            Map<String, Object> params = extractTransactionParams(content);
            return executeAndBuildResult(userId, "query_transactions", params);
        }

        // 查看银行卡
        if (matchAny(lower, "卡", "银行卡", "我的卡", "绑定的卡", "有几张卡")) {
            return handleQueryCards(userId);
        }

        // 转账 → 路由到 transfer_prepare Skill
        if (matchAny(lower, "转账", "转钱", "转给", "汇款", "打钱")) {
            Map<String, Object> params = extractTransferParams(content);
            return executeAndBuildResult(userId, "transfer_prepare", params);
        }

        // 未识别的意图
        return buildMcpResult("UNKNOWN", null, buildUnknownReply());
    }

    /**
     * 通过 MCP 网关执行 Skill 并构建 ChatResult
     */
    private ChatResult executeAndBuildResult(Long userId, String skillName, Map<String, Object> params) {
        try {
            SkillResult skillResult = mcpGateway.executeSkill(skillName, userId, params);
            String serializedData = null;
            if (skillResult.getStructuredData() != null) {
                try {
                    serializedData = objectMapper.writeValueAsString(skillResult);
                } catch (JsonProcessingException e) {
                    log.warn("[MCP] Failed to serialize SkillResult", e);
                }
            }
            return buildMcpResult(skillName.toUpperCase(), serializedData, skillResult.getReply());
        } catch (Exception e) {
            log.error("[MCP] Skill {} execution error: {}", skillName, e.getMessage());
            return buildMcpResult("ERROR", null, "抱歉，处理您的请求时出现了问题，请稍后再试。");
        }
    }

    private boolean matchAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    /**
     * 提取银行名称参数
     */
    private Map<String, Object> extractBankNameParam(String content) {
        Map<String, Object> params = new HashMap<>();
        // 关键词后跟银行名：查工商银行余额、工商银行卡余额
        Pattern p = Pattern.compile("([\\u4e00-\\u9fa5]{2,6}(?:银行)?)");
        Matcher m = p.matcher(content);
        List<String> bankKeywords = Arrays.asList("工商", "招商", "建设", "农业", "中国", "交通", "邮储");
        while (m.find()) {
            String match = m.group(1);
            for (String kw : bankKeywords) {
                if (match.contains(kw)) {
                    params.put("bank_name", match + (match.endsWith("银行") ? "" : "银行"));
                    return params;
                }
            }
        }
        return params;
    }

    /**
     * 提取交易查询参数
     */
    private Map<String, Object> extractTransactionParams(String content) {
        Map<String, Object> params = new HashMap<>();
        if (content.contains("收入") || content.contains("入账")) {
            params.put("trans_type", "income");
        } else if (content.contains("缴费") || content.contains("水电") || content.contains("煤气")) {
            params.put("trans_type", "bill");
        } else if (content.contains("转账")) {
            params.put("trans_type", "transfer");
        }
        return params;
    }

    /**
     * 提取转账参数
     */
    private Map<String, Object> extractTransferParams(String content) {
        Map<String, Object> params = new HashMap<>();
        String name = extractName(content);
        String amount = extractAmount(content);
        if (name != null) params.put("payee_name", name);
        if (amount != null) {
            try {
                params.put("amount", Double.parseDouble(amount));
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        return params;
    }

    private ChatResult handleQueryCards(Long userId) {
        com.bank.vo.BankCardVO cards = null;
        var cardList = bankCardService.listCards(userId);
        if (cardList == null || cardList.isEmpty()) {
            return buildMcpResult("QUERY_CARDS", null, "您当前没有绑定的银行卡。点击\"去绑定\"添加银行卡。");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("您已绑定 ").append(cardList.size()).append(" 张银行卡：\n\n");
        for (com.bank.vo.BankCardVO card : cardList) {
            String type = card.getCardType() != null && card.getCardType() == 1 ? "借记卡" : "信用卡";
            String defaultTag = card.getIsDefault() != null && card.getIsDefault() == 1 ? " 【默认卡】" : "";
            sb.append("• ").append(card.getBankName())
              .append(" ").append(type)
              .append(" ").append(card.getCardNoMasked())
              .append(defaultTag)
              .append("\n");
        }
        return buildMcpResult("QUERY_CARDS", "listCards", sb.toString().trim());
    }

    private ChatResult handleConsumptionAnalysis(Long userId) {
        com.bank.vo.ConsumptionAnalysisVO analysis = categorizationService.analyzeConsumption(userId, java.time.LocalDate.now());
        if (analysis == null || analysis.getTotalExpense() == null || analysis.getTotalExpense().compareTo(java.math.BigDecimal.ZERO) == 0) {
            return buildMcpResult("CONSUMPTION_ANALYSIS", "analyzeConsumption", "您本月暂无消费记录。消费后将自动生成分析报告。");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("【").append(analysis.getMonth()).append("消费分析】\n\n");
        sb.append("总支出：¥").append(analysis.getTotalExpense()).append("\n");
        if (analysis.getMonthOverMonthRatio() != null) {
            String trend = analysis.getMonthOverMonthRatio().compareTo(java.math.BigDecimal.ZERO) > 0 ? "↑" : "↓";
            sb.append("环比：").append(trend).append(analysis.getMonthOverMonthRatio().abs()).append("%\n");
        }
        sb.append("\n消费结构：\n");
        if (analysis.getCategoryList() != null) {
            for (var cat : analysis.getCategoryList()) {
                sb.append("• ").append(cat.getCategoryName())
                  .append("：¥").append(cat.getAmount())
                  .append(" (").append(cat.getPercentage()).append("%)\n");
            }
        }
        if (analysis.getAiInsight() != null) {
            sb.append("\n💡 ").append(analysis.getAiInsight());
        }
        sb.append("\n\n可进入\"消费分析\"页面查看完整图表。");
        return buildMcpResult("CONSUMPTION_ANALYSIS", "analyzeConsumption", sb.toString().trim());
    }

    private ChatResult handleConsumptionAnalysisByYear(Long userId, Integer year) {
        com.bank.vo.ConsumptionAnalysisVO analysis = categorizationService.analyzeConsumptionByYear(userId, year);
        if (analysis == null || analysis.getTotalExpense() == null || analysis.getTotalExpense().compareTo(java.math.BigDecimal.ZERO) == 0) {
            return buildMcpResult("CONSUMPTION_ANALYSIS", "analyzeConsumptionByYear", year + "年暂无消费记录。消费后将自动生成分析报告。");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("【").append(analysis.getYear()).append("消费分析】\n\n");
        sb.append("总支出：¥").append(analysis.getTotalExpense()).append("\n");
        if (analysis.getYearOverYearRatio() != null) {
            String trend = analysis.getYearOverYearRatio().compareTo(java.math.BigDecimal.ZERO) > 0 ? "↑" : "↓";
            sb.append("同比：").append(trend).append(analysis.getYearOverYearRatio().abs()).append("%\n");
        }
        sb.append("\n消费结构：\n");
        if (analysis.getCategoryList() != null) {
            for (var cat : analysis.getCategoryList()) {
                sb.append("• ").append(cat.getCategoryName())
                  .append("：¥").append(cat.getAmount())
                  .append(" (").append(cat.getPercentage()).append("%)\n");
            }
        }
        if (analysis.getAiInsight() != null) {
            sb.append("\n💡 ").append(analysis.getAiInsight());
        }
        sb.append("\n\n可进入\"消费分析\"页面查看完整图表。");
        return buildMcpResult("CONSUMPTION_ANALYSIS", "analyzeConsumptionByYear", sb.toString().trim());
    }

    private String extractName(String content) {
        Pattern p = Pattern.compile("转(?:账|给|钱|款)(?:给|至|往)?([\\u4e00-\\u9fa5]{2,4})");
        Matcher m = p.matcher(content);
        if (m.find()) return m.group(1);
        return null;
    }

    private String extractAmount(String content) {
        Pattern p = Pattern.compile("(\\d+(?:\\.\\d{1,2})?)[ ]*(?:元|块|万)");
        Matcher m = p.matcher(content);
        if (m.find()) return m.group(1);
        return null;
    }

    /**
     * 从消息中提取年份（如 "2025年分析"）
     */
    private String extractYear(String content) {
        Pattern p = Pattern.compile("(20\\d{2})\\s*年");
        Matcher m = p.matcher(content);
        if (m.find()) return m.group(1);
        return null;
    }

    private ChatResult buildMcpResult(String intent, String functionCalled, String reply) {
        return new ChatResult(intent, functionCalled, reply);
    }

    private String buildGreetingReply() {
        return "您好！我是您的智能银行助手🤖\n\n" +
               "我可以帮您：\n" +
               "• 查询余额（如：\"查余额\"）\n" +
               "• 查询交易记录（如：\"最近交易\"）\n" +
               "• 转账汇款（如：\"转账给张三500元\"）\n" +
               "• 消费分析（如：\"消费分析\"）\n" +
               "• 查看银行卡（如：\"我的卡\"）\n\n" +
               "请问有什么可以帮您的？";
    }

    private String buildHelpReply() {
        return "我可以帮您：\n" +
               "1. 查询余额：说\"查余额\"\n" +
               "2. 查看交易：说\"最近交易\"\n" +
               "3. 查看银行卡：说\"我的卡\"\n" +
               "4. 消费分析：说\"消费分析\"\n" +
               "5. 转账：说\"转账给XXX N元\"\n\n" +
               "您也可以直接说：\"查工商银行卡余额\" 或 \"上个月花了多少\"";
    }

    private String buildUnknownReply() {
        return "抱歉，我暂时没理解您的意思。您可以尝试说：\n" +
               "- \"查余额\"\n" +
               "- \"最近交易\"\n" +
               "- \"消费分析\"\n" +
               "- \"我的银行卡\"\n" +
               "- \"转账给张三100元\"\n" +
               "或输入\"帮助\"查看全部功能。";
    }

    private static class ChatResult {
        String intent;
        String functionCalled;
        String reply;
        ChatResult(String intent, String functionCalled, String reply) {
            this.intent = intent;
            this.functionCalled = functionCalled;
            this.reply = reply;
        }
    }
}
