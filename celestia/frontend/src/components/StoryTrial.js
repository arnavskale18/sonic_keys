// src/components/StoryTrial.js
import React, { useState, useEffect, useCallback } from 'react';
import useTypingTrial from '../hooks/useTypingTrial';
import { motion } from 'framer-motion';

const StoryTrial = ({ mode, text, wpmMin, errMax, onComplete }) => {
    const { 
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
        currentWordIndex,
        currentCharIndex
    } = useTypingTrial(text);

    const [isFailed, setIsFailed] = useState(false);

    // --- FIX 1: IMMEDIATE FAILURE CHECK ---
    useEffect(() => {
        const allowedErrors = errMax || 10;
        
        // If the trial has started and errors exceed the limit, immediately set the failed state.
        if (status === 'started' && errors > allowedErrors) {
            setIsFailed(true);
        }
    }, [errors, errMax, status]);


    // --- ORIGINAL FINAL SUCCESS CHECK (Only runs if text is fully typed AND not already failed) ---
    useEffect(() => {
        // This effect runs only upon completion of typing the text, and only if we haven't failed already.
        if (status === 'finished' && !isFailed) {
            
            const requiredWPM = wpmMin || 15;
            
            // Final check on WPM (the main integrity gate at the end now) and ensures all text was typed.
            const isSuccessful = progress === 100 && currentWPM >= requiredWPM;
            
            // Report result to App.js (SUCCESS or final WPM FAIL)
            onComplete(isSuccessful);
            
            if (!isSuccessful) {
                // This will catch final failures (primarily low WPM).
                setIsFailed(true);
            }
        }
    }, [status, isFailed, progress, currentWPM, onComplete, wpmMin]);

    // --- FIX 2: RETRY FUNCTIONALITY ---
    const handleRetry = useCallback(() => {
        // 1. Reset the typing state in the custom hook
        resetTrial(); 
        // 2. Reset the component's local failure state, which triggers a re-render back to the typing screen
        setIsFailed(false);
    }, [resetTrial]);

    // --- Visual Helpers (Updated to stop cursor on failure) ---

    const getCharClass = (char, index, wordIndex) => {
        // Safety check for textToType being empty
        if (textToType.length === 0) return 'text-gray-400';

        const textParts = textToType.split(' ');
        const wordsBefore = textParts.slice(0, wordIndex).join(' ');
        const spacesBefore = wordIndex > 0 ? wordIndex : 0;
        const globalIndex = wordsBefore.length + spacesBefore + index;
        const typedGlobalIndex = typedText.length - 1;

        // If a failure has been detected, mute the color
        if (isFailed) {
            return 'text-gray-600';
        }

        if (globalIndex < typedGlobalIndex + 1) {
            // Already typed
            if (isCorrectChar(globalIndex)) {
                return 'text-green-400';
            } else if (isErrorChar(globalIndex)) {
                return 'text-red-500 bg-red-900/50';
            }
        } else if (globalIndex === typedGlobalIndex + 1 && status !== 'finished') {
            // Cursor position
            return 'bg-blue-500/70 text-white rounded-sm';
        }
        return 'text-gray-400';
    };

    const renderText = () => {
        // Safety check for empty text (although the hook should now prevent a crash)
        if (!textToType) return <span className="text-gray-400">Loading trial text...</span>;

        return textToType.split(' ').map((word, wordIndex) => (
            <span key={wordIndex} className="mr-2">
                {word.split('').map((char, charIndex) => (
                    <span 
                        key={charIndex} 
                        className={getCharClass(char, charIndex, wordIndex)}
                    >
                        {char}
                    </span>
                ))}
            </span>
        ));
    };

    // --- Main Render ---

    if (isFailed) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-screen p-4"
            >
                <div className="bg-red-900/70 p-12 rounded-xl text-center">
                    <h2 className="text-4xl text-red-400 font-bold mb-4">ACCESS DENIED</h2>
                    <p className="text-xl text-gray-200 mb-6">Integrity Check Failed. You must meet the trial parameters to proceed.</p>
                    {/* Display the goal and the result clearly */}
                    <p className="text-lg text-gray-300 mb-2">Errors: <span className='text-white font-bold'>{errors}</span> (Max: <span className='text-red-400 font-bold'>{errMax}</span>)</p>
                    <p className="text-lg text-gray-300 mb-8">WPM: <span className='text-white font-bold'>{currentWPM}</span> (Min: <span className='text-yellow-400 font-bold'>{wpmMin}</span>)</p>

                    <motion.button
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                    >
                        Retry Trial
                    </motion.button>
                </div>
            </motion.div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl text-blue-400 font-mono mb-8 uppercase tracking-widest">
                Trial: {mode.replace('_', ' ')} Integrity
            </h2>
            
            {/* Typing Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl p-8 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-blue-600/50 cursor-target"
                tabIndex={0}
                onKeyDown={handleKey}
            >
                <p className="text-2xl leading-relaxed font-mono cursor-text h-40 overflow-hidden">
                    {renderText()}
                </p>
            </motion.div>

            {/* Stats and Goal Panel */}
            <div className="w-full max-w-4xl mt-6 p-4 bg-gray-900/50 rounded-lg flex justify-around font-mono text-lg border border-gray-700">
                <div className="text-center">
                    <span className="text-yellow-400">WPM:</span> <span className="font-bold text-white">{currentWPM}</span>
                    <span className="text-gray-500 ml-2">(Min: {wpmMin})</span>
                </div>
                <div className="text-center">
                    <span className="text-red-400">Errors:</span> <span className="font-bold text-white">{errors}</span>
                    <span className="text-gray-500 ml-2">(Max: {errMax})</span>
                </div>
                <div className="text-center">
                    <span className="text-green-400">Progress:</span> <span className="font-bold text-white">{progress}%</span>
                </div>
                <div className="text-center">
                    <span className="text-blue-400">Time:</span> <span className="font-bold text-white">{(startTime ? (Date.now() - startTime) / 1000 : 0).toFixed(2)}s</span>
                </div>
            </div>
            
            <p className="mt-6 text-gray-500 text-sm">
                Click in the box and start typing to begin the trial.
            </p>
        </div>
    );
};

export default StoryTrial;