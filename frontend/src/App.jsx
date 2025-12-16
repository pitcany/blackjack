import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Table from './components/Table';
import LearnPage from './components/LearnPage';
import ReviewPage from './components/ReviewPage';
import LandingPage from './components/LandingPage';
import { useStore } from './lib/store';
import { getMe } from './lib/api';

// Helper Wrapper for authenticated routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useStore();
    return isAuthenticated ? children : <Navigate to="/welcome" />;
};

function App() {
  const { isAuthenticated, setUser } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(user => setUser(user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col">
        {isAuthenticated && <NavBar />}
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
                <Table />
            </ProtectedRoute>
          } />

          <Route path="/learn" element={
            <ProtectedRoute>
                <LearnPage />
            </ProtectedRoute>
          } />

          <Route path="/drills" element={
            <ProtectedRoute>
                <div className="p-12 text-center text-neutral-400">Drills coming soon</div>
            </ProtectedRoute>
          } />

          <Route path="/review" element={
            <ProtectedRoute>
                <ReviewPage />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/welcome"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
