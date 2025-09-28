// src/components/Results.js
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Repeat } from 'lucide-react';

// Define the standard styling classes from your project
const standardButtonClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-md text-lg";

export const Results = ({ gameState, onPlayAgain }) => {
    const playersArray = useMemo(() => {
        if (!gameState || !gameState.players) return [];
        return Object.values(gameState.players).sort((a, b) => {
            const scoreDiff = (b.score || 0) - (a.score || 0);
            if (scoreDiff !== 0) return scoreDiff;
            if (a.finish_time && b.finish_time) {
                return new Date(a.finish_time) - new Date(b.finish_time);
            }
            return a.finish_time ? -1 : 1;
        });
    }, [gameState]);

    const winner = playersArray[0];

    return (
        // --- FIX: The outer div now only handles the fade-in, which is safe ---
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
        >
            {/* The scale animation is now applied only to the card itself */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="glass-card w-full max-w-lg text-center p-8"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                    <Award className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                </motion.div>
                
                <h1 className="text-4xl neon-text mb-2">Game Over!</h1>
                <h2 className="text-2xl text-cyan-300 mb-6">Winner: {winner?.name || 'N/A'}</h2>
                
                <div className="space-y-4 mb-8">
                    {playersArray.map((player, index) => (
                        <div 
                            key={player.id} 
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
                    className={`${standardButtonClass} w-full flex items-center justify-center gap-2 cursor-target`}
                >
                    <Repeat className="w-5 h-5" />
                    Play Again
                </motion.button>
            </motion.div>
        </motion.div>
    );
};
