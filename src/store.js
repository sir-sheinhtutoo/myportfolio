import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  // Lesson state
  currentLesson: null,
  lessons: [],
  isLessonActive: false,
  
  // Lesson progression
  lessonCompletions: {}, // { lessonId: completionCount }
  currentRepetition: 0,
  maxRepetitions: 5,
  
  // Typing state
  targetText: '',
  typedText: '',
  currentPosition: 0,
  mistakes: 0,
  
  // Keyboard state
  isShiftPressed: false,
  isStackingMode: false,
  nextKey: null,
  
  // Metrics
  startTime: null,
  wpm: 0,
  errorRate: 0,
  
  // UI state
  showResultModal: false,
  selectedLevel: 'beginner',
  showLevelCompleteModal: false,
  
  // Error state
  hasError: false,
  errorMessage: ''
};

// Action types
export const ACTIONS = {
  SET_LESSONS: 'SET_LESSONS',
  SET_CURRENT_LESSON: 'SET_CURRENT_LESSON',
  START_LESSON: 'START_LESSON',
  END_LESSON: 'END_LESSON',
  COMPLETE_LESSON_REPETITION: 'COMPLETE_LESSON_REPETITION',
  ADVANCE_TO_NEXT_LESSON: 'ADVANCE_TO_NEXT_LESSON',
  TYPE_CHARACTER: 'TYPE_CHARACTER',
  SET_SHIFT_PRESSED: 'SET_SHIFT_PRESSED',
  SET_STACKING_MODE: 'SET_STACKING_MODE',
  SET_NEXT_KEY: 'SET_NEXT_KEY',
  UPDATE_METRICS: 'UPDATE_METRICS',
  SHOW_RESULT_MODAL: 'SHOW_RESULT_MODAL',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  HIDE_RESULT_MODAL: 'HIDE_RESULT_MODAL',
  SHOW_LEVEL_COMPLETE_MODAL: 'SHOW_LEVEL_COMPLETE_MODAL',
  HIDE_LEVEL_COMPLETE_MODAL: 'HIDE_LEVEL_COMPLETE_MODAL',
  SET_SELECTED_LEVEL: 'SET_SELECTED_LEVEL',
  RESET_TYPING_STATE: 'RESET_TYPING_STATE'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LESSONS:
      return {
        ...state,
        lessons: action.payload
      };

    case ACTIONS.SET_CURRENT_LESSON:
      const lessonId = action.payload?.id;
      const currentCompletions = Math.min(state.lessonCompletions[lessonId] || 0, state.maxRepetitions);
      return {
        ...state,
        currentLesson: action.payload,
        targetText: action.payload ? action.payload.lines.join(' ') : '',
        currentRepetition: currentCompletions
      };

    case ACTIONS.START_LESSON:
      return {
        ...state,
        isLessonActive: true,
        startTime: Date.now(),
        typedText: '',
        currentPosition: 0,
        mistakes: 0,
        wpm: 0,
        errorRate: 0
      };

    case ACTIONS.END_LESSON:
      return {
        ...state,
        isLessonActive: false,
        showResultModal: true
      };

    case ACTIONS.COMPLETE_LESSON_REPETITION:
      const { lessonId: completedLessonId } = action.payload;
      const newCompletions = Math.min((state.lessonCompletions[completedLessonId] || 0) + 1, state.maxRepetitions);
      const updatedCompletions = {
        ...state.lessonCompletions,
        [completedLessonId]: newCompletions
      };
      
      return {
        ...state,
        lessonCompletions: updatedCompletions,
        currentRepetition: newCompletions
      };

    case ACTIONS.ADVANCE_TO_NEXT_LESSON:
      const { nextLesson, isLevelComplete } = action.payload;
      return {
        ...state,
        currentLesson: nextLesson,
        targetText: nextLesson ? nextLesson.lines.join(' ') : '',
        currentRepetition: state.lessonCompletions[nextLesson?.id] || 0,
        showLevelCompleteModal: isLevelComplete
      };

    case ACTIONS.TYPE_CHARACTER:
      const { character, isCorrect } = action.payload;
      
      // Only add character if it's correct
      if (isCorrect) {
        const newTypedText = state.typedText + character;
        const newPosition = state.currentPosition + 1;
        
        return {
          ...state,
          typedText: newTypedText,
          currentPosition: newPosition,
          hasError: false,
          errorMessage: ''
        };
      } else {
        // Wrong input - show error and don't advance
        return {
          ...state,
          hasError: true,
          errorMessage: 'Wrong input',
          mistakes: state.mistakes + 1
        };
      }

    case ACTIONS.SET_SHIFT_PRESSED:
      return {
        ...state,
        isShiftPressed: action.payload
      };

    case ACTIONS.SET_STACKING_MODE:
      return {
        ...state,
        isStackingMode: action.payload
      };

    case ACTIONS.SET_NEXT_KEY:
      return {
        ...state,
        nextKey: action.payload
      };

    case ACTIONS.UPDATE_METRICS:
      return {
        ...state,
        wpm: action.payload.wpm,
        errorRate: action.payload.errorRate
      };

    case ACTIONS.SHOW_RESULT_MODAL:
      return {
        ...state,
        showResultModal: true
      };

    case ACTIONS.HIDE_RESULT_MODAL:
      return {
        ...state,
        showResultModal: false
      };

    case ACTIONS.SHOW_LEVEL_COMPLETE_MODAL:
      return {
        ...state,
        showLevelCompleteModal: true
      };

    case ACTIONS.HIDE_LEVEL_COMPLETE_MODAL:
      return {
        ...state,
        showLevelCompleteModal: false
      };

    case ACTIONS.SET_SELECTED_LEVEL:
      return {
        ...state,
        selectedLevel: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        hasError: true,
        errorMessage: action.payload
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        hasError: false,
        errorMessage: ''
      };

    case ACTIONS.RESET_TYPING_STATE:
      return {
        ...state,
        typedText: '',
        currentPosition: 0,
        mistakes: 0,
        wpm: 0,
        errorRate: 0,
        startTime: null,
        isLessonActive: false,
        isShiftPressed: false,
        isStackingMode: false,
        currentLesson: null,
        targetText: '',
        lessonCompletions: {},
        currentRepetition: 0,
        hasError: false,
        errorMessage: ''
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
