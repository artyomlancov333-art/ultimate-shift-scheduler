import { useState } from 'react';
import { formatDate, formatTime, getWeekStart, getWeekDates, calculateHours } from '../firebase';

const WeekView = ({ slots, daysOff, currentDate = new Date().toISOString().split('T')[0] }) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(currentDate));
  const weekDates = getWeekDates(selectedWeekStart);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Получаем слоты для недели
  const weekSlots = slots.filter(slot => weekDates.includes(slot.date));

  // Группируем слоты по дате
  const slotsByDate = {};
  weekDates.forEach(date => {
    slotsByDate[date] = weekSlots.filter(slot => slot.date === date);
  });

  // Переход к предыдущей/следующей неделе
  const goToPreviousWeek = () => {
    const date = new Date(selectedWeekStart);
    date.setDate(date.getDate() - 7);
    setSelectedWeekStart(date.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    const date = new Date(selectedWeekStart);
    date.setDate(date.getDate() + 7);
    setSelectedWeekStart(date.toISOString().split('T')[0]);
  };

  const goToCurrentWeek = () => {
    setSelectedWeekStart(getWeekStart(new Date().toISOString().split('T')[0]));
  };

  const isDayOff = (date, name) => {
    return daysOff.some(d => d.date === date && d.name === name);
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">Недельный вид</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={goToPreviousWeek} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none">
            ← Пред
          </button>
          <button onClick={goToCurrentWeek} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none">
            Сегодня
          </button>
          <button onClick={goToNextWeek} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none">
            След →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-600">
              <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Сотрудник</th>
              {weekDates.map((date, index) => (
                <th
                  key={date}
                  className={`text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 ${
                    date === currentDate ? 'bg-sber-green/10 dark:bg-sber-green/30 dark:border-b-2 dark:border-sber-green/50' : ''
                  }`}
                >
                  <div className="text-xs whitespace-nowrap">{weekDays[index]}</div>
                  <div className="text-xs sm:text-sm whitespace-nowrap">{formatDate(date)}</div>
                </th>
              ))}
              <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Итого</th>
            </tr>
          </thead>
          <tbody>
            {['Артём', 'Анастасия', 'Адель', 'Ольга', 'Ксения'].map((name) => {
              const personSlots = weekSlots.filter(s => s.name === name);
              const totalHours = personSlots.reduce((sum, slot) => {
                return sum + calculateHours(slot.startTime, slot.endTime);
              }, 0);

              return (
                <tr
                  key={name}
                  className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {name}
                  </td>
                  {weekDates.map((date) => {
                    const daySlots = slotsByDate[date].filter(s => s.name === name);
                    const isOff = isDayOff(date, name);

                    return (
                      <td
                        key={date}
                        className={`py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm ${
                          date === currentDate ? 'bg-sber-green/5 dark:bg-sber-green/20 dark:border-l dark:border-r dark:border-sber-green/40' : ''
                        }`}
                      >
                        {isOff ? (
                          <div className="bg-red-100 dark:bg-red-900/50 dark:border dark:border-red-700/50 text-red-700 dark:text-red-300 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium shadow-sm dark:shadow-md whitespace-nowrap">
                            Выходной
                          </div>
                        ) : daySlots.length > 0 ? (
                          <div className="space-y-0.5 sm:space-y-1">
                            {daySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="bg-sber-green/10 dark:bg-sber-green/40 dark:border dark:border-sber-green/50 text-sber-green dark:text-green-300 dark:font-semibold px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs shadow-sm dark:shadow-md whitespace-nowrap"
                              >
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>
                            ))}
                            <div className="text-xs text-gray-600 dark:text-gray-200 dark:font-medium mt-0.5 sm:mt-1 whitespace-nowrap">
                              {daySlots.reduce((sum, slot) => 
                                sum + calculateHours(slot.startTime, slot.endTime), 0
                              ).toFixed(1)}ч
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-100 whitespace-nowrap">
                    {totalHours.toFixed(1)}ч
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeekView;

