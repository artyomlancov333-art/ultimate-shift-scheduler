import { useState, useEffect } from 'react';
import SlotForm from './components/SlotForm';
import SlotTable from './components/SlotTable';
import Filters from './components/Filters';
import { getSlots, calculateHours, formatDate } from './firebase';

function App() {
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState('');

  // Подписка на изменения в Firebase
  useEffect(() => {
    const unsubscribe = getSlots((newSlots) => {
      setSlots(newSlots);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ultimate Shift Scheduler
          </h1>
          <p className="text-gray-600">Система управления рабочими сменами</p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Форма добавления слота */}
        <SlotForm slots={slots} onError={setError} />

        {/* Фильтры */}
        <Filters
          nameFilter={nameFilter}
          dateFilter={dateFilter}
          onNameFilterChange={setNameFilter}
          onDateFilterChange={setDateFilter}
          onReset={handleResetFilters}
        />

        {/* Таблица слотов */}
        <SlotTable slots={filteredSlots} />

        {/* Статистика часов */}
        <div className="card bg-gradient-to-r from-sber-green/10 to-green-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Статистика часов</h2>
          
          {selectedPerson ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Часы для {selectedPerson}:
                </h3>
                <div className="space-y-2">
                  {Object.entries(personHours.daily).map(([date, hours]) => (
                    <div key={date} className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-gray-700">{formatDate(date)}</span>
                      <span className="font-semibold text-sber-green">{hours.toFixed(2)} ч</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Общие часы:</span>
                    <span className="text-2xl font-bold text-sber-green">
                      {personHours.total.toFixed(2)} ч
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Выберите сотрудника в фильтрах, чтобы увидеть его статистику</p>
          )}

          <div className="mt-6 pt-6 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">
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

