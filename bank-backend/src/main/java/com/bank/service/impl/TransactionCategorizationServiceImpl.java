package com.bank.service.impl;

import com.bank.entity.Transaction;
import com.bank.mapper.TransactionMapper;
import com.bank.service.TransactionCategorizationService;
import com.bank.vo.ConsumptionAnalysisVO;
import com.bank.vo.ConsumptionCategoryVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class TransactionCategorizationServiceImpl implements TransactionCategorizationService {

    @Autowired
    private TransactionMapper transactionMapper;

    private static final Map<Integer, String> CATEGORY_NAMES = new LinkedHashMap<>();
    static {
        CATEGORY_NAMES.put(1, "餐饮美食");
        CATEGORY_NAMES.put(2, "购物消费");
        CATEGORY_NAMES.put(3, "交通出行");
        CATEGORY_NAMES.put(4, "居住生活");
        CATEGORY_NAMES.put(5, "医疗健康");
        CATEGORY_NAMES.put(6, "教育学习");
        CATEGORY_NAMES.put(7, "休闲娱乐");
        CATEGORY_NAMES.put(8, "金融理财");
        CATEGORY_NAMES.put(9, "人情往来");
        CATEGORY_NAMES.put(0, "其他");
    }

    private static final List<CategoryRule> RULES = new ArrayList<>();
    static {
        RULES.add(new CategoryRule(1, "餐饮", Arrays.asList("餐厅", "饭店", "外卖", "咖啡", "奶茶", "肯德基", "麦当劳", "必胜客", "海底捞", "烧烤", "火锅", "美食", "食堂", "小吃", "饮品", "星巴克", "瑞幸")));
        RULES.add(new CategoryRule(2, "购物", Arrays.asList("超市", "商场", "淘宝", "京东", "天猫", "拼多多", "百货", "便利店", "walmart", "苏宁", "国美", "永辉", "盒马", "山姆", "购物")));
        RULES.add(new CategoryRule(3, "交通", Arrays.asList("加油", "停车", "地铁", "公交", "滴滴", "打车", "出租车", "高铁", "火车", "机票", "航空", "驾校", "高速", "etc", "油费")));
        RULES.add(new CategoryRule(4, "居住", Arrays.asList("房租", "物业", "水电", "燃气", "宽带", "装修", "家具", "家电", "宜家", "维修", "保洁", "供暖")));
        RULES.add(new CategoryRule(5, "医疗", Arrays.asList("医院", "诊所", "药房", "药店", "体检", "疫苗", "医保", "牙科", "眼科", "挂号", "同仁堂", "海王星辰")));
        RULES.add(new CategoryRule(6, "教育", Arrays.asList("培训", "学费", "书本", "教材", "考试", "新东方", "学而思", "驾校", "网课", "留学", "考研", "雅思", "托福")));
        RULES.add(new CategoryRule(7, "娱乐", Arrays.asList("电影", "影院", "KTV", "游戏", "旅游", "酒店", "景点", "门票", "会员", "视频", "音乐", "直播", "酒吧")));
        RULES.add(new CategoryRule(8, "金融", Arrays.asList("理财", "保险", "基金", "股票", "还款", "信用卡", "贷款", "利息", "手续费", "余额宝", "定投")));
        RULES.add(new CategoryRule(9, "人情", Arrays.asList("红包", "礼金", "份子", "请客", "礼物", "鲜花", "慰问", "拜年", "结婚", "生日")));
    }

    @Override
    public Integer categorizeTransaction(String payeeName, String remark, Integer transType) {
        if (transType != null && transType == 3) {
            return 8;
        }
        String text = (payeeName != null ? payeeName : "") + " " + (remark != null ? remark : "");
        String lower = text.toLowerCase();

        for (CategoryRule rule : RULES) {
            for (String keyword : rule.keywords) {
                if (lower.contains(keyword.toLowerCase())) {
                    return rule.category;
                }
            }
        }
        return 0;
    }

    @Override
    public void recategorizeTransaction(Long transId, Integer category, String subCategory) {
        Transaction trans = new Transaction();
        trans.setTransId(transId);
        trans.setCategory(category);
        trans.setSubCategory(subCategory);
        transactionMapper.updateById(trans);
    }

    @Override
    public ConsumptionAnalysisVO analyzeConsumption(Long userId, LocalDate month) {
        LocalDateTime start = month.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = month.withDayOfMonth(month.lengthOfMonth()).atTime(23, 59, 59);

        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<Transaction>()
                .eq(Transaction::getUserId, userId)
                .lt(Transaction::getAmount, BigDecimal.ZERO)
                .eq(Transaction::getStatus, 1)
                .ge(Transaction::getCreatedAt, start)
                .le(Transaction::getCreatedAt, end);

        List<Transaction> transactions = transactionMapper.selectList(wrapper);

        ConsumptionAnalysisVO analysis = new ConsumptionAnalysisVO();
        analysis.setMonth(month.format(DateTimeFormatter.ofPattern("yyyy年MM月")));

        if (transactions == null || transactions.isEmpty()) {
            analysis.setTotalExpense(BigDecimal.ZERO);
            analysis.setCategoryList(new ArrayList<>());
            return analysis;
        }

        BigDecimal totalExpense = transactions.stream()
                .map(t -> t.getAmount().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        analysis.setTotalExpense(totalExpense.setScale(2, RoundingMode.HALF_UP));

        Map<Integer, List<Transaction>> grouped = new HashMap<>();
        for (Transaction t : transactions) {
            Integer cat = t.getCategory() != null ? t.getCategory() : 0;
            grouped.computeIfAbsent(cat, k -> new ArrayList<>()).add(t);
        }

        List<ConsumptionCategoryVO> categoryList = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : CATEGORY_NAMES.entrySet()) {
            List<Transaction> list = grouped.get(entry.getKey());
            if (list == null || list.isEmpty()) continue;

            BigDecimal catAmount = list.stream()
                    .map(t -> t.getAmount().abs())
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);

            ConsumptionCategoryVO vo = new ConsumptionCategoryVO();
            vo.setCategory(entry.getKey());
            vo.setCategoryName(entry.getValue());
            vo.setAmount(catAmount);
            vo.setCount(list.size());
            BigDecimal pct = totalExpense.compareTo(BigDecimal.ZERO) > 0
                    ? catAmount.multiply(new BigDecimal("100")).divide(totalExpense, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            vo.setPercentage(pct);
            categoryList.add(vo);
        }

        categoryList.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        analysis.setCategoryList(categoryList);

        BigDecimal prevExpense = calculatePrevMonthExpense(userId, month);
        if (prevExpense != null && prevExpense.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = totalExpense.subtract(prevExpense)
                    .multiply(new BigDecimal("100"))
                    .divide(prevExpense, 1, RoundingMode.HALF_UP);
            analysis.setMonthOverMonthRatio(ratio);
        }

        analysis.setAiInsight(generateInsight(categoryList, totalExpense, analysis.getMonthOverMonthRatio()));
        return analysis;
    }

    private BigDecimal calculatePrevMonthExpense(Long userId, LocalDate month) {
        LocalDate prev = month.minusMonths(1);
        LocalDateTime start = prev.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = prev.withDayOfMonth(prev.lengthOfMonth()).atTime(23, 59, 59);

        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<Transaction>()
                .eq(Transaction::getUserId, userId)
                .lt(Transaction::getAmount, BigDecimal.ZERO)
                .eq(Transaction::getStatus, 1)
                .ge(Transaction::getCreatedAt, start)
                .le(Transaction::getCreatedAt, end);

        List<Transaction> list = transactionMapper.selectList(wrapper);
        if (list == null || list.isEmpty()) return null;
        return list.stream().map(t -> t.getAmount().abs()).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String generateInsight(List<ConsumptionCategoryVO> categories, BigDecimal total, BigDecimal mom) {
        if (categories == null || categories.isEmpty()) return null;

        StringBuilder sb = new StringBuilder();
        ConsumptionCategoryVO top = categories.get(0);
        sb.append("您本月最大支出为").append(top.getCategoryName())
          .append("，占比").append(top.getPercentage()).append("%");

        if (mom != null) {
            if (mom.compareTo(new BigDecimal("20")) > 0) {
                sb.append("；总支出较上月增长").append(mom.abs()).append("%，建议关注支出结构");
            } else if (mom.compareTo(new BigDecimal("-20")) < 0) {
                sb.append("；总支出较上月减少").append(mom.abs()).append("%，储蓄习惯良好");
            } else {
                sb.append("；支出水平与上月基本持平");
            }
        }
        sb.append("。");
        return sb.toString();
    }

    private static class CategoryRule {
        int category;
        String name;
        List<String> keywords;
        CategoryRule(int category, String name, List<String> keywords) {
            this.category = category;
            this.name = name;
            this.keywords = keywords;
        }
    }
}
