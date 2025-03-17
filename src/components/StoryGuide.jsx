// src/components/StoryGuide.jsx
import React, { useContext, useState, useRef, useEffect } from 'react'
import { ProcessStepContext } from '../context/ProcessStepContext'
import { Easing, Duration } from '../hooks/useTransitions'

// Check if a step array has the "User Journey Completed" final step
const hasCompletionStep = (steps) => {
  return steps.length > 0 && steps[steps.length - 1] === 'User Journey Completed';
};

// Add a completion step to any story that doesn't have one
const ensureCompletionStep = (storySteps) => {
  if (hasCompletionStep(storySteps)) {
    return storySteps;
  }
  
  // Make a copy to avoid mutating the original
  return [...storySteps, 'User Journey Completed'];
};

export default function StoryGuide({ story, compactMode = false }) {
  // Use the global process step context
  const { currentStep, setCurrentStep } = useContext(ProcessStepContext)
  // State to track if the guide is expanded to show all steps
  const [expanded, setExpanded] = useState(false)

  if (!story) return <p>No business rule instructions available.</p>
  
  // Ensure the story has a completion step
  const enhancedSteps = ensureCompletionStep(story.steps);
  
  // Create an enhanced story object with completion step added
  const enhancedStory = { 
    ...story, 
    steps: enhancedSteps 
  };
  
  // Check if we're at the completion step
  const isCompleted = currentStep === enhancedSteps.length - 1;
  
  // Progress percentage for the progress bar
  const progressPercentage = (currentStep / (enhancedSteps.length - 1)) * 100
  
  // Journey completion UI - shown at the completion step
  const JourneyCompletionUI = () => {
    const completionRef = useRef(null);
    const checkmarkRef = useRef(null);
    
    // Apply entrance animations when component mounts
    useEffect(() => {
      if (completionRef.current) {
        completionRef.current.style.opacity = '0';
        completionRef.current.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          if (completionRef.current) {
            completionRef.current.style.opacity = '1';
            completionRef.current.style.transform = 'translateY(0)';
          }
        }, 50);
      }
      
      // Animate the checkmark with a slight delay
      if (checkmarkRef.current) {
        checkmarkRef.current.style.opacity = '0';
        checkmarkRef.current.style.transform = 'scale(0.5)';
        
        setTimeout(() => {
          if (checkmarkRef.current) {
            checkmarkRef.current.style.opacity = '1';
            checkmarkRef.current.style.transform = 'scale(1)';
          }
        }, 300);
      }
    }, []);
    
    return (
      <div 
        ref={completionRef}
        style={{
          margin: '1rem 0',
          padding: '1.5rem',
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          border: '1px solid #4caf50',
          opacity: 0,
          transform: 'translateY(20px)',
          transition: `
            opacity 600ms ${Easing.easeOut}, 
            transform 600ms ${Easing.smooth},
            box-shadow 300ms ${Easing.easeOut}
          `,
          willChange: 'opacity, transform'
        }}
      >
        <div 
          ref={checkmarkRef}
          style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 1.5rem auto',
            backgroundColor: '#4caf50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
            opacity: 0,
            transform: 'scale(0.5)',
            transition: `
              opacity 400ms ${Easing.easeOut} 300ms, 
              transform 500ms ${Easing.bounce} 300ms
            `
          }}
        >
          ✓
        </div>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: '#2e7d32',
          fontSize: '1.5rem'
        }}>
          User Journey Completed!
        </h3>
        <p style={{ 
          margin: '0 0 1.5rem 0',
          color: '#388e3c',
          fontSize: '1.1rem'
        }}>
          You have successfully completed the {story.title}.
        </p>
        <button
          onClick={() => {
            // Refresh the entire page instead of just resetting the step
            window.location.reload();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(76, 175, 80, 0.3)',
            transition: `
              background-color 200ms ${Easing.easeOut},
              transform 200ms ${Easing.easeOut},
              box-shadow 200ms ${Easing.easeOut}
            `
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#43a047';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 5px 12px rgba(76, 175, 80, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4caf50';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 8px rgba(76, 175, 80, 0.3)';
          }}
        >
          Start New Journey
        </button>
      </div>
    );
  };

  // Create a compact version for the footer
  const compactContent = () => (
    <div className="compact-story-guide">
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {/* Simplified title */}
        <div style={{ 
          fontWeight: 'bold', 
          color: '#1565c0', 
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '150px'
        }}>
          {enhancedStory.title}:
        </div>
        
        {/* Current step info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexGrow: 1
        }}>
          {/* Step badge */}
          <span style={{ 
            display: 'inline-block', 
            width: '20px', 
            height: '20px', 
            borderRadius: '50%', 
            backgroundColor: isCompleted ? '#4caf50' : '#2196f3', 
            color: 'white',
            textAlign: 'center',
            lineHeight: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {currentStep + 1}
          </span>
          
          {/* Step text */}
          <span style={{ 
            fontWeight: 'bold',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1
          }}>
            {enhancedSteps[currentStep]}
          </span>
        </div>
        
        {/* Progress indicator */}
        <div style={{
          backgroundColor: isCompleted ? '#e8f5e9' : '#e3f2fd',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          color: isCompleted ? '#2e7d32' : '#2196f3',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {isCompleted ? 'Completed' : `${currentStep + 1}/${enhancedSteps.length - 1}`}
        </div>
      </div>
      
      {/* Compact progress bar */}
      <div style={{ 
        marginTop: '0.5rem',
        height: '4px', 
        backgroundColor: '#e0e0e0', 
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ 
          width: `${progressPercentage}%`, 
          height: '100%', 
          background: isCompleted 
            ? 'linear-gradient(90deg, #43a047, #66bb6a)' 
            : 'linear-gradient(90deg, #1e88e5, #42a5f5)',
          borderRadius: '2px',
          transition: `width 600ms ${Easing.easeInOut}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Pulse animation */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: 'progressPulse 2s ease-in-out infinite'
          }} />
        </div>
      </div>
    </div>
  );

  // Regular full version
  const fullContent = () => (
    <div className="full-story-guide">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{ margin: 0 }}>{enhancedStory.title}</h3>
        {!isCompleted && (
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#2196f3',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {expanded ? (
              <>
                <span>Collapse</span>
                <span style={{ fontSize: '1.2rem' }}>▲</span>
              </>
            ) : (
              <>
                <span>Show All Steps</span>
                <span style={{ fontSize: '1.2rem' }}>▼</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Enhanced progress bar with animations */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1rem'
      }}>
        <div style={{ 
          flex: 1,
          height: '5px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            width: `${progressPercentage}%`, 
            height: '100%', 
            background: isCompleted 
              ? 'linear-gradient(90deg, #43a047, #66bb6a)' 
              : 'linear-gradient(90deg, #1e88e5, #42a5f5)',
            borderRadius: '3px',
            transition: `width 600ms ${Easing.easeInOut}`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isCompleted 
              ? '0 0 8px rgba(76,175,80,0.5)' 
              : '0 0 8px rgba(33,150,243,0.5)'
          }}>
            {/* Add a subtle pulse effect to the progress bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              animation: 'progressPulse 2s ease-in-out infinite'
            }} />
          </div>
        </div>
        
        <div style={{
          backgroundColor: isCompleted ? '#e8f5e9' : '#e3f2fd',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          color: isCompleted ? '#2e7d32' : '#2196f3',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {isCompleted ? 'Completed' : `Step ${currentStep + 1} of ${enhancedSteps.length - 1}`}
        </div>
      </div>
      
      {/* If we're at the completion step, show the completion UI */}
      {isCompleted ? (
        <JourneyCompletionUI />
      ) : (
        <>
          {/* Step display: either just current step or all steps */}
          {expanded ? (
            // Show all steps when expanded
            <ol style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
              {enhancedSteps.map((step, index) => (
                <li key={index} style={{
                  fontWeight: index === currentStep ? 'bold' : 'normal',
                  color: index === currentStep ? '#2196f3' : 'inherit',
                  padding: '0.25rem 0',
                  cursor: index === enhancedSteps.length - 1 ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                  onClick={() => index !== enhancedSteps.length - 1 && setCurrentStep(index)}
                >
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            // Show only the current step
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#e3f2fd',
              borderLeft: '3px solid #2196f3',
              borderRadius: '4px',
              margin: '0.5rem 0',
              boxShadow: '0 2px 4px rgba(33,150,243,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#2196f3', 
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: '24px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {currentStep + 1}
                </span>
                <span style={{ color: '#1565c0' }}>Current Step</span>
              </div>
              <div style={{ paddingLeft: '2rem', fontWeight: 'bold' }}>
                {enhancedSteps[currentStep]}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      <style>
        {`
          @keyframes progressPulse {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
      
      {/* Either render the compact or full version based on the prop */}
      {compactMode ? compactContent() : fullContent()}
    </div>
  )
}