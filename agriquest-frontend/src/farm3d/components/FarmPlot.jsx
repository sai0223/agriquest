/* ═══════════════════════════════════════════════════════════════
   FarmPlot — Individual interactive 3D soil plot
   Shows crop-specific soil states: ploughed, flooded, ridged, etc.
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
  const offset = (3 * PLOT_SPACING) / 2;
  return [
    col * PLOT_SPACING - offset,
    PLOT_HEIGHT / 2,
    row * PLOT_SPACING - offset,
  ];
}

/* ─── Ploughed Soil Furrows ───────────────────────────────── */
function PloughedSoilLines() {
  return (
    <group position={[0, PLOT_HEIGHT / 2 + 0.003, 0]}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 0, (i - 3.5) * 0.19]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PLOT_SIZE * 0.9, 0.04]} />
          <meshStandardMaterial color="#3e2a1a" roughness={0.98} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Ridged Soil (for corn/potato) ───────────────────────── */
function RidgedSoil() {
  return (
    <group position={[0, PLOT_HEIGHT / 2, 0]}>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, 0.025, (i - 1.5) * 0.36]} rotation={[0, 0, 0]}>
          <boxGeometry args={[PLOT_SIZE * 0.85, 0.05, 0.14]} />
          <meshStandardMaterial color="#5d3a1a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Flooded Water Layer (for rice) ──────────────────────── */
function FloodedWaterLayer({ active }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && active) {
      meshRef.current.position.y = PLOT_HEIGHT / 2 + 0.015 + Math.sin(Date.now() * 0.002) * 0.003;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, active ? PLOT_HEIGHT / 2 + 0.015 : PLOT_HEIGHT / 2 - 0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[PLOT_SIZE * 0.95, PLOT_SIZE * 0.95]} />
      <meshStandardMaterial
        color="#1e88e5"
        roughness={0.05}
        metalness={0.3}
        transparent
        opacity={active ? 0.55 : 0}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Drip Irrigation Lines (for tomato) ──────────────────── */
