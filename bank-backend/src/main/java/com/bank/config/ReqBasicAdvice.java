package com.bank.config;

import com.bank.dto.ReqBasic;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdvice;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Type;

/**
 * 请求体基础字段自动填充
 * 当 DTO 继承 ReqBasic 时，自动从 JWT 拦截器属性和请求头注入 tenant / userId / userName
 */
@Slf4j
@ControllerAdvice
public class ReqBasicAdvice implements RequestBodyAdvice {

    @Override
    public boolean supports(MethodParameter methodParameter, Type targetType,
                            Class<? extends HttpMessageConverter<?>> converterType) {
        if (targetType instanceof Class) {
            return ReqBasic.class.isAssignableFrom((Class<?>) targetType);
        }
        return false;
    }

    @Override
    public HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter,
                                           Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return inputMessage;
    }

    @Override
    public Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter,
                                Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        if (body instanceof ReqBasic) {
            populateBaseFields((ReqBasic) body);
        }
        return body;
    }

    @Override
    public Object handleEmptyBody(Object body, HttpInputMessage inputMessage, MethodParameter parameter,
                                  Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return body;
    }

    private void populateBaseFields(ReqBasic req) {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return;
        }
        HttpServletRequest request = attrs.getRequest();

        // 从 JWT 拦截器设置的属性中获取 userId
        Long userId = (Long) request.getAttribute("userId");
        if (userId != null) {
            req.setUserId(userId);
        }

        // 从请求头获取 tenant
        String tenant = request.getHeader("tenant");
        if (tenant != null && !tenant.isEmpty()) {
            req.setTenant(tenant);
        }

        // 从请求头获取 userName
        String userName = request.getHeader("userName");
        if (userName != null && !userName.isEmpty()) {
            req.setUserName(userName);
        }
    }
}
