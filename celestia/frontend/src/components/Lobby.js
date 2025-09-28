// src/components/Lobby.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// TextPressure import removed

// Define the standard styling classes
const translucentCardClass = "bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl";
const standardButtonClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-md text-lg";

const Lobby = ({ gameState, playerId, onStartGame }) => {
  const [isCopied, setIsCopied] = useState(false);
  const players = gameState.players ? Object.entries(gameState.players) : [];
  const isHost = gameState.host_id === playerId;

  const copyToClipboard = () => {
    // Note: Added check for navigator.clipboard for robust cross-browser support
    if (navigator.clipboard && gameState.game_code) {
      navigator.clipboard.writeText(gameState.game_code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 font-serif" 
    >
      
      {/* Reverted to original <h1> tag */}
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,191,255,0.75)]">Game Lobby</h1>
      
      {/* Card starts here */}
      <div className={`w-full max-w-lg text-center p-8 cursor-target ${translucentCardClass}`}>
        
        <h2 className="text-xl text-white mb-3">Game Code (Click to Copy)</h2>
        <div 
            className="text-4xl font-['Roboto_Mono'] tracking-widest text-cyan-300 bg-gray-700 p-3 rounded-lg mb-8 cursor-pointer hover:bg-gray-600 transition-all cursor-target"
            onClick={copyToClipboard}
            title="Click to copy"
        >
          {isCopied ? 'Copied!' : gameState.game_code}
        </div>
        
        <h3 className="text-2xl text-white mb-4">Players Joined ({players.length})</h3>
        
        <div className="space-y-3 mb-8 min-h-[100px]">
            <AnimatePresence>
            {players.map(([id, player]) => (
                <motion.div 
                    key={id} 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 30 }} 
                    className="bg-gray-700 p-3 rounded-lg text-lg cursor-target text-white"
                >
                    {player.name} {id === gameState.host_id && <span className="text-indigo-400 text-sm">(Host)</span>}
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
        
        {isHost ? (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={onStartGame} 
            className={`${standardButtonClass} w-full cursor-target`} 
            disabled={players.length < 2}
          >
            {players.length < 2 ? 'Waiting for players...' : `Start Game`}
          </motion.button>
        ) : (
          <p className="text-lg text-gray-400 animate-pulse">Waiting for the host to start...</p>
        )}
      </div>
    </motion.div>
  );
};

export default Lobby;
