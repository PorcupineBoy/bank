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

    @GetMapping
    public Result<IPage<TransactionVO>> queryTransactions(TransactionQueryRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.success(transactionService.queryTransactions(userId, request));
    }

    @GetMapping("/{transId}")
    public Result<TransactionVO> getTransactionDetail(@PathVariable Long transId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(transactionService.getTransactionDetail(userId, transId));
    }

    @PostMapping("/transfer")
    public Result<TransactionVO> transfer(@RequestBody @Validated TransferRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return Result.success(transactionService.transfer(userId, request));
    }
}
