import React from 'react';
import Tile from './Tile';

/**
 * Specialized tile for displaying statistics or metrics.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the statistic
 * @param {string|number} props.value - The statistic value to display
 * @param {string} props.label - Optional label text to display below the value
 * @param {string} props.variant - Style variant from Tile component
 * @param {string} props.size - Size variant from Tile component
 * @param {Object} props.style - Additional inline styles to apply
 * @param {Function} props.onClick - Optional click handler
 * @param {string} props.icon - Optional icon component or element to display
 */
const StatTile = ({ 
  title,
  value, 
  label, 
  variant = 'default',
  size = 'small',
  style = {},
  onClick,
  icon,
  ...props 
}) => {
  return (
    <Tile
      title={title}
      variant={variant}
      size={size}
      style={{ textAlign: 'center', ...style }}
      onClick={onClick}
      {...props}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {icon && (
          <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            {icon}
          </div>
        )}
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '0.25rem',
          color: variant === 'default' ? '#424242' : undefined 
        }}>
          {value}
        </div>
        {label && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#757575' 
          }}>
            {label}
          </div>
        )}
      </div>
    </Tile>
  );
};

export default StatTile;