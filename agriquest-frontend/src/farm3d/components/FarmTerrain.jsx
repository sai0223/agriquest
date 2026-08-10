/* ═══════════════════════════════════════════════════════════════
   FarmTerrain — Ground plane, paths, and base terrain
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';

const FARM_SIZE = 12;
const PATH_WIDTH = 0.15;

export default function FarmTerrain() {
  return (
    <group>
      {/* Main grass ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[FARM_SIZE * 2, FARM_SIZE * 2]} />
        <meshStandardMaterial
          color="#3a5f0b"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* Slightly elevated farm area (darker soil border) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[FARM_SIZE + 1, FARM_SIZE + 1]} />
        <meshStandardMaterial
          color="#2d4a0e"
          roughness={0.9}
        />
      </mesh>

      {/* Horizontal paths between plot rows */}
      {[-1.5, 0, 1.5].map((z, i) => (
        <mesh
          key={`hpath-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, z * 1.65]}
          receiveShadow
        >
          <planeGeometry args={[FARM_SIZE - 1, PATH_WIDTH]} />
          <meshStandardMaterial color="#8d7b68" roughness={0.95} />
        </mesh>
      ))}

      {/* Vertical paths between plot columns */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh
          key={`vpath-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x * 1.65, 0.001, 0]}
          receiveShadow
        >
          <planeGeometry args={[PATH_WIDTH, FARM_SIZE - 1]} />
          <meshStandardMaterial color="#8d7b68" roughness={0.95} />
        </mesh>
      ))}

      {/* Outer path border — perimeter walkway */}
      {/* Top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -4.2]} receiveShadow>
        <planeGeometry args={[9, 0.3]} />
        <meshStandardMaterial color="#9e8e7e" roughness={0.9} />
      </mesh>
      {/* Bottom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 4.2]} receiveShadow>
        <planeGeometry args={[9, 0.3]} />
        <meshStandardMaterial color="#9e8e7e" roughness={0.9} />
      </mesh>
      {/* Left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.2, 0.002, 0]} receiveShadow>
        <planeGeometry args={[0.3, 8.7]} />
        <meshStandardMaterial color="#9e8e7e" roughness={0.9} />
      </mesh>
      {/* Right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.2, 0.002, 0]} receiveShadow>
        <planeGeometry args={[0.3, 8.7]} />
        <meshStandardMaterial color="#9e8e7e" roughness={0.9} />
      </mesh>
    </group>
  );
}
