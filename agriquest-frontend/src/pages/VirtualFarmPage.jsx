import React, { useState, useEffect } from 'react';
import { simulationAPI } from '../api';
import { useAuth } from '../context/AuthContext';

/* ─── Crop Dataset (from data_core.csv) — 10 conditions per crop ─── */
const CROP_DATASET = {
  PADDY: [
    { temp: 28, humidity: 54, moisture: 46, soil: 'Clayey',  nitrogen: 35, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 34, humidity: 65, moisture: 38, soil: 'Clayey',  nitrogen: 39, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 37, humidity: 70, moisture: 37, soil: 'Clayey',  nitrogen: 12, potassium: 0,  phosphorous: 41, fertilizer: 'DAP' },
    { temp: 29, humidity: 58, moisture: 42, soil: 'Clayey',  nitrogen: 9,  potassium: 10, phosphorous: 22, fertilizer: '14-35-14' },
    { temp: 32, humidity: 62, moisture: 41, soil: 'Clayey',  nitrogen: 24, potassium: 0,  phosphorous: 22, fertilizer: '28-28' },
    { temp: 24, humidity: 67, moisture: 48, soil: 'Red',     nitrogen: 8,  potassium: 9,  phosphorous: 18, fertilizer: '20-20' },
    { temp: 31, humidity: 61, moisture: 31, soil: 'Black',   nitrogen: 12, potassium: 0,  phosphorous: 36, fertilizer: 'Urea' },
    { temp: 30, humidity: 64, moisture: 39, soil: 'Loamy',   nitrogen: 19, potassium: 4,  phosphorous: 28, fertilizer: 'DAP' },
    { temp: 27, humidity: 59, moisture: 31, soil: 'Loamy',   nitrogen: 8,  potassium: 5,  phosphorous: 34, fertilizer: 'DAP' },
    { temp: 36, humidity: 72, moisture: 33, soil: 'Sandy',   nitrogen: 9,  potassium: 0,  phosphorous: 37, fertilizer: 'Urea' },
  ],
  WHEAT: [
    { temp: 33, humidity: 64, moisture: 50, soil: 'Loamy',   nitrogen: 41, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 29, humidity: 58, moisture: 52, soil: 'Loamy',   nitrogen: 13, potassium: 0,  phosphorous: 36, fertilizer: 'DAP' },
    { temp: 38, humidity: 70, moisture: 48, soil: 'Loamy',   nitrogen: 8,  potassium: 8,  phosphorous: 28, fertilizer: '14-35-14' },
    { temp: 34, humidity: 65, moisture: 54, soil: 'Loamy',   nitrogen: 38, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 27, humidity: 53, moisture: 43, soil: 'Black',   nitrogen: 28, potassium: 0,  phosphorous: 22, fertilizer: 'Urea' },
    { temp: 31, humidity: 52, moisture: 54, soil: 'Red',     nitrogen: 15, potassium: 4,  phosphorous: 33, fertilizer: '14-35-14' },
    { temp: 29, humidity: 64, moisture: 55, soil: 'Red',     nitrogen: 7,  potassium: 11, phosphorous: 31, fertilizer: '14-35-14' },
    { temp: 36, humidity: 68, moisture: 50, soil: 'Loamy',   nitrogen: 12, potassium: 18, phosphorous: 19, fertilizer: '10-26-26' },
    { temp: 33, humidity: 60, moisture: 48, soil: 'Clayey',  nitrogen: 21, potassium: 3,  phosphorous: 20, fertilizer: '20-20' },
    { temp: 30, humidity: 58, moisture: 39, soil: 'Sandy',   nitrogen: 9,  potassium: 4,  phosphorous: 18, fertilizer: '28-28' },
  ],
  COTTON: [
    { temp: 34, humidity: 65, moisture: 62, soil: 'Black',   nitrogen: 7,  potassium: 9,  phosphorous: 30, fertilizer: '14-35-14' },
    { temp: 25, humidity: 50, moisture: 64, soil: 'Red',     nitrogen: 9,  potassium: 0,  phosphorous: 10, fertilizer: '20-20' },
    { temp: 25, humidity: 50, moisture: 65, soil: 'Loamy',   nitrogen: 36, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 28, humidity: 54, moisture: 65, soil: 'Black',   nitrogen: 39, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 30, humidity: 60, moisture: 61, soil: 'Loamy',   nitrogen: 8,  potassium: 10, phosphorous: 31, fertilizer: '14-35-14' },
    { temp: 31, humidity: 62, moisture: 63, soil: 'Red',     nitrogen: 11, potassium: 12, phosphorous: 15, fertilizer: '17-17-17' },
    { temp: 36, humidity: 68, moisture: 62, soil: 'Red',     nitrogen: 15, potassium: 0,  phosphorous: 40, fertilizer: 'DAP' },
    { temp: 34, humidity: 65, moisture: 64, soil: 'Black',   nitrogen: 24, potassium: 0,  phosphorous: 20, fertilizer: '28-28' },
    { temp: 34, humidity: 65, moisture: 63, soil: 'Red',     nitrogen: 14, potassium: 0,  phosphorous: 38, fertilizer: 'DAP' },
    { temp: 40, humidity: 80, moisture: 60, soil: 'Clayey',  nitrogen: 42, potassium: 0,  phosphorous: 0,  fertilizer: '10-26-26' },
  ],
  MAIZE: [
    { temp: 26, humidity: 52, moisture: 38, soil: 'Sandy',   nitrogen: 37, potassium: 0,  phosphorous: 0,  fertilizer: 'Urea' },
    { temp: 31, humidity: 62, moisture: 48, soil: 'Sandy',   nitrogen: 14, potassium: 15, phosphorous: 12, fertilizer: '17-17-17' },
    { temp: 26, humidity: 52, moisture: 44, soil: 'Sandy',   nitrogen: 23, potassium: 0,  phosphorous: 20, fertilizer: '28-28' },
    { temp: 30, humidity: 60, moisture: 47, soil: 'Sandy',   nitrogen: 22, potassium: 0,  phosphorous: 21, fertilizer: '28-28' },
    { temp: 28, humidity: 54, moisture: 25, soil: 'Sandy',   nitrogen: 9,  potassium: 10, phosphorous: 30, fertilizer: '14-35-14' },
    { temp: 33, humidity: 64, moisture: 51, soil: 'Sandy',   nitrogen: 5,  potassium: 9,  phosphorous: 29, fertilizer: '14-35-14' },
    { temp: 31, humidity: 69, moisture: 49, soil: 'Loamy',   nitrogen: 19, potassium: 0,  phosphorous: 19, fertilizer: '20-20' },
    { temp: 36, humidity: 66, moisture: 44, soil: 'Loamy',   nitrogen: 5,  potassium: 10, phosphorous: 32, fertilizer: '10-26-26' },
    { temp: 38, humidity: 64, moisture: 63, soil: 'Clayey',  nitrogen: 11, potassium: 11, phosphorous: 16, fertilizer: '28-28' },
    { temp: 22, humidity: 59, moisture: 45, soil: 'Black',   nitrogen: 38, potassium: 0,  phosphorous: 4,  fertilizer: '14-35-14' },
  ],
};

