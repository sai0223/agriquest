/* ═══════════════════════════════════════════════════════════════
   IrrigationSystem — Advanced Realistic Borewell/Flood Irrigation
   Simulates real farm irrigation: borewell pump → main channel →
   field channels → furrows between crop rows → soil absorption
   ════════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHANNEL_SEGMENTS = 40;
const FURROW_COUNT = 12;
const WATER_PARTICLE_COUNT = 200;

function BorewellHead({ isActive, waterLevel }) {
  const headRef = useRef();
  const valveRef = useRef();
  const pipeRef = useRef();
  const pumpRef = useRef();

  useFrame((_, delta) => {
    if (valveRef.current && isActive) {
      valveRef.current.rotation.z = Math.min(Math.PI / 2, valveRef.current.rotation.z + delta * 3);
    } else if (valveRef.current && !isActive) {
      valveRef.current.rotation.z = Math.max(0, valveRef.current.rotation.z - delta * 2);
    }

    if (pumpRef.current && isActive) {
      pumpRef.current.rotation.y += delta * 15;
      pumpRef.current.position.y = -0.15 + Math.sin(performance.now() * 0.005) * 0.01;
    }
  });

  return (
    <group ref={headRef} position={[5.8, 0, -4.2]}>
      {/* Concrete base platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
        <meshStandardMaterial color="#555" roughness={0.9} />
      </mesh>

      {/* Borewell casing pipe */}
      <mesh ref={pipeRef} position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1.6, 12]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Pump motor housing */}
      <group ref={pumpRef} position={[0, 1.7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.35, 0.4]} />
          <meshStandardMaterial color="#2d2d2d" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.22, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Main valve - the key component that opens/closes */}
      <group ref={valveRef} position={[0, 1.85, 0.3]}>
        {/* Valve body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
          <meshStandardMaterial color="#8b4513" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Valve handle */}
        <mesh position={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.03, 0.03]} />
          <meshStandardMaterial color="#654321" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Valve wheel */}
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.08, 0.015, 6, 16]} />
          <meshStandardMaterial color="#8b4513" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* Outlet pipe from valve to main channel */}
      <mesh position={[0.4, 1.85, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Electrical box */}
      <mesh position={[-0.4, 1.5, 0.35]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.15]} />
        <meshStandardMaterial color="#444" roughness={0.7} />
      </mesh>
      <mesh position={[-0.4, 1.5, 0.43]}>
        <boxGeometry args={[0.23, 0.28, 0.02]} />
        <meshStandardMaterial color="#222" roughness={0.2} />
      </mesh>

      {/* Water level indicator tube */}
      <group position={[-0.25, 0.9, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 1.5, 8]} />
          <meshStandardMaterial
            color="#000"
            transparent
            opacity={0.3}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, waterLevel * 0.75, 0]} scale={[1, waterLevel, 1]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshStandardMaterial
            color="#1e88e5"
            transparent
            opacity={0.8}
            emissive="#1e88e5"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Pressure gauge */}
      <mesh position={[0.3, 1.85, -0.15]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0.3, 1.87, -0.13]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.3, 1.87, -0.12]} rotation={[0, 0, isActive ? -0.5 : -2.2]}>
        <boxGeometry args={[0.005, 0.035, 0.01]} />
        <meshStandardMaterial color="#f00" />
      </mesh>
    </group>
  );
}

