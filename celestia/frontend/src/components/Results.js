// src/components/Results.js
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Repeat } from 'lucide-react';

// Define the standard styling classes
const translucentCardClass = "bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl";
const standardButtonClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-md text-lg";

export const Results = ({ gameState, onPlayAgain }) => {
    const playersArray = useMemo(() => {
        if (!gameState || !gameState.players) return [];
        return Object.values(gameState.players).sort((a, b) => {
            // --- FIX: Added tie-breaker logic ---
            // First, sort by score (higher is better)
            const scoreDiff = (b.score || 0) - (a.score || 0);
            if (scoreDiff !== 0) return scoreDiff;

            // If scores are tied, sort by finish time (earlier is better)
            // Players who didn't finish (null time) are ranked last.
            if (a.finish_time && b.finish_time) {
                return new Date(a.finish_time) - new Date(b.finish_time);
            }
            // If one player finished and the other didn't, the one who finished is ranked higher.
            return a.finish_time ? -1 : 1;
        });
    }, [gameState]);

    const winner = playersArray[0];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 font-serif" // RESTORED: font-serif
        >
            {/* RESTORED: translucentCardClass, preserved cursor-target */}
            <div className={`w-full max-w-lg text-center p-8 cursor-target ${translucentCardClass}`}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                    <Award className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                </motion.div>
                
                {/* RESTORED: Title styling */}
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,191,255,0.75)]">Game Over!</h1>
                {/* RESTORED: Heading color */}
                <h2 className="text-2xl text-white mb-6">Winner: {winner?.name || 'N/A'}</h2>
                
                <div className="space-y-4 mb-8">
                    {playersArray.map((player, index) => (
                        <div 
                            key={player.id} 
                            // RESTORED: Background color for player rows to match the theme
                            className="bg-gray-700 p-4 rounded-lg flex justify-between items-center text-lg text-white cursor-target"
                        >
                            <span className="font-bold">
                                {index + 1}. {player.name}
                            </span>
                            <span className="font-['Roboto_Mono'] text-cyan-300">
                                {player.score || 0} {gameState.mode === 'race' ? 'WPM' : 'Points'}
                            </span>
                        </div>
                    ))}
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={onPlayAgain} 
                    // RESTORED: standardButtonClass, preserved cursor-target
                    className={`${standardButtonClass} w-full flex items-center justify-center gap-2 cursor-target`}
                >
                    <Repeat className="w-5 h-5" />
                    Play Again
                </motion.button>
            </div>
        </motion.div>
    );
};
