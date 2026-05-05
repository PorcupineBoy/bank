package com.bank.mcp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * MCP-Skill 注册中心
 * 
 * 负责管理所有 Skill 的注册、发现和查找。
 * 所有实现了 McpSkill 接口的 Spring Bean 会在启动时自动注册。
 * 
 * 职责：
 * - 提供所有 Skill 元数据列表（供 LLM System Prompt 构建）
 * - 按 Skill 名称查找并调用
 * - 支持运行时注册（热加载扩展）
 */
@Slf4j
@Component
public class McpSkillRegistry {

    /** Skill 名称 -> McpSkill 实例 */
    private final ConcurrentHashMap<String, McpSkill> skillMap = new ConcurrentHashMap<>();

    /**
     * 注册单个 Skill（由 Spring 容器自动调用）
     */
    public void register(McpSkill skill) {
        String name = skill.getMeta().getName();
        skillMap.put(name, skill);
        log.info("[MCP] Skill registered: {} (security={})", name, skill.getMeta().getSecurityLevel());
    }

    /**
     * 批量注册 Skill
     */
    public void registerAll(List<McpSkill> skills) {
        for (McpSkill skill : skills) {
            register(skill);
        }
    }

    /**
     * 根据名称查找 Skill
     */
    public McpSkill getSkill(String name) {
        return skillMap.get(name);
    }

    /**
     * 获取所有已注册的 Skill（返回副本防止外部修改）
     */
    public Map<String, McpSkill> getAllSkills() {
        return new HashMap<>(skillMap);
    }

    /**
     * 获取所有 Skill 元数据列表（用于构建 LLM System Prompt）
     */
    public List<SkillMeta> getAllSkillMeta() {
        return skillMap.values().stream()
                .map(McpSkill::getMeta)
                .collect(Collectors.toList());
    }

    /**
     * 检查 Skill 是否存在
     */
    public boolean contains(String name) {
        return skillMap.containsKey(name);
    }

    /**
     * 获取已注册的 Skill 数量
     */
    public int size() {
        return skillMap.size();
    }

    @PostConstruct
    public void init() {
        log.info("[MCP] SkillRegistry initialized");
    }
}
