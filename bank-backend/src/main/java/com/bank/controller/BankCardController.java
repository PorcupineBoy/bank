package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.CardBindRequest;
import com.bank.service.BankCardService;
import com.bank.vo.BalanceVO;
import com.bank.vo.BankCardVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@Validated
public class BankCardController {
    @Autowired
    private BankCardService bankCardService;

    @PostMapping("/bind")
    public Result<Void> bindCard(@RequestBody @Validated CardBindRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        bankCardService.bindCard(userId, request);
        return Result.success();
    }

    @PostMapping("/{cardId}/unbind")
    public Result<Void> unbindCard(@PathVariable Long cardId, @RequestBody Map<String, String> body, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        bankCardService.unbindCard(userId, cardId, body.get("tradePassword"));
        return Result.success();
    }

    @GetMapping
    public Result<List<BankCardVO>> listCards(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(bankCardService.listCards(userId));
    }

    @GetMapping("/{cardId}")
    public Result<BankCardVO> getCardDetail(@PathVariable Long cardId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(bankCardService.getCardDetail(userId, cardId));
    }

    @PutMapping("/{cardId}/default")
    public Result<Void> setDefaultCard(@PathVariable Long cardId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        bankCardService.setDefaultCard(userId, cardId);
        return Result.success();
    }

    @GetMapping("/{cardId}/balance")
    public Result<BalanceVO> queryBalance(@PathVariable Long cardId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(bankCardService.queryBalance(userId, cardId));
    }
}
