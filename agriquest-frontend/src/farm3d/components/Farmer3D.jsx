/* ═══════════════════════════════════════════════════════════════
   Farmer3D — Animated procedural 3D farmer character
   Built with basic Three.js geometries — walks to plots and
   performs farming actions (water, fertilize, harvest, plant)
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFarmState, FARMER_IDLE_POSITION } from '../simulation/farmState.jsx';

/* ─── Config ──────────────────────────────────────────────── */
const WALK_SPEED = 3.5;       // units per second
const ACTION_DURATION = 2.5;  // seconds to complete an action
const RETURN_DELAY = 0.5;     // seconds pause after action before returning

/* ─── Farmer Body Parts ───────────────────────────────────── */
function FarmerBody() {
  return (
    <group>
      {/* Torso — overalls */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.28, 0.35, 0.18]} />
        <meshStandardMaterial color="#1565c0" roughness={0.8} />
      </mesh>
      {/* Shirt under overalls */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.19]} />
        <meshStandardMaterial color="#e53935" roughness={0.7} />
      </mesh>
      {/* Overall straps */}
      <mesh position={[-0.08, 0.7, 0.09]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.02]} />
        <meshStandardMaterial color="#0d47a1" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.7, 0.09]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.02]} />
        <meshStandardMaterial color="#0d47a1" roughness={0.8} />
      </mesh>
    </group>
  );
}

function FarmerHead() {
  return (
    <group position={[0, 0.92, 0]}>
      {/* Head */}
      <mesh castShadow>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#d7a86e" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.04, 0.02, 0.1]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      <mesh position={[0.04, 0.02, 0.1]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      {/* Smile */}
      <mesh position={[0, -0.03, 0.11]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.05, 0.01, 0.01]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Straw Hat */}
      <group position={[0, 0.1, 0]}>
        {/* Hat brim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 12]} />
          <meshStandardMaterial color="#c8a96e" roughness={0.9} />
        </mesh>
        {/* Hat top */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.1, 10]} />
          <meshStandardMaterial color="#d4b27a" roughness={0.85} />
        </mesh>
        {/* Hat band */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.121, 0.121, 0.025, 10]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/* Arms with refs for animation */
const FarmerArms = React.forwardRef(function FarmerArms(_, ref) {
  return (
    <group>
      {/* Left arm */}
      <group ref={(el) => { if (ref) ref.current.leftArm = el; }}
        position={[-0.2, 0.65, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.28, 0.07]} />
          <meshStandardMaterial color="#d7a86e" roughness={0.6} />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={(el) => { if (ref) ref.current.rightArm = el; }}
        position={[0.2, 0.65, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.28, 0.07]} />
          <meshStandardMaterial color="#d7a86e" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
});

/* Legs with refs for walk animation */
const FarmerLegs = React.forwardRef(function FarmerLegs(_, ref) {
  return (
    <group>
      {/* Left leg */}
      <group ref={(el) => { if (ref) ref.current.leftLeg = el; }}
        position={[-0.07, 0.2, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.3, 0.09]} />
          <meshStandardMaterial color="#1565c0" roughness={0.8} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.15, 0.02]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.13]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={(el) => { if (ref) ref.current.rightLeg = el; }}
        position={[0.07, 0.2, 0]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.3, 0.09]} />
          <meshStandardMaterial color="#1565c0" roughness={0.8} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.15, 0.02]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.13]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
});

