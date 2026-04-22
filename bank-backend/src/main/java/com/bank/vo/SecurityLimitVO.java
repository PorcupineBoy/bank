package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SecurityLimitVO {
    private BigDecimal singleLimit;
    private BigDecimal dailyLimit;
    private BigDecimal singleLimitMax;
    private BigDecimal dailyLimitMax;
    private BigDecimal singleLimitMin;
    private BigDecimal dailyLimitMin;
}
