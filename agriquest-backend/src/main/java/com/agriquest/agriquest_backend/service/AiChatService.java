package com.agriquest.agriquest_backend.service;

import com.agriquest.agriquest_backend.entity.*;
import com.agriquest.agriquest_backend.exception.ResourceNotFoundException;
import com.agriquest.agriquest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

/**
 * AI Assistant Service — rule-based for MVP.
 * The response tone adapts based on roleContext (STUDENT vs FARMER).
 * Plug in a real LLM API (Gemini, OpenAI, etc.) in the future
 * by replacing the generateResponse() method.
 */
@Service
@RequiredArgsConstructor
public class AiChatService {

    private final AiChatLogRepository chatLogRepo;
    private final UserRepository userRepo;

    private static final Map<String, String> STUDENT_KB = new LinkedHashMap<>();
    private static final Map<String, String> FARMER_KB = new LinkedHashMap<>();

    static {
        // Student knowledge base — simple, educational, first-principles
        STUDENT_KB.put("nitrogen", "Nitrogen (N) is one of the three main plant nutrients (NPK). It's the building block for chlorophyll and proteins — it makes your plant green and helps it grow leaves. When leaves turn yellow, it often means nitrogen deficiency!");
        STUDENT_KB.put("drip irrigation", "Drip irrigation delivers water directly to the plant roots through small tubes. It uses up to 60% less water than flood irrigation because there's no evaporation or runoff. It's the most sustainable irrigation method for most crops.");
        STUDENT_KB.put("soil ph", "Soil pH measures how acidic or alkaline your soil is on a scale of 0–14. Most crops prefer slightly acidic to neutral soil (pH 6.0–7.0). You can test pH with a simple kit and adjust it using lime (to raise pH) or sulfur (to lower pH).");
        STUDENT_KB.put("photosynthesis", "Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. Plants take CO₂ from air and water from soil, and use sunlight energy to convert them into glucose (sugar) and oxygen. That's why plants need sunlight!");
        STUDENT_KB.put("crop rotation", "Crop rotation means growing different crops in the same field each season. It breaks pest and disease cycles, improves soil health, and reduces the need for fertilizers. For example: grow legumes after cereals to naturally add nitrogen to the soil.");
        STUDENT_KB.put("pest", "Pests are insects, fungi, or other organisms that damage crops. The best approach is Integrated Pest Management (IPM) — a combination of monitoring, biological controls (natural predators), and minimal chemical use only when necessary.");
        STUDENT_KB.put("fertilizer", "Fertilizers provide essential nutrients that crops need to grow. The main ones are N (Nitrogen for leaves), P (Phosphorus for roots), and K (Potassium for fruits/strength). Organic fertilizers like compost improve soil health long-term.");
        STUDENT_KB.put("harvest", "Harvesting at the right time is critical! Too early = lower yield and quality. Too late = losses from weather, pests, and over-ripening. Learn the maturity indicators for each crop — for example, rice turns golden when ready.");

        // Farmer knowledge base — diagnostic, practical, advisory
        FARMER_KB.put("yellow leaves", "Yellow leaves (chlorosis) in tomatoes/crops can indicate: 1) Nitrogen deficiency — apply balanced NPK, 2) Iron deficiency (yellowing between green veins) — apply iron chelate, 3) Overwatering — check drainage, 4) Fungal disease — check for spots/lesions. Soil test recommended for accurate diagnosis.");
        FARMER_KB.put("low yield", "Low yield can result from: soil nutrient depletion (get a soil test), inadequate irrigation, pest/disease pressure, late planting, poor-quality seeds, or harvesting at wrong stage. Track each factor season by season to identify the limiting factor.");
        FARMER_KB.put("pest control", "For effective pest management: 1) Scout fields weekly, 2) Use pheromone traps for early detection, 3) Introduce natural predators (Trichogramma for borer control), 4) Apply neem-based sprays as first-line chemical control, 5) Use synthetic pesticides only as last resort and rotate modes of action to prevent resistance.");
        FARMER_KB.put("water stress", "Water stress signs: wilting in morning (severe), rolling leaves, reduced internode length. Check soil moisture at 6-inch depth. If dry, irrigate immediately. For drip systems, check emitter clogging. Mulching reduces soil moisture loss by 30–40%.");
        FARMER_KB.put("organic farming", "To transition to organic: 1) Stop all synthetic inputs 3 years before certification, 2) Build soil with compost, green manure, and vermiculture, 3) Use IPM for pest control, 4) Grow cover crops in off-season, 5) Get soil tested to monitor improvement. Yield may drop initially but recovers by year 3.");
        FARMER_KB.put("soil health", "Healthy soil = productive farm. Indicators: earthy smell, presence of earthworms, crumbly texture. Build soil with organic matter (compost, crop residue). Avoid heavy machinery on wet soil (compaction). Minimum tillage preserves soil structure. Rotate crops and use cover crops.");
    }

    @Transactional
    public AiChatLog chat(Long userId, String query) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String roleContext = user.getRole().name();
        String response = generateResponse(query, roleContext);

        AiChatLog log = AiChatLog.builder()
                .user(user)
                .roleContext(roleContext)
                .query(query)
                .response(response)
                .build();

        return chatLogRepo.save(log);
    }

    public List<AiChatLog> getChatHistory(Long userId) {
        return chatLogRepo.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }

    private String generateResponse(String query, String roleContext) {
        String lowerQuery = query.toLowerCase();
        Map<String, String> kb = roleContext.equals("FARMER") ? FARMER_KB : STUDENT_KB;

        // Match keywords from knowledge base
        for (Map.Entry<String, String> entry : kb.entrySet()) {
            if (lowerQuery.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // Fallback response based on role
        if ("FARMER".equals(roleContext)) {
            return "That's a great farming question! For specific diagnostic advice, I recommend consulting your local agricultural extension officer or Krishi Vigyan Kendra (KVK). They can provide field-specific guidance based on your soil and climate conditions.";
        } else {
            return "Great question! Agriculture is a fascinating science. The best way to learn is by practicing in the Virtual Farm Simulator — try different choices and see how they affect crop health. Check the Learning Topics section for more in-depth content on this subject!";
        }
    }
}
