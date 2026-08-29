import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MockInterview from './components/MockInterview.jsx';
import RoadmapPage from './pages/RoadmapPage.jsx';
import JobMatch from './components/JobMatch.jsx';
import RecruiterDashboard from './components/RecruiterDashboard.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    return (t && t !== 'null' && t !== 'undefined') ? t : null;
  });
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return (u && u !== 'null' && u !== 'undefined') ? JSON.parse(u) : null;
  });
  const [userProfile, setUserProfile] = useState(() => {
    const p = localStorage.getItem('userProfile');
    return (p && p !== 'null' && p !== 'undefined') ? JSON.parse(p) : null;
  });

  const handleLogin = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    setToken(null);
    setUser(null);
    setUserProfile(null);
  };

  const handleOnboardingComplete = (profileData) => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setUserProfile(profileData);
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/auth"
          element={
            token ? <Navigate to="/" replace /> : <AuthPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/onboarding"
          element={
            !token ? (
              <Navigate to="/auth" replace />
            ) : userProfile ? (
              <Navigate to="/" replace />
            ) : (
              <OnboardingPage onComplete={handleOnboardingComplete} />
            )
          }
        />

        {/* Authenticated Routes wrapped in MainLayout */}
        <Route
          path="/"
          element={
            !token ? (
              <Navigate to="/auth" replace />
            ) : !userProfile ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <MainLayout user={user} userProfile={userProfile} onLogout={handleLogout} />
            )
          }
        >
          <Route index element={<DashboardPage userProfile={userProfile} />} />
          <Route path="chat" element={<ChatPage user={user} userProfile={userProfile} />} />
          <Route path="interview" element={<MockInterview userProfile={userProfile} />} />
          <Route path="roadmap" element={<RoadmapPage userProfile={userProfile} />} />
          <Route path="jobs" element={<JobMatch />} />
          <Route path="recruiter" element={<RecruiterDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Catch-all for root-level unknown paths */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
