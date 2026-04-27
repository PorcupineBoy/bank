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
  background: #f5f5f5;
}
.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  background: #fff;
  margin-bottom: 12px;
}
.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  border-radius: 12px;
  background: #f5f8ff;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}
.type-item span {
  margin-top: 8px;
  font-size: 13px;
}
.type-item.active {
  background: #4a90e2;
  color: #fff;
}
.form-area {
  background: #fff;
  padding-bottom: 24px;
}
.history-area {
  padding: 0 16px 12px;
}
.history-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}
.history-tags {
  display: flex;
  flex-wrap: wrap;
}
.bill-card {
  margin: 16px;
  padding: 16px;
  background: #f5f8ff;
  border-radius: 12px;
}
.bill-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}
.bill-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.bill-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ee0a24;
  margin-top: 12px;
  text-align: center;
}
</style>
