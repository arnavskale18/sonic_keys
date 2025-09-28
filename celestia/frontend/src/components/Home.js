// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// UPDATED: Accept onStartStory and highScore props
const Home = ({ onCreateGame, onJoinGame, onStartStory, playerName: initialPlayerName, highScore }) => {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  
  // CHANGED: Use a local state for the input field, initialized from the prop
  const [localPlayerName, setLocalPlayerName] = useState(initialPlayerName);

  // Sync local input state when the initial prop changes (e.g., loaded from storage)
  useEffect(() => {
      setLocalPlayerName(initialPlayerName);
  }, [initialPlayerName]);

  const handleCreateClick = () => {
    if (localPlayerName.trim()) {
      setShowModeSelect(true);
    } else {
      alert("Please enter a player name.");
    }
  };
  
  const handleJoinClick = () => {
    if (localPlayerName.trim() && gameIdToJoin.trim()) {
      onJoinGame(gameIdToJoin.toUpperCase(), localPlayerName);
    } else {
      alert("Please enter both a player name and a game code.");
    }
  };

  const handleJoinKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleJoinClick();
    }
  };
  
  // ADDED: Handler for starting solo mode
  const handleStartStoryClick = () => {
      if (localPlayerName.trim()) {
          onStartStory(localPlayerName); 
      } else {
          alert("Please enter a player name to start the story.");
      }
  };

  const handleModeSelect = (mode) => {
    onCreateGame(mode, localPlayerName);
  };

  const standardButtonClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-md text-lg";
  const translucentCardClass = "bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl p-8";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 font-serif" 
    >
      <h1 className="text-6xl md:text-7xl font-bold text-white mb-12 drop-shadow-[0_0_15px_rgba(0,191,255,0.75)]">Sonic Keys</h1> 
      
      {!showModeSelect ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`w-full max-w-lg cursor-target ${translucentCardClass}`} 
        >
            <div className="mb-6">
                <label className="block text-white mb-3 text-lg uppercase tracking-wider">Player Name</label>
                <input 
                    type="text"
                    // UPDATED: Use localPlayerName state
                    value={localPlayerName}
                    onChange={(e) => setLocalPlayerName(e.target.value)}
                    placeholder="Enter your nickname" 
                    className="w-full text-lg p-3 rounded-lg bg-gray-700 border border-gray-600 text-white cursor-target" 
                />
            </div>
            
            {/* ADDED: Solo Story Mode Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleStartStoryClick} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-md text-lg w-full mb-4 cursor-target" 
                disabled={!localPlayerName.trim()} 
            >
                Start Story Mode (Solo)
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleCreateClick} 
                className={`${standardButtonClass} w-full mb-4 cursor-target`} 
            >
                Create Game (Multiplayer)
            </motion.button>
            
            {/* ADDED: Local High Score Display */}
            <div className="text-center p-3 mt-4 mb-4 bg-gray-700/50 rounded-lg border-2 border-green-500/50">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-widest mb-1">Local High Score (Solo)</h3>
                {highScore ? (
                    <p className="text-xl font-mono text-white">
                        <span className="text-2xl font-bold text-green-300">{(highScore.timeMs / 1000).toFixed(2)}s</span> by {highScore.name}
                    </p>
                ) : (
                    <p className="text-gray-400">No record yet. Be the first!</p>
                )}
            </div>
            
            <div className="flex items-center space-x-3 my-4"> 
                <input 
                    type="text"
                    value={gameIdToJoin}
                    onChange={(e) => setGameIdToJoin(e.target.value)}
                    onKeyDown={handleJoinKeyDown}
                    placeholder="Game Code"
                    className="flex-grow text-lg p-3 rounded-lg bg-gray-700 border border-gray-600 text-white cursor-target" 
                />
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleJoinClick} 
                    className={standardButtonClass + ' cursor-target'} 
                >
                    Join
                </motion.button>
            </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-lg text-center cursor-target ${translucentCardClass}`} 
        >
          <h2 className="text-3xl text-white mb-6">Select Game Mode</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleModeSelect('race')} 
            className={`${standardButtonClass} w-full mb-4 cursor-target`} 
          >
            High-Speed Race
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleModeSelect('endurance')} 
            className={`${standardButtonClass} w-full cursor-target`} 
          >
            Audio Endurance
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
