import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyASJIpNOj58QUKOEEsFYYiqrldmff9Bk50",
  authDomain: "ultimate-shift-scheduler.firebaseapp.com",
  projectId: "ultimate-shift-scheduler",
  storageBucket: "ultimate-shift-scheduler.firebasestorage.app",
  messagingSenderId: "930631363666",
  appId: "1:930631363666:web:7e40c51ea33579fcb8038b",
  measurementId: "G-9L577EDB5W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

