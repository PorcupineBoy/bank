<template>
  <div class="chat-page">
    <van-nav-bar title="AI智能助手" left-arrow @click-left="$router.back()" fixed />

    <div class="chat-container" ref="chatContainer">
      <div class="welcome-msg">
        <div class="ai-avatar">
          <van-icon name="chat-o" size="24" color="#fff" />
        </div>
        <div class="welcome-bubble">
          <p>您好！我是您的智能银行助手🤖</p>
          <p style="margin-top:4px;font-size:13px;color:#666;">
            我可以帮您查余额、查交易记录、转账汇款、消费分析等
          </p>
        </div>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.messageId"
        :class="['msg-row', msg.role === 1 ? 'user' : 'ai']"
      >
        <div v-if="msg.role === 2" class="ai-avatar">
          <van-icon name="chat-o" size="20" color="#fff" />
        </div>
        <div class="msg-bubble">
          <pre class="msg-text">{{ msg.content }}</pre>
          <div class="msg-time">{{ formatMsgTime(msg.createdAt) }}</div>

          <!-- MCP-Skill 结构化卡片渲染 -->
          <div v-if="msg.role === 2 && msg.functionCalled && msg.functionCalled.startsWith('{')" class="mcp-cards">
            <!-- 余额卡片 -->
            <div v-if="skillData(msg).type === 'balance_card'" class="mcp-card balance-card">
              <div class="card-title">
                <van-icon name="balance-o" color="#4A90E2" />
                资产概览
              </div>
              <div class="total-balance">
                ¥{{ formatAmount(skillData(msg).data?.totalBalance) }}
              </div>
              <div class="card-subtitle">共{{ skillData(msg).data?.cardCount }}张银行卡</div>
              <div v-for="item in skillData(msg).items" :key="item.cardId" class="card-item">
                <span>{{ item.bankName }} {{ item.cardTypeLabel }}</span>
                <span class="card-balance">¥{{ formatAmount(item.balance) }}</span>
              </div>
            </div>

            <!-- 交易列表卡片 -->
            <div v-if="skillData(msg).type === 'transaction_list'" class="mcp-card trans-card">
              <div class="card-title">
                <van-icon name="records-o" color="#4A90E2" />
                交易记录（共{{ skillData(msg).data?.total }}笔）
              </div>
              <div v-for="item in skillData(msg).items" :key="item.transId" class="trans-item" @click="$router.push('/transactions/' + item.transId)">
                <div class="trans-left">
                  <div class="trans-type">{{ item.transTypeLabel }}</div>
                  <div class="trans-time">{{ formatTime(item.createdAt) }}</div>
                </div>
                <div class="trans-mid">
                  <div v-if="item.payeeName" class="trans-payee">{{ item.payeeName }}</div>
                  <div v-if="item.remark" class="trans-remark">{{ item.remark }}</div>
                </div>
                <div class="trans-right">
                  <div :class="['trans-amount', item.transType === 3 ? 'income' : 'expense']">
                    {{ item.amountDisplay }}
                  </div>
                  <div class="trans-status">{{ item.statusLabel }}</div>
                </div>
              </div>
            </div>

            <!-- 转账预确认卡片 -->
            <div v-if="skillData(msg).type === 'transfer_preview'" class="mcp-card transfer-preview-card">
              <div class="card-title">
                <van-icon name="exchange" color="var(--success-color)" />
                转账确认
              </div>
              <div class="preview-row">
                <span class="preview-label">收款人</span>
                <span class="preview-value">{{ skillData(msg).data?.payeeName }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-label">金额</span>
                <span class="preview-value amount-highlight">¥{{ formatAmount(skillData(msg).data?.amount) }}</span>
              </div>
              <div class="preview-row" v-if="skillData(msg).data?.bankName && skillData(msg).data?.bankName !== '未指定'">
                <span class="preview-label">收款行</span>
                <span class="preview-value">{{ skillData(msg).data?.bankName }}</span>
              </div>
              <van-button
                round
                block
                color="var(--success-color)"
                class="confirm-btn"
                @click="goTransfer(skillData(msg).data)"
              >
                去转账
              </van-button>
            </div>

            <!-- 银行卡列表卡片 -->
            <div v-if="skillData(msg).type === 'card_list'" class="mcp-card card-list-card">
              <div class="card-title">
                <van-icon name="card-o" color="#4A90E2" />
                我的银行卡
              </div>
              <div v-for="item in skillData(msg).items" :key="item.cardId" class="card-mini-item">
                <span>{{ item.bankName }} {{ item.cardNoMasked }}</span>
                <span v-if="item.isDefault" class="default-badge">默认</span>
              </div>
            </div>
          </div>

          <!-- 传统按钮（兼容旧模式） -->
          <div v-if="msg.role === 2 && msg.functionCalled && !msg.functionCalled.startsWith('{')" class="msg-action">
            <van-button
              v-if="msg.content && msg.content.includes('去转账')"
              size="mini"
              round
              color="var(--success-color)"
              @click="$router.push('/transfer')"
            >去转账</van-button>
            <van-button
              v-if="msg.content && msg.content.includes('交易记录')"
              size="mini"
              round
              color="#4A90E2"
              @click="$router.push('/transactions')"
            >查看交易记录</van-button>
            <van-button
              v-if="msg.content && msg.content.includes('消费分析')"
              size="mini"
              round
              color="#4A90E2"
              @click="$router.push('/consumption-analysis')"
            >消费分析</van-button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="msg-row ai">
        <div class="ai-avatar">
          <van-icon name="chat-o" size="20" color="#fff" />
        </div>
        <div class="msg-bubble typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="quick-tags">
        <span
          v-for="tag in quickTags"
          :key="tag"
          class="tag"
          @click="sendQuick(tag)"
        >{{ tag }}</span>
      </div>
      <div class="input-row">
        <van-field
          v-model="inputText"
          placeholder="输入您的问题..."
          class="chat-input"
          @keyup.enter="sendMessage"
        />
        <van-button
          round
          color="#4A90E2"
          size="small"
          :disabled="!inputText.trim() || loading"
          @click="sendMessage"
        >发送</van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { sendChatMessage, getChatHistory, newChatSession } from '@/api/ai'

export default {
  name: 'AiChat',
  data() {
    return {
      sessionId: '',
      messages: [],
      inputText: '',
      loading: false,
      quickTags: ['查余额', '最近交易', '消费分析', '我的银行卡', '转账给张三500元']
    }
  },
  created() {
    this.initSession()
  },
  updated() {
    this.scrollToBottom()
  },
  methods: {
    async initSession() {
      try {
        this.sessionId = await newChatSession({})
        this.loadHistory()
      } catch (e) {
        this.sessionId = 'session_' + Date.now()
      }
    },
    async loadHistory() {
      try {
        const list = await getChatHistory({ sessionId: this.sessionId, limit: 50 })
        this.messages = list || []
      } catch (e) {}
    },
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.loading) return
      this.inputText = ''
      this.loading = true

      try {
        const res = await sendChatMessage({
          content: text,
          sessionId: this.sessionId
        })
        if (res && res.sessionId) {
          this.sessionId = res.sessionId
        }
        await this.loadHistory()
      } catch (e) {
        this.$toast.fail('发送失败')
      } finally {
        this.loading = false
      }
    },
    sendQuick(tag) {
      this.inputText = tag
      this.sendMessage()
    },
    scrollToBottom() {
      const el = this.$refs.chatContainer
      if (el) {
        // Wait for DOM to settle, then scroll to bottom
        setTimeout(() => {
          el.scrollTop = el.scrollHeight
        }, 50)
      }
    },
    // 解析 MCP-Skill 结构化数据
    skillData(msg) {
      if (!msg.functionCalled || !msg.functionCalled.startsWith('{')) return {}
      try {
        const parsed = JSON.parse(msg.functionCalled)
        return parsed.structuredData || {}
      } catch (e) {
        return {}
      }
    },
    formatAmount(val) {
      if (val === null || val === undefined) return '0.00'
      const num = typeof val === 'string' ? parseFloat(val) : val
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.substring(0, 10)
    },
    formatMsgTime(timeStr) {
      if (!timeStr) return ''
      // timeStr format: "2026-05-06T14:30:00" or "2026-05-06T14:30:00.000"
      const d = new Date(timeStr)
      if (isNaN(d.getTime())) return timeStr.substring(0, 16)
      const pad = n => String(n).padStart(2, '0')
      const now = new Date()
      const isToday = d.getFullYear() === now.getFullYear() &&
                      d.getMonth() === now.getMonth() &&
                      d.getDate() === now.getDate()
      if (isToday) {
        return pad(d.getHours()) + ':' + pad(d.getMinutes())
      }
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
             pad(d.getHours()) + ':' + pad(d.getMinutes())
    },
    goTransfer(data) {
      if (!data) {
        this.$router.push('/transfer')
        return
      }
      // 携带参数跳转转账页
      this.$router.push({
        path: '/transfer',
        query: {
          payeeName: data.payeeName || '',
          amount: data.amount || '',
          bankName: data.bankName || ''
        }
      })
    }
  }
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
  padding-top: 46px;
  box-sizing: border-box;
}
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-md);
}
.welcome-msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--sp-md);
}
.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}
.welcome-bubble {
  background: var(--card-bg);
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-lg);
  border-top-left-radius: var(--radius-xs);
  font-size: var(--fs-body-sm);
  color: var(--text-primary);
  max-width: 75%;
  box-shadow: var(--shadow-card);
}
.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--sp-md);
}
.msg-row.user {
  justify-content: flex-end;
}
.msg-row.user .msg-bubble {
  background: var(--primary-color);
  color: var(--text-on-primary);
  border-top-right-radius: var(--radius-xs);
}
.msg-bubble {
  background: var(--card-bg);
  padding: 10px 14px;
  border-radius: var(--radius-lg);
  border-top-left-radius: var(--radius-xs);
  font-size: var(--fs-body-sm);
  color: var(--text-primary);
  max-width: 80%;
  box-shadow: var(--shadow-card);
  word-break: break-word;
}
.msg-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
}
.msg-time {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 6px;
  text-align: right;
}
.msg-row.user .msg-time {
  color: var(--text-on-dark-soft);
}
.msg-action {
  margin-top: var(--sp-xs);
  display: flex;
  gap: var(--sp-xs);
  flex-wrap: wrap;
}
.typing {
  display: flex;
  align-items: center;
  gap: var(--sp-xxs);
  padding: 14px var(--sp-md);
}
.dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: var(--radius-full);
  animation: bounce 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
