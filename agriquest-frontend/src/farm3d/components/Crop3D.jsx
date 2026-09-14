/* ═══════════════════════════════════════════════════════════════
   Crop3D — Realistic Procedural 3D crop models per crop type
   Each crop has distinct visuals at every growth stage
   ═══════════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { GROWTH_STAGES, getCropById } from '../data/cropData.js';

/* ─── Leaf helper ─────────────────────────────────────────── */
function Leaf({ position, rotation, scale, color, width = 0.3, height = 0.15 }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={color} side={2} roughness={0.7} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RICE — Thin shoots in standing water → tillers → golden panicle
   ═══════════════════════════════════════════════════════════════ */
function RiceSeedling({ color }) {
  return (
    <group>
      {/* Multiple thin rice shoots */}
      {[0, 0.04, -0.03, 0.02, -0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.06 + i * 0.01, (i % 2) * 0.02]}>
          <cylinderGeometry args={[0.005, 0.008, 0.12 + i * 0.02, 4]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function RiceGrowing({ color }) {
  return (
    <group>
      {/* Dense tillers — many thin stems */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 0.03 + (i % 3) * 0.015;
        return (
          <group key={i}>
            <mesh position={[Math.cos(angle) * r, 0.15, Math.sin(angle) * r]}>
              <cylinderGeometry args={[0.006, 0.01, 0.3, 4]} />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Long drooping leaves */}
            <Leaf
              position={[Math.cos(angle) * (r + 0.06), 0.18, Math.sin(angle) * (r + 0.04)]}
              rotation={[0.3, angle, -0.4 - (i % 3) * 0.15]}
              scale={0.8 + (i % 2) * 0.2}
              color={color}
              width={0.25}
              height={0.05}
            />
          </group>
        );
      })}
    </group>
  );
}

function RiceMature({ color, matureColor, isRipening }) {
  const panicleColor = isRipening ? matureColor : '#a8d08d';
  return (
    <group>
      {/* Dense stems */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 0.025;
        return (
          <group key={i}>
            <mesh position={[Math.cos(angle) * r, 0.22, Math.sin(angle) * r]}>
              <cylinderGeometry args={[0.007, 0.012, 0.44, 4]} />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Drooping panicle (grain head) */}
            <group position={[Math.cos(angle) * r, 0.44, Math.sin(angle) * r]} rotation={[0.5 + i * 0.1, angle, 0.3]}>
              <mesh>
                <cylinderGeometry args={[0.015, 0.005, 0.1, 6]} />
                <meshStandardMaterial color={panicleColor} roughness={0.4} />
              </mesh>
              {/* Tiny grains */}
              {[0.02, 0.04, 0.06].map((y, j) => (
                <mesh key={j} position={[0, -y, 0.01 * j]}>
                  <sphereGeometry args={[0.008, 4, 4]} />
                  <meshStandardMaterial color={panicleColor} roughness={0.5} />
                </mesh>
              ))}
            </group>
            {/* Long leaves */}
            <Leaf
              position={[Math.cos(angle) * 0.08, 0.25, Math.sin(angle) * 0.06]}
              rotation={[0.2, angle, -0.6]}
              scale={1.0}
              color={color}
              width={0.28}
              height={0.04}
            />
          </group>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WHEAT — Grass-like blades → upright stems with ear → golden
   ═══════════════════════════════════════════════════════════════ */
function WheatSeedling({ color }) {
  return (
    <group>
      {[0, 0.03, -0.02].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.06, i * 0.015]}>
            <cylinderGeometry args={[0.004, 0.008, 0.12, 4]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <Leaf
            position={[x + 0.03, 0.08, i * 0.015]}
            rotation={[0, 0, -0.6]}
            scale={0.5}
            color={color}
            width={0.15}
            height={0.03}
          />
        </group>
      ))}
    </group>
  );
}

function WheatGrowing({ color }) {
  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => {
        const x = (i - 2) * 0.025;
        return (
          <group key={i}>
            <mesh position={[x, 0.18, (i % 2) * 0.02]}>
              <cylinderGeometry args={[0.005, 0.009, 0.36, 4]} />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            <Leaf
              position={[x + 0.05, 0.2, (i % 2) * 0.02]}
              rotation={[0.1, 0, -0.5 - i * 0.1]}
              scale={0.7}
              color={color}
              width={0.2}
              height={0.03}
            />
          </group>
        );
      })}
    </group>
  );
}

