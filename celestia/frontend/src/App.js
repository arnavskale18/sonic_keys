// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { Results } from './components/Results';
import LetterGlitch from './components/LetterGlitch';
import TargetCursor from './components/TargetCursor'; 
import StoryTrial from './components/StoryTrial'; // ADDED: For Solo Mode
import { 
    createGame, 
    joinGame, 
    getGameStream, 
    startGame, 
    updatePlayerScore, // Kept for friend's original multiplayer logic
    updatePlayerProgress,
    finishGame 
} from './supabase';

const LoadingScreen = ({ message }) => (
    <div className="flex items-center justify-center h-screen bg-[#0d1117]">
        <div className="text-2xl font-bold text-gray-400 animate-pulse">{message}</div>
    </div>
);

// --- Story Mode Constants (Very Easy Demo Text & Difficulty) ---
const STORY_TRIALS = [
    { 
        id: 't1', 
        mode: 'time_trial', 
        text: "The main key is inside. We must find it now. The door is locked tight. It needs a quick code.", 
        wpmMin: 15, 
        errMax: 15
    },
    { 
        id: 's1', 
        mode: 'sonic_lock', 
        text: "Listen to the steady beat. Type your words in time. Do not rush or slow down. Keep the rhythm perfect.", 
        wpmMin: 10, 
        errMax: 10
    },
    { 
        id: 'f1', 
        mode: 'flicker_test', 
        text: "A flash of light shows the text. Remember the words fast. They vanish right away. Type what you saw first.", 
        wpmMin: 15, 
        errMax: 20
    },
    { 
        id: 't2', 
        mode: 'time_trial', 
        text: "This is the last section. The code must be perfect. Type until you are done. The final lock will open.", 
        wpmMin: 20, 
        errMax: 10
    },
];
// --------------------------------------------------------

