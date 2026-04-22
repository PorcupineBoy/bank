package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionVO {
    private Long transId;
    private String transNo;
    private Integer transType;
    private BigDecimal amount;
    private String payeeName;
    private String payeeCardNoMasked;
    private String payeeBankName;
    private String remark;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
