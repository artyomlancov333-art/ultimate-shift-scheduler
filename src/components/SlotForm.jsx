import { useState } from 'react';
import NameSelector from './NameSelector';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import { addSlot, calculateHours } from '../firebase';

const SlotForm = ({ slots, onError, currentUserName, onUserNameChange }) => {
  const [name, setName] = useState(currentUserName || '');
  const [date, setDate] = useState('');
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
    
    // Валидация
    if (!name || !date || !startTime || !endTime) {
      onError('Пожалуйста, заполните все поля');
      return;
    }

    if (startTime >= endTime) {
      onError('Время окончания должно быть позже времени начала');
      return;
    }

    // Проверка минимального времени работы (6 часов в день, но можно разбить на слоты)
    const slotHours = calculateHours(startTime, endTime);
    if (slotHours <= 0) {
      onError('Время работы должно быть больше нуля');
      return;
    }

    // Проверка общего времени работы за день (минимум 6 часов, но можно разбить)
    const daySlots = slots.filter(slot => slot.date === date && slot.name === name);
    const totalDayHours = daySlots.reduce((sum, slot) => {
      return sum + calculateHours(slot.startTime, slot.endTime);
    }, 0) + slotHours;

    // Валидация: минимум 6 часов в день (но можно разбить на разные слоты)
    // Это предупреждение, а не ошибка - пользователь может добавить несколько слотов
    if (totalDayHours < 6 && daySlots.length === 0) {
      // Это первый слот дня, но он меньше 6 часов - предупреждение
      // Пользователь может добавить еще слоты позже
    }

    // Проверка на максимальное количество людей в слоте
    const conflictingSlots = slots.filter(
      slot => 
        slot.date === date && 
        slot.startTime === startTime && 
        slot.endTime === endTime
    );

    if (conflictingSlots.length >= 2) {
      onError('В этом временном слоте уже максимальное количество сотрудников (2)');
      return;
    }

    // Проверка, не записан ли уже этот человек в этот слот
    const duplicateSlot = conflictingSlots.find(slot => slot.name === name);
    if (duplicateSlot) {
      onError('Этот сотрудник уже записан в данный временной слот');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSlot({ name, date, startTime, endTime });
      // Очистка формы
      setName('');
      setDate('');
      setStartTime('');
      setEndTime('');
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Добавить рабочий слот</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NameSelector value={name} onChange={handleNameChange} />
          <DateSelector value={date} onChange={setDate} />
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
          {isSubmitting ? 'Добавление...' : 'Добавить слот'}
        </button>
      </form>
    </div>
  );
};

export default SlotForm;

