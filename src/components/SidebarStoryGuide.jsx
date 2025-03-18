// src/components/SidebarStoryGuide.jsx
import React, { useState, useEffect, useRef } from 'react';
import StoryGuide from './StoryGuide';
import { useProcessSteps } from '../context/ProcessStepContext';

export default function SidebarStoryGuide({ story, collapsed }) {
  const [expanded, setExpanded] = useState(false);
  const { currentStep } = useProcessSteps();
  const guideRef = useRef(null);
  
  // Ensure story has minimum required structure - process this AFTER hooks
  const isValidStory = !!story && typeof story === 'object';
  const validStory = isValidStory ? {
    title: story.title || 'Current Story',
    steps: Array.isArray(story.steps) ? story.steps : []
  } : null;
  
  // Scroll the guide into view when steps change
  useEffect(() => {
    if (guideRef.current && validStory) {
      guideRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep, validStory]);
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Render null AFTER all hooks have been called
  if (!validStory) return null;
  
  return (
    <div 
      ref={guideRef}
      style={{ 
        position: 'fixed', 
        bottom: '48px',
        ...(collapsed 
          ? {
              right: '25px',
              left: 'auto',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            } 
          : {
              left: '25px',
              right: 0
            }
        ),
        padding: '0.75rem',
        borderTop: collapsed ? 'none' : '1px solid #e0e0e0',
        backgroundColor: '#f0f8ff',
        width: '250px',  /* Fixed width that matches the sidebar width */
        minWidth: '250px',
        maxWidth: '250px',
        boxSizing: 'border-box',
        transition: 'left var(--transition-speed) ease, right var(--transition-speed) ease',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        zIndex: 10
      }}
    >
      <div 
        onClick={toggleExpanded}
        style={{ 
          fontSize: '0.68em', 
          fontWeight: 'bold',
          color: '#1976d2',
          marginBottom: '0.5rem',
          opacity: 1,
          overflow: 'hidden',
          transition: 'opacity var(--transition-speed) ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <span>{validStory.title}</span>
        <span style={{ fontSize: '0.65em', marginLeft: '0.5rem' }}>
          {expanded ? '▲ Collapse' : '▼ View Steps'}
        </span>
      </div>
      <div style={{ width: '100%' }}>
        <StoryGuide 
          story={validStory} 
          compactMode={!expanded} 
          showStepList={expanded} 
          onToggleExpand={toggleExpanded}
        />
      </div>
    </div>
  );
}