/* ═══════════════════════════════════════════════════════════════
   FarmPlot — Individual interactive 3D soil plot
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFarmState } from '../simulation/farmState.jsx';
import { GROWTH_STAGES } from '../data/cropData.js';
import Crop3D from './Crop3D.jsx';
import WaterEffect from './WaterEffect.jsx';

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

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    // If in planting mode and plot is empty, plant the crop
    if (state.plantingMode && state.selectedCropId && isEmpty) {
      actions.plantCrop(plot.id, state.selectedCropId);
    }

    actions.selectPlot(plot.id);
  }, [state.plantingMode, state.selectedCropId, isEmpty, plot.id, actions]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // Animate hover/selection glow
  useFrame(() => {
    if (!outlineRef.current) return;

    const targetOpacity = isSelected ? 0.7 : hovered ? 0.4 : 0;
    const targetEmissive = isSelected ? 0.5 : hovered ? 0.3 : 0;

    outlineRef.current.material.opacity +=
      (targetOpacity - outlineRef.current.material.opacity) * 0.15;
    outlineRef.current.material.emissiveIntensity +=
      (targetEmissive - outlineRef.current.material.emissiveIntensity) * 0.15;
  });

  const pos = getPlotPosition(plot.row, plot.col);

  // Soil color based on moisture
  const soilColor = plot.soilMoisture > 60 ? '#5d4037' : plot.soilMoisture > 30 ? '#795548' : '#8d6e63';

  // Show water effect when recently watered
  const showWater = plot.isWatered && plot.soilMoisture > 70;

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
          color={isSelected ? '#4caf50' : '#66bb6a'}
          emissive={isSelected ? '#4caf50' : '#66bb6a'}
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

      {/* Water visual effect */}
      {showWater && <WaterEffect />}

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
