import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToSlots, subscribeToDaysOff, subscribeToReferrals } from '../services/firestore';
import { getInvitedUsers, getReferralTree } from '../services/referrals';
import type { Slot, DayOff, User } from '../types';

export const useUserData = () => {
  const { userData } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [referralTree, setReferralTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) {
      setSlots([]);
      setDaysOff([]);
      setInvitedUsers([]);
      setReferralTree(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Подписка на слоты
    const unsubscribeSlots = subscribeToSlots((newSlots) => {
      setSlots(newSlots.filter(slot => slot.userId === userData.id));
    }, userData.id);

    // Подписка на выходные
    const unsubscribeDaysOff = subscribeToDaysOff((newDaysOff) => {
      setDaysOff(newDaysOff.filter(dayOff => dayOff.userId === userData.id));
    }, userData.id);

    // Загрузка приглашённых пользователей
    const loadInvitedUsers = async () => {
      try {
        const invited = await getInvitedUsers(userData.id);
        setInvitedUsers(invited);
      } catch (error) {
        console.error('Error loading invited users:', error);
      }
    };

    // Загрузка реферального дерева
    const loadReferralTree = async () => {
      try {
        const tree = await getReferralTree(userData.id);
        setReferralTree(tree);
      } catch (error) {
        console.error('Error loading referral tree:', error);
      }
    };

    loadInvitedUsers();
    loadReferralTree();
    setLoading(false);

    return () => {
      unsubscribeSlots();
      unsubscribeDaysOff();
    };
  }, [userData]);

  return {
    userData,
    slots,
    daysOff,
    invitedUsers,
    referralTree,
    loading,
  };
};

