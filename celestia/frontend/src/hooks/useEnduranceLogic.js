// src/hooks/useEnduranceLogic.js
import { useState, useEffect, useCallback } from 'react';

const useEnduranceLogic = (paragraphText, onFinish, onPlayerProgress, enabled) => {
    const [typedText, setTypedText] = useState('');
    const [score, setScore] = useState(0); // Changed from 'mistakes' to 'score'
    const [isFinished, setIsFinished] = useState(false);

    const handleKeyDown = useCallback((event) => {
        if (!enabled || isFinished || !paragraphText) return;

        const { key } = event;
        const currentPosition = typedText.length;
        const expectedChar = paragraphText[currentPosition];

        if (key === 'Backspace' || key.length > 1) {
            return; // Ignore backspace and other special keys
        }

        if (expectedChar && key.toLowerCase() === expectedChar.toLowerCase()) {
            const newTypedText = typedText + expectedChar;
            const newScore = newTypedText.length; // Score is number of correct characters
            
            setTypedText(newTypedText);
            setScore(newScore);
            
            // Send live score update
            if (onPlayerProgress) {
                onPlayerProgress({ score: newScore });
            }

            if (newTypedText.length === paragraphText.length) {
                setIsFinished(true);
                onFinish({ score: newScore });
            }
        }
        // If the key is wrong, we do nothing. The player is stuck.
    }, [enabled, typedText, isFinished, paragraphText, onFinish, onPlayerProgress]);

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);

    return { typedText, score, isFinished }; // Return 'score' instead of 'mistakes'
};

export default useEnduranceLogic;
