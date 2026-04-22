package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 解绑银行卡请求 DTO
 */
@Data
public class CardUnbindRequest extends ReqBasic {
    @NotBlank(message = "Trade password is required")
    private String tradePassword;
}
