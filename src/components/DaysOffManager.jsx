import { useState } from 'react';
import DateSelector from './DateSelector';
import NameSelector from './NameSelector';
import { addDayOff, deleteDayOff } from '../firebase';
import { formatDate } from '../firebase';

const DaysOffManager = ({ daysOff, onError, currentUserName, isAdmin }) => {
  const [date, setDate] = useState('');
  const [name, setName] = useState(currentUserName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDayOff = async (e) => {
    e.preventDefault();
    
    if (!name || !date) {
      onError('Пожалуйста, выберите имя и дату');
      return;
    }

    // Проверка, не добавлен ли уже выходной на эту дату для этого человека
    const existing = daysOff.find(d => d.name === name && d.date === date);
    if (existing) {
      onError('Выходной на эту дату уже добавлен');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDayOff({ name, date });
      setDate('');
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Выходные дни</h2>
      
      <form onSubmit={handleAddDayOff} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NameSelector value={name} onChange={setName} />
          <DateSelector value={date} onChange={setDate} />
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Добавление...' : 'Добавить выходной'}
            </button>
          </div>
        </div>
      </form>

      {userDaysOff.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Запланированные выходные:</h3>
          <div className="flex flex-wrap gap-2">
            {userDaysOff.map((dayOff) => (
              <div
                key={dayOff.id}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700/60 rounded-lg px-3 py-2 shadow-sm dark:shadow-md"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  <strong className="dark:text-red-200">{dayOff.name}</strong>: <span className="dark:text-gray-200">{formatDate(dayOff.date)}</span>
                </span>
                {(isAdmin || dayOff.name === currentUserName) && (
                  <button
                    onClick={() => handleDeleteDayOff(dayOff.id, dayOff.name)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
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

