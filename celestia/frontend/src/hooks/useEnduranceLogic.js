import { useState, useEffect, useCallback } from 'react';

/**
 * A custom React hook to manage the logic for the "Audio Endurance" typing mode.
 * This hook tracks user input, counts mistakes, and determines when the race is finished.
 * It's pure logic and has no knowledge of UI or Firebase.
 *
 * @param {string} paragraphText The correct paragraph the user needs to type.
 * @param {function} onFinish A callback function that is triggered when the paragraph is completed successfully.
 * @returns {object} An object containing the current state of the typing test:
 * - typedText: The portion of the paragraph the user has correctly typed so far.
 * - mistakes: A count of every error made (incorrect keys and backspaces).
 * - isFinished: A boolean indicating if the test is complete.
 */
const useEnduranceLogic = (paragraphText, onFinish) => {
    const [typedText, setTypedText] = useState('');
    const [mistakes, setMistakes] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleKeyDown = useCallback((event) => {
        // Stop the logic if the race is already finished.
        if (isFinished || !paragraphText) return;

        const { key } = event;
        const currentPosition = typedText.length;

        // Ignore modifier keys and other non-character keys to avoid counting them as mistakes.
        if (key.length > 1 && key !== 'Backspace' && key !== ' ') {
            // Allow spacebar through, but block things like 'Shift', 'Enter', 'Tab', etc.
            return;
        }
        
        // Prevent default browser behavior for certain keys like Tab or Backspace (scrolling).
        event.preventDefault();

        // --- MISTAKE HANDLING ---
        // A backspace is always considered a mistake in this high-stakes mode.
        if (key === 'Backspace') {
            setMistakes(prev => prev + 1);
            // We allow deleting characters, but it comes at a cost.
            setTypedText(prev => prev.slice(0, -1));
            return;
        }

        // --- ACCURACY CHECK ---
        const expectedChar = paragraphText[currentPosition];

        if (key === expectedChar) {
            // CORRECT KEYPRESS: Append the character.
            const newTypedText = typedText + key;
            setTypedText(newTypedText);

            // --- FINISH CONDITION ---
            // Check if the user has just typed the final character.
            if (newTypedText.length === paragraphText.length) {
                setIsFinished(true);
                // Call the onFinish callback with the final mistake count.
                // We use a functional update for mistakes here just in case state update hasn't settled.
                setMistakes(currentMistakes => {
                    onFinish({ mistakes: currentMistakes });
                    return currentMistakes;
                });
            }
        } else {
            // INCORRECT KEYPRESS: Increment mistake count.
            // We DO NOT add the wrong character to the typed text. The user must find the correct key.
            setMistakes(prev => prev + 1);
        }
    }, [typedText, isFinished, paragraphText, onFinish]);

    // Effect to attach and clean up the global keydown event listener.
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function to remove the listener when the component unmounts.
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return { typedText, mistakes, isFinished };
};

export default useEnduranceLogic;
