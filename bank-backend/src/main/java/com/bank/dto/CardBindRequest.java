package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Data
public class CardBindRequest extends ReqBasic {
    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "^\\d{13,19}$", message = "Invalid card number")
    private String cardNo;

    @NotBlank(message = "Cardholder name is required")
    private String cardHolderName;

    @NotBlank(message = "ID card is required")
    private String idCard;

    @NotBlank(message = "Bank reserved phone is required")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "Invalid phone number")
    private String reservedPhone;

    @NotBlank(message = "SMS code is required")
    private String smsCode;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotNull(message = "Card type is required")
    private Integer cardType;
}
