<template>
  <div class="login-page">
    <van-nav-bar title="登录" />
    <div class="logo-area">
      <h2>手机银行</h2>
      <p>安全便捷的移动金融服务</p>
    </div>

    <van-tabs v-model="activeTab" class="login-tabs">
      <van-tab title="密码登录">
        <van-form @submit="onPasswordLogin">
          <van-field
            v-model="form.phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
          />
          <van-field
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="密码"
            placeholder="请输入登录密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="showPassword = !showPassword"
          />
          <div style="margin: 16px;">
            <van-button round block type="info" native-type="submit" :loading="loading">登录</van-button>
          </div>
        </van-form>
      </van-tab>

      <van-tab title="验证码登录">
        <van-form @submit="onSmsLogin">
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
          <div style="margin: 16px;">
            <van-button round block type="info" native-type="submit" :loading="loading">登录</van-button>
          </div>
        </van-form>
      </van-tab>
    </van-tabs>

    <div class="bottom-links">
      <span @click="$router.push('/register')">注册账号</span>
    </div>
  </div>
</template>

<script>
import { loginByPassword, loginBySms, sendSms } from '@/api/auth'

export default {
  name: 'Login',
  data() {
    return {
      activeTab: 0,
      form: {
        phone: '',
        password: '',
        smsCode: ''
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
    async sendSmsCode() {
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.$toast('请输入正确的手机号')
        return
      }
      try {
        await sendSms({ phone: this.form.phone, type: 'login' })
        this.$toast('验证码已发送')
        this.smsCountdown = 60
        this.timer = setInterval(() => {
          this.smsCountdown--
          if (this.smsCountdown <= 0) clearInterval(this.timer)
        }, 1000)
      } catch (e) {
        // error handled by interceptor
      }
    },
    async onPasswordLogin() {
      this.loading = true
      try {
        const res = await loginByPassword({
          phone: this.form.phone,
          password: this.form.password
        })
        this.$store.dispatch('login', res)
        this.$toast.success('登录成功')
        this.$router.replace('/')
      } catch (e) {
        // error handled by interceptor
      } finally {
        this.loading = false
      }
    },
    async onSmsLogin() {
      this.loading = true
      try {
        const res = await loginBySms({
          phone: this.form.phone,
          smsCode: this.form.smsCode
        })
        this.$store.dispatch('login', res)
        this.$toast.success('登录成功')
        this.$router.replace('/')
      } catch (e) {
        // error handled by interceptor
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  background: #fff;
}
.logo-area {
  text-align: center;
  padding: 40px 0 20px;
}
.logo-area h2 {
  margin: 0;
  color: #1989fa;
  font-size: 28px;
}
.logo-area p {
  margin: 8px 0 0;
  color: #999;
  font-size: 14px;
}
.login-tabs {
  padding: 0 16px;
}
.bottom-links {
  text-align: center;
  margin-top: 20px;
  color: #1989fa;
  font-size: 14px;
}
</style>
