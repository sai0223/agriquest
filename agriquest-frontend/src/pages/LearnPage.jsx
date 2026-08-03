import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { learningAPI } from '../api';

const CATEGORIES = ['ALL', 'SOIL', 'IRRIGATION', 'CROP_SEASONS', 'ORGANIC', 'PEST', 'CLIMATE'];
const CAT_LABELS = {
  ALL: '📋 All', SOIL: '🪱 Soil', IRRIGATION: '💧 Irrigation',
  CROP_SEASONS: '🌦️ Seasons', ORGANIC: '🌿 Organic', PEST: '🐛 Pest Control', CLIMATE: '🌍 Climate'
};

export default function LearnPage() {
  const [topics, setTopics] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    learningAPI.getTopics(category === 'ALL' ? null : category)
      .then(r => setTopics(r.data))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="page">
      <div className="container">
        <div className="mb-6">
          <div className="section-label">Learning Hub</div>
          <h1>Agricultural Knowledge Base 📚</h1>
          <p className="text-muted">Master every aspect of modern farming — at your own pace.</p>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`}
            >
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : topics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No topics found. The backend may not have seed data yet.</p>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 8 }}>
              Run <code>mvn spring-boot:run</code> to load seed data.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {topics.map(t => (
              <Link key={t.id} to={`/learn/${t.id}`} className="card topic-card" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <span className={`topic-difficulty ${t.difficulty?.toLowerCase()}`}>{t.difficulty}</span>
                  <span className="badge badge-green">{CAT_LABELS[t.category]?.split(' ')[0]}</span>
                </div>
                <h4 style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-heading)' }}>{t.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {t.description?.substring(0, 100)}...
                </p>
                <div className="btn btn-outline btn-sm mt-4" style={{ display: 'inline-block' }}>
                  Read & Quiz →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
