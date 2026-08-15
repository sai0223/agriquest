/* ═══════════════════════════════════════════════════════════════
   FertilizerEffect — Animated particles when a plot is fertilized
   Brown/green granules that scatter and settle into the soil
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 20;

export default function FertilizerEffect({ active = false }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      // Starting position — scattered from center outward
      startX: (Math.random() - 0.5) * 0.3,
      startZ: (Math.random() - 0.5) * 0.3,
      // End position — spread across the plot
      endX: (Math.random() - 0.5) * 1.4,
      endZ: (Math.random() - 0.5) * 1.4,
      // Arc height
      arcHeight: 0.15 + Math.random() * 0.25,
      // Timing
      speed: 0.4 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      delay: Math.random() * 0.8,
      // Size
      size: 0.015 + Math.random() * 0.015,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Cyclical animation — granules arc outward then reset
      const cycle = ((t * p.speed + p.offset) % 2) / 2; // 0-1

      if (active) {
        // When active (farmer spreading): continuous scattering
        const progress = Math.max(0, Math.min(1, (cycle - p.delay * 0.3)));
        const x = p.startX + (p.endX - p.startX) * progress;
        const z = p.startZ + (p.endZ - p.startZ) * progress;
        // Parabolic arc
        const y = p.arcHeight * 4 * progress * (1 - progress) + 0.02;
        const scale = p.size * (progress < 0.9 ? 1 : (1 - progress) * 10);

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(Math.max(0.001, scale));
      } else {
        // Passive settled state — granules on soil surface
        const settleProgress = Math.min(1, cycle * 3);
        dummy.position.set(
          p.endX * settleProgress,
          0.02 + (1 - settleProgress) * p.arcHeight * 0.3,
          p.endZ * settleProgress,
        );
        dummy.scale.setScalar(p.size * (0.5 + Math.sin(t * 0.5 + p.offset) * 0.1));
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={active ? '#6d4c41' : '#5d4037'}
        emissive="#8d6e63"
        emissiveIntensity={active ? 0.4 : 0.15}
        roughness={0.9}
        transparent
        opacity={active ? 0.8 : 0.4}
      />
    </instancedMesh>
  );
}
