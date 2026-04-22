package com.bank.service.impl;

import com.bank.common.Constants;
import com.bank.dto.LoginRequest;
import com.bank.dto.RegisterRequest;
import com.bank.entity.User;
import com.bank.exception.BusinessException;
import com.bank.mapper.UserMapper;
import com.bank.service.AuthService;
import com.bank.util.AESUtil;
import com.bank.util.JwtUtil;
import com.bank.util.PasswordUtil;
import com.bank.vo.LoginVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void sendSms(String phone, String type) {
        if (type == null || type.isEmpty()) {
            type = "common";
        }
        String lockKey = Constants.REDIS_SMS_LOCK_KEY + phone + ":" + type;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            throw new BusinessException(1001, "SMS sent too frequently, please wait");
        }

        String code = String.format("%06d", new Random().nextInt(1000000));
        String smsKey = Constants.REDIS_SMS_KEY + phone + ":" + type;
        redisTemplate.opsForValue().set(smsKey, code, Constants.SMS_EXPIRE_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(lockKey, "1", Constants.SMS_RESEND_SECONDS, TimeUnit.SECONDS);

        log.info("SMS code for {} type {}: {}", phone, type, code);
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        String smsKey = Constants.REDIS_SMS_KEY + request.getPhone() + ":register";
        String failKey = Constants.REDIS_SMS_KEY + request.getPhone() + ":register_fail";
        Integer smsFailCount = (Integer) redisTemplate.opsForValue().get(failKey);
        if (smsFailCount != null && smsFailCount >= Constants.SMS_MAX_FAIL) {
            throw new BusinessException(2002, "Registration locked due to too many SMS failures, please try again in 30 minutes");
        }

        String storedCode = (String) redisTemplate.opsForValue().get(smsKey);
        if (storedCode == null) {
            throw new BusinessException(1002, "SMS code expired");
        }
        if (!storedCode.equals(request.getSmsCode())) {
            smsFailCount = smsFailCount == null ? 1 : smsFailCount + 1;
            redisTemplate.opsForValue().set(failKey, smsFailCount, Constants.SMS_LOCK_MINUTES, TimeUnit.MINUTES);
            throw new BusinessException(1003, "Invalid SMS code");
        }
        redisTemplate.delete(failKey);

        User existing = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone()));
        if (existing != null) {
            throw new BusinessException(400, "Phone number already registered");
        }

        if (!PasswordUtil.isValidLoginPassword(request.getPassword())) {
            throw new BusinessException(400, "Password does not meet requirements: 8-20 chars, at least 2 types of uppercase/lowercase/digit, no 3+ consecutive same chars");
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setPasswordHash(PasswordUtil.hash(request.getPassword()));
        user.setRealName(request.getRealName());
        user.setIdCardEncrypted(AESUtil.encrypt(request.getIdCard()));
        user.setStatus(Constants.USER_STATUS_NORMAL);
        user.setLoginFailCount(0);
        user.setTradeFailCount(0);
        user.setSingleLimit(java.math.BigDecimal.valueOf(Constants.DEFAULT_SINGLE_LIMIT));
        user.setDailyLimit(java.math.BigDecimal.valueOf(Constants.DEFAULT_DAILY_LIMIT));

        userMapper.insert(user);
        redisTemplate.delete(smsKey);
    }

    @Override
    public LoginVO loginByPassword(LoginRequest request) {
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new BusinessException(400, "Password is required");
        }

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone()));
        if (user == null) {
            throw new BusinessException(2001, "Invalid phone or password");
        }

        String failKey = Constants.REDIS_LOGIN_FAIL_KEY + request.getPhone();
        Integer failCount = (Integer) redisTemplate.opsForValue().get(failKey);
        if (failCount != null && failCount >= Constants.LOGIN_MAX_FAIL) {
            throw new BusinessException(2002, "Account is locked due to too many failed attempts, please try again in 30 minutes");
        }

        if (!PasswordUtil.verify(request.getPassword(), user.getPasswordHash())) {
            failCount = failCount == null ? 1 : failCount + 1;
            redisTemplate.opsForValue().set(failKey, failCount, Constants.LOGIN_LOCK_MINUTES, TimeUnit.MINUTES);
            throw new BusinessException(2001, "Invalid phone or password");
        }

        redisTemplate.delete(failKey);
        user.setLoginFailCount(0);
        userMapper.updateById(user);

        return createLoginVO(user);
    }

    @Override
    public LoginVO loginBySms(LoginRequest request) {
        if (request.getSmsCode() == null || request.getSmsCode().isEmpty()) {
            throw new BusinessException(400, "SMS code is required");
        }

        String smsKey = Constants.REDIS_SMS_KEY + request.getPhone() + ":login";
        String storedCode = (String) redisTemplate.opsForValue().get(smsKey);
        if (storedCode == null) {
            throw new BusinessException(1002, "SMS code expired");
        }
        if (!storedCode.equals(request.getSmsCode())) {
            throw new BusinessException(1003, "Invalid SMS code");
        }

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, request.getPhone()));
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        redisTemplate.delete(smsKey);
        return createLoginVO(user);
    }

    @Override
    public void logout(Long userId) {
        redisTemplate.delete(Constants.REDIS_TOKEN_KEY + userId);
    }

    private LoginVO createLoginVO(User user) {
        String token = jwtUtil.generateToken(user.getUserId(), user.getPhone());
        redisTemplate.opsForValue().set(Constants.REDIS_TOKEN_KEY + user.getUserId(), token,
                30, TimeUnit.MINUTES);

        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUserId(user.getUserId());
        vo.setPhone(user.getPhone());
        vo.setRealName(user.getRealName());
        return vo;
    }
}
