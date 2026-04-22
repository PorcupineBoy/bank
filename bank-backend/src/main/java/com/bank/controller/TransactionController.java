package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.TransactionQueryRequest;
import com.bank.dto.TransferRequest;
import com.bank.service.TransactionService;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/transactions")
@Validated
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @PostMapping("/query")
    public Result<IPage<TransactionVO>> queryTransactions(@RequestBody TransactionQueryRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.success(transactionService.queryTransactions(userId, request));
    }

    @PostMapping("/detail")
    public Result<TransactionVO> getTransactionDetail(@RequestBody Map<String, Long> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long transId = body.get("transId");
        return Result.success(transactionService.getTransactionDetail(userId, transId));
    }

    @PostMapping("/transfer")
    public Result<TransactionVO> transfer(@RequestBody @Validated TransferRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.success(transactionService.transfer(userId, request));
    }
}
