import React, { useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { createDayOff, deleteDayOff, formatDate } from '../services/firestore';
import type { DayOff } from '../types';

const DaysOff: React.FC = () => {
  const { userData, daysOff } = useUserData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
  });

  if (!userData) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDayOff({
        ...formData,
        userId: userData.id,
        name: userData.name,
        createdAt: new Date(),
      });
      setShowForm(false);
      setFormData({ date: '' });
    } catch (error) {
      console.error('Error creating day off:', error);
    }
  };

  const handleDelete = async (dayOffId: string) => {
    if (confirm('Удалить этот выходной?')) {
      try {
        await deleteDayOff(dayOffId);
      } catch (error) {
        console.error('Error deleting day off:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Выходные дни
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Всего выходных: <span className="font-semibold">{daysOff.length}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormData({ date: '' });
          }}
          className="btn-primary"
        >
          {showForm ? 'Отмена' : '+ Добавить выходной'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Новый выходной день
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Дата
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">
              Создать
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {daysOff.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет выходных дней</p>
        ) : (
          <div className="space-y-2">
            {daysOff.map(dayOff => (
              <div
                key={dayOff.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {formatDate(dayOff.date)}
                </span>
                <button
                  onClick={() => handleDelete(dayOff.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DaysOff;

