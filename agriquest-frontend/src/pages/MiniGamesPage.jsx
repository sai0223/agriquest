import React, { useState } from 'react';

// ─── Mini Game: Match Crop to Season ─────────────────────────
const MATCH_DATA = [
  { crop: '🌾 Rice', season: 'Kharif (June–Nov)' },
  { crop: '🌿 Wheat', season: 'Rabi (Nov–April)' },
  { crop: '☁️ Cotton', season: 'Kharif (June–Nov)' },
  { crop: '🌻 Sunflower', season: 'Zaid (April–June)' },
  { crop: '🟡 Mustard', season: 'Rabi (Nov–April)' },
];

function MatchGame({ onBack }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const seasons = ['Kharif (June–Nov)', 'Rabi (Nov–April)', 'Zaid (April–June)'];
  const score = checked ? MATCH_DATA.filter(d => answers[d.crop] === d.season).length : 0;
  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={onBack}>← Back to Games</button>
      <h3 className="mb-4">🌦️ Match Crop to Season</h3>
      {MATCH_DATA.map(d => (
        <div key={d.crop} className="flex items-center gap-3 mb-3">
          <div style={{ minWidth: 140, fontWeight: 600 }}>{d.crop}</div>
          <select value={answers[d.crop] || ''}
            onChange={e => setAnswers(a => ({ ...a, [d.crop]: e.target.value }))}
            disabled={checked}
            style={{ flex: 1, borderColor: checked ? (answers[d.crop] === d.season ? 'var(--clr-success)' : 'var(--clr-danger)') : '' }}>
            <option value="">Select season...</option>
            {seasons.map(s => <option key={s}>{s}</option>)}
          </select>
          {checked && <span>{answers[d.crop] === d.season ? '✅' : '❌'}</span>}
        </div>
      ))}
      {!checked ? (
        <button className="btn btn-primary mt-3" onClick={() => setChecked(true)}>Check Answers</button>
      ) : (
        <div className="mt-3 text-center">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Score: {score}/{MATCH_DATA.length}</p>
          <button className="btn btn-outline mt-2" onClick={() => { setAnswers({}); setChecked(false); }}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ─── Mini Game: Identify the Pest ────────────────────────────
const PEST_DATA = [
  { emoji: '🐛', name: 'Leaf Miner', desc: 'Creates winding trails on leaves', answer: 'Leaf Miner' },
  { emoji: '🦟', name: 'Aphid', desc: 'Small green/black insects on stems', answer: 'Aphid' },
  { emoji: '🪲', name: 'Bollworm', desc: 'Damages cotton bolls and leaves', answer: 'Bollworm' },
];

function PestGame({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const pest = PEST_DATA[current];

  const check = () => {
    const correct = input.trim().toLowerCase() === pest.answer.toLowerCase();
    if (correct) setScore(s => s + 1);
    setResult(correct);
  };

  const next = () => {
    if (current < PEST_DATA.length - 1) { setCurrent(c => c + 1); setInput(''); setResult(null); }
    else setResult('done');
  };

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={onBack}>← Back to Games</button>
      <h3 className="mb-4">🐛 Identify the Pest</h3>
      {result === 'done' ? (
        <div className="text-center">
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginTop: 12 }}>
            Score: {score}/{PEST_DATA.length}
          </p>
          <button className="btn btn-outline mt-3" onClick={() => { setCurrent(0); setInput(''); setResult(null); setScore(0); }}>Play Again</button>
        </div>
      ) : (
        <div className="card">
          <div style={{ fontSize: '5rem', textAlign: 'center', marginBottom: 16 }}>{pest.emoji}</div>
          <p className="text-muted text-center mb-4">{pest.desc}</p>
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Name this pest..." disabled={result !== null} />
          {result !== null && result !== 'done' && (
            <p className={`mt-3 font-bold ${result ? 'text-green' : 'text-danger'}`}>
              {result ? '✅ Correct!' : `❌ Answer: ${pest.answer}`}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            {result === null && <button className="btn btn-primary" onClick={check}>Check</button>}
            {result !== null && <button className="btn btn-outline" onClick={next}>
              {current < PEST_DATA.length - 1 ? 'Next Pest →' : 'See Results'}
            </button>}
          </div>
          <p className="text-muted mt-3" style={{ fontSize: '0.8rem' }}>
            {current + 1} of {PEST_DATA.length}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Mini Game: Carbon Footprint Quiz ────────────────────────
const CARBON_Q = [
  { q: 'Which irrigation method has the lowest carbon footprint?', opts: ['Flood', 'Drip', 'Sprinkler', 'Canal'], a: 'Drip' },
  { q: 'Which fertilizer produces the most greenhouse gases?', opts: ['Compost', 'Vermicompost', 'Synthetic Urea', 'Green Manure'], a: 'Synthetic Urea' },
  { q: 'What farming practice sequesters the most carbon?', opts: ['Tilling', 'Burning crop residue', 'Agroforestry', 'Monocropping'], a: 'Agroforestry' },
];

function CarbonGame({ onBack }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = CARBON_Q[step];

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.a) setScore(s => s + 1);
  };

  const next = () => {
    if (step < CARBON_Q.length - 1) { setStep(s => s + 1); setSelected(null); }
    else setDone(true);
  };

  if (done) return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={onBack}>← Back to Games</button>
      <div className="text-center">
        <div style={{ fontSize: '3rem' }}>🌍</div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginTop: 12 }}>
          Carbon IQ: {score}/{CARBON_Q.length}
        </p>
        <button className="btn btn-outline mt-3" onClick={() => { setStep(0); setSelected(null); setScore(0); setDone(false); }}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-4" onClick={onBack}>← Back to Games</button>
      <h3 className="mb-4">🌍 Carbon Footprint Quiz</h3>
      <div className="card">
        <p style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Q{step + 1}: {q.q}</p>
        {q.opts.map(opt => (
          <div key={opt} onClick={() => pick(opt)}
            className={`quiz-option mb-2${selected === opt ? (opt === q.a ? ' correct' : ' wrong') : selected && opt === q.a ? ' correct' : ''}`}>
            <div className="quiz-option-letter">{opt[0]}</div>
            <span>{opt}</span>
          </div>
        ))}
        {selected && (
          <button className="btn btn-primary mt-3" onClick={next}>
            {step < CARBON_Q.length - 1 ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mini Games Hub ───────────────────────────────────────────
const GAMES = [
  { id: 'match', icon: '🌦️', title: 'Match Crop to Season', desc: 'Test your knowledge of Kharif, Rabi & Zaid seasons.', component: MatchGame },
  { id: 'pest', icon: '🐛', title: 'Identify the Pest', desc: 'Can you name these common agricultural pests?', component: PestGame },
  { id: 'carbon', icon: '🌍', title: 'Carbon Footprint Quiz', desc: 'Which farming choices are most eco-friendly?', component: CarbonGame },
  { id: 'coming', icon: '🚧', title: 'Save Water Challenge', desc: 'Coming soon — irrigation strategy challenge!', component: null },
];

export default function MiniGamesPage() {
  const [active, setActive] = useState(null);
  const Game = GAMES.find(g => g.id === active)?.component;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        {active && Game ? (
          <Game onBack={() => setActive(null)} />
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="section-label">Micro-Learning</div>
              <h1>Mini Games 🎮</h1>
              <p className="text-muted">Sharpen your farming knowledge in quick, fun sessions.</p>
            </div>
            <div className="grid-2">
              {GAMES.map(g => (
                <div key={g.id}
                  className={`card game-card${g.component ? '' : ' '}`}
                  onClick={() => g.component && setActive(g.id)}
                  style={{ opacity: g.component ? 1 : 0.5, cursor: g.component ? 'pointer' : 'default' }}>
                  <div className="game-icon">{g.icon}</div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{g.title}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>{g.desc}</p>
                  {g.component && <div className="btn btn-outline btn-sm mt-3">Play →</div>}
                  {!g.component && <div className="badge badge-amber mt-3">Coming Soon</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
