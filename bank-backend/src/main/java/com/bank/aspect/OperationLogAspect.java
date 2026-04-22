package com.bank.aspect;

import com.bank.entity.OperationLog;
import com.bank.mapper.OperationLogMapper;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {
    @Autowired
    private OperationLogMapper operationLogMapper;

    @Async
    @AfterReturning(pointcut = "execution(* com.bank.controller..*.*(..))", returning = "result")
    public void logOperation(JoinPoint joinPoint, Object result) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return;

            HttpServletRequest request = attributes.getRequest();
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) return;

            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            OperationLog operationLog = new OperationLog();
            operationLog.setUserId(userId);
            operationLog.setOperationType(className + "." + methodName);
            operationLog.setOperationDetail("Request: " + request.getRequestURI());
            operationLog.setOperationResult(0);
            operationLog.setIpAddress(getClientIp(request));
            operationLog.setDeviceInfo(request.getHeader("User-Agent"));
            operationLog.setCreatedAt(LocalDateTime.now());

            operationLogMapper.insert(operationLog);
        } catch (Exception e) {
            log.error("Failed to record operation log", e);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }
}
