package com.bank.mcp;

import lombok.Data;

import java.util.Map;

/**
 * Skill 元数据
 * 用于描述 Skill 的名称、功能、参数 Schema 和安全等级，
 * 供 LLM 理解何时调用此 Skill 以及如何构建参数。
 */
@Data
public class SkillMeta {
    /** Skill 唯一标识名，如 query_balance */
    private String name;

    /** Skill 功能描述，供 LLM 理解用途 */
    private String description;

    /** 参数 Schema：参数名 -> 参数描述（含类型、是否必填、说明） */
    private Map<String, ParameterSchema> parameters;

    /** 安全等级 */
    private SecurityLevel securityLevel;

    @Data
    public static class ParameterSchema {
        /** 参数类型：string / number / boolean */
        private String type;
        /** 是否必填 */
        private boolean required;
        /** 参数说明 */
        private String description;
        /** 可选：枚举值列表 */
        private String[] enumValues;

        public ParameterSchema(String type, boolean required, String description) {
            this.type = type;
            this.required = required;
            this.description = description;
        }

        public ParameterSchema(String type, boolean required, String description, String[] enumValues) {
            this.type = type;
            this.required = required;
            this.description = description;
            this.enumValues = enumValues;
        }
    }

    public enum SecurityLevel {
        /** 查询类：仅需登录态 */
        QUERY,
        /** 操作类：需二次确认（预执行 + 确认 + 交易密码） */
        OPERATION
    }
}
