package com.bank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("frequent_payment_account")
public class FrequentPaymentAccount {
    @TableId(type = IdType.AUTO)
    private Long accountId;
    private Long userId;
    private Integer paymentType;
    private String accountNo;
    private String accountName;
    private LocalDateTime createdAt;
}
