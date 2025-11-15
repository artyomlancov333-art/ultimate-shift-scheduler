export interface User {
  id: string;
  name: string;
  login: string;
  email?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  earnings: number; // E
  teamEarnings: number; // T
  activity: number; // A
  invitedCount: number; // N
  rating: number;
  boost: number;
  inviterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Slot {
  id: string;
  userId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  comment?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DayOff {
  id: string;
  userId: string;
  name: string;
  date: string;
  createdAt: Date;
}

export interface Referral {
  id: string;
  inviterId: string;
  inviteeId: string;
  createdAt: Date;
}

export interface ChangeHistory {
  id: string;
  userId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  createdAt: Date;
}

export interface GlobalStats {
  totalUsers: number;
  activeUsers: number;
  totalEarnings: number;
  totalTeamEarnings: number;
  totalInvited: number;
  averageRating: number;
}

