<template>
  <div class="chat-page">
    <van-nav-bar title="AI智能助手" left-arrow @click-left="$router.back()" fixed />

    <div class="chat-container" ref="chatContainer">
      <div class="welcome-msg">
        <div class="ai-avatar">
          <van-icon name="chat-o" size="24" color="#fff" />
        </div>
        <div class="welcome-bubble">
          <p>您好！我是您的智能银行助手</p>
          <p style="margin-top:4px;font-size:13px;color:#666;">
            您可以问我：查余额、最近交易、消费分析、我的银行卡
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
          <div v-if="msg.role === 2 && msg.functionCalled" class="msg-action">
            <van-button
              v-if="msg.content && msg.content.includes('去转账')"
              size="mini"
              round
              color="#4A90E2"
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
      quickTags: ['查余额', '最近交易', '消费分析', '我的银行卡', '帮助']
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
        el.scrollTop = el.scrollHeight
      }
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
  max-width: 75%;
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
</style>
