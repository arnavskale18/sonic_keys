// src/components/Lobby.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Lobby = ({ gameState, playerId, onStartGame }) => {
  // State to manage the "Copied!" message for a better UX
  const [isCopied, setIsCopied] = useState(false);

  // Use Object.entries to get the unique player UID for robust list rendering
  const players = gameState.players ? Object.entries(gameState.players) : [];
  const isHost = gameState.hostId === playerId;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameState.gameId).then(() => {
      setIsCopied(true);
      // Revert the message back to the game code after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <h1 className="text-4xl md:text-5xl neon-text mb-4">Lobby</h1>
      <div className="glass-card w-full max-w-lg text-center">
        <h2 className="text-xl text-gray-300 mb-2">Game Code (Click to Copy)</h2>
        <div 
            className="text-4xl font-['Roboto_Mono'] tracking-widest text-cyan-300 bg-gray-800 p-3 rounded-lg mb-8 cursor-pointer hover:bg-gray-700 transition-all"
            onClick={copyToClipboard}
            title="Click to copy"
        >
          {/* Conditionally render the "Copied!" message */}
          {isCopied ? 'Copied!' : gameState.gameId}
        </div>
        
        <h3 className="text-2xl text-purple-400 mb-4">Players Joined ({players.length})</h3>
        <div className="space-y-3 mb-8 min-h-[100px]">
            <AnimatePresence>
            {/* Use the unique player 'id' as the key for stability */}
            {players.map(([id, player]) => (
                <motion.div 
                    key={id} 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="bg-gray-800 p-3 rounded-lg text-lg"
                >
                {player.name}
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
        
        {isHost ? (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={onStartGame} 
            className="neon-button w-full"
            disabled={players.length < 2}
          >
            {
  players.length < 2 
    ? 'Waiting for players...' 
    : `Start ${gameState.mode.charAt(0).toUpperCase() + gameState.mode.slice(1)} Game`
}
          </motion.button>
        ) : (
          <p className="text-lg text-gray-400 animate-pulse">Waiting for the host to start the game...</p>
        )}
      </div>
    </motion.div>
  );
};

export default Lobby;
