package com.bank.mcp.skill;

import com.bank.mcp.McpSkill;
import com.bank.mcp.SkillMeta;
import com.bank.mcp.SkillResult;
import com.bank.service.BankCardService;
import com.bank.vo.BalanceVO;
import com.bank.vo.BankCardVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 查询余额 Skill
 * 
 * 功能：查询用户所有绑定银行卡的余额
 * 安全等级：QUERY（仅需登录态）
 * 
 * 调用示例：
 *   query_balance(bank_name="工商银行")  // 查指定银行卡余额
 *   query_balance()                       // 查所有卡余额
 */
@Component
public class QueryBalanceSkill implements McpSkill {

    private BankCardService bankCardService;

    @Autowired
    public void setBankCardService(BankCardService bankCardService) {
        this.bankCardService = bankCardService;
    }

    @Override
    public SkillMeta getMeta() {
        SkillMeta meta = new SkillMeta();
        meta.setName("query_balance");
        meta.setDescription("查询用户银行卡余额。支持查所有卡余额或指定银行（如\"工商银行\"）的卡片余额");
        meta.setSecurityLevel(SkillMeta.SecurityLevel.QUERY);

        Map<String, SkillMeta.ParameterSchema> params = new LinkedHashMap<>();
        params.put("bank_name", new SkillMeta.ParameterSchema("string", false,
                "银行名称（可选），如\"工商银行\"、\"招商银行\"。不传则查询所有卡"));
        meta.setParameters(params);

        return meta;
    }

    @Override
    public SkillResult execute(Long userId, Map<String, Object> params) {
        List<BankCardVO> cards = bankCardService.listCards(userId);
        if (cards == null || cards.isEmpty()) {
            return SkillResult.builder()
                    .reply("您当前没有绑定的银行卡。请先绑定银行卡后再查询余额。")
                    .structuredData(SkillResult.StructuredData.builder()
                            .type("empty")
                            .data(java.util.Collections.singletonMap("message", "no_cards"))
                            .build())
                    .build();
        }

        String bankNameFilter = params != null && params.containsKey("bank_name")
                ? ((String) params.get("bank_name")).trim()
                : null;

        // 过滤指定银行
        List<BankCardVO> filteredCards;
        if (bankNameFilter != null && !bankNameFilter.isEmpty()) {
            filteredCards = cards.stream()
                    .filter(c -> c.getBankName() != null && c.getBankName().contains(bankNameFilter))
                    .collect(Collectors.toList());
            if (filteredCards.isEmpty()) {
                return SkillResult.builder()
                        .reply("未找到" + bankNameFilter + "的银行卡，您的卡片列表：\n" + formatCardList(cards))
                        .structuredData(SkillResult.StructuredData.builder()
                                .type("card_list")
                                .items(cards.stream().map(this::cardToMap).collect(Collectors.toList()))
                                .build())
                        .action(SkillResult.Action.builder()
                                .type("navigate")
                                .route("/cards")
                                .label("查看银行卡")
                                .build())
                        .build();
            }
        } else {
            filteredCards = cards;
        }

        // 计算总资产
        BigDecimal total = filteredCards.stream()
                .map(c -> c.getBalance() != null ? c.getBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 构建结构化数据
        Map<String, Object> balanceData = new HashMap<>();
        balanceData.put("totalBalance", total.setScale(2, BigDecimal.ROUND_HALF_UP));
        balanceData.put("cardCount", filteredCards.size());

        List<Map<String, Object>> cardItems = filteredCards.stream().map(this::cardToMap).collect(Collectors.toList());

        // 构建回复文本
        StringBuilder sb = new StringBuilder();
        sb.append("您的总资产：¥").append(total.setScale(2, BigDecimal.ROUND_HALF_UP)).append("\n\n");
        sb.append("各卡余额：\n");
        for (BankCardVO card : filteredCards) {
            String type = card.getCardType() != null && card.getCardType() == 1 ? "借记卡" : "信用卡";
            sb.append("• ").append(card.getBankName())
              .append(" ").append(type)
              .append(" ").append(card.getCardNoMasked())
              .append("：¥").append(card.getBalance() != null ? card.getBalance().setScale(2, BigDecimal.ROUND_HALF_UP) : "0.00")
              .append("\n");
        }

        return SkillResult.builder()
                .reply(sb.toString().trim())
                .structuredData(SkillResult.StructuredData.builder()
                        .type("balance_card")
                        .data(balanceData)
                        .items(cardItems)
                        .build())
                .action(SkillResult.Action.builder()
                        .type("navigate")
                        .route("/transactions")
                        .label("查看交易记录")
                        .build())
                .build();
    }

    private String formatCardList(List<BankCardVO> cards) {
        StringBuilder sb = new StringBuilder();
        for (BankCardVO card : cards) {
            sb.append("• ").append(card.getBankName()).append(" ").append(card.getCardNoMasked()).append("\n");
        }
        return sb.toString().trim();
    }

    private Map<String, Object> cardToMap(BankCardVO card) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("cardId", card.getCardId());
        map.put("bankName", card.getBankName());
        map.put("cardNoMasked", card.getCardNoMasked());
        map.put("cardType", card.getCardType());
        map.put("cardTypeLabel", card.getCardType() != null && card.getCardType() == 1 ? "借记卡" : "信用卡");
        map.put("balance", card.getBalance() != null ? card.getBalance().setScale(2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO);
        map.put("isDefault", card.getIsDefault());
        return map;
    }
}
