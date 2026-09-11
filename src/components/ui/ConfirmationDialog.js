import Button from './Button';

export default function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', confirmVariant = 'primary' }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}
        onClick={onCancel}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'var(--surface-color)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 101,
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{title}</h3>
        <p style={{ margin: 0, marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </>
  );
}