function WheatMature({ color, matureColor, isRipening }) {
  const earColor = isRipening ? matureColor : '#c5e17a';
  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => {
        const x = (i - 2) * 0.022;
        return (
          <group key={i}>
            {/* Tall stem */}
            <mesh position={[x, 0.26, (i % 2) * 0.015]}>
              <cylinderGeometry args={[0.005, 0.01, 0.52, 4]} />
              <meshStandardMaterial color={isRipening ? '#b8a33d' : color} roughness={0.5} />
            </mesh>
            {/* Wheat ear/head — upright, not drooping like rice */}
            <mesh position={[x, 0.52, (i % 2) * 0.015]}>
              <cylinderGeometry args={[0.02, 0.012, 0.08, 6]} />
              <meshStandardMaterial color={earColor} roughness={0.4} />
            </mesh>
            {/* Awns (whiskers) */}
            {[-0.02, 0, 0.02].map((awn, j) => (
              <mesh key={j} position={[x + awn * 0.5, 0.55, (i % 2) * 0.015 + awn * 0.3]} rotation={[0.3, 0, awn * 2]}>
                <cylinderGeometry args={[0.001, 0.001, 0.04, 3]} />
                <meshStandardMaterial color={earColor} roughness={0.6} />
              </mesh>
            ))}
            <Leaf
              position={[x + 0.06, 0.28, (i % 2) * 0.015]}
              rotation={[0.1, 0, -0.5]}
              scale={0.8}
              color={isRipening ? '#b8a33d' : color}
              width={0.22}
              height={0.03}
            />
          </group>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CORN — Broad flat leaves → tall stalk → cob + tassel
   ═══════════════════════════════════════════════════════════════ */
function CornSeedling({ color }) {
  return (
    <group>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.14, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Broad first leaves */}
      <Leaf position={[0.05, 0.1, 0]} rotation={[0, 0, -0.5]} scale={0.8} color={color} width={0.2} height={0.08} />
      <Leaf position={[-0.04, 0.08, 0.02]} rotation={[0.2, 0, 0.6]} scale={0.7} color={color} width={0.18} height={0.07} />
    </group>
  );
}

function CornGrowing({ color }) {
  return (
    <group>
      {/* Thick stalk */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.015, 0.025, 0.44, 6]} />
        <meshStandardMaterial color={'#558b2f'} roughness={0.5} />
      </mesh>
      {/* Broad arching leaves at nodes */}
      {[0.12, 0.22, 0.32].map((h, i) => (
        <React.Fragment key={i}>
          <Leaf
            position={[0.08, h, 0]}
            rotation={[0, i * 0.8, -0.6 - i * 0.1]}
            scale={1.0 + i * 0.1}
            color={color}
            width={0.35}
            height={0.08}
          />
          <Leaf
            position={[-0.07, h - 0.03, 0.02]}
            rotation={[0.2, -i * 0.6, 0.5 + i * 0.1]}
            scale={0.9 + i * 0.1}
            color={color}
            width={0.3}
            height={0.07}
          />
        </React.Fragment>
      ))}
    </group>
  );
}

function CornMature({ color, matureColor, isRipening }) {
  return (
    <group>
      {/* Tall thick stalk */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.02, 0.035, 0.64, 8]} />
        <meshStandardMaterial color={'#558b2f'} roughness={0.5} />
      </mesh>
      {/* Corn cob hanging off side */}
      <group position={[0.08, 0.38, 0]} rotation={[0, 0, -0.4]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.035, 0.14, 8]} />
          <meshStandardMaterial color={matureColor} roughness={0.5} />
        </mesh>
        {/* Husk leaves wrapping cob */}
        <Leaf position={[0, 0.06, 0.03]} rotation={[0.3, 0, 0]} scale={0.6} color={'#7cb342'} width={0.12} height={0.06} />
        <Leaf position={[0, 0.06, -0.03]} rotation={[-0.3, 0, 0]} scale={0.6} color={'#7cb342'} width={0.12} height={0.06} />
        {/* Silk threads */}
        {isRipening && (
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.02, 0.001, 0.05, 6]} />
            <meshStandardMaterial color={'#8d6e63'} roughness={0.8} />
          </mesh>
        )}
      </group>
      {/* Tassel at top */}
      <group position={[0, 0.64, 0]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[0, 0, 0]} rotation={[0.3, (i / 5) * Math.PI * 2, 0.5]}>
            <cylinderGeometry args={[0.003, 0.001, 0.08, 3]} />
            <meshStandardMaterial color={'#c5a028'} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* Broad leaves */}
      {[0.15, 0.3, 0.45].map((h, i) => (
        <React.Fragment key={i}>
          <Leaf
            position={[0.1, h, 0]}
            rotation={[0, i * 0.8, -0.7]}
            scale={1.1}
            color={color}
            width={0.4}
            height={0.08}
          />
          <Leaf
            position={[-0.09, h - 0.05, 0.02]}
            rotation={[0.2, -i * 0.6, 0.6]}
            scale={1.0}
            color={color}
            width={0.35}
            height={0.07}
          />
        </React.Fragment>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOMATO — Seedling → bush with stakes → red fruits hanging
   ═══════════════════════════════════════════════════════════════ */
function TomatoSeedling({ color }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.006, 0.01, 0.12, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <Leaf position={[0.03, 0.1, 0]} rotation={[0, 0, -0.4]} scale={0.6} color={color} width={0.12} height={0.08} />
      <Leaf position={[-0.03, 0.08, 0.01]} rotation={[0.1, 0, 0.4]} scale={0.5} color={color} width={0.1} height={0.07} />
    </group>
  );
}

function TomatoGrowing({ color }) {
  return (
    <group>
      {/* Main stem */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 0.32, 6]} />
        <meshStandardMaterial color={'#33691e'} roughness={0.6} />
      </mesh>
      {/* Stake/support */}
      <mesh position={[0.03, 0.2, 0.03]}>
        <cylinderGeometry args={[0.008, 0.008, 0.45, 4]} />
        <meshStandardMaterial color={'#8d6e63'} roughness={0.9} />
      </mesh>
      {/* Bushy compound leaves */}
      {[0.1, 0.18, 0.26].map((h, i) => (
        <React.Fragment key={i}>
          <Leaf position={[0.06, h, 0.02]} rotation={[0.2, i * 0.5, -0.5]} scale={0.9} color={color} width={0.2} height={0.1} />
          <Leaf position={[-0.05, h + 0.02, -0.01]} rotation={[-0.1, -i * 0.4, 0.5]} scale={0.8} color={color} width={0.18} height={0.09} />
        </React.Fragment>
      ))}
    </group>
  );
}

function TomatoMature({ color, matureColor, isRipening }) {
  const fruitColor = isRipening ? matureColor : '#66bb6a';
  return (
    <group>
      {/* Thick vine stem */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.012, 0.02, 0.44, 6]} />
        <meshStandardMaterial color={'#33691e'} roughness={0.6} />
      </mesh>
      {/* Wooden stake */}
      <mesh position={[0.04, 0.25, 0.04]}>
        <cylinderGeometry args={[0.008, 0.008, 0.55, 4]} />
        <meshStandardMaterial color={'#795548'} roughness={0.9} />
      </mesh>
      {/* Tomato fruits hanging */}
      <mesh position={[0.07, 0.35, 0.03]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={fruitColor} roughness={0.3} />
      </mesh>
      <mesh position={[-0.05, 0.3, -0.02]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={fruitColor} roughness={0.3} />
      </mesh>
      <mesh position={[0.03, 0.4, -0.04]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={isRipening ? '#ff7043' : '#81c784'} roughness={0.3} />
      </mesh>
      {/* Yellow flowers */}
      {!isRipening && (
        <mesh position={[0.06, 0.42, 0.02]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={'#ffeb3b'} emissive={'#ffeb3b'} emissiveIntensity={0.3} />
        </mesh>
      )}
      {/* Dense foliage */}
      {[0.12, 0.24, 0.36].map((h, i) => (
        <React.Fragment key={i}>
          <Leaf position={[0.08, h, 0.02]} rotation={[0.2, i * 0.6, -0.5]} scale={1.0} color={color} width={0.22} height={0.12} />
          <Leaf position={[-0.07, h + 0.03, -0.01]} rotation={[-0.1, -i * 0.4, 0.5]} scale={0.9} color={color} width={0.2} height={0.1} />
        </React.Fragment>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COTTON — Small seedling → branching bush → white fluffy bolls
   ═══════════════════════════════════════════════════════════════ */
function CottonSeedling({ color }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.006, 0.01, 0.12, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <Leaf position={[0.03, 0.1, 0]} rotation={[0, 0, -0.5]} scale={0.6} color={color} width={0.1} height={0.08} />
      <Leaf position={[-0.03, 0.08, 0.01]} rotation={[0.1, 0, 0.5]} scale={0.5} color={color} width={0.09} height={0.07} />
    </group>
  );
}

function CottonGrowing({ color }) {
  return (
    <group>
      {/* Main stem */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.36, 6]} />
        <meshStandardMaterial color={'#5d4037'} roughness={0.7} />
      </mesh>
      {/* Side branches */}
      {[0.12, 0.2, 0.28].map((h, i) => (
        <React.Fragment key={i}>
          <mesh position={[0.05, h, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.005, 0.008, 0.1, 4]} />
            <meshStandardMaterial color={'#6d4c41'} roughness={0.7} />
          </mesh>
          <Leaf position={[0.1, h + 0.02, 0]} rotation={[0, i * 0.6, -0.3]} scale={0.9} color={color} width={0.15} height={0.1} />
          <mesh position={[-0.04, h + 0.02, 0.02]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.005, 0.008, 0.08, 4]} />
            <meshStandardMaterial color={'#6d4c41'} roughness={0.7} />
          </mesh>
          <Leaf position={[-0.08, h + 0.04, 0.02]} rotation={[0.1, -i * 0.5, 0.3]} scale={0.8} color={color} width={0.13} height={0.09} />
        </React.Fragment>
      ))}
    </group>
  );
}

function CottonMature({ color, matureColor, isRipening }) {
  return (
    <group>
      {/* Woody main stem */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.015, 0.022, 0.48, 6]} />
        <meshStandardMaterial color={'#5d4037'} roughness={0.7} />
      </mesh>
      {/* Branches with cotton bolls */}
      {[0.18, 0.28, 0.38].map((h, i) => (
        <React.Fragment key={i}>
          <mesh position={[0.06, h, 0]} rotation={[0, i * 0.7, -0.4]}>
            <cylinderGeometry args={[0.005, 0.008, 0.12, 4]} />
            <meshStandardMaterial color={'#6d4c41'} roughness={0.7} />
          </mesh>
          {/* White cotton boll (fluffy sphere) */}
          {isRipening ? (
            <mesh position={[0.12, h + 0.02, 0.01]}>
              <dodecahedronGeometry args={[0.04, 1]} />
              <meshStandardMaterial color={matureColor} roughness={0.2} metalness={0.0} />
            </mesh>
          ) : (
            <mesh position={[0.11, h + 0.02, 0.01]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial color={'#7cb342'} roughness={0.5} />
            </mesh>
          )}
          <Leaf position={[0.08, h + 0.05, 0.02]} rotation={[0, i * 0.6, -0.3]} scale={0.7} color={color} width={0.12} height={0.08} />
        </React.Fragment>
      ))}
      {/* Opposite side branches + bolls */}
      {[0.22, 0.34].map((h, i) => (
        <React.Fragment key={`r-${i}`}>
          <mesh position={[-0.05, h, 0.02]} rotation={[0.1, -i * 0.5, 0.4]}>
            <cylinderGeometry args={[0.005, 0.008, 0.1, 4]} />
            <meshStandardMaterial color={'#6d4c41'} roughness={0.7} />
          </mesh>
          {isRipening ? (
            <mesh position={[-0.1, h + 0.02, 0.03]}>
              <dodecahedronGeometry args={[0.035, 1]} />
              <meshStandardMaterial color={matureColor} roughness={0.2} />
            </mesh>
          ) : (
            <mesh position={[-0.09, h + 0.02, 0.03]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshStandardMaterial color={'#7cb342'} roughness={0.5} />
            </mesh>
          )}
        </React.Fragment>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POTATO — Low bushy foliage → flowers → wilting vines (tubers below)
   ═══════════════════════════════════════════════════════════════ */
function PotatoSeedling({ color }) {
  return (
    <group>
      {/* Emerging shoots from soil mound */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.08, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <Leaf position={[0.03, 0.06, 0]} rotation={[0, 0, -0.4]} scale={0.5} color={color} width={0.1} height={0.06} />
      {/* Soil mound */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.06, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={'#795548'} roughness={0.95} />
      </mesh>
    </group>
  );
}

function PotatoGrowing({ color }) {
  return (
    <group>
      {/* Soil mound (hilled up) */}
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={'#6d4c41'} roughness={0.95} />
      </mesh>
      {/* Multiple stems from mound */}
      {[-0.03, 0.02, 0.04].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.12, i * 0.015 - 0.01]}>
            <cylinderGeometry args={[0.008, 0.012, 0.2, 4]} />
            <meshStandardMaterial color={'#33691e'} roughness={0.6} />
          </mesh>
          <Leaf position={[x + 0.05, 0.16, i * 0.015]} rotation={[0.1, i * 0.5, -0.4]} scale={0.8} color={color} width={0.14} height={0.08} />
          <Leaf position={[x - 0.04, 0.14, i * 0.015 + 0.01]} rotation={[-0.1, -i * 0.4, 0.4]} scale={0.7} color={color} width={0.12} height={0.07} />
        </group>
      ))}
    </group>
  );
}

function PotatoMature({ color, matureColor, isRipening }) {
  return (
    <group>
      {/* Soil mound */}
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={matureColor} roughness={0.95} />
      </mesh>
      {/* Bushy stems and foliage */}
      {isRipening ? (
        // Wilted/killed vines
        <>
          {[-0.03, 0.02].map((x, i) => (
            <group key={i}>
              <mesh position={[x, 0.08, i * 0.02]}>
                <cylinderGeometry args={[0.006, 0.01, 0.12, 4]} />
                <meshStandardMaterial color={'#8d6e63'} roughness={0.8} />
              </mesh>
              <Leaf position={[x + 0.04, 0.1, i * 0.02]} rotation={[0.5, 0, -0.8]} scale={0.5} color={'#a1887f'} width={0.1} height={0.06} />
            </group>
          ))}
          {/* Visible tubers peeking from soil */}
          <mesh position={[0.05, 0.02, 0.04]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color={'#c9a96e'} roughness={0.8} />
          </mesh>
          <mesh position={[-0.04, 0.02, -0.03]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial color={'#c9a96e'} roughness={0.8} />
          </mesh>
        </>
      ) : (
        // Flowering stage
        <>
          {[-0.03, 0.02, 0.04].map((x, i) => (
            <group key={i}>
              <mesh position={[x, 0.14, i * 0.015 - 0.01]}>
                <cylinderGeometry args={[0.008, 0.012, 0.24, 4]} />
                <meshStandardMaterial color={'#33691e'} roughness={0.6} />
              </mesh>
              <Leaf position={[x + 0.06, 0.18, i * 0.015]} rotation={[0.1, i * 0.5, -0.4]} scale={0.9} color={color} width={0.16} height={0.09} />
              <Leaf position={[x - 0.05, 0.16, i * 0.015 + 0.01]} rotation={[-0.1, -i * 0.4, 0.4]} scale={0.8} color={color} width={0.14} height={0.08} />
            </group>
          ))}
          {/* Purple/white flowers */}
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshStandardMaterial color={'#ce93d8'} emissive={'#ce93d8'} emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.04, 0.24, 0.02]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshStandardMaterial color={'#e1bee7'} emissive={'#e1bee7'} emissiveIntensity={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC STAGES (for ploughing/sowing before crop-specific)
   ═══════════════════════════════════════════════════════════════ */
function SeedModel() {
  return (
    <group>
      {/* Seeds scattered on soil */}
      {[[0, 0], [0.04, 0.03], [-0.03, -0.02], [0.02, -0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.015, z]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color={'#8d6e63'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Main Crop3D Component ─────────────────────────────────── */
export default function Crop3D({ cropId, growthStage, growthProgress, isHarvestable }) {
  const groupRef = useRef();
  const crop = getCropById(cropId);
  if (!crop) return null;

  const { color, matureColor } = crop;

  const isRipening = growthStage === GROWTH_STAGES.RIPENING || growthStage === GROWTH_STAGES.HARVESTABLE;

  // Scale based on growth stage
  const targetScale = useMemo(() => {
    switch (growthStage) {
      case GROWTH_STAGES.PLOUGHING: return 0;
      case GROWTH_STAGES.SOWING: return 0.5;
      case GROWTH_STAGES.SEEDLING: return 0.7;
      case GROWTH_STAGES.GROWING: return 0.9;
      case GROWTH_STAGES.FLOWERING: return 1.0;
      case GROWTH_STAGES.RIPENING: return 1.1;
      case GROWTH_STAGES.HARVESTABLE: return 1.15;
      default: return 0;
    }
  }, [growthStage]);

  // Animate
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * Math.min(delta * 3, 1);
    groupRef.current.scale.setScalar(newScale);

    if (isHarvestable) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.02;
    }
  });

  // Determine which model to show based on crop type + stage
  const renderCropModel = () => {
    // During ploughing, show nothing (soil only)
    if (growthStage === GROWTH_STAGES.PLOUGHING) return null;

    // During sowing, show seeds
    if (growthStage === GROWTH_STAGES.SOWING) return <SeedModel />;

    // Crop-specific models by stage
    switch (cropId) {
      case 'rice':
        if (growthStage === GROWTH_STAGES.SEEDLING) return <RiceSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <RiceGrowing color={color} />;
        return <RiceMature color={color} matureColor={matureColor} isRipening={isRipening} />;

      case 'wheat':
        if (growthStage === GROWTH_STAGES.SEEDLING) return <WheatSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <WheatGrowing color={color} />;
        return <WheatMature color={color} matureColor={matureColor} isRipening={isRipening} />;

      case 'corn':
        if (growthStage === GROWTH_STAGES.SEEDLING) return <CornSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <CornGrowing color={color} />;
        return <CornMature color={color} matureColor={matureColor} isRipening={isRipening} />;

      case 'tomato':
        if (growthStage === GROWTH_STAGES.SEEDLING) return <TomatoSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <TomatoGrowing color={color} />;
        return <TomatoMature color={color} matureColor={matureColor} isRipening={isRipening} />;

      case 'cotton':
        if (growthStage === GROWTH_STAGES.SEEDLING) return <CottonSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <CottonGrowing color={color} />;
        return <CottonMature color={color} matureColor={matureColor} isRipening={isRipening} />;

      case 'potato':
        if (growthStage === GROWTH_STAGES.SEEDLING) return <PotatoSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <PotatoGrowing color={color} />;
        return <PotatoMature color={color} matureColor={matureColor} isRipening={isRipening} />;

      default:
        if (growthStage === GROWTH_STAGES.SEEDLING) return <WheatSeedling color={color} />;
        if (growthStage === GROWTH_STAGES.GROWING) return <WheatGrowing color={color} />;
        return <WheatMature color={color} matureColor={matureColor} isRipening={isRipening} />;
    }
  };

  return (
    <group ref={groupRef} scale={targetScale}>
      {renderCropModel()}

      {/* Harvest-ready glow ring */}
      {isHarvestable && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshStandardMaterial
            color="#ffd54f"
            emissive="#ffd54f"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
