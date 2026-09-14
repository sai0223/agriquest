/* ═══════════════════════════════════════════════════════════════
   Farm State — Central state management for realistic farming
   Supports borewell toggle, crop-specific step workflows
   ═══════════════════════════════════════════════════════════════ */
import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  GROWTH_STAGES, STEP_TYPES, getCropById,
  getGrowthStageFromStep, getFarmingProgress, getSoilQualityFromValue
} from '../data/cropData.js';

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
    growthStage: GROWTH_STAGES.EMPTY,
    soilMoisture: 50 + Math.random() * 20,
    soilQuality: 60 + Math.random() * 30,
    health: 100,
    isWatered: false,
    isFertilized: false,
    lastWateredAt: null,
    plantedAt: null,

    /* ─── New: Farming step tracking ──────────────────── */
    farmingStepIndex: -1,    // which step we're on (-1 = not started)
    stepProgress: 0,         // progress within current step (0-100)
    isStepComplete: false,   // is the current step finished?
    needsAction: false,      // does the player need to do something?
    irrigationType: null,    // inherited from crop
    soilState: 'untilled',   // untilled | ploughed | puddled | ridged | mulched
    isFlooded: false,        // rice: standing water
    hasDripLines: false,     // tomato: drip irrigation installed
    hasStakes: false,        // tomato: vine supports
    hasRidges: false,        // corn/potato: ridge geometry
    isPesticided: false,     // cotton: pest protection
    isVineKilled: false,     // potato: vines cut
    isDrained: false,        // rice: field drained
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
  notifications: [],

  /* ─── Tool mode ─────────────────────────────────────────── */
  activeToolMode: null,

  /* ─── BOREWELL STATE ────────────────────────────────────── */
  borewellActive: false,
  borewellFlowProgress: 0,
  borewellWaterLevel: 1,

  /* ─── Farmer character state ────────────────────────────── */
  farmerState: {
    position: [...FARMER_IDLE_POSITION],
    targetPlotId: null,
    targetPosition: null,
    action: null,
    isMoving: false,
    isPerformingAction: false,
    actionProgress: 0,
    idlePosition: [...FARMER_IDLE_POSITION],
    returningHome: false,
  },
};

