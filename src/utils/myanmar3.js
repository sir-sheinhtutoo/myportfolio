// Myanmar3 Keyboard Layout Mapping (Based on reference image)
export const MYANMAR3_LAYOUT = {
  // Row 1 (Numbers)
  '`': { normal: 'ၐ', shift: 'ဎ' },
  '1': { normal: '၁', shift: 'ဍ' },
  '2': { normal: '၂', shift: 'ၒ' },
  '3': { normal: '၃', shift: 'ဋ' },
  '4': { normal: '၄', shift: 'ၓ' },
  '5': { normal: '၅', shift: 'ၔ' },
  '6': { normal: '၆', shift: 'ၕ' },
  '7': { normal: '၇', shift: 'ရ' },
  '8': { normal: '၈', shift: '*' },
  '9': { normal: '၉', shift: '(' },
  '0': { normal: '၀', shift: ')' },
  '-': { normal: '-', shift: '_' },
  '=': { normal: '=', shift: '+' },

  // Row 2 (QWERTY) - Based on reference image
  'q': { normal: 'ဆ', shift: 'ဈ' },
  'w': { normal: 'တ', shift: 'ဝ' },
  'e': { normal: 'န', shift: 'ဣ' },
  'r': { normal: 'မ', shift: '၎င်း' },
  't': { normal: 'အ', shift: 'ဤ' },
  'y': { normal: 'ပ', shift: '၌' },
  'u': { normal: 'က', shift: 'ဥ' },
  'i': { normal: 'င', shift: '၍' },
  'o': { normal: 'သ', shift: 'ဿ' },
  'p': { normal: 'စ', shift: 'ဏ' },
  '[': { normal: 'ဟ', shift: 'ဧ' },
  ']': { normal: 'ဩ', shift: 'ဪ' },
  '\\': { normal: '၏', shift: 'ၑ' },

  // Row 3 (ASDF) - Corrected based on reference image
  'a': { normal: 'ေ', shift: 'ဗ' },
  's': { normal: 'ျ', shift: 'ှ' },
  'd': { normal: 'ိ', shift: 'ီ' },
  'f': { normal: '်', shift: '္' },
  'g': { normal: 'ါ', shift: 'ွ' },
  'h': { normal: '့', shift: 'ံ' },
  'j': { normal: 'ြ', shift: 'ဲ' },
  'k': { normal: 'ု', shift: 'ဒ' },
  'l': { normal: 'ူ', shift: 'ဓ' },
  ';': { normal: 'း', shift: 'ဂ' },
  "'": { normal: "'", shift: '"' },

  // Row 4 (ZXCV) - Corrected based on reference image
  'z': { normal: 'ဖ', shift: 'ဇ' },
  'x': { normal: 'ထ', shift: 'ဌ' },
  'c': { normal: 'ခ', shift: 'ဃ' },
  'v': { normal: 'လ', shift: 'ဠ' },
  'b': { normal: 'ဘ', shift: 'ယ' },
  'n': { normal: 'ည', shift: 'ဉ' },
  'm': { normal: 'ာ', shift: 'ဦ' },
  ',': { normal: ',', shift: '၊' },
  '.': { normal: '.', shift: '။' },
  '/': { normal: '/', shift: '?' },

  // Space
  ' ': { normal: ' ', shift: ' ' }
};

// Physical keyboard layout for display
export const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

// Get Myanmar character for a key press
export const getMyanmarChar = (key, isShift = false) => {
  const mapping = MYANMAR3_LAYOUT[key.toLowerCase()];
  if (!mapping) return key;
  return isShift ? mapping.shift : mapping.normal;
};

// Check if key requires Shift+F stacking rule
export const isStackingKey = (key) => {
  return key.toLowerCase() === 'f';
};

// Handle stacking consonants (Shift+F rule)
export const handleStacking = (currentText, newChar, isStackingMode) => {
  if (isStackingMode && newChar !== '္') {
    // Add stacking mark before the consonant
    return currentText + '္' + newChar;
  }
  return currentText + newChar;
};

// Convert visual order to logical typing order for Myanmar text
export const convertToTypingOrder = (text) => {
  // Myanmar typing follows visual order, not logical order
  // The issue is that we shouldn't reorder characters for typing
  // Users type exactly what they see: န-ေ-က-ေ-ာ-င-်-း-လ-ာ-း
  return text;
};

// Convert text to proper visual display order for Pyidaungsu font
export const convertToDisplayOrder = (text) => {
  // Normalize Myanmar Unicode for proper rendering
  // Apply NFC normalization to combine characters properly
  if (typeof text.normalize === 'function') {
    return text.normalize('NFC');
  }
  return text;
};

// Get next expected character from target text
export const getNextChar = (targetText, currentPosition) => {
  if (currentPosition >= targetText.length) return null;
  // Convert to typing order to get the correct character sequence for input
  const typingOrderText = convertToTypingOrder(targetText);
  return typingOrderText[currentPosition];
};

// Find which key produces the target character
export const findKeyForChar = (targetChar, isShift = false) => {
  for (const [key, mapping] of Object.entries(MYANMAR3_LAYOUT)) {
    if (isShift && mapping.shift === targetChar) {
      return { key, needsShift: true };
    }
    if (!isShift && mapping.normal === targetChar) {
      return { key, needsShift: false };
    }
    if (mapping.normal === targetChar) {
      return { key, needsShift: false };
    }
    if (mapping.shift === targetChar) {
      return { key, needsShift: true };
    }
  }
  return null;
};

// Calculate typing metrics
export const calculateWPM = (typedChars, mistakes, elapsedMinutes) => {
  if (elapsedMinutes === 0) return 0;
  return Math.round(((typedChars - mistakes) / 5) / elapsedMinutes);
};

export const calculateErrorRate = (mistakes, totalTyped) => {
  if (totalTyped === 0) return 0;
  return Math.round((mistakes / totalTyped) * 100);
};

// Format metrics display
export const formatMetrics = (wpm, errorRate) => {
  const formattedWPM = wpm.toString().padStart(3, '0');
  const formattedError = errorRate.toString().padStart(2, '0');
  return `${formattedWPM} WPM, ${formattedError}%`;
};
