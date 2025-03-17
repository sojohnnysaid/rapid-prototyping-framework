import React from 'react';

/**
 * Base Tile component that provides consistent styling for content containers.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child content to render inside the tile
 * @param {string} props.title - Optional title for the tile
 * @param {string} props.variant - Styling variant (default, primary, success, warning, danger)
 * @param {string} props.size - Size variant (small, medium, large, full)
 * @param {number} props.flex - Flex grow value for responsive layouts
 * @param {Object} props.style - Additional inline styles to apply
 * @param {Function} props.onClick - Optional click handler
 */
const Tile = ({ 
  children, 
  title, 
  variant = 'default',
  size = 'medium',
  flex = 1,
  style = {},
  onClick,
  ...props
}) => {
  // Define styling for variants
  const variants = {
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
    },
    primary: {
      backgroundColor: '#e3f2fd',
      borderColor: '#bbdefb',
    },
    success: {
      backgroundColor: '#e8f5e9',
      borderColor: '#c8e6c9',
    },
    warning: {
      backgroundColor: '#fff8e1',
      borderColor: '#ffecb3',
    },
    danger: {
      backgroundColor: '#ffebee',
      borderColor: '#ffcdd2',
    },
  };

  // Define styling for sizes
  const sizes = {
    small: {
      flex: flex,
      minWidth: '250px',
    },
    medium: {
      flex: flex,
      minWidth: '350px',
    },
    large: {
      flex: flex,
      minWidth: '500px',
    },
    full: {
      flex: 1,
      width: '100%',
    },
  };

  return (
    <div 
      style={{
        padding: '1.25rem',
        borderRadius: '8px',
        border: '1px solid',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow var(--transition-speed) ease',
        cursor: onClick ? 'pointer' : 'default',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {title && (
        <div style={{ 
          marginBottom: '1rem',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          color: '#424242',
          padding: '0 0 0.75rem 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {title}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default Tile;