package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ConsumptionAnalysisVO {
    private String month;
    private BigDecimal totalExpense;
    private BigDecimal totalIncome;
    private BigDecimal monthOverMonthRatio;
    private List<ConsumptionCategoryVO> categoryList;
    private String aiInsight;
}
