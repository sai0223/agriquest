import React, { useState, useEffect } from 'react';
import { simulationAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CROPS = [
  { id: 'RICE', icon: '🌾', name: 'Rice', desc: 'Water-intensive, tropical crop. 120-day cycle.' },
  { id: 'WHEAT', icon: '🌿', name: 'Wheat', desc: 'Winter staple, moderate water. 100-day cycle.' },
  { id: 'COTTON', icon: '☁️', name: 'Cotton', desc: 'Cash crop for black soil. 180-day cycle.' },
  { id: 'TOMATO', icon: '🍅', name: 'Tomato', desc: 'Vegetable crop, high care. 90-day cycle.' },
];

const STAGE_META = {
  SOIL_PREPARATION: { icon: '🪱', label: 'Soil Preparation', choices: [
    { key: 'DEEP_PLOUGHING', label: 'Deep Ploughing', icon: '⛏️', desc: 'Break compaction, aerate deep layers' },
    { key: 'SHALLOW_PLOUGHING', label: 'Shallow Ploughing', icon: '🔧', desc: 'Quick but limited root depth' },
    { key: 'NO_PLOUGHING', label: 'Skip (No Ploughing)', icon: '❌', desc: 'Not recommended — causes compaction' },
  ]},
  SOWING: { icon: '🌱', label: 'Sowing Method', choices: [
    { key: 'SEED_TREATMENT', label: 'Treated Seeds', icon: '💊', desc: 'Fungicide/biofertilizer coated seeds' },
    { key: 'DIRECT_SOWING', label: 'Direct Sowing', icon: '🫘', desc: 'Standard untreated seeds' },
    { key: 'LATE_SOWING', label: 'Late Sowing', icon: '⏰', desc: 'Past optimal window — risky' },
  ]},
  IRRIGATION: { icon: '💧', label: 'Irrigation Method', choices: [
    { key: 'DRIP', label: 'Drip Irrigation', icon: '💧', desc: 'Saves 60% water — most sustainable' },
    { key: 'SPRINKLER', label: 'Sprinkler', icon: '🚿', desc: 'Moderate water use, good coverage' },
    { key: 'FLOOD', label: 'Flood Irrigation', icon: '🌊', desc: 'Traditional but wastes water' },
    { key: 'NONE', label: 'No Irrigation', icon: '🏜️', desc: 'Rain-fed only — high risk' },
  ]},
  FERTILIZATION: { icon: '🧪', label: 'Fertilization', choices: [
    { key: 'ORGANIC_COMPOST', label: 'Organic Compost', icon: '♻️', desc: 'Best for soil health long-term' },
    { key: 'BALANCED_NPK', label: 'Balanced NPK', icon: '⚗️', desc: 'Chemical fertilizer — effective' },
    { key: 'EXCESS_UREA', label: 'Heavy Urea', icon: '⚠️', desc: 'Overuse damages soil and water' },
    { key: 'NO_FERTILIZER', label: 'No Fertilizer', icon: '🚫', desc: 'Depletes soil over time' },
  ]},
  PEST_MANAGEMENT: { icon: '🐛', label: 'Pest Management', choices: [
    { key: 'IPM', label: 'Integrated Pest Mgmt', icon: '🌿', desc: 'Gold standard — biological + minimal chemicals' },
    { key: 'BIOLOGICAL_CONTROL', label: 'Biological Control', icon: '🐞', desc: 'Natural predators — eco-friendly' },
    { key: 'CHEMICAL_SPRAY', label: 'Chemical Spray', icon: '🧴', desc: 'Quick fix but harms ecosystem' },
    { key: 'NO_ACTION', label: 'Ignore Pests', icon: '😶', desc: 'Dangerous — crops may be destroyed' },
  ]},
  GROWTH_MONITORING: { icon: '📊', label: 'Growth Monitoring', choices: [
    { key: 'REGULAR_SCOUTING', label: 'Weekly Scouting', icon: '🔍', desc: 'Catch problems early' },
    { key: 'OCCASIONAL_CHECK', label: 'Occasional Check', icon: '👁️', desc: 'Misses early warning signs' },
    { key: 'NO_MONITORING', label: 'No Monitoring', icon: '🙈', desc: 'Farming blind — high risk' },
  ]},
  HARVEST: { icon: '🌾', label: 'Harvest Timing', choices: [
    { key: 'OPTIMAL_TIMING', label: 'Optimal Timing', icon: '✅', desc: 'Peak maturity — maximum yield' },
    { key: 'EARLY_HARVEST', label: 'Early Harvest', icon: '⏩', desc: 'Reduced yield and quality' },
    { key: 'LATE_HARVEST', label: 'Late Harvest', icon: '⏰', desc: 'Post-harvest losses increase' },
  ]},
};

const STAGE_ORDER = ['SOIL_PREPARATION','SOWING','IRRIGATION','FERTILIZATION','PEST_MANAGEMENT','GROWTH_MONITORING','HARVEST'];

export default function VirtualFarmPage() {
  const { user, refreshUser } = useAuth();
  const [phase, setPhase] = useState('SELECT_CROP'); // SELECT_CROP | SIMULATING | COMPLETED
  const [simulation, setSimulation] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [lastDecision, setLastDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startSimulation = async () => {
    if (!selectedCrop || !user) return;
    setLoading(true);
    try {
      const res = await simulationAPI.start(user.id, selectedCrop);
      setSimulation(res.data);
      setPhase('SIMULATING');
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
    setError('');
  };

  const currentStageIndex = simulation ? STAGE_ORDER.indexOf(simulation.currentStage) : -1;
  const stageMeta = simulation ? STAGE_META[simulation.currentStage] : null;

  // ─── Crop Selection ──────────────────────────────────────
  if (phase === 'SELECT_CROP') {
    return (
      <div className="page">
        <div className="container container--narrow">
          <div className="text-center mb-6">
            <div className="section-label">Virtual Farm Simulator</div>
            <h1>Choose Your Crop 🌾</h1>
            <p className="text-muted">Your farming journey begins with this choice.</p>
          </div>
          <div className="choice-grid">
            {CROPS.map(c => (
              <div
                key={c.id}
                className={`choice-card${selectedCrop === c.id ? ' selected' : ''}`}
                onClick={() => setSelectedCrop(c.id)}
              >
                <div className="choice-icon">{c.icon}</div>
                <div className="choice-name">{c.name}</div>
                <div className="choice-desc">{c.desc}</div>
              </div>
            ))}
          </div>
          {error && <p style={{ color: 'var(--clr-danger)', textAlign: 'center', marginTop: 16 }}>{error}</p>}
          <div className="text-center mt-6">
            <button
              className="btn btn-primary btn-lg"
              onClick={startSimulation}
              disabled={!selectedCrop || loading}
            >
              {loading ? 'Starting...' : `Start with ${CROPS.find(c=>c.id===selectedCrop)?.name || 'Crop'} →`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Completed ───────────────────────────────────────────
  if (phase === 'COMPLETED') {
    return (
      <div className="page">
        <div className="container container--narrow text-center">
          <div style={{ fontSize: '5rem', marginBottom: 'var(--space-4)', animation: 'glow 2s infinite' }}>🏆</div>
          <h1>Simulation Complete!</h1>
          <p className="text-muted mb-4">You've taken your crop through all 8 farming stages.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <div className="score-circle score-circle--health">
              <span className="score-value">{simulation.healthScore}</span>
              <span className="score-label">Health</span>
            </div>
            <div className="score-circle score-circle--sustain">
              <span className="score-value">{simulation.sustainabilityScore}</span>
              <span className="score-label">Sustain.</span>
            </div>
          </div>
          <div className="card mb-4" style={{ textAlign: 'left' }}>
            <h4>Your Results:</h4>
            {simulation.healthScore >= 80 && <p className="text-green mt-2">🌾 Excellent crop health! Your choices were mostly optimal.</p>}
            {simulation.healthScore >= 50 && simulation.healthScore < 80 && <p className="text-amber mt-2">⚠️ Decent yield but some choices reduced your crop health. Review the feedback above.</p>}
            {simulation.healthScore < 50 && <p style={{ color: 'var(--clr-danger)' }} className="mt-2">❌ Low crop health. Review the learning tips and try again to improve!</p>}
            {simulation.sustainabilityScore >= 80 && <p className="text-green mt-2">🌍 Great sustainability choices! You've protected the environment.</p>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={reset}>Try Again 🔄</button>
            <a href="/learn" className="btn btn-outline btn-lg">Review Topics 📚</a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active Simulation ───────────────────────────────────
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Stage stepper */}
        <div className="card mb-4">
          <div className="stage-stepper">
            {STAGE_ORDER.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`stage-step${i < currentStageIndex ? ' done' : i === currentStageIndex ? ' active' : ''}`}>
                  <div className="stage-step-dot">
                    {i < currentStageIndex ? '✓' : STAGE_META[s]?.icon}
                  </div>
                  <div className="stage-step-label">{STAGE_META[s]?.label}</div>
                </div>
                {i < STAGE_ORDER.length - 1 && <div className="stage-connector" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-4 mb-4" style={{ justifyContent: 'center' }}>
          <div className="score-circle score-circle--health">
            <span className="score-value">{simulation?.healthScore}</span>
            <span className="score-label">Health</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Crop</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--clr-amber)' }}>
              {simulation?.crop}
            </div>
          </div>
          <div className="score-circle score-circle--sustain">
            <span className="score-value">{simulation?.sustainabilityScore}</span>
            <span className="score-label">Sustain.</span>
          </div>
        </div>

        {/* Last decision feedback */}
        {lastDecision && (
          <div className={`feedback-box mb-4${lastDecision.healthImpact < 0 ? ' danger' : lastDecision.healthImpact === 0 ? ' warning' : ''}`}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Impact: {lastDecision.healthImpact > 0 ? '+' : ''}{lastDecision.healthImpact} Health |{' '}
              {lastDecision.sustainabilityImpact > 0 ? '+' : ''}{lastDecision.sustainabilityImpact} Sustainability
            </div>
            <p style={{ fontSize: '0.9rem' }}>{lastDecision.feedback}</p>
          </div>
        )}

        {/* Current stage choices */}
        {stageMeta && simulation?.status === 'IN_PROGRESS' && (
          <div className="card">
            <h3 className="mb-3">
              {stageMeta.icon} Stage: <span className="text-green">{stageMeta.label}</span>
            </h3>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
              Choose your approach for this stage. Each choice has real consequences on your crop.
            </p>
            <div className="choice-grid">
              {stageMeta.choices.map(c => (
                <div
                  key={c.key}
                  className={`choice-card${selectedChoice === c.key ? ' selected' : ''}`}
                  onClick={() => setSelectedChoice(c.key)}
                >
                  <div className="choice-icon">{c.icon}</div>
                  <div className="choice-name">{c.label}</div>
                  <div className="choice-desc">{c.desc}</div>
                </div>
              ))}
            </div>
            {error && <p style={{ color: 'var(--clr-danger)', marginTop: 12 }}>{error}</p>}
            <div className="text-center mt-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={makeDecision}
                disabled={!selectedChoice || loading}
              >
                {loading ? 'Processing...' : 'Confirm Decision →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
