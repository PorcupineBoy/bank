package com.bank.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageVO {
    private Long messageId;
    private String sessionId;
    private Integer role;
    private String content;
    private String intent;
    private String functionCalled;
    private LocalDateTime createdAt;
}
