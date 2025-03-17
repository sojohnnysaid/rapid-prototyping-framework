import React from 'react';
import Tile from './Tile';
import { Link } from 'react-router-dom';

/**
 * Specialized tile for displaying notifications with actions.
 *
 * @param {Object} props - Component props
 * @param {Object} props.notification - Notification data object
 * @param {Function} props.onAction - Handler for notification action
 * @param {string} props.size - Size variant from Tile component
 * @param {Object} props.style - Additional inline styles
 */
const NotificationTile = ({ 
  notification, 
  onAction,
  size = 'full',
  style = {},
  ...props 
}) => {
  // Determine variant based on notification type
  const getVariant = () => {
    if (!notification) return 'default';
    if (notification.type?.includes('approved')) return 'success';
    if (notification.type?.includes('rejected')) return 'danger';
    if (notification.type === 'change-request-new') return 'warning';
    if (notification.status === 'unread') return 'primary';
    return 'default';
  };

  // Get action button text based on notification type
  const getActionText = () => {
    if (!notification) return 'View';
    if (notification.type === 'change-request-new') return 'Review';
    if (notification.type?.includes('submitted')) return 'View';
    return 'View';
  };

  // Get action URL based on notification type
  const getActionUrl = () => {
    if (!notification) return '/dashboard';
    if (notification.link) return notification.link;
    if (notification.type === 'change-request-new') return '/change-approval';
    if (notification.type?.includes('submitted')) return '/change-request';
    return '/dashboard';
  };

  // Handle click on the notification
  const handleClick = () => {
    if (onAction && notification) {
      onAction(notification);
    }
  };

  // Return empty tile if no notification
  if (!notification) {
    return (
      <Tile 
        variant="default" 
        size={size}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...style
        }}
        {...props}
      >
        <div style={{ textAlign: 'center', color: '#757575' }}>
          No notification available
        </div>
      </Tile>
    );
  }

  return (
    <Tile 
      variant={getVariant()} 
      size={size}
      style={{
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        ...style
      }}
      onClick={handleClick}
      {...props}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ 
          fontWeight: notification.status === 'unread' ? 'bold' : 'normal',
          flex: 1,
          paddingRight: '1rem'
        }}>
          {notification.description}
        </div>
        <div>
          <Link 
            to={getActionUrl()}
            style={{
              padding: '4px 8px',
              backgroundColor: getVariant() === 'default' ? '#757575' :
                              getVariant() === 'primary' ? '#2196f3' :
                              getVariant() === 'success' ? '#4caf50' :
                              getVariant() === 'warning' ? '#ff9800' :
                              getVariant() === 'danger' ? '#f44336' : '#757575',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              display: 'inline-block'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {getActionText()}
          </Link>
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#757575', marginTop: '0.25rem' }}>
        {notification.date ? new Date(notification.date).toLocaleString() : ''}
      </div>
    </Tile>
  );
};

export default NotificationTile;