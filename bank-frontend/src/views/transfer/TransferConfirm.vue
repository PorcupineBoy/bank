<template>
  <div class="transfer-confirm-page">
    <van-nav-bar title="确认转账" left-arrow @click-left="$router.back()" />

    <div class="confirm-info">
      <div class="amount">{{ Number($route.query.amount).toFixed(2) }} <span>元</span></div>
      <van-cell-group>
        <van-cell title="付款卡" :value="$route.query.payCardText" />
        <van-cell title="收款人" :value="$route.query.payeeName" />
        <van-cell title="收款账号" :value="maskCardNo($route.query.payeeCardNo)" />
        <van-cell title="收款银行" :value="$route.query.payeeBankName" />
        <van-cell title="备注" :value="$route.query.remark || '-'" />
      </van-cell-group>
    </div>

    <van-notice-bar v-if="isLargeAmount" color="#ed6a0c" background="#fffbe8" left-icon="volume-o">
      大额转账提醒：单笔转账金额超过1万元，请仔细核对收款信息
    </van-notice-bar>

    <div class="password-area">
      <div class="pwd-label">请输入交易密码</div>
      <van-password-input
        :value="tradePassword"
        :length="6"
        :gutter="10"
        :focused="showKeyboard"
        @focus="showKeyboard = true"
        @click="showKeyboard = true"
      />
    </div>

    <div style="margin: 24px 16px;">
      <van-button round block type="info" :loading="submitting" :disabled="tradePassword.length !== 6" @click="onSubmit">确认转账</van-button>
    </div>

    <van-number-keyboard
      :show="showKeyboard"
      @input="onInput"
      @delete="onDelete"
      @blur="showKeyboard = false"
    />
  </div>
</template>

<script>
import { transfer } from '@/api/transaction'
import { maskCardNo } from '@/utils/validate'

export default {
  name: 'TransferConfirm',
  data() {
    return {
      tradePassword: '',
      showKeyboard: false,
      submitting: false
    }
  },
  mounted() {
    this.showKeyboard = true
  },
  computed: {
    isLargeAmount() {
      return Number(this.$route.query.amount) >= 10000
    }
  },
  methods: {
    maskCardNo,
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
        const query = this.$route.query
        const res = await transfer({
          cardId: Number(query.cardId),
          payeeName: query.payeeName,
          payeeCardNo: query.payeeCardNo,
          payeeBankName: query.payeeBankName,
          amount: query.amount,
          remark: query.remark,
          tradePassword: this.tradePassword
        })
        this.$router.replace({
          path: '/transfer/result',
          query: { success: '1', transId: res.transId }
        })
      } catch (e) {
        this.$router.replace({
          path: '/transfer/result',
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
.transfer-confirm-page {
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
.van-password-input {
  margin: 0 auto;
  max-width: 300px;
}
.van-password-input__item {
  border: 1px solid #c8c9cc;
  background: #fafafa;
  height: 48px;
  border-radius: 4px;
}
.van-password-input__item--focus {
  border-color: #1989fa;
  background: #fff;
}
</style>
