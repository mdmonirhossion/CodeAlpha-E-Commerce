import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAi1j7kTcZim1l0yLtMv22_NT5VW3zqGuk",
  authDomain: "e-commerce-store-3c79f.firebaseapp.com",
  projectId: "e-commerce-store-3c79f",
  storageBucket: "e-commerce-store-3c79f.firebasestorage.app",
  messagingSenderId: "289197467186",
  appId: "1:289197467186:web:98fe0cff775f9386dafe2b",
  measurementId: "G-2BGDZW8EEX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
