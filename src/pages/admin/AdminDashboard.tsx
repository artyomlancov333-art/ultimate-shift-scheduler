import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

const AdminDashboard: React.FC = () => {
  const { globalStats, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Админ-панель
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Все пользователи
          </h3>
          <p className="text-3xl font-bold text-sber-green mt-2">
            {globalStats?.totalUsers || 0}
          </p>
        </Link>

        <Link to="/admin/create-user" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Создать пользователя
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Добавить нового участника
          </p>
        </Link>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            История изменений
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Все изменения в системе
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Глобальная статистика
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Обзор системы
          </p>
        </div>
      </div>

      {globalStats && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Глобальная статистика
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего пользователей</p>
              <p className="text-2xl font-bold text-sber-green">{globalStats.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Активных пользователей</p>
              <p className="text-2xl font-bold text-sber-green">{globalStats.activeUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Общий заработок</p>
              <p className="text-2xl font-bold text-sber-green">
                {globalStats.totalEarnings.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Командный заработок</p>
              <p className="text-2xl font-bold text-sber-green">
                {globalStats.totalTeamEarnings.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего приглашено</p>
              <p className="text-2xl font-bold text-sber-green">{globalStats.totalInvited}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Средний рейтинг</p>
              <p className="text-2xl font-bold text-sber-green">
                {globalStats.averageRating.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

