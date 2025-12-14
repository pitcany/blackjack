import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Table from './components/Table';
import { useStore } from './lib/store';
import { getMe } from './lib/api';

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
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Table /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
