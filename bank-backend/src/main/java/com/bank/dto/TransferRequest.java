package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class TransferRequest extends ReqBasic {
    @NotNull(message = "Card ID is required")
    private Long cardId;

    @NotBlank(message = "Payee name is required")
    private String payeeName;

    @NotBlank(message = "Payee card number is required")
    private String payeeCardNo;

    @NotBlank(message = "Payee bank is required")
    private String payeeBankName;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String remark;

    @NotBlank(message = "Trade password is required")
    private String tradePassword;
}
