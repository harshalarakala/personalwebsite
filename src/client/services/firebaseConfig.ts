// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-OVk3DWVJXZYHK6kDvT9vjnjJ1JkXsaU",
  authDomain: "personalwebsite-85df2.firebaseapp.com",
  projectId: "personalwebsite-85df2",
  storageBucket: "personalwebsite-85df2.appspot.com",
  messagingSenderId: "195786252954",
  appId: "1:195786252954:web:6d2b89489907e94dd87523",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "main");
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider }; 