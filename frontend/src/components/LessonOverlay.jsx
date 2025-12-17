import React, { useState } from 'react';
import { useLessonStore } from '../lib/lessonStore';
import { LESSONS } from '../lib/lessons';
import { useStore } from '../lib/store';
import { Action } from '../lib/engine';

export default function LessonOverlay() {
    const { activeLessonId, currentStepIndex, nextStep, quitLesson } = useLessonStore();
    const { dispatchAction } = useStore();
    const [feedback, setFeedback] = useState({ show: false, correct: false, message: '', explanation: '' });

    if (!activeLessonId) return null;

    const lesson = LESSONS[activeLessonId];
    if (!lesson) return null;

    const step = lesson.steps[currentStepIndex];
    if (!step) return null;

    const clearFeedback = () => setFeedback({ show: false, correct: false, message: '', explanation: '' });

    const handleAction = (userAction) => {
        if (step.type === 'action') {
            const expectedAction = step.instruction;
            if (userAction === expectedAction) {
                // Correct action
                setFeedback({ show: true, correct: true, message: 'Correct!', explanation: '' });

                // Map string to Action enum
                const actionMap = {
                    'Hit': Action.HIT,
                    'Stand': Action.STAND,
                    'Double': Action.DOUBLE,
                    'Split': Action.SPLIT,
                    'Surrender': Action.SURRENDER
                };

                if (actionMap[userAction]) {
                    dispatchAction(actionMap[userAction]);
                }

                setTimeout(() => {
                    clearFeedback();
                    nextStep();
                }, 1200);
            } else {
                // Wrong action - show educational feedback
                setFeedback({
                    show: true,
                    correct: false,
                    message: `Not quite. The correct play is ${expectedAction}.`,
                    explanation: step.text || ''
                });
            }
        }
    };

    const handleQuiz = (option) => {
        if (option === step.answer) {
            setFeedback({ show: true, correct: true, message: 'Correct!', explanation: step.explanation || '' });
            setTimeout(() => {
                clearFeedback();
                nextStep();
            }, 1500);
        } else {
            setFeedback({
                show: false,
                correct: false,
                message: `Incorrect. The answer is "${step.answer}".`,
                explanation: step.explanation || step.text || ''
            });
            // Show feedback inline, don't use alert
            setFeedback({
                show: true,
                correct: false,
                message: `Not quite. The correct answer is "${step.answer}".`,
                explanation: step.explanation || step.text || ''
            });
        }
    };

    const handleContinueAfterWrong = () => {
        clearFeedback();
    };

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end pb-32 md:pb-8 items-center">
            <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur border border-emerald-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 mx-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                            Lesson: {lesson.title}
                        </div>
                        <div className="text-neutral-400 text-xs">
                            Step {currentStepIndex + 1} of {lesson.steps.length}
                        </div>
                    </div>
                    <button
                        onClick={quitLesson}
                        className="text-neutral-500 hover:text-white text-sm px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
                    >
                        Exit
                    </button>
                </div>

                {/* Main Content */}
                <h3 className="text-xl font-bold text-white mb-2">
                    {step.type === 'quiz' ? step.question : step.text}
                </h3>

                {/* Feedback Display */}
                {feedback.show && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                        feedback.correct
                            ? 'bg-emerald-900/30 border-emerald-500/30'
                            : 'bg-red-900/30 border-red-500/30'
                    }`}>
                        <p className={`font-semibold ${feedback.correct ? 'text-emerald-300' : 'text-red-300'}`}>
                            {feedback.message}
                        </p>
                        {feedback.explanation && (
                            <p className={`text-sm mt-2 ${feedback.correct ? 'text-emerald-200/80' : 'text-red-200/80'}`}>
                                {feedback.explanation}
                            </p>
                        )}
                        {!feedback.correct && (
                            <button
                                onClick={handleContinueAfterWrong}
                                className="mt-3 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}

                {/* Info Step - Continue Button */}
                {step.type === 'info' && !feedback.show && (
                    <button
                        onClick={nextStep}
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                )}

                {/* Quiz Step - Multiple Choice */}
                {step.type === 'quiz' && !feedback.show && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {step.options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => handleQuiz(opt)}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 px-4 rounded-lg border border-neutral-700 transition-colors text-left"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Action Step - Game Controls */}
                {step.type === 'action' && !feedback.show && (
                    <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-200 mb-3">
                            Perform the action: <strong className="text-white">{step.instruction}</strong>
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleAction('Hit')}
                                className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-500 py-2.5 rounded-lg font-bold text-white transition-colors"
                            >
                                Hit
                            </button>
                            <button
                                onClick={() => handleAction('Stand')}
                                className="flex-1 min-w-[80px] bg-red-600 hover:bg-red-500 py-2.5 rounded-lg font-bold text-white transition-colors"
                            >
                                Stand
                            </button>
                            <button
                                onClick={() => handleAction('Double')}
                                className="flex-1 min-w-[80px] bg-yellow-600 hover:bg-yellow-500 py-2.5 rounded-lg font-bold text-white transition-colors"
                            >
                                Double
                            </button>
                            <button
                                onClick={() => handleAction('Surrender')}
                                className="flex-1 min-w-[80px] bg-neutral-600 hover:bg-neutral-500 py-2.5 rounded-lg font-bold text-white transition-colors"
                            >
                                Surrender
                            </button>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / lesson.steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
