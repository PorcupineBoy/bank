package com.bank.controller;

import com.bank.common.Result;
import com.bank.dto.ChatHistoryRequest;
import com.bank.dto.ChatSendRequest;
import com.bank.dto.ReqBasic;
import com.bank.service.AiChatService;
import com.bank.service.TransactionCategorizationService;
import com.bank.vo.ChatMessageVO;
import com.bank.vo.ConsumptionAnalysisVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Validated
public class AiController {

    @Autowired
    private AiChatService aiChatService;
    @Autowired
    private TransactionCategorizationService categorizationService;

    @PostMapping("/chat/send")
    public Result<ChatMessageVO> sendMessage(@RequestBody @Validated ChatSendRequest request) {
        return Result.success(aiChatService.sendMessage(request.getUserId(), request.getContent(), request.getSessionId()));
    }

    @PostMapping("/chat/history")
    public Result<List<ChatMessageVO>> getChatHistory(@RequestBody ChatHistoryRequest request) {
        return Result.success(aiChatService.getChatHistory(request.getUserId(), request.getSessionId(), request.getLimit()));
    }

    @PostMapping("/chat/session")
    public Result<String> newSession(@RequestBody ReqBasic request) {
        return Result.success(aiChatService.generateNewSessionId());
    }

    @PostMapping("/consumption/analysis")
    public Result<ConsumptionAnalysisVO> analyzeConsumption(@RequestBody ReqBasic request) {
        return Result.success(categorizationService.analyzeConsumption(request.getUserId(), LocalDate.now()));
    }
}
