package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.CardBindRequest;
import com.bank.dto.CardIdRequest;
import com.bank.dto.CardListRequest;
import com.bank.dto.CardUnbindRequest;
import com.bank.service.BankCardService;
import com.bank.vo.BalanceVO;
import com.bank.vo.BankCardVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@Validated
public class BankCardController {
    @Autowired
    private BankCardService bankCardService;

    @PostMapping("/bind")
    public Result<BankCardVO> bindCard(@RequestBody @Validated CardBindRequest request) {
        return Result.success(bankCardService.bindCard(request.getUserId(), request));
    }

    @PostMapping("/{cardId}/unbind")
    public Result<Void> unbindCard(@PathVariable Long cardId, @RequestBody @Validated CardUnbindRequest request) {
        bankCardService.unbindCard(request.getUserId(), cardId, request.getTradePassword());
        return Result.success();
    }

    @PostMapping("/list")
    public Result<List<BankCardVO>> listCards(@RequestBody CardListRequest request) {
        return Result.success(bankCardService.listCards(request.getUserId()));
    }

    @PostMapping("/detail")
    public Result<BankCardVO> getCardDetail(@RequestBody @Validated CardIdRequest request) {
        return Result.success(bankCardService.getCardDetail(request.getUserId(), request.getCardId()));
    }

    @PostMapping("/default")
    public Result<Void> setDefaultCard(@RequestBody @Validated CardIdRequest request) {
        bankCardService.setDefaultCard(request.getUserId(), request.getCardId());
        return Result.success();
    }

    @PostMapping("/balance")
    public Result<BalanceVO> queryBalance(@RequestBody @Validated CardIdRequest request) {
        return Result.success(bankCardService.queryBalance(request.getUserId(), request.getCardId()));
    }
}
