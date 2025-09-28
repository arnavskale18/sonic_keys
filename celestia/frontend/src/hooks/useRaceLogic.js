// src/hooks/useRaceLogic.js
import { useState, useEffect, useCallback } from 'react';

const useRaceLogic = (paragraphText, onFinish, onPlayerProgress, enabled) => { // <-- Add 'enabled'
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
        const words = typedText.length / 5;
        return Math.round(words / minutes);
    }, [startTime, typedText]);

    const handleKeyDown = useCallback((event) => {
        if (!enabled || isFinished || !paragraphText) return; // <-- Check if enabled

        const { key } = event;
        if (!startTime) setStartTime(new Date());

        if (key === 'Backspace') {
            setTypedText(current => current.slice(0, -1));
        } else if (key.length === 1) {
            const newTypedText = typedText + key;
            setTypedText(newTypedText);
            if (key !== paragraphText[newTypedText.length - 1]) {
                setErrors(current => new Set(current.add(newTypedText.length - 1)));
            }
        }
    }, [enabled, typedText, isFinished, paragraphText, startTime]);

    useEffect(() => {
        if (!enabled || isFinished) return; // <-- Check if enabled

        if (!paragraphText || !startTime) return;
        const currentProgress = Math.floor((typedText.length / paragraphText.length) * 100);
        const currentWpm = calculateWPM();
        
        setProgress(currentProgress);
        setWpm(currentWpm);
        onPlayerProgress({ progress: currentProgress, wpm: currentWpm });
        
        if (typedText.length === paragraphText.length) {
            const finalWpm = calculateWPM();
            setIsFinished(true);
            onFinish({ score: finalWpm, finishTime: true });
        }
    }, [enabled, typedText, paragraphText, isFinished, onFinish, calculateWPM, startTime, onPlayerProgress]);

    useEffect(() => {
        if (!enabled) return; // <-- Check if enabled
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);

    return { typedText, errors, progress, wpm, isFinished };
};

export default useRaceLogic;
