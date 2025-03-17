import React from 'react';

/**
 * Container component for organizing tiles in a responsive grid layout.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tile components to render inside the container
 * @param {string} props.columns - Number of columns or responsive column layout (auto, 1, 2, 3, 4, auto-fit)
 * @param {string} props.gap - Gap between tiles
 * @param {Object} props.style - Additional inline styles
 */
const TileContainer = ({ 
  children, 
  columns = 'auto-fit', 
  gap = '1rem',
  style = {},
  ...props 
}) => {
  // Define grid template column presets
  const columnPresets = {
    '1': 'repeat(1, 1fr)',
    '2': 'repeat(2, 1fr)',
    '3': 'repeat(3, 1fr)',
    '4': 'repeat(4, 1fr)',
    'auto': 'auto',
    'auto-fit': 'repeat(auto-fit, minmax(300px, 1fr))'
  };

  const gridTemplateColumns = columnPresets[columns] || columns;

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns,
        gap: gap,
        width: '100%',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default TileContainer;