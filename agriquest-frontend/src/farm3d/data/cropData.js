/* ═══════════════════════════════════════════════════════════════
   Crop Data — Realistic Farming Methods for Each Crop
   Every crop has its own real-world agricultural workflow
   ═══════════════════════════════════════════════════════════════ */

/* ─── Generic growth stages (used for 3D visual mapping) ──── */
export const GROWTH_STAGES = {
  EMPTY: 'EMPTY',
  PLOUGHING: 'PLOUGHING',
  SOWING: 'SOWING',
  SEEDLING: 'SEEDLING',
  GROWING: 'GROWING',
  FLOWERING: 'FLOWERING',
  RIPENING: 'RIPENING',
  HARVESTABLE: 'HARVESTABLE',
};

/* ─── Farming step types — what the farmer does ────────────── */
export const STEP_TYPES = {
  PLOUGH: 'PLOUGH',
  PUDDLE: 'PUDDLE',           // rice: flood + mix soil
  SOW: 'SOW',
  TRANSPLANT: 'TRANSPLANT',   // rice: move seedlings
  IRRIGATE: 'IRRIGATE',       // turn on water
  FERTILIZE: 'FERTILIZE',
  MAINTAIN_WATER: 'MAINTAIN_WATER',
  DRAIN: 'DRAIN',             // rice: drain before harvest
  MULCH: 'MULCH',             // tomato: add mulch layer
  INSTALL_DRIP: 'INSTALL_DRIP', // tomato: drip lines
  STAKE: 'STAKE',             // tomato: add supports
  RIDGE: 'RIDGE',             // corn/potato: make ridges
  HILL_UP: 'HILL_UP',         // potato: mound soil
  PESTICIDE: 'PESTICIDE',     // cotton: pest control
  DEEP_TILL: 'DEEP_TILL',     // cotton: deep tillage
  VINE_KILL: 'VINE_KILL',     // potato: kill vines before dig
  HARVEST: 'HARVEST',
  WAIT: 'WAIT',               // passive: crop grows on its own
};

/* ─── Irrigation types ─────────────────────────────────────── */
export const IRRIGATION_TYPES = {
  FLOOD: { id: 'flood', label: 'Flood Irrigation', icon: '🌊', color: '#1e88e5' },
  SPRINKLER: { id: 'sprinkler', label: 'Sprinkler', icon: '🔫', color: '#42a5f5' },
  DRIP: { id: 'drip', label: 'Drip Irrigation', icon: '💧', color: '#26c6da' },
  FURROW: { id: 'furrow', label: 'Furrow Irrigation', icon: '〰️', color: '#5c6bc0' },
  RAINFED: { id: 'rainfed', label: 'Rain-fed', icon: '🌧️', color: '#78909c' },
};

/* ─── Difficulty levels ────────────────────────────────────── */
export const DIFFICULTY = {
  EASY: { label: 'Easy', color: '#66bb6a', stars: 1 },
  MEDIUM: { label: 'Medium', color: '#ffa726', stars: 2 },
  HARD: { label: 'Hard', color: '#ef5350', stars: 3 },
};

/* ═══════════════════════════════════════════════════════════════
   CROP DEFINITIONS — Each with real-world farming workflow
   ═══════════════════════════════════════════════════════════════ */
