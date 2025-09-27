// src/App.js
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { Results } from './components/Results';
import { createGame, joinGame, getGameStream, startGame, updatePlayerScore } from './supabase';

const LoadingScreen = ({ message }) => (
    <div className="flex items-center justify-center h-screen bg-[#0d1117]">
        <div className="text-2xl font-bold text-gray-400 animate-pulse">{message}</div>
    </div>
);

function App() {
    const [playerId, setPlayerId] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!gameId) return;
        const unsubscribe = getGameStream(gameId, (liveGameState) => {
            setGameState(liveGameState);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [gameId]);

    const handleCreateGame = async (mode, playerName) => {
        setIsLoading(true);
        try {
            const { gameId: newGameId, playerId: newPlayerId } = await createGame(mode, playerName);
            setGameId(newGameId);
            setPlayerId(newPlayerId);
        } catch (error) {
            console.error("Error creating game:", error);
            alert(error.message);
            setIsLoading(false);
        }
    };

    const handleJoinGame = async (code, playerName) => {
        setIsLoading(true);
        try {
            const { gameId: existingGameId, playerId: newPlayerId } = await joinGame(code, playerName);
            setGameId(existingGameId);
            setPlayerId(newPlayerId);
        } catch (error) {
            console.error("Error joining game:", error);
            alert(error.message);
            setIsLoading(false);
        }
    };

    const handleStartGame = () => { startGame(gameId); };
    const handlePlayerFinish = async ({ score, finishTime }) => { await updatePlayerScore(playerId, score, finishTime); };
    const handlePlayAgain = () => {
        setGameId(null);
        setGameState(null);
    };

    if (isLoading && !gameState) {
        return <LoadingScreen message="Connecting to the grid..." />;
    }

    const renderContent = () => {
        if (gameId && gameState) {
            switch (gameState.status) {
                case 'waiting':
                    return <Lobby gameState={gameState} playerId={playerId} onStartGame={handleStartGame} />;
                case 'in-progress':
                    return <Game gameState={gameState} playerId={playerId} onPlayerFinish={handlePlayerFinish} />;
                case 'finished':
                     return <Results gameState={gameState} onPlayAgain={handlePlayAgain} />;
                default:
                    return <Home onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
            }
        }
        return <Home onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
    };

    return (
        <div className="bg-[#0d1117] min-h-screen text-gray-200 font-sans">
            <div className="relative z-10">{renderContent()}</div>
        </div>
    );
}

export default App;
