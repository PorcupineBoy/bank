<template>
  <div class="home-page">
    <!-- Blue Gradient Header -->
    <div class="header">
      <div class="user-info">
        <div class="avatar">
          <van-icon name="user-circle-o" size="40" color="#fff" />
        </div>
        <div class="name">{{ userInfo.realName || '用户' }}，您好</div>
      </div>
      <div class="total-assets">
        <div class="label">总资产(元)</div>
        <div class="amount">
          <span v-if="showBalance">{{ formatAmount(totalAssets) }}</span>
          <span v-else>****</span>
          <van-icon
            :name="showBalance ? 'eye-o' : 'closed-eye'"
            class="eye-icon"
            @click="toggleBalance"
          />
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="quick-actions">
      <div class="action-item" @click="$router.push('/transfer')">
        <div class="action-icon">
          <van-icon name="balance-pay" size="24" color="#fff" />
        </div>
        <span class="action-text">转账</span>
      </div>
      <div class="action-item" @click="$router.push('/transactions')">
        <div class="action-icon">
          <van-icon name="records" size="24" color="#fff" />
        </div>
        <span class="action-text">交易记录</span>
      </div>
      <div class="action-item" @click="$router.push('/payment')">
        <div class="action-icon">
          <van-icon name="bill-o" size="24" color="#fff" />
        </div>
        <span class="action-text">生活缴费</span>
      </div>
      <div class="action-item" @click="$router.push('/cards')">
        <div class="action-icon">
          <van-icon name="card" size="24" color="#fff" />
        </div>
        <span class="action-text">银行卡</span>
      </div>
      <div class="action-item" @click="$router.push('/security')">
        <div class="action-icon">
          <van-icon name="setting-o" size="24" color="#fff" />
        </div>
        <span class="action-text">安全中心</span>
      </div>
    </div>

    <!-- AI 智能助手（与聊天框一致的内联版） -->
    <div class="ai-chat-section">
      <div class="section-title">
        <span><van-icon name="chat-o" style="margin-right:4px;" />AI 智能助手</span>
        <span class="more" @click="$router.push('/ai-chat')">完整对话</span>
      </div>
      <!-- 模型选择器 -->
      <div class="model-selector">
        <span
          :class="['model-option', homeProvider === 'xiaomi' ? 'active' : '']"
          @click="homeProvider = 'xiaomi'"
        >小米 MiMo</span>
        <span
          :class="['model-option', homeProvider === '' ? 'active' : '']"
          @click="homeProvider = ''"
        >默认</span>
        <span
          :class="['model-option', homeProvider === 'none' ? 'active' : '']"
          @click="homeProvider = 'none'"
        >无大模型</span>
      </div>
      <div class="ai-input-row">
        <div class="quick-tags">
          <span v-for="tag in homeQuickTags" :key="tag" class="tag" @click="homeInputText = tag">{{ tag }}</span>
        </div>
        <div class="home-input-area">
          <van-field
            v-model="homeInputText"
            class="home-chat-input"
            placeholder="输入您的问题..."
            @keyup.enter="sendHomeMessage"
          />
          <van-button
            :disabled="!homeInputText.trim() || homeLoading"
            color="#4A90E2"
            round
            size="small"
            @click="sendHomeMessage"
          >发送</van-button>
        </div>
      </div>
    </div>

    <!-- Bank Card Section -->
    <div class="card-section">
      <div class="section-title">
        <span>我的银行卡</span>
        <span class="more" @click="$router.push('/cards')">查看全部</span>
      </div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="cards.length === 0" class="empty-tip">
          暂无银行卡，<span @click="$router.push('/cards/bind')">去绑定</span>
        </div>
        <div v-else class="card-list">
          <div
            v-for="card in cards.slice(0, 3)"
            :key="card.cardId"
            class="card-item"
            @click="$router.push('/cards/' + card.cardId)"
          >
            <div class="card-top">
              <span class="bank-name">{{ card.bankName }}</span>
              <van-tag v-if="card.isDefault === 1" color="#4A90E2" text-color="#fff" size="mini">默认</van-tag>
            </div>
            <div class="card-no">{{ card.cardNoMasked }}</div>
            <div class="card-type">{{ card.cardType === 1 ? '借记卡' : '信用卡' }}</div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <!-- Logout -->
    <div class="logout-area">
      <van-button
        round
        plain
        color="#4A90E2"
        size="small"
        style="width: 120px"
        @click="onLogout"
      >退出登录</van-button>
    </div>

    <!-- AI Floating Button -->
    <div class="ai-float-btn" @click="$router.push('/ai-chat')">
      <van-icon name="chat-o" size="28" color="#fff" />
    </div>
  </div>
</template>

<script>
import {listCards} from '@/api/card'
import {logout} from '@/api/auth'
import {sendChatMessage} from '@/api/ai'

