<template>
  <div class="payment-result-page">
    <div class="result-content">
      <van-icon
        :name="success ? 'checked' : 'clear'"
        :color="success ? 'var(--success-color)' : 'var(--danger-color)'"
        size="60"
      />
      <div class="result-title">{{ success ? '缴费成功' : '缴费失败' }}</div>
      <div class="result-desc" v-if="success">您的缴费已处理完成</div>
      <div class="result-desc" v-else>请检查网络或稍后重试</div>
    </div>

    <div class="actions">
      <van-button round block type="info" @click="$router.replace('/')"
        >返回首页</van-button
      >
      <van-button
        round
        block
        plain
        hairline
        type="default"
        style="margin-top: 12px"
        @click="$router.replace('/transactions')"
        >查看交易记录</van-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentResult',
  computed: {
    success() {
      return this.$route.query.success === '1'
    }
  }
}
</script>

<style scoped>
.payment-result-page {
  min-height: 100%;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
}
.result-content {
  text-align: center;
}
.result-title {
  font-size: var(--fs-title-md);
  font-weight: 500;
  margin-top: var(--sp-md);
  color: var(--text-primary);
}
.result-desc {
  font-size: var(--fs-body-sm);
  color: var(--text-tertiary);
  margin-top: var(--sp-xs);
}
.actions {
  width: 100%;
  padding: 40px var(--sp-xl);
}
</style>
