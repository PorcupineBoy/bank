package com.bank.service;

import com.bank.vo.ChatMessageVO;

import java.util.List;

public interface AiChatService {
    ChatMessageVO sendMessage(Long userId, String content, String sessionId);
    List<ChatMessageVO> getChatHistory(Long userId, String sessionId, Integer limit);
    String generateNewSessionId();
}
