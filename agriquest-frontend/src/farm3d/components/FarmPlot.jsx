/* ═══════════════════════════════════════════════════════════════
   FarmPlot — Individual interactive 3D soil plot
   Supports tool mode interactions (water/fertilize on click)
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFarmState } from '../simulation/farmState.jsx';
import { GROWTH_STAGES } from '../data/cropData.js';
import Crop3D from './Crop3D.jsx';
import WaterEffect from './WaterEffect.jsx';
import FertilizerEffect from './FertilizerEffect.jsx';

const PLOT_SIZE = 1.6;
const PLOT_HEIGHT = 0.08;
const PLOT_SPACING = 1.8;

/* Position calc: center the 4×4 grid */
function getPlotPosition(row, col) {
  const offset = (3 * PLOT_SPACING) / 2; // center 4 plots
  return [
    col * PLOT_SPACING - offset,
    PLOT_HEIGHT / 2,
    row * PLOT_SPACING - offset,
  ];
}

export default function FarmPlot({ plot }) {
  const meshRef = useRef();
  const outlineRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { state, actions } = useFarmState();

  const isSelected = state.selectedPlotId === plot.id;
  const isEmpty = !plot.cropId;
  const isToolActive = state.activeToolMode !== null;
  const isWaterToolActive = state.activeToolMode === 'water';
  const isFertilizeToolActive = state.activeToolMode === 'fertilize';
  const farmerBusy = state.farmerState.isMoving || state.farmerState.isPerformingAction;

  // Is the farmer currently performing an action on THIS plot?
  const farmerOnThisPlot = state.farmerState.targetPlotId === plot.id;
  const farmerWateringHere = farmerOnThisPlot && state.farmerState.action === 'water' && state.farmerState.isPerformingAction;
  const farmerFertilizingHere = farmerOnThisPlot && state.farmerState.action === 'fertilize' && state.farmerState.isPerformingAction;

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    const pos = getPlotPosition(plot.row, plot.col);

    // Tool mode: click to send farmer to this plot
    if (isToolActive && !farmerBusy && plot.cropId) {
      if (isWaterToolActive && !plot.isWatered) {
        actions.startFarmerAction(plot.id, pos, 'water');
        actions.selectPlot(plot.id);
        return;
      }
      if (isFertilizeToolActive && !plot.isFertilized) {
        actions.startFarmerAction(plot.id, pos, 'fertilize');
        actions.selectPlot(plot.id);
        return;
      }
    }

    // Normal planting mode
    if (state.plantingMode && state.selectedCropId && isEmpty) {
      actions.plantCrop(plot.id, state.selectedCropId);
    }

    actions.selectPlot(plot.id);
  }, [state.plantingMode, state.selectedCropId, isEmpty, plot.id, plot.row, plot.col,
      isToolActive, isWaterToolActive, isFertilizeToolActive, farmerBusy,
      plot.cropId, plot.isWatered, plot.isFertilized, actions]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    // Change cursor based on tool mode
    if (isToolActive && plot.cropId) {
      if ((isWaterToolActive && !plot.isWatered) || (isFertilizeToolActive && !plot.isFertilized)) {
        document.body.style.cursor = 'crosshair';
      } else {
        document.body.style.cursor = 'not-allowed';
      }
    } else {
      document.body.style.cursor = 'pointer';
    }
  }, [isToolActive, isWaterToolActive, isFertilizeToolActive, plot.cropId, plot.isWatered, plot.isFertilized]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // Animate hover/selection glow
  useFrame(() => {
    if (!outlineRef.current) return;

    let targetOpacity, targetEmissive;

    if (isToolActive && hovered && plot.cropId) {
      // Tool mode hover — stronger glow
      const canApply = (isWaterToolActive && !plot.isWatered) || (isFertilizeToolActive && !plot.isFertilized);
      targetOpacity = canApply ? 0.6 : 0.2;
      targetEmissive = canApply ? 0.6 : 0.1;
    } else {
      targetOpacity = isSelected ? 0.7 : hovered ? 0.4 : 0;
      targetEmissive = isSelected ? 0.5 : hovered ? 0.3 : 0;
    }

    outlineRef.current.material.opacity +=
      (targetOpacity - outlineRef.current.material.opacity) * 0.15;
    outlineRef.current.material.emissiveIntensity +=
      (targetEmissive - outlineRef.current.material.emissiveIntensity) * 0.15;
  });

  const pos = getPlotPosition(plot.row, plot.col);

  // Soil color based on moisture
  const soilColor = plot.soilMoisture > 60 ? '#5d4037' : plot.soilMoisture > 30 ? '#795548' : '#8d6e63';

  // Show water effect when recently watered or farmer is watering
  const showWater = plot.isWatered && plot.soilMoisture > 70;
  const showActiveWater = farmerWateringHere;

  // Show fertilizer effect
  const showFertilizer = plot.isFertilized;
  const showActiveFertilizer = farmerFertilizingHere;

  // Outline color based on tool mode
  const outlineColor = isToolActive && hovered
    ? (isWaterToolActive ? '#29b6f6' : '#8d6e63')
    : isSelected ? '#4caf50' : '#66bb6a';

  return (
    <group position={pos}>
      {/* Soil block */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[PLOT_SIZE, PLOT_HEIGHT, PLOT_SIZE]} />
        <meshStandardMaterial
          color={soilColor}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* Selection / hover outline */}
      <mesh
        ref={outlineRef}
        position={[0, PLOT_HEIGHT / 2 + 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[PLOT_SIZE + 0.06, PLOT_SIZE + 0.06]} />
        <meshStandardMaterial
          color={outlineColor}
          emissive={outlineColor}
          emissiveIntensity={0}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Render crop if planted */}
      {plot.cropId && plot.growthStage !== GROWTH_STAGES.EMPTY && (
        <group position={[0, PLOT_HEIGHT / 2, 0]}>
          {/* Multiple crop instances across the plot for fullness */}
          {getCropPositions(plot.growthStage).map((cp, i) => (
            <group key={i} position={cp}>
              <Crop3D
                cropId={plot.cropId}
                growthStage={plot.growthStage}
                growthProgress={plot.growthProgress}
                isHarvestable={plot.growthStage === GROWTH_STAGES.HARVESTABLE}
              />
            </group>
          ))}
        </group>
      )}

      {/* Planting mode indicator — pulsing green dot on empty plots */}
      {state.plantingMode && isEmpty && (
        <mesh position={[0, PLOT_HEIGHT / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial
            color="#4caf50"
            emissive="#4caf50"
            emissiveIntensity={1.0}
            transparent
            opacity={0.4 + Math.sin(Date.now() * 0.005) * 0.2}
          />
        </mesh>
      )}

      {/* Tool mode indicator — pulsing ring when hovering with tool */}
      {isToolActive && hovered && plot.cropId && (
        <mesh position={[0, PLOT_HEIGHT / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[PLOT_SIZE * 0.35, PLOT_SIZE * 0.4, 24]} />
          <meshStandardMaterial
            color={isWaterToolActive ? '#29b6f6' : '#8d6e63'}
            emissive={isWaterToolActive ? '#0288d1' : '#6d4c41'}
            emissiveIntensity={1.2}
            transparent
            opacity={0.5 + Math.sin(Date.now() * 0.006) * 0.2}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Water visual effects */}
      {(showWater || showActiveWater) && (
        <WaterEffect active={showActiveWater} />
      )}

      {/* Fertilizer visual effects */}
      {(showFertilizer || showActiveFertilizer) && (
        <FertilizerEffect active={showActiveFertilizer} />
      )}

      {/* Plot label - subtle text indicator */}
      {(hovered || isSelected) && (
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

/* Scatter crop instances within a plot based on growth */
function getCropPositions(stage) {
  const spread = 0.55;
  const basePositions = [
    [0, 0, 0],
    [-spread, 0, -spread],
    [spread, 0, -spread],
    [-spread, 0, spread],
    [spread, 0, spread],
  ];

  switch (stage) {
    case GROWTH_STAGES.SEED:
      return basePositions.slice(0, 3);
    case GROWTH_STAGES.SPROUT:
      return basePositions.slice(0, 4);
    case GROWTH_STAGES.GROWING:
    case GROWTH_STAGES.MATURE:
    case GROWTH_STAGES.HARVESTABLE:
      return basePositions;
    default:
      return [basePositions[0]];
  }
}

export { PLOT_SPACING, getPlotPosition };
