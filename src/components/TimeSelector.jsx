const TimeSelector = ({ label, value, onChange, className = '' }) => {
  return (
    <div className={className}>
      <label htmlFor={label.toLowerCase()} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="time"
        id={label.toLowerCase()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
};

export default TimeSelector;

