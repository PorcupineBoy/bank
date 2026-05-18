package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BankCardVO {
    private Long cardId;
    /** 脱敏卡号（如 **** **** **** 8888） */
    private String cardNoMasked;
    /** 原卡号（解密后），仅用于详情展示，需拖拽/点击小眼睛显示 */
    private String cardNo;
    private String bankName;
    private Integer cardType;
    private Integer isDefault;
    private Integer status;
    private BigDecimal balance;
    private LocalDateTime bindTime;
}
