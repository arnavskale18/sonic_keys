// src/hooks/useTypingTrial.js
import { useState, useCallback, useEffect } from 'react';

const useTypingTrial = (text) => {
    // FIX: Add a guard check for the 'text' prop to ensure it's a string.
    const safeText = (typeof text === 'string' && text) ? text : '';
    const textToType = safeText.replace(/\s+/g, ' ').trim();
    
    const [typedText, setTypedText] = useState('');
    const [errors, setErrors] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, started, finished
    const [wordCount, setWordCount] = useState(0);

    // Filter out complex character errors by normalizing the input text
    const normalizedText = textToType.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); 
    
    // ... (rest of the hook code is the same)

    const isErrorChar = useCallback((index) => {
        // Compare the normalized expected character with the typed character at the index
        return typedText[index] && normalizedText[index] !== typedText[index];
    }, [typedText, normalizedText]);

    const isCorrectChar = useCallback((index) => {
        // Character is correct if it was typed, and it's not an error
        return typedText[index] && !isErrorChar(index);
    }, [typedText, isErrorChar]);

    const calculateWPM = useCallback((typedContent, start) => {
        if (!start) return 0;
        
        const content = typedContent.replace(/[^A-Za-z\s]/g, "");
        const minutes = (Date.now() - start) / 60000;
        
        // Use a simpler approach for a quick demo: 5 characters per word
        const typedCharacters = content.length; 
        const wpm = Math.floor((typedCharacters / 5) / minutes);
        
        return isNaN(wpm) || wpm < 0 || wpm === Infinity ? 0 : wpm;
    }, []);

    const handleKey = useCallback((event) => {
        const { key } = event;

        if (status === 'finished') return;
        
        // Prevent typing if there's no text to type (safety net for the crash)
        if (textToType.length === 0) return; 

        // Start the timer on the first key press
        if (status === 'idle') {
            setStartTime(Date.now());
            setStatus('started');
        }

        if (key === 'Backspace') {
            setTypedText(prev => prev.slice(0, -1));
            return;
        }

        // Prevent typing after the text is finished
        if (typedText.length >= textToType.length) return;
        
        // Allow only single character keys (ignore Ctrl, Alt, F-keys, etc.)
        if (key.length !== 1) return;

        event.preventDefault(); // Stop the character from being added by default

        const nextTypedText = typedText + key;
        const currentIndex = typedText.length;
        const expectedChar = normalizedText[currentIndex];
        
        // --- CRUCIAL APOSTROPHE FIX ---
        // Treat both the straight quote (') and the smart quote (\u2019) as correct if the expected char is a straight quote
        let isMatch = key === expectedChar;
        if (expectedChar === "'" && key === '\u2019') {
            isMatch = true;
        }
        
        if (!isMatch) {
            setErrors(prev => prev + 1);
        }

        setTypedText(nextTypedText);
        
        // Check for completion
        if (nextTypedText.length === textToType.length) {
            setStatus('finished');
        }
    }, [status, typedText, textToType, normalizedText]);

    const resetTrial = useCallback(() => {
        setTypedText('');
        setErrors(0);
        setStartTime(null);
        setStatus('idle');
        setWordCount(0);
    }, []);

    const currentWPM = calculateWPM(typedText, startTime);
    // Use Math.max/min to safely calculate progress even if textToType.length is 0
    const progress = Math.min(100, Math.floor((typedText.length / Math.max(1, textToType.length)) * 100));

    return {
        typedText,
        currentWPM,
        errors,
        status,
        textToType,
        progress,
        startTime,
        resetTrial,
        handleKey,
        isErrorChar,
        isCorrectChar,
        currentWordIndex: typedText.split(' ').length - 1,
        currentCharIndex: typedText.length - (typedText.lastIndexOf(' ') + 1),
    };
};

export default useTypingTrial;