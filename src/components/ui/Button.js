export default function Button({ children, variant = 'primary', className = '', style = {}, onClick, disabled = false, type = 'button' }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    border: 'none',
    fontSize: '0.9rem',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: { backgroundColor: '#ea580c', color: 'white' },
    secondary: { backgroundColor: '#f3f4f6', color: '#1f2937' },
    danger: { backgroundColor: '#ef4444', color: 'white' }
  };

  const combinedStyles = { ...baseStyles, ...variants[variant], ...style };

  return (
    <button 
      type={type} 
      style={combinedStyles} 
      className={className} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
