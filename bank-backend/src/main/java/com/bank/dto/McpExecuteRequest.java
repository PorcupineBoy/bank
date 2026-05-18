package com.bank.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;
import java.util.Map;

/**
 * MCP-Skill 执行请求 DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class McpExecuteRequest extends ReqBasic {

    @NotBlank(message = "Skill name is required")
    private String skillName;

    private Map<String, Object> params;
}
