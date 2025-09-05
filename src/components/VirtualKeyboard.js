import React from 'react';
import { useAppContext } from '../store';
import { KEYBOARD_ROWS, MYANMAR3_LAYOUT, findKeyForChar, getNextChar } from '../utils/myanmar3';

const VirtualKeyboard = () => {
  const { state } = useAppContext();
  const { targetText, currentPosition, isShiftPressed } = state;

  const getNextExpectedKey = () => {
    const nextChar = getNextChar(targetText, currentPosition);
    if (!nextChar) return null;
    return findKeyForChar(nextChar);
  };

  const expectedKey = getNextExpectedKey();

  // Virtual keyboard is now visual only - no click handlers needed

  const renderKey = (key) => {
    const mapping = MYANMAR3_LAYOUT[key];
    if (!mapping) return null;

    const isNextKey = expectedKey && expectedKey.key === key;
    const isShiftKey = key === 'Shift';
    
    let keyClasses = 'relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 min-h-[3.5rem] px-3 text-sm font-medium shadow-lg ';
    
    if (isNextKey) {
      keyClasses += 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 shadow-green-500/50 scale-105 ';
    } else if (isShiftPressed && !isShiftKey) {
      keyClasses += 'bg-white/10 text-gray-300 border-white/20 ';
    } else {
      keyClasses += 'bg-white/5 text-gray-200 border-white/10 ';
    }

    const displayChar = isShiftPressed ? mapping.shift : mapping.normal;
    const altChar = isShiftPressed ? mapping.normal : mapping.shift;

    return (
      <div 
        key={key} 
        className={keyClasses}
      >
        <div className="text-lg myanmar-text font-semibold">
          {displayChar}
        </div>
        {altChar !== displayChar && (
          <div className="text-xs text-gray-400 myanmar-text mt-1">
            {altChar}
          </div>
        )}
        {isNextKey && expectedKey.needsShift && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs text-white font-bold">⇧</span>
          </div>
        )}
      </div>
    );
  };

  const renderSpecialKey = (label, width = 'auto') => {
    const isShiftKey = label === 'Shift';
    const isPressed = isShiftKey && isShiftPressed;
    const needsShiftHighlight = expectedKey && expectedKey.needsShift && isShiftKey;
    
    let keyClasses = `flex items-center justify-center rounded-xl border transition-all duration-200 min-h-[3.5rem] px-4 text-sm font-medium shadow-lg `;
    
    if (needsShiftHighlight) {
      keyClasses += 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 shadow-green-500/50 scale-105 ';
    } else if (isPressed) {
      keyClasses += 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-500/50 ';
    } else {
      keyClasses += 'bg-white/5 text-gray-200 border-white/10 ';
    }

    return (
      <div 
        className={keyClasses} 
        style={{ width }}
      >
        <span className="font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Myanmar3 Virtual Keyboard</h3>
          <p className="text-gray-400 text-sm">Visual guide for key positions</p>
        </div>
        {expectedKey && (
          <div className="flex items-center space-x-3 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-green-400 text-sm font-medium">
              Next: <span className="font-bold text-white">{expectedKey.key.toUpperCase()}</span>
              {expectedKey.needsShift && <span className="ml-2 text-orange-400 text-xs">(+ Shift)</span>}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-3 select-none">
        {/* Row 1 - Numbers */}
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
          {KEYBOARD_ROWS[0].map(key => renderKey(key))}
        </div>

        {/* Row 2 - QWERTY */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1.5fr repeat(12, 1fr) 1.5fr' }}>
          {renderSpecialKey('Tab')}
          {KEYBOARD_ROWS[1].map(key => renderKey(key))}
          {renderSpecialKey('\\')}
        </div>

        {/* Row 3 - ASDF */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1.75fr repeat(11, 1fr) 2.25fr' }}>
          {renderSpecialKey('Caps')}
          {KEYBOARD_ROWS[2].map(key => renderKey(key))}
          {renderSpecialKey('Enter')}
        </div>

        {/* Row 4 - ZXCV */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '2.25fr repeat(10, 1fr) 2.75fr' }}>
          {renderSpecialKey('Shift')}
          {KEYBOARD_ROWS[3].map(key => renderKey(key))}
          {renderSpecialKey('Shift')}
        </div>

        {/* Row 5 - Space */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1.25fr 1fr 1.25fr 6fr 1.25fr 1fr 1fr 1.25fr' }}>
          {renderSpecialKey('Ctrl')}
          {renderSpecialKey('Win')}
          {renderSpecialKey('Alt')}
          {renderKey(' ')}
          {renderSpecialKey('Alt')}
          {renderSpecialKey('Win')}
          {renderSpecialKey('Menu')}
          {renderSpecialKey('Ctrl')}
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
