package com.agriquest.agriquest_backend.controller;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }

    @GetMapping("/leaderboard/farmers")
    public ResponseEntity<List<User>> getFarmerLeaderboard() {
        return ResponseEntity.ok(gamificationService.getFarmerLeaderboard());
    }

    @GetMapping("/badges/{userId}")
    public ResponseEntity<List<UserBadge>> getUserBadges(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getUserBadges(userId));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getUserStats(userId));
    }

    @PostMapping("/check-badges/{userId}")
    public ResponseEntity<Void> checkBadges(@PathVariable Long userId) {
        gamificationService.checkAndAwardBadges(userId);
        return ResponseEntity.ok().build();
    }
}
