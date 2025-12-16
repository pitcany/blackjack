import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../lib/api';
import { useStore } from '../lib/store';

const ONBOARDING_STEPS = [
  {
    title: "Welcome to BlackjackPro!",
    content: "You're about to become a better blackjack player. Let's show you around.",
    icon: "wave"
  },
  {
    title: "Learn Basic Strategy",
    content: "Start with the Learn tab to master perfect basic strategy. We'll guide you through every decision with interactive lessons.",
    icon: "book"
  },
  {
    title: "Practice with Real-Time Feedback",
    content: "Play hands on the Table with live advice. The HUD shows you the running count, true count, and recommended plays.",
    icon: "play"
  },
  {
    title: "Track Your Progress",
    content: "Review your sessions in the Review tab. See your accuracy, common mistakes, and improvement over time.",
    icon: "chart"
  },
  {
    title: "Ready to Play!",
    content: "Start with the Learn section to build a strong foundation, then hit the tables when you're ready. Good luck!",
    icon: "rocket"
  }
];

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const setUser = useStore(state => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(email, password);
        setShowOnboarding(true);
      } else {
        await login(email, password);
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Onboarding complete, redirect to app
      window.location.href = '/learn'; // Start them on Learn page
    }
  };

  const handleSkipOnboarding = () => {
    window.location.href = '/';
  };

  if (showOnboarding) {
    const step = ONBOARDING_STEPS[onboardingStep];
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="w-full max-w-lg p-8 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === onboardingStep ? 'bg-emerald-500' : 'bg-neutral-600'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <OnboardingIcon icon={step.icon} />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            {step.title}
          </h2>
          <p className="text-neutral-300 text-center mb-8">
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSkipOnboarding}
              className="flex-1 py-3 text-neutral-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleOnboardingNext}
              className="flex-1 py-3 font-bold text-neutral-900 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors"
            >
              {onboardingStep === ONBOARDING_STEPS.length - 1 ? "Let's Go!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700">
        {/* Back to landing */}
        <button
          onClick={() => navigate('/welcome')}
          className="text-neutral-400 hover:text-white text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

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
              minLength={6}
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

function OnboardingIcon({ icon }) {
  const icons = {
    wave: (
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
        <span className="text-4xl">👋</span>
      </div>
    ),
    book: (
      <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    ),
    play: (
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    chart: (
      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    ),
    rocket: (
      <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
        <span className="text-4xl">🚀</span>
      </div>
    )
  };

  return icons[icon] || icons.wave;
}
