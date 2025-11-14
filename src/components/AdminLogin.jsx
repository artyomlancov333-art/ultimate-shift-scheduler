import { useState } from 'react';

const ADMIN_PASSWORD = '9119';

const AdminLogin = ({ isAdmin, onLogin, onLogout }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
      setPassword('');
      setError('');
      setShowLogin(false);
    } else {
      setError('Неверный пароль');
      setPassword('');
    }
  };

  if (isAdmin) {
    return (
      <div className="card bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/40 dark:to-orange-900/30 border-2 border-red-200 dark:border-red-600 shadow-lg dark:shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full animate-pulse shadow-sm"></div>
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-300">Режим администратора активен</h3>
              <p className="text-sm text-red-600 dark:text-red-300/90">Вы можете редактировать и удалять любые смены</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn-secondary text-sm"
          >
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Режим администратора</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Войдите для редактирования и удаления смен</p>
        </div>
        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="btn-primary text-sm"
          >
            Войти
          </button>
        ) : (
          <form onSubmit={handleLogin} className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Пароль"
              className="px-3 py-2 border border-gray-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sber-green"
              autoFocus
            />
            <button type="submit" className="btn-primary text-sm">
              Войти
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLogin(false);
                setPassword('');
                setError('');
              }}
              className="btn-secondary text-sm"
            >
              Отмена
            </button>
          </form>
        )}
      </div>
      {error && (
        <p className="text-red-600 dark:text-red-300 text-sm mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};

export default AdminLogin;

