import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AIChatWidget from './components/AIChatWidget';

// Pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import FarmerDashboard  from './pages/FarmerDashboard';
import VirtualFarmPage  from './pages/VirtualFarmPage';
import LearnPage        from './pages/LearnPage';
import TopicPage        from './pages/TopicPage';
import MiniGamesPage    from './pages/MiniGamesPage';
import CommunityPage    from './pages/CommunityPage';
import PostDetailPage   from './pages/PostDetailPage';
import DiaryPage        from './pages/DiaryPage';
import LeaderboardPage  from './pages/LeaderboardPage';

// Protected route wrapper
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />
        <Route path="/community"     element={<CommunityPage />} />
        <Route path="/community/:id" element={<PostDetailPage />} />
        <Route path="/diary"         element={<DiaryPage />} />
        <Route path="/leaderboard"   element={<LeaderboardPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/farm" element={
          <ProtectedRoute>
            <VirtualFarmPage />
          </ProtectedRoute>
        } />
        <Route path="/learn" element={
          <ProtectedRoute roles={['STUDENT']}>
            <LearnPage />
          </ProtectedRoute>
        } />
        <Route path="/learn/:id" element={
          <ProtectedRoute roles={['STUDENT']}>
            <TopicPage />
          </ProtectedRoute>
        } />
        <Route path="/mini-games" element={
          <ProtectedRoute roles={['STUDENT']}>
            <MiniGamesPage />
          </ProtectedRoute>
        } />
        <Route path="/farmer/dashboard" element={
          <ProtectedRoute roles={['FARMER']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/farmer/diary" element={
          <ProtectedRoute roles={['FARMER']}>
            <DiaryPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute roles={['TEACHER']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatWidget />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
