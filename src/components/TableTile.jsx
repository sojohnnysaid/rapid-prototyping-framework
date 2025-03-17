import React, { useState, useEffect } from 'react';
import Tile from './Tile';
import Table from './Table';

/**
 * Specialized tile for displaying tabular data with sorting and filtering.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the table
 * @param {Array} props.columns - Column definitions for the table
 * @param {Array} props.data - Data rows for the table
 * @param {boolean} props.loading - Whether the table is in loading state
 * @param {string} props.size - Size variant from Tile component
 * @param {Object} props.style - Additional inline styles
 * @param {Function} props.onRowClick - Handler for row clicks
 * @param {string} props.emptyMessage - Message to display when table has no data
 * @param {boolean} props.sortable - Whether the table is sortable
 * @param {boolean} props.filterable - Whether the table is filterable
 */
const TableTile = ({ 
  title,
  columns,
  data = [],
  loading = false,
  size = 'full',
  style = {},
  onRowClick,
  emptyMessage = 'No data available',
  sortable = true,
  filterable = true,
  ...props 
}) => {
  // State for sorted data, sort column and sort direction
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // State for filters
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  
  // Initialize sorted data when data changes
  useEffect(() => {
    const initData = [...data];
    setSortedData(initData);
    setFilteredData(initData);
  }, [data]);
  
  // Request sort function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      // Handle null, undefined or empty values
      const aValue = a[key] === null || a[key] === undefined || a[key] === '' ? '' : a[key];
      const bValue = b[key] === null || b[key] === undefined || b[key] === '' ? '' : b[key];
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Number comparison
      if (direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    setSortedData(sortableData);
  };
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    // Remove empty filters
    if (value === '') {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
    
    // Apply filters
    const filteredResults = data.filter(item => {
      return Object.keys(newFilters).every(filterKey => {
        const filterValue = newFilters[filterKey].toLowerCase();
        const itemValue = String(item[filterKey]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
    
    setFilteredData(filteredResults);
    
    // Apply current sort to filtered data
    if (sortConfig.key) {
      const sortableData = [...filteredResults];
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key] === null || a[sortConfig.key] === undefined ? '' : a[sortConfig.key];
        const bValue = b[sortConfig.key] === null || b[sortConfig.key] === undefined ? '' : b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortConfig.direction === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
      
      setSortedData(sortableData);
    } else {
      setSortedData(filteredResults);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({});
    setFilteredData(data);
    
    // Re-apply current sort if any
    if (sortConfig.key) {
      const sortableData = [...data];
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key] === null || a[sortConfig.key] === undefined ? '' : a[sortConfig.key];
        const bValue = b[sortConfig.key] === null || b[sortConfig.key] === undefined ? '' : b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortConfig.direction === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }
        
        if (sortConfig.direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
      
      setSortedData(sortableData);
    } else {
      setSortedData(data);
    }
  };
  
  // Enhanced table component with sorting and filtering
  const EnhancedTable = () => {
    return (
      <div>
        {/* Filter inputs */}
        {filterable && (
          <div style={{ 
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {columns.map(column => (
              <div key={column.key} style={{ display: 'flex', flexDirection: 'column' }}>
                <label 
                  htmlFor={`filter-${column.key}`}
                  style={{ 
                    fontSize: '0.75rem', 
                    color: '#757575',
                    marginBottom: '0.25rem'
                  }}
                >
                  {column.header}
                </label>
                <input
                  id={`filter-${column.key}`}
                  type="text"
                  placeholder={`Filter ${column.header}`}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    fontSize: '0.85rem',
                    width: '120px'
                  }}
                />
              </div>
            ))}
            <button
              onClick={resetFilters}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: 'auto',
                marginTop: '1.25rem', // Align with inputs
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2196f3';
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            borderSpacing: 0,
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr>
                {columns.map(column => (
                  <th 
                    key={column.key}
                    onClick={() => sortable && requestSort(column.key)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '2px solid #e0e0e0',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: sortConfig.key === column.key ? '#2196f3' : '#424242',
                      cursor: sortable ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                      position: 'relative',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={sortable ? (e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    } : undefined}
                    onMouseLeave={sortable ? (e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } : undefined}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{column.header}</span>
                      {sortable && sortConfig.key === column.key && (
                        <span style={{ marginLeft: '0.5rem' }}>
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#757575'
                    }}
                  >
                    {Object.keys(filters).length > 0 ? 'No results match your filters' : emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f8ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';
                    }}
                  >
                    {columns.map((column) => (
                      <td 
                        key={column.key}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #e0e0e0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '250px'
                        }}
                      >
                        {column.format ? column.format(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table info */}
        <div style={{ 
          marginTop: '0.75rem',
          fontSize: '0.85rem',
          color: '#757575',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            Showing {sortedData.length} of {data.length} entries
          </div>
          {Object.keys(filters).length > 0 && (
            <div>
              Filtered by: {Object.keys(filters).map(key => 
                columns.find(col => col.key === key)?.header
              ).join(', ')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Tile
      title={title}
      variant="default"
      size={size}
      style={{
        padding: '1rem',
        ...style
      }}
      {...props}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #f3f3f3',
              borderRadius: '50%',
              borderTop: '3px solid #2196f3',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
          <p style={{ color: '#757575' }}>Loading data...</p>
          <style jsx="true">{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : data.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#757575'
        }}>
          {emptyMessage}
        </div>
      ) : (
        <EnhancedTable />
      )}
    </Tile>
  );
};

export default TableTile;