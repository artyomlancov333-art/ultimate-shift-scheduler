import React, { useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { createSlot, updateSlot, deleteSlot, calculateHours, formatDate } from '../services/firestore';
import type { Slot } from '../types';

const Slots: React.FC = () => {
  const { userData, slots } = useUserData();
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    comment: '',
  });

  if (!userData) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await updateSlot(editingSlot.id, {
          ...formData,
          userId: userData.id,
          name: userData.name,
        });
      } else {
        await createSlot({
          ...formData,
          userId: userData.id,
          name: userData.name,
          createdAt: new Date(),
        });
      }
      setShowForm(false);
      setEditingSlot(null);
      setFormData({ date: '', startTime: '', endTime: '', comment: '' });
    } catch (error) {
      console.error('Error saving slot:', error);
    }
  };

  const handleEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      comment: slot.comment || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (slotId: string) => {
    if (confirm('Удалить этот слот?')) {
      try {
        await deleteSlot(slotId);
      } catch (error) {
        console.error('Error deleting slot:', error);
      }
    }
  };

  const totalHours = slots.reduce((sum, slot) => {
    return sum + calculateHours(slot.startTime, slot.endTime);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Слоты
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Всего часов: <span className="font-semibold text-sber-green">{totalHours.toFixed(2)} ч</span>
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingSlot(null);
            setFormData({ date: '', startTime: '', endTime: '', comment: '' });
          }}
          className="btn-primary"
        >
          {showForm ? 'Отмена' : '+ Добавить слот'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {editingSlot ? 'Редактировать слот' : 'Новый слот'}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время начала
                </label>
                <input
                  type="time"
                  required
                  className="input-field"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время окончания
                </label>
                <input
                  type="time"
                  required
                  className="input-field"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Комментарий (необязательно)
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">
              {editingSlot ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        {slots.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет слотов</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Дата
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Время
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Часы
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Комментарий
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr
                  key={slot.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {formatDate(slot.date)}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-sber-green">
                      {calculateHours(slot.startTime, slot.endTime).toFixed(2)} ч
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {slot.comment || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="text-sm text-sber-green hover:underline"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Slots;

