import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

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

    // Get referrals
    const referralsRef = collection(db, 'referrals');
    const q = query(referralsRef, where('inviterId', '==', userId));
    const referralsSnap = await getDocs(q);
    
    const inviteeIds = referralsSnap.docs.map(doc => doc.data().inviteeId);
    
    // Get invited users
    const invitedUsers = await Promise.all(
      inviteeIds.map(async (inviteeId) => {
        const userRef = doc(db, 'users', inviteeId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          return {
            id: userSnap.id,
            name: data.name,
            login: data.login,
            rating: data.rating || 0,
            earnings: data.earnings || 0,
            invitedCount: data.invitedCount || 0,
          };
        }
        return null;
      })
    );

    return res.status(200).json({
      invitedCount: invitedUsers.filter(u => u !== null).length,
      invited: invitedUsers.filter(u => u !== null),
    });
  } catch (error: any) {
    console.error('Error getting team:', error);
    return res.status(500).json({ error: error.message });
  }
}

