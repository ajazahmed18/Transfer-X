import React, { useRef, useEffect } from 'react';

export const OtpInput = ({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef([]);

  // Ensure digits array has 6 entries
  const digits = Array.from({ length: 6 }, (_, i) => (value && value[i]) || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const updateCode = (newDigits) => {
    // Preserve digits up to the last filled position or empty
    let lastFilledIndex = -1;
    for (let i = 5; i >= 0; i--) {
      if (newDigits[i]) {
        lastFilledIndex = i;
        break;
      }
    }
    const result = lastFilledIndex === -1 ? '' : newDigits.slice(0, lastFilledIndex + 1).map((d) => d || ' ').join('');
    // Remove trailing spaces, keeping internal gaps if any
    const cleanResult = result.trimEnd();
    onChange(cleanResult);
    return cleanResult;
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        updateCode(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = '';
        updateCode(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = e.key;
      const updatedCode = updateCode(newDigits);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      if (updatedCode.replace(/\s/g, '').length === 6 && onComplete) {
        onComplete(updatedCode.replace(/\s/g, ''));
      }
    }
  };

  const handleMultiDigitFill = (clean6Digits) => {
    const formatted = clean6Digits.slice(0, 6);
    onChange(formatted);
    const targetIdx = Math.min(formatted.length, 5);
    inputRefs.current[targetIdx]?.focus();
    if (formatted.length === 6 && onComplete) {
      onComplete(formatted);
    }
  };

  const handleChange = (index, e) => {
    if (disabled) return;
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (!cleanDigits) {
      const newDigits = [...digits];
      newDigits[index] = '';
      updateCode(newDigits);
      return;
    }

    if (cleanDigits.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = cleanDigits;
      const updatedCode = updateCode(newDigits);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      if (updatedCode.replace(/\s/g, '').length === 6 && onComplete) {
        onComplete(updatedCode.replace(/\s/g, ''));
      }
    } else {
      handleMultiDigitFill(cleanDigits.slice(0, 6));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;

    const pastedText = e.clipboardData.getData('text');
    const cleanCode = pastedText.replace(/\D/g, '').slice(0, 6);

    if (cleanCode.length > 0) {
      handleMultiDigitFill(cleanCode);
    }
  };

  return (
    <div id="otp-input-container" className="flex items-center justify-center gap-2 sm:gap-2.5">
      {/* First 3 Digits */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {[0, 1, 2].map((index) => {
          const isFilled = Boolean(digits[index] && digits[index].trim());
          return (
            <input
              key={index}
              id={`otp-box-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[index] && digits[index] !== ' ' ? digits[index] : ''}
              disabled={disabled}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl outline-hidden transition-all ${
                isFilled
                  ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-400 shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300'
              } focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Digit ${index + 1}`}
            />
          );
        })}
      </div>

      {/* Dot Separator */}
      <div className="flex items-center justify-center px-0.5 sm:px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
      </div>

      {/* Second 3 Digits */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {[3, 4, 5].map((index) => {
          const isFilled = Boolean(digits[index] && digits[index].trim());
          return (
            <input
              key={index}
              id={`otp-box-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[index] && digits[index] !== ' ' ? digits[index] : ''}
              disabled={disabled}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl outline-hidden transition-all ${
                isFilled
                  ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-400 shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300'
              } focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Digit ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};
