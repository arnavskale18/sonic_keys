// src/hooks/useRaceLogic.js
import { useState, useEffect, useCallback } from 'react';

const useRaceLogic = (paragraphText, onFinish, onPlayerProgress, enabled) => {
    const [typedText, setTypedText] = useState('');
    const [errors, setErrors] = useState(new Set());
    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState(null);

    const calculateWPM = useCallback(() => {
        if (!startTime || typedText.length === 0) return 0;
        const minutes = (new Date().getTime() - startTime.getTime()) / 60000;
        if (minutes === 0) return 0;
        
        // --- FIX: WPM is now based on correct characters only ---
        const correctChars = typedText.length - errors.size;
        const words = (correctChars / 5); // 5 chars per word on average
        
        return Math.max(0, Math.round(words / minutes));
    }, [startTime, typedText, errors]); // Dependency array updated

    const handleKeyDown = useCallback((event) => {
        if (!enabled || isFinished || !paragraphText) return;

        const { key } = event;
        if (!startTime) setStartTime(new Date());

        if (key === 'Backspace') {
            // --- FIX: Backspace now correctly removes errors ---
            const newErrors = new Set(errors);
            if (newErrors.has(typedText.length - 1)) {
                newErrors.delete(typedText.length - 1);
                setErrors(newErrors);
            }
            setTypedText(current => current.slice(0, -1));

        } else if (key.length === 1) {
            const newTypedText = typedText + key;
            setTypedText(newTypedText);
            if (key !== paragraphText[newTypedText.length - 1]) {
                setErrors(current => new Set(current).add(newTypedText.length - 1));
            }
        }
    }, [enabled, typedText, isFinished, paragraphText, startTime, errors]); // Dependency array updated

    useEffect(() => {
        if (!enabled || isFinished) return;

        if (!paragraphText || !startTime) return;
        const currentProgress = Math.floor((typedText.length / paragraphText.length) * 100);
        const currentWpm = calculateWPM();
        
        setProgress(currentProgress);
        setWpm(currentWpm);
        onPlayerProgress({ progress: currentProgress, wpm: currentWpm });
        
        if (typedText.length === paragraphText.length && !isFinished) {
            const finalWpm = calculateWPM();
            setIsFinished(true);
            onFinish({ score: finalWpm, finishTime: true });
        }
    }, [enabled, typedText, paragraphText, isFinished, onFinish, calculateWPM, startTime, onPlayerProgress]);

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);

    return { typedText, errors, progress, wpm, isFinished };
};

export default useRaceLogic;
