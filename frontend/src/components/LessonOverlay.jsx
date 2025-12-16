import React from 'react';
import { useLessonStore } from '../lib/lessonStore';
import { LESSONS } from '../lib/lessons';
import { useStore } from '../lib/store';
import { Action } from '../lib/engine';

export default function LessonOverlay() {
    const { activeLessonId, currentStepIndex, nextStep, quitLesson } = useLessonStore();
    const { dispatchAction } = useStore();
    
    if (!activeLessonId) return null;
    
    const lesson = LESSONS[activeLessonId];
    const step = lesson.steps[currentStepIndex];
    
    if (!step) return null;

    const handleAction = (userAction) => {
        // If step requires specific action
        if (step.type === 'action') {
            if (userAction === step.instruction || step.instruction === userAction) {
                // Correct
                dispatchAction(step.instruction === 'Hit' ? Action.HIT : Action.STAND); // Map string to Action enum if needed
                // Wait a bit then next
                setTimeout(nextStep, 1000);
            } else {
                // Wrong
                alert(`Try again! The correct move is ${step.instruction}`);
            }
        }
    };

    const handleQuiz = (option) => {
        if (option === step.answer) {
             nextStep();
        } else {
            alert("Incorrect, try again.");
        }
    };

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end pb-32 md:pb-8 items-center">
            {/* Dark overlay with hole punch? No, just a floating panel for now */}
            
            <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur border border-emerald-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                            Lesson: {lesson.title}
                        </div>
                        <div className="text-neutral-400 text-xs">
                            Step {currentStepIndex + 1} of {lesson.steps.length}
                        </div>
                    </div>
                    <button onClick={quitLesson} className="text-neutral-500 hover:text-white text-sm">
                        Exit
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                    {step.type === 'quiz' ? step.question : step.text}
                </h3>
                
                {step.type === 'info' && (
                    <button 
                        onClick={nextStep}
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                )}
                
                {step.type === 'quiz' && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {step.options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => handleQuiz(opt)}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg border border-neutral-700 transition-colors"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                
                {step.type === 'action' && (
                    <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
                        <p className="text-sm text-emerald-200">
                            Perform the action: <strong className="text-white">{step.instruction}</strong> using the game controls below.
                        </p>
                        {/* We rely on global controls, but we intercept via store? 
                            Actually, Controls component dispatches to store directly.
                            We need to intercept or listen.
                            
                            Alternative: We add buttons here for the lesson.
                        */}
                         <div className="flex gap-2 mt-3">
                            <button onClick={() => handleAction('Hit')} className="flex-1 bg-green-600 py-2 rounded font-bold text-white">Hit</button>
                            <button onClick={() => handleAction('Stand')} className="flex-1 bg-red-600 py-2 rounded font-bold text-white">Stand</button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}
