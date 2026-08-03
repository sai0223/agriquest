-- ============================================================
-- AgriQuest V2 - Seed Data: Badges + Sample Learning Content
-- ============================================================

-- ─── Badges ────────────────────────────────────────────────
INSERT INTO badges (name, description, icon_url, criteria_type, criteria_value) VALUES
    ('First Harvest', 'Complete your first farm simulation', '🌾', 'XP_THRESHOLD', 10),
    ('Water Saver', 'Use drip irrigation in 3 simulations', 'XP_THRESHOLD', 50),
    ('Green Farmer', 'Earn 200 Green Points', '🌿', 'SUSTAINABILITY_SCORE', 200),
    ('Soil Protector', 'Use organic compost in 3 simulations', '🌱', 'XP_THRESHOLD', 80),
    ('Organic Champion', 'Complete organic farming learning path', '🏆', 'XP_THRESHOLD', 150),
    ('Rising Star', 'Reach Level 3', '⭐', 'XP_THRESHOLD', 400),
    ('Knowledge Keeper', 'Answer 5 community questions', '📚', 'XP_THRESHOLD', 200),
    ('Streak Master', 'Maintain a 7-day streak', '🔥', 'STREAK', 7),
    ('Sustainability Hero', 'Earn 500 Green Points', '🌍', 'SUSTAINABILITY_SCORE', 500),
    ('Quiz Champion', 'Score 100% on any quiz', '🎯', 'XP_THRESHOLD', 120)
ON CONFLICT (name) DO NOTHING;

-- ─── Learning Topics ────────────────────────────────────────
INSERT INTO learning_topics (title, description, video_url, notes, category, difficulty, image_url) VALUES
    (
        'Understanding Soil Types',
        'Learn about the six major soil types — Sandy, Clay, Silt, Peat, Chalk, and Loam — and which crops grow best in each.',
        NULL,
        '**Sandy Soil**: Drains quickly, low nutrients. Good for: carrots, potatoes, peanuts.
**Clay Soil**: Holds water well, nutrient-rich but compacts easily. Good for: wheat, rice.
**Loam Soil**: Best balanced soil — ideal for most vegetables.
**Black Soil**: Rich in calcium, magnesium, potassium. Ideal for cotton.
**Red Soil**: Low nitrogen, phosphorus. Used for groundnuts, pulses.

**pH Scale**: Most crops prefer 6.0–7.0. Test your soil before planting!',
        'SOIL',
        'BEGINNER',
        NULL
    ),
    (
        'Irrigation Methods Explained',
        'Compare flood, sprinkler, and drip irrigation — understand their water usage, costs, and best use cases.',
        NULL,
        '**Flood Irrigation**: Oldest method. Water flows across field. 
• Pros: Low setup cost. 
• Cons: Uses 3× more water, causes soil erosion.

**Sprinkler Irrigation**: Pipes + sprinkler heads simulate rain.
• Pros: Good for uneven terrain, covers large areas.
• Cons: Higher evaporation, not ideal for high-humidity crops.

**Drip Irrigation**: Tubes deliver water directly to roots.
• Pros: Saves 60–70% water, no runoff, higher yields.
• Cons: Higher initial cost, tubes can clog.

**Sustainability Tip**: Drip irrigation is the gold standard for water conservation!',
        'IRRIGATION',
        'BEGINNER',
        NULL
    ),
    (
        'Crop Seasons and Cycles in India',
        'Master the Kharif, Rabi, and Zaid cropping seasons — what crops to grow and when.',
        NULL,
        '**Kharif (June–November)**: Monsoon season. Crops: Rice, Cotton, Sugarcane, Maize, Soybean.
**Rabi (November–April)**: Winter season. Crops: Wheat, Barley, Mustard, Chickpea, Peas.
**Zaid (April–June)**: Summer season. Crops: Watermelon, Cucumber, Pumpkin, Fodder crops.

**Key Concept**: Crop selection must match season, local rainfall, and temperature range.
Mismatch = poor yield, high pest pressure!',
        'CROP_SEASONS',
        'BEGINNER',
        NULL
    ),
    (
        'Organic Farming Principles',
        'Learn how to transition from conventional to organic farming — soil building, natural pest control, and certification.',
        NULL,
        '**What is Organic Farming?** Growing crops without synthetic pesticides, herbicides, or artificial fertilizers.

**Core Practices**:
1. Composting — turn kitchen/farm waste into nutrient-rich soil amendment
2. Green Manure — grow legumes and plow them in before they flower
3. Crop Rotation — break pest cycles, improve soil structure
4. Biological Pest Control — use natural predators and neem-based sprays
5. Vermicomposting — use earthworms to process organic matter

**Certification**: Organic certification in India is done by APEDA-accredited bodies. Transition period is 3 years.',
        'ORGANIC',
        'INTERMEDIATE',
        NULL
    ),
    (
        'Integrated Pest Management (IPM)',
        'The professional approach to pest control — effective, eco-friendly, and economically sound.',
        NULL,
        '**IPM Definition**: A science-based approach combining multiple tactics to manage pests below economically damaging levels.

**4 Steps of IPM**:
1. **Monitor** — weekly field scouting, pheromone traps, record pest populations
2. **Identify** — correctly identify pest species before acting
3. **Action Thresholds** — only treat when pest levels exceed economic threshold
4. **Control Methods** (in order of preference):
   - Cultural: crop rotation, resistant varieties
   - Biological: natural predators, parasitoids
   - Mechanical: traps, barriers
   - Chemical: targeted, selective pesticides as LAST resort

**Why IPM?** Reduces costs by 20–40%, preserves beneficial insects (pollinators), and prevents pesticide resistance.',
        'PEST',
        'INTERMEDIATE',
        NULL
    ),
    (
        'Climate-Smart Agriculture',
        'Adapt farming to climate change — drought-resistant crops, carbon sequestration, and resilient practices.',
        NULL,
        '**What is Climate-Smart Agriculture (CSA)?** Farming approaches that sustainably increase productivity, build resilience, and reduce greenhouse gas emissions.

**3 Pillars of CSA**:
1. **Productivity** — sustainably increase yields
2. **Adaptation** — reduce vulnerability to climate shocks
3. **Mitigation** — reduce emissions, sequester carbon

**Key Practices**:
- Use drought-tolerant crop varieties
- Conservation tillage (minimum/no-till) preserves soil carbon
- Agroforestry — integrate trees for shade, windbreaks, and carbon storage
- Rainwater harvesting structures (check dams, farm ponds)
- Precision agriculture — apply inputs only where needed

**India Context**: Over 250 million people depend on agriculture that is highly climate-vulnerable. CSA is critical for food security.',
        'CLIMATE',
        'ADVANCED',
        NULL
    )
ON CONFLICT DO NOTHING;
