package com.bank.service;

import com.bank.vo.ConsumptionAnalysisVO;

import java.time.LocalDate;

public interface TransactionCategorizationService {
    Integer categorizeTransaction(String payeeName, String remark, Integer transType);
    void recategorizeTransaction(Long transId, Integer category, String subCategory);
    ConsumptionAnalysisVO analyzeConsumption(Long userId, LocalDate month);
}
