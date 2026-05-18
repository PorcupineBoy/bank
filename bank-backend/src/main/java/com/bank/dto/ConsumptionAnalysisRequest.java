package com.bank.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.Pattern;

/**
 * 消费分析请求 DTO
 * 支持按月、按年维度查询消费分析数据
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ConsumptionAnalysisRequest extends ReqBasic {
    private static final long serialVersionUID = 1L;

    /** 分析维度：month-按月，year-按年，默认month */
    @Pattern(regexp = "^(month|year)$", message = "dimension 仅支持 month（按月）或 year（按年）")
    private String dimension = "month";

    /**
     * 日期：
     * - 按月：yyyy-MM 格式（如 2026-05）
     * - 按年：yyyy 格式（如 2026）
     * 不传则默认为当前月/年
     */
    private String date;
}
