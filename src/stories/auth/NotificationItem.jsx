import React from 'react';

export default function NotificationItem({ 
  id, 
  description, 
  status, 
  createdAt, 
  createdBy, 
  onDecision 
}) {
  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get background color based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'Approved':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderLeft: '4px solid #4caf50'
        };
      case 'Rejected':
        return {
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderLeft: '4px solid #f44336'
        };
      default: // Pending
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          borderLeft: '4px solid #2196f3'
        };
    }
  };

  return (
    <div style={{ 
      padding: '1rem',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      ...getStatusStyles()
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{description}</h4>
        <div style={{ 
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          backgroundColor: status === 'Pending' ? '#bbdefb' : 
                          status === 'Approved' ? '#c8e6c9' : '#ffcdd2',
          color: status === 'Pending' ? '#0d47a1' : 
                status === 'Approved' ? '#1b5e20' : '#b71c1c',
        }}>
          {status}
        </div>
      </div>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#757575'
      }}>
        <div>
          <strong>Created by:</strong> {createdBy}
        </div>
        <div>
          <strong>Date:</strong> {formatDate(createdAt)}
        </div>
      </div>
      
      {status === 'Pending' && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}>
          <button 
            onClick={() => onDecision(id, 'Rejected')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f5f5f5',
              color: '#d32f2f',
              border: '1px solid #e57373',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reject
          </button>
          <button 
            onClick={() => onDecision(id, 'Approved')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(76,175,80,0.3)'
            }}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}