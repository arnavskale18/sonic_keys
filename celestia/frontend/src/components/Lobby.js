// src/components/Lobby.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Lobby = ({ gameState, playerId, onStartGame }) => {
  const [isCopied, setIsCopied] = useState(false);
  const players = gameState.players ? Object.entries(gameState.players) : [];
  const isHost = gameState.host_id === playerId;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameState.game_code).then(() => {
      setIsCopied(true);
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
      <div className="glass-card w-full max-w-lg text-center p-8">
        <h2 className="text-xl text-gray-300 mb-2">Game Code (Click to Copy)</h2>
        <div 
            className="text-4xl font-['Roboto_Mono'] tracking-widest text-cyan-300 bg-gray-900/50 p-3 rounded-lg mb-8 cursor-pointer hover:bg-gray-800 transition-all"
            onClick={copyToClipboard}
            title="Click to copy"
        >
          {isCopied ? 'Copied!' : gameState.game_code}
        </div>
        <h3 className="text-2xl text-purple-400 mb-4">Players Joined ({players.length})</h3>
        <div className="space-y-3 mb-8 min-h-[100px]">
            <AnimatePresence>
            {players.map(([id, player]) => (
                <motion.div key={id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="bg-gray-800 p-3 rounded-lg text-lg">
                    {player.name}
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
        {isHost ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStartGame} className="neon-button w-full" disabled={players.length < 2}>
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
