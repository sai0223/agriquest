/* ═══════════════════════════════════════════════════════════════
   PlotInfo — Displays farming step progress & plot details
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';
import { useFarmState } from '../simulation/farmState.jsx';
import { getCropById, getSoilQualityFromValue, GROWTH_STAGES, getFarmingProgress } from '../data/cropData.js';

function getHealthLabel(health) {
  if (health >= 80) return { label: 'Healthy', color: '#4caf50', icon: '💚' };
  if (health >= 60) return { label: 'Good', color: '#8bc34a', icon: '💛' };
  if (health >= 40) return { label: 'Fair', color: '#ffc107', icon: '🟡' };
  if (health >= 20) return { label: 'Weak', color: '#ff9800', icon: '🟠' };
  return { label: 'Critical', color: '#f44336', icon: '❤️' };
}

function getStageLabel(stage) {
  switch (stage) {
    case GROWTH_STAGES.PLOUGHING: return '🚜 Ploughing';
    case GROWTH_STAGES.SOWING: return '🌰 Sowing';
    case GROWTH_STAGES.SEEDLING: return '🌱 Seedling';
    case GROWTH_STAGES.GROWING: return '🌿 Growing';
    case GROWTH_STAGES.FLOWERING: return '🌼 Flowering';
    case GROWTH_STAGES.RIPENING: return '🌾 Ripening';
    case GROWTH_STAGES.HARVESTABLE: return '✨ Ready to Harvest';
    default: return '—';
  }
}

export default function PlotInfo() {
  const { state } = useFarmState();
  const plot = state.selectedPlotId ? state.plots[state.selectedPlotId] : null;

  if (!plot) {
    return (
      <div className="farm3d-plot-info">
        <div className="farm3d-panel-header">
          <span className="farm3d-panel-icon">📋</span>
          <h3 className="farm3d-panel-title">Plot Info</h3>
        </div>
        <div className="farm3d-plot-empty">
          <span className="farm3d-plot-empty__icon">🗺️</span>
          <p>Click a plot on the farm to view its details</p>
        </div>
      </div>
    );
  }

  const crop = plot.cropId ? getCropById(plot.cropId) : null;
  const soilQ = getSoilQualityFromValue(plot.soilQuality);
  const healthInfo = getHealthLabel(plot.health);

  const currentStep = crop?.farmingSteps?.[plot.farmingStepIndex];
  const totalSteps = crop?.farmingSteps?.length ?? 0;
  const overallProgress = crop ? getFarmingProgress(crop, plot.farmingStepIndex, plot.stepProgress) : 0;

  return (
    <div className="farm3d-plot-info">
      <div className="farm3d-panel-header">
        <span className="farm3d-panel-icon">📋</span>
        <h3 className="farm3d-panel-title">Plot {plot.id}</h3>
      </div>

      {/* Crop info */}
      <div className="farm3d-plot-section">
        <div className="farm3d-plot-crop-header">
          <span className="farm3d-plot-crop-icon">{crop ? crop.icon : '🟫'}</span>
          <div>
            <div className="farm3d-plot-crop-name">{crop ? crop.name : 'Empty Plot'}</div>
            <div className="farm3d-plot-crop-stage">
              {crop ? getStageLabel(plot.growthStage) : 'Ready for planting'}
            </div>
          </div>
        </div>
      </div>

      {/* Irrigation type badge */}
      {crop && crop.irrigationType && (
        <div className="farm3d-plot-section">
          <div className="farm3d-irrigation-badge" style={{ borderColor: crop.irrigationType.color }}>
            <span>{crop.irrigationType.icon}</span>
            <span style={{ color: crop.irrigationType.color }}>{crop.irrigationType.label}</span>
          </div>
        </div>
      )}

      {/* Current farming step */}
      {crop && currentStep && (
        <div className="farm3d-plot-section">
          <div className="farm3d-plot-stat-label">Current Step ({plot.farmingStepIndex + 1}/{totalSteps})</div>
          <div className="farm3d-current-step-badge">
            <span>{currentStep.label}</span>
          </div>
          <p className="farm3d-step-desc-text">{currentStep.desc}</p>
          {/* Overall progress */}
          <div className="farm3d-plot-stat-label" style={{ marginTop: '0.5rem' }}>Overall Progress</div>
          <div className="farm3d-progress-bar">
            <div
              className="farm3d-progress-bar__fill"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: plot.growthStage === GROWTH_STAGES.HARVESTABLE ? '#ffd54f' : '#4caf50',
              }}
            />
          </div>
          <div className="farm3d-progress-value">{Math.round(overallProgress)}%</div>
        </div>
      )}

      {/* Borewell connection */}
      {crop && (
        <div className="farm3d-plot-section">
          <div className="farm3d-plot-stat-label">Borewell</div>
          <div className={`farm3d-borewell-status-badge ${state.borewellActive ? 'active' : ''}`}>
            <span>{state.borewellActive ? '🟢' : '🔴'}</span>
            <span>{state.borewellActive ? 'Connected & Flowing' : 'OFF'}</span>
          </div>
          {crop.needsBorewell && !state.borewellActive && (
            <p className="farm3d-warning-text">⚠️ This crop needs the borewell!</p>
          )}
        </div>
      )}

      {/* Next Required Action */}
      {plot.needsAction && currentStep && (
        <div className="farm3d-plot-section">
          <div className="farm3d-next-action-badge">
            <span>👨‍🌾</span>
            <span>Next: {currentStep.label}</span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="farm3d-plot-stats">
        <div className="farm3d-plot-stat">
          <div className="farm3d-plot-stat-icon">💧</div>
          <div className="farm3d-plot-stat-data">
            <div className="farm3d-plot-stat-value">{Math.round(plot.soilMoisture)}%</div>
            <div className="farm3d-plot-stat-label">Soil Moisture</div>
          </div>
          <div className="farm3d-mini-bar">
            <div className="farm3d-mini-bar__fill" style={{ width: `${plot.soilMoisture}%`, backgroundColor: '#42a5f5' }} />
          </div>
        </div>

        <div className="farm3d-plot-stat">
          <div className="farm3d-plot-stat-icon">🌍</div>
          <div className="farm3d-plot-stat-data">
            <div className="farm3d-plot-stat-value" style={{ color: soilQ.color }}>{soilQ.label}</div>
            <div className="farm3d-plot-stat-label">Soil Quality</div>
          </div>
          <div className="farm3d-mini-bar">
            <div className="farm3d-mini-bar__fill" style={{ width: `${plot.soilQuality}%`, backgroundColor: soilQ.color }} />
          </div>
        </div>

        <div className="farm3d-plot-stat">
          <div className="farm3d-plot-stat-icon">{healthInfo.icon}</div>
          <div className="farm3d-plot-stat-data">
            <div className="farm3d-plot-stat-value" style={{ color: healthInfo.color }}>{healthInfo.label}</div>
            <div className="farm3d-plot-stat-label">Health</div>
          </div>
          <div className="farm3d-mini-bar">
            <div className="farm3d-mini-bar__fill" style={{ width: `${plot.health}%`, backgroundColor: healthInfo.color }} />
          </div>
        </div>

        <div className="farm3d-plot-stat">
          <div className="farm3d-plot-stat-icon">🟫</div>
          <div className="farm3d-plot-stat-data">
            <div className="farm3d-plot-stat-value" style={{ textTransform: 'capitalize' }}>{plot.soilState}</div>
            <div className="farm3d-plot-stat-label">Soil State</div>
          </div>
        </div>
      </div>
    </div>
  );
}
