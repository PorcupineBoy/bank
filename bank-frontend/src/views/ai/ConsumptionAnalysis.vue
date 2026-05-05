<template>
  <div class="analysis-page">
    <van-nav-bar title="消费分析" left-arrow @click-left="$router.back()" fixed />

    <!-- Dimension Tabs -->
    <div class="dimension-tabs">
      <div
        :class="['tab-item', { active: dimension === 'month' }]"
        @click="switchDimension('month')"
      >月度分析</div>
      <div
        :class="['tab-item', { active: dimension === 'year' }]"
        @click="switchDimension('year')"
      >年度分析</div>
    </div>

    <!-- Period Navigator -->
    <div class="period-nav">
      <van-icon class="nav-btn" name="arrow-left" @click="prevPeriod" />
      <span class="period-label" @click="showPicker = true">{{ periodLabel }}</span>
      <van-icon
        :class="['nav-btn', { disabled: !canNext }]"
        name="arrow"
        @click="canNext && nextPeriod()"
      />
    </div>

    <div class="content" v-if="analysis">
      <!-- Header Card -->
      <div class="summary-card">
        <div class="month-label">{{ dimension === 'year' ? analysis.year : analysis.month }}</div>
        <div class="expense-amount">¥{{ formatNum(analysis.totalExpense) }}</div>
        <div class="expense-label">总支出</div>
        <div v-if="momRatio !== null" :class="momClass" class="mom-badge">
          <van-icon :name="momIcon" />
          {{ Math.abs(momRatio) }}% {{ momLabel }}
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
          当前暂无消费记录
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

    <div v-else-if="loading" class="loading-wrap">
      <van-loading color="#4A90E2" />
      <p>正在分析您的消费数据...</p>
    </div>

    <div v-else-if="errorMsg" class="error-wrap">
      <van-icon color="#999" name="info-o" size="48" />
      <p>{{ errorMsg }}</p>
      <van-button color="#4A90E2" plain round size="small" @click="retry">重试</van-button>
    </div>

    <!-- Month/Year Picker -->
    <van-action-sheet v-model="showPicker" title="选择时间">
      <van-picker
        :columns="pickerColumns"
        @cancel="showPicker = false"
        @confirm="onPickerConfirm"
      />
    </van-action-sheet>
  </div>
</template>

<script>
import {getConsumptionAnalysis} from '@/api/ai'

const now = new Date()
const CUR_YEAR = now.getFullYear()
const CUR_MONTH = now.getMonth() + 1

