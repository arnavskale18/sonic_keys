import { useState, useEffect, useCallback } from 'react';

/**
 * A custom React hook to manage the logic for the "High-Speed Race" typing mode.
 * This hook tracks user input, calculates progress and WPM, and identifies errors.
 * It's pure logic and has no knowledge of UI or Firebase.
 *
 * @param {string} paragraphText The correct paragraph the user needs to type.
 * @param {function} onFinish A callback function that is triggered when the paragraph is completed.
 * @returns {object} An object containing the current state of the typing test:
 * - typedText: The full string the user has typed so far.
 * - errors: A Set containing the indices of characters typed incorrectly.
 * - progress: The player's completion percentage (0-100).
 * - wpm: The player's current Words Per Minute.
 * - isFinished: A boolean indicating if the test is complete.
 */
const useRaceLogic = (paragraphText, onFinish) => {
    const [typedText, setTypedText] = useState('');
    const [errors, setErrors] = useState(new Set());
    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState(null);

    // Function to calculate WPM
    const calculateWPM = useCallback(() => {
        if (!startTime || typedText.length === 0) {
            return 0;
        }
        const now = Date.now();
        const timeInMinutes = (now - startTime) / 1000 / 60;
        const wordCount = typedText.length / 5; // A "word" is defined as 5 characters
        return Math.round(wordCount / timeInMinutes);
    }, [startTime, typedText]);
    
    // Effect to update WPM periodically for a smoother display
    useEffect(() => {
        let interval;
        if (startTime && !isFinished) {
            interval = setInterval(() => {
                setWpm(calculateWPM());
            }, 1000); // Update WPM every second
        }
        return () => clearInterval(interval);
    }, [startTime, isFinished, calculateWPM]);

    const handleKeyDown = useCallback((event) => {
        if (isFinished || !paragraphText) return;

        const { key } = event;

        // Start the timer on the very first valid keypress
        if (!startTime && key.length === 1) {
            setStartTime(Date.now());
        }

        if (key.length > 1 && key !== 'Backspace') {
            return; // Ignore modifier keys
        }
        
        event.preventDefault();

        if (key === 'Backspace') {
            if (typedText.length > 0) {
                const newErrors = new Set(errors);
                newErrors.delete(typedText.length - 1); // Remove error status for the deleted char
                setErrors(newErrors);
                setTypedText(prev => prev.slice(0, -1));
            }
        } else if (typedText.length < paragraphText.length) {
            // This is a character key
            const newTypedText = typedText + key;
            setTypedText(newTypedText);

            // Check for an error
            const expectedChar = paragraphText[newTypedText.length - 1];
            if (key !== expectedChar) {
                const newErrors = new Set(errors);
                newErrors.add(newTypedText.length - 1);
                setErrors(newErrors);
            }
        }
        
    }, [typedText, errors, isFinished, paragraphText, startTime]);
    
    // Effect to update progress and check for finish condition
    useEffect(() => {
        if (!paragraphText) return;

        const newProgress = (typedText.length / paragraphText.length) * 100;
        setProgress(newProgress);

        if (typedText.length === paragraphText.length && !isFinished) {
            setIsFinished(true);
            setWpm(calculateWPM()); // Final WPM calculation
            onFinish(); // Signal to App.js that this player is done
        }

    }, [typedText, paragraphText, isFinished, onFinish, calculateWPM]);


    // Effect to attach and clean up the global keydown event listener.
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return { typedText, errors, progress, wpm, isFinished };
};

export default useRaceLogic;
