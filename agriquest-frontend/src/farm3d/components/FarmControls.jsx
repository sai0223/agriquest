/* ═══════════════════════════════════════════════════════════════
   FarmControls — Realistic step-by-step farming actions panel
   Shows crop-specific workflow with borewell toggle
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';
import { useFarmState } from '../simulation/farmState.jsx';
import { GROWTH_STAGES, getCropById, STEP_TYPES } from '../data/cropData.js';
import { getPlotPosition } from './FarmPlot.jsx';

export default function FarmControls() {
  const { state, actions } = useFarmState();
  const selectedPlot = state.selectedPlotId ? state.plots[state.selectedPlotId] : null;

  const hasCrop = selectedPlot?.cropId != null;
  const crop = hasCrop ? getCropById(selectedPlot.cropId) : null;
  const farmerBusy = state.farmerState.isMoving || state.farmerState.isPerformingAction;

  /* ─── Get current and next step info ────────────────────── */
  const currentStepIndex = selectedPlot?.farmingStepIndex ?? -1;
  const totalSteps = crop?.farmingSteps?.length ?? 0;
  const currentStep = crop?.farmingSteps?.[currentStepIndex] ?? null;
  const isHarvestable = selectedPlot?.growthStage === GROWTH_STAGES.HARVESTABLE;
  const canDoStep = hasCrop && selectedPlot.needsAction && !farmerBusy && currentStep;

  /* ─── Perform current farming step ──────────────────────── */
  const handlePerformStep = () => {
    if (!canDoStep || !selectedPlot) return;

    // Check borewell requirement
    if (currentStep.needsBorewell && !state.borewellActive) {
      // Show warning — borewell must be on
      return;
    }

    const pos = getPlotPosition(selectedPlot.row, selectedPlot.col);
    actions.startFarmerAction(selectedPlot.id, pos, 'farming_step');
  };

  const handleRemove = () => {
    if (!hasCrop || farmerBusy) return;
    actions.removeCrop(state.selectedPlotId);
  };

  return (
    <div className="farm3d-controls">
      <div className="farm3d-panel-header">
        <span className="farm3d-panel-icon">🛠️</span>
        <h3 className="farm3d-panel-title">Farm Actions</h3>
      </div>

      {/* ═══════ BOREWELL CONTROL ═══════ */}
      <div className="farm3d-borewell-control">
        <div className="farm3d-borewell-header">
          <span className="farm3d-borewell-icon">🚰</span>
          <span className="farm3d-borewell-label">Borewell Pump</span>
        </div>
        <button
          className={`farm3d-borewell-toggle ${state.borewellActive ? 'active' : ''}`}
          onClick={() => actions.toggleBorewell()}
        >
          <span className="farm3d-borewell-toggle__knob" />
          <span className="farm3d-borewell-toggle__text">
            {state.borewellActive ? 'ON' : 'OFF'}
          </span>
        </button>
        <p className="farm3d-borewell-hint">
          {state.borewellActive
            ? '💧 Water is flowing to the fields'
            : '⚠️ Turn ON for water-dependent crops'}
        </p>
      </div>

      {/* ═══════ FARMER STATUS ═══════ */}
      {farmerBusy && (
        <div className="farm3d-farmer-status">
          <div className="farm3d-farmer-status-dot" />
          <span>
            {state.farmerState.isMoving
              ? `🚶 Walking to ${state.farmerState.targetPlotId}...`
              : `🌾 ${state.farmerState.action === 'farming_step' ? 'Working' : state.farmerState.action}...`}
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

      {/* ═══════ CROP WORKFLOW ═══════ */}
      {hasCrop && crop ? (
        <div className="farm3d-workflow">
          {/* Crop badge */}
          <div className="farm3d-workflow-header">
            <span className="farm3d-workflow-icon">{crop.icon}</span>
            <div>
              <div className="farm3d-workflow-crop">{crop.name}</div>
              <div className="farm3d-workflow-method">
                {crop.irrigationType?.icon} {crop.farmingMethod}
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="farm3d-workflow-progress-section">
            <div className="farm3d-workflow-progress-label">
              <span>Progress</span>
              <span>{currentStepIndex}/{totalSteps} steps</span>
            </div>
            <div className="farm3d-progress-bar">
              <div
                className="farm3d-progress-bar__fill"
                style={{
                  width: `${(currentStepIndex / totalSteps) * 100}%`,
                  backgroundColor: isHarvestable ? '#ffd54f' : '#4caf50',
                }}
              />
            </div>
          </div>

          {/* Step-by-step tracker */}
          <div className="farm3d-step-tracker">
            {crop.farmingSteps.map((step, i) => {
              const isComplete = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isFuture = i > currentStepIndex;
              const isWaitStep = step.type === STEP_TYPES.WAIT;

              return (
                <div
                  key={i}
                  className={`farm3d-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}
                >
                  <div className="farm3d-step__marker">
                    {isComplete ? '✓' : isCurrent ? (isWaitStep ? '⏳' : '→') : (i + 1)}
                  </div>
                  <div className="farm3d-step__info">
                    <div className="farm3d-step__label">{step.label}</div>
                    {isCurrent && (
                      <div className="farm3d-step__desc">{step.desc}</div>
                    )}
                    {isCurrent && isWaitStep && (
                      <div className="farm3d-step__wait-bar">
                        <div
                          className="farm3d-step__wait-fill"
                          style={{ width: `${selectedPlot.stepProgress}%` }}
                        />
                      </div>
                    )}
                    {isCurrent && step.needsBorewell && !state.borewellActive && (
                      <div className="farm3d-step__warning">
                        ⚠️ Requires Borewell ON!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── ACTION BUTTON ─── */}
          {canDoStep && (
            <button
              className={`farm3d-next-step-btn ${currentStep.needsBorewell && !state.borewellActive ? 'disabled' : ''}`}
              onClick={handlePerformStep}
              disabled={farmerBusy || (currentStep.needsBorewell && !state.borewellActive)}
            >
              <span className="farm3d-next-step-btn__icon">
                {currentStep.needsBorewell && !state.borewellActive ? '🔒' : '👨‍🌾'}
              </span>
              <span className="farm3d-next-step-btn__label">
                {currentStep.needsBorewell && !state.borewellActive
                  ? 'Turn On Borewell First!'
                  : `Do: ${currentStep.label}`}
              </span>
            </button>
          )}

          {isHarvestable && (
            <div className="farm3d-harvest-ready-banner">
              <span>🎉</span>
              <span>Crop is ready! All steps complete.</span>
            </div>
          )}

          {/* Remove button */}
          <button
            className={`farm3d-action-btn farm3d-action-btn--remove${hasCrop ? ' active' : ''}`}
            onClick={handleRemove}
            disabled={!hasCrop || farmerBusy}
            title="Remove crop from plot"
          >
            <span className="farm3d-action-btn__icon">❌</span>
            <span className="farm3d-action-btn__label">Remove Crop</span>
          </button>
        </div>
      ) : (
        <div className="farm3d-controls-empty">
          <p>🌾 Select a crop and click an empty plot to begin farming!</p>
        </div>
      )}

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
        <strong>💡 Farming Guide:</strong>
        <ul>
          <li>Select a crop → click empty plot to start</li>
          <li>Follow the step-by-step workflow</li>
          <li>🚰 Turn ON Borewell for water-needing steps</li>
          <li>⏳ Wait steps auto-progress over time</li>
          <li>🎉 Complete all steps to harvest!</li>
        </ul>
      </div>
    </div>
  );
}
