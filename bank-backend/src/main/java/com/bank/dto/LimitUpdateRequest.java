package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class LimitUpdateRequest extends ReqBasic {
    @NotNull(message = "Single limit is required")
    private BigDecimal singleLimit;

    @NotNull(message = "Daily limit is required")
    private BigDecimal dailyLimit;

    @NotBlank(message = "SMS code is required")
    private String smsCode;

    @NotBlank(message = "Trade password is required")
    private String tradePassword;
}
