import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

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
  // Verify cron secret if needed
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    const updates = usersSnap.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const oldRating = userData.rating || 0;
      const newRating = calculateRating(userData);
      
      if (oldRating !== newRating) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          rating: newRating,
          updatedAt: Timestamp.now(),
        });
      }
    });
    
    await Promise.all(updates);
    
    return res.status(200).json({ 
      success: true, 
      message: `Ratings recalculated for ${usersSnap.docs.length} users` 
    });
  } catch (error: any) {
    console.error('Error recalculating ratings:', error);
    return res.status(500).json({ error: error.message });
  }
}

