import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = userData?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
    { path: '/team', label: 'Команда', icon: '👥' },
    { path: '/leaderboard', label: 'Рейтинг', icon: '🏆' },
    { path: '/slots', label: 'Слоты', icon: '📅' },
    { path: '/days-off', label: 'Выходные', icon: '🏖️' },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Админ-панель', icon: '⚙️' },
    { path: '/admin/users', label: 'Все пользователи', icon: '👥' },
    { path: '/admin/create-user', label: 'Создать пользователя', icon: '➕' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white dark:lg:bg-gray-800 lg:border-r lg:border-gray-200 dark:lg:border-gray-700">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Shift Scheduler
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {isAdminRoute ? (
              <>
                {adminNavItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-sber-green text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>🏠</span>
                    Вернуться в ЛК
                  </Link>
                </div>
              </>
            ) : (
              <>
                {userNavItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-sber-green text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span>⚙️</span>
                      Админ-панель
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userData?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {userData?.login}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full btn-secondary text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Shift Scheduler
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {isAdminRoute ? (
                  <>
                    {adminNavItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                          location.pathname === item.path
                            ? 'bg-sber-green text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    {userNavItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                          location.pathname === item.path
                            ? 'bg-sber-green text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-400"
          >
            ☰
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            Shift Scheduler
          </h1>
          <ThemeToggle />
        </header>

        {/* Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden safe-area-inset-bottom">
          <div className="grid grid-cols-4 gap-1 pb-safe">
            {userNavItems.slice(0, 4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 text-xs font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-sber-green scale-105'
                    : 'text-gray-600 dark:text-gray-400 active:scale-95'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* Spacer for bottom nav on mobile */}
        <div className="h-16 lg:hidden" />
      </div>
    </div>
  );
};

export default Layout;

