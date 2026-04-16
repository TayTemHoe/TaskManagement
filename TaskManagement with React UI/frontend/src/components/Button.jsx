export default function Button({ name, type="button", onClick, children, disabled = false }) {
  return (
    <button 
      className={name} 
      type={type}
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
}