function MainChannel({ isActive, flowProgress }) {
  const channelRef = useRef();

  useFrame((_, delta) => {
    if (channelRef.current && isActive) {
      channelRef.current.material.map?.offset.set(0, -flowProgress * 2);
      channelRef.current.material.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Channel trench */}
      <mesh position={[3.5, -0.06, -4.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.8, 8.4, 20, CHANNEL_SEGMENTS]} />
        <meshStandardMaterial color="#4a3728" roughness={0.95} />
      </mesh>

      {/* Water surface in main channel with animated flow texture */}
      <mesh
        ref={channelRef}
        position={[3.5, isActive ? 0.02 : -0.04, -4.2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.6, 8.4, 10, CHANNEL_SEGMENTS]} />
        <meshStandardMaterial
          color="#1e88e5"
          roughness={0.05}
          metalness={0.2}
          transparent
          opacity={isActive ? 0.85 : 0}
          depthWrite={false}
          map={NoiseTexture({ scale: 2, opacity: 0.4, color: "#42a5f5" })}
        />
      </mesh>

      {/* Flow direction arrows on water surface */}
      {isActive && Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[3.5, 0.025, -4.2 + i * 1.05 - (flowProgress % 1) * 1.05]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.3, 0.15]} />
          <meshBasicMaterial
            color="#64b5f6"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Channel edges - concrete lining */}
      {[-0.35, 0.35].map(x => (
        <mesh
          key={x}
          position={[3.5 + x, 0.05, -4.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[0.1, 8.4]} />
          <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function FieldChannels({ isActive, flowProgress }) {
  return (
    <group>
      {/* Distribution channels running along plot rows */}
      {[-1.65, 0, 1.65].map((z, zi) => (
        <group key={`dist-${zi}`}>
          {/* Channel trench */}
          <mesh
            position={[3.5, -0.05, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            scale={{ x: isActive ? 1 : 0, y: 1, z: 1 }}
          >
            <planeGeometry args={[4.8, 0.4, 10, 5]} />
            <meshStandardMaterial color="#4a3728" roughness={0.95} />
          </mesh>

          {/* Water in distribution channel */}
          <mesh
            position={[3.5, isActive ? 0.01 : -0.03, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={{ x: isActive ? 1 : 0.001, y: 1, z: 1 }}
          >
            <planeGeometry args={[4.8, 0.3, 10, 5]} />
            <meshStandardMaterial
              color="#1e88e5"
              roughness={0.08}
              metalness={0.15}
              transparent
              opacity={isActive ? 0.8 : 0}
              depthWrite={false}
              map={NoiseTexture({ scale: 1.5, opacity: 0.3, color: "#42a5f5" })}
            />
          </mesh>

          {/* Gates at each plot entry - animated opening */}
          {[-1.65, 0, 1.65].map((x, xi) => (
            <IrrigationGate
              key={`${zi}-${xi}`}
              position={[3.5 + x + 0.2, 0, z]}
              isOpen={isActive}
              delay={zi * 0.3 + xi * 0.15}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function IrrigationGate({ position, isOpen, delay }) {
  const gateRef = useRef();
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    const target = isOpen ? 1 : 0;
    progressRef.current += (target - progressRef.current) * delta * 4;
    if (gateRef.current) {
      gateRef.current.rotation.z = -progressRef.current * Math.PI / 2;
      gateRef.current.position.y = progressRef.current * 0.1;
    }
  });

  return (
    <group ref={gateRef} position={position}>
      {/* Gate frame */}
      <mesh position={[-0.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.35]} />
        <meshStandardMaterial color="#555" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Gate door */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.04, 0.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Gate handle */}
      <mesh position={[0, 0.22, 0.16]}>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}

function Furrows({ isActive, plots, flowProgress }) {
  const furrowRefs = useRef([]);
  const waterMeshes = useRef([]);

  return (
    <group>
      {plots.map(plot => {
        const pos = getPlotPosition(plot.row, plot.col);
        const hasCrop = plot.cropId && plot.growthStage !== 'EMPTY';
        const needsWater = hasCrop && plot.soilMoisture < 80;

        return (
          <group key={plot.id} position={[pos[0], 0, pos[2]]}>
            {/* Furrows between crop rows within the plot */}
            {Array.from({ length: 5 }, (_, fi) => {
              const furrowZ = (fi - 2) * 0.3;
              return (
                <group key={fi}>
                  {/* Furrow trench */}
                  <mesh
                    position={[0, -0.04, furrowZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                  >
                    <planeGeometry args={[1.4, 0.12]} />
                    <meshStandardMaterial color="#3d2e1e" roughness={0.98} />
                  </mesh>

                  {/* Water flowing in furrow */}
                  <FurrowWater
                    key={`water-${fi}`}
                    position={[0, isActive && needsWater ? -0.01 : -0.05, furrowZ]}
                    isActive={isActive && needsWater}
                    flowProgress={flowProgress}
                    length={1.4}
                    delay={fi * 0.1 + plot.row * 0.2 + plot.col * 0.1}
                  />

                  {/* Wet soil patches beside furrows */}
                  <mesh
                    position={[0, -0.015, furrowZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={{ x: 1, y: needsWater && isActive ? 1.5 : 1, z: 1 }}
                  >
                    <planeGeometry args={[1.4, 0.18]} />
                    <meshStandardMaterial
                      color={plot.soilMoisture > 60 ? '#4a3728' : '#5d4037'}
                      roughness={0.95}
                      transparent
                      opacity={plot.soilMoisture > 60 ? 0.3 : 0}
                    />
                  </mesh>
                </group>
              );
            })}

            {/* End-of-furrow water pooling */}
            {isActive && needsWater && (
              <mesh
                position={[0, 0.02, 0.7]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={{ x: 0.5 + Math.sin(performance.now() * 0.003) * 0.1, y: 0.5 + Math.sin(performance.now() * 0.003) * 0.1, z: 1 }}
              >
                <circleGeometry args={[0.3, 16]} />
                <meshStandardMaterial
                  color="#1e88e5"
                  roughness={0.02}
                  metalness={0.25}
                  transparent
                  opacity={0.6}
                  depthWrite={false}
                  map={NoiseTexture({ scale: 3, opacity: 0.5, color: "#42a5f5" })}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function FurrowWater({ position, isActive, flowProgress, length, delay }) {
  const meshRef = useRef();
  const offsetRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !isActive) return;
    offsetRef.current += delta * 1.5;
    if (meshRef.current.material.map) {
      meshRef.current.material.map.offset.set(offsetRef.current, 0);
      meshRef.current.material.needsUpdate = true;
    }
  });

  const animatedProgress = (flowProgress * 2 - delay) % 1;
  const visible = isActive && animatedProgress > 0;

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={{ x: visible ? 1 : 0.001, y: 1, z: 1 }}
    >
      <planeGeometry args={[length, 0.08, 20, 4]} />
      <meshStandardMaterial
        color="#1e88e5"
        roughness={0.05}
        metalness={0.2}
        transparent
        opacity={visible ? 0.85 : 0}
        depthWrite={false}
        map={NoiseTexture({ scale: 2, opacity: 0.4, color: "#64b5f6" })}
      />
    </mesh>
  );
}

function WaterParticles({ isActive, plots }) {
  const particlesRef = useRef();
  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < WATER_PARTICLE_COUNT; i++) {
      data.push({
        x: (Math.random() - 0.5) * 12,
        z: (Math.random() - 0.5) * 12,
        y: 0.5 + Math.random() * 1,
        speed: 0.5 + Math.random() * 1,
        size: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        type: Math.random() > 0.7 ? 'spray' : 'droplet',
        targetPlot: null,
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!particlesRef.current || !isActive) return;
    const t = performance.now() * 0.001;

    particleData.forEach((p, i) => {
      if (p.type === 'spray') {
        // Spray from borewell outlet
        const cycle = (t * p.speed + p.phase) % 3;
        if (cycle < 1.5) {
          const progress = cycle / 1.5;
          dummy.position.set(
            6.6 + Math.sin(progress * Math.PI) * 0.3,
            1.9 - progress * 1.5,
            -4.2 + (Math.random() - 0.5) * 0.4
          );
          dummy.scale.setScalar(p.size * (1 - progress * 0.5));
        } else {
          dummy.position.set(0, -10, 0);
          dummy.scale.setScalar(0.001);
        }
      } else {
        // Droplets in furrows
        const cycle = (t * p.speed + p.phase) % 4;
        const progress = cycle / 4;
        const plotIdx = Math.floor(p.x * 0.5 + 8) % plots.length;
        const plot = plots[plotIdx];
        if (plot && plot.cropId) {
          const pos = getPlotPosition(plot.row, plot.col);
          dummy.position.set(
            pos[0] + (Math.random() - 0.5) * 1.2,
            0.02 + Math.sin(progress * Math.PI) * 0.03,
            pos[2] + (Math.random() - 0.5) * 1.2
          );
          dummy.scale.setScalar(p.size * (0.5 + Math.sin(progress * Math.PI) * 0.5));
        } else {
          dummy.position.set(0, -10, 0);
          dummy.scale.setScalar(0.001);
        }
      }
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    });
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isActive) return null;

  return (
    <instancedMesh ref={particlesRef} args={[null, null, WATER_PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#29b6f6"
        emissive="#0288d1"
        emissiveIntensity={0.8}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
}

function NoiseTexture({ scale, opacity, color }) {
  const textureRef = useRef();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(256, 256);
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const nx = x / 256 * scale;
        const ny = y / 256 * scale;
        const noise = simplexNoise(nx * 10, ny * 10, performance.now() * 0.001) * 0.5 + 0.5;
        const idx = (y * 256 + x) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = noise * 255 * opacity;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureRef.current = texture;
  }, [scale, opacity, color]);

  return textureRef.current;
}

function simplexNoise(x, y, z) {
  // Simplified noise function
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function getPlotPosition(row, col) {
  const PLOT_SPACING = 1.8;
  const offset = (3 * PLOT_SPACING) / 2;
  return [
    col * PLOT_SPACING - offset,
    0.04,
    row * PLOT_SPACING - offset,
  ];
}

export default function IrrigationSystem({ isActive, plots, flowProgress = 0, waterLevel = 1 }) {
  const plotArray = Object.values(plots).filter(p => p.cropId);

  return (
    <group>
      <BorewellHead isActive={isActive} waterLevel={waterLevel} />
      <MainChannel isActive={isActive} flowProgress={flowProgress} />
      <FieldChannels isActive={isActive} flowProgress={flowProgress} />
      <Furrows isActive={isActive} plots={plotArray} flowProgress={flowProgress} />
      <WaterParticles isActive={isActive} plots={plotArray} />
    </group>
  );
}

export { BorewellHead, MainChannel, FieldChannels, Furrows, WaterParticles, getPlotPosition };