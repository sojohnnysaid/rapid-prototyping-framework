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
        left: '25px',
        right: 0,
        padding: collapsed ? '0.5rem' : '0.75rem',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f0f8ff',
        maxWidth: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        boxSizing: 'border-box',
        transition: 'padding var(--transition-speed) ease, max-width var(--transition-speed) ease',
        boxShadow: '0 -2px 6px rgba(0,0,0,0.08)',
        zIndex: 10
      }}
    >
      <div 
        onClick={!collapsed ? toggleExpanded : undefined}
        style={{ 
          fontSize: '0.68em', 
          fontWeight: 'bold',
          color: '#1976d2',
          marginBottom: '0.5rem',
          opacity: collapsed ? 0 : 1,
          height: collapsed ? '0' : 'auto',
          overflow: 'hidden',
          transition: 'opacity var(--transition-speed) ease, height var(--transition-speed) ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: collapsed ? 'default' : 'pointer'
        }}
      >
        <span>{validStory.title}</span>
        {!collapsed && (
          <span style={{ fontSize: '0.65em' }}>
            {expanded ? '▲ Collapse' : '▼ View Steps'}
          </span>
        )}
      </div>
      <StoryGuide 
        story={validStory} 
        compactMode={!expanded} 
        showStepList={expanded} 
        onToggleExpand={toggleExpanded}
      />
    </div>
  );
}