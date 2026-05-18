package com.bank.mcp;

/**
 * MCP-Skill 接口定义
 * 
 * 每个 Skill 封装一个特定的业务能力（查余额、查交易、转账预执行等），
 * 通过 MCP 协议由 LLM 意图推理引擎路由调用。
 * 
 * 设计原则：
 * - 单一职责：每个 Skill 只做一件事
 * - 自描述：Skill 通过 getMeta() 暴露元数据，供 LLM 理解和使用
 * - 安全分级：查询类 Skill 仅需登录态，资金操作类 Skill 需走两阶段确认
 * - 易于扩展：新增 Skill 只需实现此接口并注册为 Spring Bean
 */
public interface McpSkill {

    /**
     * 获取 Skill 元数据
     */
    SkillMeta getMeta();

    /**
     * 执行 Skill
     *
     * @param userId 用户ID（由调用方注入）
     * @param params 参数键值对（由 LLM function_call arguments 解析而来）
     * @return SkillResult 包含文本回复 + 结构化数据 + 可选动作
     */
    SkillResult execute(Long userId, java.util.Map<String, Object> params);
}
