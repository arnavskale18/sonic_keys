// src/components/Game.js
import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import useRaceLogic from '../hooks/useRaceLogic';
import useEnduranceLogic from '../hooks/useEnduranceLogic';

// Define the standard translucent card background class
const translucentCardClass = "bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl";
const standardButtonClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md text-lg";


// --- NEW: Audio Manager to protect speech from re-renders ---
const audioManager = {
    isPlaying: false,
    speak(text, rate) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.onend = () => { this.isPlaying = false; };
        utterance.onerror = () => { this.isPlaying = false; };
        window.speechSynthesis.speak(utterance);
        this.isPlaying = true;
    },
    stop() {
        window.speechSynthesis.cancel();
        this.isPlaying = false;
    }
};

const PlayerStatus = ({ name, scoreText, progress, isCurrentUser }) => (
    // ADDED: cursor-target to PlayerStatus/Leaderboard rows
    <div className="mb-4 cursor-target"> 
        <div className="flex justify-between items-baseline mb-1">
            <span className={`font-bold truncate ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>{name}</span>
            <span className="text-sm font-['Roboto_Mono'] text-gray-300">{scoreText}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <motion.div
                className="bg-cyan-400 h-2.5 rounded-full"
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.2, ease: "linear" }}
            />
        </div>
    </div>
);

const Game = ({ gameState, playerId, onPlayerFinish, onPlayerProgress }) => {
    const { mode, paragraph, players } = gameState;

    const race = useRaceLogic(paragraph, onPlayerFinish, onPlayerProgress, mode === 'race');
    const endurance = useEnduranceLogic(paragraph, onPlayerFinish, onPlayerProgress, mode === 'endurance');
    
    // The component now just calls the manager
    const playAudio = () => audioManager.speak(paragraph, 0.5);

    // Effect to stop audio when the game component is no longer on screen
    useEffect(() => {
        return () => audioManager.stop();
    }, []);

    const sortedPlayers = useMemo(() => {
        const playersArray = players ? Object.values(players) : [];
        return playersArray.sort((a, b) => (b.score || 0) - (a.score || 0));
    }, [players]);

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col md:flex-row gap-8">
            {/* RESTORED: Translucent card styling (p-6 is kept) */}
            <aside className={`w-full md:w-1/4 p-6 cursor-target ${translucentCardClass}`}>
                <h2 className="text-2xl text-cyan-300 mb-6">Leaderboard</h2>
                {sortedPlayers.map((player) => (
                    <PlayerStatus
                        key={player.id}
                        name={player.name}
                        scoreText={mode === 'race' ? `${player.score || 0} WPM` : `${player.score || 0} Points`}
                        progress={player.progress || 0}
                        isCurrentUser={player.id === playerId}
                    />
                ))}
            </aside>

            {/* RESTORED: Translucent card styling (p-6 is kept) */}
            <main className={`w-full md:w-3/4 p-6 cursor-target ${translucentCardClass}`}>
                {mode === 'race' ? (
                     <div>
                         <div className="font-mono text-lg text-gray-400 p-6 bg-gray-900/50 rounded-lg mb-4 select-none leading-relaxed">
                             {paragraph.split('').map((char, index) => {
                                 let colorClass = 'text-gray-500';
                                 if (index < race.typedText.length) {
                                     colorClass = race.errors.has(index) ? 'text-red-500 bg-red-900/50' : 'text-cyan-200';
                                 }
                                 return <span key={index} className={colorClass}>{char}</span>;
                             })}
                         </div>
                         {/* Removed animate-glow for a cleaner look */}
                         <p className="text-center mt-4 text-3xl font-bold text-cyan-300">
                             WPM: {race.wpm}
                         </p>
                     </div>
                 ) : (
                     <div className="flex flex-col h-full">
                         <div className="text-center">
                             {/* Changed text-brand-pink to a standard color */}
                             <h2 className="text-2xl mb-4 text-indigo-400">Audio Endurance</h2>
                             <p className="text-gray-400 mb-6">Listen to the audio and type what you hear.</p>
                             <div className="mb-6">
                                 {/* Changed neon-button to standardButtonClass */}
                                 <button onClick={playAudio} className={`${standardButtonClass} cursor-target`}>
                                     Play Audio
                                 </button>
                             </div>
                         </div>
                         <div className="flex-grow flex flex-col justify-center">
                             <p className="font-mono text-2xl text-gray-300 h-10 p-2 bg-gray-900/50 rounded text-center">
                                 {endurance.typedText} <span className="animate-ping text-cyan-300">|</span>
                             </p>
                             <p className="text-center mt-4 text-3xl font-bold text-green-400">
                                 Points: {endurance.score}
                             </p>
                         </div>
                     </div>
                 )}
            </main>
        </div>
    );
};

export default Game;
