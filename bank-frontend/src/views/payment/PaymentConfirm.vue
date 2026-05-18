<template>
  <div class="payment-confirm-page" :style="{ paddingBottom: showKeyboard ? '240px' : '0' }">
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

    <div class="password-area" ref="passwordArea">
      <div class="pwd-label">
        <van-icon name="lock" size="16" style="margin-right:4px;vertical-align:-2px" />
        请输入6位交易密码
      </div>
      <van-password-input
        :value="tradePassword"
        :length="6"
        :gutter="10"
        :focused="showKeyboard"
        @focus="showKeyboard = true"
        @click="showKeyboard = true"
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
  mounted() {
    this.showKeyboard = true
  },
  watch: {
    showKeyboard(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.passwordArea && this.$refs.passwordArea.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
    }
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
  background: var(--bg-color);
}
.confirm-info {
  background: var(--card-bg);
  padding-bottom: var(--sp-sm);
}
.amount {
  text-align: center;
  font-size: var(--fs-display-md);
  font-weight: 500;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
  padding: var(--sp-lg) 0 var(--sp-sm);
  color: var(--text-primary);
  line-height: 1;
}
.amount span {
  font-size: var(--fs-body-md);
  font-weight: 400;
}
.password-area {
  background: var(--card-bg);
  margin-top: var(--sp-sm);
  padding: 20px var(--sp-md);
}
.pwd-label {
  text-align: center;
  margin-bottom: var(--sp-md);
  font-size: var(--fs-body-sm);
  color: var(--text-primary);
  font-weight: 500;
}
.van-password-input {
  margin: 0 auto;
  max-width: 300px;
}
.van-password-input__item {
  border: 1px solid var(--border-color);
  background: var(--surface-soft);
  height: 48px;
  border-radius: var(--radius-xs);
}
.van-password-input__item--focus {
  border-color: var(--primary-color);
  border-width: 2px;
  background: var(--card-bg);
}
</style>
