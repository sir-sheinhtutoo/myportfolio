import React from 'react';
import { useAppContext, ACTIONS } from '../store';

const LevelCompleteModal = () => {
  const { state, dispatch } = useAppContext();
  const { showLevelCompleteModal } = state;

  if (!showLevelCompleteModal) return null;

  const handleAdvanceToIntermediate = () => {
    dispatch({ type: ACTIONS.HIDE_LEVEL_COMPLETE_MODAL });
    dispatch({ type: ACTIONS.SET_SELECTED_LEVEL, payload: 'intermediate' });
    dispatch({ type: ACTIONS.RESET_TYPING_STATE });
  };

  const handleStayBeginner = () => {
    dispatch({ type: ACTIONS.HIDE_LEVEL_COMPLETE_MODAL });
    dispatch({ type: ACTIONS.RESET_TYPING_STATE });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
          <p className="text-gray-300">You've completed all Beginner lessons!</p>
        </div>

        {/* Achievement Stats */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="text-green-400 text-sm mb-2">Level Complete</div>
            <div className="text-3xl font-bold text-white mb-2">Beginner</div>
            <div className="text-gray-300 text-sm">
              All lessons completed 5 times each
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3 text-center">What's Next?</h3>
          <div className="space-y-3">
            <div className="bg-neutral-800/50 rounded-lg p-3">
              <div className="text-blue-400 font-medium">Intermediate Level</div>
              <div className="text-gray-300 text-sm">
                Advanced Myanmar typing with complex words and sentences
              </div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-3">
              <div className="text-purple-400 font-medium">Continue Practice</div>
              <div className="text-gray-300 text-sm">
                Keep practicing Beginner lessons to improve speed and accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAdvanceToIntermediate}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Start Intermediate
          </button>
          <button
            onClick={handleStayBeginner}
            className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-xl transition-colors"
          >
            Stay in Beginner
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteModal;
