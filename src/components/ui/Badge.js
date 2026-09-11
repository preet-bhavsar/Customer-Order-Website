export default function Badge({ children, variant = 'default', className = '' }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  };

  const variants = {
    default: { backgroundColor: '#f3f4f6', color: '#4b5563' },
    success: { backgroundColor: '#dcfce7', color: '#166534' },
    warning: { backgroundColor: '#fef3c7', color: '#92400e' },
    danger: { backgroundColor: '#fee2e2', color: '#991b1b' },
    primary: { backgroundColor: '#e0e7ff', color: '#3730a3' }
  };

  return (
    <span style={{ ...baseStyles, ...variants[variant] }} className={className}>
      {children}
    </span>
  );
}
