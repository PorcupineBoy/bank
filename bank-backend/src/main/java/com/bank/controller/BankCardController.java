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

    @PostMapping("/list")
    public Result<List<BankCardVO>> listCards(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(bankCardService.listCards(userId));
    }

    @PostMapping("/detail")
    public Result<BankCardVO> getCardDetail(@RequestBody Map<String, Long> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long cardId = body.get("cardId");
        return Result.success(bankCardService.getCardDetail(userId, cardId));
    }

    @PostMapping("/default")
    public Result<Void> setDefaultCard(@RequestBody Map<String, Long> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long cardId = body.get("cardId");
        bankCardService.setDefaultCard(userId, cardId);
        return Result.success();
    }

    @PostMapping("/balance")
    public Result<BalanceVO> queryBalance(@RequestBody Map<String, Long> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long cardId = body.get("cardId");
        return Result.success(bankCardService.queryBalance(userId, cardId));
    }
}
