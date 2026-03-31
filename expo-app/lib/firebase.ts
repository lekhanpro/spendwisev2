import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCtQkTfAaPNNHoc4vdn0DDYg9or7QiUTgM",
  authDomain: "spendwise-be25a.firebaseapp.com",
  databaseURL: "https://spendwise-be25a-default-rtdb.firebaseio.com",
  projectId: "spendwise-be25a",
  storageBucket: "spendwise-be25a.firebasestorage.app",
  messagingSenderId: "587962306992",
  appId: "1:587962306992:web:abd7374fdab20b485b4675",
  measurementId: "G-6CTB1CDSW8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
