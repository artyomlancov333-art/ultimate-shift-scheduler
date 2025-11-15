import { createReferral, getReferrals, getUser, updateUser } from './firestore';
import { recalculateUserRating } from './rating';

/**
 * Создаёт реферальную связь и обновляет счётчик приглашённых
 */
export const addReferral = async (
  inviterId: string,
  inviteeId: string,
  changedBy: string = 'system'
): Promise<void> => {
  // Проверяем, что пользователи существуют
  const inviter = await getUser(inviterId);
  const invitee = await getUser(inviteeId);
  
  if (!inviter) {
    throw new Error(`Inviter ${inviterId} not found`);
  }
  if (!invitee) {
    throw new Error(`Invitee ${inviteeId} not found`);
  }

  // Создаём реферальную связь
  await createReferral({
    inviterId,
    inviteeId,
    createdAt: new Date(),
  });

  // Обновляем счётчик приглашённых
  const newInvitedCount = (inviter.invitedCount || 0) + 1;
  await updateUser(inviterId, { invitedCount: newInvitedCount });

  // Пересчитываем рейтинг
  await recalculateUserRating(inviterId, changedBy, 'invitedCount_changed');
};

/**
 * Получает всех приглашённых пользователей
 */
export const getInvitedUsers = async (inviterId: string) => {
  const referrals = await getReferrals(inviterId);
  const userIds = referrals.map(r => r.inviteeId);
  
  const { getAllUsers } = await import('./firestore');
  const allUsers = await getAllUsers();
  
  return allUsers.filter(user => userIds.includes(user.id));
};

/**
 * Получает реферальное дерево (все уровни)
 */
export const getReferralTree = async (userId: string, maxDepth: number = 3): Promise<any> => {
  const user = await getUser(userId);
  if (!user) return null;

  const invited = await getInvitedUsers(userId);
  
  if (maxDepth <= 0) {
    return {
      user,
      invited: invited.map(u => ({ user: u, invited: [] })),
    };
  }

  const invitedWithTree = await Promise.all(
    invited.map(invitedUser => getReferralTree(invitedUser.id, maxDepth - 1))
  );

  return {
    user,
    invited: invitedWithTree,
  };
};

