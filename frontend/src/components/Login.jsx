import React, { useState } from 'react';
import { login, register } from '../lib/api';
import { useStore } from '../lib/store';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setUser = useStore(state => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = isRegister ? await register(email, password) : await login(email, password);
      // Fetch full user details after login to get bankroll/settings
      // For now, just set authenticated state, App.js will fetch user
      window.location.reload(); // Simple reload to trigger App.js check or use navigate
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700">
        <h2 className="text-3xl font-bold text-center text-emerald-500">
          {isRegister ? 'Join the Table' : 'Welcome Back'}
        </h2>
        {error && <div className="p-3 text-sm text-red-200 bg-red-900/50 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-neutral-900 border border-neutral-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-neutral-900 border border-neutral-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-bold text-neutral-900 bg-emerald-500 rounded hover:bg-emerald-400 transition-colors"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-sm text-neutral-400 hover:text-emerald-500"
        >
          {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}
