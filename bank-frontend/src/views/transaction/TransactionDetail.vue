<template>
  <div class="transaction-detail-page">
    <van-nav-bar title="交易详情" left-arrow @click-left="$router.back()" />

    <div class="detail-header" v-if="detail">
      <div class="status-icon">
        <van-icon :name="detail.status === 1 ? 'success' : 'warning-o'" :color="detail.status === 1 ? 'var(--success-color)' : 'var(--warning-color)'" size="48" />
      </div>
      <div class="status-text">{{ detail.status === 1 ? '交易成功' : (detail.status === 0 ? '处理中' : '交易失败') }}</div>
      <div class="amount">{{ detail.amount.toFixed(2) }} 元</div>
    </div>

    <van-cell-group v-if="detail">
      <van-cell title="收款人" :value="detail.payeeName" />
      <van-cell title="收款账号" :value="detail.payeeCardNoMasked" />
      <van-cell title="收款银行" :value="detail.payeeBankName" />
      <van-cell title="交易类型" :value="detail.transType === 1 ? '转账' : '缴费'" />
      <van-cell title="交易流水号" :value="detail.transNo" />
      <van-cell title="交易时间" :value="formatTime(detail.createdAt)" />
      <van-cell title="完成时间" :value="formatTime(detail.completedAt)" v-if="detail.completedAt" />
      <van-cell title="备注" :value="detail.remark || '-'" />
    </van-cell-group>
  </div>
</template>

<script>
import { getTransactionDetail } from '@/api/transaction'

export default {
  name: 'TransactionDetail',
  data() {
    return {
      detail: null
    }
  },
  created() {
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      try {
        const transId = this.$route.params.transId
        const res = await getTransactionDetail(transId)
        this.detail = res
      } catch (e) {}
    },
    formatTime(time) {
      if (!time) return ''
      return time.replace('T', ' ').substring(0, 19)
    }
  }
}
</script>

<style scoped>
.transaction-detail-page {
  min-height: 100%;
  background: var(--bg-color);
}
.detail-header {
  background: var(--card-bg);
  padding: 32px var(--sp-md);
  text-align: center;
  margin-bottom: var(--sp-sm);
}
.status-text {
  font-size: var(--fs-body-md);
  margin-top: var(--sp-xs);
  color: var(--text-secondary);
}
.amount {
  font-size: var(--fs-display-sm);
  font-weight: 500;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
  margin-top: var(--sp-xs);
  color: var(--text-primary);
  line-height: 1;
}
</style>
