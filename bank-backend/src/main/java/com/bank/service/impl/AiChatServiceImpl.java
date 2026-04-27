package com.bank.service.impl;

import com.bank.entity.ChatMessage;
import com.bank.mapper.ChatMessageMapper;
import com.bank.service.AiChatService;
import com.bank.service.BankCardService;
import com.bank.service.TransactionCategorizationService;
import com.bank.service.TransactionService;
import com.bank.vo.BankCardVO;
import com.bank.vo.ChatMessageVO;
import com.bank.vo.ConsumptionAnalysisVO;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.extern.slf4j.Slf4j;
import lombok.var;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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

    private static final int ROLE_USER = 1;
    private static final int ROLE_AI = 2;

    @Override
    public ChatMessageVO sendMessage(Long userId, String content, String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = generateNewSessionId();
        }

        saveMessage(userId, sessionId, ROLE_USER, content, null, null);

        ChatResult result = processIntent(userId, content);

        ChatMessageVO aiMessage = saveMessage(userId, sessionId, ROLE_AI, result.reply, result.intent, result.functionCalled);
        aiMessage.setSessionId(sessionId);
        return aiMessage;
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
        chatMessageMapper.insert(msg);
        return convertToVO(msg);
    }

    private ChatMessageVO convertToVO(ChatMessage msg) {
        ChatMessageVO vo = new ChatMessageVO();
        BeanUtils.copyProperties(msg, vo);
        return vo;
    }

    private ChatResult processIntent(Long userId, String content) {
        String lower = content.toLowerCase();

        if (matchAny(lower, "余额", "多少钱", "还有多", "剩多少", "查余额", "账户余额")) {
            return handleQueryBalance(userId);
        }
        if (matchAny(lower, "交易", "账单", "消费", "支出", "花了多少", "最近交易", "转账记录")) {
            return handleQueryTransactions(userId, content);
        }
        if (matchAny(lower, "卡", "银行卡", "我的卡", "绑定的卡", "有几张卡")) {
            return handleQueryCards(userId);
        }
        if (matchAny(lower, "转账", "转钱", "转给", "汇款", "打钱")) {
            return handleTransferIntent(content);
        }
        if (matchAny(lower, "分析", "消费分析", "消费报告", "月度报告", "花了什么", "消费结构")) {
            return handleConsumptionAnalysis(userId);
        }
        if (matchAny(lower, "你好", "您好", "嗨", "hello", "hi")) {
            return new ChatResult("GREETING", null, "您好！我是您的智能银行助手，可以帮您查询余额、交易记录、分析消费等。请问有什么可以帮您的？");
        }
        if (matchAny(lower, "帮助", "能做什么", "怎么用", "功能", "命令")) {
            return new ChatResult("HELP", null, "我可以帮您：\n1. 查询余额：说\"查余额\"\n2. 查看交易：说\"最近交易\"\n3. 查看银行卡：说\"我的卡\"\n4. 消费分析：说\"消费分析\"\n5. 转账：说\"转账给XXX\"");
        }

        return new ChatResult("UNKNOWN", null, "抱歉，我暂时没理解您的意思。您可以尝试说：\n- \"查余额\"\n- \"最近交易\"\n- \"消费分析\"\n- \"我的银行卡\"\n或输入\"帮助\"查看全部功能。");
    }

    private boolean matchAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private ChatResult handleQueryBalance(Long userId) {
        List<BankCardVO> cards = bankCardService.listCards(userId);
        if (cards == null || cards.isEmpty()) {
            return new ChatResult("QUERY_BALANCE", "listCards", "您当前没有绑定的银行卡。请先绑定银行卡后再查询余额。");
        }
        BigDecimal total = cards.stream()
                .map(c -> c.getBalance() != null ? c.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        StringBuilder sb = new StringBuilder();
        sb.append("您的总资产：¥").append(total.setScale(2, BigDecimal.ROUND_HALF_UP)).append("\n\n");
        sb.append("各卡余额：\n");
        for (BankCardVO card : cards) {
            sb.append("• ").append(card.getBankName())
              .append(" ").append(card.getCardNoMasked())
              .append("：¥").append(card.getBalance() != null ? card.getBalance().setScale(2, BigDecimal.ROUND_HALF_UP) : "0.00")
              .append("\n");
        }
        return new ChatResult("QUERY_BALANCE", "listCards", sb.toString().trim());
    }

    private ChatResult handleQueryTransactions(Long userId, String content) {
        int page = 1, size = 5;
        com.bank.dto.TransactionQueryRequest req = new com.bank.dto.TransactionQueryRequest();
        req.setPage(page);
        req.setSize(size);
        req.setTimeRange("1m");

        if (content.contains("收入") || content.contains("入账")) {
            req.setTransType(3);
        } else if (content.contains("缴费") || content.contains("水电") || content.contains("煤气")) {
            req.setTransType(2);
        } else if (content.contains("转账")) {
            req.setTransType(1);
        }

        IPage<TransactionVO> result = transactionService.queryTransactions(userId, req);
        if (result == null || result.getRecords() == null || result.getRecords().isEmpty()) {
            return new ChatResult("QUERY_TRANSACTIONS", "queryTransactions", "您最近没有交易记录。");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("您最近的交易记录（共").append(result.getTotal()).append("笔）：\n\n");
        for (TransactionVO t : result.getRecords()) {
            String typeStr = t.getTransType() == 1 ? "转账" : (t.getTransType() == 2 ? "缴费" : "收入");
            String amountStr = t.getAmount().compareTo(BigDecimal.ZERO) >= 0
                    ? "+" + t.getAmount()
                    : t.getAmount().toString();
            sb.append("• ").append(t.getCreatedAt().format(DateTimeFormatter.ofPattern("MM-dd")))
              .append(" ").append(typeStr)
              .append(" ").append(amountStr)
              .append(" ").append(t.getPayeeName() != null ? t.getPayeeName() : "")
              .append("\n");
        }
        sb.append("\n可点击\"交易记录\"查看完整账单。");
        return new ChatResult("QUERY_TRANSACTIONS", "queryTransactions", sb.toString().trim());
    }

    private ChatResult handleQueryCards(Long userId) {
        List<BankCardVO> cards = bankCardService.listCards(userId);
        if (cards == null || cards.isEmpty()) {
            return new ChatResult("QUERY_CARDS", "listCards", "您当前没有绑定的银行卡。点击\"去绑定\"添加银行卡。");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("您已绑定 ").append(cards.size()).append(" 张银行卡：\n\n");
        for (BankCardVO card : cards) {
            String type = card.getCardType() != null && card.getCardType() == 1 ? "借记卡" : "信用卡";
            String defaultTag = card.getIsDefault() != null && card.getIsDefault() == 1 ? " 【默认卡】" : "";
            sb.append("• ").append(card.getBankName())
              .append(" ").append(type)
              .append(" ").append(card.getCardNoMasked())
              .append(defaultTag)
              .append("\n");
        }
        return new ChatResult("QUERY_CARDS", "listCards", sb.toString().trim());
    }

    private ChatResult handleTransferIntent(String content) {
        String name = extractName(content);
        String amount = extractAmount(content);

        if (name != null && amount != null) {
            return new ChatResult("TRANSFER_INTENT", null,
                "确认转账信息：\n收款人：" + name + "\n金额：¥" + amount + "\n\n请点击下方\"去转账\"按钮完成操作。");
        }
        return new ChatResult("TRANSFER_INTENT", null,
            "我可以帮您发起转账。请说：\"转账给张三1000元\"，或直接点击下方\"转账\"按钮。");
    }

    private ChatResult handleConsumptionAnalysis(Long userId) {
        ConsumptionAnalysisVO analysis = categorizationService.analyzeConsumption(userId, LocalDate.now());
        if (analysis == null || analysis.getTotalExpense() == null || analysis.getTotalExpense().compareTo(BigDecimal.ZERO) == 0) {
            return new ChatResult("CONSUMPTION_ANALYSIS", "analyzeConsumption", "您本月暂无消费记录。消费后将自动生成分析报告。");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("【").append(analysis.getMonth()).append("消费分析】\n\n");
        sb.append("总支出：¥").append(analysis.getTotalExpense()).append("\n");
        if (analysis.getMonthOverMonthRatio() != null) {
            String trend = analysis.getMonthOverMonthRatio().compareTo(BigDecimal.ZERO) > 0 ? "↑" : "↓";
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
        return new ChatResult("CONSUMPTION_ANALYSIS", "analyzeConsumption", sb.toString().trim());
    }

    private String extractName(String content) {
        Pattern p = Pattern.compile("转(?:账|给|钱|款)(?:给|至|往)?([\u4e00-\u9fa5]{2,4})");
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
