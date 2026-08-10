/* ═══════════════════════════════════════════════════════════════
   Crop Data — Definitions for all available crop types
   ═══════════════════════════════════════════════════════════════ */

export const GROWTH_STAGES = {
  EMPTY: 'EMPTY',
  SEED: 'SEED',
  SPROUT: 'SPROUT',
  GROWING: 'GROWING',
  MATURE: 'MATURE',
  HARVESTABLE: 'HARVESTABLE',
};

export const STAGE_THRESHOLDS = {
  SEED: 0,
  SPROUT: 10,
  GROWING: 30,
  MATURE: 60,
  HARVESTABLE: 90,
};

export function getStageFromProgress(progress) {
  if (progress >= STAGE_THRESHOLDS.HARVESTABLE) return GROWTH_STAGES.HARVESTABLE;
  if (progress >= STAGE_THRESHOLDS.MATURE) return GROWTH_STAGES.MATURE;
  if (progress >= STAGE_THRESHOLDS.GROWING) return GROWTH_STAGES.GROWING;
  if (progress >= STAGE_THRESHOLDS.SPROUT) return GROWTH_STAGES.SPROUT;
  return GROWTH_STAGES.SEED;
}

export const CROPS = [
  {
    id: 'rice',
    name: 'Rice',
    icon: '🌾',
    color: '#7cb342',
    matureColor: '#c6a700',
    description: 'Water-intensive paddy crop. Thrives in wet conditions.',
    growthDuration: 60, // seconds at 1x
    yieldValue: 120,
    waterNeeds: 'high',
    basePrice: 45,
  },
  {
    id: 'wheat',
    name: 'Wheat',
    icon: '🌿',
    color: '#8bc34a',
    matureColor: '#d4a017',
    description: 'Hardy winter staple. Moderate water requirements.',
    growthDuration: 50,
    yieldValue: 100,
    waterNeeds: 'medium',
    basePrice: 38,
  },
  {
    id: 'corn',
    name: 'Corn',
    icon: '🌽',
    color: '#66bb6a',
    matureColor: '#f9a825',
    description: 'Tall grain crop. High yield, versatile use.',
    growthDuration: 45,
    yieldValue: 90,
    waterNeeds: 'medium',
    basePrice: 35,
  },
  {
    id: 'tomato',
    name: 'Tomato',
    icon: '🍅',
    color: '#43a047',
    matureColor: '#e53935',
    description: 'Fruit-bearing vine crop. Needs consistent moisture.',
    growthDuration: 40,
    yieldValue: 80,
    waterNeeds: 'high',
    basePrice: 55,
  },
  {
    id: 'cotton',
    name: 'Cotton',
    icon: '☁️',
    color: '#4caf50',
    matureColor: '#f5f5f5',
    description: 'Cash crop for black soil. Long growth cycle.',
    growthDuration: 70,
    yieldValue: 150,
    waterNeeds: 'low',
    basePrice: 65,
  },
  {
    id: 'potato',
    name: 'Potato',
    icon: '🥔',
    color: '#558b2f',
    matureColor: '#8d6e63',
    description: 'Underground tuber. Cool weather preferred.',
    growthDuration: 35,
    yieldValue: 70,
    waterNeeds: 'medium',
    basePrice: 30,
  },
];

export function getCropById(id) {
  return CROPS.find(c => c.id === id) || null;
}

/* Soil quality labels */
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
