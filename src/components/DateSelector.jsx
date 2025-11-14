const DateSelector = ({ value, onChange, className = '' }) => {
  // Получаем сегодняшнюю дату в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className={className}>
      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
        Дата
      </label>
      <input
        type="date"
        id="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={today}
        className="input-field"
      />
    </div>
  );
};

export default DateSelector;

