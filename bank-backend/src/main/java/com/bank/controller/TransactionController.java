package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.*;
import com.bank.entity.FrequentPaymentAccount;
import com.bank.service.TransactionService;
import com.bank.vo.PaymentBillVO;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Validated
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @PostMapping("/query")
    public Result<IPage<TransactionVO>> queryTransactions(@RequestBody TransactionQueryRequest request) {
        return Result.success(transactionService.queryTransactions(request.getUserId(), request));
    }

    @PostMapping("/detail")
    public Result<TransactionVO> getTransactionDetail(@RequestBody @Validated TransactionDetailRequest request) {
        return Result.success(transactionService.getTransactionDetail(request.getUserId(), request.getTransId()));
    }

    @PostMapping("/transfer")
    public Result<TransactionVO> transfer(@RequestBody @Validated TransferRequest request) {
        return Result.success(transactionService.transfer(request.getUserId(), request));
    }

    @PostMapping("/payment/query")
    public Result<PaymentBillVO> queryPaymentBill(@RequestBody @Validated PaymentQueryRequest request) {
        return Result.success(transactionService.queryPaymentBill(request.getUserId(), request));
    }

    @PostMapping("/payment")
    public Result<TransactionVO> payBill(@RequestBody @Validated PaymentRequest request) {
        return Result.success(transactionService.payBill(request.getUserId(), request));
    }

    @PostMapping("/payment/accounts")
    public Result<List<FrequentPaymentAccount>> listFrequentPaymentAccounts(@RequestBody PaymentAccountListRequest request) {
        return Result.success(transactionService.listFrequentPaymentAccounts(request.getUserId(), request.getPaymentType()));
    }
}
