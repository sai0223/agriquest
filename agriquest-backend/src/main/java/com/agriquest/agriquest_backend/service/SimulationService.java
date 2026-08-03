package com.agriquest.agriquest_backend.service;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.exception.BadRequestException;
import com.agriquest.agriquest_backend.exception.ResourceNotFoundException;
import com.agriquest.agriquest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

/**
 * Core simulation engine — the "learn by doing" heart of AgriQuest.
 *
 * Each stage maps choices to (healthImpact, sustainabilityImpact, feedback).
 * Wrong choices are NEVER game-over; they always come with an explanation.
 */
@Service
@RequiredArgsConstructor
public class SimulationService {

    private final FarmSimulationRepository simulationRepo;
    private final SimulationDecisionRepository decisionRepo;
    private final UserRepository userRepo;

    // ─── Stage order ────────────────────────────────────────────────────────────
    private static final List<String> STAGES = List.of(
            "SOIL_PREPARATION",
            "SOWING",
            "IRRIGATION",
            "FERTILIZATION",
            "PEST_MANAGEMENT",
            "GROWTH_MONITORING",
            "HARVEST"
    );

    // ─── Decision Knowledge Base ─────────────────────────────────────────────────
    // Key format: "STAGE:CHOICE"  → [healthImpact, sustainabilityImpact, feedback]
    private static final Map<String, Object[]> DECISION_RULES = new HashMap<>();

