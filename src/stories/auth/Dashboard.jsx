import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Link, Navigate } from 'react-router-dom';
import { 
  Tile,
  TileContainer, 
  StatTile, 
  NotificationTile, 
  ActionTile,
  TableTile
} from '../../components';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for demo purposes
  const [applicants, setApplicants] = useState([]);
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Fetch applicants
  useEffect(() => {
    const generateMockApplicants = () => {
      const mockApplicants = [];
      const statuses = ['Pending', 'Eligible', 'Ineligible', 'Under Review'];
      const programs = ['Research Grant', 'Fellowship', 'Scholarship', 'Innovation Fund'];
      
      for (let i = 1; i <= 10; i++) {
        mockApplicants.push({
          id: 1000 + i,
          name: `Applicant ${i}`,
          email: `applicant${i}@example.com`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          program: programs[Math.floor(Math.random() * programs.length)],
          submissionDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString()
        });
      }
      
      setApplicants(mockApplicants);
    };
    
    generateMockApplicants();
  }, []);

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
  
  // Get counts by applicant status
  const pendingCount = applicants.filter(a => a.status === 'Pending').length;
  const eligibleCount = applicants.filter(a => a.status === 'Eligible').length;
  const ineligibleCount = applicants.filter(a => a.status === 'Ineligible').length;
  const reviewCount = applicants.filter(a => a.status === 'Under Review').length;

  // Table columns
  const applicantColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'program', header: 'Program' },
    { key: 'status', header: 'Status' },
    { key: 'submissionDate', header: 'Submitted', format: (value) => new Date(value).toLocaleDateString() }
  ];

  // Quick actions based on user role
  const getQuickActions = () => {
    if (user.role === 'programOfficer') {
      return [
        { 
          label: 'Approval Dashboard', 
          onClick: () => window.location.href = '/change-approval',
          variant: 'primary'
        },
        { 
          label: 'Review Applications', 
          onClick: () => window.location.href = '/applications',
          variant: 'success'
        }
      ];
    } else if (user.role === 'applicantReviewer') {
      return [
        { 
          label: 'Request Changes', 
          onClick: () => window.location.href = '/change-request',
          variant: 'success'
        },
        { 
          label: 'Screen Applicants', 
          onClick: () => window.location.href = '/eligibility',
          variant: 'primary'
        }
      ];
    } else {
      return [
        { 
          label: 'Manage Users', 
          onClick: () => window.location.href = '/user-management',
          variant: 'primary'
        },
        { 
          label: 'System Settings', 
          onClick: () => console.log('Settings clicked'),
          variant: 'default'
        }
      ];
    }
  };

  // Tabs navigation
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Stats Row */}
            <TileContainer columns="4" style={{ marginBottom: '1.5rem' }}>
              <StatTile 
                title="Unread Notifications" 
                value={unreadCount} 
                variant="primary" 
              />
              <StatTile 
                title="Applicants Pending" 
                value={pendingCount} 
                variant="warning" 
              />
              <StatTile 
                title="Eligible Applicants" 
                value={eligibleCount} 
                variant="success" 
              />
              <StatTile 
                title="Under Review" 
                value={reviewCount} 
                variant="default" 
              />
            </TileContainer>
            
            {/* Main content area */}
            <TileContainer columns="3" gap="1.5rem">
              {/* Quick Actions */}
              <ActionTile
                title="Quick Actions"
                actions={getQuickActions()}
              />
              
              {/* Recent Notifications */}
              <Tile
                title="Recent Notifications"
                size="large"
                style={{ padding: 0 }} 
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
                    color: '#757575'
                  }}>
                    <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>No notifications</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      Notifications will appear here when you have updates.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflow: 'hidden' }}>
                    {notifications.slice(0, 3).map(notification => (
                      <NotificationTile
                        key={notification.id}
                        notification={notification}
                        onAction={handleNotificationAction}
                        style={{ 
                          borderRadius: 0, 
                          border: 'none', 
                          borderBottom: '1px solid #eee'
                        }}
                      />
                    ))}
                    {notifications.length > 3 && (
                      <div style={{ 
                        padding: '0.75rem', 
                        textAlign: 'center', 
                        backgroundColor: '#f9f9f9'
                      }}>
                        <Link 
                          to="#"
                          onClick={() => setActiveTab('notifications')}
                          style={{ 
                            color: '#2196f3', 
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        >
                          View all notifications ({notifications.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Tile>
              
              {/* System Status */}
              <Tile title="System Status">
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>API Service</div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>Online</div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>Database</div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>Connected</div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>Authentication</div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>Active</div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                  }}>
                    <div>Storage</div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>Online</div>
                  </div>
                </div>
              </Tile>
            </TileContainer>
            
            {/* Applicants table */}
            <div style={{ marginTop: '1.5rem' }}>
              <TableTile 
                title="Recent Applicants"
                columns={applicantColumns}
                data={applicants.slice(0, 5)}
                onRowClick={(row) => console.log('Clicked applicant', row)}
              />
            </div>
          </>
        );
      
      case 'notifications':
        return (
          <Tile title="All Notifications" size="full" style={{ padding: 0 }}>
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
                color: '#757575'
              }}>
                <p style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No notifications for your role</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Notifications will appear here when you have change requests or updates.
                </p>
              </div>
            ) : (
              <div style={{ overflow: 'hidden' }}>
                {notifications.map(notification => (
                  <NotificationTile
                    key={notification.id}
                    notification={notification}
                    onAction={handleNotificationAction}
                    style={{ 
                      borderRadius: 0, 
                      border: 'none', 
                      borderBottom: '1px solid #eee'
                    }}
                  />
                ))}
              </div>
            )}
          </Tile>
        );
        
      case 'applicants':
        return (
          <TableTile 
            title="All Applicants"
            columns={applicantColumns}
            data={applicants}
            onRowClick={(row) => console.log('Clicked applicant', row)}
          />
        );
        
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Page header */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ color: '#757575' }}>
          Welcome, {user.name} | {user.role}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '1.5rem' 
      }}>
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
            borderBottom: activeTab === 'dashboard' ? '3px solid #2196f3' : 'none',
            color: activeTab === 'dashboard' ? '#2196f3' : '#757575'
          }}
        >
          Dashboard
        </div>
        <div 
          onClick={() => setActiveTab('notifications')}
          style={{ 
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            fontWeight: activeTab === 'notifications' ? 'bold' : 'normal',
            borderBottom: activeTab === 'notifications' ? '3px solid #2196f3' : 'none',
            color: activeTab === 'notifications' ? '#2196f3' : '#757575',
            position: 'relative'
          }}
        >
          Notifications
          {unreadCount > 0 && (
            <span style={{ 
              position: 'absolute',
              top: '-2px',
              right: '1px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div 
          onClick={() => setActiveTab('applicants')}
          style={{ 
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            fontWeight: activeTab === 'applicants' ? 'bold' : 'normal',
            borderBottom: activeTab === 'applicants' ? '3px solid #2196f3' : 'none',
            color: activeTab === 'applicants' ? '#2196f3' : '#757575'
          }}
        >
          Applicants
        </div>
      </div>
      
      {/* Tab content */}
      {renderTabContent()}
    </div>
  );
}