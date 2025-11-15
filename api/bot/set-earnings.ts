import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyASJIpNOj58QUKOEEsFYYiqrldmff9Bk50",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "ultimate-shift-scheduler.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "ultimate-shift-scheduler",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const calculateRating = (user: any): number => {
  const E = user.earnings || 0;
  const T = user.teamEarnings || 0;
  const N = user.invitedCount || 0;
  const A = user.activity || 1;
  const Boost = user.boost || 1;
  return (E * 0.6 + T * 0.3 + N * 10) * A * Boost;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, earnings } = req.body;

    if (!userId || typeof earnings !== 'number') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();
    const oldRating = userData.rating || 0;

    // Update earnings
    await updateDoc(userRef, {
      earnings,
      updatedAt: Timestamp.now(),
    });

    // Recalculate rating
    const newUserData = { ...userData, earnings };
    const newRating = calculateRating(newUserData);

    if (oldRating !== newRating) {
      await updateDoc(userRef, { rating: newRating });
    }

    return res.status(200).json({ success: true, newRating });
  } catch (error: any) {
    console.error('Error setting earnings:', error);
    return res.status(500).json({ error: error.message });
  }
}

