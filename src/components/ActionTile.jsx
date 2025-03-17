import React from 'react';
import Tile from './Tile';

/**
 * Specialized tile for displaying action buttons or links.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the tile
 * @param {Array} props.actions - Array of action objects with label, onClick, variant, and icon
 * @param {string} props.size - Size variant from Tile component
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.layout - Layout direction ('row' or 'column')
 */
const ActionTile = ({ 
  title,
  actions = [],
  size = 'medium',
  style = {},
  layout = 'column',
  ...props 
}) => {
  const isRowLayout = layout === 'row';
  
  return (
    <Tile
      title={title}
      variant="default"
      size={size}
      style={{
        ...style
      }}
      {...props}
    >
      <div style={{ 
        display: 'flex',
        flexDirection: isRowLayout ? 'row' : 'column',
        gap: isRowLayout ? '0.75rem' : '0.5rem',
        flexWrap: isRowLayout ? 'wrap' : 'nowrap',
        justifyContent: isRowLayout ? 'center' : 'flex-start'
      }}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 
                action.variant === 'primary' ? '#2196f3' :
                action.variant === 'success' ? '#4caf50' :
                action.variant === 'warning' ? '#ff9800' :
                action.variant === 'danger' ? '#f44336' : '#e0e0e0',
              color: 
                action.variant === 'primary' || 
                action.variant === 'success' || 
                action.variant === 'warning' || 
                action.variant === 'danger' ? 'white' : '#424242',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flex: isRowLayout ? '0 0 auto' : '1',
              transition: 'all var(--transition-speed) ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              fontSize: '0.9rem'
            }}
          >
            {action.icon && (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>
    </Tile>
  );
};

export default ActionTile;