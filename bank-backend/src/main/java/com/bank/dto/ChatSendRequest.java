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
}
