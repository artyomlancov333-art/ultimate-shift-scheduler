import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers } from '../services/firestore';
import type { User } from '../types';

const Leaderboard: React.FC = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        // Sort by rating descending
        allUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  const currentUserPosition = userData 
    ? users.findIndex(u => u.id === userData.id) + 1
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Рейтинг
        </h1>
        {currentUserPosition && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ваша позиция: <span className="font-semibold text-sber-green">#{currentUserPosition}</span>
          </p>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Место
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Имя
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Логин
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Рейтинг
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Заработок
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Командный заработок
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Приглашено
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 dark:border-gray-700 ${
                  user.id === userData?.id
                    ? 'bg-sber-green/10 dark:bg-sber-green/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <td className="py-3 px-4">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                  {user.name}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                  {user.login}
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-sber-green">
                    {user.rating.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.earnings.toLocaleString('ru-RU')} ₽
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.teamEarnings.toLocaleString('ru-RU')} ₽
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.invitedCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;

