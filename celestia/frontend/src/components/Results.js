// src/components/Results.js
import { motion } from 'framer-motion';
import { Award, Repeat } from 'lucide-react';

export const Results = ({ gameState, onPlayAgain }) => {
  // Sort players based on the game mode's winning condition
  const sortedPlayers = Object.values(gameState.players).sort((a, b) => {
    // For 'race' mode, a higher score (WPM) is better.
    // For 'endurance' mode, a lower score (mistakes) is better.
    return gameState.mode === 'race' ? b.score - a.score : a.score - b.score;
  });

  const winner = sortedPlayers[0];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="glass-card p-8 w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold neon-text mb-4">Game Over!</h1>
        
        <div className="my-8">
            <Award size={64} className="mx-auto text-yellow-400" />
            <h2 className="text-3xl font-bold mt-2">Winner: <span className="text-brand-cyan">{winner?.name}</span></h2>
            <p className="text-2xl font-mono">{winner?.score} {gameState.mode === 'race' ? 'WPM' : 'Mistakes'}</p>
        </div>

        <h3 className="text-xl font-bold mb-4">Final Standings</h3>
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="flex justify-between items-center bg-black/30 p-3 rounded-lg text-lg"
            >
              <span>{index + 1}. {player.name}</span>
              <span className="font-mono font-bold">{player.score} {gameState.mode === 'race' ? 'WPM' : 'Mistakes'}</span>
            </motion.div>
          ))}
        </div>

        <button onClick={onPlayAgain} className="neon-button mt-12 flex items-center gap-2 mx-auto">
            <Repeat /> Play Again
        </button>
      </div>
    </motion.div>
  );
};
