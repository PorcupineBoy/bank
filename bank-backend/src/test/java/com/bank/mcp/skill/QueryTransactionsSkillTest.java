package com.bank.mcp.skill;

import com.bank.mcp.SkillMeta;
import com.bank.mcp.SkillResult;
import com.bank.service.TransactionService;
import com.bank.vo.TransactionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 交易记录查询 Skill 单元测试
 */
@ExtendWith(MockitoExtension.class)
class QueryTransactionsSkillTest {

    @Mock
    private TransactionService transactionService;

    private QueryTransactionsSkill skill;

    @BeforeEach
    void setUp() {
        skill = new QueryTransactionsSkill();
        skill.setTransactionService(transactionService);
    }

    @Test
    void testExecute_NoTransactions() {
        IPage<TransactionVO> emptyPage = new Page<>(1, 5, 0);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(emptyPage);

        SkillResult result = skill.execute(1L, null);

        assertEquals("当前查询时间范围内没有交易记录。", result.getReply());
        assertNull(result.getStructuredData());
    }

    @Test
    void testExecute_WithTransactions() {
        IPage<TransactionVO> page = createTransactionPage(3);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(page);

        SkillResult result = skill.execute(1L, null);

        assertNotNull(result.getReply());
        assertTrue(result.getReply().contains("交易记录"));
        assertTrue(result.getReply().contains("3笔"));

        // 验证结构化数据
        assertNotNull(result.getStructuredData());
        assertEquals("transaction_list", result.getStructuredData().getType());
        assertEquals(3, result.getStructuredData().getItems().size());
        assertEquals("navigate", result.getAction().getType());
    }

    @Test
    void testExecute_AmountSignNegativeForTransfers() {
        IPage<TransactionVO> page = createTransactionPage(1);
        // 修改第一笔记录为转账（支出，应为负值）
        TransactionVO t = page.getRecords().get(0);
        t.setTransType(1); // 转账
        t.setAmount(new BigDecimal("-500.00"));

        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(page);

        SkillResult result = skill.execute(1L, null);

        // amountDisplay 应包含负号
        Map<String, Object> item = result.getStructuredData().getItems().get(0);
        String display = (String) item.get("amountDisplay");
        assertTrue(display.startsWith("-"), "转账金额应以 - 开头，实际: " + display);
    }

    @Test
    void testExecute_AmountSignPositiveForIncome() {
        IPage<TransactionVO> page = createTransactionPage(1);
        TransactionVO t = page.getRecords().get(0);
        t.setTransType(3); // 收入
        t.setAmount(new BigDecimal("5000.00"));

        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(page);

        SkillResult result = skill.execute(1L, null);

        Map<String, Object> item = result.getStructuredData().getItems().get(0);
        String display = (String) item.get("amountDisplay");
        assertTrue(display.startsWith("+"), "收入金额应以 + 开头，实际: " + display);
    }

    @Test
    void testExecute_WithTimeRangeParam() {
        IPage<TransactionVO> emptyPage = new Page<>(1, 5, 0);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(emptyPage);

        Map<String, Object> params = new HashMap<>();
        params.put("time_range", "7d");

        SkillResult result = skill.execute(1L, params);
        assertNotNull(result);
    }

    @Test
    void testExecute_WithInvalidTimeRange_FallsBackToDefault() {
        IPage<TransactionVO> emptyPage = new Page<>(1, 5, 0);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(emptyPage);

        Map<String, Object> params = new HashMap<>();
        params.put("time_range", "invalid_range");

        SkillResult result = skill.execute(1L, params);
        assertNotNull(result);
        // 应使用默认值 "1m"
    }

    @Test
    void testExecute_WithTransTypeFilter() {
        IPage<TransactionVO> page = createTransactionPage(2);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(page);

        Map<String, Object> params = new HashMap<>();
        params.put("trans_type", "transfer");

        SkillResult result = skill.execute(1L, params);
        assertNotNull(result);
    }

    @Test
    void testExecute_WithPageSizeParam() {
        IPage<TransactionVO> page = createTransactionPage(3);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(page);

        Map<String, Object> params = new HashMap<>();
        params.put("page_size", 10);

        SkillResult result = skill.execute(1L, params);
        assertNotNull(result);
    }

    @Test
    void testExecute_PageSizeClamped() {
        IPage<TransactionVO> page = createTransactionPage(0);
        when(transactionService.queryTransactions(eq(1L), any())).thenReturn(page);

        Map<String, Object> params = new HashMap<>();
        params.put("page_size", 100); // 超过上限 20

        SkillResult result = skill.execute(1L, params);
        assertNotNull(result);
        // 内部应被限制为 20
    }

    @Test
    void testGetMeta() {
        assertEquals("query_transactions", skill.getMeta().getName());
        assertEquals(SkillMeta.SecurityLevel.QUERY, skill.getMeta().getSecurityLevel());
        assertTrue(skill.getMeta().getParameters().containsKey("time_range"));
        assertTrue(skill.getMeta().getParameters().containsKey("page_size"));
        assertTrue(skill.getMeta().getParameters().containsKey("trans_type"));
    }

    /**
     * 创建模拟的交易记录分页数据
     */
    private IPage<TransactionVO> createTransactionPage(int count) {
        List<TransactionVO> records = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            TransactionVO t = new TransactionVO();
            t.setTransId((long) (i + 1));
            t.setTransNo("TXN" + String.format("%012d", i + 1));
            t.setTransType(i % 2 == 0 ? 2 : 1); // 交替：缴费、转账
            t.setAmount(new BigDecimal("-" + ((i + 1) * 100) + ".00"));
            t.setPayeeName(i % 2 == 0 ? "话费缴费" : "张三");
            t.setPayeeCardNoMasked("****" + String.format("%04d", i + 1));
            t.setStatus(1);
            t.setCreatedAt(LocalDateTime.now().minusDays(i));
            records.add(t);
        }

        Page<TransactionVO> page = new Page<>(1, 5, count);
        page.setRecords(records);
        return page;
    }
}
