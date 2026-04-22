<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />

    <div class="form-area">
      <van-form @submit="onRegister">
        <van-field
          v-model="form.phone"
          label="手机号"
          placeholder="请输入手机号"
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
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="登录密码"
          placeholder="8-20位，至少两种字符类型"
          :rules="[{ required: true, message: '请输入密码' }, { validator: validatePassword, message: '密码格式不符合要求' }]"
          :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPassword = !showPassword"
        />
        <van-field
          v-model="form.realName"
          label="真实姓名"
          placeholder="请输入真实姓名"
          :rules="[{ required: true, message: '请输入真实姓名' }]"
        />
        <van-field
          v-model="form.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="[{ required: true, message: '请输入身份证号' }]"
        />

        <div style="margin: 16px;">
          <van-button round block type="info" native-type="submit" :loading="loading">注册</van-button>
        </div>
      </van-form>

      <div class="login-link">
        已有账号？<span @click="$router.push('/login')">去登录</span>
      </div>
    </div>
  </div>
</template>

<script>
import { register, sendSms } from '@/api/auth'
import { isValidLoginPassword } from '@/utils/validate'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        phone: '',
        smsCode: '',
        password: '',
        realName: '',
        idCard: ''
      },
      showPassword: false,
      loading: false,
      smsCountdown: 0,
      timer: null
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    validatePassword(val) {
      return isValidLoginPassword(val)
    },
    async sendSmsCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.$toast('请输入正确的手机号')
        return
      }
      try {
        await sendSms({ phone: this.form.phone, type: 'register' })
        this.$toast('验证码已发送')
        this.smsCountdown = 60
        this.timer = setInterval(() => {
          this.smsCountdown--
          if (this.smsCountdown <= 0) clearInterval(this.timer)
        }, 1000)
      } catch (e) {}
    },
    async onRegister() {
      this.loading = true
      try {
        await register(this.form)
        this.$toast.success('注册成功')
        this.$router.replace('/login')
      } catch (e) {} finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100%;
  background: #fff;
}
.form-area {
  padding: 16px;
}
.login-link {
  text-align: center;
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}
.login-link span {
  color: #1989fa;
}
</style>
