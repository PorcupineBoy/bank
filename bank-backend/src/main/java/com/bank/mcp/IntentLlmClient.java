package com.bank.mcp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * LLM 意图识别客户端
 *
 * 调用大模型 API 进行语义级别的意图识别和参数提取，
 * 替代传统的关键词匹配方式，支持超时/异常时的自动降级。
 *
 * 设计原则：
 * - 调用方（AiChatServiceImpl）无需感知 LLM 细节
 * - 任何异常/超时均返回 UNKNOWN，由调用方做兜底
 * - 日志粒度与项目现有规范一致（@Slf4j + log.info/log.error）
 */
@Slf4j
@Component
public class IntentLlmClient {

    /**
     * 系统提示词：定义意图分类体系和输出格式
     * LLM 须返回 JSON，以便解析为 IntentResult
     */
    private static final String SYSTEM_PROMPT =
            "你是一个银行智能助手的意图识别引擎。请分析用户输入，返回 JSON 格式的意图识别结果。\n\n"
            + "可能的意图列表：\n"
            + "1. GREETING - 问候、打招呼（如：你好、嗨）\n"
            + "2. HELP - 寻求帮助、功能说明（如：能做什么、帮助）\n"
            + "3. QUERY_BALANCE - 查询账户余额（如：查余额、还有多少钱），可提取参数 bank_name（银行名称）\n"
            + "4. QUERY_TRANSACTIONS - 查询交易记录（如：最近交易、账单、花了多少），可提取参数 trans_type（income/bill/transfer）\n"
            + "5. CONSUMPTION_ANALYSIS - 消费分析（如：消费分析、月度报告、花了什么），可提取参数 year（年份数字）\n"
            + "6. QUERY_CARDS - 查看银行卡（如：我的卡、绑定的卡）\n"
            + "7. TRANSFER - 转账汇款（如：转账给张三100元），可提取参数 payee_name（收款人姓名,中文）、amount（金额,数字）\n\n"
            + "返回 JSON 格式（只返回 JSON，不要包含其他文字）：\n"
            + "{\"intent\": \"INTENT_NAME\", \"params\": {\"param1\": \"value1\"}}\n\n"
            + "如果无法识别意图，返回 {\"intent\": \"UNKNOWN\", \"params\": {}}";
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${bank.llm.api-url:}")
    private String apiUrl;
    @Value("${bank.llm.api-key:}")
    private String apiKey;
    @Value("${bank.llm.model:gpt-3.5-turbo}")
    private String model;
    @Autowired
    private RestTemplate restTemplate;

