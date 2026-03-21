const MonthInput = ({ value, onChange, placeholder = "Select Month", label = "Month" }) => {
  return (
    <div className="month-input-group">
      {label && <label className="month-label">{label}</label>}
      <div className="month-input-container">
        <span className="month-icon">📅</span>
        <input
          type="month"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="month-input"
        />
      </div>
    </div>
  );
};

export default MonthInput;

