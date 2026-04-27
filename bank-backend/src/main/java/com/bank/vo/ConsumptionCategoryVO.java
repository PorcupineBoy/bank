package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConsumptionCategoryVO {
    private Integer category;
    private String categoryName;
    private BigDecimal amount;
    private Integer count;
    private BigDecimal percentage;
}
