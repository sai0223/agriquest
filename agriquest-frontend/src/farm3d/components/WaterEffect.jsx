/* ═══════════════════════════════════════════════════════════════
   WaterEffect — Animated particles when a plot is watered
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 12;

export default function WaterEffect() {
  const meshRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 1.2,
      z: (Math.random() - 0.5) * 1.2,
      speed: 0.3 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
      size: 0.02 + Math.random() * 0.02,
    }));
  }, []);

  // Positions buffer
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const y = ((t * p.speed + p.offset) % 1) * 0.5;
      const opacity = Math.sin(((t * p.speed + p.offset) % 1) * Math.PI);

      dummy.position.set(p.x, y + 0.05, p.z);
      dummy.scale.setScalar(p.size * (1 + opacity * 0.5));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#4fc3f7"
        emissive="#29b6f6"
        emissiveIntensity={0.5}
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  );
}
