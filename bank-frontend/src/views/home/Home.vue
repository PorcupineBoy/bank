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

    <!-- AI Feature Buttons -->
    <div class="ai-features">
      <div class="ai-feature-item" @click="$router.push('/ai-chat')">
        <div class="ai-icon ai-chat">
          <van-icon name="chat-o" size="20" color="#fff" />
        </div>
        <span class="ai-text">AI助手</span>
      </div>
      <div class="ai-feature-item" @click="$router.push('/consumption-analysis')">
        <div class="ai-icon ai-analysis">
          <van-icon name="chart-trending-o" size="20" color="#fff" />
        </div>
        <span class="ai-text">消费分析</span>
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
import { listCards } from '@/api/card'
import { logout } from '@/api/auth'

export default {
  name: 'Home',
  data() {
    return {
      showBalance: true,
      totalAssets: 0,
      cards: [],
      refreshing: false
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
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F0F4F8;
  padding-bottom: 20px;
  position: relative;
}
.header {
  background: linear-gradient(135deg, #7BB7F0 0%, #4A90E2 100%);
  padding: 24px 20px 40px;
  color: #fff;
  border-radius: 0 0 24px 24px;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.avatar {
  margin-right: 12px;
}
.name {
  font-size: 18px;
  font-weight: 500;
}
.total-assets .label {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 4px;
}
.total-assets .amount {
  font-size: 36px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}
.eye-icon {
  font-size: 22px;
  opacity: 0.8;
  cursor: pointer;
}
.quick-actions {
  margin: -24px 16px 12px;
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
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
  border-radius: 16px;
  background: #4A90E2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}
.action-text {
  font-size: 13px;
  color: #333;
}
.ai-features {
  margin: 0 16px 12px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.ai-feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: #F5F8FF;
  cursor: pointer;
}
.ai-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-chat { background: linear-gradient(135deg, #7BB7F0, #4A90E2); }
.ai-analysis { background: linear-gradient(135deg, #A78BFA, #7C3AED); }
.ai-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.card-section {
  margin: 0 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #1A1A2E;
}
.section-title .more {
  font-size: 13px;
  color: #4A90E2;
  font-weight: normal;
}
.card-item {
  background: linear-gradient(90deg, #5B9BD5, #4A90E2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  color: #fff;
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.bank-name {
  font-size: 16px;
  font-weight: bold;
}
.card-no {
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.card-type {
  font-size: 12px;
  opacity: 0.9;
}
.empty-tip {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}
.empty-tip span {
  color: #4A90E2;
}
.logout-area {
  text-align: center;
  margin-top: 24px;
}
.ai-float-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7BB7F0, #4A90E2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
  z-index: 99;
  cursor: pointer;
}
</style>
