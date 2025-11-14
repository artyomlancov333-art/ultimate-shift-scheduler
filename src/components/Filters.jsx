const NAMES = ['Артём', 'Анастасия', 'Адель', 'Ольга', 'Ксения'];

const Filters = ({ nameFilter, dateFilter, onNameFilterChange, onDateFilterChange, onReset }) => {
  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Фильтры</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="min-w-0">
          <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Фильтр по имени
          </label>
          <select
            id="filter-name"
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            className="input-field w-full"
          >
            <option value="">Все сотрудники</option>
            {NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Фильтр по дате
          </label>
          <input
            type="date"
            id="filter-date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <div className="flex items-end min-w-0">
          <button
            onClick={onReset}
            className="btn-secondary w-full whitespace-nowrap"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;

