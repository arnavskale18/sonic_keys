// src/hooks/useEnduranceLogic.js
import { useState, useEffect, useCallback } from 'react';

const useEnduranceLogic = (paragraphText, onFinish, onPlayerProgress, enabled) => {
    const [typedText, setTypedText] = useState('');
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleKeyDown = useCallback((event) => {
        if (!enabled || isFinished || !paragraphText) return;

        const { key } = event;
        const currentPosition = typedText.length;
        const expectedChar = paragraphText[currentPosition];

        if (key === 'Backspace' || key.length > 1) {
            return;
        }

        if (expectedChar && key.toLowerCase() === expectedChar.toLowerCase()) {
            const newTypedText = typedText + expectedChar;
            const newScore = newTypedText.length;
            
            // --- FIX: Calculate progress percentage ---
            const newProgress = Math.floor((newTypedText.length / paragraphText.length) * 100);
            
            setTypedText(newTypedText);
            setScore(newScore);
            
            // Send both score and progress update
            if (onPlayerProgress) {
                onPlayerProgress({ score: newScore, progress: newProgress });
            }

            if (newTypedText.length === paragraphText.length) {
                setIsFinished(true);
                onFinish({ score: newScore });
            }
        }
    }, [enabled, typedText, isFinished, paragraphText, onFinish, onPlayerProgress]);

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);

    return { typedText, score, isFinished };
};

export default useEnduranceLogic;
