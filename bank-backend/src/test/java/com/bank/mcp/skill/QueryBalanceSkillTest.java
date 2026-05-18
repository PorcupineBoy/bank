package com.bank.mcp.skill;

import com.bank.mcp.SkillMeta;
import com.bank.mcp.SkillResult;
import com.bank.service.BankCardService;
import com.bank.vo.BankCardVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * 余额查询 Skill 单元测试
 */
@ExtendWith(MockitoExtension.class)
class QueryBalanceSkillTest {

    @Mock
    private BankCardService bankCardService;

    private QueryBalanceSkill skill;

    @BeforeEach
    void setUp() {
        skill = new QueryBalanceSkill();
        skill.setBankCardService(bankCardService);
    }

    @Test
    void testExecute_NoCards() {
        when(bankCardService.listCards(1L)).thenReturn(Collections.emptyList());

        SkillResult result = skill.execute(1L, null);

        assertEquals("您当前没有绑定的银行卡。请先绑定银行卡后再查询余额。", result.getReply());
        assertNotNull(result.getStructuredData());
        assertEquals("empty", result.getStructuredData().getType());
        assertEquals("no_cards", result.getStructuredData().getData().get("message"));
    }

    @Test
    void testExecute_WithCards() {
        List<BankCardVO> cards = createMockCards();
        when(bankCardService.listCards(1L)).thenReturn(cards);

        SkillResult result = skill.execute(1L, null);

        assertNotNull(result.getReply());
        assertTrue(result.getReply().contains("总资产"));
        assertTrue(result.getReply().contains("工商银行"));

        assertNotNull(result.getStructuredData());
        assertEquals("balance_card", result.getStructuredData().getType());
        assertEquals(new BigDecimal("15000.00"), result.getStructuredData().getData().get("totalBalance"));
        assertEquals(2, result.getStructuredData().getData().get("cardCount"));
        assertEquals(2, result.getStructuredData().getItems().size());

        // 验证操作建议
        assertNotNull(result.getAction());
        assertEquals("navigate", result.getAction().getType());
        assertEquals("/transactions", result.getAction().getRoute());
    }

    @Test
    void testExecute_FilterByBankName() {
        List<BankCardVO> cards = createMockCards();
        when(bankCardService.listCards(1L)).thenReturn(cards);

        Map<String, Object> params = new HashMap<>();
        params.put("bank_name", "工商");

        SkillResult result = skill.execute(1L, params);

        assertEquals("balance_card", result.getStructuredData().getType());
        assertEquals(1, result.getStructuredData().getItems().size());
        assertEquals("工商银行", result.getStructuredData().getItems().get(0).get("bankName"));
    }

    @Test
    void testExecute_FilterByBankName_NoMatch() {
        List<BankCardVO> cards = createMockCards();
        when(bankCardService.listCards(1L)).thenReturn(cards);

        Map<String, Object> params = new HashMap<>();
        params.put("bank_name", "招商银行");

        SkillResult result = skill.execute(1L, params);

        assertTrue(result.getReply().contains("未找到"));
        assertTrue(result.getReply().contains("招商银行"));
        assertEquals("card_list", result.getStructuredData().getType());

        // 应该返回所有卡片供用户选择
        assertEquals(2, result.getStructuredData().getItems().size());
    }

    @Test
    void testExecute_NullBalanceHandling() {
        BankCardVO card = new BankCardVO();
        card.setCardId(1L);
        card.setBankName("测试银行");
        card.setCardNoMasked("****1234");
        card.setCardType(1);
        card.setBalance(null); // null 余额
        card.setIsDefault(1);

        when(bankCardService.listCards(1L)).thenReturn(Collections.singletonList(card));

        SkillResult result = skill.execute(1L, null);

        assertEquals("balance_card", result.getStructuredData().getType());
        assertEquals(BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP),
                result.getStructuredData().getData().get("totalBalance"));
    }

    @Test
    void testGetMeta() {
        assertEquals("query_balance", skill.getMeta().getName());
        assertEquals(SkillMeta.SecurityLevel.QUERY, skill.getMeta().getSecurityLevel());
        assertNotNull(skill.getMeta().getDescription());
        assertFalse(skill.getMeta().getDescription().isEmpty());
    }

    /**
     * 创建模拟的银行卡列表
     */
    private List<BankCardVO> createMockCards() {
        BankCardVO card1 = new BankCardVO();
        card1.setCardId(1L);
        card1.setBankName("工商银行");
        card1.setCardNoMasked("****1135");
        card1.setCardType(1);
        card1.setBalance(new BigDecimal("5000.00"));
        card1.setIsDefault(1);

        BankCardVO card2 = new BankCardVO();
        card2.setCardId(2L);
        card2.setBankName("建设银行");
        card2.setCardNoMasked("****6688");
        card2.setCardType(2);
        card2.setBalance(new BigDecimal("10000.00"));
        card2.setIsDefault(0);

        return Arrays.asList(card1, card2);
    }
}
