/* ═══════════════════════════════════════════════════════════════
   Farm State — Central state management for the 3D farm
   ═══════════════════════════════════════════════════════════════ */
import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { GROWTH_STAGES, getStageFromProgress, getCropById, getSoilQualityFromValue } from '../data/cropData.js';

/* ─── Grid setup ──────────────────────────────────────────── */
const ROWS = 4;
const COLS = 4;
const ROW_LABELS = ['A', 'B', 'C', 'D'];

function createPlotId(row, col) {
  return `${ROW_LABELS[row]}${col + 1}`;
}

function createEmptyPlot(row, col) {
  return {
    id: createPlotId(row, col),
    row,
    col,
    cropId: null,
    growthProgress: 0,
    growthStage: GROWTH_STAGES.EMPTY,
    soilMoisture: 50 + Math.random() * 20,  // 50-70
    soilQuality: 60 + Math.random() * 30,   // 60-90
    health: 100,
    isWatered: false,
    isFertilized: false,
    lastWateredAt: null,
    plantedAt: null,
  };
}

function createInitialPlots() {
  const plots = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = createPlotId(r, c);
      plots[id] = createEmptyPlot(r, c);
    }
  }
  return plots;
}

/* ─── Farmer idle position (near farmhouse) ───────────────── */
const FARMER_IDLE_POSITION = [-6, 0, -3.5];

const initialState = {
  plots: createInitialPlots(),
  selectedPlotId: null,
  selectedCropId: null,
  plantingMode: false,
  growthSpeed: 1,
  totalHarvested: 0,
  totalProfit: 0,
  notifications: [], // { id, message, type }

  /* ─── Tool mode (water / fertilize free-painting) ──────── */
  activeToolMode: null, // null | 'water' | 'fertilize'

  /* ─── Farmer character state ───────────────────────────── */
  farmerState: {
    position: [...FARMER_IDLE_POSITION],
    targetPlotId: null,
    targetPosition: null,
    action: null,       // 'water' | 'fertilize' | 'plant' | 'harvest' | null
    isMoving: false,
    isPerformingAction: false,
    actionProgress: 0,  // 0-100
    idlePosition: [...FARMER_IDLE_POSITION],
    returningHome: false,
  },
};

