import "./Input.css";

const Input = ({ id, placeholder = "", label, onSubmit, isLoading, value, onChange }) => (
  <form className="input" onSubmit={onSubmit}>
    <label htmlFor={id}>{label}</label>

    <input
      id={id}
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />

    <button type="submit" id="submitButton" disabled={isLoading}>
      {isLoading ? "Summoning..." : "Go for it"}
    </button>
  </form>
);

export default Input;
