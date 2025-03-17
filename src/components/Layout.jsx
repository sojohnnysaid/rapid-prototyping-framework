// src/components/Layout.jsx
import React from 'react'

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
      fontSize: '0.9rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>NSF GRFP Rapid Prototyping Framework</strong> - Prototype for NSF Graduate Research Fellowship Program
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
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

export default function Layout({ sidebar, content, story }) {
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        flexGrow: 1
      }}>
        {/* Sidebar - increased width */}
        <nav style={{ 
          width: '250px', 
          minWidth: '250px', 
          padding: '0.75rem', 
          borderRight: '1px solid #ddd',
          backgroundColor: '#f9f9f9'
        }}>
          {sidebar}
        </nav>

        {/* Main area: StoryGuide above main content */}
        <div style={{ 
          flexGrow: 1, 
          padding: '1rem', 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          {/* If a story is provided, render it at the top */}
          {story && (
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1.25rem', 
              border: '1px solid #2196f3', 
              borderRadius: '6px',
              background: '#f0f8ff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {story}
            </div>
          )}
          <div style={{ flexGrow: 1 }}>
            {content}
          </div>
        </div>
      </div>
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  )
}