package com.bank.mcp;

import com.bank.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * MCP 调用网关
 * 
 * 核心职责：
 * 1. 根据 LLM 解析出的意图和参数，路由到对应的 Skill
 * 2. 执行参数校验（基于 Skill 元数据的 ParameterSchema）
 * 3. 根据安全等级做前置校验
 * 4. 调用 Skill 并返回结果
 * 
 * 作为 LLM 与 业务能力 之间的桥梁，确保：
 * - 只调用已注册的合法 Skill
 * - 参数类型和必填项得到校验
 * - 安全约束得到执行
 */
@Slf4j
@Component
public class McpGateway {

    private McpSkillRegistry registry;

    @Autowired
    public void setRegistry(McpSkillRegistry registry) {
        this.registry = registry;
    }

    /**
     * 执行指定 Skill
     *
     * @param skillName Skill 名称
     * @param userId 用户 ID
     * @param params 参数 Map
     * @return SkillResult
     * @throws BusinessException 当 Skill 不存在或参数校验失败时
     */
    public SkillResult executeSkill(String skillName, Long userId, Map<String, Object> params) {
        // 1. 查找 Skill
        McpSkill skill = registry.getSkill(skillName);
        if (skill == null) {
            throw new BusinessException(5000, "Unknown skill: " + skillName);
        }

        // 2. 参数校验
        validateParams(skill.getMeta(), params);

        // 3. 执行 Skill
        log.info("[MCP] Executing skill: {} for user: {}", skillName, userId);
        SkillResult result = skill.execute(userId, params);
        log.info("[MCP] Skill {} executed successfully, intent: {}", skillName, result);

        return result;
    }

    /**
     * 获取所有 Skill 的元数据（用于构建 System Prompt）
     */
    public java.util.List<SkillMeta> getAllSkillMeta() {
        return registry.getAllSkillMeta();
    }

    /**
     * 校验参数是否符合 Skill 的 Schema 定义
     */
    private void validateParams(SkillMeta meta, Map<String, Object> params) {
        if (params == null) {
            if (meta.getParameters() != null && meta.getParameters().values().stream().anyMatch(SkillMeta.ParameterSchema::isRequired)) {
                throw new BusinessException(400, "Missing required parameters for skill: " + meta.getName());
            }
            return;
        }

        for (Map.Entry<String, SkillMeta.ParameterSchema> entry : meta.getParameters().entrySet()) {
            String paramName = entry.getKey();
            SkillMeta.ParameterSchema schema = entry.getValue();

            boolean hasValue = params.containsKey(paramName) && params.get(paramName) != null;

            // 必填校验
            if (schema.isRequired() && !hasValue) {
                throw new BusinessException(400, "Missing required parameter: " + paramName + " for skill: " + meta.getName());
            }

            // 类型校验（仅对非空值）
            if (hasValue) {
                Object value = params.get(paramName);
                boolean typeMatch;
                String schemaType = schema.getType();
                switch (schemaType) {
                    case "string":
                        typeMatch = value instanceof String;
                        break;
                    case "number":
                        typeMatch = value instanceof Number;
                        break;
                    case "boolean":
                        typeMatch = value instanceof Boolean;
                        break;
                    default:
                        typeMatch = true;
                        break;
                }
                if (!typeMatch) {
                    throw new BusinessException(400, "Parameter " + paramName + " should be of type " + schema.getType());
                }
            }
        }
    }
}
