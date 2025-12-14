import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODULES } from '../lib/lessons';
import { useLessonStore } from '../lib/lessonStore';
import { useStore } from '../lib/store';

export default function LearnPage() {
    const navigate = useNavigate();
    const { startLesson, completedLessons, setCompletedFromUser } = useLessonStore();
    const user = useStore(state => state.user);

    useEffect(() => {
        if (user && user.lesson_progress) {
            setCompletedFromUser(user.lesson_progress);
        }
    }, [user, setCompletedFromUser]);

    const handleStart = (lessonId) => {
        startLesson(lessonId);
        navigate('/'); // Go to Table view
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">Card Counting Curriculum</h1>
                    <p className="text-xl text-neutral-400">Master the art of advantage play step-by-step.</p>
                </div>

                <div className="grid gap-8">
                    {MODULES.map(module => (
                        <div key={module.id} className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                            <div className="p-6 border-b border-neutral-700 bg-neutral-800/50">
                                <h2 className="text-2xl font-bold text-emerald-400">{module.title}</h2>
                                <p className="text-neutral-400 mt-1">{module.description}</p>
                            </div>
                            <div className="divide-y divide-neutral-700">
                                {module.lessons.map(lesson => {
                                    const isCompleted = completedLessons.includes(lesson.id);
                                    return (
                                        <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-neutral-700/30 transition-colors">
                                            <div>
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    {lesson.title}
                                                    {isCompleted && (
                                                        <span className="text-emerald-500 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                            Completed
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-neutral-400 mt-1">{lesson.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleStart(lesson.id)}
                                                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                                                    isCompleted 
                                                    ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' 
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                                                }`}
                                            >
                                                {isCompleted ? 'Review' : 'Start'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
