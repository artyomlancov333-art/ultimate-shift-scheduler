const NAMES = ['Артём', 'Анастасия', 'Адель', 'Ольга', 'Ксения'];

const Filters = ({ nameFilter, dateFilter, onNameFilterChange, onDateFilterChange, onReset }) => {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Фильтры</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Фильтр по имени
          </label>
          <select
            id="filter-name"
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            className="input-field"
          >
            <option value="">Все сотрудники</option>
            {NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Фильтр по дате
          </label>
          <input
            type="date"
            id="filter-date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="btn-secondary w-full"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;

