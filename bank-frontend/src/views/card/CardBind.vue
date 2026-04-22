<template>
  <div class="card-bind-page">
    <van-nav-bar title="绑定银行卡" left-arrow @click-left="$router.back()" />

    <div class="form-area">
      <van-form @submit="onBind">
        <van-field
          v-model="form.cardNo"
          label="银行卡号"
          placeholder="请输入银行卡号"
          :rules="[{ required: true, message: '请输入银行卡号' }, { pattern: /^\d{13,19}$/, message: '卡号格式错误' }]"
        />
        <van-field
          v-model="form.cardHolderName"
          label="持卡人姓名"
          placeholder="请输入持卡人姓名"
          :rules="[{ required: true, message: '请输入持卡人姓名' }]"
        />
        <van-field
          v-model="form.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="[{ required: true, message: '请输入身份证号' }]"
        />
        <van-field
          v-model="form.reservedPhone"
          label="银行预留手机号"
          placeholder="请输入银行预留手机号"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
        />
        <van-field
          v-model="form.smsCode"
          center
          clearable
          label="验证码"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button size="small" type="primary" :disabled="smsCountdown > 0" @click="sendSmsCode">
              {{ smsCountdown > 0 ? smsCountdown + 's' : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="form.bankName"
          label="开户银行"
          placeholder="请输入开户银行名称"
          :rules="[{ required: true, message: '请输入开户银行' }]"
        />
        <van-field
          v-model="cardTypeText"
          label="卡类型"
          readonly
          placeholder="请选择卡类型"
          :rules="[{ required: true, message: '请选择卡类型' }]"
          @click="showTypePicker = true"
        />
        <van-popup v-model="showTypePicker" position="bottom">
          <van-picker
            show-toolbar
            :columns="cardTypeColumns"
            @confirm="onTypeConfirm"
            @cancel="showTypePicker = false"
          />
        </van-popup>

        <div style="margin: 16px;">
          <van-button round block type="info" native-type="submit" :loading="loading">绑定</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import { bindCard } from '@/api/card'
import { sendSms } from '@/api/auth'

export default {
  name: 'CardBind',
  data() {
    return {
      form: {
        cardNo: '',
        cardHolderName: '',
        idCard: '',
        reservedPhone: '',
        smsCode: '',
        bankName: '',
        cardType: null
      },
      cardTypeText: '',
      showTypePicker: false,
      cardTypeColumns: [
        { text: '借记卡', value: 1 },
        { text: '信用卡', value: 2 }
      ],
      loading: false,
      smsCountdown: 0,
      timer: null
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    onTypeConfirm(item, index) {
      // Vant 2 Picker @confirm: 对象列返回完整对象，取 value/text 字段
      if (item && typeof item === 'object') {
        this.form.cardType = item.value
        this.cardTypeText = item.text
      } else {
        this.form.cardType = item
        this.cardTypeText = this.cardTypeColumns[index] ? this.cardTypeColumns[index].text : ''
      }
      this.showTypePicker = false
    },
    async sendSmsCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.reservedPhone)) {
        this.$toast('请输入正确的手机号')
        return
      }
      try {
        await sendSms({ phone: this.form.reservedPhone, type: 'bind' })
        this.$toast('验证码已发送')
        this.smsCountdown = 60
        this.timer = setInterval(() => {
          this.smsCountdown--
          if (this.smsCountdown <= 0) clearInterval(this.timer)
        }, 1000)
      } catch (e) {}
    },
    async onBind() {
      this.loading = true
      try {
        await bindCard(this.form)
        this.$toast.success('绑定成功')
        this.$router.back()
      } catch (e) {} finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.card-bind-page {
  min-height: 100%;
  background: #fff;
}
.form-area {
  padding: 16px;
}
</style>