export default {
  name: 'ConsumptionAnalysis',
  data() {
    return {
      analysis: null,
      loading: false,
      errorMsg: null,
      dimension: 'month',
      currentYear: CUR_YEAR,
      currentMonth: CUR_MONTH,
      showPicker: false
    }
  },
  computed: {
    periodLabel() {
      if (this.dimension === 'year') {
        return this.currentYear + '年'
      }
      return this.currentYear + '年' + String(this.currentMonth).padStart(2, '0') + '月'
    },
    canNext() {
      if (this.dimension === 'year') {
        return this.currentYear < CUR_YEAR
      }
      // 月维度：不能超过当前年月的下一个月
      if (this.currentYear > CUR_YEAR) return false
      if (this.currentYear === CUR_YEAR && this.currentMonth >= CUR_MONTH) return false
      return true
    },
    momRatio() {
      if (!this.analysis) return null
      if (this.dimension === 'year') return this.analysis.yearOverYearRatio
      return this.analysis.monthOverMonthRatio
    },
    momLabel() {
      if (this.dimension === 'year') return '同比'
      return '环比'
    },
    momClass() {
      if (!this.momRatio) return ''
      return this.momRatio > 0 ? 'up' : 'down'
    },
    momIcon() {
      if (!this.momRatio) return ''
      return this.momRatio > 0 ? 'arrow-up' : 'arrow-down'
    },
    pickerColumns() {
      if (this.dimension === 'year') {
        const years = []
        for (let i = CUR_YEAR - 5; i <= CUR_YEAR; i++) {
          years.push({ text: i + '年', value: String(i) })
        }
        return [years]
      }
      // 月维度：年份范围从 5 年前到当前年
      const years = []
      const months = []
      for (let i = CUR_YEAR - 5; i <= CUR_YEAR; i++) {
        years.push({ text: i + '年', value: String(i) })
      }
      for (let m = 1; m <= 12; m++) {
        // 当前年只显示到当前月
        if (this.currentYear === CUR_YEAR && m > CUR_MONTH) break
        months.push({ text: String(m).padStart(2, '0') + '月', value: String(m).padStart(2, '0') })
      }
      return [years, months]
    }
  },
  created() {
    this.loadAnalysis()
  },
  methods: {
    async loadAnalysis() {
      this.loading = true
      this.errorMsg = null
      try {
        let params = { dimension: this.dimension }
        if (this.dimension === 'year') {
          params.date = String(this.currentYear)
        } else {
          params.date = this.currentYear + '-' + String(this.currentMonth).padStart(2, '0')
        }
        const data = await getConsumptionAnalysis(params)
        this.analysis = data
      } catch (e) {
        this.errorMsg = (e && e.message) || '网络异常，请检查网络后重试'
        this.analysis = null
      } finally {
        this.loading = false
      }
    },
    retry() {
      this.loadAnalysis()
    },
    switchDimension(dim) {
      if (this.dimension === dim) return
      this.dimension = dim
      // 如果当前选中日期超出未来边界，回退到当前日期
      this.clampToCurrent()
      this.analysis = null
      this.loadAnalysis()
    },
    clampToCurrent() {
      if (this.dimension === 'year' && this.currentYear > CUR_YEAR) {
        this.currentYear = CUR_YEAR
      } else if (this.dimension === 'month') {
        if (this.currentYear > CUR_YEAR) {
          this.currentYear = CUR_YEAR
          this.currentMonth = CUR_MONTH
        } else if (this.currentYear === CUR_YEAR && this.currentMonth > CUR_MONTH) {
          this.currentMonth = CUR_MONTH
        }
      }
    },
    prevPeriod() {
      if (this.dimension === 'year') {
        this.currentYear--
      } else {
        this.currentMonth--
        if (this.currentMonth < 1) {
          this.currentMonth = 12
          this.currentYear--
        }
      }
      this.analysis = null
      this.errorMsg = null
      this.loadAnalysis()
    },
    nextPeriod() {
      if (this.dimension === 'year') {
        this.currentYear++
      } else {
        this.currentMonth++
        if (this.currentMonth > 12) {
          this.currentMonth = 1
          this.currentYear++
        }
      }
      this.analysis = null
      this.errorMsg = null
      this.loadAnalysis()
    },
    onPickerConfirm(value) {
      this.showPicker = false
      if (this.dimension === 'year') {
        const v = Array.isArray(value) ? value[0] : value
        this.currentYear = parseInt(v.value || v)
      } else {
        const yearVal = Array.isArray(value) ? value[0] : value
        const monthVal = Array.isArray(value) ? value[1] : null
        this.currentYear = parseInt(yearVal.value || yearVal)
        if (monthVal) {
          this.currentMonth = parseInt(monthVal.value || monthVal)
        }
      }
      this.analysis = null
      this.errorMsg = null
      this.loadAnalysis()
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
.dimension-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 15px;
  color: #666;
  position: relative;
  cursor: pointer;
}
.tab-item.active {
  color: #4A90E2;
  font-weight: bold;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #4A90E2;
  border-radius: 2px 2px 0 0;
}
.period-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px 16px;
  background: #fff;
}
.nav-btn {
  font-size: 20px;
  color: #4A90E2;
  padding: 4px;
  cursor: pointer;
}
.nav-btn.disabled {
  color: #ccc;
  cursor: not-allowed;
}
.period-label {
  font-size: 16px;
  font-weight: bold;
  color: #1A1A2E;
  cursor: pointer;
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
.error-wrap {
  text-align: center;
  padding-top: 100px;
  color: #999;
}
.error-wrap p {
  margin: 16px 0;
  font-size: 14px;
  color: #666;
  padding: 0 32px;
}
</style>
