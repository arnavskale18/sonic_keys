import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import useRaceLogic from '../hooks/useRaceLogic';
import useEnduranceLogic from '../hooks/useEnduranceLogic';

// A smaller component for the leaderboard display
const PlayerStatus = ({ name, scoreText, progress, isCurrentUser }) => (
    <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
            <span className={`font-bold truncate ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>{name}</span>
            <span className="text-sm font-['Roboto_Mono'] text-gray-300">{scoreText}</span>
        </div>
        <div className="progress-bar-container">
            <motion.div 
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    </div>
);

const Game = ({ gameState, playerId, onFinishRace, onUpdateEnduranceScore }) => {
  const { mode, paragraph, players } = gameState;

  // --- FIX 1: Add a ref to ensure onFinishRace is called only once ---
  const hasFinished = useRef(false);

  const race = useRaceLogic(paragraph);
  const endurance = useEnduranceLogic(paragraph);
  
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  useEffect(() => {
    setSpeechSynthesis(window.speechSynthesis);

    // --- IMPROVEMENT 3: Add cleanup to stop speech when component unmounts ---
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  const playAudio = () => {
    if (speechSynthesis && paragraph) {
      const utterance = new SpeechSynthesisUtterance(paragraph);
      utterance.rate = 0.8;
      speechSynthesis.cancel(); 
      speechSynthesis.speak(utterance);
    }
  };

  // Effect for finishing the race
  useEffect(() => {
    if (mode === 'race' && race.isFinished && !hasFinished.current) {
      // --- FIX 1: Check and set the ref flag ---
      hasFinished.current = true;
      onFinishRace();
    }
  }, [mode, race.isFinished, onFinishRace]);

  // Effect for updating endurance score in real-time
  useEffect(() => {
    if (mode === 'endurance') {
      onUpdateEnduranceScore(endurance.mistakes);
    }
  }, [mode, endurance.mistakes, onUpdateEnduranceScore]);

  const sortedPlayers = useMemo(() => {
    return Object.entries(players).sort(([, a], [, b]) => {
        // Sort by progress in race, by mistakes (asc) in endurance
        if (mode === 'race') return (b.progress || 0) - (a.progress || 0);
        return (a.score || 0) - (b.score || 0);
    });
  }, [players, mode]);

  const renderRaceUI = () => (
    <div>
        <div className="font-['Roboto_Mono'] text-lg text-gray-400 p-6 bg-gray-800 rounded-lg mb-4 select-none leading-relaxed">
          {paragraph.split('').map((char, index) => {
              let colorClass = 'text-gray-500';
              if (index < race.typedText.length) {
                  colorClass = char === race.typedText[index] ? 'text-cyan-200' : 'text-red-500 bg-red-900/50';
              }
              return <span key={index} className={colorClass}>{char}</span>
          })}
        </div>
        <input 
            type="text"
            value={race.typedText}
            onChange={(e) => race.handleUserInput(e.target.value)}
            className="w-full"
            autoFocus
            disabled={race.isFinished}
            placeholder={race.isFinished ? "Finished!" : "Start typing here..."}
        />
        <div className="text-center mt-4 text-3xl font-bold neon-text">
            WPM: {race.wpm}
        </div>
    </div>
  );
  
  const renderEnduranceUI = () => (
      <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="text-2xl text-center mb-4 text-purple-300">Audio Endurance Challenge</h2>
            <p className="text-center text-gray-400 mb-6">Listen to the audio and type what you hear. Every mistake counts.</p>
            <div className="text-center mb-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={playAudio} className="neon-button">
                    Play Audio
                </motion.button>
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-center">
            <p className="text-center font-['Roboto_Mono'] text-2xl text-gray-300 h-10 p-2 bg-gray-800 rounded">
                {endurance.typedText}
                <span className="animate-ping text-cyan-300">|</span>
            </p>
            <div className="text-center mt-4 text-3xl font-bold text-red-500">
                Mistakes: {endurance.mistakes}
            </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 glass-card">
            <h2 className="text-2xl neon-text mb-6">Leaderboard</h2>
            {sortedPlayers.map(([id, player]) => (
                <PlayerStatus 
                    key={id} 
                    name={player.name}
                    // --- FIX 2: Show progress % for race, mistakes for endurance ---
                    scoreText={mode === 'race' ? `${Math.floor(player.progress || 0)}%` : `${player.score || 0} Mistakes`}
                    progress={player.progress || 0}
                    isCurrentUser={id === playerId}
                />
            ))}
        </aside>

        <main className="w-full md:w-3/4 glass-card">
          {mode === 'race' ? renderRaceUI() : renderEnduranceUI()}
        </main>
    </div>
  );
};

export default Game;
