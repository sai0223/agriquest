/* ═══════════════════════════════════════════════════════════════
   FarmEnvironment — Trees, water, farmhouse, sky, lighting
   ═══════════════════════════════════════════════════════════════ */
import React, { useMemo } from 'react';
import { Sky } from '@react-three/drei';

/* ─── Simple Tree ─────────────────────────────────────── */
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.0, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.5, 1.0, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.35, 0.7, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ─── Round Bush Tree ─────────────────────────────────── */
function BushTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.7, 6]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.45, 8, 8]} />
        <meshStandardMaterial color="#43a047" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ─── Water Channel ───────────────────────────────────── */
function WaterChannel() {
  return (
    <group>
      {/* Channel bed */}
      <mesh position={[6.5, -0.08, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.15, 10]} />
        <meshStandardMaterial color="#5d4037" roughness={0.95} />
      </mesh>
      {/* Water surface */}
      <mesh position={[6.5, 0.01, 0]}>
        <boxGeometry args={[0.6, 0.04, 9.5]} />
        <meshStandardMaterial
          color="#1e88e5"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Small connecting irrigation channels */}
      {[-3, -1, 1, 3].map((z, i) => (
        <group key={i}>
          <mesh position={[5.5, -0.02, z]} receiveShadow>
            <boxGeometry args={[1.5, 0.06, 0.15]} />
            <meshStandardMaterial color="#6d4c41" roughness={0.9} />
          </mesh>
          <mesh position={[5.5, 0.01, z]}>
            <boxGeometry args={[1.3, 0.03, 0.1]} />
            <meshStandardMaterial
              color="#42a5f5"
              transparent
              opacity={0.5}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Farmhouse ───────────────────────────────────────── */
function Farmhouse() {
  return (
    <group position={[-7, 0, -5]}>
      {/* Base/walls */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.2, 1.8]} />
        <meshStandardMaterial color="#d7ccc8" roughness={0.85} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[1.8, 0.9, 4]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.8} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.4, 0.91]}>
        <boxGeometry args={[0.5, 0.8, 0.02]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Windows */}
      <mesh position={[-0.55, 0.7, 0.91]}>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshStandardMaterial color="#bbdefb" emissive="#bbdefb" emissiveIntensity={0.3} roughness={0.1} />
      </mesh>
      <mesh position={[0.55, 0.7, 0.91]}>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshStandardMaterial color="#bbdefb" emissive="#bbdefb" emissiveIntensity={0.3} roughness={0.1} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0.6, 1.8, -0.3]} castShadow>
        <boxGeometry args={[0.25, 0.5, 0.25]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Tractor ─────────────────────────────────────────── */
function Tractor() {
  return (
    <group position={[-7, 0, 3]} rotation={[0, 0.3, 0]}>
      {/* Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 1.4]} />
        <meshStandardMaterial color="#c62828" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 0.35, -0.8]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.6]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Cabin top */}
      <mesh position={[0, 0.9, 0.1]} castShadow>
        <boxGeometry args={[0.7, 0.35, 0.8]} />
        <meshStandardMaterial color="#e53935" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.9, 0.51]}>
        <boxGeometry args={[0.55, 0.25, 0.02]} />
        <meshStandardMaterial color="#90caf9" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* Rear wheels */}
      <mesh position={[-0.5, 0.25, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
        <meshStandardMaterial color="#212121" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.25, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
        <meshStandardMaterial color="#212121" roughness={0.9} />
      </mesh>
      {/* Front wheels (smaller) */}
      <mesh position={[-0.45, 0.15, -0.85]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
        <meshStandardMaterial color="#212121" roughness={0.9} />
      </mesh>
      <mesh position={[0.45, 0.15, -0.85]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
        <meshStandardMaterial color="#212121" roughness={0.9} />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0.2, 0.8, -0.9]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.4, 6]} />
        <meshStandardMaterial color="#424242" roughness={0.8} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Fence Posts ──────────────────────────────────────── */
function FenceSection({ start, end, count = 5 }) {
  const posts = useMemo(() => {
    const result = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      result.push([
        start[0] + (end[0] - start[0]) * t,
        0.2,
        start[2] + (end[2] - start[2]) * t,
      ]);
    }
    return result;
  }, [start, end, count]);

  return (
    <group>
      {posts.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.06, 0.45, 0.06]} />
          <meshStandardMaterial color="#795548" roughness={0.9} />
        </mesh>
      ))}
      {/* Horizontal rails */}
      <mesh position={[
        (start[0] + end[0]) / 2,
        0.3,
        (start[2] + end[2]) / 2,
      ]}>
        <boxGeometry args={[
          Math.abs(end[0] - start[0]) || 0.03,
          0.04,
          Math.abs(end[2] - start[2]) || 0.03,
        ]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.85} />
      </mesh>
      <mesh position={[
        (start[0] + end[0]) / 2,
        0.15,
        (start[2] + end[2]) / 2,
      ]}>
        <boxGeometry args={[
          Math.abs(end[0] - start[0]) || 0.03,
          0.04,
          Math.abs(end[2] - start[2]) || 0.03,
        ]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function FarmEnvironment() {
  return (
    <group>
      {/* ─── Sky ───────────────────────────────────────── */}
      <Sky
        distance={450000}
        sunPosition={[50, 30, -20]}
        inclination={0.55}
        azimuth={0.25}
        turbidity={3}
        rayleigh={0.5}
      />

      {/* ─── Lighting ──────────────────────────────────── */}
      <ambientLight intensity={0.4} color="#ffe0b2" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
        color="#fff8e1"
      />
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#3a5f0b"
        intensity={0.3}
      />

      {/* ─── Trees ─────────────────────────────────────── */}
      <Tree position={[-8, 0, 0]} scale={1.2} />
      <Tree position={[-9, 0, -2]} scale={0.9} />
      <BushTree position={[-8.5, 0, 2.5]} scale={1.0} />
      <Tree position={[8, 0, -6]} scale={1.1} />
      <BushTree position={[9, 0, -4]} scale={0.8} />
      <Tree position={[8.5, 0, 4]} scale={1.0} />
      <BushTree position={[-6, 0, 7]} scale={0.9} />
      <Tree position={[-3, 0, 8]} scale={1.1} />
      <BushTree position={[2, 0, 8.5]} scale={0.7} />
      <Tree position={[5, 0, 7.5]} scale={1.0} />
      <BushTree position={[-5, 0, -8]} scale={0.9} />
      <Tree position={[0, 0, -9]} scale={1.3} />
      <Tree position={[6, 0, -8]} scale={0.8} />

      {/* ─── Water Channel ─────────────────────────────── */}
      <WaterChannel />

      {/* ─── Farmhouse ─────────────────────────────────── */}
      <Farmhouse />

      {/* ─── Tractor ──────────────────────────────────── */}
      <Tractor />

      {/* ─── Fences ────────────────────────────────────── */}
      <FenceSection start={[-5, 0, -5]} end={[5, 0, -5]} count={8} />
      <FenceSection start={[-5, 0, 5]} end={[5, 0, 5]} count={8} />
      <FenceSection start={[-5, 0, -5]} end={[-5, 0, 5]} count={8} />

      {/* ─── Fog ───────────────────────────────────────── */}
      <fog attach="fog" args={['#87ceeb', 18, 40]} />
    </group>
  );
}
