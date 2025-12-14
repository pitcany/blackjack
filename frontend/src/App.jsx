import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Table from './components/Table';
import LearnPage from './components/LearnPage';
import { useStore } from './lib/store';
import { getMe } from './lib/api';
import { useEffect } from 'react';

// Helper Wrapper for authenticated routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useStore();
    // Simple check, real app might wait for loading
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated, setUser } = useStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe().then(user => setUser(user)).catch(() => setUser(null));
    }
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col">
        {isAuthenticated && <NavBar />}
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          
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
          
          <Route path="/drills" element={<div className="p-12 text-center text-neutral-400">Drills coming soon</div>} />
          <Route path="/review" element={<div className="p-12 text-center text-neutral-400">Review coming soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
