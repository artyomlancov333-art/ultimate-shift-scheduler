import { useState } from 'react';
import DateSelector from './DateSelector';
import NameSelector from './NameSelector';
import { addDayOff, deleteDayOff } from '../firebase';
import { formatDate } from '../firebase';

const WEEK_DAYS = [
  { value: '1', label: 'Понедельник' },
  { value: '2', label: 'Вторник' },
  { value: '3', label: 'Среда' },
  { value: '4', label: 'Четверг' },
  { value: '5', label: 'Пятница' },
  { value: '6', label: 'Суббота' },
  { value: '0', label: 'Воскресенье' },
];

const DaysOffManager = ({ daysOff, onError, currentUserName, isAdmin }) => {
  const [date, setDate] = useState('');
  const [name, setName] = useState(currentUserName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useDayOfWeek, setUseDayOfWeek] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('');

  // Форматирует дату в локальном времени (YYYY-MM-DD)
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Генерирует даты на ближайшие 30 дней для выбранного дня недели
  const generateDatesForDayOfWeek = (targetDayOfWeek) => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Обнуляем время для точного сравнения
    const targetDay = parseInt(targetDayOfWeek);
    
    // JavaScript getDay(): 0=воскресенье, 1=понедельник, ..., 6=суббота
    const currentDay = today.getDay();
    
    // Находим следующий день недели
    let daysUntilNext = (targetDay - currentDay + 7) % 7;
    if (daysUntilNext === 0) {
      // Если сегодня выбранный день, берем следующий (через 7 дней)
      daysUntilNext = 7;
    }
    
    const firstDate = new Date(today);
    firstDate.setDate(today.getDate() + daysUntilNext);
    firstDate.setHours(0, 0, 0, 0); // Обнуляем время
    
    // Проверяем, что первая дата действительно нужный день недели
    if (firstDate.getDay() !== targetDay) {
      console.error('Ошибка: первая дата не соответствует выбранному дню недели', {
        targetDay,
        firstDateDay: firstDate.getDay(),
        firstDate: formatLocalDate(firstDate)
      });
    }
    
    // Генерируем даты на 30 дней вперед
    let currentDate = new Date(firstDate);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999); // Конец дня
    
    while (currentDate <= maxDate) {
      // Дополнительная проверка, что дата соответствует нужному дню недели
      if (currentDate.getDay() === targetDay) {
        dates.push(formatLocalDate(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 7); // Следующая неделя
    }
    
    return dates;
  };

  const handleAddDayOff = async (e) => {
    e.preventDefault();
    
    if (!name) {
      onError('Пожалуйста, выберите имя сотрудника');
      return;
    }

    if (useDayOfWeek) {
      if (!dayOfWeek) {
        onError('Пожалуйста, выберите день недели');
        return;
      }
    } else {
      if (!date) {
        onError('Пожалуйста, выберите дату');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (useDayOfWeek) {
        // Генерируем даты на ближайшие 30 дней для выбранного дня недели
        const datesToAdd = generateDatesForDayOfWeek(dayOfWeek);
        
        // Добавляем выходные для всех сгенерированных дат
        const promises = datesToAdd.map(dateToAdd => {
          // Проверяем, не добавлен ли уже выходной
          const existing = daysOff.find(d => d.name === name && d.date === dateToAdd);
          if (!existing) {
            return addDayOff({ name, date: dateToAdd });
          }
          return Promise.resolve();
        });
        
        await Promise.all(promises);
        setDayOfWeek('');
      } else {
        // Проверка, не добавлен ли уже выходной на эту дату для этого человека
        const existing = daysOff.find(d => d.name === name && d.date === date);
        if (existing) {
          onError('Выходной на эту дату уже добавлен');
          setIsSubmitting(false);
          return;
        }
        await addDayOff({ name, date });
        setDate('');
      }
      setName(currentUserName || '');
      setUseDayOfWeek(false);
      onError(null);
    } catch (error) {
      onError('Ошибка при добавлении выходного. Попробуйте снова.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDayOff = async (dayOffId, dayOffName) => {
    if (!isAdmin && dayOffName !== currentUserName) {
      onError('Вы можете удалять только свои выходные');
      return;
    }

    if (window.confirm('Удалить выходной?')) {
      try {
        await deleteDayOff(dayOffId);
        onError(null);
      } catch (error) {
        onError('Ошибка при удалении выходного.');
        console.error(error);
      }
    }
  };

  const userDaysOff = daysOff.filter(d => d.name === currentUserName || isAdmin);

  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">Выходные дни</h2>
      
      <form onSubmit={handleAddDayOff} className="mb-4 sm:mb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useDayOfWeek"
              checked={useDayOfWeek}
              onChange={(e) => {
                setUseDayOfWeek(e.target.checked);
                if (e.target.checked) {
                  setDate('');
                } else {
                  setDayOfWeek('');
                }
              }}
              className="w-4 h-4 text-sber-green border-gray-300 rounded focus:ring-sber-green dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="useDayOfWeek" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              Установить выходной на определенный день недели (на месяц вперед)
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="min-w-0">
              <NameSelector value={name} onChange={setName} />
            </div>
            {useDayOfWeek ? (
              <div className="min-w-0">
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  День недели
                </label>
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Выберите день</option>
                  {WEEK_DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="min-w-0">
                <DateSelector value={date} onChange={setDate} />
              </div>
            )}
            <div className="flex items-end min-w-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? 'Добавление...' : useDayOfWeek ? 'Добавить выходные на месяц' : 'Добавить выходной'}
              </button>
            </div>
          </div>
          {useDayOfWeek && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Выходные будут добавлены на ближайшие 30 дней для выбранного дня недели
            </p>
          )}
        </div>
      </form>

      {userDaysOff.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Запланированные выходные:</h3>
          <div className="flex flex-wrap gap-2">
            {userDaysOff.map((dayOff) => (
              <div
                key={dayOff.id}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700/60 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm dark:shadow-md max-w-full"
              >
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 break-words min-w-0">
                  <strong className="dark:text-red-200">{dayOff.name}</strong>: <span className="dark:text-gray-200">{formatDate(dayOff.date)}</span>
                </span>
                {(isAdmin || dayOff.name === currentUserName) && (
                  <button
                    onClick={() => handleDeleteDayOff(dayOff.id, dayOff.name)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm flex-shrink-0"
                    title="Удалить"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DaysOffManager;

