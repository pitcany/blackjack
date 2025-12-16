import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900">
            {/* Hero Section */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent" />
                <div className="max-w-6xl mx-auto px-6 py-20 relative">
                    <nav className="flex justify-between items-center mb-16">
                        <div className="text-2xl font-bold text-emerald-400">
                            BlackjackPro
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Sign In
                        </button>
                    </nav>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Master Card Counting
                                <span className="text-emerald-400"> Like a Pro</span>
                            </h1>
                            <p className="text-xl text-neutral-300 mb-8">
                                The most comprehensive blackjack trainer. Learn basic strategy,
                                Hi-Lo counting, and advanced deviations with real-time feedback.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-600/30"
                                >
                                    Start Training Free
                                </button>
                                <button
                                    onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                    className="border border-neutral-600 hover:border-neutral-500 text-white px-8 py-4 rounded-xl font-medium text-lg transition-colors"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Card Visual */}
                        <div className="hidden md:flex justify-center relative">
                            <div className="relative">
                                {/* Stacked cards visual */}
                                <div className="w-32 h-44 bg-white rounded-xl shadow-2xl transform rotate-[-15deg] absolute -left-8 top-4">
                                    <div className="p-2 text-red-600 text-2xl font-bold">A</div>
                                </div>
                                <div className="w-32 h-44 bg-white rounded-xl shadow-2xl transform rotate-[5deg] relative z-10">
                                    <div className="p-2 text-black text-2xl font-bold">K</div>
                                </div>
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold z-20">
                                    21!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-20 bg-neutral-800/50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-white mb-4">
                        Everything You Need to Beat the House
                    </h2>
                    <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
                        Our scientifically-designed training system helps you develop professional-level skills.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="strategy"
                            title="Basic Strategy"
                            description="Learn perfect basic strategy with instant feedback on every decision. Reduce house edge to under 0.5%."
                        />
                        <FeatureCard
                            icon="count"
                            title="Card Counting"
                            description="Master the Hi-Lo counting system with running count, true count, and deck estimation practice."
                        />
                        <FeatureCard
                            icon="deviation"
                            title="Index Plays"
                            description="Learn the Illustrious 18 deviations to know exactly when to deviate from basic strategy."
                        />
                        <FeatureCard
                            icon="track"
                            title="Progress Tracking"
                            description="Track your accuracy, common mistakes, and improvement over time with detailed analytics."
                        />
                        <FeatureCard
                            icon="lessons"
                            title="Guided Lessons"
                            description="Structured curriculum takes you from beginner to advanced with interactive lessons."
                        />
                        <FeatureCard
                            icon="realistic"
                            title="Realistic Gameplay"
                            description="Practice with authentic casino rules including splits, doubles, and multiple hands."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-4 gap-8">
                        <StepCard number={1} title="Create Account" description="Sign up for free and set your starting bankroll" />
                        <StepCard number={2} title="Learn Strategy" description="Complete interactive lessons on basic strategy and counting" />
                        <StepCard number={3} title="Practice" description="Play hands with real-time advice and mistake tracking" />
                        <StepCard number={4} title="Review & Improve" description="Analyze your sessions and focus on weak spots" />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-emerald-600/10 border-y border-emerald-600/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold text-emerald-400 mb-2">95%+</div>
                            <div className="text-neutral-300">Accuracy achievable with practice</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-emerald-400 mb-2">1-2%</div>
                            <div className="text-neutral-300">Player edge with card counting</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-emerald-400 mb-2">500+</div>
                            <div className="text-neutral-300">Scenarios in training database</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Start Winning?
                    </h2>
                    <p className="text-xl text-neutral-400 mb-8">
                        Join thousands of players who have improved their blackjack skills with our trainer.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-emerald-600/30"
                    >
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-neutral-800">
                <div className="max-w-6xl mx-auto px-6 text-center text-neutral-500 text-sm">
                    <p>BlackjackPro Trainer - For educational purposes only.</p>
                    <p className="mt-2">Gambling may be illegal in your jurisdiction. Please gamble responsibly.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    const icons = {
        strategy: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        count: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
        ),
        deviation: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        track: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        lessons: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        realistic: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 hover:border-emerald-600/50 transition-colors">
            <div className="text-emerald-400 mb-4">{icons[icon]}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-neutral-400">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }) {
    return (
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {number}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-neutral-400 text-sm">{description}</p>
        </div>
    );
}
