import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import type { User } from '../../types';

const AdminUsers: React.FC = () => {
  const { users, loading } = useAdmin();
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'high' | 'low'>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  // Sort users by rating
  const sortedUsers = [...users].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  // Apply filters
  const filteredUsers = sortedUsers.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    if (activityFilter === 'high' && user.activity < 1.5) return false;
    if (activityFilter === 'low' && user.activity >= 1.5) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Все пользователи
        </h1>
        <Link to="/admin/create-user" className="btn-primary">
          + Создать пользователя
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Фильтры
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Роль
            </label>
            <select
              className="input-field"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="all">Все</option>
              <option value="user">Пользователь</option>
              <option value="admin">Админ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Статус
            </label>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Все</option>
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
              <option value="suspended">Приостановлен</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Активность
            </label>
            <select
              className="input-field"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value as any)}
            >
              <option value="all">Все</option>
              <option value="high">Высокая</option>
              <option value="low">Низкая</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                Заработок
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Командный заработок
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Приглашено
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Активность
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Статус
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Рейтинг
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.earnings.toLocaleString('ru-RU')} ₽
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.teamEarnings.toLocaleString('ru-RU')} ₽
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.invitedCount}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {user.activity.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : user.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.status === 'active' ? 'Активен' :
                     user.status === 'inactive' ? 'Неактивен' : 'Приостановлен'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-sber-green">
                    {user.rating.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="text-sm text-sber-green hover:underline"
                  >
                    Просмотр
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

