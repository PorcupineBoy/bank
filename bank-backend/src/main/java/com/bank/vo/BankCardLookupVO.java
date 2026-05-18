package com.bank.vo;

import lombok.Data;

/**
 * 转账时根据姓名查找收款人银行卡的返回结果
 */
@Data
public class BankCardLookupVO {
    /** 收款人用户ID */
    private Long userId;
    /** 收款人真实姓名 */
    private String realName;
    /** 银行卡ID */
    private Long cardId;
    /** 发卡行名称 */
    private String bankName;
    /** 脱敏卡号 */
    private String cardNoMasked;
    /** 卡类型：1-借记卡，2-信用卡 */
    private Integer cardType;
}