/* ─── Reducer ─────────────────────────────────────────────── */
function farmReducer(state, action) {
  switch (action.type) {
    case 'SELECT_PLOT':
      return { ...state, selectedPlotId: action.plotId };

    case 'SELECT_CROP':
      return {
        ...state,
        selectedCropId: action.cropId,
        plantingMode: action.cropId !== null,
      };

    case 'PLANT_CROP': {
      const { plotId, cropId } = action;
      const plot = state.plots[plotId];
      if (!plot || plot.cropId) return state;
      return {
        ...state,
        plots: {
          ...state.plots,
          [plotId]: {
            ...plot,
            cropId,
            growthProgress: 0,
            growthStage: GROWTH_STAGES.SEED,
            health: 100,
            isWatered: false,
            isFertilized: false,
            plantedAt: Date.now(),
          },
        },
        selectedPlotId: plotId,
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Planted ${getCropById(cropId)?.name} on ${plotId}`, type: 'success' },
        ],
      };
    }

    case 'WATER_PLOT': {
      const plot = state.plots[action.plotId];
      if (!plot || !plot.cropId) return state;
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...plot,
            isWatered: true,
            soilMoisture: Math.min(100, plot.soilMoisture + 30),
            lastWateredAt: Date.now(),
          },
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Watered plot ${action.plotId}`, type: 'info' },
        ],
      };
    }

    case 'FERTILIZE_PLOT': {
      const plot = state.plots[action.plotId];
      if (!plot || !plot.cropId) return state;
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...plot,
            isFertilized: true,
            soilQuality: Math.min(100, plot.soilQuality + 20),
            health: Math.min(100, plot.health + 10),
          },
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Fertilized plot ${action.plotId}`, type: 'info' },
        ],
      };
    }

    case 'HARVEST_PLOT': {
      const plot = state.plots[action.plotId];
      if (!plot || !plot.cropId || plot.growthStage !== GROWTH_STAGES.HARVESTABLE) return state;
      const crop = getCropById(plot.cropId);
      const yieldMultiplier = (plot.health / 100) * (plot.soilQuality / 100);
      const yieldAmount = Math.round((crop?.yieldValue || 0) * yieldMultiplier);
      const profit = Math.round(yieldAmount * (crop?.basePrice || 1) / 10);

      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...plot,
            cropId: null,
            growthProgress: 0,
            growthStage: GROWTH_STAGES.EMPTY,
            isWatered: false,
            isFertilized: false,
            soilQuality: Math.max(20, plot.soilQuality - 10),
            plantedAt: null,
          },
        },
        totalHarvested: state.totalHarvested + yieldAmount,
        totalProfit: state.totalProfit + profit,
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Harvested ${crop?.name}! Yield: ${yieldAmount} | Profit: $${profit}`, type: 'success' },
        ],
      };
    }

    case 'REMOVE_CROP': {
      const plot = state.plots[action.plotId];
      if (!plot || !plot.cropId) return state;
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...plot,
            cropId: null,
            growthProgress: 0,
            growthStage: GROWTH_STAGES.EMPTY,
            isWatered: false,
            isFertilized: false,
            plantedAt: null,
          },
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Removed crop from ${action.plotId}`, type: 'warning' },
        ],
      };
    }

    case 'SET_GROWTH_SPEED':
      return { ...state, growthSpeed: action.speed };

    case 'TICK_GROWTH': {
      const newPlots = { ...state.plots };
      let changed = false;

      Object.keys(newPlots).forEach(plotId => {
        const plot = newPlots[plotId];
        if (!plot.cropId || plot.growthStage === GROWTH_STAGES.HARVESTABLE) return;

        const crop = getCropById(plot.cropId);
        if (!crop) return;

        // Only grow if watered
        if (!plot.isWatered) return;

        const progressIncrement = (100 / crop.growthDuration) * state.growthSpeed;
        const fertilizerBonus = plot.isFertilized ? 1.3 : 1.0;
        const healthFactor = plot.health / 100;
        const newProgress = Math.min(100, plot.growthProgress + progressIncrement * fertilizerBonus * healthFactor);
        const newStage = getStageFromProgress(newProgress);

        // Degrade moisture over time
        const moistureDrain = 0.3 * state.growthSpeed;
        const newMoisture = Math.max(0, plot.soilMoisture - moistureDrain);

        // If moisture drops to 0, stop watering
        const stillWatered = newMoisture > 5;

        // Health affected by low moisture
        let newHealth = plot.health;
        if (newMoisture < 20) {
          newHealth = Math.max(0, newHealth - 0.2 * state.growthSpeed);
        }

        if (newProgress !== plot.growthProgress || newMoisture !== plot.soilMoisture) {
          changed = true;
          newPlots[plotId] = {
            ...plot,
            growthProgress: newProgress,
            growthStage: newStage,
            soilMoisture: newMoisture,
            isWatered: stillWatered,
            health: newHealth,
          };
        }
      });

      return changed ? { ...state, plots: newPlots } : state;
    }

    /* ─── Tool Mode ─────────────────────────────────────────── */
    case 'SET_TOOL_MODE':
      return {
        ...state,
        activeToolMode: action.mode,
        // Clear planting mode when entering tool mode
        plantingMode: action.mode ? false : state.plantingMode,
        selectedCropId: action.mode ? null : state.selectedCropId,
      };

    /* ─── Farmer Actions ────────────────────────────────────── */
    case 'START_FARMER_ACTION':
      return {
        ...state,
        selectedPlotId: action.plotId,
        farmerState: {
          ...state.farmerState,
          targetPlotId: action.plotId,
          targetPosition: action.targetPosition,
          action: action.farmerAction,
          isMoving: true,
          isPerformingAction: false,
          actionProgress: 0,
          returningHome: false,
        },
      };

    case 'FARMER_ARRIVED_AT_PLOT':
      return {
        ...state,
        farmerState: {
          ...state.farmerState,
          isMoving: false,
          isPerformingAction: true,
          actionProgress: 0,
          position: state.farmerState.targetPosition
            ? [...state.farmerState.targetPosition]
            : state.farmerState.position,
        },
      };

    case 'UPDATE_FARMER_POSITION':
      return {
        ...state,
        farmerState: {
          ...state.farmerState,
          position: action.position,
        },
      };

    case 'FARMER_ACTION_PROGRESS':
      return {
        ...state,
        farmerState: {
          ...state.farmerState,
          actionProgress: action.progress,
        },
      };

    case 'COMPLETE_FARMER_ACTION': {
      // Apply the actual farming action when the farmer finishes
      const farmerAction = state.farmerState.action;
      const targetPlotId = state.farmerState.targetPlotId;
      let updatedState = { ...state };

      if (farmerAction === 'water' && targetPlotId) {
        const plot = updatedState.plots[targetPlotId];
        if (plot && plot.cropId) {
          updatedState = {
            ...updatedState,
            plots: {
              ...updatedState.plots,
              [targetPlotId]: {
                ...plot,
                isWatered: true,
                soilMoisture: Math.min(100, plot.soilMoisture + 30),
                lastWateredAt: Date.now(),
              },
            },
            notifications: [
              ...updatedState.notifications,
              { id: Date.now(), message: `Farmer watered plot ${targetPlotId}`, type: 'info' },
            ],
          };
        }
      } else if (farmerAction === 'fertilize' && targetPlotId) {
        const plot = updatedState.plots[targetPlotId];
        if (plot && plot.cropId) {
          updatedState = {
            ...updatedState,
            plots: {
              ...updatedState.plots,
              [targetPlotId]: {
                ...plot,
                isFertilized: true,
                soilQuality: Math.min(100, plot.soilQuality + 20),
                health: Math.min(100, plot.health + 10),
              },
            },
            notifications: [
              ...updatedState.notifications,
              { id: Date.now(), message: `Farmer fertilized plot ${targetPlotId}`, type: 'info' },
            ],
          };
        }
      }

      return {
        ...updatedState,
        farmerState: {
          ...updatedState.farmerState,
          isPerformingAction: false,
          actionProgress: 100,
          returningHome: true,
          targetPlotId: null,
          action: null,
        },
        activeToolMode: null,
      };
    }

    case 'FARMER_RETURNED_HOME':
      return {
        ...state,
        farmerState: {
          ...state.farmerState,
          position: [...FARMER_IDLE_POSITION],
          isMoving: false,
          returningHome: false,
          targetPlotId: null,
          targetPosition: null,
          action: null,
          isPerformingAction: false,
          actionProgress: 0,
        },
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      };

    case 'CLEAR_OLD_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.slice(-5),
      };

    default:
      return state;
  }
}

/* ─── Context ─────────────────────────────────────────────── */
const FarmStateContext = createContext(null);

export function FarmStateProvider({ children }) {
  const [state, dispatch] = useReducer(farmReducer, initialState);

  const actions = useMemo(() => ({
    selectPlot: (plotId) => dispatch({ type: 'SELECT_PLOT', plotId }),
    selectCrop: (cropId) => dispatch({ type: 'SELECT_CROP', cropId }),
    plantCrop: (plotId, cropId) => dispatch({ type: 'PLANT_CROP', plotId, cropId }),
    waterPlot: (plotId) => dispatch({ type: 'WATER_PLOT', plotId }),
    fertilizePlot: (plotId) => dispatch({ type: 'FERTILIZE_PLOT', plotId }),
    harvestPlot: (plotId) => dispatch({ type: 'HARVEST_PLOT', plotId }),
    removeCrop: (plotId) => dispatch({ type: 'REMOVE_CROP', plotId }),
    setGrowthSpeed: (speed) => dispatch({ type: 'SET_GROWTH_SPEED', speed }),
    tickGrowth: () => dispatch({ type: 'TICK_GROWTH' }),
    dismissNotification: (id) => dispatch({ type: 'DISMISS_NOTIFICATION', id }),
    clearOldNotifications: () => dispatch({ type: 'CLEAR_OLD_NOTIFICATIONS' }),
    setToolMode: (mode) => dispatch({ type: 'SET_TOOL_MODE', mode }),
    startFarmerAction: (plotId, targetPosition, farmerAction) =>
      dispatch({ type: 'START_FARMER_ACTION', plotId, targetPosition, farmerAction }),
    farmerArrivedAtPlot: () => dispatch({ type: 'FARMER_ARRIVED_AT_PLOT' }),
    updateFarmerPosition: (position) => dispatch({ type: 'UPDATE_FARMER_POSITION', position }),
    farmerActionProgress: (progress) => dispatch({ type: 'FARMER_ACTION_PROGRESS', progress }),
    completeFarmerAction: () => dispatch({ type: 'COMPLETE_FARMER_ACTION' }),
    farmerReturnedHome: () => dispatch({ type: 'FARMER_RETURNED_HOME' }),
  }), []);

  return (
    <FarmStateContext.Provider value={{ state, actions }}>
      {children}
    </FarmStateContext.Provider>
  );
}

export function useFarmState() {
  const ctx = useContext(FarmStateContext);
  if (!ctx) throw new Error('useFarmState must be used within FarmStateProvider');
  return ctx;
}

/* ─── Computed Stats Hook ─────────────────────────────────── */
export function useFarmStats() {
  const { state } = useFarmState();
  const plots = Object.values(state.plots);

  return useMemo(() => {
    const totalPlots = plots.length;
    const plantedPlots = plots.filter(p => p.cropId !== null).length;
    const healthyCrops = plots.filter(p => p.cropId && p.health >= 60).length;
    const avgMoisture = plots.reduce((s, p) => s + p.soilMoisture, 0) / totalPlots;
    const avgQuality = plots.reduce((s, p) => s + p.soilQuality, 0) / totalPlots;
    const harvestReady = plots.filter(p => p.growthStage === GROWTH_STAGES.HARVESTABLE).length;

    // Estimate expected yield from currently planted crops
    const expectedYield = plots.reduce((sum, p) => {
      if (!p.cropId) return sum;
      const crop = getCropById(p.cropId);
      if (!crop) return sum;
      const factor = (p.health / 100) * (p.soilQuality / 100);
      return sum + Math.round(crop.yieldValue * factor);
    }, 0);

    return {
      totalPlots,
      plantedPlots,
      healthyCrops,
      avgMoisture: Math.round(avgMoisture),
      avgQuality: Math.round(avgQuality),
      qualityLabel: getSoilQualityFromValue(avgQuality),
      harvestReady,
      expectedYield,
      totalHarvested: state.totalHarvested,
      totalProfit: state.totalProfit,
    };
  }, [plots, state.totalHarvested, state.totalProfit]);
}

export { ROWS, COLS, ROW_LABELS, FARMER_IDLE_POSITION };
