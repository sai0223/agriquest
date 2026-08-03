import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getUser:  (id)   => api.get(`/auth/user/${id}`),
};

// ─── Simulation ─────────────────────────────────────────────
export const simulationAPI = {
  start:       (userId, crop) => api.post('/simulation/start', { userId, crop }),
  decide:      (id, choiceKey, choiceValue) => api.post(`/simulation/${id}/decide`, { choiceKey, choiceValue }),
  get:         (id)     => api.get(`/simulation/${id}`),
  getHistory:  (id)     => api.get(`/simulation/${id}/history`),
  getUserSims: (userId) => api.get(`/simulation/user/${userId}`),
  stageOptions:()       => api.get('/simulation/stage-options'),
};

// ─── Learning ────────────────────────────────────────────────
export const learningAPI = {
  getTopics:    (category) => api.get('/learning/topics', { params: category ? { category } : {} }),
  getTopic:     (id)       => api.get(`/learning/topics/${id}`),
  getQuizzes:   (topicId)  => api.get(`/learning/topics/${topicId}/quizzes`),
  getQuestions: (quizId)   => api.get(`/learning/quizzes/${quizId}/questions`),
  submitQuiz:   (quizId, userId, answers) => api.post(`/learning/quizzes/${quizId}/submit`, { userId, answers }),
  getAttempts:  (userId)   => api.get(`/learning/attempts/${userId}`),
};

// ─── Gamification ────────────────────────────────────────────
export const gamificationAPI = {
  getLeaderboard:  ()       => api.get('/gamification/leaderboard'),
  getFarmerBoard:  ()       => api.get('/gamification/leaderboard/farmers'),
  getBadges:       (userId) => api.get(`/gamification/badges/${userId}`),
  getStats:        (userId) => api.get(`/gamification/stats/${userId}`),
  checkBadges:     (userId) => api.post(`/gamification/check-badges/${userId}`),
};

// ─── Community ───────────────────────────────────────────────
export const communityAPI = {
  getPosts:   (category) => api.get('/community/posts', { params: category ? { category } : {} }),
  getPost:    (id)       => api.get(`/community/posts/${id}`),
  createPost: (data)     => api.post('/community/posts', data),
  getAnswers: (postId)   => api.get(`/community/posts/${postId}/answers`),
  addAnswer:  (postId, data) => api.post(`/community/posts/${postId}/answers`, data),
  upvote:     (answerId) => api.post(`/community/answers/${answerId}/upvote`),
};

// ─── Diary ───────────────────────────────────────────────────
export const diaryAPI = {
  getAll:      ()         => api.get('/diary/entries'),
  getEntry:    (id)       => api.get(`/diary/entries/${id}`),
  getFarmer:   (farmerId) => api.get(`/diary/farmer/${farmerId}`),
  create:      (data)     => api.post('/diary/entries', data),
};

// ─── AI Chat ─────────────────────────────────────────────────
export const aiAPI = {
  chat:       (userId, query) => api.post('/ai/chat', { userId, query }),
  getHistory: (userId)        => api.get(`/ai/history/${userId}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
