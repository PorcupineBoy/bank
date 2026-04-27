package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class PaymentRequest extends ReqBasic {
    @NotNull(message = "Payment type is required")
    private Integer paymentType;

    @NotBlank(message = "Account number is required")
    private String accountNo;

    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotNull(message = "Card ID is required")
    private Long cardId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Trade password is required")
    private String tradePassword;

    private Boolean saveAccount = false;
}
