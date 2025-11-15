import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { createUser } from '../../services/firestore';
import { addReferral } from '../../services/referrals';

const AdminCreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    inviterId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const userId = userCredential.user.uid;

      // Create user in Firestore
      await createUser(userId, {
        name: formData.name,
        login: formData.login,
        email: formData.email,
        role: formData.role,
        status: 'active',
        earnings: 0,
        teamEarnings: 0,
        activity: 1,
        invitedCount: 0,
        rating: 0,
        boost: 1,
        inviterId: formData.inviterId || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // If inviterId is provided, create referral
      if (formData.inviterId) {
        await addReferral(formData.inviterId, userId, 'admin');
      }

      navigate('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Ошибка создания пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin/users')}
          className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-2"
        >
          ← Назад к списку
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Создать пользователя
        </h1>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Имя *
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Логин *
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Пароль *
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Роль *
            </label>
            <select
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Админ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID пригласившего (необязательно)
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.inviterId}
              onChange={(e) => setFormData({ ...formData, inviterId: e.target.value })}
              placeholder="Оставьте пустым, если нет пригласившего"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Создание...' : 'Создать пользователя'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUser;

