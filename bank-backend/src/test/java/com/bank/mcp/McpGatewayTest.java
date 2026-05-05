package com.bank.mcp;

import com.bank.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * MCP 调用网关单元测试
 */
@ExtendWith(MockitoExtension.class)
class McpGatewayTest {

    @Mock
    private McpSkillRegistry registry;

    private McpGateway gateway;

    @BeforeEach
    void setUp() {
        gateway = new McpGateway();
        gateway.setRegistry(registry);
    }

    @Test
    void testExecuteSkill_Success() {
        McpSkill skill = createSimpleSkill("test_skill");
        when(registry.getSkill("test_skill")).thenReturn(skill);

        SkillResult result = gateway.executeSkill("test_skill", 1L, null);

        assertNotNull(result);
        assertEquals("test_skill executed", result.getReply());
    }

    @Test
    void testExecuteSkill_SkillNotFound() {
        when(registry.getSkill("unknown")).thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> gateway.executeSkill("unknown", 1L, null));
        assertEquals(5000, ex.getCode());
    }

    @Test
    void testExecuteSkill_MissingRequiredParam() {
        SkillMeta meta = createSkillMetaWithParams("test_skill",
                Collections.singletonMap("name", new SkillMeta.ParameterSchema("string", true, "名称")));
        McpSkill skill = createSkillWithMeta(meta);
        when(registry.getSkill("test_skill")).thenReturn(skill);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> gateway.executeSkill("test_skill", 1L, Collections.singletonMap("other", "val")));
        assertTrue(ex.getMessage().contains("Missing required parameter"));
    }

    @Test
    void testExecuteSkill_NullParamsWithRequired() {
        SkillMeta meta = createSkillMetaWithParams("test_skill",
                Collections.singletonMap("name", new SkillMeta.ParameterSchema("string", true, "名称")));
        McpSkill skill = createSkillWithMeta(meta);
        when(registry.getSkill("test_skill")).thenReturn(skill);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> gateway.executeSkill("test_skill", 1L, null));
        assertTrue(ex.getMessage().contains("Missing required parameters"));
    }

    @Test
    void testExecuteSkill_TypeMismatch() {
        Map<String, SkillMeta.ParameterSchema> paramMap = new HashMap<>();
        paramMap.put("amount", new SkillMeta.ParameterSchema("number", true, "金额"));
        SkillMeta meta = createSkillMetaWithParams("test_skill", paramMap);
        McpSkill skill = createSkillWithMeta(meta);
        when(registry.getSkill("test_skill")).thenReturn(skill);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> gateway.executeSkill("test_skill", 1L,
                        Collections.singletonMap("amount", "not_a_number")));
        assertTrue(ex.getMessage().contains("should be of type"));
    }

    @Test
    void testExecuteSkill_BooleanTypeValidation() {
        Map<String, SkillMeta.ParameterSchema> paramMap = new HashMap<>();
        paramMap.put("flag", new SkillMeta.ParameterSchema("boolean", false, "开关"));
        SkillMeta meta = createSkillMetaWithParams("test_skill", paramMap);
        McpSkill skill = createSkillWithMeta(meta);
        when(registry.getSkill("test_skill")).thenReturn(skill);

        // 正确的 boolean 类型
        SkillResult result = gateway.executeSkill("test_skill", 1L,
                Collections.singletonMap("flag", true));
        assertNotNull(result);

        // 错误的类型
        BusinessException ex = assertThrows(BusinessException.class,
                () -> gateway.executeSkill("test_skill", 1L,
                        Collections.singletonMap("flag", "true")));
        assertTrue(ex.getMessage().contains("should be of type"));
    }

    @Test
    void testExecuteSkill_NullParamValueWithRequired() {
        Map<String, SkillMeta.ParameterSchema> paramMap = new HashMap<>();
        paramMap.put("name", new SkillMeta.ParameterSchema("string", true, "名称"));
        SkillMeta meta = createSkillMetaWithParams("test_skill", paramMap);
        McpSkill skill = createSkillWithMeta(meta);
        when(registry.getSkill("test_skill")).thenReturn(skill);

        // 参数存在但为 null
        Map<String, Object> params = new HashMap<>();
        params.put("name", null);
        params.put("other", "val");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> gateway.executeSkill("test_skill", 1L, params));
        assertTrue(ex.getMessage().contains("Missing required parameter"));
    }

    @Test
    void testGetAllSkillMeta() {
        when(registry.getAllSkillMeta()).thenReturn(Collections.emptyList());

        List<SkillMeta> metas = gateway.getAllSkillMeta();
        assertTrue(metas.isEmpty());
    }

    @Test
    void testExecuteSkillPassesParamsThrough() {
        McpSkill skill = mock(McpSkill.class);
        SkillMeta meta = new SkillMeta();
        meta.setName("echo");
        meta.setParameters(Collections.emptyMap());
        when(skill.getMeta()).thenReturn(meta);
        when(skill.execute(anyLong(), any())).thenAnswer(invocation -> {
            Long uid = invocation.getArgument(0);
            Map<String, Object> p = invocation.getArgument(1);
            return SkillResult.builder()
                    .reply("user:" + uid + " params:" + p)
                    .build();
        });

        when(registry.getSkill("echo")).thenReturn(skill);

        Map<String, Object> params = new HashMap<>();
        params.put("key", "value");
        SkillResult result = gateway.executeSkill("echo", 42L, params);

        assertEquals("user:42 params:{key=value}", result.getReply());
    }

    // ====== 辅助方法 ======

    private McpSkill createSimpleSkill(String name) {
        return new McpSkill() {
            @Override
            public SkillMeta getMeta() {
                SkillMeta meta = new SkillMeta();
                meta.setName(name);
                meta.setParameters(Collections.emptyMap());
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

    private SkillMeta createSkillMetaWithParams(String name, Map<String, SkillMeta.ParameterSchema> params) {
        SkillMeta meta = new SkillMeta();
        meta.setName(name);
        meta.setParameters(params);
        return meta;
    }

    private McpSkill createSkillWithMeta(SkillMeta meta) {
        McpSkill skill = mock(McpSkill.class);
        when(skill.getMeta()).thenReturn(meta);
        when(skill.execute(anyLong(), any())).thenReturn(
                SkillResult.builder().reply("ok").build());
        return skill;
    }
}
