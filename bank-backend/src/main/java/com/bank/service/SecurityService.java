package com.bank.service;

import com.bank.dto.LimitUpdateRequest;
import com.bank.dto.TradePasswordRequest;
import com.bank.vo.SecurityLimitVO;

public interface SecurityService {
    void setTradePassword(Long userId, TradePasswordRequest request);
    void modifyTradePassword(Long userId, TradePasswordRequest request);
    SecurityLimitVO getLimits(Long userId);
    void updateLimits(Long userId, LimitUpdateRequest request);
}
