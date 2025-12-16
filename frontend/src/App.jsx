import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Table from './components/Table';
import LearnPage from './components/LearnPage';
import ReviewPage from './components/ReviewPage';
import LandingPage from './components/LandingPage';
import { useStore } from './lib/store';
import { getMe } from './lib/api';
import { TABLE_ACCESS_REQUIREMENTS } from './lib/lessons';

// Helper Wrapper for authenticated routes
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useStore();
    return isAuthenticated ? children : <Navigate to="/welcome" />;
};

// Guard for Table access - requires completing basic lessons
const TableGuard = ({ children }) => {
    const canAccessTable = useStore(state => state.canAccessTable);
    const completedLessons = useStore(state => state.completedLessons);

    if (!canAccessTable()) {
        const remaining = TABLE_ACCESS_REQUIREMENTS.filter(r => !completedLessons.includes(r));
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md text-center bg-neutral-800 rounded-xl p-8 border border-neutral-700">
                    <div className="text-5xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-emerald-400 mb-4">Complete Basic Training First</h2>
                    <p className="text-neutral-300 mb-6">
                        Before playing at the table, you need to learn the fundamentals.
                        Complete the required lessons to unlock gameplay.
                    </p>
                    <div className="mb-6 text-left bg-neutral-900 rounded-lg p-4">
                        <div className="text-sm text-neutral-400 mb-2">Required lessons:</div>
                        {TABLE_ACCESS_REQUIREMENTS.map(lessonId => (
                            <div key={lessonId} className="flex items-center gap-2 py-1">
                                {completedLessons.includes(lessonId) ? (
                                    <span className="text-green-400">✓</span>
                                ) : (
                                    <span className="text-neutral-500">○</span>
                                )}
                                <span className={completedLessons.includes(lessonId) ? 'text-green-400' : 'text-neutral-300'}>
                                    {lessonId.toUpperCase()}: {getLessonName(lessonId)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link
                        to="/learn"
                        className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        Go to Learn
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

// Helper to get lesson names
const getLessonName = (id) => {
    const names = {
        'a1': 'Hand Values',
        'a2': 'The Dealer',
        'b1': 'Hard Totals',
        'b2': 'Soft Totals',
        'b3': 'Pair Splitting'
    };
    return names[id] || id;
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
                <TableGuard>
                    <Table />
                </TableGuard>
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
