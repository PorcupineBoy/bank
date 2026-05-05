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
                <van-icon name="exchange" color="#07c160" />
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
                color="#07c160"
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
              color="#07c160"
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
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight
        })
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
  min-height: 100vh;
  background: #F0F4F8;
  display: flex;
  flex-direction: column;
  padding-top: 46px;
}
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.welcome-msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7BB7F0, #4A90E2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}
.welcome-bubble {
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  border-top-left-radius: 4px;
  font-size: 14px;
  color: #333;
  max-width: 75%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.msg-row.user {
  justify-content: flex-end;
}
.msg-row.user .msg-bubble {
  background: #4A90E2;
  color: #fff;
  border-top-right-radius: 4px;
}
.msg-bubble {
  background: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  border-top-left-radius: 4px;
  font-size: 14px;
  color: #333;
  max-width: 80%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  word-break: break-word;
}
.msg-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
}
.msg-action {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 16px;
}
.dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
.input-area {
  background: #fff;
  padding: 10px 16px 16px;
  border-top: 1px solid #eee;
}
.quick-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.tag {
  padding: 4px 12px;
  background: #F0F4F8;
  color: #4A90E2;
  font-size: 12px;
  border-radius: 12px;
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
  background: #F5F5F5;
  border-radius: 20px;
  padding: 6px 14px;
}
.chat-input ::v-deep .van-field__control {
  font-size: 14px;
}

/* MCP-Skill 结构化卡片样式 */
.mcp-cards {
  margin-top: 10px;
}
.mcp-card {
  background: #f8fafc;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  padding: 12px;
  margin-top: 4px;
}
.card-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.total-balance {
  font-size: 24px;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 2px;
}
.card-subtitle {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}
.card-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-top: 1px solid #eee;
}
.card-balance {
  font-weight: bold;
  color: #333;
}

/* 交易卡片 */
.trans-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #eee;
  cursor: pointer;
}
.trans-left {
  flex: 0 0 auto;
}
.trans-type {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}
.trans-time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.trans-mid {
  flex: 1;
  text-align: center;
  padding: 0 8px;
}
.trans-payee {
  font-size: 12px;
  color: #666;
}
.trans-remark {
  font-size: 11px;
  color: #999;
}
.trans-right {
  text-align: right;
}
.trans-amount {
  font-size: 14px;
  font-weight: bold;
}
.trans-amount.expense {
  color: #333;
}
.trans-amount.income {
  color: #07c160;
}
.trans-status {
  font-size: 11px;
  color: #999;
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
  font-size: 14px;
}
.preview-label {
  color: #666;
}
.preview-value {
  font-weight: bold;
  color: #333;
}
.amount-highlight {
  color: #ee0a24;
  font-size: 18px;
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
  font-size: 13px;
  border-top: 1px solid #eee;
}
.default-badge {
  background: #4A90E2;
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}
</style>
