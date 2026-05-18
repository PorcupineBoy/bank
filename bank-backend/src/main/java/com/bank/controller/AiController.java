package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.*;
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
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

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
        return Result.success(aiChatService.sendMessage(request.getUserId(), request.getContent(), request.getSessionId(), request.getProvider()));
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
    public Result<ConsumptionAnalysisVO> analyzeConsumption(@RequestBody @Validated ConsumptionAnalysisRequest request) {
        String dimension = request.getDimension() != null ? request.getDimension() : "month";

        try {
            if ("year".equals(dimension)) {
                Integer year;
                if (request.getDate() != null && !request.getDate().isEmpty()) {
                    year = Integer.parseInt(request.getDate());
                    if (year < 1900 || year > 2100) {
                        return Result.error("年份必须在 1900~2100 之间");
                    }
                } else {
                    year = LocalDate.now().getYear();
                }
                // 边界检查：不允许查询未来年份
                if (year > LocalDate.now().getYear()) {
                    return Result.error("不能查询未来的年份");
                }
                return Result.success(categorizationService.analyzeConsumptionByYear(request.getUserId(), year));
            } else {
                LocalDate month;
                if (request.getDate() != null && !request.getDate().isEmpty()) {
                    try {
                        month = YearMonth.parse(request.getDate(), DateTimeFormatter.ofPattern("yyyy-MM")).atDay(1);
                    } catch (DateTimeParseException e) {
                        return Result.error("日期格式错误，按月请使用 yyyy-MM 格式（如 2026-05）");
                    }
                } else {
                    month = LocalDate.now().withDayOfMonth(1);
                }
                // 边界检查：不允许查询未来月份
                YearMonth target = YearMonth.from(month);
                YearMonth current = YearMonth.from(LocalDate.now());
                if (target.isAfter(current)) {
                    return Result.error("不能查询未来的月份");
                }
                return Result.success(categorizationService.analyzeConsumption(request.getUserId(), month));
            }
        } catch (NumberFormatException e) {
            return Result.error("日期参数格式不正确，按年请使用 yyyy 格式（如 2026）");
        }
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
}
