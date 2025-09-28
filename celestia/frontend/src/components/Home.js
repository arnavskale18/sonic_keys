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

  const handleJoinKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleJoinClick();
    }
  };

  const handleModeSelect = (mode) => {
    onCreateGame(mode, playerName);
  };

  // --- RESTORED STYLES ---
  const standardButtonClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-md text-lg";
  const translucentCardClass = "bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl p-8";
  // ------------------------

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      // RESTORED: font-serif
      className="flex flex-col items-center justify-center min-h-screen p-4 font-serif" 
    >
      {/* RESTORED: Title to "Sonic Keys" and subtle blue glow */}
      <h1 className="text-6xl md:text-7xl font-bold text-white mb-12 drop-shadow-[0_0_15px_rgba(0,191,255,0.75)]">Sonic Keys</h1> 
      
      {!showModeSelect ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // RESTORED: translucentCardClass, preserved cursor-target
            className={`w-full max-w-lg cursor-target ${translucentCardClass}`} 
        >
            <div className="mb-6">
                {/* RESTORED: Label styling */}
                <label className="block text-white mb-3 text-lg uppercase tracking-wider">Player Name</label>
                <input 
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your nickname" 
                    // RESTORED: Input styling, preserved cursor-target
                    className="w-full text-lg p-3 rounded-lg bg-gray-700 border border-gray-600 text-white cursor-target" 
                />
            </div>
            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleCreateClick} 
                // RESTORED: standardButtonClass, preserved cursor-target
                className={`${standardButtonClass} w-full mb-4 cursor-target`} 
            >
                Create Game
            </motion.button>
            <div className="flex items-center space-x-3 my-4"> {/* RESTORED: space-x-3 */}
                <input 
                    type="text"
                    value={gameIdToJoin}
                    onChange={(e) => setGameIdToJoin(e.target.value)}
                    onKeyDown={handleJoinKeyDown}
                    placeholder="Game Code"
                    // RESTORED: Input styling, preserved cursor-target
                    className="flex-grow text-lg p-3 rounded-lg bg-gray-700 border border-gray-600 text-white cursor-target" 
                />
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleJoinClick} 
                    // RESTORED: standardButtonClass, preserved cursor-target
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
          // RESTORED: translucentCardClass, preserved cursor-target
          className={`w-full max-w-lg text-center cursor-target ${translucentCardClass}`} 
        >
          {/* RESTORED: Heading color */}
          <h2 className="text-3xl text-white mb-6">Select Game Mode</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleModeSelect('race')} 
            // RESTORED: standardButtonClass, preserved cursor-target
            className={`${standardButtonClass} w-full mb-4 cursor-target`} 
          >
            High-Speed Race
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleModeSelect('endurance')} 
            // RESTORED: standardButtonClass, preserved cursor-target
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
