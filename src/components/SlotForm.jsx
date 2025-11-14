import { useState } from 'react';
import NameSelector from './NameSelector';
import DateSelector from './DateSelector';
import MultiDateSelector from './MultiDateSelector';
import TimeSelector from './TimeSelector';
import { addSlot, calculateHours } from '../firebase';

const SlotForm = ({ slots, onError, currentUserName, onUserNameChange }) => {
  const [name, setName] = useState(currentUserName || '');
  const [date, setDate] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [useMultipleDates, setUseMultipleDates] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Синхронизация с внешним состоянием
  const handleNameChange = (newName) => {
    setName(newName);
    if (onUserNameChange) {
      onUserNameChange(newName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Определяем список дат для добавления
    const datesToAdd = useMultipleDates ? selectedDates : (date ? [date] : []);
    
    // Валидация
    if (!name || datesToAdd.length === 0 || !startTime || !endTime) {
      onError('Пожалуйста, заполните все поля');
      return;
    }

    if (startTime >= endTime) {
      onError('Время окончания должно быть позже времени начала');
      return;
    }

    // Проверка минимального времени работы
    const slotHours = calculateHours(startTime, endTime);
    if (slotHours <= 0) {
      onError('Время работы должно быть больше нуля');
      return;
    }

    // Проверка для каждой даты
    const errors = [];
    for (const checkDate of datesToAdd) {
      // Проверка на максимальное количество людей в слоте
      const conflictingSlots = slots.filter(
        slot => 
          slot.date === checkDate && 
          slot.startTime === startTime && 
          slot.endTime === endTime
      );

      if (conflictingSlots.length >= 2) {
        errors.push(`На ${checkDate} в этом временном слоте уже максимальное количество сотрудников (2)`);
        continue;
      }

      // Проверка, не записан ли уже этот человек в этот слот
      const duplicateSlot = conflictingSlots.find(slot => slot.name === name);
      if (duplicateSlot) {
        errors.push(`На ${checkDate} этот сотрудник уже записан в данный временной слот`);
        continue;
      }
    }

    if (errors.length > 0) {
      onError(errors.join('. '));
      return;
    }

    setIsSubmitting(true);
    try {
      // Добавляем слоты для всех выбранных дат
      const promises = datesToAdd.map(dateToAdd => 
        addSlot({ name, date: dateToAdd, startTime, endTime })
      );
      await Promise.all(promises);
      
      // Очистка формы
      setName('');
      setDate('');
      setSelectedDates([]);
      setStartTime('');
      setEndTime('');
      setUseMultipleDates(false);
      onError(null);
    } catch (error) {
      onError('Ошибка при добавлении слота. Попробуйте снова.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">Добавить рабочий слот</h2>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <NameSelector value={name} onChange={handleNameChange} />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useMultipleDates"
                checked={useMultipleDates}
                onChange={(e) => {
                  setUseMultipleDates(e.target.checked);
                  if (e.target.checked) {
                    setDate('');
                  } else {
                    setSelectedDates([]);
                  }
                }}
                className="w-4 h-4 text-sber-green border-gray-300 rounded focus:ring-sber-green dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="useMultipleDates" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Выбрать несколько дат
              </label>
            </div>
            {useMultipleDates ? (
              <MultiDateSelector 
                selectedDates={selectedDates} 
                onChange={setSelectedDates} 
              />
            ) : (
              <DateSelector value={date} onChange={setDate} />
            )}
          </div>
          <TimeSelector 
            label="Время начала" 
            value={startTime} 
            onChange={setStartTime} 
          />
          <TimeSelector 
            label="Время окончания" 
            value={endTime} 
            onChange={setEndTime} 
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Добавление...' : useMultipleDates && selectedDates.length > 0 ? `Добавить слот (${selectedDates.length} дат)` : 'Добавить слот'}
        </button>
      </form>
    </div>
  );
};

export default SlotForm;

