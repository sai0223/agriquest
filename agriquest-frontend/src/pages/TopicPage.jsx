import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { learningAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function TopicPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      learningAPI.getTopic(id),
      learningAPI.getQuizzes(id)
    ]).then(([t, q]) => { setTopic(t.data); setQuizzes(q.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const loadQuiz = async (quiz) => {
    const res = await learningAPI.getQuestions(quiz.id);
    setQuestions(res.data);
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  const submitQuiz = async () => {
    if (!user) return;
    const res = await learningAPI.submitQuiz(activeQuiz.id, user.id, answers);
    setResult(res.data);
    setSubmitted(true);
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!topic) return <div className="page container"><p>Topic not found.</p></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/learn" className="btn btn-ghost btn-sm mb-4">← Back to Topics</Link>

        {/* Topic content */}
        <div className="card mb-5">
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <span className={`topic-difficulty ${topic.difficulty?.toLowerCase()}`}>{topic.difficulty}</span>
            <span className="badge badge-green">{topic.category}</span>
          </div>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>{topic.title}</h2>
          <p className="text-muted mb-4">{topic.description}</p>

          {topic.notes && (
            <div style={{
              background: 'var(--clr-surface-2)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)', borderLeft: '3px solid var(--clr-primary)'
            }}>
              <div className="section-label mb-3">📋 Study Notes</div>
              {topic.notes.split('\n').map((line, i) => (
                <p key={i} style={{
                  marginBottom: 8, fontSize: '0.9rem', lineHeight: 1.8,
                  fontWeight: line.startsWith('**') ? 600 : 400,
                  color: line.startsWith('**') ? 'var(--clr-text)' : 'var(--clr-text-muted)'
                }}>
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes */}
        {quizzes.length > 0 && (
          <div>
            <h3 className="mb-4">Test Your Knowledge 🎯</h3>
            {quizzes.map(q => (
              <div key={q.id} className="card mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4>{q.title}</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>Multiple-choice quiz</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => loadQuiz(q)}>
                    Start Quiz →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active quiz */}
        {activeQuiz && (
          <div className="card mt-4">
            <h3 className="mb-4">{activeQuiz.title}</h3>

            {result ? (
              <div className="text-center">
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>
                  {result.score >= 80 ? '🏆' : result.score >= 50 ? '📈' : '📚'}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: 'var(--clr-primary)' }}>
                  {result.score}%
                </div>
                <p className="text-muted mb-4">
                  {result.score >= 80 ? 'Excellent! You\'ve mastered this topic.' :
                   result.score >= 50 ? 'Good progress! Review the notes above.' :
                   'Keep practicing! Re-read the topic and try again.'}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                  <button className="btn btn-outline" onClick={() => loadQuiz(activeQuiz)}>Retry Quiz</button>
                  <Link to="/learn" className="btn btn-primary">More Topics →</Link>
                </div>
              </div>
            ) : (
              <div>
                {questions.map((q, qi) => (
                  <div key={q.id} className="mb-4">
                    <p style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                      Q{qi + 1}: {q.questionText}
                    </p>
                    {q.options?.map((opt, i) => (
                      <div
                        key={i}
                        className={`quiz-option mb-2${answers[q.id] === opt ? ' selected' : ''}`}
                        onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: opt }))}
                      >
                        <div className="quiz-option-letter">{String.fromCharCode(65 + i)}</div>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  className="btn btn-primary btn-lg w-full mt-2"
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length !== questions.length}
                >
                  Submit Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
