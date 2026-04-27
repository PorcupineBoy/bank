package com.bank.service.impl;

import com.bank.common.Constants;
import com.bank.dto.*;
import com.bank.entity.BankCard;
import com.bank.entity.FrequentPaymentAccount;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.exception.BusinessException;
import com.bank.mapper.BankCardMapper;
import com.bank.mapper.FrequentPaymentAccountMapper;
import com.bank.mapper.TransactionMapper;
import com.bank.mapper.UserMapper;
import com.bank.service.TransactionCategorizationService;
import com.bank.service.TransactionService;
import com.bank.util.LuhnUtil;
import com.bank.util.PasswordUtil;
import com.bank.vo.PaymentBillVO;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {
    @Autowired
    private TransactionMapper transactionMapper;
    @Autowired
    private BankCardMapper bankCardMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private TransactionCategorizationService categorizationService;
    @Autowired
    private FrequentPaymentAccountMapper frequentPaymentAccountMapper;

    @Override
    public IPage<TransactionVO> queryTransactions(Long userId, TransactionQueryRequest request) {
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;

        if ("custom".equals(request.getTimeRange()) && request.getStartDate() != null && request.getEndDate() != null) {
            startTime = LocalDate.parse(request.getStartDate()).atStartOfDay();
            endTime = LocalDate.parse(request.getEndDate()).atTime(LocalTime.MAX);
            long days = ChronoUnit.DAYS.between(startTime.toLocalDate(), endTime.toLocalDate());
            if (days > 365) {
                throw new BusinessException(400, "Custom date range cannot exceed 12 months");
            }
        } else if ("7d".equals(request.getTimeRange())) {
            startTime = LocalDateTime.now().minusDays(7);
        } else if ("3m".equals(request.getTimeRange())) {
            startTime = LocalDateTime.now().minusMonths(3);
        } else {
            startTime = LocalDateTime.now().minusMonths(1);
        }

        if (endTime == null) {
            endTime = LocalDateTime.now();
        }

        Page<Transaction> page = new Page<>(request.getPage(), request.getSize());
        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<Transaction>()
                .eq(Transaction::getUserId, userId)
                .eq(request.getTransType() != null, Transaction::getTransType, request.getTransType())
                .ge(Transaction::getCreatedAt, startTime)
                .le(Transaction::getCreatedAt, endTime)
                .orderByDesc(Transaction::getCreatedAt);

        IPage<Transaction> resultPage = transactionMapper.selectPage(page, wrapper);

        Page<TransactionVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        voPage.setRecords(resultPage.getRecords().stream().map(this::convertToVO).collect(Collectors.toList()));
        return voPage;
    }

    @Override
    public TransactionVO getTransactionDetail(Long userId, Long transId) {
        Transaction trans = transactionMapper.selectById(transId);
        if (trans == null || !trans.getUserId().equals(userId)) {
            throw new BusinessException(404, "Transaction not found");
        }
        return convertToVO(trans);
    }

    @Override
    @Transactional
    public TransactionVO transfer(Long userId, TransferRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        // Trade password check
        if (user.getTradePasswordHash() == null) {
            throw new BusinessException(400, "Trade password not set");
        }

        String failKey = Constants.REDIS_TRADE_FAIL_KEY + userId;
        Integer failCount = (Integer) redisTemplate.opsForValue().get(failKey);
        if (failCount != null && failCount >= Constants.TRADE_MAX_FAIL) {
            throw new BusinessException(2004, "Trade password frozen due to too many failed attempts");
        }

        if (!PasswordUtil.verify(request.getTradePassword(), user.getTradePasswordHash())) {
            failCount = failCount == null ? 1 : failCount + 1;
            redisTemplate.opsForValue().set(failKey, failCount, Constants.TRADE_LOCK_HOURS, TimeUnit.HOURS);
            if (failCount >= Constants.TRADE_MAX_FAIL) {
                user.setTradeFailCount(failCount);
                userMapper.updateById(user);
            }
            throw new BusinessException(2003, "Invalid trade password");
        }

        // Card check
        BankCard card = bankCardMapper.selectById(request.getCardId());
        if (card == null || !card.getUserId().equals(userId)) {
            throw new BusinessException(404, "Card not found");
        }
        if (card.getStatus() != Constants.CARD_STATUS_NORMAL) {
            throw new BusinessException(400, "Card is not active");
        }

        // Luhn check on payee card
        if (!LuhnUtil.validate(request.getPayeeCardNo())) {
            throw new BusinessException(3002, "Invalid payee card number");
        }

        // Amount check
        if (request.getAmount().compareTo(new BigDecimal("0.01")) < 0) {
            throw new BusinessException(400, "Minimum transfer amount is 0.01");
        }
        if (request.getAmount().scale() > 2) {
            throw new BusinessException(400, "Amount precision too high");
        }

        // Single limit check
        if (request.getAmount().compareTo(user.getSingleLimit()) > 0) {
            throw new BusinessException(4002, "Exceeds single transfer limit: " + user.getSingleLimit());
        }

        // Daily limit check
        String dailyKey = Constants.REDIS_DAILY_TRANSFER_KEY + userId + ":" + LocalDate.now();
        String dailyUsedStr = (String) redisTemplate.opsForValue().get(dailyKey);
        BigDecimal dailyUsed = dailyUsedStr == null ? BigDecimal.ZERO : new BigDecimal(dailyUsedStr);
        if (dailyUsed.add(request.getAmount()).compareTo(user.getDailyLimit()) > 0) {
            BigDecimal remaining = user.getDailyLimit().subtract(dailyUsed);
            throw new BusinessException(4003, "Exceeds daily limit, remaining: " + remaining);
        }

        // Balance check
        if (card.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(4001, "Insufficient balance");
        }

        // Anti-replay lock (atomic SETNX)
        String lockKey = Constants.REDIS_TRANSFER_LOCK_KEY + userId + ":" + request.getPayeeCardNo();
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", Constants.TRANSFER_INTERVAL_SECONDS, TimeUnit.SECONDS);
        if (Boolean.FALSE.equals(locked)) {
            throw new BusinessException(4004, "Please wait 30 seconds before transferring to the same recipient again");
        }

        // Execute transfer
        card.setBalance(card.getBalance().subtract(request.getAmount()));
        bankCardMapper.updateById(card);

        Transaction transaction = new Transaction();
        transaction.setTransNo(generateTransNo());
        transaction.setUserId(userId);
        transaction.setCardId(card.getCardId());
        transaction.setTransType(Constants.TRANS_TYPE_TRANSFER);
        transaction.setAmount(request.getAmount());
        transaction.setPayeeName(request.getPayeeName());
        transaction.setPayeeCardNoMasked(maskCardNo(request.getPayeeCardNo()));
        transaction.setPayeeBankName(request.getPayeeBankName());
        transaction.setRemark(request.getRemark());
        transaction.setCategory(categorizationService.categorizeTransaction(request.getPayeeName(), request.getRemark(), Constants.TRANS_TYPE_TRANSFER));
        transaction.setStatus(Constants.TRANS_STATUS_SUCCESS);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now());

        transactionMapper.insert(transaction);

        // Update daily used
        redisTemplate.opsForValue().set(dailyKey, dailyUsed.add(request.getAmount()).toPlainString(), 1, TimeUnit.DAYS);

        // Clear trade password fail count on success
        redisTemplate.delete(failKey);

        return convertToVO(transaction);
    }

    private TransactionVO convertToVO(Transaction trans) {
        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(trans, vo);
        return vo;
    }

    private String generateTransNo() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String maskCardNo(String cardNo) {
        if (cardNo.length() <= 8) {
            return "****" + cardNo.substring(cardNo.length() - 4);
        }
        return "**** **** **** " + cardNo.substring(cardNo.length() - 4);
    }

    @Override
    public PaymentBillVO queryPaymentBill(Long userId, PaymentQueryRequest request) {
        int type = request.getPaymentType();
        String accountNo = request.getAccountNo().trim();
        BigDecimal amount;
        String accountName;

        if (type == Constants.PAYMENT_TYPE_PHONE) {
            int[] phoneAmounts = {30, 50, 100, 200};
            int idx = Math.abs(accountNo.hashCode()) % phoneAmounts.length;
            amount = new BigDecimal(phoneAmounts[idx]).setScale(2, RoundingMode.HALF_UP);
            accountName = accountNo;
        } else {
            int base = 50 + Math.abs(accountNo.hashCode()) % 451;
            amount = new BigDecimal(base).setScale(2, RoundingMode.HALF_UP);
            accountName = accountNo + " 户主";
        }

        String period = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月"));
        String typeName = getPaymentTypeName(type);

        PaymentBillVO vo = new PaymentBillVO();
        vo.setPaymentType(type);
        vo.setPaymentTypeName(typeName);
        vo.setAccountNo(accountNo);
        vo.setAccountName(accountName);
        vo.setAmount(amount);
        vo.setPeriod(period);
        return vo;
    }

    @Override
    @Transactional
    public TransactionVO payBill(Long userId, PaymentRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "User not found");
        }

        // Trade password check
        if (user.getTradePasswordHash() == null) {
            throw new BusinessException(400, "Trade password not set");
        }

        String failKey = Constants.REDIS_TRADE_FAIL_KEY + userId;
        Integer failCount = (Integer) redisTemplate.opsForValue().get(failKey);
        if (failCount != null && failCount >= Constants.TRADE_MAX_FAIL) {
            throw new BusinessException(2004, "Trade password frozen due to too many failed attempts");
        }

        if (!PasswordUtil.verify(request.getTradePassword(), user.getTradePasswordHash())) {
            failCount = failCount == null ? 1 : failCount + 1;
            redisTemplate.opsForValue().set(failKey, failCount, Constants.TRADE_LOCK_HOURS, TimeUnit.HOURS);
            if (failCount >= Constants.TRADE_MAX_FAIL) {
                user.setTradeFailCount(failCount);
                userMapper.updateById(user);
            }
            throw new BusinessException(2003, "Invalid trade password");
        }

        // Card check
        BankCard card = bankCardMapper.selectById(request.getCardId());
        if (card == null || !card.getUserId().equals(userId)) {
            throw new BusinessException(404, "Card not found");
        }
        if (card.getStatus() != Constants.CARD_STATUS_NORMAL) {
            throw new BusinessException(400, "Card is not active");
        }

        // Amount check
        if (request.getAmount().compareTo(new BigDecimal("0.01")) < 0) {
            throw new BusinessException(400, "Minimum payment amount is 0.01");
        }
        if (request.getAmount().scale() > 2) {
            throw new BusinessException(400, "Amount precision too high");
        }

        // Single payment limit check
        if (request.getAmount().compareTo(Constants.PAYMENT_SINGLE_LIMIT) > 0) {
            throw new BusinessException(4002, "Exceeds single payment limit: " + Constants.PAYMENT_SINGLE_LIMIT);
        }

        // Daily payment limit check (independent from transfer)
        String dailyKey = Constants.REDIS_DAILY_PAYMENT_KEY + userId + ":" + LocalDate.now();
        String dailyUsedStr = (String) redisTemplate.opsForValue().get(dailyKey);
        BigDecimal dailyUsed = dailyUsedStr == null ? BigDecimal.ZERO : new BigDecimal(dailyUsedStr);
        if (dailyUsed.add(request.getAmount()).compareTo(Constants.PAYMENT_DAILY_LIMIT) > 0) {
            BigDecimal remaining = Constants.PAYMENT_DAILY_LIMIT.subtract(dailyUsed);
            throw new BusinessException(4003, "Exceeds daily payment limit, remaining: " + remaining);
        }

        // Balance check
        if (card.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(4001, "Insufficient balance");
        }

        // Anti-replay lock for payment (atomic SETNX)
        String paymentLockKey = Constants.REDIS_TRANSFER_LOCK_KEY + "payment:" + userId + ":" + request.getAccountNo();
        Boolean paymentLocked = redisTemplate.opsForValue().setIfAbsent(paymentLockKey, "1", Constants.TRANSFER_INTERVAL_SECONDS, TimeUnit.SECONDS);
        if (Boolean.FALSE.equals(paymentLocked)) {
            throw new BusinessException(4004, "Please wait 30 seconds before making the same payment again");
        }

        // Execute payment
        card.setBalance(card.getBalance().subtract(request.getAmount()));
        bankCardMapper.updateById(card);

        String typeName = getPaymentTypeName(request.getPaymentType());
        Transaction transaction = new Transaction();
        transaction.setTransNo(generateTransNo());
        transaction.setUserId(userId);
        transaction.setCardId(card.getCardId());
        transaction.setTransType(Constants.TRANS_TYPE_BILL);
        transaction.setAmount(request.getAmount());
        transaction.setPayeeName(request.getAccountName());
        transaction.setPayeeCardNoMasked(maskPaymentAccountNo(request.getAccountNo()));
        transaction.setPayeeBankName(typeName);
        transaction.setRemark(request.getAccountNo());
        transaction.setCategory(categorizationService.categorizeTransaction(request.getAccountName(), request.getAccountNo(), Constants.TRANS_TYPE_BILL));
        transaction.setStatus(Constants.TRANS_STATUS_SUCCESS);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now());

        transactionMapper.insert(transaction);

        // Update daily used
        redisTemplate.opsForValue().set(dailyKey, dailyUsed.add(request.getAmount()).toPlainString(), 1, TimeUnit.DAYS);

        // Clear trade password fail count on success
        redisTemplate.delete(failKey);

        // Save frequent payment account if requested
        if (Boolean.TRUE.equals(request.getSaveAccount())) {
            saveFrequentPaymentAccount(userId, request.getPaymentType(), request.getAccountNo(), request.getAccountName());
        }

        return convertToVO(transaction);
    }

    @Override
    public List<FrequentPaymentAccount> listFrequentPaymentAccounts(Long userId, Integer paymentType) {
        LambdaQueryWrapper<FrequentPaymentAccount> wrapper = new LambdaQueryWrapper<FrequentPaymentAccount>()
                .eq(FrequentPaymentAccount::getUserId, userId);
        if (paymentType != null) {
            wrapper.eq(FrequentPaymentAccount::getPaymentType, paymentType);
        }
        wrapper.orderByDesc(FrequentPaymentAccount::getCreatedAt);
        wrapper.last("LIMIT " + Constants.MAX_FREQUENT_PAYMENT_ACCOUNTS);
        return frequentPaymentAccountMapper.selectList(wrapper);
    }

    @Override
    public void saveFrequentPaymentAccount(Long userId, Integer paymentType, String accountNo, String accountName) {
        LambdaQueryWrapper<FrequentPaymentAccount> wrapper = new LambdaQueryWrapper<FrequentPaymentAccount>()
                .eq(FrequentPaymentAccount::getUserId, userId)
                .eq(FrequentPaymentAccount::getPaymentType, paymentType)
                .eq(FrequentPaymentAccount::getAccountNo, accountNo);
        FrequentPaymentAccount existing = frequentPaymentAccountMapper.selectOne(wrapper);
        if (existing != null) {
            existing.setAccountName(accountName);
            frequentPaymentAccountMapper.updateById(existing);
            return;
        }

        long count = frequentPaymentAccountMapper.selectCount(
                new LambdaQueryWrapper<FrequentPaymentAccount>()
                        .eq(FrequentPaymentAccount::getUserId, userId)
        );
        if (count >= Constants.MAX_FREQUENT_PAYMENT_ACCOUNTS) {
            List<FrequentPaymentAccount> oldest = frequentPaymentAccountMapper.selectList(
                    new LambdaQueryWrapper<FrequentPaymentAccount>()
                            .eq(FrequentPaymentAccount::getUserId, userId)
                            .orderByAsc(FrequentPaymentAccount::getCreatedAt)
                            .last("LIMIT 1")
            );
            if (!oldest.isEmpty()) {
                frequentPaymentAccountMapper.deleteById(oldest.get(0).getAccountId());
            }
        }

        FrequentPaymentAccount account = new FrequentPaymentAccount();
        account.setUserId(userId);
        account.setPaymentType(paymentType);
        account.setAccountNo(accountNo);
        account.setAccountName(accountName);
        account.setCreatedAt(LocalDateTime.now());
        frequentPaymentAccountMapper.insert(account);
    }

    private String getPaymentTypeName(int type) {
        switch (type) {
            case Constants.PAYMENT_TYPE_WATER: return "水费";
            case Constants.PAYMENT_TYPE_ELECTRICITY: return "电费";
            case Constants.PAYMENT_TYPE_GAS: return "燃气费";
            case Constants.PAYMENT_TYPE_PHONE: return "话费";
            default: return "其他";
        }
    }

    private String maskPaymentAccountNo(String accountNo) {
        if (accountNo == null || accountNo.length() <= 4) {
            return accountNo;
        }
        return "****" + accountNo.substring(accountNo.length() - 4);
    }
}
