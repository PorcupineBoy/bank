package com.bank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long userId;
    private String phone;
    private String passwordHash;
    private String tradePasswordHash;
    private String realName;
    private String idCardEncrypted;
    private String avatarUrl;
    private String nickname;
    private Integer status;
    private Integer loginFailCount;
    private Integer tradeFailCount;
    private BigDecimal singleLimit;
    private BigDecimal dailyLimit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