    static {
        // SOIL_PREPARATION
        DECISION_RULES.put("SOIL_PREPARATION:DEEP_PLOUGHING",
                new Object[]{10, 10, "✅ Deep ploughing breaks compaction, improves aeration, and allows roots to grow deeper. Excellent choice!"});
        DECISION_RULES.put("SOIL_PREPARATION:SHALLOW_PLOUGHING",
                new Object[]{5, 5, "⚠️ Shallow ploughing is quick but limits root depth. Consider deep ploughing next season for better yield."});
        DECISION_RULES.put("SOIL_PREPARATION:NO_PLOUGHING",
                new Object[]{-10, -5, "❌ Skipping soil preparation causes compaction and reduces water retention. Roots struggle to penetrate. Always prepare soil before sowing."});

        // SOWING
        DECISION_RULES.put("SOWING:SEED_TREATMENT",
                new Object[]{10, 8, "✅ Treating seeds with fungicide/biofertilizer boosts germination rates and protects early growth. Smart practice!"});
        DECISION_RULES.put("SOWING:DIRECT_SOWING",
                new Object[]{0, 3, "ℹ️ Direct sowing works but untreated seeds face higher disease risk. Seed treatment is recommended for better results."});
        DECISION_RULES.put("SOWING:LATE_SOWING",
                new Object[]{-15, -5, "❌ Late sowing misses the optimal growth window, resulting in lower yield and increased pest pressure."});

        // IRRIGATION
        DECISION_RULES.put("IRRIGATION:DRIP",
                new Object[]{10, 20, "✅ Drip irrigation delivers water directly to roots — saves up to 60% water vs flood. Best choice for sustainability!"});
        DECISION_RULES.put("IRRIGATION:SPRINKLER",
                new Object[]{5, 10, "✅ Sprinkler irrigation is efficient for most crops. Better than flood but slightly less targeted than drip."});
        DECISION_RULES.put("IRRIGATION:FLOOD",
                new Object[]{0, -20, "⚠️ Flood irrigation uses up to 3× more water than drip. It also increases soil erosion and nutrient runoff. Consider switching to drip irrigation."});
        DECISION_RULES.put("IRRIGATION:NONE",
                new Object[]{-30, -10, "❌ No irrigation during the growing season severely stresses the crop. Yield will drop significantly without adequate water."});

        // FERTILIZATION
        DECISION_RULES.put("FERTILIZATION:ORGANIC_COMPOST",
                new Object[]{10, 20, "✅ Organic compost improves soil structure, adds beneficial microbes, and releases nutrients slowly. Excellent for long-term soil health!"});
        DECISION_RULES.put("FERTILIZATION:BALANCED_NPK",
                new Object[]{8, 5, "✅ Balanced NPK provides all essential macronutrients. Effective but use with soil test data for best results."});
        DECISION_RULES.put("FERTILIZATION:EXCESS_UREA",
                new Object[]{-5, -15, "❌ Over-applying urea causes nitrogen toxicity, burns leaves, and leaches into groundwater. Always apply fertilizer per soil test recommendations."});
        DECISION_RULES.put("FERTILIZATION:NO_FERTILIZER",
                new Object[]{-10, 5, "⚠️ Skipping fertilization depletes soil nutrients over time. While it avoids chemical runoff, yields will drop significantly."});

        // PEST_MANAGEMENT
        DECISION_RULES.put("PEST_MANAGEMENT:IPM",
                new Object[]{10, 20, "✅ Integrated Pest Management combines biological, cultural, and minimal chemical control — the gold standard for sustainable farming!"});
        DECISION_RULES.put("PEST_MANAGEMENT:BIOLOGICAL_CONTROL",
                new Object[]{8, 18, "✅ Releasing natural predators (ladybugs, parasitic wasps) is eco-friendly and effective for many pest types."});
        DECISION_RULES.put("PEST_MANAGEMENT:CHEMICAL_SPRAY",
                new Object[]{5, -15, "⚠️ Chemical pesticides control pests quickly but harm beneficial insects, soil microbes, and can leave residues. Use only when necessary."});
        DECISION_RULES.put("PEST_MANAGEMENT:NO_ACTION",
                new Object[]{-20, -5, "❌ Ignoring pest pressure allows exponential pest population growth, potentially destroying 30-70% of your crop. Always monitor and act early."});

        // GROWTH_MONITORING
        DECISION_RULES.put("GROWTH_MONITORING:REGULAR_SCOUTING",
                new Object[]{10, 10, "✅ Weekly field scouting allows early detection of stress, pest damage, and nutrient deficiencies — preventing larger losses later."});
        DECISION_RULES.put("GROWTH_MONITORING:OCCASIONAL_CHECK",
                new Object[]{0, 0, "ℹ️ Occasional monitoring misses early signs of problems. Regular scouting (weekly) is best practice."});
        DECISION_RULES.put("GROWTH_MONITORING:NO_MONITORING",
                new Object[]{-10, -5, "❌ Without monitoring, you're farming blind. Problems compound undetected until crop loss becomes severe."});

        // HARVEST
        DECISION_RULES.put("HARVEST:OPTIMAL_TIMING",
                new Object[]{15, 10, "✅ Harvesting at peak maturity maximizes yield, quality, and market value. Well timed!"});
        DECISION_RULES.put("HARVEST:EARLY_HARVEST",
                new Object[]{-5, 0, "⚠️ Harvesting too early reduces yield and quality. Grains/fruits haven't fully developed their nutritional value."});
        DECISION_RULES.put("HARVEST:LATE_HARVEST",
                new Object[]{-10, -5, "⚠️ Late harvest increases post-harvest losses from weathering, pests, and shatter. Timing is critical!"});
    }

    // ─── Public API ──────────────────────────────────────────────────────────────

    @Transactional
    public FarmSimulation startSimulation(Long userId, String crop) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        FarmSimulation sim = FarmSimulation.builder()
                .user(user)
                .crop(crop)
                .currentStage("SOIL_PREPARATION")
                .healthScore(100)
                .sustainabilityScore(100)
                .status(FarmSimulation.SimulationStatus.IN_PROGRESS)
                .build();

