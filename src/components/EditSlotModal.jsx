import { useState, useEffect } from 'react';
import NameSelector from './NameSelector';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';

const EditSlotModal = ({ slot, isOpen, onClose, onSave, slots }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (slot) {
      setName(slot.name || '');
      setDate(slot.date || '');
      setStartTime(slot.startTime || '');
      setEndTime(slot.endTime || '');
      setComment(slot.comment || '');
      setError('');
    }
  }, [slot]);

  if (!isOpen || !slot) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Валидация
    if (!name || !date || !startTime || !endTime) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (startTime >= endTime) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    // Проверка на дубликаты (исключая текущий слот)
    const conflictingSlots = slots.filter(
      s => 
        s.id !== slot.id &&
        s.date === date && 
        s.startTime === startTime && 
        s.endTime === endTime
    );

    if (conflictingSlots.length >= 2) {
      setError('В этом временном слоте уже максимальное количество сотрудников (2)');
      return;
    }

    // Проверка, не записан ли уже этот человек в этот слот (исключая текущий)
    const duplicateSlot = conflictingSlots.find(s => s.name === name);
    if (duplicateSlot) {
      setError('Этот сотрудник уже записан в данный временной слот');
      return;
    }

    onSave(slot.id, { name, date, startTime, endTime, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Редактировать смену</h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <NameSelector value={name} onChange={setName} />
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
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Комментарий
              </label>
              <input
                type="text"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field"
                placeholder="Добавить комментарий (необязательно)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Сохранить изменения
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSlotModal;

