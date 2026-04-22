package com.bank.service.impl;

import com.bank.common.Constants;
import com.bank.dto.CardBindRequest;
import com.bank.entity.BankCard;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.exception.BusinessException;
import com.bank.mapper.BankCardMapper;
import com.bank.mapper.TransactionMapper;
import com.bank.mapper.UserMapper;
import com.bank.service.BankCardService;
import com.bank.util.AESUtil;
import com.bank.util.LuhnUtil;
import com.bank.util.PasswordUtil;
import com.bank.vo.BalanceVO;
import com.bank.vo.BankCardVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BankCardServiceImpl implements BankCardService {
    @Autowired
    private BankCardMapper bankCardMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private TransactionMapper transactionMapper;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional
    public void bindCard(Long userId, CardBindRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        if (!user.getRealName().equals(request.getCardHolderName())) {
            throw new BusinessException(3003, "Cardholder name does not match registered name");
        }

        // 四要素验证：身份证号校验
        String storedIdCard = AESUtil.decrypt(user.getIdCardEncrypted());
        if (!storedIdCard.equals(request.getIdCard())) {
            throw new BusinessException(3003, "ID card does not match registered ID card");
        }

        if (!LuhnUtil.validate(request.getCardNo())) {
            throw new BusinessException(3002, "Invalid card number");
        }

        long cardCount = bankCardMapper.selectCount(new LambdaQueryWrapper<BankCard>()
                .eq(BankCard::getUserId, userId)
                .eq(BankCard::getStatus, Constants.CARD_STATUS_NORMAL));
        if (cardCount >= 10) {
            throw new BusinessException(3001, "Maximum 10 cards allowed");
        }

        BankCard existing = bankCardMapper.selectOne(new LambdaQueryWrapper<BankCard>()
                .eq(BankCard::getCardNoEncrypted, AESUtil.encrypt(request.getCardNo()))
                .eq(BankCard::getUserId, userId));
        if (existing != null) {
            throw new BusinessException(3004, "Card already bound");
        }

        String smsKey = Constants.REDIS_SMS_KEY + request.getReservedPhone() + ":bind";
        String storedCode = (String) redisTemplate.opsForValue().get(smsKey);
        if (storedCode == null) {
            throw new BusinessException(1002, "SMS code expired");
        }
        if (!storedCode.equals(request.getSmsCode())) {
            throw new BusinessException(1003, "Invalid SMS code");
        }

        String masked = maskCardNo(request.getCardNo());
        BankCard card = new BankCard();
        card.setUserId(userId);
        card.setCardNoEncrypted(AESUtil.encrypt(request.getCardNo()));
        card.setCardNoMasked(masked);
        card.setBankName(request.getBankName());
        card.setCardType(request.getCardType());
        card.setIsDefault(cardCount == 0 ? 1 : 0);
        card.setStatus(Constants.CARD_STATUS_NORMAL);
        card.setBalance(BigDecimal.valueOf(new Random().nextInt(100000) + 1000));
        card.setBindTime(LocalDateTime.now());

        bankCardMapper.insert(card);
        redisTemplate.delete(smsKey);
    }

    @Override
    @Transactional
    public void unbindCard(Long userId, Long cardId, String tradePassword) {
        if (tradePassword == null || tradePassword.isEmpty()) {
            throw new BusinessException(400, "Trade password is required");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }
        if (user.getTradePasswordHash() == null) {
            throw new BusinessException(400, "Trade password not set");
        }

        String failKey = Constants.REDIS_TRADE_FAIL_KEY + userId;
        Integer failCount = (Integer) redisTemplate.opsForValue().get(failKey);
        if (failCount != null && failCount >= Constants.TRADE_MAX_FAIL) {
            throw new BusinessException(2004, "Trade password frozen due to too many failed attempts");
        }

        if (!PasswordUtil.verify(tradePassword, user.getTradePasswordHash())) {
            failCount = failCount == null ? 1 : failCount + 1;
            redisTemplate.opsForValue().set(failKey, failCount, Constants.TRADE_LOCK_HOURS, java.util.concurrent.TimeUnit.HOURS);
            if (failCount >= Constants.TRADE_MAX_FAIL) {
                user.setTradeFailCount(failCount);
                userMapper.updateById(user);
            }
            throw new BusinessException(2003, "Invalid trade password");
        }

        BankCard card = bankCardMapper.selectById(cardId);
        if (card == null || !card.getUserId().equals(userId)) {
            throw new BusinessException(404, "Card not found");
        }

        long processingCount = transactionMapper.selectCount(new LambdaQueryWrapper<Transaction>()
                .eq(Transaction::getCardId, cardId)
                .eq(Transaction::getStatus, Constants.TRANS_STATUS_PROCESSING));
        if (processingCount > 0) {
            throw new BusinessException(400, "Cannot unbind card with pending transactions");
        }

        card.setStatus(Constants.CARD_STATUS_UNBOUND);
        bankCardMapper.updateById(card);
    }

    @Override
    public List<BankCardVO> listCards(Long userId) {
        List<BankCard> cards = bankCardMapper.selectActiveByUserId(userId);
        return cards.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public BankCardVO getCardDetail(Long userId, Long cardId) {
        BankCard card = bankCardMapper.selectById(cardId);
        if (card == null || !card.getUserId().equals(userId)) {
            throw new BusinessException(404, "Card not found");
        }
        return convertToVO(card);
    }

    @Override
    @Transactional
    public void setDefaultCard(Long userId, Long cardId) {
        BankCard card = bankCardMapper.selectById(cardId);
        if (card == null || !card.getUserId().equals(userId)) {
            throw new BusinessException(404, "Card not found");
        }
        if (card.getStatus() != Constants.CARD_STATUS_NORMAL) {
            throw new BusinessException(400, "Cannot set unbound card as default");
        }

        List<BankCard> cards = bankCardMapper.selectActiveByUserId(userId);
        for (BankCard c : cards) {
            if (c.getIsDefault() == 1) {
                c.setIsDefault(0);
                bankCardMapper.updateById(c);
            }
        }

        card.setIsDefault(1);
        bankCardMapper.updateById(card);
    }

    @Override
    public BalanceVO queryBalance(Long userId, Long cardId) {
        BankCard card = bankCardMapper.selectById(cardId);
        if (card == null || !card.getUserId().equals(userId)) {
            throw new BusinessException(404, "Card not found");
        }
        BalanceVO vo = new BalanceVO();
        vo.setCardId(card.getCardId());
        vo.setCardNoMasked(card.getCardNoMasked());
        vo.setBankName(card.getBankName());
        vo.setBalance(card.getBalance());
        return vo;
    }

    private BankCardVO convertToVO(BankCard card) {
        BankCardVO vo = new BankCardVO();
        BeanUtils.copyProperties(card, vo);
        return vo;
    }

    private String maskCardNo(String cardNo) {
        if (cardNo.length() <= 8) {
            return "****" + cardNo.substring(cardNo.length() - 4);
        }
        return "**** **** **** " + cardNo.substring(cardNo.length() - 4);
    }
}
