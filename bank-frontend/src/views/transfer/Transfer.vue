<template>
  <div class="transfer-page">
    <van-nav-bar title="转账汇款" left-arrow @click-left="$router.back()" />

    <van-form @submit="onNext">
      <van-cell-group title="付款信息">
        <van-field
          v-model="selectedCardText"
          label="付款卡"
          readonly
          placeholder="请选择付款银行卡"
          :rules="[{ required: true, message: '请选择付款卡' }]"
          @click="showCardPicker = true"
        />
      </van-cell-group>

      <van-cell-group title="收款信息">
        <van-field
          v-model="form.payeeName"
          label="收款人姓名"
          placeholder="请输入收款人姓名"
          :rules="[{ required: true, message: '请输入收款人姓名' }]"
        />
        <van-field
          v-model="form.payeeCardNo"
          label="收款卡号"
          placeholder="请输入收款银行卡号"
          :rules="[{ required: true, message: '请输入收款卡号' }, { pattern: /^\d{13,19}$/, message: '卡号格式错误' }]"
        />
        <van-field
          v-model="form.payeeBankName"
          label="收款银行"
          placeholder="请输入收款银行"
          :rules="[{ required: true, message: '请输入收款银行' }]"
        />
      </van-cell-group>

      <van-cell-group title="转账金额">
        <van-field
          v-model="form.amount"
          type="number"
          label="金额"
          placeholder="请输入转账金额"
          :rules="[{ required: true, message: '请输入金额' }]"
        />
        <van-field
          v-model="form.remark"
          label="备注"
          placeholder="可选"
        />
      </van-cell-group>

      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">下一步</van-button>
      </div>
    </van-form>

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
import { listCards } from '@/api/card'

export default {
  name: 'Transfer',
  data() {
    return {
      cards: [],
      form: {
        cardId: null,
        payeeName: '',
        payeeCardNo: '',
        payeeBankName: '',
        amount: '',
        remark: ''
      },
      selectedCardText: '',
      showCardPicker: false,
      cardColumns: []
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
        this.cardColumns = this.cards.map(c => ({
          text: `${c.bankName} ${c.cardNoMasked}`,
          value: c.cardId
        }))
        const defaultCard = this.cards.find(c => c.isDefault === 1)
        if (defaultCard) {
          this.form.cardId = defaultCard.cardId
          this.selectedCardText = `${defaultCard.bankName} ${defaultCard.cardNoMasked}`
        }
      } catch (e) {}
    },
    onCardConfirm(item) {
      this.form.cardId = item.value
      this.selectedCardText = item.text
      this.showCardPicker = false
    },
    onNext() {
      this.$router.push({
        path: '/transfer/confirm',
        query: { ...this.form, payCardText: this.selectedCardText }
      })
    }
  }
}
</script>

<style scoped>
.transfer-page {
  min-height: 100%;
  background: #f5f5f5;
}
</style>
