package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BalanceVO {
    private Long cardId;
    private String cardNoMasked;
    private String bankName;
    private BigDecimal balance;
}
