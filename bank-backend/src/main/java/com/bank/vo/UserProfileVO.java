package com.bank.vo;

import lombok.Data;

@Data
public class UserProfileVO {
    private Long userId;
    private String phone;
    private String realName;
    private String nickname;
    private String avatarUrl;
}
