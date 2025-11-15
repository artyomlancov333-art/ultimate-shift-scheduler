import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    const allUsers = usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      rating: doc.data().rating || 0,
    }));
    
    // Sort by rating
    allUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    const userPosition = allUsers.findIndex(u => u.id === userId) + 1;
    const user = allUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      position: userPosition,
      rating: user.rating,
      totalUsers: allUsers.length,
      topUsers: allUsers.slice(0, 10).map((u, index) => ({
        position: index + 1,
        name: u.name,
        login: u.login,
        rating: u.rating,
      })),
    });
  } catch (error: any) {
    console.error('Error getting rating:', error);
    return res.status(500).json({ error: error.message });
  }
}

