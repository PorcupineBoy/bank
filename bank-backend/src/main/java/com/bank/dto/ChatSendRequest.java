package com.bank.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotBlank;

@Data
@EqualsAndHashCode(callSuper = true)
public class ChatSendRequest extends ReqBasic {
    @NotBlank(message = "Content is required")
    private String content;

    private String sessionId;

    /**
     * 大模型提供商选择
     * - xiaomi：小米 MiMo
     * - none：关闭大模型，仅关键词匹配
     * - null/空：使用配置文件默认值
     */
    private String provider;
}
