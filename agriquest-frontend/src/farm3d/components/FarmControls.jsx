/* ═══════════════════════════════════════════════════════════════
   FarmControls — Action buttons with tool modes + growth speed
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';
import { useFarmState } from '../simulation/farmState.jsx';
import { GROWTH_STAGES, getCropById } from '../data/cropData.js';
import { getPlotPosition } from './FarmPlot.jsx';

export default function FarmControls() {
  const { state, actions } = useFarmState();
  const selectedPlot = state.selectedPlotId ? state.plots[state.selectedPlotId] : null;

  const hasCrop = selectedPlot?.cropId != null;
  const isHarvestable = selectedPlot?.growthStage === GROWTH_STAGES.HARVESTABLE;
  const canPlant = selectedPlot && !hasCrop && state.selectedCropId;
  const canWater = hasCrop && !selectedPlot?.isWatered;
  const canFertilize = hasCrop && !selectedPlot?.isFertilized;

  const isWaterToolActive = state.activeToolMode === 'water';
  const isFertilizeToolActive = state.activeToolMode === 'fertilize';
  const farmerBusy = state.farmerState.isMoving || state.farmerState.isPerformingAction;

  const handlePlant = () => {
    if (!canPlant) return;
    actions.plantCrop(state.selectedPlotId, state.selectedCropId);
  };

  /* Toggle water tool mode — or if a plot is selected, send farmer directly */
  const handleWater = () => {
    if (farmerBusy) return;
    if (isWaterToolActive) {
      // Turn off tool mode
      actions.setToolMode(null);
      return;
    }
    // If a plot is already selected and can be watered, send farmer there
    if (canWater && selectedPlot) {
      const pos = getPlotPosition(selectedPlot.row, selectedPlot.col);
      actions.setToolMode('water');
      actions.startFarmerAction(selectedPlot.id, pos, 'water');
      return;
    }
    // Otherwise just enter tool mode for free-select
    actions.setToolMode('water');
  };

  /* Toggle fertilize tool mode */
  const handleFertilize = () => {
    if (farmerBusy) return;
    if (isFertilizeToolActive) {
      actions.setToolMode(null);
      return;
    }
    if (canFertilize && selectedPlot) {
      const pos = getPlotPosition(selectedPlot.row, selectedPlot.col);
      actions.setToolMode('fertilize');
      actions.startFarmerAction(selectedPlot.id, pos, 'fertilize');
      return;
    }
    actions.setToolMode('fertilize');
  };

  const handleHarvest = () => {
    if (!isHarvestable || farmerBusy) return;
    if (selectedPlot) {
      const pos = getPlotPosition(selectedPlot.row, selectedPlot.col);
      actions.startFarmerAction(selectedPlot.id, pos, 'harvest');
    }
  };

  const handleRemove = () => {
    if (!hasCrop || farmerBusy) return;
    actions.removeCrop(state.selectedPlotId);
  };

  const handleCancelTool = () => {
    actions.setToolMode(null);
  };

  return (
    <div className="farm3d-controls">
      <div className="farm3d-panel-header">
        <span className="farm3d-panel-icon">🛠️</span>
        <h3 className="farm3d-panel-title">Actions</h3>
      </div>

      {/* Active tool mode indicator */}
      {state.activeToolMode && (
        <div className="farm3d-tool-mode-indicator">
          <div className="farm3d-tool-mode-badge">
            <span>{state.activeToolMode === 'water' ? '💧' : '🧪'}</span>
            <span>{state.activeToolMode === 'water' ? 'Water Tool' : 'Fertilizer Tool'} Active</span>
          </div>
          <p className="farm3d-tool-mode-hint">
            Click a plot with a crop to send the farmer
          </p>
          <button className="farm3d-tool-cancel-btn" onClick={handleCancelTool}>
            ✕ Cancel Tool
          </button>
        </div>
      )}

      {/* Farmer status */}
      {farmerBusy && (
        <div className="farm3d-farmer-status">
          <div className="farm3d-farmer-status-dot" />
          <span>
            {state.farmerState.isMoving
              ? `🚶 Farmer walking to ${state.farmerState.targetPlotId}...`
              : `🌾 Farmer ${state.farmerState.action}ing...`}
          </span>
          {state.farmerState.isPerformingAction && (
            <div className="farm3d-farmer-progress">
              <div
                className="farm3d-farmer-progress-fill"
                style={{ width: `${state.farmerState.actionProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="farm3d-action-grid">
        <button
          className={`farm3d-action-btn farm3d-action-btn--plant${canPlant ? ' active' : ''}`}
          onClick={handlePlant}
          disabled={!canPlant || farmerBusy}
          title="Plant selected crop on selected plot"
        >
          <span className="farm3d-action-btn__icon">🌱</span>
          <span className="farm3d-action-btn__label">Plant</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--water${isWaterToolActive ? ' tool-active' : canWater ? ' active' : ''}`}
          onClick={handleWater}
          disabled={farmerBusy}
          title={isWaterToolActive ? 'Click to cancel water tool' : 'Activate water tool — click a plot to send farmer'}
        >
          <span className="farm3d-action-btn__icon">💧</span>
          <span className="farm3d-action-btn__label">{isWaterToolActive ? 'Watering...' : 'Water'}</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--fertilize${isFertilizeToolActive ? ' tool-active' : canFertilize ? ' active' : ''}`}
          onClick={handleFertilize}
          disabled={farmerBusy}
          title={isFertilizeToolActive ? 'Click to cancel fertilize tool' : 'Activate fertilize tool — click a plot to send farmer'}
        >
          <span className="farm3d-action-btn__icon">🧪</span>
          <span className="farm3d-action-btn__label">{isFertilizeToolActive ? 'Fertilizing...' : 'Fertilize'}</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--harvest${isHarvestable ? ' active' : ''}`}
          onClick={handleHarvest}
          disabled={!isHarvestable || farmerBusy}
          title="Harvest mature crop — farmer will go collect"
        >
          <span className="farm3d-action-btn__icon">🌾</span>
          <span className="farm3d-action-btn__label">Harvest</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--remove${hasCrop ? ' active' : ''}`}
          onClick={handleRemove}
          disabled={!hasCrop || farmerBusy}
          title="Remove crop from plot"
        >
          <span className="farm3d-action-btn__icon">❌</span>
          <span className="farm3d-action-btn__label">Remove</span>
        </button>
      </div>

      {/* Growth Speed Slider */}
      <div className="farm3d-speed-control">
        <div className="farm3d-speed-control__header">
          <span>⚡ Growth Speed</span>
          <span className="farm3d-speed-value">{state.growthSpeed}x</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={state.growthSpeed}
          onChange={(e) => actions.setGrowthSpeed(parseFloat(e.target.value))}
          className="farm3d-speed-slider"
        />
        <div className="farm3d-speed-labels">
          <span>1x</span>
          <span>3x</span>
          <span>5x</span>
        </div>
      </div>

      {/* Quick tips */}
      <div className="farm3d-controls-tip">
        <strong>💡 Tips:</strong>
        <ul>
          <li>Select a crop → click empty plot to plant</li>
          <li>Click 💧 Water → select a plot → farmer goes to water</li>
          <li>Click 🧪 Fertilize → select a plot → farmer spreads fertilizer</li>
          <li>Harvest when golden ring appears</li>
        </ul>
      </div>
    </div>
  );
}
