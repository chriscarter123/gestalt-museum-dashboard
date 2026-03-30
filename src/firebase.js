import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAi-EeTlhYrfAG7AnJSCYIM_6fls-LPDQE",
  authDomain: "gestalt-17ce0.firebaseapp.com",
  projectId: "gestalt-17ce0",
  storageBucket: "gestalt-17ce0.firebasestorage.app",
  messagingSenderId: "599017126322",
  appId: "1:599017126322:web:6cd4e80ef80caf92f9ccab",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