.input-area {
  background: var(--card-bg);
  padding: 10px var(--sp-md) var(--sp-md);
  border-top: 1px solid var(--border-soft);
}
.quick-tags {
  display: flex;
  gap: var(--sp-xs);
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: var(--sp-xxs);
}
.tag {
  padding: var(--sp-xxs) var(--sp-sm);
  background: var(--surface-soft);
  color: var(--primary-color);
  font-size: var(--fs-caption-sm);
  border-radius: var(--radius-lg);
  white-space: nowrap;
  cursor: pointer;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-input {
  flex: 1;
  background: var(--bg-color);
  border-radius: var(--radius-pill);
  padding: 6px 14px;
}
.chat-input ::v-deep .van-field__control {
  font-size: var(--fs-body-sm);
}

/* MCP-Skill 结构化卡片样式 */
.mcp-cards {
  margin-top: 10px;
}
.mcp-card {
  background: var(--surface-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--sp-sm);
  margin-top: var(--sp-xxs);
}
.card-title {
  font-size: var(--fs-caption);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--sp-xs);
  display: flex;
  align-items: center;
  gap: 6px;
}
.total-balance {
  font-size: var(--fs-display-sm);
  font-weight: 500;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
  color: var(--primary-color);
  margin-bottom: 2px;
  line-height: 1;
}
.card-subtitle {
  font-size: var(--fs-caption-sm);
  color: var(--text-tertiary);
  margin-bottom: 10px;
}
.card-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: var(--fs-caption);
  border-top: 1px solid var(--border-soft);
}
.card-balance {
  font-weight: 500;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

/* 交易卡片 */
.trans-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-xs) 0;
  border-top: 1px solid var(--border-soft);
  cursor: pointer;
}
.trans-left {
  flex: 0 0 auto;
}
.trans-type {
  font-size: var(--fs-caption);
  font-weight: 500;
  color: var(--text-primary);
}
.trans-time {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
.trans-mid {
  flex: 1;
  text-align: center;
  padding: 0 var(--sp-xs);
}
.trans-payee {
  font-size: var(--fs-caption-sm);
  color: var(--text-secondary);
}
.trans-remark {
  font-size: 11px;
  color: var(--text-tertiary);
}
.trans-right {
  text-align: right;
}
.trans-amount {
  font-size: var(--fs-body-sm);
  font-weight: 500;
  font-family: var(--font-mono);
}
.trans-amount.expense {
  color: var(--text-primary);
}
.trans-amount.income {
  color: var(--success-color);
}
.trans-status {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* 转账预确认卡片 */
.transfer-preview-card {
  background: #f0faf0;
  border-color: #b7e4b7;
}
.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: var(--fs-body-sm);
}
.preview-label {
  color: var(--text-secondary);
}
.preview-value {
  font-weight: 500;
  color: var(--text-primary);
}
.amount-highlight {
  color: var(--danger-color);
  font-size: var(--fs-title-md);
  font-weight: 500;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.confirm-btn {
  margin-top: 10px;
}

/* 银行卡列表卡片 */
.card-mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: var(--fs-caption);
  border-top: 1px solid var(--border-soft);
}
.default-badge {
  background: var(--primary-color);
  color: var(--text-on-primary);
  padding: 1px 6px;
  border-radius: var(--radius-lg);
  font-size: 10px;
}
</style>
