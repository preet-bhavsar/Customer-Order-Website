export default function Card({ children, noPadding = false, style = {}, className = '' }) {
  return (
    <div 
      className={`card ${className}`} 
      style={{ 
        padding: noPadding ? '0' : '1.5rem', 
        ...style 
      }}
    >
      {children}
    </div>
  );
}
