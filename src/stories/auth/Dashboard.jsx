import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Fetch notifications that are relevant to the user's role
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Fetch notifications from the API
        const response = await fetch(`/api/notifications?targetRole=${user.role}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.length > 0) {
            console.log(`Loaded ${data.length} notifications for user role: ${user.role}`);
            setNotifications(data);
            setLoading(false); // Set loading to false here
          } else {
            console.log(`No notifications found for user role: ${user.role}, creating samples`);
            
            // Create initial sample notifications if none exist
            if (user.role === 'programOfficer') {
              // Sample change request for program officers to approve
              const changeRequest = {
                id: 5101,
                title: "Eligibility Status Change",
                description: "Request to change eligibility status from Pending to Eligible",
                status: "pending",
                requestType: "eligibility",
                requestedById: 3,
                requestedByName: "Applicant Reviewer",
                requestedByRole: "applicantReviewer",
                targetId: 1001,
                targetType: "applicant",
                currentValue: "Pending",
                requestedValue: "Eligible",
                dateRequested: new Date().toISOString()
              };
              
              // POST the sample change request
              const createResponse = await fetch('/api/change-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changeRequest)
              });
              
              if (createResponse.ok) {
                // Refetch notifications after creating the sample
                const refreshResponse = await fetch(`/api/notifications?targetRole=${user.role}`);
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  setNotifications(refreshData);
                }
                setLoading(false); // Set loading to false here
              }
            } else if (user.role === 'applicantReviewer') {
              // Create a sample notification for applicant reviewers
              const notification = {
                id: 6201,
                description: "Your change request for applicant #1001 has been approved",
                status: "unread",
                type: "change-request",
                targetRole: "applicantReviewer",
                relatedId: 5001,
                date: new Date().toISOString(),
                link: "/change-request"
              };
              
              // Create the notification directly
              const createNotificationResponse = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notification)
              });
              
              if (createNotificationResponse.ok) {
                // Refetch notifications 
                const refreshResponse = await fetch(`/api/notifications?targetRole=${user.role}`);
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  setNotifications(refreshData);
                }
                setLoading(false); // Set loading to false here
              }
            } else {
              // If no sample notifications were created, still set loading to false
              setLoading(false);
            }
          }
          return;
        }
        
        // Fallback to mock data if API call fails
        console.warn('Falling back to mock notifications');
        // Create appropriate notifications based on role
        let mockNotifications = [];
        
        if (user.role === 'programOfficer') {
          mockNotifications = [
            {
              id: 6001,
              description: 'New eligibility change request for applicant #1001 from Applicant Reviewer',
              status: 'unread',
              type: 'change-request',
              targetRole: 'programOfficer',
              relatedId: 5001,
              date: new Date().toISOString(),
              link: '/change-approval'
            },
            {
              id: 6002,
              description: 'New eligibility change request for applicant #1004 from Applicant Reviewer',
              status: 'unread',
              type: 'change-request',
              targetRole: 'programOfficer',
              relatedId: 5002,
              date: new Date(Date.now() - 86400000).toISOString(),
              link: '/change-approval'
            }
          ];
        } else if (user.role === 'applicantReviewer') {
          mockNotifications = [
            {
              id: 7001,
              description: 'Your change request for applicant #1001 has been approved',
              status: 'unread',
              type: 'change-request',
              targetRole: 'applicantReviewer',
              relatedId: 5001,
              date: new Date().toISOString(),
              link: '/change-request'
            }
          ];
        } else if (user.role === 'admin') {
          mockNotifications = [
            {
              id: 6001,
              description: 'New eligibility change request for applicant #1001 from Applicant Reviewer',
              status: 'unread',
              type: 'change-request',
              targetRole: 'programOfficer',
              relatedId: 5001,
              date: new Date().toISOString(),
              link: '/change-approval'
            },
            {
              id: 7001,
              description: 'Your change request for applicant #1001 has been approved',
              status: 'unread',
              type: 'change-request',
              targetRole: 'applicantReviewer',
              relatedId: 5001,
              date: new Date().toISOString(),
              link: '/change-request'
            }
          ];
        }
        
        setNotifications(mockNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle notification action (mark as read, navigate, etc)
  const handleNotificationAction = async (notification) => {
    // If notification is unread, mark it as read
    if (notification.status === 'unread') {
      try {
        const response = await fetch(`/api/notifications/${notification.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'read'
          })
        });
        
        if (response.ok) {
          // Update local state
          setNotifications(notifications.map(n => 
            n.id === notification.id 
              ? { ...n, status: 'read' }
              : n
          ));
        }
      } catch (error) {
        console.error('Error updating notification status:', error);
      }
    }
  };

  // Get counts by status type
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const readCount = notifications.filter(n => n.status === 'read').length;
  const totalCount = notifications.length;

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ 
        marginBottom: '2rem'
      }}>
        <h2>Dashboard</h2>
      </div>
      
      {/* Stats Row */}
      <div style={{ 
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          flex: 1,
          padding: '1.5rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>Unread</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{unreadCount}</div>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem',
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2e7d32' }}>Read</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{readCount}</div>
        </div>
        <div style={{ 
          flex: 1,
          padding: '1.5rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#424242' }}>Total</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalCount}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Notifications</h3>
        {user.role === 'programOfficer' && (
          <Link 
            to="/change-approval"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2196f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Approval Dashboard
          </Link>
        )}
        
        {user.role === 'applicantReviewer' && (
          <Link 
            to="/change-request"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4caf50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Request Changes
          </Link>
        )}
      </div>
      
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
          <p style={{ color: '#757575' }}>Loading notifications...</p>
          <style jsx="true">{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          color: '#757575'
        }}>
          <p style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No notifications for your role</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Notifications will appear here when you have change requests or updates.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {notifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationAction(notification)}
              style={{ 
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: notification.status === 'unread' 
                  ? (notification.type.includes('approved') 
                      ? '#e8f5e9' // Light green for approved
                      : notification.type.includes('rejected') 
                        ? '#ffebee' // Light red for rejected
                        : notification.type === 'change-request-new'
                          ? '#fff8e1' // Light amber for new requests
                          : '#e3f2fd') // Default light blue
                  : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: notification.status === 'unread' ? 'bold' : 'normal' }}>
                  {notification.description}
                </div>
                <div>
                  {/* Action button based on notification type */}
                  {notification.type === 'change-request-new' || notification.type === 'change-request' ? (
                    <Link 
                      to="/change-approval"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      Review
                    </Link>
                  ) : notification.type === 'change-request-submitted' ? (
                    <Link 
                      to="/change-request"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      View
                    </Link>
                  ) : notification.type.includes('approved') ? (
                    <Link 
                      to={notification.link || "/dashboard"}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      View
                    </Link>
                  ) : notification.type.includes('rejected') ? (
                    <Link 
                      to={notification.link || "/dashboard"}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      View
                    </Link>
                  ) : (
                    <Link 
                      to={notification.link || "/dashboard"}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#757575',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#757575', marginTop: '0.25rem' }}>
                {new Date(notification.date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}