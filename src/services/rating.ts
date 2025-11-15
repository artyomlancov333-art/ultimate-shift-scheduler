import { updateUser, getUser } from './firestore';
import { addChangeHistory } from './firestore';
import type { User } from '../types';

/**
 * Формула рейтинга: (E * 0.6 + T * 0.3 + N * 10) * A * Boost
 * E - earnings (заработок)
 * T - teamEarnings (командный заработок)
 * N - invitedCount (количество приглашённых)
 * A - activity (активность)
 * Boost - boost (множитель)
 */
export const calculateRating = (user: User): number => {
  const E = user.earnings || 0;
  const T = user.teamEarnings || 0;
  const N = user.invitedCount || 0;
  const A = user.activity || 1;
  const Boost = user.boost || 1;

  return (E * 0.6 + T * 0.3 + N * 10) * A * Boost;
};

/**
 * Пересчитывает рейтинг пользователя и обновляет его в базе
 */
export const recalculateUserRating = async (
  userId: string,
  changedBy: string,
  reason: string
): Promise<void> => {
  const user = await getUser(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const oldRating = user.rating;
  const newRating = calculateRating(user);

  if (oldRating !== newRating) {
    await updateUser(userId, { rating: newRating });
    
    // Добавляем запись в историю изменений
    await addChangeHistory({
      userId,
      field: 'rating',
      oldValue: oldRating,
      newValue: newRating,
      changedBy,
      createdAt: new Date(),
    });
  }
};

/**
 * Пересчитывает рейтинг всех пользователей (для cron)
 */
export const recalculateAllRatings = async (): Promise<void> => {
  const { getAllUsers } = await import('./firestore');
  const users = await getAllUsers();
  
  const promises = users.map(user => 
    recalculateUserRating(user.id, 'system', 'daily_cron')
  );
  
  await Promise.all(promises);
};

