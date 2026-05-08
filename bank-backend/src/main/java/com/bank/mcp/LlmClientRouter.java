package com.bank.mcp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * LLM 客户端路由器
 *
 * 统一的 LLM 意图识别入口，根据 bank.llm.provider 配置选择当前激活的大模型提供商。
 * 当前支持：
 * - openai / deepseek：由 IntentLlmClient 处理（OpenAI 兼容协议）
 * - xiaomi：由 XiaomiLlmClient 处理（小米 MiMo）
 *
 * 跨提供商降级策略：
 *   首选提供商识别失败 → 自动尝试下一个可用提供商 → 全部失败返回 UNKNOWN
 *
 * 使用示例（application.yml）：
 *   bank:
 *     llm:
 *       provider: xiaomi        # 当前激活的提供商
 *       api-url: ...             # OpenAI/DeepSeek 配置
 *       xiaomi:
 *         api-url: ...           # 小米 MiMo 配置
 */
@Slf4j
@Component
public class LlmClientRouter {

    @Value("${bank.llm.provider:openai}")
    private String provider;

    @Autowired
    private IntentLlmClient intentLlmClient;

    @Autowired(required = false)
    private XiaomiLlmClient xiaomiLlmClient;

    /**
     * 调用当前激活的大模型识别用户意图
     * 首选提供商失败时自动降级到其他提供商
     *
     * @param userMessage 用户输入的自然语言
     * @return IntentResult，全部失败返回 intent=UNKNOWN
     */
    public IntentResult recognizeIntent(String userMessage) {
        // 第一优先：小米 MiMo
        if ("xiaomi".equalsIgnoreCase(provider)) {
            if (xiaomiLlmClient == null) {
                log.warn("[Router] 已选择 xiaomi 但 XiaomiLlmClient 不可用");
            } else {
                try {
                    IntentResult result = xiaomiLlmClient.recognizeIntent(userMessage);
                    if (result != null && !"UNKNOWN".equals(result.getIntent())) {
                        log.info("[Router] 小米 MiMo 识别成功: intent={}", result.getIntent());
                        return result;
                    }
                    log.warn("[Router] 小米 MiMo 返回 UNKNOWN，降级到 OpenAI/DeepSeek");
                } catch (Exception e) {
                    log.warn("[Router] 小米 MiMo 异常，降级到 OpenAI/DeepSeek: {}", e.getMessage());
                }
            }
        }

        // 第二优先：OpenAI / DeepSeek（兜底）
        log.debug("[Router] 使用 OpenAI/DeepSeek 识别 intent={}", provider);
        return intentLlmClient.recognizeIntent(userMessage);
    }

    /**
     * 获取当前配置的提供商名称
     */
    public String getActiveProvider() {
        return provider;
    }
}
