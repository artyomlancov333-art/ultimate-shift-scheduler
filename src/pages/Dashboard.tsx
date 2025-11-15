import React from 'react';
import { useUserData } from '../hooks/useUserData';
import { calculateHours } from '../services/firestore';
import { formatDate } from '../services/firestore';

const Dashboard: React.FC = () => {
  const { userData, slots, daysOff, loading } = useUserData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Calculate stats
  const totalHours = slots.reduce((sum, slot) => {
    return sum + calculateHours(slot.startTime, slot.endTime);
  }, 0);

  const thisMonthSlots = slots.filter(slot => {
    const slotDate = new Date(slot.date);
    const now = new Date();
    return slotDate.getMonth() === now.getMonth() && 
           slotDate.getFullYear() === now.getFullYear();
  });

  const thisMonthHours = thisMonthSlots.reduce((sum, slot) => {
    return sum + calculateHours(slot.startTime, slot.endTime);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Добро пожаловать, {userData.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Логин: {userData.login}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Заработок</h3>
          <p className="text-2xl font-bold text-sber-green mt-2">
            {userData.earnings.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Командный заработок</h3>
          <p className="text-2xl font-bold text-sber-green mt-2">
            {userData.teamEarnings.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Рейтинг</h3>
          <p className="text-2xl font-bold text-sber-green mt-2">
            {userData.rating.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Активность</h3>
          <p className="text-2xl font-bold text-sber-green mt-2">
            {userData.activity.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Hours Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Всего часов
          </h3>
          <p className="text-3xl font-bold text-sber-green">
            {totalHours.toFixed(2)} ч
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Часов в этом месяце
          </h3>
          <p className="text-3xl font-bold text-sber-green">
            {thisMonthHours.toFixed(2)} ч
          </p>
        </div>
      </div>

      {/* Recent Slots */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Последние слоты
        </h2>
        {slots.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет слотов</p>
        ) : (
          <div className="space-y-2">
            {slots.slice(0, 5).map(slot => (
              <div
                key={slot.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(slot.date)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <p className="text-sber-green font-semibold">
                  {calculateHours(slot.startTime, slot.endTime).toFixed(2)} ч
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

