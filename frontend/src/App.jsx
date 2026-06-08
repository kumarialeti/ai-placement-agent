import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  const [userProfile, setUserProfile] = useState(
    localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')) : null
  );

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
            token ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/onboarding"
          element={
            !token ? (
              <Navigate to="/auth" />
            ) : userProfile ? (
              <Navigate to="/" />
            ) : (
              <OnboardingPage onComplete={handleOnboardingComplete} />
            )
          }
        />
        <Route
          path="/*"
          element={
            !token ? (
              <Navigate to="/auth" />
            ) : !userProfile ? (
              <Navigate to="/onboarding" />
            ) : (
              <ChatPage user={user} userProfile={userProfile} onLogout={handleLogout} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
