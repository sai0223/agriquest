/* ═══════════════════════════════════════════════════════════════
   WaterEffect — Animated particles when a plot is watered
   Supports both passive (soil moisture) and active (sprinkling)
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 18;

export default function WaterEffect({ active = false }) {
  const meshRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 1.2,
      z: (Math.random() - 0.5) * 1.2,
      speed: 0.3 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
      size: 0.02 + Math.random() * 0.02,
      // Sprinkling-specific params
      startHeight: 0.6 + Math.random() * 0.3,
      arcSpread: (Math.random() - 0.5) * 0.8,
      arcSpreadZ: (Math.random() - 0.5) * 0.8,
      fallSpeed: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 0.5,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      if (active) {
        // Sprinkling from above — water droplets fall from height
        const cycle = ((t * p.fallSpeed + p.offset) % 1.5) / 1.5;
        const fallProgress = Math.max(0, cycle - p.delay);

        if (fallProgress <= 0) {
          // Not yet started in this cycle
          dummy.position.set(0, -1, 0); // hide
          dummy.scale.setScalar(0.001);
        } else {
          const normalizedProgress = Math.min(1, fallProgress / (1 - p.delay));
          // Start from above, arc outward, fall to soil
          const x = p.arcSpread * normalizedProgress;
          const z = p.arcSpreadZ * normalizedProgress;
          const y = p.startHeight * (1 - normalizedProgress) + 0.02;

          // Slight wobble for realism
          const wobble = Math.sin(t * 8 + p.offset) * 0.01;

          dummy.position.set(x + wobble, y, z + wobble);

          // Droplets get slightly bigger as they fall (rain drop effect)
          const sizeScale = active
            ? p.size * (0.8 + normalizedProgress * 0.6)
            : p.size;
          // Fade out as they hit ground
          const fadeFactor = normalizedProgress > 0.85 ? (1 - normalizedProgress) * 6.67 : 1;
          dummy.scale.setScalar(Math.max(0.001, sizeScale * fadeFactor));
        }
      } else {
        // Passive mode — gentle moisture particles rising from soil
        const y = ((t * p.speed + p.offset) % 1) * 0.5;
        const opacity = Math.sin(((t * p.speed + p.offset) % 1) * Math.PI);

        dummy.position.set(p.x, y + 0.05, p.z);
        dummy.scale.setScalar(p.size * (1 + opacity * 0.5));
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color={active ? '#29b6f6' : '#4fc3f7'}
        emissive={active ? '#0288d1' : '#29b6f6'}
        emissiveIntensity={active ? 0.7 : 0.5}
        transparent
        opacity={active ? 0.7 : 0.5}
      />
    </instancedMesh>
  );
}
