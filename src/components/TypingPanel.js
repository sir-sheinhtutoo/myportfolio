import React from 'react';
import { useAppContext } from '../store';
import { convertToDisplayOrder } from '../utils/myanmar3';

const TypingPanel = () => {
  const { state } = useAppContext();
  const { targetText, typedText, currentPosition, hasError, errorMessage } = state;

  const renderLessonText = () => {
    if (!targetText) return null;

    const normalizedText = convertToDisplayOrder(targetText);
    return (
      <span className="myanmar-text text-white">
        {normalizedText}
      </span>
    );
  };

  const renderTypedText = () => {
    if (!targetText || !typedText) return null;
    
    const normalizedText = convertToDisplayOrder(typedText);
    return (
      <span className="myanmar-text text-white">
        {normalizedText}
      </span>
    );
  };


  return (
    <div className="space-y-6">
      {/* Lesson Display Box (View Only) - Always visible */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {state.currentLesson?.title || 'Select a lesson to start'}
          </h2>
          <div className="flex items-center space-x-4">
            {state.currentLesson && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Repetition</div>
                <div className="text-sm font-semibold text-white">
                  {state.currentRepetition || 0}/{state.maxRepetitions || 5}
                </div>
              </div>
            )}
            {state.isLessonActive && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Progress</div>
                <div className="text-sm font-semibold text-white">
                  {Math.round((currentPosition / targetText.length) * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
          <h3 className="text-lg font-semibold text-white">Lesson Text</h3>
          <span className="ml-2 text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">View Only</span>
        </div>
        
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 min-h-[120px] border border-white/5">
          <div className="text-xl sm:text-2xl lg:text-3xl leading-relaxed tracking-wide myanmar-text text-white">
            {targetText ? renderLessonText() : (
              <div className="text-gray-400 text-center py-8 flex flex-col items-center">
                <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-base font-medium">Choose a lesson and click Start</p>
                <p className="text-xs text-gray-500 mt-1">Begin your Myanmar typing practice</p>
              </div>
            )}
          </div>
          
          {/* Typing Guide for မင်္ဂလာပါ */}
          {targetText === "မင်္ဂလာပါ" && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-sm text-blue-300 mb-2">Typing Guide for "မင်္ဂလာပါ":</div>
              <div className="text-xs text-gray-300 font-mono">
                r → မ, i → င, f → ်, Shift+f → ္, Shift+; → ဂ, v → လ, m → ာ, y → ပ, g → ါ
              </div>
            </div>
          )}
        </div>

        {state.isLessonActive && (
          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="text-gray-400">
                Characters: <span className="text-white font-medium">{currentPosition}</span>/<span className="text-gray-300">{targetText.length}</span>
              </div>
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentPosition / targetText.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Typing Input Box */}
      {state.isLessonActive && (
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-white">Your Typing</h3>
            <span className="ml-2 text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">Type Here</span>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 min-h-[120px] border border-green-500/20 focus-within:border-green-400/40 transition-colors">
            {hasError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-red-400 text-xl">❌ {errorMessage}</div>
              </div>
            ) : (
              <div className="text-xl sm:text-2xl lg:text-3xl leading-relaxed tracking-wide myanmar-text text-white">
                {typedText ? (
                  <div className="flex flex-wrap">
                    {renderTypedText()}
                    <span className="w-0.5 h-8 bg-green-400 animate-pulse ml-1"></span>
                  </div>
                ) : (
                  <div className="text-gray-500 flex items-center">
                    <span className="w-0.5 h-8 bg-green-400 animate-pulse mr-2"></span>
                    Start typing to see your progress...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingPanel;
