import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  writeBatch,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, Slot, DayOff, Referral, ChangeHistory } from '../types';

// Collections
const USERS_COLLECTION = 'users';
const SLOTS_COLLECTION = 'slots';
const DAYS_OFF_COLLECTION = 'daysOff';
const REFERRALS_COLLECTION = 'referrals';
const CHANGE_HISTORY_COLLECTION = 'changeHistory';

// Users
export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const q = query(collection(db, USERS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, USERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    });
    callback(users);
  });
};

export const createUser = async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(docRef, {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await deleteDoc(doc(db, USERS_COLLECTION, userId));
};

// Slots
export const getSlots = async (userId?: string): Promise<Slot[]> => {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  constraints.push(orderBy('date', 'desc'));
  constraints.push(orderBy('startTime', 'asc'));
  
  const q = query(collection(db, SLOTS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    } as Slot;
  });
};

export const subscribeToSlots = (callback: (slots: Slot[]) => void, userId?: string) => {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  constraints.push(orderBy('date', 'desc'));
  constraints.push(orderBy('startTime', 'asc'));
  
  const q = query(collection(db, SLOTS_COLLECTION), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as Slot;
    });
    callback(slots);
  });
};

export const createSlot = async (slotData: Omit<Slot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = doc(collection(db, SLOTS_COLLECTION));
  await setDoc(docRef, {
    ...slotData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateSlot = async (slotId: string, updates: Partial<Slot>): Promise<void> => {
  const docRef = doc(db, SLOTS_COLLECTION, slotId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteSlot = async (slotId: string): Promise<void> => {
  await deleteDoc(doc(db, SLOTS_COLLECTION, slotId));
};

// Days Off
export const getDaysOff = async (userId?: string): Promise<DayOff[]> => {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  constraints.push(orderBy('date', 'desc'));
  
  const q = query(collection(db, DAYS_OFF_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as DayOff;
  });
};

export const subscribeToDaysOff = (callback: (daysOff: DayOff[]) => void, userId?: string) => {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  constraints.push(orderBy('date', 'desc'));
  
  const q = query(collection(db, DAYS_OFF_COLLECTION), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const daysOff = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as DayOff;
    });
    callback(daysOff);
  });
};

export const createDayOff = async (dayOffData: Omit<DayOff, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = doc(collection(db, DAYS_OFF_COLLECTION));
  await setDoc(docRef, {
    ...dayOffData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const deleteDayOff = async (dayOffId: string): Promise<void> => {
  await deleteDoc(doc(db, DAYS_OFF_COLLECTION, dayOffId));
};

// Referrals
export const getReferrals = async (inviterId?: string): Promise<Referral[]> => {
  const constraints: QueryConstraint[] = [];
  if (inviterId) {
    constraints.push(where('inviterId', '==', inviterId));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  
  const q = query(collection(db, REFERRALS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Referral;
  });
};

export const subscribeToReferrals = (callback: (referrals: Referral[]) => void, inviterId?: string) => {
  const constraints: QueryConstraint[] = [];
  if (inviterId) {
    constraints.push(where('inviterId', '==', inviterId));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  
  const q = query(collection(db, REFERRALS_COLLECTION), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const referrals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Referral;
    });
    callback(referrals);
  });
};

export const createReferral = async (referralData: Omit<Referral, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = doc(collection(db, REFERRALS_COLLECTION));
  await setDoc(docRef, {
    ...referralData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// Change History
export const getChangeHistory = async (userId?: string): Promise<ChangeHistory[]> => {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  
  const q = query(collection(db, CHANGE_HISTORY_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as ChangeHistory;
  });
};

export const subscribeToChangeHistory = (callback: (history: ChangeHistory[]) => void, userId?: string) => {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  
  const q = query(collection(db, CHANGE_HISTORY_COLLECTION), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ChangeHistory;
    });
    callback(history);
  });
};

export const addChangeHistory = async (historyData: Omit<ChangeHistory, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = doc(collection(db, CHANGE_HISTORY_COLLECTION));
  await setDoc(docRef, {
    ...historyData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// Utility functions
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return timeString;
};

export const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  const diffMinutes = endTotalMinutes - startTotalMinutes;
  return diffMinutes / 60;
};