function App() {
    const [playerId, setPlayerId] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // ADDED: State for Player Name, High Score, and View Routing
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');
    const [highScore, setHighScore] = useState(() => JSON.parse(localStorage.getItem('soloHighScore')) || null);
    const [view, setView] = useState('home'); 
    
    // ADDED: State for Solo Mode progress
    const [storyProgress, setStoryProgress] = useState(0); 
    const [soloStartTime, setSoloStartTime] = useState(null); 

    useEffect(() => {
        if (!gameId || view !== 'multi') return; // Only listen for multiplayer games
        const unsubscribe = getGameStream(gameId, (liveGameState) => {
            setGameState(liveGameState);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [gameId, view]);

    // ADDED: Effect to persist playerName
    useEffect(() => {
        if (playerName) {
            localStorage.setItem('playerName', playerName);
        } else {
            localStorage.removeItem('playerName');
        }
    }, [playerName]);
    
    // ADDED: Local High Score Saving Logic
    const saveLocalHighScore = (name, timeMs) => {
        let newHighScore = false;
        if (!highScore || timeMs < highScore.timeMs) {
            const newScore = {
                name: name,
                timeMs: timeMs,
                date: new Date().toISOString()
            };
            localStorage.setItem('soloHighScore', JSON.stringify(newScore));
            setHighScore(newScore);
            newHighScore = true;
        }
        return newHighScore;
    };
    // -------------------------------------

    const handleCreateGame = async (mode, name) => {
        setIsLoading(true);
        setPlayerName(name); // Save name to state and storage
        try {
            const { gameId: newGameId, playerId: newPlayerId } = await createGame(mode, name);
            setGameId(newGameId);
            setPlayerId(newPlayerId);
            setView('multi'); // Route to lobby
        } catch (error) { console.error("Error creating game:", error); alert(error.message); setIsLoading(false); }
    };

    const handleJoinGame = async (code, name) => {
        setIsLoading(true);
        setPlayerName(name); // Save name to state and storage
        try {
            const { gameId: existingGameId, playerId: newPlayerId } = await joinGame(code, name);
            setGameId(existingGameId);
            setPlayerId(newPlayerId);
            setView('multi'); // Route to lobby
        } catch (error) { console.error("Error joining game:", error); alert(error.message); setIsLoading(false); }
    };

    const handlePlayerProgress = async ({ progress, wpm, score }) => {
        // Keeping friend's original logic for multiplayer progress update
        if (playerId) {
            const currentScore = (gameState?.mode === 'race' ? wpm : score) ?? 0;
            await updatePlayerProgress(playerId, progress, currentScore);
        }
    };

    const handleStartGame = () => { startGame(gameId); };

    const handlePlayerFinish = async ({ score, finishTime }) => { 
        // Keeping friend's original logic for multiplayer finish
        await updatePlayerScore(playerId, score, finishTime);
        await finishGame(gameId);
    };

    const handlePlayAgain = () => { setGameId(null); setGameState(null); setView('home'); }; // Added setView('home')

    // ADDED: Solo Mode Handlers
    const startStoryMode = useCallback((name) => {
        setPlayerName(name); 
        setView('solo');
        setGameId(null);
        setGameState(null);
        setStoryProgress(0);
        setSoloStartTime(Date.now()); 
    }, [setPlayerName]);

    const handleBackToHome = useCallback(() => {
        setView('home');
        setGameId(null);
        setGameState(null);
    }, []);

    const handleTrialComplete = useCallback((isSuccessful) => {
        if (!isSuccessful) {
            alert("Integrity Check Failed. Retrying current trial.");
            return;
        }

        if (storyProgress < STORY_TRIALS.length - 1) {
            alert(`Trial ${storyProgress + 1} Cleared! Starting next trial...`);
            setStoryProgress(prev => prev + 1);
        } else {
            const finalTimeMs = Date.now() - soloStartTime;
            
            // --- Save Local High Score ---
            const newRecord = saveLocalHighScore(playerName, finalTimeMs);
            // -----------------------------
            
            alert(`Root Override Key Inputted. Mission Accomplished! Time: ${(finalTimeMs / 1000).toFixed(2)}s. ${newRecord ? "NEW LOCAL HIGH SCORE!" : ""}`);
            
            setView('home'); 
            setStoryProgress(0);
            setSoloStartTime(null);
        }
    }, [storyProgress, soloStartTime, playerName, saveLocalHighScore]);
    // --------------------------------

    if (isLoading && !gameState) {
        return <LoadingScreen message="Connecting to the grid..." />;
    }

    const renderContent = () => {
        if (view === 'solo') { 
            const currentTrial = STORY_TRIALS[storyProgress];
            return (
                <StoryTrial 
                    key={currentTrial.id}
                    mode={currentTrial.mode} 
                    text={currentTrial.text} 
                    wpmMin={currentTrial.wpmMin} 
                    errMax={currentTrial.errMax}
                    onComplete={handleTrialComplete}
                />
            );
        }
        
        if (gameId && gameState) {
            switch (gameState.status) {
                case 'waiting':
                    return <Lobby gameState={gameState} playerId={playerId} onStartGame={handleStartGame} onBack={handleBackToHome} />; // Added onBack
                case 'in-progress':
                    return <Game gameState={gameState} playerId={playerId} onPlayerFinish={handlePlayerFinish} onPlayerProgress={handlePlayerProgress} onBack={handleBackToHome} />; // Added onBack
                case 'finished':
                     return <Results gameState={gameState} onPlayAgain={handlePlayAgain} />;
                default:
                    // Passing solo handlers, name, and high score
                    return <Home 
                        onCreateGame={handleCreateGame} 
                        onJoinGame={handleJoinGame} 
                        onStartStory={startStoryMode}
                        playerName={playerName}
                        highScore={highScore}
                    />;
            }
        }
        // Default Home view
        return <Home 
            onCreateGame={handleCreateGame} 
            onJoinGame={handleJoinGame} 
            onStartStory={startStoryMode}
            playerName={playerName}
            highScore={highScore}
        />;
    };

    return (
        <div className="min-h-screen text-gray-200 font-sans">
            
            <LetterGlitch /> 
            
            <TargetCursor 
              targetSelector=".cursor-target" 
              hideDefaultCursor={true}
            />
            
            <div className="relative z-10">{renderContent()}</div>
        </div>
    );
}

export default App;
