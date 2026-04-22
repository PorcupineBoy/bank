<template>
  <div class="card-bind-page">
    <van-nav-bar title="绑定银行卡" left-arrow @click-left="$router.back()" />

    <div class="form-area">
      <van-form @submit="onBind" validate-first>
        <van-field
          v-model="form.cardNo"
          label="银行卡号"
          placeholder="请输入银行卡号"
          maxlength="19"
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
          maxlength="18"
          :rules="[{ required: true, message: '请输入身份证号' }, { validator: validateIdCard, message: '身份证号格式错误' }]"
        />
        <van-field
          v-model="form.reservedPhone"
          label="银行预留手机号"
          placeholder="请输入银行预留手机号"
          maxlength="11"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
        />
        <van-field
          v-model="form.smsCode"
          center
          clearable
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button size="small" type="primary" :disabled="smsCountdown > 0" @click="sendSmsCode">
              {{ smsCountdown > 0 ? smsCountdown + 's' : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="bankNameText"
          label="开户银行"
          readonly
          placeholder="请选择开户银行"
          is-link
          :rules="[{ required: true, message: '请选择开户银行' }]"
          @click="showBankPicker = true"
        />
        <van-popup v-model="showBankPicker" position="bottom">
          <van-picker
            show-toolbar
            :columns="bankColumns"
            @confirm="onBankConfirm"
            @cancel="showBankPicker = false"
          />
        </van-popup>
        <van-field
          v-model="cardTypeText"
          label="卡类型"
          readonly
          placeholder="请选择卡类型"
          is-link
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
          <van-button round block type="info" native-type="submit" :loading="loading">确认绑定</van-button>
        </div>
      </van-form>
    </div>

    <!-- 绑定成功提示 -->
    <van-dialog v-model="showSuccess" title="绑定成功" :show-confirm-button="true" @confirm="onSuccessConfirm">
      <div class="success-content">
        <van-icon name="checked" size="48" color="#07c160" />
        <p>银行卡绑定成功！</p>
        <p class="success-card">{{ bindResult.cardNoMasked }}</p>
      </div>
    </van-dialog>
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
      bankNameText: '',
      showBankPicker: false,
      bankColumns: [
        '中国工商银行', '中国建设银行', '中国农业银行', '中国银行',
        '交通银行', '招商银行', '浦发银行', '中信银行',
        '光大银行', '华夏银行', '民生银行', '兴业银行',
        '广发银行', '平安银行', '北京银行', '上海银行'
      ],
      cardTypeText: '',
      showTypePicker: false,
      cardTypeColumns: [
        { text: '借记卡', value: 1 },
        { text: '信用卡', value: 2 }
      ],
      loading: false,
      smsCountdown: 0,
      timer: null,
      showSuccess: false,
      bindResult: {}
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    validateIdCard(val) {
      // 15位或18位身份证号校验
      return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(val)
    },
    onBankConfirm(value, index) {
      // Vant 2 Picker: 文本列返回字符串，对象列返回对象
      if (typeof value === 'string') {
        this.form.bankName = value
        this.bankNameText = value
      } else if (value && typeof value === 'object') {
        this.form.bankName = value.text || value
        this.bankNameText = value.text || value
      }
      this.showBankPicker = false
    },
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
        const res = await bindCard(this.form)
        this.bindResult = res || {}
        this.showSuccess = true
      } catch (e) {} finally {
        this.loading = false
      }
    },
    onSuccessConfirm() {
      this.$router.replace('/cards')
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
.success-content {
  text-align: center;
  padding: 20px 0;
}
.success-content p {
  margin: 8px 0 0;
  font-size: 16px;
  color: #333;
}
.success-content .success-card {
  font-size: 14px;
  color: #999;
  letter-spacing: 1px;
}
</style>
