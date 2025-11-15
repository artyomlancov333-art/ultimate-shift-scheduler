import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { userData } = useAuth();

  if (!userData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Профиль
        </h1>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Личная информация
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Имя
            </label>
            <p className="text-lg text-gray-900 dark:text-gray-100 mt-1">
              {userData.name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Логин
            </label>
            <p className="text-lg text-gray-900 dark:text-gray-100 mt-1">
              {userData.login}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Email
            </label>
            <p className="text-lg text-gray-900 dark:text-gray-100 mt-1">
              {userData.email || 'Не указан'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Статус
            </label>
            <p className="text-lg text-gray-900 dark:text-gray-100 mt-1">
              {userData.status === 'active' ? 'Активен' : 
               userData.status === 'inactive' ? 'Неактивен' : 'Приостановлен'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Статистика
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Заработок
            </label>
            <p className="text-2xl font-bold text-sber-green mt-1">
              {userData.earnings.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Командный заработок
            </label>
            <p className="text-2xl font-bold text-sber-green mt-1">
              {userData.teamEarnings.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Рейтинг
            </label>
            <p className="text-2xl font-bold text-sber-green mt-1">
              {userData.rating.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Активность
            </label>
            <p className="text-2xl font-bold text-sber-green mt-1">
              {userData.activity.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Приглашено пользователей
            </label>
            <p className="text-2xl font-bold text-sber-green mt-1">
              {userData.invitedCount}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Boost
            </label>
            <p className="text-2xl font-bold text-sber-green mt-1">
              {userData.boost.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

