package com.bank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate 配置
 * 用于 LLM API 调用等 HTTP 请求
 *
 * 使用 SimpleClientHttpRequestFactory 设置超时，
 * 兼容 Spring Boot 2.x 全版本，无需依赖 RestTemplateBuilder 的 Duration 方法。
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);   // 连接超时 5 秒
        factory.setReadTimeout(30000);     // 读取超时 30 秒
        return new RestTemplate(factory);
    }
}
