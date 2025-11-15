import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyASJIpNOj58QUKOEEsFYYiqrldmff9Bk50",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "ultimate-shift-scheduler.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "ultimate-shift-scheduler",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();

    return res.status(200).json({
      id: userSnap.id,
      name: userData.name,
      login: userData.login,
      earnings: userData.earnings || 0,
      teamEarnings: userData.teamEarnings || 0,
      activity: userData.activity || 1,
      invitedCount: userData.invitedCount || 0,
      rating: userData.rating || 0,
      boost: userData.boost || 1,
      status: userData.status,
    });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ error: error.message });
  }
}

