import React, { useEffect } from 'react';
import { useAppContext, ACTIONS } from '../store';
import { calculateWPM, calculateErrorRate } from '../utils/myanmar3';

const LeftMetrics = () => {
  const { state, dispatch } = useAppContext();
  const { startTime, typedText, mistakes, wpm, isLessonActive } = state;

  useEffect(() => {
    if (!isLessonActive || !startTime) return;

    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
      const typedChars = typedText.length;
      
      const newWpm = calculateWPM(typedChars, mistakes, elapsedMinutes);
      const newErrorRate = calculateErrorRate(mistakes, typedChars);

      dispatch({
        type: ACTIONS.UPDATE_METRICS,
        payload: { wpm: newWpm, errorRate: newErrorRate }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLessonActive, startTime, typedText.length, mistakes, dispatch]);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Speed & Errors</h3>
        {isLessonActive && (
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Speed */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="text-blue-400 text-xs font-medium">Speed</div>
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {wpm}
            </div>
            <div className="text-blue-300 text-xs">WPM</div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="text-red-400 text-xs font-medium">Errors</div>
              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {mistakes}
            </div>
            <div className="text-red-300 text-xs">mistakes</div>
          </div>
        </div>

        {/* Speed Target */}
        {state.currentLesson && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Speed Target</span>
              <span className="text-white">{state.currentLesson.speedTargetWpm} WPM</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((wpm / state.currentLesson.speedTargetWpm) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftMetrics;
