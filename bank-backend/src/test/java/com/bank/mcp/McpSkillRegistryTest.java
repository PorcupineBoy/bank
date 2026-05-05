package com.bank.mcp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MCP-Skill 注册中心单元测试
 */
class McpSkillRegistryTest {

    private McpSkillRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new McpSkillRegistry();
    }

    @Test
    void testRegisterAndGetSkill() {
        McpSkill mockSkill = createMockSkill("test_skill", "测试 Skill", SkillMeta.SecurityLevel.QUERY);
        registry.register(mockSkill);

        assertTrue(registry.contains("test_skill"));
        assertEquals(1, registry.size());
        assertNotNull(registry.getSkill("test_skill"));
        assertNull(registry.getSkill("non_existent"));
    }

    @Test
    void testRegisterAll() {
        McpSkill skill1 = createMockSkill("skill_1", "技能1", SkillMeta.SecurityLevel.QUERY);
        McpSkill skill2 = createMockSkill("skill_2", "技能2", SkillMeta.SecurityLevel.OPERATION);
        registry.registerAll(Arrays.asList(skill1, skill2));

        assertEquals(2, registry.size());
        assertTrue(registry.contains("skill_1"));
        assertTrue(registry.contains("skill_2"));
    }

    @Test
    void testOverwriteExistingSkill() {
        McpSkill skill1 = createMockSkill("duplicate", "原始", SkillMeta.SecurityLevel.QUERY);
        registry.register(skill1);

        McpSkill skill2 = createMockSkill("duplicate", "覆盖", SkillMeta.SecurityLevel.OPERATION);
        registry.register(skill2);

        assertEquals(1, registry.size());
        assertEquals("覆盖", registry.getSkill("duplicate").getMeta().getDescription());
    }

    @Test
    void testGetAllSkillsReturnsCopy() {
        McpSkill skill = createMockSkill("test", "test", SkillMeta.SecurityLevel.QUERY);
        registry.register(skill);

        Map<String, McpSkill> skills = registry.getAllSkills();
        skills.clear(); // 尝试修改副本

        assertEquals(1, registry.size()); // 原始数据不受影响
    }

    @Test
    void testGetAllSkillMeta() {
        McpSkill skill1 = createMockSkill("query_balance", "查询余额", SkillMeta.SecurityLevel.QUERY);
        McpSkill skill2 = createMockSkill("transfer_prepare", "转账预执行", SkillMeta.SecurityLevel.OPERATION);
        registry.registerAll(Arrays.asList(skill1, skill2));

        List<SkillMeta> metas = registry.getAllSkillMeta();
        assertEquals(2, metas.size());
    }

    @Test
    void testEmptyRegistry() {
        assertEquals(0, registry.size());
        assertFalse(registry.contains("any"));
        assertNull(registry.getSkill("any"));
        assertTrue(registry.getAllSkillMeta().isEmpty());
        assertTrue(registry.getAllSkills().isEmpty());
    }

    /**
     * 创建一个可用于测试的 Mock Skill
     */
    private McpSkill createMockSkill(String name, String description, SkillMeta.SecurityLevel securityLevel) {
        return new McpSkill() {
            @Override
            public SkillMeta getMeta() {
                SkillMeta meta = new SkillMeta();
                meta.setName(name);
                meta.setDescription(description);
                meta.setSecurityLevel(securityLevel);
                return meta;
            }

            @Override
            public SkillResult execute(Long userId, Map<String, Object> params) {
                return SkillResult.builder()
                        .reply(name + " executed")
                        .build();
            }
        };
    }
}
