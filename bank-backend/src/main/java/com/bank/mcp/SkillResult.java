package com.bank.mcp;

import lombok.Data;
import lombok.Builder;

import java.util.Map;

/**
 * Skill 执行结果
 * 包含三个部分：
 * - reply：自然语言回复文本（必填）
 * - structuredData：结构化数据，供前端渲染卡片（可选）
 * - action：可选动作（如跳转转账确认页）
 */
@Data
@Builder
public class SkillResult {
    /** 自然语言回复 */
    private String reply;

    /** 结构化的数据，前端可据此渲染卡片 */
    private StructuredData structuredData;

    /** 可选的动作（跳转、确认等） */
    private Action action;

    @Data
    @Builder
    public static class StructuredData {
        /** 数据类型标识，如 balance_card / transaction_list / transfer_preview */
        private String type;
        /** 数据内容 */
        private Map<String, Object> data;
        /** 列表数据（适用于多记录场景） */
        private java.util.List<Map<String, Object>> items;
    }

    @Data
    @Builder
    public static class Action {
        /** 动作类型：navigate / confirm */
        private String type;
        /** 路由目标 */
        private String route;
        /** 动作标签，如 "去转账"、"查看交易记录" */
        private String label;
        /** 动作参数 */
        private Map<String, Object> params;
    }
}
