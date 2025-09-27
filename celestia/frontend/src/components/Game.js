import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useRaceLogic from '../hooks/useRaceLogic';
import useEnduranceLogic from '../hooks/useEnduranceLogic';

// A sub-component for the leaderboard display to keep the main component cleaner.
const PlayerStatus = ({ name, scoreText, progress, isCurrentUser }) => (
    <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
            <span className={font-bold truncate ${isCurrentUser ? 'text-cyan-300' : 'text-white'}}>{name}</span> {/* CORRECTED */}
            <span className="text-sm font-['Roboto_Mono'] text-gray-300">{scoreText}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <motion.div 
                className="bg-cyan-400 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: ${progress || 0}% }} // CORRECTED
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    </div>
);

// The onPlayerFinish prop is now correctly received here.
const Game = ({ gameState, playerId, onPlayerFinish }) => { // CORRECTED
  const { mode, paragraph, players } = gameState;
  const hasFinished = useRef(false);

  // Initialize both logic hooks as per React's rules.
  // We pass the correct onPlayerFinish callback to the hooks.
  const race = useRaceLogic(paragraph, () => onPlayerFinish({ finishTime: new Date() }));
  const endurance = useEnduranceLogic(paragraph, (result) => onPlayerFinish({ mistakes: result.mistakes }));

  // State and effect for handling the browser's Speech Synthesis API.
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  useEffect(() => {
    setSpeechSynthesis(window.speechSynthesis);

    // This cleanup function stops any speech if the component is unmounted.
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  const playAudio = () => {
    if (speechSynthesis && paragraph) {
      const utterance = new SpeechSynthesisUtterance(paragraph);
      utterance.rate = 0.8; // Speak slightly slower for clarity.
      speechSynthesis.cancel(); // Stop any currently playing audio.
      speechSynthesis.speak(utterance);
    }
  };

  // This single useEffect is now correctly implemented and matches the props.
  useEffect(() => {
    if (hasFinished.current) return;

    if (mode === 'race' && race.isFinished) {
      hasFinished.current = true;
      onPlayerFinish({ finishTime: new Date() });
    } else if (mode === 'endurance' && endurance.isFinished) {
      hasFinished.current = true;
      onPlayerFinish({ mistakes: endurance.mistakes });
    }
  }, [mode, race.isFinished, endurance.isFinished, endurance.mistakes, onPlayerFinish, hasFinished]);

  const sortedPlayers = useMemo(() => {
    return Object.entries(players).sort(([, a], [, b]) => {
      if (mode === 'race') return (b.progress || 0) - (a.progress || 0);
      return (a.score || 0) - (b.score || 0);
    });
  }, [players, mode]);

  // --- UI Rendering for RACE Mode ---
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
            className="w-full p-3 text-lg bg-gray-900 border-2 border-gray-700 rounded-md focus:outline-none focus:border-cyan-400"
            autoFocus
            disabled={race.isFinished}
            placeholder={race.isFinished ? "Finished!" : "Start typing here..."}
        />
        <div className="text-center mt-4 text-3xl font-bold text-cyan-300">
            WPM: {race.wpm}
        </div>
    </div>
  );
  
  // --- UI Rendering for ENDURANCE Mode ---
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
        {/* Leaderboard on the left */}
        <aside className="w-full md:w-1/4 glass-card p-6">
            <h2 className="text-2xl text-cyan-300 mb-6">Leaderboard</h2>
            {sortedPlayers.map(([id, player]) => (
                <PlayerStatus 
                    key={id} 
                    name={player.name}
                    scoreText={mode === 'race' ? ${Math.floor(player.progress || 0)}% : ${player.score || 0} Mistakes} // CORRECTED
                    progress={player.progress || 0}
                    isCurrentUser={id === playerId}
                />
            ))}
        </aside>

        {/* Main game area on the right */}
        <main className="w-full md:w-3/4 glass-card p-6">
          {mode === 'race' ? renderRaceUI() : renderEnduranceUI()}
        </main>
    </div>
  );
};

export default Game;
