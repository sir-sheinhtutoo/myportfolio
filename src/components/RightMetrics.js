import React from 'react';
import { useAppContext } from '../store';

const RightMetrics = () => {
  const { state } = useAppContext();
  const { startTime, errorRate, isLessonActive } = state;

  const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Accuracy & Time</h3>
        {isLessonActive && (
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Accuracy */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="text-green-400 text-xs font-medium">Accuracy</div>
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(100 - errorRate)}
            </div>
            <div className="text-green-300 text-xs">%</div>
          </div>
        </div>

        {/* Time */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="text-purple-400 text-xs font-medium">Time</div>
              <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-purple-300 text-xs">elapsed</div>
          </div>
        </div>

        {/* Accuracy Target */}
        {state.currentLesson && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Accuracy Target</span>
              <span className="text-white">{Math.round(state.currentLesson.accuracyTarget * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((100 - errorRate) / (state.currentLesson.accuracyTarget * 100)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightMetrics;
