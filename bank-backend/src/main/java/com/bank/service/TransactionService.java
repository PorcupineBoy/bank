package com.bank.service;

import com.bank.dto.*;
import com.bank.entity.FrequentPaymentAccount;
import com.bank.vo.PaymentBillVO;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;

public interface TransactionService {
    IPage<TransactionVO> queryTransactions(Long userId, TransactionQueryRequest request);
    TransactionVO getTransactionDetail(Long userId, Long transId);
    TransactionVO transfer(Long userId, TransferRequest request);

    PaymentBillVO queryPaymentBill(Long userId, PaymentQueryRequest request);
    TransactionVO payBill(Long userId, PaymentRequest request);
    List<FrequentPaymentAccount> listFrequentPaymentAccounts(Long userId, Integer paymentType);
    void saveFrequentPaymentAccount(Long userId, Integer paymentType, String accountNo, String accountName);
}
