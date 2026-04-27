<template>
  <div class="limit-setting-page">
    <van-nav-bar title="交易限额" left-arrow @click-left="$router.back()" />

    <div class="current-limits" v-if="limits">
      <div class="limit-item">
        <div class="limit-label">单笔转账限额</div>
        <div class="limit-value">{{ limits.singleLimit.toFixed(2) }} 元</div>
      </div>
      <div class="limit-item">
        <div class="limit-label">单日累计限额</div>
        <div class="limit-value">{{ limits.dailyLimit.toFixed(2) }} 元</div>
      </div>
    </div>

    <van-form @submit="onSubmit">
      <van-field
        v-model="form.singleLimit"
        type="number"
        label="单笔限额"
        placeholder="100 - 500000"
        :rules="[{ required: true, message: '请输入单笔限额', trigger: 'onBlur' }]"
      />
      <van-field
        v-model="form.dailyLimit"
        type="number"
        label="单日限额"
        placeholder="1000 - 1000000"
        :rules="[{ required: true, message: '请输入单日限额', trigger: 'onBlur' }]"
      />
      <van-field
        v-model="form.smsCode"
        center
        clearable
        label="验证码"
        placeholder="6位短信验证码"
        maxlength="6"
        :rules="[{ required: true, message: '请输入验证码', trigger: 'onBlur' }]"
      >
        <template #button>
          <van-button size="small" type="primary" native-type="button" :disabled="smsCountdown > 0" @click="sendSmsCode">
            {{ smsCountdown > 0 ? smsCountdown + 's' : '获取验证码' }}
          </van-button>
        </template>
      </van-field>
      <van-field
        v-model="form.tradePassword"
        type="password"
        inputmode="numeric"
        maxlength="6"
        label="交易密码"
        placeholder="6位数字交易密码"
        :rules="[{ required: true, message: '请输入交易密码', trigger: 'onBlur' }]"
      />

      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit" :loading="loading">保存</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { getLimits, updateLimits } from '@/api/security'
import { sendSms } from '@/api/auth'

export default {
  name: 'LimitSetting',
  data() {
    return {
      limits: null,
      form: {
        singleLimit: '',
        dailyLimit: '',
        smsCode: '',
        tradePassword: ''
      },
      loading: false,
      smsCountdown: 0,
      timer: null
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  created() {
    this.loadLimits()
  },
  methods: {
    async loadLimits() {
      try {
        const res = await getLimits()
        this.limits = res
        this.form.singleLimit = res.singleLimit
        this.form.dailyLimit = res.dailyLimit
      } catch (e) {}
    },
    async sendSmsCode() {
      try {
        const phone = this.$store.state.userInfo.phone
        if (!phone) {
          this.$toast('请先登录')
          return
        }
        await sendSms({ phone, type: 'limit' })
        this.$toast('验证码已发送')
        this.smsCountdown = 60
        this.timer = setInterval(() => {
          this.smsCountdown--
          if (this.smsCountdown <= 0) clearInterval(this.timer)
        }, 1000)
      } catch (e) {}
    },
    async onSubmit() {
      this.loading = true
      try {
        await updateLimits({
          singleLimit: Number(this.form.singleLimit),
          dailyLimit: Number(this.form.dailyLimit),
          smsCode: this.form.smsCode,
          tradePassword: this.form.tradePassword
        })
        this.$toast.success('保存成功')
        this.$router.back()
      } catch (e) {} finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.limit-setting-page {
  min-height: 100%;
  background: #f5f5f5;
}
.current-limits {
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
}
.limit-item {
  flex: 1;
  text-align: center;
}
.limit-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.limit-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>
