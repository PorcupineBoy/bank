package com.bank.service;

import com.bank.mcp.SkillResult;
import com.bank.vo.ChatMessageVO;

import java.util.List;
import java.util.Map;

public interface AiChatService {
    ChatMessageVO sendMessage(Long userId, String content, String sessionId);
    List<ChatMessageVO> getChatHistory(Long userId, String sessionId, Integer limit);
    String generateNewSessionId();

    /**
     * 通过 MCP-Skill 机制执行指定的 Skill
     * @param userId 用户ID
     * @param skillName Skill 名称（如 query_balance, query_transactions, transfer_prepare）
     * @param params Skill 参数
     * @return SkillResult 包含文本回复 + 结构化数据 + 可选动作
     */
    SkillResult processIntentWithMcp(Long userId, String skillName, Map<String, Object> params);
}
