package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.LoginRequest;
import com.bank.dto.RegisterRequest;
import com.bank.dto.SmsSendRequest;
import com.bank.service.AuthService;
import com.bank.vo.LoginVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/sms/send")
    public Result<Void> sendSms(@RequestBody @Validated SmsSendRequest request) {
        authService.sendSms(request.getPhone(), request.getType());
        return Result.success();
    }

    @PostMapping("/register")
    public Result<Void> register(@RequestBody @Validated RegisterRequest request) {
        authService.register(request);
        return Result.success();
    }

    @PostMapping("/login/password")
    public Result<LoginVO> loginByPassword(@RequestBody @Validated LoginRequest request) {
        return Result.success(authService.loginByPassword(request));
    }

    @PostMapping("/login/sms")
    public Result<LoginVO> loginBySms(@RequestBody @Validated LoginRequest request) {
        return Result.success(authService.loginBySms(request));
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        authService.logout(userId);
        return Result.success();
    }
}
