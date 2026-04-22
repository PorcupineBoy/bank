package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.LimitUpdateRequest;
import com.bank.dto.TradePasswordRequest;
import com.bank.service.SecurityService;
import com.bank.vo.SecurityLimitVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user/security")
@Validated
public class SecurityController {
    @Autowired
    private SecurityService securityService;

    @PostMapping("/trade-password")
    public Result<Void> setTradePassword(@RequestBody @Validated TradePasswordRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        securityService.setTradePassword(userId, request);
        return Result.success();
    }

    @PutMapping("/trade-password")
    public Result<Void> modifyTradePassword(@RequestBody @Validated TradePasswordRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        securityService.modifyTradePassword(userId, request);
        return Result.success();
    }

    @GetMapping("/limits")
    public Result<SecurityLimitVO> getLimits(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(securityService.getLimits(userId));
    }

    @PutMapping("/limits")
    public Result<Void> updateLimits(@RequestBody @Validated LimitUpdateRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        securityService.updateLimits(userId, request);
        return Result.success();
    }
}
