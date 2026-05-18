package com.bank.mcp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

/**
 * MCP-Skill 自动注册配置
 * 
 * 收集所有实现了 McpSkill 接口的 Spring Bean，
 * 在启动时自动注册到 McpSkillRegistry。
 * 
 * 新增 Skill 的步骤：
 * 1. 新建一个类实现 McpSkill 接口
 * 2. 标注 @Component 注解
 * 3. 启动后自动注册，无需其他配置
 */
@Slf4j
@Configuration
public class McpSkillConfig {

    @Autowired(required = false)
    private List<McpSkill> skillBeans;

    @Autowired
    private McpSkillRegistry registry;

    @PostConstruct
    public void autoRegisterSkills() {
        if (skillBeans != null && !skillBeans.isEmpty()) {
            registry.registerAll(skillBeans);
            log.info("[MCP] Auto-registered {} skills: {}", skillBeans.size(),
                    skillBeans.stream().map(s -> s.getMeta().getName()).collect(Collectors.toList()));
        } else {
            log.warn("[MCP] No McpSkill beans found for auto-registration");
        }
    }
}
