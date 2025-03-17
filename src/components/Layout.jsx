// src/components/Layout.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

// Footer component
function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer style={{ 
      marginTop: '4rem', 
      padding: '2rem 1rem',
      borderTop: '1px solid #e0e0e0',
      backgroundColor: '#f9f9f9',
      textAlign: 'center',
      color: '#666',
      fontSize: '0.9rem',
      width: '100%'
    }}>
      <div className="wide-container">
        <div style={{ marginBottom: '1rem' }}>
          <strong>NSF GRFP Rapid Prototyping Framework</strong> - Prototype for NSF Graduate Research Fellowship Program
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div>About</div>
          <div>Terms of Service</div>
          <div>Privacy Policy</div>
          <div>Contact</div>
          <div>Help</div>
        </div>
        <div>
          <p>&copy; {currentYear} National Science Foundation. All rights reserved.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>This is a prototype application and does not represent an official NSF system.</p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ sidebarContent, content, story }) {
  // State for sidebar collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Check if user has previously set a preference
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);
  
  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="layout" style={{ 
      width: '100%', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        flexGrow: 1,
        position: 'relative',
        height: '100%'
      }}>
        {/* Sidebar with collapsible state */}
        <nav style={{ 
          width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)', 
          minWidth: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)', 
          borderRight: '1px solid #ddd',
          backgroundColor: '#f9f9f9',
          transition: 'width var(--transition-speed) ease, min-width var(--transition-speed) ease',
          zIndex: 100,
          height: '100%',
          position: 'sticky',
          top: 0,
          overflowY: 'auto'
        }}>
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar}
          />
        </nav>

        {/* Main content area */}
        <div style={{ 
          flexGrow: 1, 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'padding var(--transition-speed) ease',
          width: '100%',
          overflow: 'hidden'
        }}>
          {/* Title bar for the page */}
          <div style={{ 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <h1 style={{ 
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 'normal',
              color: '#1976d2',
              padding: 0
            }}>
              NSF Graduate Research Fellowship Program
            </h1>
          </div>
          
          {/* If a story is provided, render it at the top */}
          {story && (
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1.25rem', 
              border: '1px solid #2196f3', 
              borderRadius: '8px',
              background: 'linear-gradient(to right, #f0f8ff, #f5f9ff)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {story}
            </div>
          )}
          
          {/* Main content */}
          <div style={{ 
            flexGrow: 1,
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {content}
          </div>
        </div>
      </div>
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  )
}