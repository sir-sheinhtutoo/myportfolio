import React, { useEffect } from 'react';
import { useAppContext, ACTIONS } from '../store';

const ResultModal = () => {
  const { state, dispatch } = useAppContext();
  const { showResultModal, wpm, errorRate, mistakes, typedText, currentLesson, currentRepetition, maxRepetitions, lessons, selectedLevel } = state;

  const accuracy = 100 - errorRate;
  const totalCharacters = typedText.length;
  const correctCharacters = totalCharacters - mistakes;

  const handleClose = () => {
    dispatch({ type: ACTIONS.HIDE_RESULT_MODAL });
    dispatch({ type: ACTIONS.RESET_TYPING_STATE });
  };

  const handleRetry = () => {
    dispatch({ type: ACTIONS.HIDE_RESULT_MODAL });
    dispatch({ type: ACTIONS.START_LESSON });
  };

  const handleNextAction = () => {
    dispatch({ type: ACTIONS.HIDE_RESULT_MODAL });
    
    const safeCurrentRepetition = Math.min(currentRepetition || 0, maxRepetitions || 5);
    
    if (safeCurrentRepetition >= (maxRepetitions || 5)) {
      // Find next lesson
      const currentLevelLessons = (lessons || []).filter(lesson => lesson.level === selectedLevel);
      const currentIndex = currentLevelLessons.findIndex(lesson => lesson.id === currentLesson?.id);
      
      if (currentIndex < currentLevelLessons.length - 1) {
        // Move to next lesson in same level
        const nextLesson = currentLevelLessons[currentIndex + 1];
        dispatch({ 
          type: ACTIONS.ADVANCE_TO_NEXT_LESSON, 
          payload: { nextLesson, isLevelComplete: false } 
        });
        dispatch({ type: ACTIONS.START_LESSON });
      } else {
        // Level complete - check if should advance to intermediate
        if (selectedLevel === 'beginner') {
          dispatch({ type: ACTIONS.SHOW_LEVEL_COMPLETE_MODAL });
        } else {
          dispatch({ type: ACTIONS.RESET_TYPING_STATE });
        }
      }
    } else {
      // Continue with same lesson
      dispatch({ type: ACTIONS.START_LESSON });
    }
  };

  const getPerformanceLevel = () => {
    if (!currentLesson) return { level: 'Good', color: 'blue' };
    
    const speedTarget = currentLesson.speedTargetWpm;
    const accuracyTarget = currentLesson.accuracyTarget * 100;
    
    const speedAchieved = wpm >= speedTarget;
    const accuracyAchieved = accuracy >= accuracyTarget;
    
    if (speedAchieved && accuracyAchieved) {
      return { level: 'Excellent', color: 'green' };
    } else if (speedAchieved || accuracyAchieved) {
      return { level: 'Good', color: 'yellow' };
    } else {
      return { level: 'Needs Practice', color: 'red' };
    }
  };

  const performance = getPerformanceLevel();

  // Auto-continue after 3 seconds
  useEffect(() => {
    if (!showResultModal) return;
    
    const timer = setTimeout(() => {
      handleNextAction();
    }, 3000);

    return () => clearTimeout(timer);
  }, [showResultModal]);

  if (!showResultModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Lesson Complete!</h2>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            performance.color === 'green' ? 'bg-green-500/20 text-green-400' :
            performance.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
            performance.color === 'red' ? 'bg-red-500/20 text-red-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {performance.level}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-blue-400 text-sm mb-1">Speed</div>
            <div className="text-2xl font-bold text-white">{wpm}</div>
            <div className="text-blue-300 text-xs">WPM</div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-green-400 text-sm mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-white">{accuracy.toFixed(1)}</div>
            <div className="text-green-300 text-xs">%</div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-purple-400 text-sm mb-1">Characters</div>
            <div className="text-2xl font-bold text-white">{correctCharacters}</div>
            <div className="text-purple-300 text-xs">correct</div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-red-400 text-sm mb-1">Errors</div>
            <div className="text-2xl font-bold text-white">{mistakes}</div>
            <div className="text-red-300 text-xs">mistakes</div>
          </div>
        </div>

        {/* Target Comparison */}
        {currentLesson && (
          <div className="bg-neutral-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 text-center">Target vs Achievement</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Speed Target:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">{currentLesson.speedTargetWpm} WPM</span>
                  {wpm >= currentLesson.speedTargetWpm ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accuracy Target:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">{Math.round(currentLesson.accuracyTarget * 100)}%</span>
                  {accuracy >= currentLesson.accuracyTarget * 100 ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Repetition Progress */}
        <div className="bg-neutral-800/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Lesson Progress</span>
            <span className="text-white font-semibold">{currentRepetition || 0}/{maxRepetitions || 5}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentRepetition || 0) / (maxRepetitions || 5)) * 100}%` }}
            />
          </div>
        </div>

        {/* Auto-continue message */}
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm">
            {(currentRepetition || 0) < (maxRepetitions || 5) ? 
              `Starting repetition ${(currentRepetition || 0) + 1}/${maxRepetitions || 5} in 3 seconds...` :
              'Moving to next lesson in 3 seconds...'
            }
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
