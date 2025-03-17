// src/components/FloatingStoryGuide.jsx
import React, { useState, useEffect, useRef } from 'react';
import StoryGuide from './StoryGuide';
import { useProcessSteps } from '../context/ProcessStepContext';

/**
 * FloatingStoryGuide - Wraps StoryGuide component and adds fixed footer functionality
 * This component renders the story guide in a fixed footer when the user scrolls past
 * the original guide position.
 * 
 * @param {Object} props
 * @param {Object} props.story - The story object to pass to StoryGuide
 * @returns {JSX.Element}
 */
export default function FloatingStoryGuide({ story }) {
  // State to track if the guide should be fixed to the bottom
  const [isFixed, setIsFixed] = useState(false);
  
  // Reference to the original guide container
  const guideRef = useRef(null);
  
  // Use IntersectionObserver to detect when the guide is out of viewport
  useEffect(() => {
    if (!guideRef.current) return;
    
    const options = {
      threshold: 0, // Trigger as soon as any part is out of view
      rootMargin: '-10px 0px 0px 0px' // 10px buffer at the top
    };
    
    // Create an observer to watch when the guide scrolls out of view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If the guide is not intersecting (out of view), show the fixed guide
        setIsFixed(!entry.isIntersecting);
      });
    }, options);
    
    // Start observing the guide element
    observer.observe(guideRef.current);
    
    // Clean up the observer on component unmount
    return () => {
      if (guideRef.current) {
        observer.unobserve(guideRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Original guide that will be visible at the top */}
      <div ref={guideRef}>
        <StoryGuide story={story} />
      </div>
      
      {/* Fixed guide that appears at the bottom when scrolling */}
      {isFixed && (
        <div 
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
            padding: '10px 20px',
            borderTop: '1px solid #e0e0e0',
            transition: 'transform 0.3s ease-in-out, max-height 0.3s ease-in-out',
            transform: isFixed ? 'translateY(0)' : 'translateY(100%)',
            maxHeight: '40vh',
            overflowY: 'auto'
          }}
          className="floating-story-guide"
        >
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto',
            padding: '0 250px 0 0' // Account for the sidebar width (250px)
          }}
          className="floating-guide-content"
          >
            {/* Mobile-friendly collapse/expand toggle button */}
            <button 
              onClick={() => {
                const guide = document.querySelector('.floating-story-guide');
                if (guide.classList.contains('collapsed')) {
                  guide.classList.remove('collapsed');
                } else {
                  guide.classList.add('collapsed');
                }
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#2196f3',
                display: 'none' // Hidden by default, shown on mobile
              }}
              className="mobile-toggle"
            >
              ▲
            </button>
            
            {/* Pass a compactMode prop to the floating version */}
            <StoryGuide story={story} compactMode={true} />
          </div>
          
          {/* Add CSS for responsive behavior */}
          <style>
            {`
              @media (max-width: 768px) {
                .floating-story-guide {
                  padding: 10px;
                }
                .floating-guide-content {
                  padding: 0 !important;
                }
                .mobile-toggle {
                  display: block !important;
                }
                .floating-story-guide.collapsed {
                  max-height: 80px;
                  overflow: hidden;
                }
                .floating-story-guide.collapsed .mobile-toggle {
                  transform: rotate(180deg);
                }
              }
            `}
          </style>
        </div>
      )}
      
      {/* Add padding at the bottom when the fixed guide is showing */}
      {isFixed && <div style={{ height: '100px' }} />}
    </>
  );
}