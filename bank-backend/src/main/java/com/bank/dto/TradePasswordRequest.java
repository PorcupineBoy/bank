package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class TradePasswordRequest {
    @NotBlank(message = "Trade password is required")
    private String tradePassword;
    private String oldTradePassword;
    private String smsCode;
}