export const CROPS = [
  /* ─── RICE ──────────────────────────────────────────────── */
  {
    id: 'rice',
    name: 'Rice',
    icon: '🌾',
    color: '#7cb342',
    matureColor: '#c6a700',
    flowerColor: '#a8d08d',
    description: 'Water-intensive paddy crop. Requires flooding via borewell.',
    growthDuration: 70,
    yieldValue: 120,
    waterNeeds: 'high',
    basePrice: 45,
    irrigationType: IRRIGATION_TYPES.FLOOD,
    farmingMethod: 'Paddy (Flood)',
    difficulty: DIFFICULTY.HARD,
    needsBorewell: true,
    soilType: 'puddled',
    farmingSteps: [
      { type: STEP_TYPES.PLOUGH, label: '🚜 Plough Field', desc: 'Loosen the soil with multiple passes', duration: 5, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.PUDDLE, label: '🌊 Puddle & Flood', desc: 'Turn on borewell to flood and puddle the field', duration: 6, growthStage: GROWTH_STAGES.PLOUGHING, needsBorewell: true },
      { type: STEP_TYPES.TRANSPLANT, label: '🌱 Transplant Seedlings', desc: 'Plant young rice seedlings in the flooded paddy', duration: 5, growthStage: GROWTH_STAGES.SOWING },
      { type: STEP_TYPES.MAINTAIN_WATER, label: '💧 Maintain Water Level', desc: 'Keep borewell running to maintain 2-5cm standing water', duration: 8, growthStage: GROWTH_STAGES.SEEDLING, needsBorewell: true },
      { type: STEP_TYPES.FERTILIZE, label: '🧪 Apply Fertilizer', desc: 'Add nutrients at tillering stage for strong growth', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '⏳ Growing & Tillering', desc: 'Rice tillers and grows — keep water level steady', duration: 15, growthStage: GROWTH_STAGES.GROWING, needsBorewell: true },
      { type: STEP_TYPES.WAIT, label: '🌼 Flowering & Grain Fill', desc: 'Panicles emerge and grains develop', duration: 12, growthStage: GROWTH_STAGES.FLOWERING },
      { type: STEP_TYPES.DRAIN, label: '🚫 Drain Field', desc: 'Stop borewell and drain water 10 days before harvest', duration: 5, growthStage: GROWTH_STAGES.RIPENING },
      { type: STEP_TYPES.HARVEST, label: '🌾 Harvest Rice', desc: 'Cut ripened golden panicles with sickle', duration: 5, growthStage: GROWTH_STAGES.HARVESTABLE },
    ],
  },

  /* ─── WHEAT ─────────────────────────────────────────────── */
  {
    id: 'wheat',
    name: 'Wheat',
    icon: '🌿',
    color: '#8bc34a',
    matureColor: '#d4a017',
    flowerColor: '#c5e17a',
    description: 'Hardy winter staple. Uses sprinkler irrigation.',
    growthDuration: 55,
    yieldValue: 100,
    waterNeeds: 'medium',
    basePrice: 38,
    irrigationType: IRRIGATION_TYPES.SPRINKLER,
    farmingMethod: 'Sprinkler Method',
    difficulty: DIFFICULTY.MEDIUM,
    needsBorewell: true,
    soilType: 'tilled',
    farmingSteps: [
      { type: STEP_TYPES.PLOUGH, label: '🚜 Plough Field', desc: 'Deep ploughing to prepare seedbed', duration: 5, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.SOW, label: '🌰 Sow Seeds', desc: 'Drill wheat seeds in rows at proper depth', duration: 4, growthStage: GROWTH_STAGES.SOWING },
      { type: STEP_TYPES.IRRIGATE, label: '🔫 First Irrigation', desc: 'Turn on borewell for first sprinkler irrigation', duration: 5, growthStage: GROWTH_STAGES.SEEDLING, needsBorewell: true },
      { type: STEP_TYPES.WAIT, label: '🌱 Germination & Tillering', desc: 'Seeds sprout and begin tillering', duration: 10, growthStage: GROWTH_STAGES.SEEDLING },
      { type: STEP_TYPES.FERTILIZE, label: '🧪 Top Dressing', desc: 'Apply nitrogen fertilizer at tillering stage', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.IRRIGATE, label: '💧 Second Irrigation', desc: 'Irrigate at heading stage', duration: 5, growthStage: GROWTH_STAGES.GROWING, needsBorewell: true },
      { type: STEP_TYPES.WAIT, label: '🌼 Heading & Flowering', desc: 'Wheat heads emerge with grain-filled ears', duration: 10, growthStage: GROWTH_STAGES.FLOWERING },
      { type: STEP_TYPES.WAIT, label: '🌾 Ripening', desc: 'Grains harden and turn golden', duration: 8, growthStage: GROWTH_STAGES.RIPENING },
      { type: STEP_TYPES.HARVEST, label: '⚔️ Harvest Wheat', desc: 'Cut golden wheat stalks at base', duration: 5, growthStage: GROWTH_STAGES.HARVESTABLE },
    ],
  },

  /* ─── CORN ──────────────────────────────────────────────── */
  {
    id: 'corn',
    name: 'Corn',
    icon: '🌽',
    color: '#66bb6a',
    matureColor: '#f9a825',
    flowerColor: '#aed581',
    description: 'Tall grain crop with furrow irrigation. High yield.',
    growthDuration: 50,
    yieldValue: 90,
    waterNeeds: 'medium',
    basePrice: 35,
    irrigationType: IRRIGATION_TYPES.FURROW,
    farmingMethod: 'Ridge & Furrow',
    difficulty: DIFFICULTY.MEDIUM,
    needsBorewell: true,
    soilType: 'ridged',
    farmingSteps: [
      { type: STEP_TYPES.PLOUGH, label: '🚜 Plough Field', desc: 'Plough and prepare the soil', duration: 5, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.RIDGE, label: '〰️ Make Ridge & Furrows', desc: 'Create raised ridges with furrows for irrigation', duration: 5, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.SOW, label: '🌰 Sow Corn Seeds', desc: 'Plant seeds on top of ridges at 60cm spacing', duration: 4, growthStage: GROWTH_STAGES.SOWING },
      { type: STEP_TYPES.IRRIGATE, label: '💧 Furrow Irrigation', desc: 'Run borewell water through furrows', duration: 5, growthStage: GROWTH_STAGES.SEEDLING, needsBorewell: true },
      { type: STEP_TYPES.FERTILIZE, label: '🧪 Side Dressing', desc: 'Apply fertilizer beside corn rows', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '📈 Rapid Growth', desc: 'Corn grows tall with broad leaves', duration: 10, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '🌼 Tasseling & Silking', desc: 'Tassels appear at top, silks on cobs', duration: 8, growthStage: GROWTH_STAGES.FLOWERING },
      { type: STEP_TYPES.WAIT, label: '🌽 Cob Development', desc: 'Kernels fill and cobs mature', duration: 8, growthStage: GROWTH_STAGES.RIPENING },
      { type: STEP_TYPES.HARVEST, label: '🌽 Harvest Corn', desc: 'Pick mature cobs from stalks', duration: 5, growthStage: GROWTH_STAGES.HARVESTABLE },
    ],
  },

  /* ─── TOMATO ────────────────────────────────────────────── */
  {
    id: 'tomato',
    name: 'Tomato',
    icon: '🍅',
    color: '#43a047',
    matureColor: '#e53935',
    flowerColor: '#ffeb3b',
    description: 'Fruit vine crop with drip irrigation and staking.',
    growthDuration: 45,
    yieldValue: 80,
    waterNeeds: 'high',
    basePrice: 55,
    irrigationType: IRRIGATION_TYPES.DRIP,
    farmingMethod: 'Drip + Staking',
    difficulty: DIFFICULTY.HARD,
    needsBorewell: true,
    soilType: 'mulched',
    farmingSteps: [
      { type: STEP_TYPES.PLOUGH, label: '🚜 Plough Field', desc: 'Prepare beds for transplanting', duration: 4, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.MULCH, label: '🟤 Add Mulch Layer', desc: 'Spread organic mulch to retain moisture', duration: 4, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.INSTALL_DRIP, label: '💧 Install Drip Lines', desc: 'Lay drip irrigation tubing along rows', duration: 4, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.TRANSPLANT, label: '🌱 Transplant Seedlings', desc: 'Plant tomato seedlings beside drip emitters', duration: 4, growthStage: GROWTH_STAGES.SOWING },
      { type: STEP_TYPES.IRRIGATE, label: '💧 Start Drip Irrigation', desc: 'Turn on borewell for consistent drip watering', duration: 4, growthStage: GROWTH_STAGES.SEEDLING, needsBorewell: true },
      { type: STEP_TYPES.STAKE, label: '🪵 Install Stakes', desc: 'Add wooden stakes/trellises for vine support', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.FERTILIZE, label: '🧪 Fertigation', desc: 'Apply liquid fertilizer through drip system', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '🌼 Flowering', desc: 'Yellow flowers appear, fruits begin forming', duration: 8, growthStage: GROWTH_STAGES.FLOWERING },
      { type: STEP_TYPES.WAIT, label: '🍅 Fruit Ripening', desc: 'Green fruits turn red as they ripen', duration: 8, growthStage: GROWTH_STAGES.RIPENING },
      { type: STEP_TYPES.HARVEST, label: '🍅 Pick Tomatoes', desc: 'Hand-pick ripe red tomatoes from vines', duration: 4, growthStage: GROWTH_STAGES.HARVESTABLE },
    ],
  },

  /* ─── COTTON ────────────────────────────────────────────── */
  {
    id: 'cotton',
    name: 'Cotton',
    icon: '☁️',
    color: '#4caf50',
    matureColor: '#f5f5f5',
    flowerColor: '#fff9c4',
    description: 'Cash crop for black soil. Mostly rain-fed with minimal drip.',
    growthDuration: 75,
    yieldValue: 150,
    waterNeeds: 'low',
    basePrice: 65,
    irrigationType: IRRIGATION_TYPES.RAINFED,
    farmingMethod: 'Rain-fed / Minimal Drip',
    difficulty: DIFFICULTY.MEDIUM,
    needsBorewell: false,
    soilType: 'deep-tilled',
    farmingSteps: [
      { type: STEP_TYPES.PLOUGH, label: '🚜 Plough Field', desc: 'Initial ploughing to break the soil', duration: 5, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.DEEP_TILL, label: '⛏️ Deep Tillage', desc: 'Deep ploughing for cotton\'s deep root system', duration: 5, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.SOW, label: '🌰 Sow Cotton Seeds', desc: 'Plant cotton seeds at 90cm row spacing', duration: 4, growthStage: GROWTH_STAGES.SOWING },
      { type: STEP_TYPES.WAIT, label: '🌱 Germination', desc: 'Seeds sprout — cotton is mostly rain-fed', duration: 8, growthStage: GROWTH_STAGES.SEEDLING },
      { type: STEP_TYPES.FERTILIZE, label: '🧪 Apply Fertilizer', desc: 'Add nutrients to support branching', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '🌿 Vegetative Growth', desc: 'Cotton bush grows with multiple branches', duration: 12, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.PESTICIDE, label: '🛡️ Apply Pesticide', desc: 'Protect against bollworm and other pests', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '🌼 Flowering & Squares', desc: 'Creamy-yellow flowers form, then bolls develop', duration: 10, growthStage: GROWTH_STAGES.FLOWERING },
      { type: STEP_TYPES.WAIT, label: '☁️ Boll Opening', desc: 'Bolls crack open revealing white cotton lint', duration: 10, growthStage: GROWTH_STAGES.RIPENING },
      { type: STEP_TYPES.HARVEST, label: '☁️ Hand-pick Cotton', desc: 'Pick fluffy white cotton from open bolls', duration: 6, growthStage: GROWTH_STAGES.HARVESTABLE },
    ],
  },

  /* ─── POTATO ────────────────────────────────────────────── */
  {
    id: 'potato',
    name: 'Potato',
    icon: '🥔',
    color: '#558b2f',
    matureColor: '#8d6e63',
    flowerColor: '#ce93d8',
    description: 'Underground tuber crop with ridge and furrow method.',
    growthDuration: 40,
    yieldValue: 70,
    waterNeeds: 'medium',
    basePrice: 30,
    irrigationType: IRRIGATION_TYPES.FURROW,
    farmingMethod: 'Ridge & Furrow',
    difficulty: DIFFICULTY.EASY,
    needsBorewell: true,
    soilType: 'ridged',
    farmingSteps: [
      { type: STEP_TYPES.PLOUGH, label: '🚜 Plough Field', desc: 'Loosen soil deeply for tuber development', duration: 4, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.RIDGE, label: '〰️ Form Ridges', desc: 'Create raised ridges for planting tuber pieces', duration: 4, growthStage: GROWTH_STAGES.PLOUGHING },
      { type: STEP_TYPES.SOW, label: '🥔 Plant Tuber Pieces', desc: 'Place cut seed potatoes in ridges, eyes facing up', duration: 4, growthStage: GROWTH_STAGES.SOWING },
      { type: STEP_TYPES.IRRIGATE, label: '💧 First Irrigation', desc: 'Run borewell water through furrows', duration: 4, growthStage: GROWTH_STAGES.SEEDLING, needsBorewell: true },
      { type: STEP_TYPES.WAIT, label: '🌱 Sprouting', desc: 'Shoots emerge from soil ridges', duration: 8, growthStage: GROWTH_STAGES.SEEDLING },
      { type: STEP_TYPES.HILL_UP, label: '⛰️ Hill Up Soil', desc: 'Mound soil around stems to protect growing tubers', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.FERTILIZE, label: '🧪 Apply Fertilizer', desc: 'Add potash for tuber development', duration: 4, growthStage: GROWTH_STAGES.GROWING },
      { type: STEP_TYPES.WAIT, label: '🌼 Flowering', desc: 'Purple/white flowers appear — tubers forming below', duration: 6, growthStage: GROWTH_STAGES.FLOWERING },
      { type: STEP_TYPES.VINE_KILL, label: '🥀 Vine Kill', desc: 'Cut foliage to harden tuber skin before digging', duration: 4, growthStage: GROWTH_STAGES.RIPENING },
      { type: STEP_TYPES.HARVEST, label: '🥔 Dig & Harvest', desc: 'Dig up mature potatoes from the soil', duration: 5, growthStage: GROWTH_STAGES.HARVESTABLE },
    ],
  },
];

