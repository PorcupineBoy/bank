package com.bank.service.impl;

import com.bank.common.Constants;
import com.bank.dto.LimitUpdateRequest;
import com.bank.dto.TradePasswordRequest;
import com.bank.entity.User;
import com.bank.exception.BusinessException;
import com.bank.mapper.UserMapper;
import com.bank.service.SecurityService;
import com.bank.util.PasswordUtil;
import com.bank.vo.SecurityLimitVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SecurityServiceImpl implements SecurityService {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional
    public void setTradePassword(Long userId, TradePasswordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        if (user.getTradePasswordHash() != null) {
            throw new BusinessException(400, "Trade password already set");
        }
        validateTradePassword(request.getTradePassword(), user.getPasswordHash());

        user.setTradePasswordHash(PasswordUtil.hash(request.getTradePassword()));
        user.setTradeFailCount(0);
        userMapper.updateById(user);
    }

    @Override
    @Transactional
    public void modifyTradePassword(Long userId, TradePasswordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        if (user.getTradePasswordHash() == null) {
            throw new BusinessException(400, "Trade password not set");
        }

        if (request.getOldTradePassword() == null || request.getOldTradePassword().isEmpty()) {
            throw new BusinessException(400, "Old trade password is required");
        }

        if (!PasswordUtil.verify(request.getOldTradePassword(), user.getTradePasswordHash())) {
            throw new BusinessException(2003, "Invalid old trade password");
        }

        validateTradePassword(request.getTradePassword(), user.getPasswordHash());

        user.setTradePasswordHash(PasswordUtil.hash(request.getTradePassword()));
        user.setTradeFailCount(0);
        userMapper.updateById(user);
    }

    @Override
    public SecurityLimitVO getLimits(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        SecurityLimitVO vo = new SecurityLimitVO();
        vo.setSingleLimit(user.getSingleLimit());
        vo.setDailyLimit(user.getDailyLimit());
        vo.setSingleLimitMin(new BigDecimal("100"));
        vo.setSingleLimitMax(new BigDecimal("500000"));
        vo.setDailyLimitMin(new BigDecimal("1000"));
        vo.setDailyLimitMax(new BigDecimal("1000000"));
        return vo;
    }

    @Override
    @Transactional
    public void updateLimits(Long userId, LimitUpdateRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        String smsKey = Constants.REDIS_SMS_KEY + user.getPhone() + ":limit";
        String storedCode = (String) redisTemplate.opsForValue().get(smsKey);
        if (storedCode == null || !storedCode.equals(request.getSmsCode())) {
            throw new BusinessException(1003, "Invalid SMS code");
        }

        if (user.getTradePasswordHash() == null) {
            throw new BusinessException(400, "Trade password not set");
        }
        if (!PasswordUtil.verify(request.getTradePassword(), user.getTradePasswordHash())) {
            throw new BusinessException(2003, "Invalid trade password");
        }

        if (request.getSingleLimit().compareTo(new BigDecimal("100")) < 0 ||
            request.getSingleLimit().compareTo(new BigDecimal("500000")) > 0) {
            throw new BusinessException(400, "Single limit out of range");
        }
        if (request.getDailyLimit().compareTo(new BigDecimal("1000")) < 0 ||
            request.getDailyLimit().compareTo(new BigDecimal("1000000")) > 0) {
            throw new BusinessException(400, "Daily limit out of range");
        }
        if (request.getDailyLimit().compareTo(request.getSingleLimit()) < 0) {
            throw new BusinessException(400, "Daily limit must be >= single limit");
        }

        user.setSingleLimit(request.getSingleLimit());
        user.setDailyLimit(request.getDailyLimit());
        userMapper.updateById(user);
        redisTemplate.delete(smsKey);
    }

    private void validateTradePassword(String tradePassword, String loginPasswordHash) {
        if (!PasswordUtil.isValidTradePassword(tradePassword)) {
            throw new BusinessException(400, "Trade password must be 6 digits and not simple sequence");
        }
        if (PasswordUtil.verify(tradePassword, loginPasswordHash)) {
            throw new BusinessException(400, "Trade password cannot be same as login password");
        }
    }
}
