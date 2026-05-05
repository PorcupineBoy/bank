package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.ChatHistoryRequest;
import com.bank.dto.ChatSendRequest;
import com.bank.dto.ReqBasic;
import com.bank.mcp.McpGateway;
import com.bank.mcp.SkillMeta;
import com.bank.service.AiChatService;
import com.bank.service.TransactionCategorizationService;
import com.bank.vo.ChatMessageVO;
import com.bank.vo.ConsumptionAnalysisVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Validated
public class AiController {

    @Autowired
    private AiChatService aiChatService;
    @Autowired
    private TransactionCategorizationService categorizationService;
    @Autowired
    private McpGateway mcpGateway;

    @PostMapping("/chat/send")
    public Result<ChatMessageVO> sendMessage(@RequestBody @Validated ChatSendRequest request) {
        return Result.success(aiChatService.sendMessage(request.getUserId(), request.getContent(), request.getSessionId()));
    }

    @PostMapping("/chat/history")
    public Result<List<ChatMessageVO>> getChatHistory(@RequestBody ChatHistoryRequest request) {
        return Result.success(aiChatService.getChatHistory(request.getUserId(), request.getSessionId(), request.getLimit()));
    }

    @PostMapping("/chat/session")
    public Result<String> newSession(@RequestBody ReqBasic request) {
        return Result.success(aiChatService.generateNewSessionId());
    }

    @PostMapping("/consumption/analysis")
    public Result<ConsumptionAnalysisVO> analyzeConsumption(@RequestBody ReqBasic request) {
        return Result.success(categorizationService.analyzeConsumption(request.getUserId(), LocalDate.now()));
    }

    // ======================== MCP-Skill 接口 ========================

    /**
     * 执行 MCP Skill
     * 可用于 LLM 模式下的直接 function_call 路由
     */
    @PostMapping("/mcp/execute")
    public Result<com.bank.mcp.SkillResult> executeSkill(@RequestBody McpExecuteRequest request) {
        com.bank.mcp.SkillResult result = aiChatService.processIntentWithMcp(
                request.getUserId(), request.getSkillName(), request.getParams());
        return Result.success(result);
    }

    /**
     * 获取所有已注册的 Skill 元数据（供 LLM System Prompt 构建）
     */
    @PostMapping("/mcp/skills")
    public Result<List<SkillMeta>> listSkills(@RequestBody ReqBasic request) {
        return Result.success(mcpGateway.getAllSkillMeta());
    }

    /**
     * MCP Skill 执行请求 DTO（内部类）
     */
    public static class McpExecuteRequest extends ReqBasic {
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public Map<String, Object> getParams() { return params; }
        public void setParams(Map<String, Object> params) { this.params = params; }
        private String skillName;
        private Map<String, Object> params;
    }
}
