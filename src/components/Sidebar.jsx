// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function Sidebar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  // Common links that all roles have access to
  const commonLinks = [
    { to: '/dashboard', label: 'Dashboard', visible: !!user }
  ];

  // Role-specific links
  const roleLinks = {
    admin: [
      { to: '/eligibility', label: 'Eligibility Screening' },
      { to: '/reviewer-assignment', label: 'Reviewer Assignment' },
      { to: '/change-request', label: 'Submit Change Request' },
      { to: '/change-approval', label: 'Approve Changes' },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow' },
      { to: '/users', label: 'User Management' },
      { to: '/settings', label: 'System Settings' }
    ],
    transcriptReviewer: [
      { to: '/eligibility', label: 'Eligibility Screening' },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow' },
      { to: '/transcripts', label: 'Review Transcripts' }
    ],
    applicantReviewer: [
      { to: '/reviewer-assignment', label: 'Reviewer Assignment' },
      { to: '/change-request', label: 'Submit Change Request' },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow' }
    ],
    programOfficer: [
      { to: '/eligibility', label: 'Eligibility Screening' },
      { to: '/change-approval', label: 'Approve Changes' },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow' },
      { to: '/reports', label: 'Program Reports' }
    ]
  };

  // Combine the appropriate links based on user role
  const getLinks = () => {
    if (!user) {
      return [
        { to: '/', label: 'Login' },
        { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow' }
      ];
    }
    
    return [
      ...commonLinks,
      ...(roleLinks[user.role] || [])
    ];
  };

  const links = getLinks();

  return (
    <div style={{ padding: '1rem' }}>
      {user ? (
        <>
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {user.name}
            </div>
            <div style={{ 
              fontSize: '0.85rem',
              backgroundColor: '#2196f3',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {user.role === 'admin' ? 'Administrator' : 
               user.role === 'transcriptReviewer' ? 'Transcript Reviewer' :
               user.role === 'applicantReviewer' ? 'Applicant Reviewer' :
               'Program Officer'}
            </div>
          </div>
          
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {links.map((link) => (
              <li key={link.to}>
                <Link 
                  to={link.to}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: '#333',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                    e.currentTarget.style.borderColor = '#bbdefb';
                    e.currentTarget.style.color = '#1976d2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            <li style={{ marginTop: '1rem' }}>
              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5',
                  color: '#d32f2f',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffebee';
                  e.currentTarget.style.borderColor = '#ffcdd2';
                  e.currentTarget.style.color = '#c62828';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.color = '#d32f2f';
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </>
      ) : (
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <li>
            <Link 
              to="/"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e3f2fd';
                e.currentTarget.style.borderColor = '#bbdefb';
                e.currentTarget.style.color = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#333';
              }}
            >
              Login
            </Link>
          </li>
          <li>
            <Link 
              to="/multi-actor-workflow"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e3f2fd';
                e.currentTarget.style.borderColor = '#bbdefb';
                e.currentTarget.style.color = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#333';
              }}
            >
              Multi-Actor Workflow
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}