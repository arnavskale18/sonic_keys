import React, { useState, useEffect, useCallback } from 'react';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import {Results} from './components/Results';
import { 
    auth, 
    signIn,
    onAuth, 
    createGame,
    joinGame,
    getGameStream,
    startGame,
    updatePlayerScore,
} from './firebase';

// A simple loading component to show during state transitions
const LoadingScreen = ({ message = "Loading Sonic Keys..." }) => (
    <div className="flex items-center justify-center h-screen bg-[#0d1117]">
        <div className="text-2xl font-bold text-gray-400 animate-pulse">{message}</div>
    </div>
);

function App() {
    const  [playerId, setPlayerId] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false); // New state for smoother UX

    // Effect for handling player authentication on initial load
   useEffect(() => {
    // Use onAuth, which is exported from your firebase.js
    const unsubscribe = onAuth((user) => {
        if (user) {
            setPlayerId(user.uid);
            setIsLoading(false);
        } else {
            // Use signIn, which is also exported from your firebase.js
            signIn().catch((error) => {
                console.error("Anonymous sign-in failed:", error);
                setIsLoading(false);
            });
        }
    });
    return () => unsubscribe();
}, []);

    // Effect for subscribing to real-time game updates from Firestore
    useEffect(() => {
        if (!gameId) {
            setGameState(null);
            return;
        }

        const unsubscribe = getGameStream(gameId, (gameData) => {
            if (gameData) {
                setGameState(gameData);
                // We've received the new game state, so we are no longer transitioning
                setIsTransitioning(false); 
            } else {
                console.warn("The game you were in no longer exists.");
                setGameId(null);
                setGameState(null);
            }
        });

        return () => unsubscribe();
    }, [gameId]);

    // --- Handler Functions ---

    const handleCreateGame = useCallback(async (mode, playerName) => {
        if (!playerId) return;
        setIsTransitioning(true);
        try {
            const newGameId = await createGame(playerId, playerName, mode);
            setGameId(newGameId);
        } catch (error) {
            console.error("Error creating game:", error);
            setIsTransitioning(false);
        }
    }, [playerId]);

    const handleJoinGame = useCallback(async (idToJoin, playerName) => {
        if (!playerId) return;
        setIsTransitioning(true);
        try {
            await joinGame(idToJoin, playerId, playerName);
            setGameId(idToJoin);
        } catch (error) {
            console.error("Error joining game:", error);
            // In a real app, you'd set an error state to show in the UI
            setIsTransitioning(false);
        }
    }, [playerId]);

    const handleStartGame = useCallback(async () => {
        if (!gameId || !gameState) return;
        if (gameState.hostId === playerId) {
            await startGame(gameId);
        }
    }, [gameId, gameState, playerId]);
    
    // --- Scoring Logic ---

    const handlePlayerFinish = useCallback(async (data) => {
        if (!gameId || !gameState || !playerId) return;

        let finalScore = 0;
        
        if (gameState.mode === 'race') {
            const finishTime = data.finishTime;
            // Robustness: Ensure startTime exists before proceeding
            if (!gameState.startTime) {
                console.error("Cannot calculate score: Game start time is missing.");
                return;
            }
            const startTime = gameState.startTime.toDate();
            const durationInSeconds = (finishTime.getTime() - startTime.getTime()) / 1000;
            
            const baseScore = Math.max(0, 10000 - (durationInSeconds * 100));

            const finishers = Object.values(gameState.players).filter(p => p.finishTime).length;
            let rankBonus = 0;
            if (finishers === 0) rankBonus = 1500; // 1st place
            else if (finishers === 1) rankBonus = 750; // 2nd place
            else if (finishers === 2) rankBonus = 350; // 3rd place

            finalScore = Math.round(baseScore + rankBonus);
            await updatePlayerScore(gameId, playerId, finalScore, finishTime);

        } else if (gameState.mode === 'endurance') {
            const mistakes = data.mistakes;
            const basePoints = 5000;
            finalScore = Math.max(0, basePoints - (mistakes * 100));
            // Store finish time for endurance too, for consistency and potential tie-breaking
            await updatePlayerScore(gameId, playerId, finalScore, new Date());
        }

    }, [gameId, gameState, playerId]);
    
    const handlePlayAgain = () => {
        setGameId(null);
        setGameState(null);
    };

    // --- View Rendering Logic ---

    if (isLoading) {
        return <LoadingScreen message="Authenticating..." />;
    }
    
    if (isTransitioning) {
        return <LoadingScreen message="Entering the Grid..." />;
    }

    const renderContent = () => {
        if (gameId && gameState) {
            switch (gameState.status) {
                case 'waiting':
                    return <Lobby 
                                gameId={gameId} 
                                gameState={gameState} 
                                playerId={playerId}
                                onStartGame={handleStartGame} 
                            />;
                case 'in-progress':
                    return <Game 
                                gameState={gameState} 
                                playerId={playerId}
                                onPlayerFinish={handlePlayerFinish} 
                            />;
                case 'finished':
                    return <Results 
                                gameState={gameState} 
                                onPlayAgain={handlePlayAgain}
                            />;
                default:
                    // Fallback to home if status is unexpected
                    return <Home onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
            }
        }
        return <Home onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
    };

    return (
        <div className="bg-[#0d1117] min-h-screen text-gray-200 font-sans">
            <div className="relative z-10">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;

