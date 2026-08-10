/* ═══════════════════════════════════════════════════════════════
   FarmScene — Main 3D Canvas with camera, lights, controls
   ═══════════════════════════════════════════════════════════════ */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FarmTerrain from './FarmTerrain.jsx';
import FarmPlot from './FarmPlot.jsx';
import FarmEnvironment from './FarmEnvironment.jsx';
import { useFarmState, ROWS, COLS, ROW_LABELS } from '../simulation/farmState.jsx';

/* ─── Plots Grid ──────────────────────────────────────────── */
function FarmPlots() {
  const { state } = useFarmState();

  return (
    <group>
      {Object.values(state.plots).map(plot => (
        <FarmPlot key={plot.id} plot={plot} />
      ))}
    </group>
  );
}

/* ─── Loading Fallback ────────────────────────────────────── */
function LoadingFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4caf50" wireframe />
    </mesh>
  );
}

/* ─── Main Scene Component ────────────────────────────────── */
export default function FarmScene() {
  return (
    <div className="farm3d-canvas-container">
      <Canvas
        shadows
        camera={{
          position: [12, 14, 12],
          fov: 45,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.0,
        }}
        style={{ background: '#87ceeb' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <FarmEnvironment />
          <FarmTerrain />
          <FarmPlots />
        </Suspense>

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          minPolarAngle={0.2}           // prevent looking from below
          maxPolarAngle={Math.PI / 2.3} // prevent going under ground
          minDistance={5}
          maxDistance={28}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          panSpeed={0.6}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
