<template>
  <div class="home-page">
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
          <span v-if="showBalance">{{ totalAssets.toFixed(2) }}</span>
          <span v-else>****</span>
          <van-icon :name="showBalance ? 'eye-o' : 'closed-eye'" @click="toggleBalance" />
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <van-grid :column-num="4" :border="false">
        <van-grid-item icon="balance-pay" text="转账" to="/transfer" />
        <van-grid-item icon="records" text="交易记录" to="/transactions" />
        <van-grid-item icon="card" text="银行卡" to="/cards" />
        <van-grid-item icon="setting-o" text="安全中心" to="/security" />
      </van-grid>
    </div>

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
          <div v-for="card in cards.slice(0, 3)" :key="card.cardId" class="card-item" @click="$router.push('/cards/' + card.cardId)">
            <div class="card-top">
              <span class="bank-name">{{ card.bankName }}</span>
              <van-tag v-if="card.isDefault === 1" type="primary" size="mini">默认</van-tag>
            </div>
            <div class="card-no">{{ card.cardNoMasked }}</div>
            <div class="card-type">{{ card.cardType === 1 ? '借记卡' : '信用卡' }}</div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <div class="logout-area">
      <van-button plain hairline type="danger" size="small" @click="onLogout">退出登录</van-button>
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
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 20px;
}
.header {
  background: linear-gradient(135deg, #1989fa, #3eaf7c);
  padding: 20px 16px 30px;
  color: #fff;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.avatar {
  margin-right: 12px;
}
.name {
  font-size: 16px;
}
.total-assets .label {
  font-size: 12px;
  opacity: 0.9;
}
.total-assets .amount {
  font-size: 32px;
  font-weight: bold;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.total-assets .amount .van-icon {
  font-size: 20px;
  opacity: 0.8;
}
.quick-actions {
  margin: -20px 16px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.card-section {
  margin: 0 16px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
}
.section-title .more {
  font-size: 13px;
  color: #1989fa;
  font-weight: normal;
}
.card-item {
  background: linear-gradient(90deg, #1989fa, #3eaf7c);
  border-radius: 8px;
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
  color: #1989fa;
}
.logout-area {
  text-align: center;
  margin-top: 20px;
}
</style>
