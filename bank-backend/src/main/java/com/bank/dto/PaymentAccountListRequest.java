package com.bank.dto;

import lombok.Data;

@Data
public class PaymentAccountListRequest extends ReqBasic {
    private Integer paymentType;
}
