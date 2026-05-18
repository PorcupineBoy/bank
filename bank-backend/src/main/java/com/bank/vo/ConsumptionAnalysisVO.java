package com.bank.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ConsumptionAnalysisVO {
    /** 分析维度：month-按月，year-按年 */
    private String dimension;
    /** 月份（按月时使用，格式：yyyy年MM月） */
    private String month;
    /** 年份（按年时使用，格式：yyyy年） */
    private String year;
    private BigDecimal totalExpense;
    private BigDecimal totalIncome;
    /** 环比比率（月环比/年同比） */
    private BigDecimal monthOverMonthRatio;
    /** 同比比率（仅按年时使用） */
    private BigDecimal yearOverYearRatio;
    private List<ConsumptionCategoryVO> categoryList;
    private String aiInsight;
}
