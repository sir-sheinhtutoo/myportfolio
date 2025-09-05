import React, { useEffect } from 'react';
import { useAppContext, ACTIONS } from '../store';
import { calculateWPM, calculateErrorRate } from '../utils/myanmar3';

const Metrics = () => {
  const { state, dispatch } = useAppContext();
  const { startTime, typedText, mistakes, wpm, errorRate, isLessonActive } = state;

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

  const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Live Metrics</h3>
        {isLessonActive && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Recording</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Speed */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-400 text-sm font-medium">Speed</div>
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {wpm}
            </div>
            <div className="text-blue-300 text-xs">WPM</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-400 text-sm font-medium">Accuracy</div>
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {Math.round(100 - errorRate)}
            </div>
            <div className="text-green-300 text-xs">%</div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-red-400 text-sm font-medium">Errors</div>
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {mistakes}
            </div>
            <div className="text-red-300 text-xs">mistakes</div>
          </div>
        </div>

        {/* Time */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-purple-400 text-sm font-medium">Time</div>
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-purple-300 text-xs">elapsed</div>
          </div>
        </div>
      </div>

      {/* Target Comparison */}
      {state.currentLesson && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-300">Target vs Current</h4>
          
          {/* Speed Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Speed Target</span>
              <span className="text-white">{state.currentLesson.speedTargetWpm} WPM</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((wpm / state.currentLesson.speedTargetWpm) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Accuracy Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Accuracy Target</span>
              <span className="text-white">{Math.round(state.currentLesson.accuracyTarget * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((100 - errorRate) / (state.currentLesson.accuracyTarget * 100)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metrics;
