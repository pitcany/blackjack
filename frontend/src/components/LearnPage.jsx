import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODULES, LESSON_PREREQUISITES } from '../lib/lessons';
import { useLessonStore } from '../lib/lessonStore';
import { useStore } from '../lib/store';

export default function LearnPage() {
    const navigate = useNavigate();
    const { startLesson, completedLessons, setCompletedFromUser, canStartLesson } = useLessonStore();
    const user = useStore(state => state.user);
    const canAccessTable = useStore(state => state.canAccessTable);

    useEffect(() => {
        if (user && user.lesson_progress) {
            setCompletedFromUser(user.lesson_progress);
        }
    }, [user, setCompletedFromUser]);

    const handleStart = (lessonId) => {
        if (startLesson(lessonId)) {
            navigate('/'); // Go to Table view for lesson
        }
    };

    // Calculate overall progress
    const totalLessons = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedCount = completedLessons.length;
    const progressPercent = Math.round((completedCount / totalLessons) * 100);

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">Card Counting Curriculum</h1>
                    <p className="text-xl text-neutral-400">Master the art of advantage play step-by-step.</p>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto mt-6">
                        <div className="flex justify-between text-sm text-neutral-400 mb-2">
                            <span>{completedCount} of {totalLessons} lessons</span>
                            <span>{progressPercent}% complete</span>
                        </div>
                        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        {canAccessTable() && (
                            <div className="mt-3 text-emerald-400 text-sm flex items-center justify-center gap-2">
                                <span>✓</span>
                                <span>Table unlocked! You can now play.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-8">
                    {MODULES.map(module => {
                        const moduleLessons = module.lessons;
                        const moduleCompleted = moduleLessons.filter(l => completedLessons.includes(l.id)).length;

                        return (
                            <div key={module.id} className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                                <div className="p-6 border-b border-neutral-700 bg-neutral-800/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-emerald-400">{module.title}</h2>
                                            <p className="text-neutral-400 mt-1">{module.description}</p>
                                        </div>
                                        <div className="text-sm text-neutral-400">
                                            {moduleCompleted}/{moduleLessons.length}
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-neutral-700">
                                    {moduleLessons.map(lesson => {
                                        const isCompleted = completedLessons.includes(lesson.id);
                                        const isLocked = !canStartLesson(lesson.id);
                                        const prerequisites = LESSON_PREREQUISITES[lesson.id] || [];
                                        const missingPrereqs = prerequisites.filter(p => !completedLessons.includes(p));

                                        return (
                                            <div
                                                key={lesson.id}
                                                className={`p-6 flex items-center justify-between transition-colors ${
                                                    isLocked ? 'opacity-60' : 'hover:bg-neutral-700/30'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                        {isLocked && <span className="text-neutral-500">🔒</span>}
                                                        {lesson.title}
                                                        {isCompleted && (
                                                            <span className="text-emerald-500 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-neutral-400 mt-1">{lesson.description}</p>
                                                    {isLocked && missingPrereqs.length > 0 && (
                                                        <p className="text-xs text-amber-500/80 mt-2">
                                                            Requires: {missingPrereqs.map(p => p.toUpperCase()).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleStart(lesson.id)}
                                                    disabled={isLocked}
                                                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                                                        isLocked
                                                            ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                                            : isCompleted
                                                            ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                                                    }`}
                                                >
                                                    {isLocked ? 'Locked' : isCompleted ? 'Review' : 'Start'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
