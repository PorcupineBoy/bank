<template>
  <div class="transaction-list-page">
    <van-nav-bar title="交易记录" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="filter-o" size="18" @click="showFilter = true" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group>
          <van-cell
            v-for="item in list"
            :key="item.transId"
            :title="item.payeeName || (item.transType === 1 ? '转账' : '缴费')"
            :label="formatTime(item.createdAt)"
            is-link
            @click="$router.push('/transactions/' + item.transId)"
          >
            <template #default>
              <div :class="['amount', item.transType === 3 ? 'income' : 'expense']">
                {{ item.transType === 3 ? '+' : '-' }}{{ item.amount.toFixed(2) }}
              </div>
              <div class="status">{{ formatStatus(item.status) }}</div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <van-popup v-model="showFilter" position="right" style="width: 80%; height: 100%;">
      <div class="filter-panel">
        <div class="filter-title">筛选条件</div>

        <div class="filter-section">
          <div class="filter-label">时间范围</div>
          <van-radio-group v-model="filter.timeRange">
            <van-cell-group>
              <van-cell title="近7天" clickable @click="filter.timeRange = '7d'">
                <template #right-icon>
                  <van-radio name="7d" />
                </template>
              </van-cell>
              <van-cell title="近1个月" clickable @click="filter.timeRange = '1m'">
                <template #right-icon>
                  <van-radio name="1m" />
                </template>
              </van-cell>
              <van-cell title="近3个月" clickable @click="filter.timeRange = '3m'">
                <template #right-icon>
                  <van-radio name="3m" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>

        <div class="filter-section">
          <div class="filter-label">交易类型</div>
          <van-radio-group v-model="filter.transType">
            <van-cell-group>
              <van-cell title="全部" clickable @click="filter.transType = null">
                <template #right-icon>
                  <van-radio :name="null" />
                </template>
              </van-cell>
              <van-cell title="转账" clickable @click="filter.transType = 1">
                <template #right-icon>
                  <van-radio :name="1" />
                </template>
              </van-cell>
              <van-cell title="缴费" clickable @click="filter.transType = 2">
                <template #right-icon>
                  <van-radio :name="2" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>

        <div class="filter-actions">
          <van-button block type="default" @click="resetFilter">重置</van-button>
          <van-button block type="info" @click="applyFilter">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { queryTransactions } from '@/api/transaction'

export default {
  name: 'TransactionList',
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      refreshing: false,
      page: 1,
      showFilter: false,
      filter: {
        timeRange: '1m',
        transType: null
      }
    }
  },
  created() {
    this.onLoad()
  },
  methods: {
    async onLoad() {
      try {
        const res = await queryTransactions({
          page: this.page,
          size: 20,
          timeRange: this.filter.timeRange,
          transType: this.filter.transType
        })
        const records = res.records || []
        if (this.refreshing) {
          this.list = records
          this.refreshing = false
        } else {
          this.list.push(...records)
        }
        this.page++
        if (records.length < 20) {
          this.finished = true
        }
      } catch (e) {
        this.finished = true
      } finally {
        this.loading = false
      }
    },
    onRefresh() {
      this.finished = false
      this.page = 1
      this.onLoad()
    },
    resetFilter() {
      this.filter = { timeRange: '1m', transType: null }
    },
    applyFilter() {
      this.showFilter = false
      this.page = 1
      this.list = []
      this.finished = false
      this.onLoad()
    },
    formatTime(time) {
      if (!time) return ''
      return time.replace('T', ' ').substring(0, 16)
    },
    formatStatus(status) {
      const map = { 0: '处理中', 1: '成功', 2: '失败' }
      return map[status] || ''
    }
  }
}
</script>

<style scoped>
.transaction-list-page {
  min-height: 100%;
  background: #f5f5f5;
}
.amount {
  font-size: 16px;
  font-weight: bold;
}
.amount.expense {
  color: #333;
}
.amount.income {
  color: #07c160;
}
.status {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.filter-panel {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.filter-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}
.filter-section {
  margin-bottom: 16px;
}
.filter-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.filter-actions {
  margin-top: auto;
  display: flex;
  gap: 12px;
}
</style>
