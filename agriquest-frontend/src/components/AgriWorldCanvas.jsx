import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sparkles } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

function latLonToVector(latitude, longitude, radius = 2.35) {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function CultivationGlobe() {
  const globe = useRef();
  const [borderPositions, setBorderPositions] = useState(null);
  const automaticRotation = useRef(0.35);
  const targetRotation = useRef(new THREE.Vector2());
  const dragRotation = useRef(new THREE.Vector2());
  const dragState = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    fetch(WORLD_GEOJSON_URL)
      .then((response) => response.json())
      .then((geojson) => {
        if (cancelled) return;
        const rings = geojson.features.flatMap((feature) => {
          const coordinates = feature.geometry?.coordinates || [];
          return feature.geometry?.type === 'Polygon'
            ? coordinates
            : coordinates.flat();
        });
          const positions = [];
        rings.filter((ring) => ring.length > 2).forEach((ring) => {
          const step = ring.length > 120 ? 3 : ring.length > 50 ? 2 : 1;
          const sampled = ring.filter((_, index) => index % step === 0);
          sampled.forEach((point, index) => {
            const nextPoint = sampled[(index + 1) % sampled.length];
            const start = latLonToVector(point[1], point[0], 2.365);
            const end = latLonToVector(nextPoint[1], nextPoint[0], 2.365);
            positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
          });
        });
        setBorderPositions(new Float32Array(positions));
      })
      .catch(() => setBorderPositions(null));

    return () => { cancelled = true; };
  }, []);

  useFrame(({ pointer }) => {
    if (!globe.current) return;
    automaticRotation.current += 0.0012;
    targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, dragRotation.current.x + pointer.y * 0.06, 0.08);
    targetRotation.current.y = THREE.MathUtils.lerp(targetRotation.current.y, dragRotation.current.y, 0.08);
    globe.current.rotation.x = targetRotation.current.x;
    globe.current.rotation.y = automaticRotation.current + targetRotation.current.y;
  });

  return (
    <group
      ref={globe}
      rotation={[0.08, 0.35, -0.08]}
      onPointerDown={(event) => {
        event.stopPropagation();
        dragState.current = { active: true, x: event.clientX, y: event.clientY };
        event.target.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragState.current.active) return;
        const deltaX = event.clientX - dragState.current.x;
        const deltaY = event.clientY - dragState.current.y;
        dragRotation.current.y += deltaX * 0.008;
        dragRotation.current.x = THREE.MathUtils.clamp(dragRotation.current.x + deltaY * 0.005, -0.7, 0.7);
        dragState.current.x = event.clientX;
        dragState.current.y = event.clientY;
      }}
      onPointerUp={(event) => {
        dragState.current.active = false;
        event.target.releasePointerCapture?.(event.pointerId);
      }}
      onPointerCancel={() => { dragState.current.active = false; }}
      onPointerLeave={() => { dragState.current.active = false; }}
    >
      <mesh>
        <sphereGeometry args={[2.3, 48, 48]} />
        <meshStandardMaterial color="#071b15" roughness={0.78} metalness={0.1} emissive="#062116" emissiveIntensity={0.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.42, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {borderPositions && (
        <lineSegments frustumCulled={false} raycast={() => null}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[borderPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#66e86f" transparent opacity={0.92} />
        </lineSegments>
      )}
    </group>
  );
}

function World() {
  return (
    <group>
      <CultivationGlobe />
      <mesh position={[1.85, 1.2, 0]} castShadow>
        <icosahedronGeometry args={[0.12, 1]} />
        <meshStandardMaterial color="#f0a500" emissive="#f0a500" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-1.8, 0.95, 0.2]} castShadow>
        <icosahedronGeometry args={[0.08, 1]} />
        <meshStandardMaterial color="#80ff9b" emissive="#3fb950" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export default function AgriWorldCanvas() {
  return (
    <Canvas dpr={[1, 1.25]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <PerspectiveCamera makeDefault position={[0, 0, 7.4]} fov={38} />
      <ambientLight intensity={1.8} color="#d9ffe0" />
      <directionalLight position={[3, 6, 4]} intensity={3.4} color="#fff1c2" />
      <pointLight position={[-3, 1, 2]} intensity={4} color="#3fb950" distance={8} />
      <pointLight position={[2, 1, -2]} intensity={3} color="#f0a500" distance={7} />
      <World />
      <Sparkles count={18} scale={[7, 4, 5]} size={1.8} speed={0.18} color="#80ff9b" opacity={0.35} />
    </Canvas>
  );
}
