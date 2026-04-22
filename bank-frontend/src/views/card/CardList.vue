<template>
  <div class="card-list-page">
    <van-nav-bar title="我的银行卡" left-arrow @click-left="$router.back()" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="cards.length === 0" class="empty-state">
        <van-empty description="暂无银行卡" />
      </div>
      <div v-else class="cards">
        <div v-for="card in cards" :key="card.cardId" class="card-item" @click="goDetail(card.cardId)">
          <div class="card-header">
            <span class="bank">{{ card.bankName }}</span>
            <van-tag v-if="card.isDefault === 1" type="primary" size="mini">默认</van-tag>
          </div>
          <div class="card-number">{{ card.cardNoMasked }}</div>
          <div class="card-meta">{{ card.cardType === 1 ? '借记卡' : '信用卡' }}</div>
        </div>
      </div>
    </van-pull-refresh>

    <div class="add-btn">
      <van-button round block type="info" icon="plus" @click="$router.push('/cards/bind')">添加银行卡</van-button>
    </div>
  </div>
</template>

<script>
import { listCards } from '@/api/card'

export default {
  name: 'CardList',
  data() {
    return {
      cards: [],
      refreshing: false
    }
  },
  created() {
    this.loadCards()
  },
  methods: {
    async loadCards() {
      try {
        const res = await listCards()
        this.cards = res || []
      } catch (e) {}
    },
    async onRefresh() {
      await this.loadCards()
      this.refreshing = false
    },
    goDetail(cardId) {
      this.$router.push('/cards/' + cardId)
    }
  }
}
</script>

<style scoped>
.card-list-page {
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.cards {
  padding: 12px;
}
.card-item {
  background: linear-gradient(90deg, #1989fa, #3eaf7c);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  color: #fff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.bank {
  font-size: 16px;
  font-weight: bold;
}
.card-number {
  font-size: 20px;
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.card-meta {
  font-size: 12px;
  opacity: 0.9;
}
.add-btn {
  position: fixed;
  bottom: 20px;
  left: 16px;
  right: 16px;
}
.empty-state {
  padding-top: 40px;
}
</style>
