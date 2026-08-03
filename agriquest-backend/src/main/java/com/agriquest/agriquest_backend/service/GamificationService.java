package com.agriquest.agriquest_backend.service;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.exception.ResourceNotFoundException;
import com.agriquest.agriquest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepo;
    private final BadgeRepository badgeRepo;
    private final UserBadgeRepository userBadgeRepo;

    public List<User> getLeaderboard() {
        return userRepo.findAllOrderByXpDesc();
    }

    public List<User> getFarmerLeaderboard() {
        return userRepo.findFarmersOrderByGreenPoints();
    }

    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepo.findByUserId(userId);
    }

    public Map<String, Object> getUserStats(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        List<UserBadge> badges = userBadgeRepo.findByUserId(userId);
        return Map.of(
                "xp", user.getXp(),
                "level", user.getLevel(),
                "greenPoints", user.getGreenPoints(),
                "streakDays", user.getStreakDays(),
                "badgeCount", badges.size(),
                "role", user.getRole()
        );
    }

    /**
     * Check and award any badges the user has newly qualified for.
     * Called after simulation completion, quiz attempts, etc.
     */
    @Transactional
    public void checkAndAwardBadges(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Badge> allBadges = badgeRepo.findAll();
        for (Badge badge : allBadges) {
            if (userBadgeRepo.existsByUserIdAndBadgeId(userId, badge.getId())) continue;

            boolean earned = switch (badge.getCriteriaType()) {
                case "XP_THRESHOLD" -> user.getXp() >= badge.getCriteriaValue();
                case "SUSTAINABILITY_SCORE" -> user.getGreenPoints() >= badge.getCriteriaValue();
                case "STREAK" -> user.getStreakDays() >= badge.getCriteriaValue();
                default -> false;
            };

            if (earned) {
                UserBadge ub = UserBadge.builder().user(user).badge(badge).build();
                userBadgeRepo.save(ub);
            }
        }

        // Level up: every 200 XP = 1 level
        int newLevel = Math.max(1, user.getXp() / 200 + 1);
        user.setLevel(newLevel);
        userRepo.save(user);
    }
}
