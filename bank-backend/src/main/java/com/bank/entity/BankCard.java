package com.bank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("bank_card")
public class BankCard {
    @TableId(type = IdType.AUTO)
    private Long cardId;
    private Long userId;
    private String cardNoEncrypted;
    private String cardNoMasked;
    private String bankName;
    private Integer cardType;
    private Integer isDefault;
    private Integer status;
    private BigDecimal balance;
    private LocalDateTime bindTime;
}
