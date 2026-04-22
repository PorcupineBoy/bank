package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class RegisterRequest extends ReqBasic {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "SMS code is required")
    private String smsCode;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Real name is required")
    private String realName;

    @NotBlank(message = "ID card is required")
    private String idCard;
}
