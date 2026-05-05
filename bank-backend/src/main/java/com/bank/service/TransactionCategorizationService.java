package com.bank.service;

import com.bank.vo.ConsumptionAnalysisVO;

import java.time.LocalDate;

public interface TransactionCategorizationService {
    Integer categorizeTransaction(String payeeName, String remark, Integer transType);
    void recategorizeTransaction(Long transId, Integer category, String subCategory);

    /**
     * 按月分析消费
     * @param userId 用户ID
     * @param month 月份（取该月第一天即可）
     */
    ConsumptionAnalysisVO analyzeConsumption(Long userId, LocalDate month);

    /**
     * 按年分析消费
     * @param userId 用户ID
     * @param year 年份
     */
    ConsumptionAnalysisVO analyzeConsumptionByYear(Long userId, Integer year);
}
