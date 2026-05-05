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
          :rules="[{ required: true, message: '请选择付款卡', trigger: 'onBlur' }]"
          @click="showCardPicker = true"
        />
      </van-cell-group>

      <van-cell-group title="收款信息">
        <van-field
          v-model="form.payeeName"
          label="收款人姓名"
          :rules="[{ required: true, message: '请输入收款人姓名', trigger: 'onBlur' }]"
          clearable
          placeholder="输入姓名自动查询银行卡"
          @clear="onPayeeNameClear"
          @input="onPayeeNameInput"
        />
        <van-field
          v-model="form.payeeCardNo"
          label="收款卡号"
          placeholder="请输入收款银行卡号"
          :rules="[{ required: true, message: '请输入收款卡号', trigger: 'onBlur' }, { pattern: /^\d{13,19}$/, message: '卡号格式错误', trigger: 'onBlur' }]"
        />
        <van-field
          v-model="form.payeeBankName"
          label="收款银行"
          placeholder="请输入收款银行"
          :rules="[{ required: true, message: '请输入收款银行', trigger: 'onBlur' }]"
        />
      </van-cell-group>

      <van-cell-group title="转账金额">
        <van-field
          v-model="form.amount"
          type="number"
          label="金额"
          placeholder="请输入转账金额"
          :rules="[{ required: true, message: '请输入金额', trigger: 'onBlur' }]"
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

    <!-- 付款卡选择器 -->
    <van-popup v-model="showCardPicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="cardColumns"
        @confirm="onCardConfirm"
        @cancel="showCardPicker = false"
      />
    </van-popup>

    <!-- 收款人银行卡查询结果 -->
    <van-popup
      v-model="showLookupPopup"
      closeable
      position="bottom"
      round
      title="选择收款卡"
      @closed="lookupResults = []"
    >
      <div class="lookup-title">请选择收款银行卡</div>
      <van-cell
        v-for="item in lookupResults"
        :key="item.cardId"
        :label="item.bankName + ' ' + item.cardNoMasked"
        :title="item.realName"
        is-link
        @click="onSelectLookupResult(item)"
      />
      <div v-if="lookupResults.length === 0" class="lookup-empty">
        未找到匹配的银行卡
      </div>
    </van-popup>
  </div>
</template>

<script>
import {listCards, lookupCardsByName} from '@/api/card'

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
      cardColumns: [],
      showLookupPopup: false,
      lookupResults: [],
      lookupTimer: null
    }
  },
  created() {
    this.loadCards()
  },
  beforeDestroy() {
    if (this.lookupTimer) clearTimeout(this.lookupTimer)
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
    onPayeeNameInput() {
      // 防抖：用户停止输入 300ms 后发起查询
      if (this.lookupTimer) clearTimeout(this.lookupTimer)
      this.lookupTimer = setTimeout(() => {
        this.doLookup()
      }, 300)
    },
    onPayeeNameClear() {
      // 清空收款人姓名时，同时清空卡号和银行
      this.form.payeeCardNo = ''
      this.form.payeeBankName = ''
      this.lookupResults = []
      this.showLookupPopup = false
    },
    async doLookup() {
      const name = (this.form.payeeName || '').trim()
      if (name.length < 2) {
        this.showLookupPopup = false
        return
      }
      try {
        const res = await lookupCardsByName(name)
        this.lookupResults = res || []
        if (this.lookupResults.length > 0) {
          this.showLookupPopup = true
        }
      } catch (e) {
        this.lookupResults = []
        this.showLookupPopup = false
      }
    },
    onSelectLookupResult(item) {
      // 选中结果后自动填充收款信息
      this.form.payeeName = item.realName
      this.form.payeeCardNo = item.cardNoMasked
      this.form.payeeBankName = item.bankName
      this.showLookupPopup = false
      this.$toast('已选择 ' + item.realName + ' 的 ' + item.bankName + ' 卡')
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
.lookup-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 16px 0 8px;
}
.lookup-empty {
  text-align: center;
  font-size: 14px;
  color: #999;
  padding: 24px 0;
}
</style>
