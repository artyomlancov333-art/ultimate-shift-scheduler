import { useState, useEffect } from 'react';
import SlotForm from './components/SlotForm';
import SlotTable from './components/SlotTable';
import Filters from './components/Filters';
import AdminLogin from './components/AdminLogin';
import EditSlotModal from './components/EditSlotModal';
import ThemeToggle from './components/ThemeToggle';
import DaysOffManager from './components/DaysOffManager';
import WeekView from './components/WeekView';
import { getSlots, getDaysOff, calculateHours, formatDate, deleteSlot, updateSlot } from './firebase';

function App() {
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [daysOff, setDaysOff] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [editingSlot, setEditingSlot] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' или 'week'

  // Подписка на изменения в Firebase
  useEffect(() => {
    const unsubscribe = getSlots((newSlots) => {
      console.log('Received slots from Firebase:', newSlots.length, newSlots);
      setSlots(newSlots);
    });

    return () => unsubscribe();
  }, []);

  // Подписка на выходные дни
  useEffect(() => {
    const unsubscribe = getDaysOff((newDaysOff) => {
      console.log('Received days off from Firebase:', newDaysOff.length);
      setDaysOff(newDaysOff);
    });

    return () => unsubscribe();
  }, []);

  // Применение фильтров
  useEffect(() => {
    let filtered = [...slots];

    if (nameFilter) {
      filtered = filtered.filter(slot => slot.name === nameFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(slot => slot.date === dateFilter);
    }

    console.log('Filtered slots:', filtered.length, 'Total slots:', slots.length);
    setFilteredSlots(filtered);
    
    // Устанавливаем выбранного человека для подсчёта часов
    if (nameFilter) {
      setSelectedPerson(nameFilter);
    } else {
      setSelectedPerson('');
    }
  }, [slots, nameFilter, dateFilter]);

  const handleResetFilters = () => {
    setNameFilter('');
    setDateFilter('');
    setSelectedPerson('');
  };

  // Подсчёт часов для выбранного человека
  const calculatePersonHours = () => {
    if (!selectedPerson) return { daily: {}, total: 0 };

    const personSlots = slots.filter(slot => slot.name === selectedPerson);
    const dailyHours = {};
    let totalHours = 0;

    personSlots.forEach(slot => {
      const hours = calculateHours(slot.startTime, slot.endTime);
      dailyHours[slot.date] = (dailyHours[slot.date] || 0) + hours;
      totalHours += hours;
    });

    return { daily: dailyHours, total: totalHours };
  };

  // Подсчёт общих часов всех слотов
  const calculateTotalHours = () => {
    let total = 0;
    slots.forEach(slot => {
      total += calculateHours(slot.startTime, slot.endTime);
    });
    return total;
  };

  const personHours = calculatePersonHours();
  const totalHours = calculateTotalHours();

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteSlot(slotId);
      setError(null);
    } catch (error) {
      setError('Ошибка при удалении слота. Попробуйте снова.');
      console.error(error);
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
  };

  const handleSaveEdit = async (slotId, updatedData) => {
    try {
      await updateSlot(slotId, updatedData);
      setEditingSlot(null);
      setError(null);
    } catch (error) {
      setError('Ошибка при обновлении слота. Попробуйте снова.');
      console.error(error);
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ultimate Shift Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Система управления рабочими сменами</p>
        </div>

        {/* Режим администратора */}
        <AdminLogin 
          isAdmin={isAdmin} 
          onLogin={handleAdminLogin}
          onLogout={handleAdminLogout}
        />

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/40 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-sm dark:shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Форма добавления слота */}
        <SlotForm 
          slots={slots} 
          onError={setError}
          currentUserName={currentUserName}
          onUserNameChange={setCurrentUserName}
        />

        {/* Управление выходными */}
        <DaysOffManager
          daysOff={daysOff}
          onError={setError}
          currentUserName={currentUserName}
          isAdmin={isAdmin}
        />

        {/* Фильтры */}
        <Filters
          nameFilter={nameFilter}
          dateFilter={dateFilter}
          onNameFilterChange={setNameFilter}
          onDateFilterChange={setDateFilter}
          onReset={handleResetFilters}
        />

        {/* Переключатель вида */}
        <div className="card">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                viewMode === 'table'
                  ? 'bg-sber-green text-white dark:bg-sber-green dark:text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Таблица
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                viewMode === 'week'
                  ? 'bg-sber-green text-white dark:bg-sber-green dark:text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Неделя
            </button>
          </div>
        </div>

        {/* Таблица слотов или недельный вид */}
        {viewMode === 'table' ? (
          <SlotTable 
            slots={filteredSlots.length > 0 ? filteredSlots : slots}
            isAdmin={isAdmin}
            currentUserName={currentUserName}
            onEdit={handleEditSlot}
            onDelete={handleDeleteSlot}
          />
        ) : (
          <WeekView
            slots={slots}
            daysOff={daysOff}
          />
        )}

        {/* Модальное окно редактирования */}
        <EditSlotModal
          slot={editingSlot}
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          onSave={handleSaveEdit}
          slots={slots}
        />

        {/* Статистика часов */}
        <div className="card bg-gradient-to-r from-sber-green/10 to-green-50 dark:from-sber-green/20 dark:to-green-900/20">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Статистика часов</h2>
          
          {selectedPerson ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Часы для {selectedPerson}:
                </h3>
                <div className="space-y-2">
                  {Object.entries(personHours.daily).map(([date, hours]) => (
                    <div key={date} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(date)}</span>
                      <span className="font-semibold text-sber-green">{hours.toFixed(2)} ч</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Общие часы:</span>
                    <span className="text-2xl font-bold text-sber-green">
                      {personHours.total.toFixed(2)} ч
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Выберите сотрудника в фильтрах, чтобы увидеть его статистику</p>
          )}

          <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Общие суммарные часы всех слотов:
              </span>
              <span className="text-2xl font-bold text-sber-green">
                {totalHours.toFixed(2)} ч
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

