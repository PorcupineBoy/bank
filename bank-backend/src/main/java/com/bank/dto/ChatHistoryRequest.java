package com.bank.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ChatHistoryRequest extends ReqBasic {
    private String sessionId;
    private Integer limit = 50;
}
