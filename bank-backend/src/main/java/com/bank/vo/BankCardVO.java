package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BankCardVO {
    private Long cardId;
    private String cardNoMasked;
    private String bankName;
    private Integer cardType;
    private Integer isDefault;
    private Integer status;
    private BigDecimal balance;
    private LocalDateTime bindTime;
}