    /**
     * 调用大模型识别用户意图
     *
     * @param userMessage 用户输入的自然语言
     * @return IntentResult，包含意图和参数。
     *         任何异常/超时/未配置/返回为空均返回 intent=UNKNOWN（不含 null）
     */
    public IntentResult recognizeIntent(String userMessage) {
        if (apiUrl == null || apiUrl.isEmpty()) {
            log.info("[LLM] 意图识别跳过：API URL 未配置");
            return new IntentResult("UNKNOWN", null);
        }

        long startTime = System.currentTimeMillis();
        try {
            // 构建请求
            HttpEntity<String> entity = buildRequestEntity(userMessage);
            String url = apiUrl + "/chat/completions";

            log.debug("[LLM] 请求: model={}, userMessage=\"{}\"", model, userMessage);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            long cost = System.currentTimeMillis() - startTime;
            log.info("[LLM] 响应耗时: {}ms, status: {}", cost, response.getStatusCodeValue());

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.warn("[LLM] 响应状态异常: {}", response.getStatusCodeValue());
                return new IntentResult("UNKNOWN", null);
            }

            return parseResponse(response.getBody(), userMessage, cost);

        } catch (ResourceAccessException e) {
            // 连接超时 / 读取超时
            log.error("[LLM] 请求超时 ({}ms): {}", System.currentTimeMillis() - startTime, e.getMessage());
            return new IntentResult("UNKNOWN", null);
        } catch (JsonProcessingException e) {
            log.error("[LLM] 请求序列化失败: {}", e.getMessage());
            return new IntentResult("UNKNOWN", null);
        } catch (Exception e) {
            log.error("[LLM] 调用异常: {}", e.getMessage(), e);
            return new IntentResult("UNKNOWN", null);
        }
    }

    /**
     * 构建 LLM API 请求体（OpenAI 兼容格式）
     */
    private HttpEntity<String> buildRequestEntity(String userMessage) throws JsonProcessingException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(createMessage("system", SYSTEM_PROMPT));
        messages.add(createMessage("user", userMessage));
        body.put("messages", messages);

        body.put("temperature", 0.1);
        body.put("max_tokens", 256);

        // response_format（部分模型支持）
        Map<String, String> responseFormat = new HashMap<>();
        responseFormat.put("type", "json_object");
        body.put("response_format", responseFormat);

        String jsonBody = objectMapper.writeValueAsString(body);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.setBearerAuth(apiKey);
        }

        return new HttpEntity<>(jsonBody, headers);
    }

    private Map<String, String> createMessage(String role, String content) {
        Map<String, String> msg = new LinkedHashMap<>();
        msg.put("role", role);
        msg.put("content", content);
        return msg;
    }

    /**
     * 解析 LLM 返回的 JSON 响应
     */
    private IntentResult parseResponse(String responseBody, String originalMessage, long costMs) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.get("choices");
            if (choices == null || !choices.isArray() || choices.size() == 0) {
                log.warn("[LLM] 响应中无 choices 字段 ({}ms)", costMs);
                return new IntentResult("UNKNOWN", null);
            }

            String content = choices.get(0).path("message").path("content").asText("");
            if (content == null || content.isEmpty()) {
                log.warn("[LLM] response content 为空 ({}ms)", costMs);
                return new IntentResult("UNKNOWN", null);
            }

            // 提取 JSON（兼容 markdown 代码块）
            String jsonStr = extractJsonString(content);
            if (jsonStr == null) {
                log.warn("[LLM] 无法从响应中提取 JSON: content=\"{}\" ({}ms)", content, costMs);
                return new IntentResult("UNKNOWN", null);
            }

            JsonNode result = objectMapper.readTree(jsonStr);
            String intent = result.path("intent").asText("UNKNOWN");

            Map<String, Object> params = new HashMap<>();
            JsonNode paramsNode = result.get("params");
            if (paramsNode != null && paramsNode.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = paramsNode.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> field = fields.next();
                    JsonNode value = field.getValue();
                    if (value.isNumber()) {
                        params.put(field.getKey(), value.asDouble());
                    } else {
                        params.put(field.getKey(), value.asText());
                    }
                }
            }

            log.info("[LLM] 识别结果: intent={}, params={}, cost={}ms", intent, params, costMs);
            return new IntentResult(intent, params);

        } catch (Exception e) {
            log.error("[LLM] 响应解析异常: {} ({}ms)", e.getMessage(), costMs);
            return new IntentResult("UNKNOWN", null);
        }
    }

    /**
     * 从 LLM 返回文本中提取 JSON 字符串
     * 处理以下格式：
     * - 纯 JSON：{"intent": "..."}
     * - Markdown 代码块：```json\n{"intent": "..."}\n```
     * - 带前后缀文本：...{"intent": "..."}...
     */
    private String extractJsonString(String text) {
        if (text == null) return null;
        text = text.trim();

        // 尝试纯 JSON
        if (text.startsWith("{")) {
            return text;
        }

        // 尝试 Markdown 代码块
        int start = text.indexOf("```json");
        if (start >= 0) {
            start += 7;
            int end = text.indexOf("```", start);
            if (end > start) {
                return text.substring(start, end).trim();
            }
        }

        // 尝试找第一个 { 和最后一个 }
        start = text.indexOf("{");
        int end = text.lastIndexOf("}");
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }

        return null;
    }
}
