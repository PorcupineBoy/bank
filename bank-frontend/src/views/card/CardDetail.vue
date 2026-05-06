<template>
  <div class="card-detail-page">
    <van-nav-bar title="银行卡详情" left-arrow @click-left="$router.back()" />

    <div class="card-info" v-if="card">
      <div class="card-header">
        <span class="bank">{{ card.bankName }}</span>
        <van-tag v-if="card.isDefault === 1" type="primary">默认卡</van-tag>
      </div>
      <div class="card-number-row">
        <span class="card-number">{{ showFullCard ? card.cardNo : card.cardNoMasked }}</span>
        <van-icon
          :name="showFullCard ? 'eye-o' : 'closed-eye'"
          class="eye-icon"
          @click="showFullCard = !showFullCard"
        />
      </div>
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
import {getCardDetail, queryBalance, setDefaultCard, unbindCard} from '@/api/card'

export default {
  name: 'CardDetail',
  data() {
    return {
      card: null,
      balance: null,
      showPwdDialog: false,
      tradePassword: '',
      showFullCard: false
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
  background: var(--bg-color);
}
.card-info {
  background: var(--primary-gradient);
  padding: 32px 20px;
  color: var(--text-on-primary);
  margin-bottom: var(--sp-sm);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-md);
}
.bank {
  font-size: var(--fs-title-md);
  font-weight: 500;
}
.card-number-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--sp-xs);
}
.card-number-row .card-number {
  font-size: var(--fs-display-sm);
  font-family: var(--font-mono);
  letter-spacing: 2px;
  font-weight: 400;
  flex: 1;
}
.card-number-row .eye-icon {
  font-size: 22px;
  padding: 4px 8px;
  cursor: pointer;
  opacity: 0.8;
}
.card-number-row .eye-icon:active {
  opacity: 1;
}
.card-type {
  font-size: var(--fs-body-sm);
  opacity: 0.9;
}
.actions {
  margin: var(--sp-lg) var(--sp-md);
}
</style>
