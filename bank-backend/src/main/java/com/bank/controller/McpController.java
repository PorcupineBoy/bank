package com.bank.controller;

import com.bank.common.Constants;
import com.bank.common.Result;
import com.bank.dto.McpExecuteRequest;
import com.bank.exception.BusinessException;
import com.bank.mcp.McpSkill;
import com.bank.mcp.McpSkillRegistry;
import com.bank.mcp.SkillMeta;
import com.bank.mcp.SkillResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

/**
 * MCP-Skill REST API 入口
 * 提供统一的 Skill 执行和查询接口，供前端 AI 助手模块调用
 */
@Slf4j
@RestController
@RequestMapping("/api/mcp")
public class McpController {

    @Autowired
    private McpSkillRegistry skillRegistry;

    /**
     * 执行指定 Skill
     *
     * @param request 包含 skillName 和参数的请求
     * @return Skill 执行结果
     */
    @PostMapping("/execute")
    public Result<SkillResult> executeSkill(@RequestBody @Valid McpExecuteRequest request) {
        log.info("[MCP] Execute skill: name={}, params={}", request.getSkillName(), request.getParams());

        // 1. 查找 Skill
        McpSkill skill = skillRegistry.getSkill(request.getSkillName());
        if (skill == null) {
            throw new BusinessException(Constants.AI_SKILL_EXEC_ERROR, "Skill not found: " + request.getSkillName());
        }

        // 2. 执行 Skill
        SkillResult result = skill.execute(request.getUserId(), request.getParams());
        log.info("[MCP] Skill executed: name={}", request.getSkillName());

        return Result.success(result);
    }

    /**
     * 获取所有已注册的 Skill 元数据列表
     */
    @PostMapping("/skills")
    public Result<List<SkillMeta>> listSkills() {
        return Result.success(skillRegistry.getAllSkillMeta());
    }
}
