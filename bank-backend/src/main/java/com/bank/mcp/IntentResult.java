package com.bank.mcp;

import java.util.HashMap;
import java.util.Map;

/**
 * LLM 意图识别结果
 * 由 IntentLlmClient 调用大模型后返回
 */
public class IntentResult {

    private String intent;
    private Map<String, Object> params;

    public IntentResult() {
        this.params = new HashMap<>();
    }

    public IntentResult(String intent, Map<String, Object> params) {
        this.intent = intent;
        this.params = params != null ? params : new HashMap<>();
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public Map<String, Object> getParams() {
        return params;
    }

    public void setParams(Map<String, Object> params) {
        this.params = params;
    }
}
