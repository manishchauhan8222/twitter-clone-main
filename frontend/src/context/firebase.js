import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlD4wrPfGjrSCwe1EVgBsKsO8GQYjXfEg",
  authDomain: "twitter-38a6d.firebaseapp.com",
  projectId: "twitter-38a6d",
  storageBucket: "twitter-38a6d.appspot.com",
  messagingSenderId: "208501542634",
  appId: "1:208501542634:web:5795eab81fe23fd3ca9193",
  measurementId: "G-849TGHNRDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