/* ─── Crop Definitions ──────────────────────────────────────── */
const CROPS = [
  { id: 'PADDY',  icon: '🌾', name: 'Paddy',  desc: 'Water-intensive, tropical crop. 120-day cycle.',  color: '#4caf50' },
  { id: 'WHEAT',  icon: '🌿', name: 'Wheat',  desc: 'Winter staple, moderate water. 100-day cycle.',   color: '#ffc107' },
  { id: 'COTTON', icon: '☁️', name: 'Cotton', desc: 'Cash crop for black soil. 180-day cycle.',        color: '#e0e0e0' },
  { id: 'MAIZE',  icon: '🌽', name: 'Maize',  desc: 'Versatile grain crop, high yield. 90-day cycle.', color: '#ff9800' },
];

const STAGE_META = {
  SOIL_PREPARATION: { icon: '🪱', label: 'Soil Preparation', choices: [
    { key: 'DEEP_PLOUGHING',    label: 'Deep Ploughing',     icon: '⛏️', desc: 'Break compaction, aerate deep layers' },
    { key: 'SHALLOW_PLOUGHING', label: 'Shallow Ploughing',  icon: '🔧', desc: 'Quick but limited root depth' },
    { key: 'NO_PLOUGHING',      label: 'Skip (No Ploughing)',icon: '❌', desc: 'Not recommended — causes compaction' },
  ]},
  SOWING: { icon: '🌱', label: 'Sowing Method', choices: [
    { key: 'SEED_TREATMENT', label: 'Treated Seeds',  icon: '💊', desc: 'Fungicide/biofertilizer coated seeds' },
    { key: 'DIRECT_SOWING',  label: 'Direct Sowing',  icon: '🫘', desc: 'Standard untreated seeds' },
    { key: 'LATE_SOWING',    label: 'Late Sowing',    icon: '⏰', desc: 'Past optimal window — risky' },
  ]},
  IRRIGATION: { icon: '💧', label: 'Irrigation Method', choices: [
    { key: 'DRIP',      label: 'Drip Irrigation',  icon: '💧', desc: 'Saves 60% water — most sustainable' },
    { key: 'SPRINKLER', label: 'Sprinkler',         icon: '🚿', desc: 'Moderate water use, good coverage' },
    { key: 'FLOOD',     label: 'Flood Irrigation',  icon: '🌊', desc: 'Traditional but wastes water' },
    { key: 'NONE',      label: 'No Irrigation',     icon: '🏜️', desc: 'Rain-fed only — high risk' },
  ]},
  FERTILIZATION: { icon: '🧪', label: 'Fertilization', choices: [
    { key: 'ORGANIC_COMPOST', label: 'Organic Compost', icon: '♻️', desc: 'Best for soil health long-term' },
    { key: 'BALANCED_NPK',   label: 'Balanced NPK',    icon: '⚗️', desc: 'Chemical fertilizer — effective' },
    { key: 'EXCESS_UREA',    label: 'Heavy Urea',      icon: '⚠️', desc: 'Overuse damages soil and water' },
    { key: 'NO_FERTILIZER',  label: 'No Fertilizer',   icon: '🚫', desc: 'Depletes soil over time' },
  ]},
  PEST_MANAGEMENT: { icon: '🐛', label: 'Pest Management', choices: [
    { key: 'IPM',                label: 'Integrated Pest Mgmt', icon: '🌿', desc: 'Gold standard — biological + minimal chemicals' },
    { key: 'BIOLOGICAL_CONTROL', label: 'Biological Control',   icon: '🐞', desc: 'Natural predators — eco-friendly' },
    { key: 'CHEMICAL_SPRAY',     label: 'Chemical Spray',       icon: '🧴', desc: 'Quick fix but harms ecosystem' },
    { key: 'NO_ACTION',          label: 'Ignore Pests',         icon: '😶', desc: 'Dangerous — crops may be destroyed' },
  ]},
  GROWTH_MONITORING: { icon: '📊', label: 'Growth Monitoring', choices: [
    { key: 'REGULAR_SCOUTING',  label: 'Weekly Scouting',   icon: '🔍', desc: 'Catch problems early' },
    { key: 'OCCASIONAL_CHECK',  label: 'Occasional Check',  icon: '👁️', desc: 'Misses early warning signs' },
    { key: 'NO_MONITORING',     label: 'No Monitoring',     icon: '🙈', desc: 'Farming blind — high risk' },
  ]},
  HARVEST: { icon: '🌾', label: 'Harvest Timing', choices: [
    { key: 'OPTIMAL_TIMING', label: 'Optimal Timing', icon: '✅', desc: 'Peak maturity — maximum yield' },
    { key: 'EARLY_HARVEST',  label: 'Early Harvest',  icon: '⏩', desc: 'Reduced yield and quality' },
    { key: 'LATE_HARVEST',   label: 'Late Harvest',   icon: '⏰', desc: 'Post-harvest losses increase' },
  ]},
};

