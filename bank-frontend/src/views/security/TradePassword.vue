<template>
  <div class="trade-password-page">
    <van-nav-bar :title="isModify ? '修改交易密码' : '设置交易密码'" left-arrow @click-left="$router.back()" />

    <div class="password-area">
      <div class="pwd-label">
        {{ activeField === 'old' ? '请输入旧交易密码' : (activeField === 'new' ? '请输入新交易密码' : '请确认新交易密码') }}
      </div>
      <van-password-input
        :value="activeValue"
        :length="6"
        :gutter="10"
        :focused="showKeyboard"
        @focus="showKeyboard = true"
      />
      <div class="field-tabs" v-if="isModify">
        <div :class="['tab', { active: activeField === 'old' }]" @click="activeField = 'old'">旧密码</div>
        <div :class="['tab', { active: activeField === 'new' }]" @click="activeField = 'new'">新密码</div>
        <div :class="['tab', { active: activeField === 'confirm' }]" @click="activeField = 'confirm'">确认密码</div>
      </div>
    </div>

    <div style="margin: 24px 16px;">
      <van-button round block type="info" :disabled="!canSubmit" @click="onSubmit">
        {{ isModify ? '确认修改' : '确认设置' }}
      </van-button>
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
import { setTradePassword, modifyTradePassword } from '@/api/security'

export default {
  name: 'TradePassword',
  data() {
    return {
      isModify: false,
      password: '',
      confirmPassword: '',
      oldPassword: '',
      activeField: 'new',
      showKeyboard: false
    }
  },
  computed: {
    activeValue() {
      if (this.activeField === 'old') return this.oldPassword
      if (this.activeField === 'new') return this.password
      return this.confirmPassword
    },
    canSubmit() {
      if (this.isModify) {
        return this.password.length === 6 && this.confirmPassword.length === 6 && this.oldPassword.length === 6
      }
      return this.password.length === 6
    }
  },
  created() {
    this.isModify = this.$route.query.modify === '1'
    this.activeField = this.isModify ? 'old' : 'new'
  },
  methods: {
    onInput(key) {
      if (this.activeField === 'old' && this.oldPassword.length < 6) {
        this.oldPassword += key
      } else if (this.activeField === 'new' && this.password.length < 6) {
        this.password += key
      } else if (this.activeField === 'confirm' && this.confirmPassword.length < 6) {
        this.confirmPassword += key
      }
    },
    onDelete() {
      if (this.activeField === 'old') {
        this.oldPassword = this.oldPassword.slice(0, -1)
      } else if (this.activeField === 'new') {
        this.password = this.password.slice(0, -1)
      } else if (this.activeField === 'confirm') {
        this.confirmPassword = this.confirmPassword.slice(0, -1)
      }
    },
    async onSubmit() {
      if (this.isModify) {
        if (this.password !== this.confirmPassword) {
          this.$toast('两次输入的新密码不一致')
          return
        }
        try {
          await modifyTradePassword({
            tradePassword: this.password,
            oldTradePassword: this.oldPassword
          })
          this.$toast.success('修改成功')
          this.$router.back()
        } catch (e) {}
      } else {
        try {
          await setTradePassword({ tradePassword: this.password })
          this.$toast.success('设置成功')
          this.$router.back()
        } catch (e) {}
      }
    }
  }
}
</script>

<style scoped>
.trade-password-page {
  min-height: 100%;
  background: #f5f5f5;
}
.password-area {
  background: #fff;
  padding: 20px 16px;
}
.pwd-label {
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}
.field-tabs {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 16px;
}
.tab {
  padding: 6px 12px;
  font-size: 13px;
  color: #666;
  border-radius: 4px;
  background: #f5f5f5;
}
.tab.active {
  background: #1989fa;
  color: #fff;
}
</style>
