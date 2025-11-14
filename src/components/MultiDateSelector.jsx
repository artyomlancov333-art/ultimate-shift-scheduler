import { useState } from 'react';
import { formatDate } from '../firebase';

const MultiDateSelector = ({ selectedDates, onChange, className = '' }) => {
  const today = new Date().toISOString().split('T')[0];
  const [dateInput, setDateInput] = useState('');

  const handleAddDate = () => {
    if (!dateInput) return;
    
    if (dateInput < today) {
      alert('Нельзя выбрать прошедшую дату');
      return;
    }

    if (!selectedDates.includes(dateInput)) {
      onChange([...selectedDates, dateInput].sort());
    }
    setDateInput('');
  };

  const handleRemoveDate = (dateToRemove) => {
    onChange(selectedDates.filter(date => date !== dateToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDate();
    }
  };

  return (
    <div className={`${className} min-w-0`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        Даты (можно выбрать несколько)
      </label>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          onKeyPress={handleKeyPress}
          min={today}
          className="input-field flex-1 min-w-0"
        />
        <button
          type="button"
          onClick={handleAddDate}
          className="btn-secondary px-3 sm:px-4 whitespace-nowrap text-sm flex-shrink-0"
        >
          Добавить
        </button>
      </div>
      {selectedDates.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedDates.map((date) => (
            <span
              key={date}
              className="inline-flex items-center gap-1 bg-sber-green/10 dark:bg-sber-green/30 text-sber-green dark:text-green-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-sber-green/20 dark:border-sber-green/50 whitespace-nowrap"
            >
              {formatDate(date)}
              <button
                type="button"
                onClick={() => handleRemoveDate(date)}
                className="ml-1 text-sber-green dark:text-green-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm sm:text-base flex-shrink-0"
                title="Удалить"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiDateSelector;

