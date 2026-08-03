package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.AiChatLog;
import com.agriquest.agriquest_backend.service.AiChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    public record ChatRequest(@NotNull Long userId, @NotBlank String query) {}

    @PostMapping("/chat")
    public ResponseEntity<AiChatLog> chat(@Valid @RequestBody ChatRequest req) {
        return ResponseEntity.ok(aiChatService.chat(req.userId(), req.query()));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<AiChatLog>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(aiChatService.getChatHistory(userId));
    }
}
