// src/components/Sidebar.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import SidebarStoryGuide from './SidebarStoryGuide';

// Icons for nav items (simple unicode/emoji for now)
const icons = {
  dashboard: "📊",
  eligibility: "✓",
  reviewerAssignment: "👥",
  changeRequest: "📝",
  changeApproval: "👍",
  multiActor: "🔄",
  users: "👤",
  settings: "⚙️",
  transcripts: "📄",
  reports: "📈",
  login: "🔑",
  logout: "🚪"
};

export default function Sidebar({ collapsed, onToggle, story }) {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('');
  
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  // Common links that all roles have access to
  const commonLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard, visible: !!user }
  ];

  // Role-specific links
  const roleLinks = {
    admin: [
      { to: '/eligibility', label: 'Eligibility Screening', icon: icons.eligibility },
      { to: '/reviewer-assignment', label: 'Reviewer Assignment', icon: icons.reviewerAssignment },
      { to: '/change-request', label: 'Submit Change Request', icon: icons.changeRequest },
      { to: '/change-approval', label: 'Approve Changes', icon: icons.changeApproval },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow', icon: icons.multiActor },
      { to: '/users', label: 'User Management', icon: icons.users },
      { to: '/settings', label: 'System Settings', icon: icons.settings }
    ],
    transcriptReviewer: [
      { to: '/eligibility', label: 'Eligibility Screening', icon: icons.eligibility },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow', icon: icons.multiActor },
      { to: '/transcripts', label: 'Review Transcripts', icon: icons.transcripts }
    ],
    applicantReviewer: [
      { to: '/reviewer-assignment', label: 'Reviewer Assignment', icon: icons.reviewerAssignment },
      { to: '/change-request', label: 'Submit Change Request', icon: icons.changeRequest },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow', icon: icons.multiActor }
    ],
    programOfficer: [
      { to: '/eligibility', label: 'Eligibility Screening', icon: icons.eligibility },
      { to: '/change-approval', label: 'Approve Changes', icon: icons.changeApproval },
      { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow', icon: icons.multiActor },
      { to: '/reports', label: 'Program Reports', icon: icons.reports }
    ]
  };

  // Combine the appropriate links based on user role
  const getLinks = () => {
    if (!user) {
      return [
        { to: '/', label: 'Login', icon: icons.login },
        { to: '/multi-actor-workflow', label: 'Multi-Actor Workflow', icon: icons.multiActor }
      ];
    }
    
    return [
      ...commonLinks,
      ...(roleLinks[user.role] || [])
    ];
  };

  const links = getLinks();

  // Logo/branding component
  const Logo = () => (
    <div className="sidebar-logo" style={{
      padding: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '1.4rem',
      borderBottom: collapsed ? 'none' : '1px solid #e0e0e0',
      marginBottom: collapsed ? '30px' : '1rem',
      color: '#1976d2',
      display: 'block',
      height: collapsed ? '0' : 'auto',
      visibility: collapsed ? 'hidden' : 'visible',
      opacity: collapsed ? '0' : '1',
      overflow: 'hidden',
      transition: 'visibility var(--transition-speed), opacity var(--transition-speed), height var(--transition-speed), margin var(--transition-speed)'
    }}>
      PMCS|Lux
    </div>
  );

  // Toggle button component
  const ToggleButton = () => (
    <button
      onClick={onToggle}
      style={{
        position: 'absolute',
        top: '1rem',
        right: collapsed ? '13px' : '-16px',
        width: '32px',
        height: '32px',
        background: '#2196f3',
        border: '1px solid #1976d2',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'right var(--transition-speed) ease',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold'
      }}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? '→' : '←'}
      <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>
        {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      </span>
    </button>
  );

  // User profile component - shows differently based on collapsed state
  const UserProfile = () => {
    if (!user) return null;
    
    return (
      <div style={{ 
        marginBottom: '1.5rem',
        padding: collapsed ? '0.5rem' : '1rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        textAlign: collapsed ? 'center' : 'left',
        overflow: 'hidden'
      }}>
        {!collapsed && (
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </div>
        )}
        <div style={{ 
          fontSize: '0.85rem',
          backgroundColor: '#2196f3',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          display: collapsed ? 'block' : 'inline-block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}>
          {collapsed 
            ? (user.role === 'admin' ? 'A' : 
               user.role === 'transcriptReviewer' ? 'TR' :
               user.role === 'applicantReviewer' ? 'AR' : 'PO')
            : (user.role === 'admin' ? 'Administrator' : 
               user.role === 'transcriptReviewer' ? 'Transcript Reviewer' :
               user.role === 'applicantReviewer' ? 'Applicant Reviewer' : 'Program Officer')
          }
        </div>
      </div>
    );
  };

  // Navigation link component
  const NavLink = ({ link }) => {
    const isActive = currentPath === link.to;
    
    return (
      <li key={link.to}>
        <Link 
          to={link.to}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            borderRadius: '4px',
            textDecoration: 'none',
            color: isActive ? '#1976d2' : '#333',
            backgroundColor: isActive ? '#e3f2fd' : 'transparent',
            border: isActive ? '1px solid #bbdefb' : '1px solid transparent',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = '#e3f2fd';
              e.currentTarget.style.borderColor = '#bbdefb';
              e.currentTarget.style.color = '#1976d2';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = '#333';
            }
          }}
        >
          <span style={{ 
            fontSize: collapsed ? '1.2rem' : '1rem',
            marginRight: collapsed ? '0' : '0.5rem',
            width: collapsed ? '100%' : 'auto',
            textAlign: collapsed ? 'center' : 'left',
            transition: 'font-size var(--transition-speed)'
          }}>
            {link.icon}
          </span>
          {!collapsed && (
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {link.label}
            </span>
          )}
        </Link>
      </li>
    );
  };

  // Logout button component
  const LogoutButton = () => {
    if (!user) return null;
    
    return (
      <li style={{ marginTop: '1rem' }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            color: '#d32f2f',
            cursor: 'pointer',
            textAlign: collapsed ? 'center' : 'left',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start'
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
          <span style={{
            fontSize: collapsed ? '1.2rem' : '1rem',
            marginRight: collapsed ? '0' : '0.5rem'
          }}>
            {icons.logout}
          </span>
          {!collapsed && "Logout"}
        </button>
      </li>
    );
  };

  return (
    <div style={{ 
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'padding var(--transition-speed) ease'
    }}>
      <ToggleButton />
      <Logo />
      
      <div style={{ 
        padding: collapsed ? '0.5rem' : '1rem',
        transition: 'padding var(--transition-speed) ease',
        overflowY: 'auto',
        flex: 1
      }}>
        <UserProfile />
        
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {links.map(link => (
            <NavLink key={link.to} link={link} />
          ))}
          
          <LogoutButton />
        </ul>
      </div>
      
      {/* Story guide at the bottom of the sidebar - sticky position */}
      <SidebarStoryGuide story={story} collapsed={collapsed} />
    </div>
  );
}