const STAGE_ORDER = ['SOIL_PREPARATION','SOWING','IRRIGATION','FERTILIZATION','PEST_MANAGEMENT','GROWTH_MONITORING','HARVEST'];

const STAGE_TILE_ICONS = {
  SOIL_PREPARATION:  ['🟫','🪱','⛏️'],
  SOWING:            ['🌱','🫘','💊'],
  IRRIGATION:        ['💧','🌱','🌿'],
  FERTILIZATION:     ['🌿','🧪','♻️'],
  PEST_MANAGEMENT:   ['🌿','🐛','🐞'],
  GROWTH_MONITORING: ['🌾','📊','🔍'],
  HARVEST:           ['🌾','✅','🏆'],
};

/* ─── Soil color mapping ────────────────────────────────────── */
const SOIL_COLORS = {
  'Sandy':  '#c2956a',
  'Loamy':  '#8b6d4a',
  'Clayey': '#7a5c3e',
  'Black':  '#3a3a3a',
  'Red':    '#a0522d',
};

/* ─── Crop Data Modal ───────────────────────────────────────── */
function CropDataModal({ crop, onClose, onStart }) {
  const data = CROP_DATASET[crop.id];
  if (!data) return null;

  // Compute averages
  const avg = {
    temp:        (data.reduce((s, d) => s + d.temp, 0) / data.length).toFixed(1),
    humidity:    (data.reduce((s, d) => s + d.humidity, 0) / data.length).toFixed(1),
    moisture:    (data.reduce((s, d) => s + d.moisture, 0) / data.length).toFixed(1),
    nitrogen:    (data.reduce((s, d) => s + d.nitrogen, 0) / data.length).toFixed(1),
    potassium:   (data.reduce((s, d) => s + d.potassium, 0) / data.length).toFixed(1),
    phosphorous: (data.reduce((s, d) => s + d.phosphorous, 0) / data.length).toFixed(1),
  };

  // Unique soils and fertilizers
  const soils = [...new Set(data.map(d => d.soil))];
  const fertilizers = [...new Set(data.map(d => d.fertilizer))];

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div className="crop-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="crop-modal__header">
          <div className="crop-modal__header-left">
            <span className="crop-modal__icon">{crop.icon}</span>
            <div>
              <h2 className="crop-modal__title">{crop.name} — Growth Data</h2>
              <p className="crop-modal__subtitle">10 environmental conditions from field dataset</p>
            </div>
          </div>
          <button className="crop-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Summary Stats */}
        <div className="crop-modal__stats">
          <div className="crop-modal__stat">
            <div className="crop-modal__stat-icon">🌡️</div>
            <div className="crop-modal__stat-value">{avg.temp}°C</div>
            <div className="crop-modal__stat-label">Avg Temp</div>
          </div>
          <div className="crop-modal__stat">
            <div className="crop-modal__stat-icon">💧</div>
            <div className="crop-modal__stat-value">{avg.humidity}%</div>
            <div className="crop-modal__stat-label">Avg Humidity</div>
          </div>
          <div className="crop-modal__stat">
            <div className="crop-modal__stat-icon">🌊</div>
            <div className="crop-modal__stat-value">{avg.moisture}%</div>
            <div className="crop-modal__stat-label">Avg Moisture</div>
          </div>
          <div className="crop-modal__stat">
            <div className="crop-modal__stat-icon">🧪</div>
            <div className="crop-modal__stat-value">N:{avg.nitrogen}</div>
            <div className="crop-modal__stat-label">Avg Nitrogen</div>
          </div>
          <div className="crop-modal__stat">
            <div className="crop-modal__stat-icon">⚗️</div>
            <div className="crop-modal__stat-value">K:{avg.potassium}</div>
            <div className="crop-modal__stat-label">Avg Potassium</div>
          </div>
          <div className="crop-modal__stat">
            <div className="crop-modal__stat-icon">🔬</div>
            <div className="crop-modal__stat-value">P:{avg.phosphorous}</div>
            <div className="crop-modal__stat-label">Avg Phosphorous</div>
          </div>
        </div>

        {/* Badges: soils & fertilizers */}
        <div className="crop-modal__tags">
          <div className="crop-modal__tag-group">
            <span className="crop-modal__tag-title">Soil Types</span>
            <div className="crop-modal__tag-list">
              {soils.map(s => (
                <span key={s} className="crop-modal__tag" style={{ borderColor: SOIL_COLORS[s] || '#666', color: SOIL_COLORS[s] || '#ccc' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="crop-modal__tag-group">
            <span className="crop-modal__tag-title">Recommended Fertilizers</span>
            <div className="crop-modal__tag-list">
              {fertilizers.map(f => (
                <span key={f} className="crop-modal__tag crop-modal__tag--fert">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Data table */}
        <div className="crop-modal__table-wrap">
          <table className="crop-modal__table">
            <thead>
              <tr>
                <th>#</th>
                <th>🌡️ Temp</th>
                <th>💧 Humid</th>
                <th>🌊 Moist</th>
                <th>🏔️ Soil</th>
                <th>N</th>
                <th>K</th>
                <th>P</th>
                <th>💊 Fertilizer</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="crop-modal__row-num">{i + 1}</td>
                  <td>
                    <span className="crop-modal__temp-bar">
                      <span className="crop-modal__temp-fill" style={{ width: `${((row.temp - 20) / 20) * 100}%` }} />
                    </span>
                    {row.temp}°C
                  </td>
                  <td>{row.humidity}%</td>
                  <td>{row.moisture}%</td>
                  <td>
                    <span className="crop-modal__soil-dot" style={{ background: SOIL_COLORS[row.soil] || '#666' }} />
                    {row.soil}
                  </td>
                  <td className="crop-modal__npk">{row.nitrogen}</td>
                  <td className="crop-modal__npk">{row.potassium}</td>
                  <td className="crop-modal__npk">{row.phosphorous}</td>
                  <td><span className="crop-modal__fert-badge">{row.fertilizer}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="crop-modal__footer">
          <button className="btn btn-primary btn-sm" onClick={onStart}>
            Got it — Start Simulation →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Farm Grid Canvas ──────────────────────────────────────── */
function FarmCanvas({ simulation }) {
  const gridSize = 6;
  const stageIdx = simulation ? STAGE_ORDER.indexOf(simulation.currentStage) : -1;
  const completed = simulation?.status === 'COMPLETED';
  const healthPct = simulation ? simulation.healthScore / 100 : 0;

  const getTileContent = (row, col) => {
    if (!simulation) {
      const empties = ['🟫', '🪨', '🟫', '🌫️', '🟫', '🟫'];
      return empties[(row + col) % empties.length];
    }
    if (completed) {
      if (healthPct >= 0.7) return ['🌾','🌻','🥇','🌽','🍚','✨'][(row + col) % 6];
      if (healthPct >= 0.4) return ['🌾','🌿','🌱','🍂','🟫','⚠️'][(row + col) % 6];
      return ['🍂','💀','🟫','🪨','😢','🥀'][(row + col) % 6];
    }
    const icons = STAGE_TILE_ICONS[simulation.currentStage] || ['🟫'];
    const growChance = (stageIdx + 1) / STAGE_ORDER.length;
    const tileIdx = (row * gridSize + col);
    const seed = Math.sin(tileIdx * 45.37 + stageIdx * 12.89) * 0.5 + 0.5;
    if (seed < growChance) return icons[tileIdx % icons.length];
    return '🟫';
  };

  return (
    <div className="farm-canvas">
      <div className="farm-canvas__grid">
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          return (
            <div key={i} className="farm-tile" style={{ animationDelay: `${i * 30}ms` }}>
              <span className="farm-tile__emoji">{getTileContent(row, col)}</span>
            </div>
          );
        })}
      </div>
      <div className="farm-canvas__overlay">
        {!simulation && (
          <div className="farm-canvas__message">
            <span style={{ fontSize: '2.5rem' }}>🌱</span>
            <p>Select a crop to begin farming</p>
          </div>
        )}
        {simulation && !completed && (
          <div className="farm-canvas__stage-badge">
            {STAGE_META[simulation.currentStage]?.icon} {STAGE_META[simulation.currentStage]?.label}
          </div>
        )}
        {completed && (
          <div className="farm-canvas__message">
            <span style={{ fontSize: '3rem' }}>🏆</span>
            <p>Harvest Complete!</p>
          </div>
        )}
      </div>
      {simulation && simulation.currentStage === 'IRRIGATION' && (
        <div className="farm-canvas__particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="rain-drop" style={{
              left: `${(i * 8.3) % 100}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`,
            }}>💧</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Left Sidebar ──────────────────────────────────────────── */
function LeftSidebar({ crops, selectedCrop, onSelectCrop, simulation, stageMeta, selectedChoice, onSelectChoice, phase }) {
  const [activeTab, setActiveTab] = useState('crops');

  useEffect(() => {
    if (phase === 'SIMULATING') setActiveTab('tools');
    if (phase === 'SELECT_CROP') setActiveTab('crops');
  }, [phase]);

  return (
    <div className="farm-sidebar farm-sidebar--left">
      <div className="farm-sidebar__tabs">
        <button className={`farm-sidebar__tab${activeTab === 'crops' ? ' active' : ''}`} onClick={() => setActiveTab('crops')}>🌱 Crops</button>
        <button className={`farm-sidebar__tab${activeTab === 'tools' ? ' active' : ''}`} onClick={() => setActiveTab('tools')}>🛠️ Tools</button>
        <button className={`farm-sidebar__tab${activeTab === 'stages' ? ' active' : ''}`} onClick={() => setActiveTab('stages')}>📋 Stages</button>
      </div>
      <div className="farm-sidebar__search">
        <input type="text" placeholder={`Search ${activeTab}...`} className="farm-sidebar__search-input" readOnly />
      </div>

      {activeTab === 'crops' && (
        <div className="farm-sidebar__grid">
          {crops.map(c => (
            <div key={c.id} className={`farm-sidebar__item${selectedCrop === c.id ? ' selected' : ''}`} onClick={() => onSelectCrop(c.id)}>
              <div className="farm-sidebar__item-icon">{c.icon}</div>
              <div className="farm-sidebar__item-label">{c.name}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="farm-sidebar__grid">
          {simulation && stageMeta && simulation.status === 'IN_PROGRESS' ? (
            stageMeta.choices.map(c => (
              <div key={c.key} className={`farm-sidebar__item${selectedChoice === c.key ? ' selected' : ''}`} onClick={() => onSelectChoice(c.key)} title={c.desc}>
                <div className="farm-sidebar__item-icon">{c.icon}</div>
                <div className="farm-sidebar__item-label">{c.label}</div>
              </div>
            ))
          ) : (
            <div className="farm-sidebar__empty">
              <span>🔒</span>
              <p>Start a simulation to unlock tools</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stages' && (
        <div className="farm-sidebar__list">
          {STAGE_ORDER.map((s, i) => {
            const meta = STAGE_META[s];
            const currentIdx = simulation ? STAGE_ORDER.indexOf(simulation.currentStage) : -1;
            const isDone = simulation && i < currentIdx;
            const isActive = simulation && i === currentIdx;
            return (
              <div key={s} className={`farm-sidebar__stage-item${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}>
                <div className="farm-sidebar__stage-dot">{isDone ? '✓' : meta.icon}</div>
                <div className="farm-sidebar__stage-info">
                  <div className="farm-sidebar__stage-name">{meta.label}</div>
                  <div className="farm-sidebar__stage-status">{isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Right Panel ───────────────────────────────────────────── */
function RightPanel({ simulation, lastDecision, decisionHistory, onReset, phase }) {
  const crop = simulation ? CROPS.find(c => c.id === simulation.crop) : null;
  const currentStageIdx = simulation ? STAGE_ORDER.indexOf(simulation.currentStage) : -1;
  const progress = simulation
    ? simulation.status === 'COMPLETED' ? 100 : Math.round(((currentStageIdx) / STAGE_ORDER.length) * 100)
    : 0;

  return (
    <div className="farm-sidebar farm-sidebar--right">
      {crop ? (
        <div className="farm-right__crop-header">
          <div className="farm-right__crop-icon">{crop.icon}</div>
          <div>
            <div className="farm-right__crop-name">{crop.name}</div>
            <div className="farm-right__crop-type">{crop.desc}</div>
          </div>
        </div>
      ) : (
        <div className="farm-right__crop-header">
          <div className="farm-right__crop-icon">🌱</div>
          <div>
            <div className="farm-right__crop-name">No Crop Selected</div>
            <div className="farm-right__crop-type">Choose a crop from the left panel</div>
          </div>
        </div>
      )}

      {simulation && (
        <div className="farm-right__section">
          <div className="farm-right__section-title">Scores</div>
          <div className="farm-right__scores">
            <div className="farm-right__score-card farm-right__score-card--health">
              <div className="farm-right__score-icon">💚</div>
              <div className="farm-right__score-data">
                <div className="farm-right__score-value">{simulation.healthScore}</div>
                <div className="farm-right__score-label">Health</div>
              </div>
              <div className="farm-right__score-bar">
                <div className="farm-right__score-bar-fill farm-right__score-bar-fill--health" style={{ width: `${simulation.healthScore}%` }} />
              </div>
            </div>
            <div className="farm-right__score-card farm-right__score-card--sustain">
              <div className="farm-right__score-icon">🌍</div>
              <div className="farm-right__score-data">
                <div className="farm-right__score-value">{simulation.sustainabilityScore}</div>
                <div className="farm-right__score-label">Sustainability</div>
              </div>
              <div className="farm-right__score-bar">
                <div className="farm-right__score-bar-fill farm-right__score-bar-fill--sustain" style={{ width: `${simulation.sustainabilityScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {simulation && (
        <div className="farm-right__section">
          <div className="farm-right__section-title">Growth Progress</div>
          <div className="farm-right__progress">
            <div className="farm-right__progress-header">
              <span>Stage {Math.min(currentStageIdx + 1, STAGE_ORDER.length)} of {STAGE_ORDER.length}</span>
              <span className="text-green">{progress}%</span>
            </div>
            <div className="progress-bar-wrap" style={{ height: 10 }}>
              <div className="progress-bar-fill progress-bar-fill--green" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {simulation && simulation.status === 'IN_PROGRESS' && (
        <div className="farm-right__section">
          <div className="farm-right__section-title">Current Stage</div>
          <div className="farm-right__stage-detail">
            <div className="farm-right__stage-icon">{STAGE_META[simulation.currentStage]?.icon}</div>
            <div className="farm-right__stage-label">{STAGE_META[simulation.currentStage]?.label}</div>
            <p className="farm-right__stage-hint">Choose your approach from the Tools panel on the left.</p>
          </div>
        </div>
      )}

      {lastDecision && (
        <div className="farm-right__section">
          <div className="farm-right__section-title">Last Decision</div>
          <div className={`farm-right__feedback${lastDecision.healthImpact < 0 ? ' negative' : lastDecision.healthImpact === 0 ? ' neutral' : ' positive'}`}>
            <div className="farm-right__feedback-impacts">
              <span className={lastDecision.healthImpact >= 0 ? 'text-green' : 'text-danger'}>
                {lastDecision.healthImpact > 0 ? '+' : ''}{lastDecision.healthImpact} HP
              </span>
              <span className={lastDecision.sustainabilityImpact >= 0 ? 'text-green' : 'text-danger'}>
                {lastDecision.sustainabilityImpact > 0 ? '+' : ''}{lastDecision.sustainabilityImpact} SP
              </span>
            </div>
            <p className="farm-right__feedback-text">{lastDecision.feedback}</p>
          </div>
        </div>
      )}

      {decisionHistory.length > 0 && (
        <div className="farm-right__section">
          <div className="farm-right__section-title">Decision History</div>
          <div className="farm-right__history">
            {decisionHistory.map((d, i) => (
              <div key={i} className="farm-right__history-item">
                <div className="farm-right__history-dot" />
                <div className="farm-right__history-info">
                  <div className="farm-right__history-stage">{STAGE_META[STAGE_ORDER[i]]?.label || `Stage ${i+1}`}</div>
                  <div className="farm-right__history-impact">
                    <span className={d.healthImpact >= 0 ? 'text-green' : 'text-danger'}>
                      {d.healthImpact > 0 ? '+' : ''}{d.healthImpact}
                    </span>
                    {' / '}
                    <span className={d.sustainabilityImpact >= 0 ? 'text-amber' : 'text-danger'}>
                      {d.sustainabilityImpact > 0 ? '+' : ''}{d.sustainabilityImpact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'COMPLETED' && (
        <div className="farm-right__section">
          <div className="farm-right__completion">
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏆</div>
            <h4>Simulation Complete!</h4>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
              {simulation.healthScore >= 80
                ? '🌾 Excellent crop health! Your choices were mostly optimal.'
                : simulation.healthScore >= 50
                ? '⚠️ Decent yield but some choices reduced your crop health.'
                : '❌ Low crop health. Review the learning tips and try again.'}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={onReset}>Try Again 🔄</button>
              <a href="/learn" className="btn btn-outline btn-sm">Learn 📚</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function VirtualFarmPage() {
  const { user, refreshUser } = useAuth();
  const [phase, setPhase] = useState('SELECT_CROP');
  const [simulation, setSimulation] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [lastDecision, setLastDecision] = useState(null);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);

  const handlePlantClick = () => {
    if (!selectedCrop) return;
    setShowCropModal(true);
  };

  const startSimulation = async () => {
    if (!selectedCrop || !user) return;
    setShowCropModal(false);
    setLoading(true);
    try {
      // Map frontend crop names to backend expected names
      const backendCropMap = { PADDY: 'RICE', MAIZE: 'TOMATO', WHEAT: 'WHEAT', COTTON: 'COTTON' };
      const backendCrop = backendCropMap[selectedCrop] || selectedCrop;
      const res = await simulationAPI.start(user.id, backendCrop);
      setSimulation(res.data);
      setPhase('SIMULATING');
      setDecisionHistory([]);
      setLastDecision(null);
    } catch {
      setError('Failed to start simulation. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const makeDecision = async () => {
    if (!selectedChoice || !simulation) return;
    setLoading(true);
    try {
      const res = await simulationAPI.decide(simulation.id, selectedChoice, selectedChoice);
      const result = res.data;
      setSimulation(result.simulation);
      setLastDecision(result.decision);
      setDecisionHistory(prev => [...prev, result.decision]);
      setSelectedChoice(null);
      if (result.simulation.status === 'COMPLETED') {
        setPhase('COMPLETED');
        refreshUser();
      }
    } catch {
      setError('Failed to process decision.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase('SELECT_CROP');
    setSimulation(null);
    setSelectedCrop(null);
    setSelectedChoice(null);
    setLastDecision(null);
    setDecisionHistory([]);
    setError('');
    setShowCropModal(false);
  };

  const stageMeta = simulation ? STAGE_META[simulation.currentStage] : null;
  const cropData = selectedCrop ? CROPS.find(c => c.id === selectedCrop) : null;

  return (
    <div className="farm-studio">
      <LeftSidebar
        crops={CROPS}
        selectedCrop={selectedCrop}
        onSelectCrop={setSelectedCrop}
        simulation={simulation}
        stageMeta={stageMeta}
        selectedChoice={selectedChoice}
        onSelectChoice={setSelectedChoice}
        phase={phase}
      />

      <div className="farm-center">
        <div className="farm-toolbar">
          <div className="farm-toolbar__left">
            <span className="farm-toolbar__title">🌾 Virtual Farm Simulator</span>
            {simulation && (
              <span className="badge badge-green">{simulation.status === 'COMPLETED' ? 'DONE' : 'ACTIVE'}</span>
            )}
          </div>
          <div className="farm-toolbar__right">
            {phase === 'SELECT_CROP' && (
              <button className="btn btn-primary btn-sm" onClick={handlePlantClick} disabled={!selectedCrop || loading}>
                {loading ? 'Starting...' : `Plant ${cropData?.name || 'Crop'} →`}
              </button>
            )}
            {phase === 'SIMULATING' && simulation?.status === 'IN_PROGRESS' && (
              <button className="btn btn-primary btn-sm" onClick={makeDecision} disabled={!selectedChoice || loading}>
                {loading ? 'Processing...' : 'Confirm Decision →'}
              </button>
            )}
            {phase !== 'SELECT_CROP' && (
              <button className="btn btn-outline btn-sm" onClick={reset}>Reset 🔄</button>
            )}
          </div>
        </div>

        {simulation && (
          <div className="farm-stepper">
            {STAGE_ORDER.map((s, i) => {
              const ci = STAGE_ORDER.indexOf(simulation.currentStage);
              return (
                <React.Fragment key={s}>
                  <div className={`farm-stepper__step${i < ci ? ' done' : i === ci ? ' active' : ''}`}>
                    <div className="farm-stepper__dot">{i < ci ? '✓' : STAGE_META[s]?.icon}</div>
                  </div>
                  {i < STAGE_ORDER.length - 1 && (
                    <div className={`farm-stepper__line${i < ci ? ' done' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <FarmCanvas simulation={simulation} />

        {error && (
          <div style={{ textAlign: 'center', color: 'var(--clr-danger)', padding: '8px 0', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div className="farm-bottom-bar">
          {simulation ? (
            <>
              <span>Crop: <strong className="text-amber">{simulation.crop}</strong></span>
              <span>Health: <strong className="text-green">{simulation.healthScore}</strong></span>
              <span>Sustain: <strong className="text-amber">{simulation.sustainabilityScore}</strong></span>
              {selectedChoice && <span>Selected: <strong className="text-green">{selectedChoice.replace(/_/g, ' ')}</strong></span>}
            </>
          ) : (
            <span className="text-muted">Select a crop to begin your farming simulation</span>
          )}
        </div>
      </div>

      <RightPanel
        simulation={simulation}
        lastDecision={lastDecision}
        decisionHistory={decisionHistory}
        onReset={reset}
        phase={phase}
      />

      {/* Floating Crop Data Modal */}
      {showCropModal && cropData && (
        <CropDataModal crop={cropData} onClose={() => setShowCropModal(false)} onStart={startSimulation} />
      )}
    </div>
  );
}
