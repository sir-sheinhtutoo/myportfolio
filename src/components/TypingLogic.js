import { useEffect } from 'react';
import { useAppContext, ACTIONS } from '../store';
import { getMyanmarChar, isStackingKey, handleStacking, getNextChar, findKeyForChar, convertToTypingOrder } from '../utils/myanmar3';

const TypingLogic = () => {
  const { state, dispatch } = useAppContext();
  const { isLessonActive, targetText, currentPosition, isShiftPressed, isStackingMode } = state;

  useEffect(() => {
    if (!isLessonActive) return;

    const handleKeyDown = (event) => {
      const key = event.key;
      
      // Handle special keys
      if (key === 'Shift') {
        dispatch({ type: ACTIONS.SET_SHIFT_PRESSED, payload: true });
        return;
      }

      // Prevent default for typing keys
      if (key.length === 1 || key === 'Backspace' || key === 'Enter') {
        event.preventDefault();
      }

      // Handle Shift+F for stacking
      if (key.toLowerCase() === 'f' && event.shiftKey) {
        dispatch({ type: ACTIONS.SET_STACKING_MODE, payload: !isStackingMode });
        return;
      }

      // Handle backspace (optional - for now we'll disable it to enforce proper typing)
      if (key === 'Backspace') {
        // Could implement backspace logic here if needed
        return;
      }

      // Don't process input if there's an error, unless it's the correct character
      if (state.hasError) {
        // Allow typing the correct character to clear the error
        const myanmarChar = getMyanmarChar(key, isShiftPressed);
        const expectedChar = getNextChar(targetText, currentPosition);
        
        if (myanmarChar === expectedChar) {
          // Clear error and continue processing
          dispatch({ type: ACTIONS.CLEAR_ERROR });
        } else {
          // Still wrong, don't process
          return;
        }
      }

      // Handle regular character input
      if (key.length === 1) {
        const myanmarChar = getMyanmarChar(key, isShiftPressed);
        const expectedChar = getNextChar(targetText, currentPosition);
        
        // Debug logging
        console.log('=== TYPING DEBUG ===');
        console.log('Key pressed:', key);
        console.log('Shift pressed:', isShiftPressed);
        console.log('Myanmar char produced:', myanmarChar);
        console.log('Expected char:', expectedChar);
        console.log('Target text:', targetText);
        console.log('Current position:', currentPosition);
        console.log('Has error:', state.hasError);
        
        if (!expectedChar) {
          // Lesson complete
          dispatch({ type: ACTIONS.END_LESSON });
          return;
        }

        // Handle stacking logic
        let finalChar = myanmarChar;
        if (isStackingMode && !isStackingKey(key.toLowerCase())) {
          finalChar = handleStacking('', myanmarChar, true).slice(1); // Remove empty string prefix
        }

        // Check if character is correct
        const isCorrect = finalChar === expectedChar;
        
        console.log('Final char:', finalChar);
        console.log('Is correct:', isCorrect);
        console.log('==================');

        // If there's an error and user types correct character, clear error first
        if (state.hasError && isCorrect) {
          dispatch({ type: ACTIONS.CLEAR_ERROR });
        }

        // Dispatch typing action
        dispatch({
          type: ACTIONS.TYPE_CHARACTER,
          payload: { character: finalChar, isCorrect }
        });

        // Reset stacking mode after use
        if (isStackingMode && !isStackingKey(key.toLowerCase())) {
          dispatch({ type: ACTIONS.SET_STACKING_MODE, payload: false });
        }

        // Check if lesson is complete (use typing order length)
        const typingOrderLength = convertToTypingOrder(targetText).length;
        if (currentPosition + 1 >= typingOrderLength) {
          setTimeout(() => {
            dispatch({ type: ACTIONS.END_LESSON });
            // Complete the repetition
            dispatch({ 
              type: ACTIONS.COMPLETE_LESSON_REPETITION, 
              payload: { lessonId: state.currentLesson.id } 
            });
          }, 100);
        }
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        dispatch({ type: ACTIONS.SET_SHIFT_PRESSED, payload: false });
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLessonActive, targetText, currentPosition, isShiftPressed, isStackingMode, dispatch, state.currentLesson, state.hasError]);

  // Update next key highlight
  useEffect(() => {
    if (!isLessonActive || !targetText) return;

    const nextChar = getNextChar(targetText, currentPosition);
    if (nextChar) {
      const keyInfo = findKeyForChar(nextChar);
      dispatch({ type: ACTIONS.SET_NEXT_KEY, payload: keyInfo });
    } else {
      dispatch({ type: ACTIONS.SET_NEXT_KEY, payload: null });
    }
  }, [isLessonActive, targetText, currentPosition, dispatch]);

  return null; // This component only handles logic, no UI
};

export default TypingLogic;
