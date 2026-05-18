package com.bank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 根据收款人姓名查找银行卡请求
 */
@Data
public class CardsLookupRequest extends ReqBasic {
    /** 收款人姓名（模糊匹配） */
    @NotBlank(message = "收款人姓名不能为空")
    private String name;
}
