package com.bank.config;

import com.bank.entity.BankCard;
import com.bank.mapper.BankCardMapper;
import com.bank.util.AESUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;

/**
 * 启动时修复银行测试卡数据：将占位符加密值替换为真实的 AES 加密卡号
 * <p>
 * 当 init_user.sql 导入的测试卡数据使用了 placeholder 值（如 "placeholder_card_001"），
 * 后端运行时因 AES 密钥不一致无法解密，导致小眼睛展示时只能回退到脱敏卡号。
 * 本组件在应用启动时自动检测并修复这些数据。
 */
@Slf4j
@Component
public class BankCardDataFixer {

    @Autowired
    private BankCardMapper bankCardMapper;
    @Autowired
    private AESUtil aesUtil;

    @PostConstruct
    public void fixPlaceholderCardNumbers() {
        List<BankCard> cards = bankCardMapper.selectList(
                new LambdaQueryWrapper<BankCard>()
                        .isNotNull(BankCard::getCardNoEncrypted)
        );
        boolean anyFixed = false;
        for (BankCard card : cards) {
            String encrypted = card.getCardNoEncrypted();
            // 只修复以 placeholder_ 开头的占位数据
            if (encrypted != null && encrypted.startsWith("placeholder_")) {
                // 从脱敏卡号提取后 4 位，生成 16 位真实测试卡号
                String last4 = card.getCardNoMasked().replaceAll("[ *]", "");
                String realCardNo = "622202123456" + last4;
                try {
                    card.setCardNoEncrypted(AESUtil.encrypt(realCardNo));
                    bankCardMapper.updateById(card);
                    anyFixed = true;
                    log.info("Fixed encrypted card number for cardId={}, new cardNo={}",
                            card.getCardId(), realCardNo);
                } catch (Exception e) {
                    log.warn("Failed to re-encrypt card number for cardId={}", card.getCardId(), e);
                }
            }
        }
        if (anyFixed) {
            log.info("BankCard data fix completed — placeholder encrypted values replaced with real AES ciphertext");
        }
    }
}
