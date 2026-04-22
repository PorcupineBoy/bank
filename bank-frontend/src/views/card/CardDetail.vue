<template>
  <div class="card-detail-page">
    <van-nav-bar title="银行卡详情" left-arrow @click-left="$router.back()" />

    <div class="card-info" v-if="card">
      <div class="card-header">
        <span class="bank">{{ card.bankName }}</span>
        <van-tag v-if="card.isDefault === 1" type="primary">默认卡</van-tag>
      </div>
      <div class="card-number">{{ card.cardNoMasked }}</div>
      <div class="card-type">{{ card.cardType === 1 ? '借记卡' : '信用卡' }}</div>
    </div>

    <van-cell-group v-if="card">
      <van-cell title="余额" :value="balance !== null ? balance.toFixed(2) + ' 元' : '点击查询'" is-link @click="queryCardBalance" />
      <van-cell title="设为默认卡" is-link @click="setDefault" v-if="card.isDefault !== 1" />
    </van-cell-group>

    <div class="actions" v-if="card">
      <van-button plain hairline type="danger" block @click="onUnbind">解绑银行卡</van-button>
    </div>

    <van-dialog v-model="showPwdDialog" title="请输入交易密码" show-cancel-button @confirm="confirmUnbind">
      <van-field v-model="tradePassword" type="password" maxlength="6" placeholder="6位交易密码" center />
    </van-dialog>
  </div>
</template>

<script>
import { getCardDetail, setDefaultCard, queryBalance, unbindCard } from '@/api/card'

export default {
  name: 'CardDetail',
  data() {
    return {
      card: null,
      balance: null,
      showPwdDialog: false,
      tradePassword: ''
    }
  },
  created() {
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      try {
        const cardId = this.$route.params.cardId
        const res = await getCardDetail(cardId)
        this.card = res
      } catch (e) {}
    },
    async queryCardBalance() {
      try {
        const res = await queryBalance(this.card.cardId)
        this.balance = Number(res.balance)
      } catch (e) {}
    },
    async setDefault() {
      try {
        await setDefaultCard(this.card.cardId)
        this.$toast.success('设置成功')
        this.loadDetail()
      } catch (e) {}
    },
    async onUnbind() {
      try {
        await this.$dialog.confirm({ message: '确定要解绑该银行卡吗？' })
        this.tradePassword = ''
        this.showPwdDialog = true
      } catch (e) {}
    },
    async confirmUnbind() {
      try {
        await unbindCard(this.card.cardId, { tradePassword: this.tradePassword })
        this.$toast.success('解绑成功')
        this.$router.back()
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.card-detail-page {
  min-height: 100%;
  background: #f5f5f5;
}
.card-info {
  background: linear-gradient(90deg, #1989fa, #3eaf7c);
  padding: 30px 20px;
  color: #fff;
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.bank {
  font-size: 18px;
  font-weight: bold;
}
.card-number {
  font-size: 24px;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.card-type {
  font-size: 14px;
  opacity: 0.9;
}
.actions {
  margin: 24px 16px;
}
</style>
