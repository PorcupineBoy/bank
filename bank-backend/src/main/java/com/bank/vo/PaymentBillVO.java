package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentBillVO {
    private Integer paymentType;
    private String paymentTypeName;
    private String accountNo;
    private String accountName;
    private BigDecimal amount;
    private String period;
}