        return simulationRepo.save(sim);
    }

    @Transactional
    public DecisionResult makeDecision(Long simulationId, String choiceKey, String choiceValue) {
        FarmSimulation sim = simulationRepo.findById(simulationId)
                .orElseThrow(() -> new ResourceNotFoundException("Simulation not found: " + simulationId));

        if (sim.getStatus() != FarmSimulation.SimulationStatus.IN_PROGRESS) {
            throw new BadRequestException("Simulation is already " + sim.getStatus());
        }

        String ruleKey = sim.getCurrentStage() + ":" + choiceKey;
        Object[] rule = DECISION_RULES.getOrDefault(ruleKey,
                new Object[]{0, 0, "ℹ️ No specific guidance for this choice. Proceed carefully."});

        int healthImpact = (int) rule[0];
        int sustainabilityImpact = (int) rule[1];
        String feedback = (String) rule[2];

        // Record decision
        SimulationDecision decision = SimulationDecision.builder()
                .simulation(sim)
                .stage(sim.getCurrentStage())
                .choiceKey(choiceKey)
                .choiceValue(choiceValue)
                .feedback(feedback)
                .healthImpact(healthImpact)
                .sustainabilityImpact(sustainabilityImpact)
                .build();
        decisionRepo.save(decision);

        // Update scores (clamp 0–100)
        sim.setHealthScore(Math.max(0, Math.min(100, sim.getHealthScore() + healthImpact)));
        sim.setSustainabilityScore(Math.max(0, Math.min(100, sim.getSustainabilityScore() + sustainabilityImpact)));

        // Advance to next stage or complete
        int currentIndex = STAGES.indexOf(sim.getCurrentStage());
        if (currentIndex >= STAGES.size() - 1) {
            sim.setStatus(FarmSimulation.SimulationStatus.COMPLETED);
            sim.setCurrentStage("COMPLETED");
        } else {
            sim.setCurrentStage(STAGES.get(currentIndex + 1));
        }

        simulationRepo.save(sim);

        // Award XP for completing a stage
        User user = sim.getUser();
        user.setXp(user.getXp() + Math.max(5, healthImpact + 10));
        userRepo.save(user);

        return new DecisionResult(sim, decision, getNextStageOptions(sim.getCurrentStage()));
    }

    public FarmSimulation getSimulation(Long simulationId) {
        return simulationRepo.findById(simulationId)
                .orElseThrow(() -> new ResourceNotFoundException("Simulation not found: " + simulationId));
    }

    public List<SimulationDecision> getHistory(Long simulationId) {
        return decisionRepo.findBySimulationIdOrderByDecidedAtAsc(simulationId);
    }

    public List<FarmSimulation> getUserSimulations(Long userId) {
        return simulationRepo.findByUserId(userId);
    }

    public Map<String, List<String>> getStageOptions() {
        Map<String, List<String>> options = new LinkedHashMap<>();
        options.put("SOIL_PREPARATION", List.of("DEEP_PLOUGHING", "SHALLOW_PLOUGHING", "NO_PLOUGHING"));
        options.put("SOWING", List.of("SEED_TREATMENT", "DIRECT_SOWING", "LATE_SOWING"));
        options.put("IRRIGATION", List.of("DRIP", "SPRINKLER", "FLOOD", "NONE"));
        options.put("FERTILIZATION", List.of("ORGANIC_COMPOST", "BALANCED_NPK", "EXCESS_UREA", "NO_FERTILIZER"));
        options.put("PEST_MANAGEMENT", List.of("IPM", "BIOLOGICAL_CONTROL", "CHEMICAL_SPRAY", "NO_ACTION"));
        options.put("GROWTH_MONITORING", List.of("REGULAR_SCOUTING", "OCCASIONAL_CHECK", "NO_MONITORING"));
        options.put("HARVEST", List.of("OPTIMAL_TIMING", "EARLY_HARVEST", "LATE_HARVEST"));
        return options;
    }

    private List<String> getNextStageOptions(String stage) {
        return getStageOptions().getOrDefault(stage, List.of());
    }

    public record DecisionResult(FarmSimulation simulation, SimulationDecision decision, List<String> nextOptions) {}
}
