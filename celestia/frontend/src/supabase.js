// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znfwftivsmdvlpqqotwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZndmdGl2c21kdmxwcXFvdHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDAxMTUsImV4cCI6MjA3NDU3NjExNX0.6NvzeEYSHIW3b6fek9n1YAD9IcKy2M2t6Wo4IvFeyxE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const paragraphs = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    "In the heart of the neon-drenched city, cybernetic racers pushed their machines to the absolute limit.",
    "Code flows like a digital river, carving canyons of logic through mountains of raw data."
];

const generateGameCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let result = '';
    for(let i=0; i<4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    result += '-';
    for(let i=0; i<4; i++) result += nums.charAt(Math.floor(Math.random() * nums.length));
    return result;
};

export const createGame = async (mode, playerName) => {
    const gameCode = generateGameCode();
    const { data: game, error: gameError } = await supabase.from('games').insert({ game_code: gameCode, mode, status: 'waiting', paragraph: paragraphs[Math.floor(Math.random() * paragraphs.length)] }).select().single();
    if (gameError) throw gameError;
    const { data: player, error: playerError } = await supabase.from('players').insert({ name: playerName, game_id: game.id, is_host: true }).select().single();
    if (playerError) throw playerError;
    await supabase.from('games').update({ host_id: player.id }).eq('id', game.id);
    return { gameId: game.id, playerId: player.id };
};

export const joinGame = async (gameCode, playerName) => {
    const { data: game, error: gameError } = await supabase.from('games').select('id, status').eq('game_code', gameCode.toUpperCase()).single();
    if (gameError || !game) throw new Error("Game not found!");
    if (game.status !== 'waiting') throw new Error("Game has already started!");
    const { data: player, error: playerError } = await supabase.from('players').insert({ name: playerName, game_id: game.id }).select().single();
    if (playerError) throw playerError;
    return { gameId: game.id, playerId: player.id };
};

export const getGameStream = (gameId, callback) => {
    const channel = supabase.channel(`game-${gameId}`);
    const fetchAndCallback = async () => {
        const { data } = await supabase.from('games').select('*, players(*)').eq('id', gameId).single();
        if (!data) {
            callback(null);
            return;
        }
        const playersArray = data.players || [];
        const formattedGameState = {
            ...data,
            players: playersArray.reduce((acc, player) => {
                acc[player.id] = player;
                return acc;
            }, {})
        };
        callback(formattedGameState);
    };
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` }, fetchAndCallback)
           .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, fetchAndCallback)
           .subscribe((status) => {
               if (status === 'SUBSCRIBED') {
                   fetchAndCallback();
               }
           });
    return () => supabase.removeChannel(channel);
};

export const updatePlayerScore = async (playerId, score, finishTime) => {
    const updateData = { score };
    if (finishTime) {
        updateData.finish_time = new Date().toISOString();
    }
    await supabase.from('players').update(updateData).eq('id', playerId);
};

export const updatePlayerProgress = async (playerId, progress, score) => {
    await supabase
        .from('players')
        .update({ progress: progress, score: score })
        .eq('id', playerId);
};

export const startGame = async (gameId) => {
     await supabase.from('games').update({ status: 'in-progress', start_time: new Date().toISOString() }).eq('id', gameId);
};

export const finishGame = async (gameId) => {
    await supabase
        .from('games')
        .update({ status: 'finished' })
        .eq('id', gameId);
};
