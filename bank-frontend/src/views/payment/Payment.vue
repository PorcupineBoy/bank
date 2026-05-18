<template>
  <div class="payment-page">
    <van-nav-bar title="生活缴费" left-arrow @click-left="$router.back()" />

    <div class="type-grid">
      <div
        v-for="type in paymentTypes"
        :key="type.value"
        :class="['type-item', selectedType === type.value ? 'active' : '']"
        @click="selectType(type.value)"
      >
        <van-icon :name="type.icon" size="28" />
        <span>{{ type.label }}</span>
      </div>
    </div>

    <div v-if="selectedType" class="form-area">
      <van-field
        v-model="accountNo"
        :label="accountLabel"
        :placeholder="accountPlaceholder"
        clearable
      />

      <div v-if="historyList.length > 0" class="history-area">
        <div class="history-title">常用户号</div>
        <div class="history-tags">
          <van-tag
            v-for="item in historyList"
            :key="item.accountNo"
            type="primary"
            size="medium"
            style="margin-right: 8px; margin-bottom: 8px; cursor: pointer"
            @click="selectHistory(item)"
          >
            {{ item.accountNo }}
          </van-tag>
        </div>
      </div>

      <div style="margin: 16px;">
        <van-button round block type="info" :loading="querying" @click="onQuery">
          查询账单
        </van-button>
      </div>

      <div v-if="billInfo" class="bill-card">
        <div class="bill-title">{{ billInfo.paymentTypeName }}账单</div>
        <div class="bill-row">
          <span>户号</span>
          <span>{{ billInfo.accountNo }}</span>
        </div>
        <div class="bill-row">
          <span>户名</span>
          <span>{{ billInfo.accountName }}</span>
        </div>
        <div class="bill-row">
          <span>账期</span>
          <span>{{ billInfo.period }}</span>
        </div>
        <div class="bill-amount">
          应缴金额：{{ Number(billInfo.amount).toFixed(2) }} 元
        </div>
        <van-button round block type="danger" style="margin-top: 12px" @click="onNext">
          下一步
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { queryPaymentBill, listPaymentAccounts } from '@/api/transaction'

export default {
  name: 'Payment',
  data() {
    return {
      paymentTypes: [
        { value: 1, label: '水费', icon: 'cluster-o' },
        { value: 2, label: '电费', icon: 'bulb-o' },
        { value: 3, label: '燃气费', icon: 'fire-o' },
        { value: 4, label: '话费', icon: 'phone-o' }
      ],
      selectedType: null,
      accountNo: '',
      querying: false,
      billInfo: null,
      historyList: []
    }
  },
  computed: {
    accountLabel() {
      return this.selectedType === 4 ? '手机号' : '缴费户号'
    },
    accountPlaceholder() {
      return this.selectedType === 4 ? '请输入手机号' : '请输入缴费户号'
    }
  },
  methods: {
    async selectType(type) {
      this.selectedType = type
      this.accountNo = ''
      this.billInfo = null
      await this.loadHistory()
    },
    async loadHistory() {
      try {
        const res = await listPaymentAccounts(this.selectedType)
        this.historyList = res || []
      } catch (e) {
        this.historyList = []
      }
    },
    selectHistory(item) {
      this.accountNo = item.accountNo
    },
    async onQuery() {
      if (!this.accountNo.trim()) {
        this.$toast('请输入' + (this.selectedType === 4 ? '手机号' : '缴费户号'))
        return
      }
      this.querying = true
      try {
        const res = await queryPaymentBill({
          paymentType: this.selectedType,
          accountNo: this.accountNo.trim()
        })
        this.billInfo = res
      } catch (e) {
        this.billInfo = null
      } finally {
        this.querying = false
      }
    },
    onNext() {
      if (!this.billInfo) return
      const typeName = this.paymentTypes.find(t => t.value === this.selectedType)?.label || ''
      this.$router.push({
        path: '/payment/confirm',
        query: {
          paymentType: this.selectedType,
          typeName: typeName,
          accountNo: this.billInfo.accountNo,
          accountName: this.billInfo.accountName,
          amount: this.billInfo.amount,
          period: this.billInfo.period
        }
      })
    }
  }
}
</script>

<style scoped>
.payment-page {
  min-height: 100%;
  background: var(--bg-color);
}
.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);
  padding: var(--sp-md);
  background: var(--card-bg);
  margin-bottom: var(--sp-sm);
}
.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-md) 0;
  border-radius: var(--radius-lg);
  background: var(--surface-soft);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.type-item span {
  margin-top: var(--sp-xs);
  font-size: var(--fs-caption);
}
.type-item.active {
  background: var(--primary-color);
  color: var(--text-on-primary);
}
.form-area {
  background: var(--card-bg);
  padding-bottom: var(--sp-lg);
}
.history-area {
  padding: 0 var(--sp-md) var(--sp-sm);
}
.history-title {
  font-size: var(--fs-caption);
  color: var(--text-tertiary);
  margin-bottom: var(--sp-xs);
}
.history-tags {
  display: flex;
  flex-wrap: wrap;
}
.bill-card {
  margin: var(--sp-md);
  padding: var(--sp-md);
  background: var(--surface-soft);
  border-radius: var(--radius-lg);
}
.bill-title {
  font-size: var(--fs-title-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--sp-sm);
}
.bill-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-body-sm);
  color: var(--text-secondary);
  margin-bottom: var(--sp-xs);
}
.bill-amount {
  font-size: var(--fs-title-md);
  font-weight: 500;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
  color: var(--danger-color);
  margin-top: var(--sp-sm);
  text-align: center;
  line-height: 1;
}
</style>
