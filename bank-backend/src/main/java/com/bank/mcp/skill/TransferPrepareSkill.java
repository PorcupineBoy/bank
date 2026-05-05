package com.bank.mcp.skill;

import com.bank.mcp.McpSkill;
import com.bank.mcp.SkillMeta;
import com.bank.mcp.SkillResult;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

/**
 * 转账预执行 Skill
 * 
 * 功能：解析转账意图并提取参数（收款人、金额、付款卡），
 * 生成确认卡片供用户核对，**不执行实际资金操作**。
 * 
 * 安全等级：OPERATION（需走两阶段确认）
 * 
 * 核心设计理念：
 * - 此 Skill 仅做"预执行"——提取参数、返回确认信息
 * - 实际转账由前端跳转至标准确认页，输入交易密码后执行
 * - 符合 BR-AI-002：资金类操作不可直接执行
 * 
 * 调用示例：
 *   transfer_prepare(payee_name="张三", amount=500)
 *   transfer_prepare(payee_name="妈妈", amount=1000, bank_name="工商银行")
 */
@Component
public class TransferPrepareSkill implements McpSkill {

    @Override
    public SkillMeta getMeta() {
        SkillMeta meta = new SkillMeta();
        meta.setName("transfer_prepare");
        meta.setDescription("转账预执行：提取转账所需的收款人姓名、金额等参数，生成确认信息供用户核对。注意：此操作不执行实际转账，用户确认后需跳转至标准转账确认页面输入交易密码完成转账");
        meta.setSecurityLevel(SkillMeta.SecurityLevel.OPERATION);

        Map<String, SkillMeta.ParameterSchema> params = new LinkedHashMap<>();
        params.put("payee_name", new SkillMeta.ParameterSchema("string", true,
                "收款人姓名（必须），如\"张三\"、\"妈妈\""));
        params.put("amount", new SkillMeta.ParameterSchema("number", true,
                "转账金额（必须），单位为元，如500.00"));
        params.put("bank_name", new SkillMeta.ParameterSchema("string", false,
                "收款银行（可选），如\"工商银行\"、\"招商银行\""));
        params.put("remark", new SkillMeta.ParameterSchema("string", false,
                "转账备注（可选），不超过20字"));
        meta.setParameters(params);

        return meta;
    }

    @Override
    public SkillResult execute(Long userId, Map<String, Object> params) {
        String payeeName = params != null && params.containsKey("payee_name")
                ? (String) params.get("payee_name") : "未知";
        BigDecimal amount = params != null && params.containsKey("amount")
                ? new BigDecimal(((Number) params.get("amount")).doubleValue())
                : BigDecimal.ZERO;
        String bankName = params != null && params.containsKey("bank_name")
                ? (String) params.get("bank_name") : null;
        String remark = params != null && params.containsKey("remark")
                ? (String) params.get("remark") : null;

        // 金额合法性校验
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return SkillResult.builder()
                    .reply("转账金额必须大于0元，请输入正确的金额。")
                    .build();
        }
        if (amount.scale() > 2) {
            amount = amount.setScale(2, BigDecimal.ROUND_HALF_UP);
        }

        // 构建确认结构数据
        Map<String, Object> confirmData = new LinkedHashMap<>();
        confirmData.put("payeeName", payeeName);
        confirmData.put("amount", amount.setScale(2, BigDecimal.ROUND_HALF_UP));
        confirmData.put("bankName", bankName != null ? bankName : "未指定");
        confirmData.put("remark", remark != null ? remark : "");
        confirmData.put("intent", "TRANSFER_CONFIRM");

        // 构建回复文本
        StringBuilder sb = new StringBuilder();
        sb.append("请确认转账信息：\n");
        sb.append("━━━━━━━━━━━━━━━━━━\n");
        sb.append("收款人：").append(payeeName).append("\n");
        sb.append("金　额：¥").append(amount.setScale(2, BigDecimal.ROUND_HALF_UP)).append("\n");
        if (bankName != null) {
            sb.append("收款行：").append(bankName).append("\n");
        }
        if (remark != null && !remark.isEmpty()) {
            sb.append("备　注：").append(remark).append("\n");
        }
        sb.append("━━━━━━━━━━━━━━━━━━\n");
        sb.append("点击下方「去转账」按钮进入确认页面，输入交易密码后完成转账。");
        sb.append("\n\n⚠️ 请仔细核对收款人信息，转账后将无法撤销。");

        return SkillResult.builder()
                .reply(sb.toString().trim())
                .structuredData(SkillResult.StructuredData.builder()
                        .type("transfer_preview")
                        .data(confirmData)
                        .build())
                .action(SkillResult.Action.builder()
                        .type("navigate")
                        .route("/transfer/confirm")
                        .label("去转账")
                        .params(confirmData)
                        .build())
                .build();
    }
}
