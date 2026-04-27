<template>
  <div class="payment-confirm-page">
    <van-nav-bar title="缴费确认" left-arrow @click-left="$router.back()" />

    <div class="confirm-info">
      <div class="amount">
        {{ Number($route.query.amount).toFixed(2) }} <span>元</span>
      </div>
      <van-cell-group>
        <van-cell title="缴费类型" :value="$route.query.typeName" />
        <van-cell title="户号" :value="$route.query.accountNo" />
        <van-cell title="户名" :value="$route.query.accountName" />
        <van-cell title="账期" :value="$route.query.period" />
        <van-cell
          title="付款卡"
          :value="payCardText"
          is-link
          @click="showCardPicker = true"
        />
      </van-cell-group>
    </div>

    <van-checkbox v-model="saveAccount" style="margin: 12px 16px"
      >保存为常用缴费户号</van-checkbox
    >

    <div class="password-area">
      <div class="pwd-label">请输入交易密码</div>
      <van-password-input
        :value="tradePassword"
        :length="6"
        :gutter="10"
        :focused="showKeyboard"
        @focus="showKeyboard = true"
      />
    </div>

    <div style="margin: 24px 16px">
      <van-button
        round
        block
        type="info"
        :loading="submitting"
        :disabled="tradePassword.length !== 6 || !cardId"
        @click="onSubmit"
      >
        确认缴费
      </van-button>
    </div>

    <van-number-keyboard
      :show="showKeyboard"
      @input="onInput"
      @delete="onDelete"
      @blur="showKeyboard = false"
    />

    <van-popup v-model="showCardPicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="cardColumns"
        @confirm="onCardConfirm"
        @cancel="showCardPicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
import { payBill } from '@/api/transaction'
import { listCards } from '@/api/card'

export default {
  name: 'PaymentConfirm',
  data() {
    return {
      cards: [],
      cardId: null,
      payCardText: '',
      showCardPicker: false,
      cardColumns: [],
      tradePassword: '',
      showKeyboard: false,
      submitting: false,
      saveAccount: false
    }
  },
  created() {
    this.loadCards()
  },
  methods: {
    async loadCards() {
      try {
        const res = await listCards()
        this.cards = res || []
        this.cardColumns = this.cards.map((c) => ({
          text: `${c.bankName} ${c.cardNoMasked}`,
          value: c.cardId
        }))
        const defaultCard = this.cards.find((c) => c.isDefault === 1)
        if (defaultCard) {
          this.cardId = defaultCard.cardId
          this.payCardText = `${defaultCard.bankName} ${defaultCard.cardNoMasked}`
        }
      } catch (e) {}
    },
    onCardConfirm(item) {
      this.cardId = item.value
      this.payCardText = item.text
      this.showCardPicker = false
    },
    onInput(key) {
      if (this.tradePassword.length < 6) {
        this.tradePassword += key
      }
    },
    onDelete() {
      this.tradePassword = this.tradePassword.slice(0, -1)
    },
    async onSubmit() {
      if (this.tradePassword.length !== 6) return
      this.submitting = true
      try {
        const q = this.$route.query
        const res = await payBill({
          paymentType: Number(q.paymentType),
          accountNo: q.accountNo,
          accountName: q.accountName,
          cardId: this.cardId,
          amount: q.amount,
          tradePassword: this.tradePassword,
          saveAccount: this.saveAccount
        })
        this.$router.replace({
          path: '/payment/result',
          query: { success: '1', transId: res.transId }
        })
      } catch (e) {
        this.$router.replace({
          path: '/payment/result',
          query: { success: '0' }
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.payment-confirm-page {
  min-height: 100%;
  background: #f5f5f5;
}
.confirm-info {
  background: #fff;
  padding-bottom: 12px;
}
.amount {
  text-align: center;
  font-size: 40px;
  font-weight: bold;
  padding: 24px 0 12px;
  color: #333;
}
.amount span {
  font-size: 16px;
  font-weight: normal;
}
.password-area {
  background: #fff;
  margin-top: 12px;
  padding: 20px 16px;
}
.pwd-label {
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}
</style>
