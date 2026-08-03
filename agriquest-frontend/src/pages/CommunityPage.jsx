import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CATS = ['ALL', 'IRRIGATION', 'PEST', 'SOIL', 'HARVEST', 'GENERAL'];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', questionText: '', category: 'GENERAL' });
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    communityAPI.getPosts(cat === 'ALL' ? null : cat)
      .then(r => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [cat]);

  const submit = async e => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    await communityAPI.createPost({ ...form, userId: user.id });
    setForm({ title: '', questionText: '', category: 'GENERAL' });
    setShowForm(false);
    load();
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="section-label">Q&A Forum</div>
            <h1>Farmer–Student Community 💬</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Ask a Question'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <h4 className="mb-3">Post a Question</h4>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="section-label">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Short question title" required />
              </div>
              <div className="mb-3">
                <label className="section-label">Your Question</label>
                <textarea value={form.questionText}
                  onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                  placeholder="Describe your question in detail..." required
                  style={{ minHeight: 100, resize: 'vertical' }} />
              </div>
              <div className="mb-3">
                <label className="section-label">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.filter(c => c !== 'ALL').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Post Question</button>
            </form>
          </div>
        )}

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <p>No posts yet. Be the first to ask!</p>
          </div>
        ) : (
          posts.map(p => (
            <Link key={p.id} to={`/community/${p.id}`} className="card post-card mb-3" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="post-meta mb-2">
                <div className="post-avatar">{p.user?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.user?.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
                    {p.user?.role} · {p.category}
                  </div>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>{p.category}</span>
              </div>
              <h4>{p.title}</h4>
              <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                {p.questionText?.substring(0, 140)}...
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 8 }}>
                👁️ {p.views} views
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