function DripLines() {
  return (
    <group position={[0, PLOT_HEIGHT / 2 + 0.008, 0]}>
      {[-0.35, 0, 0.35].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <cylinderGeometry args={[0.012, 0.012, PLOT_SIZE * 0.85, 6]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
      {/* Emitter dots */}
      {[-0.35, 0, 0.35].map((z, i) =>
        [-0.5, -0.2, 0.1, 0.4].map((x, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.01, z]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#1e88e5" emissive="#1e88e5" emissiveIntensity={0.4} />
          </mesh>
        ))
      )}
    </group>
  );
}

/* ─── Mulch Layer (for tomato) ────────────────────────────── */
function MulchLayer() {
  return (
    <mesh position={[0, PLOT_HEIGHT / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[PLOT_SIZE * 0.92, PLOT_SIZE * 0.92]} />
      <meshStandardMaterial color="#4e342e" roughness={0.98} transparent opacity={0.5} />
    </mesh>
  );
}

/* ─── Vine Stakes (for tomato) ────────────────────────────── */
function VineStakes() {
  return (
    <group>
      {[[-0.35, 0.25, -0.35], [0, 0.25, 0], [0.35, 0.25, 0.35], [-0.35, 0.25, 0.35], [0.35, 0.25, -0.35]].map(
        ([x, y, z], i) => (
          <mesh key={i} position={[x, y + PLOT_HEIGHT / 2, z]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.45, 4]} />
            <meshStandardMaterial color="#795548" roughness={0.9} />
          </mesh>
        )
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function FarmPlot({ plot }) {
  const meshRef = useRef();
  const outlineRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { state, actions } = useFarmState();

  const isSelected = state.selectedPlotId === plot.id;
  const isEmpty = !plot.cropId;
  const isToolActive = state.activeToolMode !== null;
  const farmerBusy = state.farmerState.isMoving || state.farmerState.isPerformingAction;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const pos = getPlotPosition(plot.row, plot.col);

    // Normal planting mode
    if (state.plantingMode && state.selectedCropId && isEmpty) {
      actions.plantCrop(plot.id, state.selectedCropId);
    }

    actions.selectPlot(plot.id);
  }, [state.plantingMode, state.selectedCropId, isEmpty, plot.id, plot.row, plot.col, actions]);

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

  // Soil color based on state
  const getSoilColor = () => {
    if (plot.soilState === 'puddled') return '#3e2a1a';
    if (plot.soilState === 'ploughed' || plot.soilState === 'deep-tilled') return '#4a3020';
    if (plot.soilState === 'ridged' || plot.soilState === 'hilled') return '#5a3a1a';
    if (plot.soilState === 'mulched') return '#3e2e1e';
    if (plot.soilMoisture > 60) return '#5d4037';
    if (plot.soilMoisture > 30) return '#795548';
    return '#8d6e63';
  };

  const outlineColor = isSelected ? '#4caf50' : '#66bb6a';

  // Determine crop instances count/positions based on crop type
  const cropPositions = getCropPositions(plot.cropId, plot.growthStage);

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
          color={getSoilColor()}
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

      {/* ─── Soil State Overlays ──────────────────────────── */}
      {/* Ploughed furrow lines */}
      {(plot.soilState === 'ploughed' || plot.soilState === 'deep-tilled') && <PloughedSoilLines />}

      {/* Ridge geometry for corn/potato */}
      {(plot.hasRidges || plot.soilState === 'ridged' || plot.soilState === 'hilled') && <RidgedSoil />}

      {/* Mulch layer for tomato */}
      {plot.soilState === 'mulched' && <MulchLayer />}

      {/* Drip irrigation lines for tomato */}
      {plot.hasDripLines && <DripLines />}

      {/* Vine stakes for tomato */}
      {plot.hasStakes && <VineStakes />}

      {/* Flooded water layer for rice */}
      {plot.isFlooded && <FloodedWaterLayer active={plot.isFlooded} />}

      {/* ─── Render crops ────────────────────────────────── */}
      {plot.cropId && plot.growthStage !== GROWTH_STAGES.EMPTY && plot.growthStage !== GROWTH_STAGES.PLOUGHING && (
        <group position={[0, PLOT_HEIGHT / 2, 0]}>
          {cropPositions.map((cp, i) => (
            <group key={i} position={cp}>
              <Crop3D
                cropId={plot.cropId}
                growthStage={plot.growthStage}
                growthProgress={plot.stepProgress}
                isHarvestable={plot.growthStage === GROWTH_STAGES.HARVESTABLE}
              />
            </group>
          ))}
        </group>
      )}

      {/* Planting mode indicator */}
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

      {/* Needs-action indicator (pulsing icon) */}
      {plot.needsAction && plot.cropId && (
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#ffa726"
            emissive="#ffa726"
            emissiveIntensity={1.0 + Math.sin(Date.now() * 0.005) * 0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Water visual effects */}
      {plot.isWatered && plot.soilMoisture > 70 && !plot.isFlooded && (
        <WaterEffect active={false} />
      )}

      {/* Fertilizer visual effects */}
      {plot.isFertilized && (
        <FertilizerEffect active={false} />
      )}

      {/* Plot label */}
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

/* ─── Crop-specific plant positions within a plot ─────────── */
function getCropPositions(cropId, stage) {
  if (!cropId || stage === GROWTH_STAGES.EMPTY || stage === GROWTH_STAGES.PLOUGHING) {
    return [];
  }

  const spread = 0.5;

  switch (cropId) {
    case 'rice':
      // Rice: dense grid of many small plants (paddy style)
      return [
        [0, 0, 0],
        [-spread * 0.7, 0, -spread * 0.7],
        [spread * 0.7, 0, -spread * 0.7],
        [-spread * 0.7, 0, spread * 0.7],
        [spread * 0.7, 0, spread * 0.7],
        [-spread * 0.3, 0, 0],
        [spread * 0.3, 0, 0],
        [0, 0, -spread * 0.5],
        [0, 0, spread * 0.5],
      ];

    case 'corn':
      // Corn: fewer tall plants, wider spacing
      return [
        [0, 0, -spread * 0.5],
        [0, 0, spread * 0.5],
        [-spread * 0.5, 0, 0],
        [spread * 0.5, 0, 0],
      ];

    case 'tomato':
      // Tomato: row-planted with stakes
      return [
        [-spread * 0.5, 0, -spread * 0.4],
        [0, 0, 0],
        [spread * 0.5, 0, spread * 0.4],
        [-spread * 0.5, 0, spread * 0.4],
        [spread * 0.5, 0, -spread * 0.4],
      ];

    case 'cotton':
      // Cotton: moderate spacing, bushy
      return [
        [0, 0, 0],
        [-spread * 0.6, 0, -spread * 0.5],
        [spread * 0.6, 0, spread * 0.5],
        [spread * 0.6, 0, -spread * 0.5],
        [-spread * 0.6, 0, spread * 0.5],
      ];

    case 'potato':
      // Potato: ridge-planted rows
      return [
        [-spread * 0.5, 0, -spread * 0.4],
        [0, 0, -spread * 0.4],
        [spread * 0.5, 0, -spread * 0.4],
        [-spread * 0.5, 0, spread * 0.4],
        [0, 0, spread * 0.4],
        [spread * 0.5, 0, spread * 0.4],
      ];

    case 'wheat':
    default:
      // Wheat: dense like a field
      return [
        [0, 0, 0],
        [-spread * 0.6, 0, -spread * 0.5],
        [spread * 0.6, 0, -spread * 0.5],
        [-spread * 0.6, 0, spread * 0.5],
        [spread * 0.6, 0, spread * 0.5],
        [-spread * 0.2, 0, -spread * 0.2],
        [spread * 0.2, 0, spread * 0.2],
      ];
  }
}

export { PLOT_SPACING, getPlotPosition };
