package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class PaymentQueryRequest extends ReqBasic {
    @NotNull(message = "Payment type is required")
    private Integer paymentType;

    @NotBlank(message = "Account number is required")
    private String accountNo;
}
