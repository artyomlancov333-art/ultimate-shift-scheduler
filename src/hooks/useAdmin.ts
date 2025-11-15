import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllUsers, 
  subscribeToUsers, 
  updateUser, 
  deleteUser,
  getChangeHistory,
  subscribeToChangeHistory
} from '../services/firestore';
import { recalculateUserRating } from '../services/rating';
import { addChangeHistory } from '../services/firestore';
import type { User, ChangeHistory, GlobalStats } from '../types';

export const useAdmin = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      setChangeHistory([]);
      setGlobalStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Подписка на пользователей
    const unsubscribeUsers = subscribeToUsers((newUsers) => {
      setUsers(newUsers);
      calculateGlobalStats(newUsers);
    });

    // Подписка на историю изменений
    const unsubscribeHistory = subscribeToChangeHistory((history) => {
      setChangeHistory(history);
    });

    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeHistory();
    };
  }, [isAdmin]);

  const calculateGlobalStats = (usersList: User[]) => {
    const stats: GlobalStats = {
      totalUsers: usersList.length,
      activeUsers: usersList.filter(u => u.status === 'active').length,
      totalEarnings: usersList.reduce((sum, u) => sum + (u.earnings || 0), 0),
      totalTeamEarnings: usersList.reduce((sum, u) => sum + (u.teamEarnings || 0), 0),
      totalInvited: usersList.reduce((sum, u) => sum + (u.invitedCount || 0), 0),
      averageRating: usersList.length > 0
        ? usersList.reduce((sum, u) => sum + (u.rating || 0), 0) / usersList.length
        : 0,
    };
    setGlobalStats(stats);
  };

  const updateUserField = async (
    userId: string,
    field: keyof User,
    value: any,
    reason: string = 'admin_edit'
  ) => {
    if (!isAdmin || !userData) return;

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const oldValue = user[field];
    
    // Обновляем поле
    await updateUser(userId, { [field]: value });

    // Добавляем в историю
    await addChangeHistory({
      userId,
      field: field as string,
      oldValue,
      newValue: value,
      changedBy: userData.id,
      createdAt: new Date(),
    });

    // Если изменяются поля, влияющие на рейтинг, пересчитываем
    if (['earnings', 'teamEarnings', 'activity', 'invitedCount', 'boost'].includes(field)) {
      await recalculateUserRating(userId, userData.id, `${field}_changed`);
    }
  };

  const deleteUserById = async (userId: string) => {
    if (!isAdmin) return;
    await deleteUser(userId);
  };

  const addHistoryEntry = async (
    userId: string,
    field: string,
    oldValue: any,
    newValue: any
  ) => {
    if (!isAdmin || !userData) return;
    
    await addChangeHistory({
      userId,
      field,
      oldValue,
      newValue,
      changedBy: userData.id,
      createdAt: new Date(),
    });
  };

  return {
    isAdmin,
    users,
    changeHistory,
    globalStats,
    loading,
    updateUserField,
    deleteUserById,
    addHistoryEntry,
  };
};

