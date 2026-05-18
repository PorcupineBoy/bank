package com.bank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("chat_message")
public class ChatMessage {
    @TableId(type = IdType.AUTO)
    private Long messageId;
    private Long userId;
    private String sessionId;
    private Integer role;
    private String content;
    private String intent;
    private String functionCalled;
    private LocalDateTime createdAt;
}