/* Tool held in right hand — changes based on action */
function FarmerTool({ action }) {
  if (!action) return null;

  return (
    <group position={[0.2, 0.55, 0.12]}>
      {action === 'water' && (
        /* Watering can */
        <group rotation={[0.3, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.05, 0.1, 8]} />
            <meshStandardMaterial color="#78909c" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* Spout */}
          <mesh position={[0.03, 0.03, 0.05]} rotation={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.015, 0.08, 6]} />
            <meshStandardMaterial color="#90a4ae" metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.04, 0.06, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.06, 0.015, 0.015]} />
            <meshStandardMaterial color="#607d8b" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      )}
      {action === 'fertilize' && (
        /* Seed/fertilizer bag */
        <group>
          <mesh>
            <boxGeometry args={[0.1, 0.08, 0.06]} />
            <meshStandardMaterial color="#795548" roughness={0.9} />
          </mesh>
          {/* Open top */}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.09, 0.01, 0.05]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} />
          </mesh>
        </group>
      )}
      {action === 'harvest' && (
        /* Sickle */
        <group rotation={[0, 0, -0.3]}>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} />
          </mesh>
          <mesh position={[0.03, 0.03, 0]} rotation={[0, 0, 0.8]}>
            <torusGeometry args={[0.04, 0.008, 6, 8, Math.PI * 0.7]} />
            <meshStandardMaterial color="#b0bec5" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Farmer3D() {
  const { state, actions } = useFarmState();
  const groupRef = useRef();
  const partsRef = useRef({ leftArm: null, rightArm: null, leftLeg: null, rightLeg: null });

  const farmerState = state.farmerState;

  // Animation internal state
  const animRef = useRef({
    currentPos: new THREE.Vector3(...FARMER_IDLE_POSITION),
    targetPos: new THREE.Vector3(...FARMER_IDLE_POSITION),
    walkPhase: 0,
    actionTimer: 0,
    returnTimer: 0,
    lookAngle: 0,
    breathPhase: 0,
    phase: 'idle', // 'idle' | 'walking' | 'performing' | 'returning' | 'returnWalk'
    actionApplied: false,
  });

  // Update target when farmer state changes
  useEffect(() => {
    const anim = animRef.current;
    if (farmerState.isMoving && farmerState.targetPosition) {
      anim.targetPos.set(...farmerState.targetPosition);
      anim.phase = 'walking';
      anim.actionApplied = false;
    } else if (farmerState.isPerformingAction) {
      anim.phase = 'performing';
      anim.actionTimer = 0;
      anim.actionApplied = false;
    } else if (farmerState.returningHome) {
      anim.phase = 'returning';
      anim.returnTimer = 0;
      anim.targetPos.set(...FARMER_IDLE_POSITION);
    }
  }, [farmerState.isMoving, farmerState.isPerformingAction, farmerState.returningHome,
      farmerState.targetPosition, farmerState.targetPlotId]);

  // Main animation loop
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const anim = animRef.current;
    const parts = partsRef.current;
    const clampedDelta = Math.min(delta, 0.05); // Clamp for tab-unfocus

    anim.breathPhase += clampedDelta;

    switch (anim.phase) {
      case 'idle': {
        // Gentle breathing animation
        if (groupRef.current) {
          groupRef.current.position.y = Math.sin(anim.breathPhase * 1.5) * 0.01;
        }
        // Arm idle sway
        if (parts.leftArm) {
          parts.leftArm.rotation.x = Math.sin(anim.breathPhase * 0.8) * 0.05;
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.x = Math.sin(anim.breathPhase * 0.8 + Math.PI) * 0.05;
        }
        // Legs still
        if (parts.leftLeg) parts.leftLeg.rotation.x = 0;
        if (parts.rightLeg) parts.rightLeg.rotation.x = 0;
        break;
      }

      case 'walking': {
        // Move toward target
        const direction = new THREE.Vector3().subVectors(anim.targetPos, anim.currentPos);
        const distance = direction.length();

        if (distance < 0.15) {
          // Arrived at plot
          anim.currentPos.copy(anim.targetPos);
          anim.phase = 'performing';
          anim.actionTimer = 0;
          anim.actionApplied = false;
          actions.farmerArrivedAtPlot();
          break;
        }

        direction.normalize();
        const step = clampedDelta * WALK_SPEED;
        anim.currentPos.add(direction.multiplyScalar(Math.min(step, distance)));

        // Face walking direction
        anim.lookAngle = Math.atan2(direction.x, direction.z);

        // Walk cycle animation
        anim.walkPhase += clampedDelta * 8;
        const swing = Math.sin(anim.walkPhase) * 0.5;

        if (parts.leftLeg) parts.leftLeg.rotation.x = swing;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -swing;
        if (parts.leftArm) parts.leftArm.rotation.x = -swing * 0.6;
        if (parts.rightArm) parts.rightArm.rotation.x = swing * 0.6;

        // Bobbing
        groupRef.current.position.y = Math.abs(Math.sin(anim.walkPhase)) * 0.03;
        break;
      }

      case 'performing': {
        // Action animation
        anim.actionTimer += clampedDelta;
        const progress = Math.min(100, (anim.actionTimer / ACTION_DURATION) * 100);

        actions.farmerActionProgress(Math.round(progress));

        // Action-specific arm animations
        const actionPhase = anim.actionTimer * 4;

        if (farmerState.action === 'water') {
          // Pouring motion — right arm tilts
          if (parts.rightArm) {
            parts.rightArm.rotation.x = -0.8 + Math.sin(actionPhase) * 0.3;
            parts.rightArm.rotation.z = -0.2;
          }
          if (parts.leftArm) {
            parts.leftArm.rotation.x = -0.3;
          }
          // Slight body sway
          if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(actionPhase * 0.5) * 0.05;
          }
        } else if (farmerState.action === 'fertilize') {
          // Spreading motion — sweeping arms
          if (parts.rightArm) {
            parts.rightArm.rotation.x = -0.5;
            parts.rightArm.rotation.z = Math.sin(actionPhase * 1.2) * 0.6;
          }
          if (parts.leftArm) {
            parts.leftArm.rotation.x = -0.3;
            parts.leftArm.rotation.z = Math.sin(actionPhase * 1.2 + Math.PI) * 0.4;
          }
          // Body rotation for spreading
          if (groupRef.current) {
            groupRef.current.rotation.y = anim.lookAngle + Math.sin(actionPhase * 0.6) * 0.2;
          }
        } else if (farmerState.action === 'harvest') {
          // Cutting/gathering motion
          if (parts.rightArm) {
            parts.rightArm.rotation.x = -0.6 + Math.sin(actionPhase * 2) * 0.4;
          }
          if (parts.leftArm) {
            parts.leftArm.rotation.x = -0.8 + Math.sin(actionPhase * 2 + 1) * 0.3;
          }
          // Slight bending
          if (groupRef.current) {
            groupRef.current.rotation.x = Math.sin(actionPhase) * 0.08;
          }
        }

        // Complete action
        if (anim.actionTimer >= ACTION_DURATION && !anim.actionApplied) {
          anim.actionApplied = true;
          actions.completeFarmerAction();
        }

        // Legs still during action
        if (parts.leftLeg) parts.leftLeg.rotation.x = 0;
        if (parts.rightLeg) parts.rightLeg.rotation.x = 0;
        break;
      }

      case 'returning': {
        // Brief pause before walking home
        anim.returnTimer += clampedDelta;
        if (anim.returnTimer >= RETURN_DELAY) {
          anim.phase = 'returnWalk';
          anim.targetPos.set(...FARMER_IDLE_POSITION);
        }
        // Reset body rotation
        if (groupRef.current) {
          groupRef.current.rotation.x *= 0.9;
          groupRef.current.rotation.z *= 0.9;
        }
        break;
      }

      case 'returnWalk': {
        // Walk back home
        const dir = new THREE.Vector3().subVectors(anim.targetPos, anim.currentPos);
        const dist = dir.length();

        if (dist < 0.15) {
          anim.currentPos.copy(anim.targetPos);
          anim.phase = 'idle';
          actions.farmerReturnedHome();
          // Reset rotations
          if (groupRef.current) {
            groupRef.current.rotation.set(0, 0, 0);
          }
          break;
        }

        dir.normalize();
        const walkStep = clampedDelta * WALK_SPEED;
        anim.currentPos.add(dir.multiplyScalar(Math.min(walkStep, dist)));
        anim.lookAngle = Math.atan2(dir.x, dir.z);

        anim.walkPhase += clampedDelta * 8;
        const sw = Math.sin(anim.walkPhase) * 0.5;

        if (parts.leftLeg) parts.leftLeg.rotation.x = sw;
        if (parts.rightLeg) parts.rightLeg.rotation.x = -sw;
        if (parts.leftArm) parts.leftArm.rotation.x = -sw * 0.6;
        if (parts.rightArm) parts.rightArm.rotation.x = sw * 0.6;

        groupRef.current.position.y = Math.abs(Math.sin(anim.walkPhase)) * 0.03;
        // Reset body rotations from actions
        groupRef.current.rotation.x *= 0.95;
        groupRef.current.rotation.z *= 0.95;
        break;
      }
    }

    // Apply position and rotation
    if (groupRef.current) {
      groupRef.current.position.x = anim.currentPos.x;
      groupRef.current.position.z = anim.currentPos.z;
      // Smooth rotation toward look direction
      const currentY = groupRef.current.rotation.y;
      const targetY = anim.lookAngle;
      const diff = targetY - currentY;
      // Normalize angle difference
      const normalizedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      groupRef.current.rotation.y += normalizedDiff * 0.1;
    }
  });

  const currentAction = farmerState.action || (farmerState.isPerformingAction ? farmerState.action : null);

  return (
    <group ref={groupRef} position={[...FARMER_IDLE_POSITION]} scale={1.3}>
      <FarmerHead />
      <FarmerBody />
      <FarmerArms ref={partsRef} />
      <FarmerLegs ref={partsRef} />
      <FarmerTool action={currentAction} />

      {/* Shadow circle under feet */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 12]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
