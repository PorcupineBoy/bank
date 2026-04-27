<template>
  <div class="analysis-page">
    <van-nav-bar title="消费分析" left-arrow @click-left="$router.back()" fixed />

    <div class="content" v-if="analysis">
      <!-- Header Card -->
      <div class="summary-card">
        <div class="month-label">{{ analysis.month }}</div>
        <div class="expense-amount">¥{{ formatNum(analysis.totalExpense) }}</div>
        <div class="expense-label">总支出</div>
        <div v-if="analysis.monthOverMonthRatio !== null" class="mom-badge" :class="momClass">
          <van-icon :name="momIcon" />
          {{ Math.abs(analysis.monthOverMonthRatio) }}% 环比
        </div>
      </div>

      <!-- AI Insight -->
      <div v-if="analysis.aiInsight" class="insight-card">
        <div class="insight-title">
          <van-icon name="bulb-o" color="#4A90E2" />
          <span>AI洞察</span>
        </div>
        <div class="insight-text">{{ analysis.aiInsight }}</div>
      </div>

      <!-- Category List -->
      <div class="category-card">
        <div class="card-title">消费结构</div>
        <div v-if="!analysis.categoryList || analysis.categoryList.length === 0" class="empty">
          本月暂无消费记录
        </div>
        <div
          v-for="(cat, idx) in analysis.categoryList"
          :key="cat.category"
          class="category-item"
        >
          <div class="cat-info">
            <div class="cat-rank">{{ idx + 1 }}</div>
            <div class="cat-name">{{ cat.categoryName }}</div>
            <div class="cat-count">{{ cat.count }}笔</div>
          </div>
          <div class="cat-bar-wrap">
            <div class="cat-bar-bg">
              <div
                class="cat-bar"
                :style="{ width: cat.percentage + '%', background: barColor(idx) }"
              />
            </div>
            <div class="cat-amount">¥{{ formatNum(cat.amount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-wrap">
      <van-loading color="#4A90E2" />
      <p>正在分析您的消费数据...</p>
    </div>
  </div>
</template>

<script>
import { getConsumptionAnalysis } from '@/api/ai'

export default {
  name: 'ConsumptionAnalysis',
  data() {
    return {
      analysis: null
    }
  },
  computed: {
    momClass() {
      if (!this.analysis || !this.analysis.monthOverMonthRatio) return ''
      return this.analysis.monthOverMonthRatio > 0 ? 'up' : 'down'
    },
    momIcon() {
      if (!this.analysis || !this.analysis.monthOverMonthRatio) return ''
      return this.analysis.monthOverMonthRatio > 0 ? 'arrow-up' : 'arrow-down'
    }
  },
  created() {
    this.loadAnalysis()
  },
  methods: {
    async loadAnalysis() {
      try {
        this.analysis = await getConsumptionAnalysis({})
      } catch (e) {
        this.$toast.fail('加载失败')
      }
    },
    formatNum(val) {
      return Number(val || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    barColor(idx) {
      const colors = ['#4A90E2', '#5B9BD5', '#7BB7F0', '#A0C4FF', '#B8D4F5', '#D0E3FA', '#E8F0FE']
      return colors[idx % colors.length]
    }
  }
}
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background: #F0F4F8;
  padding-top: 46px;
}
.content {
  padding: 16px;
}
.summary-card {
  background: linear-gradient(135deg, #7BB7F0 0%, #4A90E2 100%);
  border-radius: 20px;
  padding: 28px 20px;
  color: #fff;
  text-align: center;
  margin-bottom: 16px;
}
.month-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}
.expense-amount {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 4px;
}
.expense-label {
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 12px;
}
.mom-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.mom-badge.up { color: #FF6B6B; background: rgba(255,255,255,0.9); }
.mom-badge.down { color: #52C41A; background: rgba(255,255,255,0.9); }
.insight-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.insight-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: bold;
  color: #1A1A2E;
  margin-bottom: 10px;
}
.insight-text {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}
.category-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #1A1A2E;
  margin-bottom: 16px;
}
.empty {
  text-align: center;
  color: #999;
  padding: 32px;
  font-size: 14px;
}
.category-item {
  margin-bottom: 16px;
}
.cat-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.cat-rank {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #F0F4F8;
  color: #4A90E2;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.cat-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}
.cat-count {
  font-size: 12px;
  color: #999;
}
.cat-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cat-bar-bg {
  flex: 1;
  height: 8px;
  background: #F0F4F8;
  border-radius: 4px;
  overflow: hidden;
}
.cat-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.cat-amount {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}
.loading-wrap {
  text-align: center;
  padding-top: 120px;
  color: #999;
}
.loading-wrap p {
  margin-top: 12px;
  font-size: 14px;
}
</style>