/* ─── Helper: Get the next required action for a plot ──────── */
function getNextStepInfo(plot) {
  if (!plot.cropId) return null;
  const crop = getCropById(plot.cropId);
  if (!crop) return null;
  const idx = plot.farmingStepIndex;
  if (idx < 0 || idx >= crop.farmingSteps.length) return null;
  return crop.farmingSteps[idx];
}

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

    /* ─── PLANT CROP — starts the farming workflow ─────────── */
    case 'PLANT_CROP': {
      const { plotId, cropId } = action;
      const plot = state.plots[plotId];
      if (!plot || plot.cropId) return state;
      const crop = getCropById(cropId);
      if (!crop) return state;

      return {
        ...state,
        plots: {
          ...state.plots,
          [plotId]: {
            ...plot,
            cropId,
            growthStage: GROWTH_STAGES.EMPTY,
            health: 100,
            isWatered: false,
            isFertilized: false,
            plantedAt: Date.now(),
            farmingStepIndex: 0,      // start at step 0
            stepProgress: 0,
            isStepComplete: false,
            needsAction: true,        // first step needs player action
            irrigationType: crop.irrigationType,
            soilState: 'untilled',
            isFlooded: false,
            hasDripLines: false,
            hasStakes: false,
            hasRidges: false,
            isPesticided: false,
            isVineKilled: false,
            isDrained: false,
          },
        },
        selectedPlotId: plotId,
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Selected ${crop.name} for plot ${plotId} — Start with: ${crop.farmingSteps[0].label}`, type: 'success' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════════
       PERFORM FARMING STEP — The main action dispatcher
       When the farmer completes an action, advance the step
       ═══════════════════════════════════════════════════════════ */
    case 'PERFORM_FARMING_STEP': {
      const { plotId } = action;
      const plot = state.plots[plotId];
      if (!plot || !plot.cropId) return state;

      const crop = getCropById(plot.cropId);
      if (!crop) return state;

      const stepIndex = plot.farmingStepIndex;
      if (stepIndex < 0 || stepIndex >= crop.farmingSteps.length) return state;

      const step = crop.farmingSteps[stepIndex];

      // Check if borewell is needed but not active
      if (step.needsBorewell && !state.borewellActive) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), message: `⚠️ Turn on the Borewell first! ${step.label} requires water.`, type: 'warning' },
          ],
        };
      }

      // Apply step-specific effects
      let updatedPlot = { ...plot };
      let extraNotifications = [];

      switch (step.type) {
        case STEP_TYPES.PLOUGH:
          updatedPlot.soilState = 'ploughed';
          break;
        case STEP_TYPES.PUDDLE:
          updatedPlot.soilState = 'puddled';
          updatedPlot.isFlooded = true;
          updatedPlot.isWatered = true;
          updatedPlot.soilMoisture = 100;
          break;
        case STEP_TYPES.DEEP_TILL:
          updatedPlot.soilState = 'deep-tilled';
          break;
        case STEP_TYPES.RIDGE:
          updatedPlot.hasRidges = true;
          updatedPlot.soilState = 'ridged';
          break;
        case STEP_TYPES.MULCH:
          updatedPlot.soilState = 'mulched';
          break;
        case STEP_TYPES.INSTALL_DRIP:
          updatedPlot.hasDripLines = true;
          break;
        case STEP_TYPES.SOW:
        case STEP_TYPES.TRANSPLANT:
          updatedPlot.growthStage = step.growthStage;
          break;
        case STEP_TYPES.IRRIGATE:
        case STEP_TYPES.MAINTAIN_WATER:
          updatedPlot.isWatered = true;
          updatedPlot.soilMoisture = Math.min(100, updatedPlot.soilMoisture + 40);
          updatedPlot.lastWateredAt = Date.now();
          if (crop.irrigationType?.id === 'flood') {
            updatedPlot.isFlooded = true;
          }
          break;
        case STEP_TYPES.FERTILIZE:
          updatedPlot.isFertilized = true;
          updatedPlot.soilQuality = Math.min(100, updatedPlot.soilQuality + 15);
          updatedPlot.health = Math.min(100, updatedPlot.health + 10);
          break;
        case STEP_TYPES.STAKE:
          updatedPlot.hasStakes = true;
          break;
        case STEP_TYPES.PESTICIDE:
          updatedPlot.isPesticided = true;
          updatedPlot.health = Math.min(100, updatedPlot.health + 15);
          break;
        case STEP_TYPES.HILL_UP:
          updatedPlot.soilState = 'hilled';
          break;
        case STEP_TYPES.VINE_KILL:
          updatedPlot.isVineKilled = true;
          break;
        case STEP_TYPES.DRAIN:
          updatedPlot.isFlooded = false;
          updatedPlot.isDrained = true;
          updatedPlot.soilMoisture = Math.max(30, updatedPlot.soilMoisture - 40);
          break;
        case STEP_TYPES.HARVEST: {
          // Harvest the crop!
          const yieldMultiplier = (updatedPlot.health / 100) * (updatedPlot.soilQuality / 100);
          const yieldAmount = Math.round((crop.yieldValue || 0) * yieldMultiplier);
          const profit = Math.round(yieldAmount * (crop.basePrice || 1) / 10);

          extraNotifications.push({
            id: Date.now() + 1,
            message: `🎉 Harvested ${crop.name}! Yield: ${yieldAmount} | Profit: ₹${profit}`,
            type: 'success',
          });

          return {
            ...state,
            plots: {
              ...state.plots,
              [plotId]: {
                ...createEmptyPlot(plot.row, plot.col),
                soilQuality: Math.max(20, updatedPlot.soilQuality - 10),
                soilMoisture: updatedPlot.soilMoisture,
              },
            },
            totalHarvested: state.totalHarvested + yieldAmount,
            totalProfit: state.totalProfit + profit,
            notifications: [
              ...state.notifications,
              ...extraNotifications,
            ],
          };
        }
        default:
          break;
      }

      // Advance to the next step or mark current step as in-progress
      const isWaitStep = step.type === STEP_TYPES.WAIT;
      const nextStepIndex = stepIndex + 1;
      const isLastStep = nextStepIndex >= crop.farmingSteps.length;

      updatedPlot.farmingStepIndex = nextStepIndex;
      updatedPlot.stepProgress = 0;
      updatedPlot.isStepComplete = false;
      updatedPlot.growthStage = step.growthStage;

      // If next step is a WAIT step, it auto-progresses (no player action needed)
      if (!isLastStep) {
        const nextStep = crop.farmingSteps[nextStepIndex];
        updatedPlot.needsAction = nextStep.type !== STEP_TYPES.WAIT;
      } else {
        updatedPlot.needsAction = false;
        updatedPlot.growthStage = GROWTH_STAGES.HARVESTABLE;
      }

      return {
        ...state,
        plots: {
          ...state.plots,
          [plotId]: updatedPlot,
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `✅ ${step.label} complete on ${plotId}`, type: 'success' },
          ...extraNotifications,
        ],
      };
    }

    /* ─── BOREWELL TOGGLE ──────────────────────────────────── */
    case 'TOGGLE_BOREWELL':
      return {
        ...state,
        borewellActive: !state.borewellActive,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            message: state.borewellActive ? '🔴 Borewell turned OFF' : '🟢 Borewell turned ON — Water flowing!',
            type: state.borewellActive ? 'warning' : 'success',
          },
        ],
      };

    /* ─── UPDATE BOREWELL FLOW ─────────────────────────────── */
    case 'UPDATE_BOREWELL_FLOW':
      return {
        ...state,
        borewellFlowProgress: action.progress,
      };

    /* ─── LEGACY ACTIONS (kept for compatibility) ──────────── */
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

    case 'REMOVE_CROP': {
      const plot = state.plots[action.plotId];
      if (!plot || !plot.cropId) return state;
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: createEmptyPlot(plot.row, plot.col),
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), message: `Removed crop from ${action.plotId}`, type: 'warning' },
        ],
      };
    }

    case 'SET_GROWTH_SPEED':
      return { ...state, growthSpeed: action.speed };

    /* ═══════════════════════════════════════════════════════════
       TICK GROWTH — Auto-progress WAIT steps + moisture drain
       ═══════════════════════════════════════════════════════════ */
    case 'TICK_GROWTH': {
      const newPlots = { ...state.plots };
      let changed = false;

      Object.keys(newPlots).forEach(plotId => {
        const plot = newPlots[plotId];
        if (!plot.cropId) return;

        const crop = getCropById(plot.cropId);
        if (!crop) return;

        const stepIndex = plot.farmingStepIndex;
        if (stepIndex < 0 || stepIndex >= crop.farmingSteps.length) return;

        const step = crop.farmingSteps[stepIndex];

        // Only auto-progress WAIT steps
        if (step.type === STEP_TYPES.WAIT) {
          // Check if borewell is needed for this wait step
          if (step.needsBorewell && !state.borewellActive) {
            // Stall — crop needs water but borewell is off
            let newHealth = Math.max(0, plot.health - 0.15 * state.growthSpeed);
            if (newHealth !== plot.health) {
              changed = true;
              newPlots[plotId] = { ...plot, health: newHealth };
            }
            return;
          }

          const progressPerTick = (100 / step.duration) * state.growthSpeed;
          const fertBonus = plot.isFertilized ? 1.25 : 1.0;
          const healthFactor = plot.health / 100;
          const newProgress = Math.min(100, plot.stepProgress + progressPerTick * fertBonus * healthFactor);

          changed = true;

          if (newProgress >= 100) {
            // Auto-advance to next step
            const nextIndex = stepIndex + 1;
            const isLast = nextIndex >= crop.farmingSteps.length;

            if (isLast) {
              newPlots[plotId] = {
                ...plot,
                farmingStepIndex: nextIndex,
                stepProgress: 100,
                isStepComplete: true,
                needsAction: false,
                growthStage: GROWTH_STAGES.HARVESTABLE,
              };
            } else {
              const nextStep = crop.farmingSteps[nextIndex];
              newPlots[plotId] = {
                ...plot,
                farmingStepIndex: nextIndex,
                stepProgress: 0,
                isStepComplete: false,
                needsAction: nextStep.type !== STEP_TYPES.WAIT,
                growthStage: nextStep.growthStage,
              };
            }
          } else {
            newPlots[plotId] = {
              ...plot,
              stepProgress: newProgress,
              growthStage: step.growthStage,
            };
          }
        }

        // Degrade moisture over time
        const moistureDrain = 0.15 * state.growthSpeed;
        const currentPlot = newPlots[plotId] || plot;
        const newMoisture = Math.max(0, currentPlot.soilMoisture - moistureDrain);

        if (newMoisture !== currentPlot.soilMoisture) {
          changed = true;
          newPlots[plotId] = {
            ...currentPlot,
            soilMoisture: newMoisture,
            isWatered: newMoisture > 10,
          };
        }

        // If borewell is active and plot needs water, replenish
        if (state.borewellActive && currentPlot.cropId) {
          const cropData = getCropById(currentPlot.cropId);
          if (cropData && cropData.needsBorewell) {
            const replenish = newPlots[plotId] || currentPlot;
            if (replenish.soilMoisture < 80) {
              changed = true;
              newPlots[plotId] = {
                ...replenish,
                soilMoisture: Math.min(100, replenish.soilMoisture + 0.5 * state.growthSpeed),
                isWatered: true,
              };
            }
          }
        }

        // Health degradation from low moisture
        const finalPlot = newPlots[plotId] || plot;
        if (finalPlot.soilMoisture < 15 && finalPlot.cropId) {
          const newHealth = Math.max(0, finalPlot.health - 0.1 * state.growthSpeed);
          if (newHealth !== finalPlot.health) {
            changed = true;
            newPlots[plotId] = { ...finalPlot, health: newHealth };
          }
        }
      });

      // Update borewell flow animation
      let newFlowProgress = state.borewellFlowProgress;
      if (state.borewellActive) {
        newFlowProgress = (state.borewellFlowProgress + 0.01 * state.growthSpeed) % 1;
        changed = true;
      }

      return changed ? { ...state, plots: newPlots, borewellFlowProgress: newFlowProgress } : state;
    }

    /* ─── Tool Mode ────────────────────────────────────────── */
    case 'SET_TOOL_MODE':
      return {
        ...state,
        activeToolMode: action.mode,
        plantingMode: action.mode ? false : state.plantingMode,
        selectedCropId: action.mode ? null : state.selectedCropId,
      };

    /* ─── Farmer Actions ───────────────────────────────────── */
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
      const farmerAction = state.farmerState.action;
      const targetPlotId = state.farmerState.targetPlotId;
      let updatedState = { ...state };

      // If the action is 'farming_step', dispatch the step
      if (farmerAction === 'farming_step' && targetPlotId) {
        return farmReducer(
          {
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
          },
          { type: 'PERFORM_FARMING_STEP', plotId: targetPlotId }
        );
      }

      // Legacy water/fertilize actions
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
    removeCrop: (plotId) => dispatch({ type: 'REMOVE_CROP', plotId }),
    setGrowthSpeed: (speed) => dispatch({ type: 'SET_GROWTH_SPEED', speed }),
    tickGrowth: () => dispatch({ type: 'TICK_GROWTH' }),
    dismissNotification: (id) => dispatch({ type: 'DISMISS_NOTIFICATION', id }),
    clearOldNotifications: () => dispatch({ type: 'CLEAR_OLD_NOTIFICATIONS' }),
    setToolMode: (mode) => dispatch({ type: 'SET_TOOL_MODE', mode }),

    /* ─── New actions ─────────────────────────────────────── */
    toggleBorewell: () => dispatch({ type: 'TOGGLE_BOREWELL' }),
    performFarmingStep: (plotId) => dispatch({ type: 'PERFORM_FARMING_STEP', plotId }),
    updateBorewellFlow: (progress) => dispatch({ type: 'UPDATE_BOREWELL_FLOW', progress }),

    /* ─── Farmer actions ──────────────────────────────────── */
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
      borewellActive: state.borewellActive,
    };
  }, [plots, state.totalHarvested, state.totalProfit, state.borewellActive]);
}

export { ROWS, COLS, ROW_LABELS, FARMER_IDLE_POSITION };
