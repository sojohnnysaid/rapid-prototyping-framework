// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { Easing, Duration } from '../hooks/useTransitions';

export default function Modal({ onClose, children }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  // Apply entrance animation when component mounts
  useEffect(() => {
    // Animate the overlay
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0';
      setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.style.opacity = '1';
        }
      }, 10);
    }
    
    // Animate the modal
    if (modalRef.current) {
      modalRef.current.style.opacity = '0';
      modalRef.current.style.transform = 'translateY(30px) scale(0.95)';
      
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.style.opacity = '1';
          modalRef.current.style.transform = 'translateY(0) scale(1)';
        }
      }, 50);
    }
    
    // Add escape key listener
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);
  
  // Handle closing with animation
  const handleClose = () => {
    // Animate the modal out
    if (modalRef.current) {
      modalRef.current.style.opacity = '0';
      modalRef.current.style.transform = 'translateY(10px) scale(0.98)';
    }
    
    // Animate the overlay out
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0';
    }
    
    // Wait for animation to complete before closing
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000,
        opacity: 0,
        transition: `opacity 300ms ${Easing.easeOut}`,
        backdropFilter: 'blur(2px)'
      }}
      onClick={handleClose}
    >
      <div 
        ref={modalRef}
        style={{
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          maxWidth: '500px', 
          width: '100%', 
          position: 'relative',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2), 0 8px 12px rgba(0, 0, 0, 0.1)',
          opacity: 0,
          transform: 'translateY(30px) scale(0.95)',
          transition: `
            opacity 300ms ${Easing.easeOut},
            transform 400ms ${Easing.smooth}
          `,
          willChange: 'transform, opacity'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose} 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: `background-color 150ms ${Easing.easeOut}`,
            color: '#666'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}