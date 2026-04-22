package com.bank.service;

import com.bank.dto.LoginRequest;
import com.bank.dto.RegisterRequest;
import com.bank.vo.LoginVO;

public interface AuthService {
    void sendSms(String phone, String type);
    void register(RegisterRequest request);
    LoginVO loginByPassword(LoginRequest request);
    LoginVO loginBySms(LoginRequest request);
    void logout(Long userId);
}
