import React from 'react';
import { AppProvider } from './store';
import TypingPanel from './components/TypingPanel';
import VirtualKeyboard from './components/VirtualKeyboard';
import LeftMetrics from './components/LeftMetrics';
import RightMetrics from './components/RightMetrics';
import LessonPicker from './components/LessonPicker';
import ResultModal from './components/ResultModal';
import LevelCompleteModal from './components/LevelCompleteModal';
import TypingLogic from './components/TypingLogic';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className="glass-panel border-b-0 rounded-none sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Myanmar Typing Tutor
                </h1>
                <p className="text-gray-300 text-sm sm:text-base mt-2 myanmar-text">
                  Master Myanmar3 keyboard layout with Pyidaungsu font
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Version</div>
                  <div className="text-sm font-semibold text-white">1.0.0</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative">
          {/* Left Metrics - Fixed Position */}
          <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 w-48 hidden xl:block">
            <LeftMetrics />
          </div>

          {/* Right Metrics - Fixed Position */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 w-48 hidden xl:block">
            <RightMetrics />
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              <LessonPicker />
              <TypingPanel />
              <VirtualKeyboard />
              
              {/* Mobile Metrics - Show on smaller screens */}
              <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LeftMetrics />
                <RightMetrics />
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="glass-panel border-t-0 rounded-none mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm sm:text-base myanmar-text">
                Practice Myanmar typing with Myanmar3 keyboard layout
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Use <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift+F</kbd> for stacked consonants • Focus and start typing
              </p>
            </div>
          </div>
        </footer>

        {/* Components */}
        <TypingLogic />
        <ResultModal />
        <LevelCompleteModal />
      </div>
    </AppProvider>
  );
}

export default App;
