package com.bank.service;

import com.bank.dto.TransactionQueryRequest;
import com.bank.dto.TransferRequest;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;

public interface TransactionService {
    IPage<TransactionVO> queryTransactions(Long userId, TransactionQueryRequest request);
    TransactionVO getTransactionDetail(Long userId, Long transId);
    TransactionVO transfer(Long userId, TransferRequest request);
}
