/* ═══════════════════════════════════════════════════════════════
   FarmControls — Action buttons + growth speed slider
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';
import { useFarmState } from '../simulation/farmState.jsx';
import { GROWTH_STAGES, getCropById } from '../data/cropData.js';

export default function FarmControls() {
  const { state, actions } = useFarmState();
  const selectedPlot = state.selectedPlotId ? state.plots[state.selectedPlotId] : null;

  const hasCrop = selectedPlot?.cropId != null;
  const isHarvestable = selectedPlot?.growthStage === GROWTH_STAGES.HARVESTABLE;
  const canPlant = selectedPlot && !hasCrop && state.selectedCropId;
  const canWater = hasCrop && !selectedPlot?.isWatered;
  const canFertilize = hasCrop && !selectedPlot?.isFertilized;

  const handlePlant = () => {
    if (!canPlant) return;
    actions.plantCrop(state.selectedPlotId, state.selectedCropId);
  };

  const handleWater = () => {
    if (!canWater) return;
    actions.waterPlot(state.selectedPlotId);
  };

  const handleFertilize = () => {
    if (!canFertilize) return;
    actions.fertilizePlot(state.selectedPlotId);
  };

  const handleHarvest = () => {
    if (!isHarvestable) return;
    actions.harvestPlot(state.selectedPlotId);
  };

  const handleRemove = () => {
    if (!hasCrop) return;
    actions.removeCrop(state.selectedPlotId);
  };

  return (
    <div className="farm3d-controls">
      <div className="farm3d-panel-header">
        <span className="farm3d-panel-icon">🛠️</span>
        <h3 className="farm3d-panel-title">Actions</h3>
      </div>

      <div className="farm3d-action-grid">
        <button
          className={`farm3d-action-btn farm3d-action-btn--plant${canPlant ? ' active' : ''}`}
          onClick={handlePlant}
          disabled={!canPlant}
          title="Plant selected crop on selected plot"
        >
          <span className="farm3d-action-btn__icon">🌱</span>
          <span className="farm3d-action-btn__label">Plant</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--water${canWater ? ' active' : ''}`}
          onClick={handleWater}
          disabled={!canWater}
          title="Water the selected plot"
        >
          <span className="farm3d-action-btn__icon">💧</span>
          <span className="farm3d-action-btn__label">Water</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--fertilize${canFertilize ? ' active' : ''}`}
          onClick={handleFertilize}
          disabled={!canFertilize}
          title="Fertilize the selected plot"
        >
          <span className="farm3d-action-btn__icon">🧪</span>
          <span className="farm3d-action-btn__label">Fertilize</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--harvest${isHarvestable ? ' active' : ''}`}
          onClick={handleHarvest}
          disabled={!isHarvestable}
          title="Harvest mature crop"
        >
          <span className="farm3d-action-btn__icon">🌾</span>
          <span className="farm3d-action-btn__label">Harvest</span>
        </button>

        <button
          className={`farm3d-action-btn farm3d-action-btn--remove${hasCrop ? ' active' : ''}`}
          onClick={handleRemove}
          disabled={!hasCrop}
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
          <li>Water crops to start growth</li>
          <li>Fertilize for faster growth</li>
          <li>Harvest when golden ring appears</li>
        </ul>
      </div>
    </div>
  );
}
