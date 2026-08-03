import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { communityAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [p, a] = await Promise.all([
      communityAPI.getPost(id),
      communityAPI.getAnswers(id)
    ]);
    setPost(p.data);
    setAnswers(a.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const submitAnswer = async e => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    await communityAPI.addAnswer(id, { userId: user.id, answerText: text });
    setText('');
    load();
  };

  const upvote = async (answerId) => {
    await communityAPI.upvote(answerId);
    load();
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!post) return <div className="page container"><p>Post not found.</p></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/community" className="btn btn-ghost btn-sm mb-4">← Back to Community</Link>

        <div className="card mb-4">
          <div className="post-meta mb-3">
            <div className="post-avatar">{post.user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{post.user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{post.user?.role} · {post.category}</div>
            </div>
          </div>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>{post.title}</h2>
          <p style={{ lineHeight: 1.8 }}>{post.questionText}</p>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h4>{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h4>
        </div>

        {answers.map(a => (
          <div key={a.id} className="answer-card mb-3">
            <div className="post-meta mb-2">
              <div className="post-avatar" style={{ background: 'rgba(240,165,0,0.15)', color: 'var(--clr-amber)', borderColor: 'rgba(240,165,0,0.3)' }}>
                {a.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-amber)' }}>
                  👨‍🌾 {a.user?.role}
                </div>
              </div>
              {a.isAccepted && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>✓ Accepted</span>}
            </div>
            <p style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>{a.answerText}</p>
            <div className="mt-3 flex items-center gap-3">
              <button className="btn btn-ghost btn-sm" onClick={() => upvote(a.id)}>
                👍 {a.upvotes}
              </button>
            </div>
          </div>
        ))}

        {user && (
          <div className="card mt-4">
            <h4 className="mb-3">
              {user.role === 'FARMER' ? '👨‍🌾 Share Your Experience' : '💬 Add a Comment'}
            </h4>
            <form onSubmit={submitAnswer}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Write a helpful answer from your farming experience..."
                required style={{ minHeight: 120, resize: 'vertical', marginBottom: 12 }} />
              <button type="submit" className="btn btn-primary">Post Answer</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
