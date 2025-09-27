import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- IMPORTANT: Replace with your Firebase project's configuration ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- AUTHENTICATION ---
// These are the missing functions that App.js needs.
export const signIn = () => signInAnonymously(auth);
export const onAuth = (callback) => onAuthStateChanged(auth, callback);

// --- FIRESTORE FUNCTIONS ---

// A library of paragraphs for the game challenges
const paragraphs = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. A true test of typing skill and accuracy.",
    "In the heart of the neon-drenched city, rogue AI plotted in the datastreams. Only a keyboard warrior with lightning reflexes could decode the secrets.",
    "Beyond the shimmering event horizon, time itself warped. Every keystroke was a choice, every word a new timeline in the cosmic expanse.",
    "The scent of ozone filled the air as the storm gathered. The old server hummed, its data a treasure trove for the one who could type fast enough to claim it.",
    "Synthwave music pulsed from the speakers, a rhythmic heartbeat for the digital race. The finish line was not a place, but a moment of pure, unadulterated speed."
];

// Generates a random, human-readable game ID
const generateGameId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

/**
 * Creates a new game document in Firestore.
 */
export const createGame = async (hostId, hostName, mode) => {
  const gameId = generateGameId();
  const gameRef = doc(db, 'games', gameId);
  
  await setDoc(gameRef, {
    gameId: gameId,
    mode: mode,
    status: 'waiting',
    paragraph: paragraphs[Math.floor(Math.random() * paragraphs.length)],
    hostId: hostId,
    startTime: null,
    players: {
      [hostId]: {
        name: hostName,
        score: 0,
        finishTime: null,
      }
    }
  });
  return gameId;
};

/**
 * Adds a player to an existing game.
 */
export const joinGame = async (gameId, playerId, playerName) => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    throw new Error("Game not found!");
  }
  if (gameSnap.data().status !== 'waiting') {
    throw new Error("Game has already started!");
  }

  // CORRECTED: Uses backticks for the template literal.
  const playerPath = `players.${playerId}`;
  await updateDoc(gameRef, {
    [playerPath]: {
      name: playerName,
      score: 0,
      finishTime: null,
    }
  });
};

/**
 * Starts the game, setting its status to 'in-progress'.
 */
export const startGame = async (gameId) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    status: 'in-progress',
    startTime: serverTimestamp()
  });
};

/**
 * CORRECTED: Updates a player's score and finish time in Firestore.
 * The name and parameters now match what App.js is calling.
 */
export const updatePlayerScore = async (gameId, playerId, score, finishTime) => {
    const gameRef = doc(db, 'games', gameId);
    // CORRECTED: Uses backticks for the template literals.
    const scorePath = `players.${playerId}.score`;
    const finishTimePath = `players.${playerId}.finishTime`;
    
    await updateDoc(gameRef, {
        [scorePath]: score,
        [finishTimePath]: finishTime.getTime()
    });
};

/**
 * Listens for real-time updates to a game document.
 */
export const getGameStream = (gameId, callback) => {
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(gameRef, (doc) => {
    callback(doc.data());
  });
};
