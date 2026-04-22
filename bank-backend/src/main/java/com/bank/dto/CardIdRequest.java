package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 银行卡 ID 请求 DTO（用于详情/默认卡/余额查询等场景）
 */
@Data
public class CardIdRequest extends ReqBasic {
    @NotNull(message = "Card ID is required")
    private Long cardId;
}
