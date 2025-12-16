import { create } from 'zustand';
import { LESSONS, LESSON_PREREQUISITES } from './lessons';
import { useStore } from './store'; // Main game store
import { updateProgress } from './api';

export const useLessonStore = create((set, get) => ({
    activeLessonId: null,
    currentStepIndex: 0,
    isLessonActive: false,
    completedLessons: [], // IDs of completed lessons

    // Check if lesson can be started (prerequisites met)
    canStartLesson: (lessonId) => {
        const { completedLessons } = get();
        const prerequisites = LESSON_PREREQUISITES[lessonId] || [];
        return prerequisites.every(prereq => completedLessons.includes(prereq));
    },

    startLesson: (lessonId) => {
        const lesson = LESSONS[lessonId];
        if (!lesson) return;

        // Check prerequisites
        if (!get().canStartLesson(lessonId)) {
            console.warn(`Cannot start lesson ${lessonId}: prerequisites not met`);
            return false;
        }

        set({
            activeLessonId: lessonId,
            currentStepIndex: 0,
            isLessonActive: true
        });

        // Setup first step
        get().setupStep(0);
        return true;
    },
    
    setupStep: (index) => {
        const { activeLessonId } = get();
        const lesson = LESSONS[activeLessonId];
        if (!lesson || index >= lesson.steps.length) {
            // Lesson Complete
            get().completeLesson();
            return;
        }
        
        const step = lesson.steps[index];
        const gameStore = useStore.getState();
        
        // Inject Scenario if present
        if (step.scenario) {
            gameStore.engine.setScenario(step.scenario);
            useStore.setState({ gameState: gameStore.engine.getState() });
        }
    },
    
    nextStep: () => {
        const { currentStepIndex } = get();
        const nextIndex = currentStepIndex + 1;
        set({ currentStepIndex: nextIndex });
        get().setupStep(nextIndex);
    },
    
    completeLesson: async () => {
        const { activeLessonId, completedLessons } = get();
        const newCompleted = [...new Set([...completedLessons, activeLessonId])];

        set({
            isLessonActive: false,
            activeLessonId: null,
            completedLessons: newCompleted
        });

        // Sync to main store for progression gating
        useStore.getState().completeLesson(activeLessonId);

        // Sync to backend
        try {
            const user = useStore.getState().user;
            if (user) {
                // We construct the progress object.
                // Simple map: lessonId -> true
                const progress = newCompleted.reduce((acc, id) => ({...acc, [id]: true}), {});
                await updateProgress(progress);

                // Update local user object
                useStore.setState(state => ({
                    user: { ...state.user, lesson_progress: progress }
                }));
            }
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    },
    
    quitLesson: () => {
        set({ isLessonActive: false, activeLessonId: null });
        // Reset game?
        useStore.getState().deal(10); // Deal new random hand to reset
    },
    
    setCompletedFromUser: (progressMap) => {
        if (!progressMap) return;
        const completed = Object.keys(progressMap);
        set({ completedLessons: completed });

        // Sync each to main store for progression gating
        completed.forEach(lessonId => {
            useStore.getState().completeLesson(lessonId);
        });
    }
}));
