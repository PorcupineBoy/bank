package com.bank.service;

import com.bank.dto.CardBindRequest;
import com.bank.vo.BalanceVO;
import com.bank.vo.BankCardVO;

import java.util.List;

public interface BankCardService {
    void bindCard(Long userId, CardBindRequest request);
    void unbindCard(Long userId, Long cardId, String tradePassword);
    List<BankCardVO> listCards(Long userId);
    BankCardVO getCardDetail(Long userId, Long cardId);
    void setDefaultCard(Long userId, Long cardId);
    BalanceVO queryBalance(Long userId, Long cardId);
}
