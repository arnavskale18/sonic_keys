import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Home = ({ onCreateGame, onJoinGame }) => {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleCreateClick = () => {
    if (playerName.trim()) {
      setShowModeSelect(true);
    } else {
      alert("Please enter a player name.");
    }
  };
  
  const handleJoinClick = () => {
    if (playerName.trim() && gameIdToJoin.trim()) {
      onJoinGame(gameIdToJoin.toUpperCase(), playerName);
    } else {
      alert("Please enter both a player name and a game code.");
    }
  };

  // --- NEW: Added handler for the 'Enter' key press ---
  const handleJoinKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleJoinClick();
    }
  };

  const handleModeSelect = (mode) => {
    onCreateGame(mode, playerName);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <h1 className="text-6xl md:text-7xl font-bold neon-text mb-12">Neon Racer</h1>
      
      {!showModeSelect ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card w-full max-w-md"
        >
            <div className="mb-6">
                <label className="block text-cyan-300 mb-2 text-sm uppercase tracking-wider">Player Name</label>
                <input 
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your handle"
                    className="w-full text-base"
                />
            </div>
            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleCreateClick} 
                className="neon-button w-full mb-4"
            >
                Create Game
            </motion.button>
            <div className="flex items-center space-x-2 my-4">
                <input 
                    type="text"
                    value={gameIdToJoin}
                    onChange={(e) => setGameIdToJoin(e.target.value)}
                    // --- NEW: Added the onKeyDown event listener here ---
                    onKeyDown={handleJoinKeyDown}
                    placeholder="Game Code"
                    className="flex-grow"
                />
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleJoinClick} 
                    className="neon-button"
                >
                    Join
                </motion.button>
            </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md text-center"
        >
          <h2 className="text-2xl text-cyan-300 mb-6">Select Game Mode</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleModeSelect('race')} 
            className="neon-button w-full mb-4"
          >
            High-Speed Race
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleModeSelect('endurance')} 
            className="neon-button w-full"
          >
            Audio Endurance
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
