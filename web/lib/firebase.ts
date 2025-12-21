// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



