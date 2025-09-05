import React, { useEffect } from 'react';
import { useAppContext, ACTIONS } from '../store';

const LessonPicker = () => {
  const { state, dispatch } = useAppContext();
  const { lessons, currentLesson, selectedLevel, isLessonActive } = state;

  useEffect(() => {
    // Load all lessons
    const loadLessons = async () => {
      const allLessons = [];
      
      // Load beginner lessons
      for (let i = 1; i <= 5; i++) {
        try {
          const lesson = await import(`../data/lessons/beginner${i}.json`);
          allLessons.push(lesson.default);
        } catch (error) {
          console.error(`Failed to load beginner${i}.json:`, error);
        }
      }
      
      // Load intermediate lessons
      for (let i = 1; i <= 5; i++) {
        try {
          const lesson = await import(`../data/lessons/intermediate${i}.json`);
          allLessons.push(lesson.default);
        } catch (error) {
          console.error(`Failed to load intermediate${i}.json:`, error);
        }
      }
      
      // Load advanced lessons
      for (let i = 1; i <= 5; i++) {
        try {
          const lesson = await import(`../data/lessons/advanced${i}.json`);
          allLessons.push(lesson.default);
        } catch (error) {
          console.error(`Failed to load advanced${i}.json:`, error);
        }
      }
      
      dispatch({ type: ACTIONS.SET_LESSONS, payload: allLessons });
    };

    loadLessons();
  }, [dispatch]);

  const filteredLessons = lessons.filter(lesson => lesson.level === selectedLevel);

  const handleLevelChange = (level) => {
    dispatch({ type: ACTIONS.SET_SELECTED_LEVEL, payload: level });
  };

  const handleLessonSelect = (lesson) => {
    dispatch({ type: ACTIONS.SET_CURRENT_LESSON, payload: lesson });
  };

  const handleStartLesson = () => {
    if (currentLesson) {
      dispatch({ type: ACTIONS.START_LESSON });
    }
  };

  const handleBackToMenu = () => {
    dispatch({ type: ACTIONS.RESET_TYPING_STATE });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Select Lesson</h3>
          <p className="text-gray-400 text-sm">Choose your skill level and practice lesson</p>
        </div>
        {isLessonActive && (
          <button
            onClick={handleBackToMenu}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Menu</span>
          </button>
        )}
      </div>

      {!isLessonActive && (
        <>
          {/* Level Selector */}
          <div className="flex flex-wrap gap-3 mb-8">
            {['beginner', 'intermediate', 'advanced'].map(level => {
              const color = getLevelColor(level);
              const isSelected = selectedLevel === level;
              
              let buttonClasses = 'flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ';
              if (isSelected) {
                if (color === 'green') {
                  buttonClasses += 'bg-green-500/20 border-green-500/50 text-green-400 border shadow-lg shadow-green-500/25';
                } else if (color === 'yellow') {
                  buttonClasses += 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 border shadow-lg shadow-yellow-500/25';
                } else if (color === 'red') {
                  buttonClasses += 'bg-red-500/20 border-red-500/50 text-red-400 border shadow-lg shadow-red-500/25';
                }
              } else {
                buttonClasses += 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20';
              }
              
              return (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={buttonClasses}
                >
                  <span className="text-xl">{getLevelIcon(level)}</span>
                  <span className="capitalize font-semibold">{level}</span>
                </button>
              );
            })}
          </div>

          {/* Lesson Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredLessons.map(lesson => {
              const isSelected = currentLesson?.id === lesson.id;
              const color = getLevelColor(lesson.level);
              
              let cardClasses = 'p-6 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-105 ';
              let badgeClasses = 'text-xs px-3 py-1 rounded-full font-medium ';
              
              if (isSelected) {
                if (color === 'green') {
                  cardClasses += 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/25';
                } else if (color === 'yellow') {
                  cardClasses += 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/25';
                } else if (color === 'red') {
                  cardClasses += 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/25';
                }
              } else {
                cardClasses += 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
              }

              if (color === 'green') {
                badgeClasses += 'bg-green-500/20 text-green-400';
              } else if (color === 'yellow') {
                badgeClasses += 'bg-yellow-500/20 text-yellow-400';
              } else if (color === 'red') {
                badgeClasses += 'bg-red-500/20 text-red-400';
              }
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonSelect(lesson)}
                  className={cardClasses}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-white text-base">{lesson.title}</h4>
                    <span className={badgeClasses}>
                      {lesson.level}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-4">
                    Target: <span className="text-white font-medium">{lesson.speedTargetWpm} WPM</span>, <span className="text-white font-medium">{Math.round(lesson.accuracyTarget * 100)}%</span> accuracy
                  </div>
                  
                  <div className="text-sm myanmar-text text-gray-300 line-clamp-2 leading-relaxed">
                    {lesson.lines[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Button */}
          {currentLesson && (
            <div className="text-center">
              <button
                onClick={handleStartLesson}
                className="btn-primary text-lg px-10 py-4"
              >
                <span>Start Lesson: {currentLesson.title}</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2M7 6h10l2 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V8l2-2z" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Current Lesson Info (when active) */}
      {isLessonActive && currentLesson && (
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-lg mb-1">{currentLesson.title}</h4>
              <div className="text-sm text-gray-400">
                Target: <span className="text-white font-medium">{currentLesson.speedTargetWpm} WPM</span>, <span className="text-white font-medium">{Math.round(currentLesson.accuracyTarget * 100)}%</span> accuracy
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              getLevelColor(currentLesson.level) === 'green' ? 'bg-green-500/20 text-green-400' :
              getLevelColor(currentLesson.level) === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {getLevelIcon(currentLesson.level)} {currentLesson.level}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPicker;
