package com.bank.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * Controller 层入参基类
 * 所有请求 DTO 均须继承此基类，由 ReqBasicAdvice 自动填充
 */
@Data
public class ReqBasic implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 租户标识 */
    private String tenant;

    /** 用户ID（由 JWT 拦截器自动注入） */
    private Long userId;

    /** 用户名（由请求头或 JWT 自动注入） */
    private String userName;
}
