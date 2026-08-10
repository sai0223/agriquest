/* ═══════════════════════════════════════════════════════════════
   CropSelector — Side panel to select a crop type for planting
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';
import { CROPS } from '../data/cropData.js';
import { useFarmState } from '../simulation/farmState.jsx';

export default function CropSelector() {
  const { state, actions } = useFarmState();

  const handleSelect = (cropId) => {
    if (state.selectedCropId === cropId) {
      actions.selectCrop(null); // deselect
    } else {
      actions.selectCrop(cropId);
    }
  };

  return (
    <div className="farm3d-crop-selector">
      <div className="farm3d-panel-header">
        <span className="farm3d-panel-icon">🌱</span>
        <h3 className="farm3d-panel-title">Crops</h3>
      </div>

      {state.plantingMode && (
        <div className="farm3d-planting-banner">
          <span>🎯</span>
          <span>Click an empty plot to plant</span>
        </div>
      )}

      <div className="farm3d-crop-list">
        {CROPS.map(crop => {
          const isSelected = state.selectedCropId === crop.id;
          return (
            <div
              key={crop.id}
              className={`farm3d-crop-card${isSelected ? ' selected' : ''}`}
              onClick={() => handleSelect(crop.id)}
            >
              <div className="farm3d-crop-card__icon">{crop.icon}</div>
              <div className="farm3d-crop-card__info">
                <div className="farm3d-crop-card__name">{crop.name}</div>
                <div className="farm3d-crop-card__desc">{crop.description}</div>
                <div className="farm3d-crop-card__meta">
                  <span className="farm3d-crop-card__tag">💰 ${crop.basePrice}</span>
                  <span className="farm3d-crop-card__tag">💧 {crop.waterNeeds}</span>
                  <span className="farm3d-crop-card__tag">⏱️ {crop.growthDuration}s</span>
                </div>
              </div>
              {isSelected && (
                <div className="farm3d-crop-card__check">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
