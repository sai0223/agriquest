/* ═══════════════════════════════════════════════════════════════
   Crop3D — Procedural 3D crop models that change with growth
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { GROWTH_STAGES, getCropById } from '../data/cropData.js';

/* Helper to create a leaf geometry at given rotation */
function Leaf({ position, rotation, scale, color }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.3, 0.15]} />
      <meshStandardMaterial color={color} side={2} roughness={0.7} />
    </mesh>
  );
}

/* Seed stage — tiny brown sphere half-buried */
function SeedModel({ color }) {
  return (
    <mesh position={[0, 0.02, 0]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color="#8d6e63" roughness={0.9} />
    </mesh>
  );
}

/* Sprout stage — small green stem + tiny bud */
function SproutModel({ color }) {
  return (
    <group>
      {/* Stem */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.16, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Tiny leaf buds */}
      <Leaf position={[0.04, 0.14, 0]} rotation={[0, 0, -0.5]} scale={0.6} color={color} />
      <Leaf position={[-0.04, 0.12, 0]} rotation={[0, 0, 0.5]} scale={0.5} color={color} />
    </group>
  );
}

/* Growing stage — medium plant with leaves */
function GrowingModel({ color }) {
  return (
    <group>
      {/* Main stem */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.36, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Leaves at different angles */}
      <Leaf position={[0.08, 0.22, 0]} rotation={[0, 0, -0.6]} scale={1.0} color={color} />
      <Leaf position={[-0.08, 0.18, 0.02]} rotation={[0.2, 0, 0.6]} scale={0.9} color={color} />
      <Leaf position={[0.05, 0.28, -0.04]} rotation={[-0.2, 0.5, -0.4]} scale={0.8} color={color} />
      <Leaf position={[-0.06, 0.30, 0.03]} rotation={[0.1, -0.3, 0.5]} scale={0.7} color={color} />
    </group>
  );
}

/* Mature stage — full plant with crop-specific top */
function MatureModel({ cropId, color, matureColor }) {
  const topGeometry = useMemo(() => {
    switch (cropId) {
      case 'rice':
      case 'wheat':
        return 'grain'; // drooping grain head
      case 'corn':
        return 'cob';
      case 'tomato':
        return 'fruit';
      case 'cotton':
        return 'puff';
      case 'potato':
        return 'bush';
      default:
        return 'grain';
    }
  }, [cropId]);

  return (
    <group>
      {/* Tall stem */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.56, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Leaves */}
      <Leaf position={[0.12, 0.2, 0]} rotation={[0, 0, -0.7]} scale={1.2} color={color} />
      <Leaf position={[-0.12, 0.16, 0.03]} rotation={[0.2, 0, 0.7]} scale={1.1} color={color} />
      <Leaf position={[0.08, 0.34, -0.05]} rotation={[-0.2, 0.5, -0.5]} scale={1.0} color={color} />
      <Leaf position={[-0.09, 0.38, 0.04]} rotation={[0.1, -0.3, 0.6]} scale={0.9} color={color} />

      {/* Crop-specific top */}
      {topGeometry === 'grain' && (
        <group position={[0, 0.56, 0]} rotation={[0.3, 0, 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.01, 0.12, 6]} />
            <meshStandardMaterial color={matureColor} roughness={0.4} />
          </mesh>
        </group>
      )}
      {topGeometry === 'cob' && (
        <group position={[0.06, 0.42, 0]} rotation={[0, 0, -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.035, 0.14, 8]} />
            <meshStandardMaterial color={matureColor} roughness={0.5} />
          </mesh>
        </group>
      )}
      {topGeometry === 'fruit' && (
        <>
          <mesh position={[0.06, 0.42, 0.03]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={matureColor} roughness={0.3} />
          </mesh>
          <mesh position={[-0.04, 0.38, -0.02]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={matureColor} roughness={0.3} />
          </mesh>
        </>
      )}
      {topGeometry === 'puff' && (
        <mesh position={[0, 0.56, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={matureColor} roughness={0.2} metalness={0.0} />
        </mesh>
      )}
      {topGeometry === 'bush' && (
        <mesh position={[0, 0.5, 0]}>
          <dodecahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

/* ─── Main Crop3D Component ─────────────────────────────────── */
export default function Crop3D({ cropId, growthStage, growthProgress, isHarvestable }) {
  const groupRef = useRef();
  const crop = getCropById(cropId);
  if (!crop) return null;

  const { color, matureColor } = crop;

  // Smooth scale based on progress
  const targetScale = useMemo(() => {
    switch (growthStage) {
      case GROWTH_STAGES.SEED: return 0.6;
      case GROWTH_STAGES.SPROUT: return 0.8;
      case GROWTH_STAGES.GROWING: return 1.0;
      case GROWTH_STAGES.MATURE: return 1.1;
      case GROWTH_STAGES.HARVESTABLE: return 1.15;
      default: return 0;
    }
  }, [growthStage]);

  // Animate harvestable glow pulse
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth scale transition
    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * Math.min(delta * 3, 1);
    groupRef.current.scale.setScalar(newScale);

    // Gentle bob for harvestable crops
    if (isHarvestable) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.02;
    }
  });

  return (
    <group ref={groupRef} scale={targetScale}>
      {growthStage === GROWTH_STAGES.SEED && <SeedModel color={color} />}
      {growthStage === GROWTH_STAGES.SPROUT && <SproutModel color={color} />}
      {growthStage === GROWTH_STAGES.GROWING && <GrowingModel color={color} />}
      {(growthStage === GROWTH_STAGES.MATURE || growthStage === GROWTH_STAGES.HARVESTABLE) && (
        <MatureModel cropId={cropId} color={color} matureColor={matureColor} />
      )}

      {/* Harvest-ready glow ring */}
      {isHarvestable && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshStandardMaterial
            color="#ffd54f"
            emissive="#ffd54f"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
