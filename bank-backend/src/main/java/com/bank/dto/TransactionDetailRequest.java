package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 交易详情查询请求 DTO
 */
@Data
public class TransactionDetailRequest extends ReqBasic {
    @NotNull(message = "Transaction ID is required")
    private Long transId;
}
