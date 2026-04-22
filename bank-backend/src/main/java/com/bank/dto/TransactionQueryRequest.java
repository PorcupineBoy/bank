package com.bank.dto;

import lombok.Data;

@Data
public class TransactionQueryRequest extends ReqBasic {
    private Integer transType;
    private String timeRange;
    private String startDate;
    private String endDate;
    private Integer page = 1;
    private Integer size = 20;
}
