package com.bank.interceptor;

import com.bank.common.Constants;
import com.bank.common.Result;
import com.bank.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader(Constants.TOKEN_HEADER);
        if (token == null || !token.startsWith(Constants.TOKEN_PREFIX)) {
            writeError(response, 401, "Unauthorized");
            return false;
        }
        token = token.substring(Constants.TOKEN_PREFIX.length());

        if (!jwtUtil.validateToken(token)) {
            writeError(response, 401, "Token expired or invalid");
            return false;
        }

        Long userId = jwtUtil.getUserId(token);
        String redisToken = (String) redisTemplate.opsForValue().get(Constants.REDIS_TOKEN_KEY + userId);
        if (redisToken == null || !redisToken.equals(token)) {
            writeError(response, 401, "Login expired, please login again");
            return false;
        }

        request.setAttribute("userId", userId);
        return true;
    }

    private void writeError(HttpServletResponse response, int code, String message) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(200);
        response.getWriter().write(objectMapper.writeValueAsString(Result.error(code, message)));
    }
}
