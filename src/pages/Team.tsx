import React from 'react';
import { useUserData } from '../hooks/useUserData';
import { formatDate } from '../services/firestore';

const Team: React.FC = () => {
  const { userData, invitedUsers, referralTree, loading } = useUserData();

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

  const renderReferralTree = (node: any, level: number = 0): React.ReactNode => {
    if (!node) return null;

    return (
      <div key={node.user.id} className={`${level > 0 ? 'ml-6 mt-2' : ''}`}>
        <div className="card p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {node.user.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {node.user.login}
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Рейтинг: <span className="font-semibold text-sber-green">{node.user.rating.toFixed(2)}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Приглашено: <span className="font-semibold">{node.user.invitedCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        {node.invited && node.invited.length > 0 && (
          <div className="mt-2">
            {node.invited.map((invited: any) => renderReferralTree(invited, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Команда
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Реферальная структура
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Приглашённые пользователи ({invitedUsers.length})
        </h2>
        {invitedUsers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Вы ещё никого не пригласили</p>
        ) : (
          <div className="space-y-2">
            {invitedUsers.map(user => (
              <div
                key={user.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.login}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-sber-green">
                    Рейтинг: {user.rating.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Приглашено: {user.invitedCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {referralTree && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Реферальное дерево
          </h2>
          {renderReferralTree(referralTree)}
        </div>
      )}
    </div>
  );
};

export default Team;

