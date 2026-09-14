/* ═══════════════════════════════════════════════════════════════
   FarmScene — Main 3D Canvas with camera, lights, controls
   Connects IrrigationSystem to borewell state
   ═══════════════════════════════════════════════════════════════ */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FarmTerrain from './FarmTerrain.jsx';
import FarmPlot from './FarmPlot.jsx';
import FarmEnvironment from './FarmEnvironment.jsx';
import Farmer3D from './Farmer3D.jsx';
import IrrigationSystem from './IrrigationSystem.jsx';
import { useFarmState } from '../simulation/farmState.jsx';

/* ─── Error Boundary for 3D components ────────────────────── */
class Scene3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('3D Scene Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <group>
          <ambientLight intensity={0.5} />
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="red" wireframe />
          </mesh>
        </group>
      );
    }
    return this.props.children;
  }
}

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

/* ─── Irrigation connected to borewell ────────────────────── */
function FarmIrrigation() {
  const { state } = useFarmState();

  return (
    <IrrigationSystem
      isActive={state.borewellActive}
      plots={state.plots}
      flowProgress={state.borewellFlowProgress}
      waterLevel={state.borewellWaterLevel}
    />
  );
}

/* ─── Main Scene Content (inside Canvas) ──────────────────── */
function SceneContent() {
  return (
    <>
      {/* Environment (lights, sky, trees) — outside Suspense since Sky can suspend */}
      <Scene3DErrorBoundary>
        <FarmEnvironment />
      </Scene3DErrorBoundary>

      {/* Main farm content */}
      <Scene3DErrorBoundary>
        <FarmTerrain />
        <FarmPlots />
      </Scene3DErrorBoundary>

      <Scene3DErrorBoundary>
        <FarmIrrigation />
      </Scene3DErrorBoundary>

      <Scene3DErrorBoundary>
        <Farmer3D />
      </Scene3DErrorBoundary>

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={5}
        maxDistance={28}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        panSpeed={0.6}
        zoomSpeed={0.8}
      />
    </>
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
          toneMapping: 3,
          toneMappingExposure: 1.0,
        }}
        style={{ background: '#87ceeb' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
