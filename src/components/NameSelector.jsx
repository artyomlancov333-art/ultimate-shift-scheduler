const NAMES = ['Артём', 'Анастасия', 'Адель', 'Ольга', 'Ксения'];

const NameSelector = ({ value, onChange, className = '' }) => {
  return (
    <div className={`${className} min-w-0`}>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        Имя сотрудника
      </label>
      <select
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field w-full"
      >
        <option value="">Выберите имя</option>
        {NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NameSelector;

