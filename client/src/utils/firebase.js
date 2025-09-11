import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC5AmHiTqAdkm8KYGAi1jAdcAcIxFoG2iA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ai-finance-a2978.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ai-finance-a2978",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ai-finance-a2978.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "292752839274",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:292752839274:web:2dd5b9c241c0487e93b013",
  measurementId: "G-DSVMV5NLW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
