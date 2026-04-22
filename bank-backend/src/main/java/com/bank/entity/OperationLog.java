package com.bank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long logId;
    private Long userId;
    private String operationType;
    private String operationDetail;
    private Integer operationResult;
    private String ipAddress;
    private String deviceInfo;
    private LocalDateTime createdAt;
}
