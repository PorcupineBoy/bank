import request from '@/utils/request'

export function sendChatMessage(data) {
  return request({
    url: '/api/ai/chat/send',
    method: 'post',
    data
  })
}

export function getChatHistory(data) {
  return request({
    url: '/api/ai/chat/history',
    method: 'post',
    data
  })
}

export function newChatSession(data) {
  return request({
    url: '/api/ai/chat/session',
    method: 'post',
    data
  })
}

export function getConsumptionAnalysis(data) {
  return request({
    url: '/api/ai/consumption/analysis',
    method: 'post',
    data
  })
}

// ==================== MCP-Skill 接口 ====================

/**
 * 执行 MCP Skill（LLM function_call 模式）
 * @param {string} skillName - Skill 名称（如 query_balance, query_transactions, transfer_prepare）
 * @param {object} params - 参数
 */
export function executeMcpSkill(skillName, params = {}) {
  return request({
    url: '/api/ai/mcp/execute',
    method: 'post',
    data: { skillName, params }
  })
}

/**
 * 获取所有已注册的 MCP Skill 元数据
 */
export function listMcpSkills() {
  return request({
    url: '/api/ai/mcp/skills',
    method: 'post',
    data: {}
  })
}
