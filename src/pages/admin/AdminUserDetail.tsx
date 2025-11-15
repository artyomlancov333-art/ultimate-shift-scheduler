import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { getUser, getSlots, getDaysOff, getChangeHistory, getReferrals } from '../../services/firestore';
import { getInvitedUsers, getReferralTree } from '../../services/referrals';
import { calculateHours, formatDate } from '../../services/firestore';
import type { User, Slot, DayOff, ChangeHistory } from '../../types';

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateUserField, deleteUserById, addHistoryEntry } = useAdmin();
  const [user, setUser] = useState<User | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const userData = await getUser(id);
        if (!userData) {
          navigate('/admin/users');
          return;
        }
        setUser(userData);

        const [slotsData, daysOffData, historyData, referrals] = await Promise.all([
          getSlots(id),
          getDaysOff(id),
          getChangeHistory(id),
          getReferrals(id),
        ]);

        setSlots(slotsData);
        setDaysOff(daysOffData);
        setChangeHistory(historyData);

        const invited = await Promise.all(
          referrals.map(r => getUser(r.inviteeId))
        );
        setInvitedUsers(invited.filter(u => u !== null) as User[]);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = async () => {
    if (!user || !editingField) return;

    try {
      await updateUserField(user.id, editingField as keyof User, editValue);
      setEditingField(null);
      // Reload user data
      const updatedUser = await getUser(user.id);
      if (updatedUser) setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm(`Удалить пользователя ${user.name}?`)) {
      try {
        await deleteUserById(user.id);
        navigate('/admin/users');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalHours = slots.reduce((sum, slot) => {
    return sum + calculateHours(slot.startTime, slot.endTime);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-2"
          >
            ← Назад к списку
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {user.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Логин: {user.login} | Email: {user.email || 'Не указан'}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
        >
          Удалить пользователя
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Заработок</h3>
          <div className="mt-2 flex items-center gap-2">
            {editingField === 'earnings' ? (
              <>
                <input
                  type="number"
                  className="input-field flex-1"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                />
                <button onClick={handleSave} className="btn-primary text-sm">✓</button>
                <button onClick={() => setEditingField(null)} className="btn-secondary text-sm">✕</button>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-sber-green">
                  {user.earnings.toLocaleString('ru-RU')} ₽
                </p>
                <button
                  onClick={() => handleEdit('earnings', user.earnings)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Изменить
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Командный заработок</h3>
          <div className="mt-2 flex items-center gap-2">
            {editingField === 'teamEarnings' ? (
              <>
                <input
                  type="number"
                  className="input-field flex-1"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                />
                <button onClick={handleSave} className="btn-primary text-sm">✓</button>
                <button onClick={() => setEditingField(null)} className="btn-secondary text-sm">✕</button>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-sber-green">
                  {user.teamEarnings.toLocaleString('ru-RU')} ₽
                </p>
                <button
                  onClick={() => handleEdit('teamEarnings', user.teamEarnings)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Изменить
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Активность</h3>
          <div className="mt-2 flex items-center gap-2">
            {editingField === 'activity' ? (
              <>
                <input
                  type="number"
                  step="0.1"
                  className="input-field flex-1"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                />
                <button onClick={handleSave} className="btn-primary text-sm">✓</button>
                <button onClick={() => setEditingField(null)} className="btn-secondary text-sm">✕</button>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-sber-green">
                  {user.activity.toFixed(2)}
                </p>
                <button
                  onClick={() => handleEdit('activity', user.activity)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Изменить
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Рейтинг</h3>
          <p className="text-2xl font-bold text-sber-green mt-2">
            {user.rating.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status and Role */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Статус и роль
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Статус
            </label>
            {editingField === 'status' ? (
              <div className="flex gap-2">
                <select
                  className="input-field flex-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="suspended">Приостановлен</option>
                </select>
                <button onClick={handleSave} className="btn-primary text-sm">✓</button>
                <button onClick={() => setEditingField(null)} className="btn-secondary text-sm">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-900 dark:text-gray-100">
                  {user.status === 'active' ? 'Активен' :
                   user.status === 'inactive' ? 'Неактивен' : 'Приостановлен'}
                </span>
                <button
                  onClick={() => handleEdit('status', user.status)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Изменить
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Роль
            </label>
            {editingField === 'role' ? (
              <div className="flex gap-2">
                <select
                  className="input-field flex-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Админ</option>
                </select>
                <button onClick={handleSave} className="btn-primary text-sm">✓</button>
                <button onClick={() => setEditingField(null)} className="btn-secondary text-sm">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-900 dark:text-gray-100">
                  {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                </span>
                <button
                  onClick={() => handleEdit('role', user.role)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Изменить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Слоты ({slots.length}) | Всего часов: {totalHours.toFixed(2)} ч
        </h2>
        {slots.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет слотов</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {slots.map(slot => (
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

      {/* Days Off */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Выходные дни ({daysOff.length})
        </h2>
        {daysOff.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет выходных дней</p>
        ) : (
          <div className="space-y-2">
            {daysOff.map(dayOff => (
              <div
                key={dayOff.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {formatDate(dayOff.date)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Structure */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Реферальная структура
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Приглашено пользователей: {user.invitedCount}
        </p>
        {invitedUsers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет приглашённых пользователей</p>
        ) : (
          <div className="space-y-2">
            {invitedUsers.map(invited => (
              <div
                key={invited.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {invited.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invited.login}
                  </p>
                </div>
                <p className="text-sm font-semibold text-sber-green">
                  Рейтинг: {invited.rating.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change History */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          История изменений
        </h2>
        {changeHistory.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет записей</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {changeHistory.map(entry => (
              <div
                key={entry.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.field}: {String(entry.oldValue)} → {String(entry.newValue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(entry.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail;

