package com.bank.mcp.skill;

import com.bank.dto.TransactionQueryRequest;
import com.bank.mcp.McpSkill;
import com.bank.mcp.SkillMeta;
import com.bank.mcp.SkillResult;
import com.bank.service.TransactionService;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 查询交易记录 Skill
 * 
 * 功能：查询用户最近交易记录，支持按类型筛选
 * 安全等级：QUERY（仅需登录态）
 * 
 * 调用示例：
 *   query_transactions(trans_type="transfer", time_range="1m", page_size=5)
 *   query_transactions()  
 */
@Component
public class QueryTransactionsSkill implements McpSkill {

    private TransactionService transactionService;

    @Autowired
    public void setTransactionService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @Override
    public SkillMeta getMeta() {
        SkillMeta meta = new SkillMeta();
        meta.setName("query_transactions");
        meta.setDescription("查询用户的交易记录（转账、缴费、收入）。可指定交易类型和时间范围进行筛选");
        meta.setSecurityLevel(SkillMeta.SecurityLevel.QUERY);

        Map<String, SkillMeta.ParameterSchema> params = new LinkedHashMap<>();
        params.put("trans_type", new SkillMeta.ParameterSchema("string", false,
                "交易类型筛选：transfer（转账）/ bill（缴费）/ income（收入）/ all（全部）。不传则不限制",
                new String[]{"transfer", "bill", "income", "all"}));
        params.put("time_range", new SkillMeta.ParameterSchema("string", false,
                "时间范围：7d（近7天）/ 1m（近1个月）/ 3m（近3个月）。默认1m",
                new String[]{"7d", "1m", "3m"}));
        params.put("page_size", new SkillMeta.ParameterSchema("number", false,
                "返回记录条数：1-20。默认10"));
        meta.setParameters(params);

        return meta;
    }

    @Override
    public SkillResult execute(Long userId, Map<String, Object> params) {
        int pageSize = 10;
        String timeRange = "1m";
        Integer transTypeCode = null;

        if (params != null) {
            if (params.containsKey("page_size") && params.get("page_size") instanceof Number) {
                pageSize = Math.min(Math.max(((Number) params.get("page_size")).intValue(), 1), 20);
            }
            if (params.containsKey("time_range") && params.get("time_range") instanceof String) {
                String tr = (String) params.get("time_range");
                if (Arrays.asList("7d", "1m", "3m").contains(tr)) {
                    timeRange = tr;
                }
            }
            if (params.containsKey("trans_type") && params.get("trans_type") instanceof String) {
                String transType = (String) params.get("trans_type");
                switch (transType) {
                    case "transfer":
                        transTypeCode = 1;
                        break;
                    case "bill":
                        transTypeCode = 2;
                        break;
                    case "income":
                        transTypeCode = 3;
                        break;
                    default:
                        transTypeCode = null;
                        break;
                }
            }
        }

        TransactionQueryRequest req = new TransactionQueryRequest();
        req.setPage(1);
        req.setSize(pageSize);
        req.setTimeRange(timeRange);
        req.setTransType(transTypeCode);

        IPage<TransactionVO> result = transactionService.queryTransactions(userId, req);

        if (result == null || result.getRecords() == null || result.getRecords().isEmpty()) {
            return SkillResult.builder()
                    .reply("您最近没有交易记录。")
                    .structuredData(SkillResult.StructuredData.builder()
                            .type("empty")
                            .data(java.util.Collections.singletonMap("message", "no_transactions"))
                            .build())
                    .build();
        }

        // 构建结构化数据
        List<Map<String, Object>> transItems = result.getRecords().stream()
                .map(t -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("transId", t.getTransId());
            map.put("transNo", t.getTransNo());
            map.put("transType", t.getTransType());
            map.put("transTypeLabel", getTypeLabel(t.getTransType()));
            map.put("amount", t.getAmount());
            map.put("amountDisplay", (t.getAmount().compareTo(BigDecimal.ZERO) > 0 ? "+" : "") + t.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP));
            map.put("payeeName", t.getPayeeName());
            map.put("payeeCardNoMasked", t.getPayeeCardNoMasked());
            map.put("remark", t.getRemark());
            map.put("status", t.getStatus());
            map.put("statusLabel", getStatusLabel(t.getStatus()));
            map.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());

        // 构建回复文本
        StringBuilder sb = new StringBuilder();
        sb.append("您最近的交易记录（共").append(result.getTotal()).append("笔）：\n\n");
        for (TransactionVO t : result.getRecords()) {
            String typeStr = getTypeLabel(t.getTransType());
            String amountStr = t.getAmount().compareTo(BigDecimal.ZERO) > 0
                    ? "+" + t.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP)
                    : t.getAmount().setScale(2, BigDecimal.ROUND_HALF_UP).toString();
            sb.append("• ").append(t.getCreatedAt() != null ? t.getCreatedAt().format(DateTimeFormatter.ofPattern("MM-dd HH:mm")) : "")
              .append(" ").append(typeStr)
              .append(" ").append(amountStr)
              .append(" ").append(t.getPayeeName() != null ? t.getPayeeName() : "")
              .append(" ").append(getStatusLabel(t.getStatus()))
              .append("\n");
        }
        sb.append("\n可进入交易记录页面查看完整账单。");

        // 构建结构化数据 Map（需在匿名内部类使用前提取）
        Map<String, Object> transData = new HashMap<>();
        transData.put("total", result.getTotal());
        transData.put("timeRange", timeRange);

        return SkillResult.builder()
                .reply(sb.toString().trim())
                .structuredData(SkillResult.StructuredData.builder()
                        .type("transaction_list")
                        .data(transData)
                        .items(transItems)
                        .build())
                .action(SkillResult.Action.builder()
                        .type("navigate")
                        .route("/transactions")
                        .label("查看完整交易记录")
                        .build())
                .build();
    }

    private String getTypeLabel(Integer type) {
        if (type == null) return "未知";
        switch (type) {
            case 1:
                return "转账";
            case 2:
                return "缴费";
            case 3:
                return "收入";
            default:
                return "其他";
        }
    }

    private String getStatusLabel(Integer status) {
        if (status == null) return "";
        switch (status) {
            case 0:
                return "[处理中]";
            case 1:
                return "[成功]";
            case 2:
                return "[失败]";
            default:
                return "";
        }
    }
}
