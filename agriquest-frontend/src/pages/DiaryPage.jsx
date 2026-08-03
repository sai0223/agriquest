import React, { useEffect, useState } from 'react';
import { diaryAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function DiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop: '', dayStage: '', notes: '', photoUrl: '' });

  const load = () => {
    setLoading(true);
    diaryAPI.getAll()
      .then(r => setEntries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    if (!user) return;
    await diaryAPI.create({ ...form, farmerId: user.id });
    setForm({ crop: '', dayStage: '', notes: '', photoUrl: '' });
    setShowForm(false);
    load();
  };

  const CROPS_BY_FARMER = {};
  entries.forEach(e => {
    const name = e.farmer?.name || 'Anonymous';
    if (!CROPS_BY_FARMER[name]) CROPS_BY_FARMER[name] = [];
    CROPS_BY_FARMER[name].push(e);
  });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="section-label">Live Farm Diary</div>
            <h1>Real Farmers, Real Crops 📖</h1>
            <p className="text-muted">Follow actual farming journeys — day by day.</p>
          </div>
          {user?.role === 'FARMER' && (
            <button className="btn btn-amber" onClick={() => setShowForm(s => !s)}>
              {showForm ? 'Cancel' : '+ Add Diary Entry'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="card mb-5">
            <h4 className="mb-3">📝 New Diary Entry</h4>
            <form onSubmit={submit}>
              <div className="grid-2 mb-3">
                <div>
                  <label className="section-label">Crop</label>
                  <input value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                    placeholder="e.g. Rice" required />
                </div>
                <div>
                  <label className="section-label">Day Stage</label>
                  <input value={form.dayStage} onChange={e => setForm(f => ({ ...f, dayStage: e.target.value }))}
                    placeholder="e.g. Day 15 – Germination" required />
                </div>
              </div>
              <div className="mb-3">
                <label className="section-label">Photo URL (optional)</label>
                <input value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
                  placeholder="https://..." />
              </div>
              <div className="mb-3">
                <label className="section-label">Notes / Observations</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="What did you observe today?" style={{ minHeight: 100 }} />
              </div>
              <button type="submit" className="btn btn-amber">Post Entry</button>
            </form>
          </div>
        )}

        {loading ? <div className="spinner" /> : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <p>No diary entries yet.</p>
            {user?.role === 'FARMER' && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Be the first to share your crop journey!</p>}
          </div>
        ) : (
          Object.entries(CROPS_BY_FARMER).map(([farmerName, farmerEntries]) => (
            <div key={farmerName} className="card mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="post-avatar" style={{ width: 44, height: 44, background: 'rgba(240,165,0,0.15)', color: 'var(--clr-amber)', borderColor: 'rgba(240,165,0,0.3)', fontSize: '1rem' }}>
                  {farmerName[0]}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{farmerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-amber)' }}>👨‍🌾 Farmer · {farmerEntries.length} entries</div>
                </div>
                <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>
                  🌾 {farmerEntries[0]?.crop}
                </span>
              </div>

              <div className="diary-timeline">
                {farmerEntries.map(e => (
                  <div key={e.id} className="diary-entry">
                    <div className="diary-stage">{e.dayStage}</div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{e.notes}</p>
                    {e.photoUrl && (
                      <img src={e.photoUrl} alt={e.dayStage} className="diary-photo"
                        onError={ev => ev.target.style.display = 'none'} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
