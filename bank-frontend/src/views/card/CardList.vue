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
          <div class="card-number-row">
            <span class="card-number">{{ showFullCards[card.cardId] ? card.cardNo : card.cardNoMasked }}</span>
            <van-icon
              :name="showFullCards[card.cardId] ? 'eye-o' : 'closed-eye'"
              class="eye-icon"
              @click.stop="toggleCardNumber(card.cardId)"
            />
          </div>
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
import {listCards} from '@/api/card'

export default {
  name: 'CardList',
  data() {
    return {
      cards: [],
      refreshing: false,
      showFullCards: {}
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
    },
    toggleCardNumber(cardId) {
      this.$set(this.showFullCards, cardId, !this.showFullCards[cardId])
    }
  }
}
</script>

<style scoped>
.card-list-page {
  min-height: 100%;
  background: var(--bg-color);
  padding-bottom: 80px;
}
.cards {
  padding: var(--sp-sm);
}
.card-item {
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  padding: var(--sp-md);
  margin-bottom: var(--sp-sm);
  color: var(--text-on-primary);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);
}
.bank {
  font-size: var(--fs-title-sm);
  font-weight: 500;
}
.card-number-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--sp-xs);
}
.card-number {
  font-size: var(--fs-title-lg);
  font-family: var(--font-mono);
  letter-spacing: 2px;
  font-weight: 400;
  flex: 1;
}
.card-number-row .eye-icon {
  font-size: 18px;
  padding: 2px 6px;
  cursor: pointer;
  opacity: 0.8;
}
.card-number-row .eye-icon:active {
  opacity: 1;
}
.card-meta {
  font-size: var(--fs-caption-sm);
  opacity: 0.9;
}
.add-btn {
  position: fixed;
  bottom: 20px;
  left: var(--sp-md);
  right: var(--sp-md);
}
.empty-state {
  padding-top: 40px;
}
</style>
