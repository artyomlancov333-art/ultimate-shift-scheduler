const TimeSelector = ({ label, value, onChange, className = '' }) => {
  return (
    <div className={`${className} min-w-0`}>
      <label htmlFor={label.toLowerCase()} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        {label}
      </label>
      <input
        type="time"
        id={label.toLowerCase()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field w-full"
      />
    </div>
  );
};

export default TimeSelector;