/* ─── Helper: get crop by id ──────────────────────────────── */
export function getCropById(id) {
  return CROPS.find(c => c.id === id) || null;
}

/* ─── Helper: get current growth stage from farming step index ─ */
export function getGrowthStageFromStep(crop, stepIndex) {
  if (!crop || !crop.farmingSteps) return GROWTH_STAGES.EMPTY;
  if (stepIndex < 0) return GROWTH_STAGES.EMPTY;
  if (stepIndex >= crop.farmingSteps.length) return GROWTH_STAGES.HARVESTABLE;
  return crop.farmingSteps[stepIndex].growthStage;
}

/* ─── Helper: get farming step progress as percentage ──────── */
export function getFarmingProgress(crop, stepIndex, stepProgress) {
  if (!crop || !crop.farmingSteps) return 0;
  const totalSteps = crop.farmingSteps.length;
  const completedStepsPct = (stepIndex / totalSteps) * 100;
  const currentStepPct = (stepProgress / 100) * (1 / totalSteps) * 100;
  return Math.min(100, completedStepsPct + currentStepPct);
}

/* ─── Soil quality labels ─────────────────────────────────── */
export const SOIL_QUALITY = {
  EXCELLENT: { label: 'Excellent', color: '#4caf50' },
  GOOD: { label: 'Good', color: '#8bc34a' },
  FAIR: { label: 'Fair', color: '#ffc107' },
  POOR: { label: 'Poor', color: '#ff9800' },
  DEPLETED: { label: 'Depleted', color: '#f44336' },
};

export function getSoilQualityFromValue(value) {
  if (value >= 80) return SOIL_QUALITY.EXCELLENT;
  if (value >= 60) return SOIL_QUALITY.GOOD;
  if (value >= 40) return SOIL_QUALITY.FAIR;
  if (value >= 20) return SOIL_QUALITY.POOR;
  return SOIL_QUALITY.DEPLETED;
}
