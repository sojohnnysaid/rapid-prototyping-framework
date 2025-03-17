// src/components/Table.jsx
import React, { useState, useEffect, useRef } from 'react'

// Add CSS animations for smoother transitions
const TableAnimation = () => (
  <style>
    {`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .table-row {
        animation: fadeIn 0.3s ease-out forwards;
        transition: background-color 0.2s ease, transform 0.2s ease;
      }
      
      .table-row:hover {
        background-color: #f5f9ff;
      }
      
      .selected-row {
        background-color: #e3f2fd !important;
        border-left: 3px solid #2196f3;
      }
      
      .table-cell-highlight {
        transition: all 0.3s ease;
      }
      
      .table-cell-highlight:hover {
        background-color: rgba(33, 150, 243, 0.05);
      }
    `}
  </style>
);

export default function Table({ data, columns, selectedRow, onRowClick }) {
  // Function to render cell content
  const renderCell = (row, column) => {
    const value = row[column.key];
    
    // If the column has a custom render function, use it
    if (column.render) {
      return column.render(value, row);
    }
    
    // Otherwise, convert to string for display
    // Handle null/undefined values gracefully
    return value !== null && value !== undefined ? String(value) : '';
  };

  // Animation delay for staggered row appearance
  const getAnimationDelay = (index) => {
    return `${index * 30}ms`;
  };

  // Function to check if a row is selected
  const isRowSelected = (row) => {
    if (!selectedRow) return false;
    
    // Try to match by ID if available
    if (selectedRow.id && row.id) {
      return selectedRow.id === row.id;
    }
    
    // Fall back to object equality
    return selectedRow === row;
  };

  return (
    <>
      <TableAnimation />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '10px 8px', 
                  textAlign: 'left',
                  backgroundColor: '#f9f9f9',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={index}
              className={`table-row ${isRowSelected(row) ? 'selected-row' : ''}`}
              style={{ 
                animationDelay: getAnimationDelay(index),
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map(col => (
                <td 
                  key={col.key} 
                  className="table-cell-highlight"
                  style={{ 
                    border: '1px solid #eee', 
                    padding: '10px 8px',
                    transition: 'background-color 0.2s ease' 
                  }}
                >
                  {renderCell(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}