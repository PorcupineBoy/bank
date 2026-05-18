package com.bank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("transaction")
public class Transaction {
    @TableId(type = IdType.AUTO)
    private Long transId;
    private String transNo;
    private Long userId;
    private Long cardId;
    private Integer transType;
    private BigDecimal amount;
    private String payeeName;
    private String payeeCardNoMasked;
    private String payeeBankName;
    private String remark;
    private Integer category;
    private String subCategory;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