export default {
  name: 'Home',
  data() {
    return {
      showBalance: true,
      totalAssets: 0,
      cards: [],
      refreshing: false,
      homeProvider: '',
      homeInputText: '',
      homeLoading: false,
      homeQuickTags: ['查余额', '最近交易', '消费分析', '我的银行卡', '转账给张三500元']
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const res = await listCards()
        this.cards = res || []
        let total = 0
        for (const card of this.cards) {
          total += Number(card.balance || 0)
        }
        this.totalAssets = total
      } catch (e) {}
    },
    toggleBalance() {
      this.showBalance = !this.showBalance
    },
    formatAmount(val) {
      return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    async onRefresh() {
      await this.loadData()
      this.refreshing = false
      this.$toast('刷新成功')
    },
    async onLogout() {
      try {
        await this.$dialog.confirm({ message: '确认退出登录？' })
        await logout()
        this.$store.dispatch('logout')
        this.$router.replace('/login')
      } catch (e) {}
    },
    async sendHomeMessage() {
      const text = this.homeInputText.trim()
      if (!text || this.homeLoading) return
      this.homeInputText = ''
      this.homeLoading = true
      try {
        await sendChatMessage({
          content: text,
          sessionId: 'home_' + Date.now(),
          provider: this.homeProvider || undefined
        })
        this.$toast.success('已发送，请前往完整对话查看回复')
      } catch (e) {
        this.$toast.fail('发送失败')
      } finally {
        this.homeLoading = false
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: var(--sp-lg);
  position: relative;
}
.header {
  background: var(--primary-gradient);
  padding: var(--sp-lg) 20px 40px;
  color: var(--text-on-primary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--sp-lg);
}
.avatar {
  margin-right: var(--sp-sm);
}
.name {
  font-size: var(--fs-title-md);
  font-weight: 500;
}
.total-assets .label {
  font-size: var(--fs-caption);
  opacity: 0.85;
  margin-bottom: var(--sp-xxs);
}
.total-assets .amount {
  font-size: var(--fs-display-md);
  font-weight: 500;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1;
}
.eye-icon {
  font-size: 22px;
  opacity: 0.8;
  cursor: pointer;
}
.quick-actions {
  margin: -24px var(--sp-md) var(--sp-sm);
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--sp-lg) var(--sp-md);
  display: flex;
  justify-content: space-around;
  box-shadow: var(--shadow-elevated);
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.action-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-xs);
}
.action-text {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
}
.ai-features {
  margin: 0 var(--sp-md) var(--sp-sm);
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--sp-md);
  display: flex;
  gap: var(--sp-md);
  box-shadow: var(--shadow-card);
}
.ai-feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: var(--sp-sm);
  border-radius: var(--radius-lg);
  background: var(--surface-soft);
  cursor: pointer;
}
.ai-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-chat { background: var(--primary-gradient); }
.ai-analysis { background: linear-gradient(135deg, #A78BFA, #7C3AED); }
.ai-text {
  font-size: var(--fs-body-sm);
  color: var(--text-primary);
  font-weight: 500;
}
.card-section {
  margin: 0 var(--sp-md);
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--sp-md);
  box-shadow: var(--shadow-card);
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);
  font-size: var(--fs-title-sm);
  font-weight: 500;
  color: var(--text-primary);
}
.section-title .more {
  font-size: var(--fs-caption);
  color: var(--primary-color);
  font-weight: 400;
}
.card-item {
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  margin-bottom: 10px;
  color: var(--text-on-primary);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);
}
.bank-name {
  font-size: var(--fs-title-sm);
  font-weight: 500;
}
.card-no {
  font-size: var(--fs-title-lg);
  font-family: var(--font-mono);
  letter-spacing: 2px;
  font-weight: 400;
  margin-bottom: var(--sp-xs);
}
.card-type {
  font-size: var(--fs-caption-sm);
  opacity: 0.9;
}
.empty-tip {
  text-align: center;
  padding: var(--sp-lg);
  color: var(--text-tertiary);
  font-size: var(--fs-body-sm);
}
.empty-tip span {
  color: var(--primary-color);
}
.logout-area {
  text-align: center;
  margin-top: var(--sp-lg);
}
.ai-float-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-elevated);
  z-index: 99;
  cursor: pointer;
}

/* AI 聊天内联样式 */
.ai-chat-section {
  margin: 0 var(--sp-md) var(--sp-sm);
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--sp-md);
  box-shadow: var(--shadow-card);
}
.model-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.model-option {
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  background: var(--card-bg);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.model-option.active {
  border-color: var(--primary-color);
  color: #fff;
  background: var(--primary-color);
}
.ai-input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.home-input-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.home-chat-input {
  flex: 1;
  background: var(--bg-color);
  border-radius: 999px;
  padding: 6px 14px;
}
.home-chat-input ::v-deep .van-field__control {
  font-size: var(--fs-body-sm);
}
.quick-tags {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.tag {
  padding: 2px 10px;
  background: var(--surface-soft);
  color: var(--primary-color);
  font-size: 11px;
  border-radius: 999px;
  white-space: nowrap;
  cursor: pointer;
}
</style>
