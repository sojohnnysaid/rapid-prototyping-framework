// src/components/StoryGuide.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useProcessSteps } from '../context/ProcessStepContext'
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

// Filter out non-actionable steps from the story
const filterNonActionableSteps = (steps) => {
  // Return empty array if steps is undefined or null
  if (!steps || !Array.isArray(steps)) {
    return [];
  }
  
  // Remove "Wait for" steps that aren't actionable by users
  return steps.filter(step => !step.toLowerCase().startsWith('wait for'));
};

export default function StoryGuide({ story, compactMode = false, showStepList = false, onToggleExpand }) {
  // Use our custom hook for process steps
  const { currentStep, setCurrentStep, isStepActionable, isStepTriggered, actionableSteps, completedSteps } = useProcessSteps();
  // State to track if the guide is expanded to show all steps
  // Use showStepList prop when provided, otherwise use internal state
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expanded = showStepList !== undefined ? showStepList : internalExpanded;

  // Handle case where story is not provided or doesn't have the expected structure
  if (!story) return <p>No business rule instructions available.</p>
  if (!story.steps) {
    // If story exists but doesn't have steps, create a default structure
    story = {
      ...story,
      title: story.title || 'Story Guide',
      steps: []
    };
  }
  
  // Filter out non-actionable steps first
  const actionableOnlySteps = filterNonActionableSteps(story.steps);
  
  // Ensure the story has a completion step
  const enhancedSteps = ensureCompletionStep(actionableOnlySteps);
  
  // Create an enhanced story object with completion step added
  const enhancedStory = { 
    ...story, 
    steps: enhancedSteps 
  };
  
  // Check if we're at the completion step, but only if we've gone through all the steps
  // We don't want to show completed if the story just loaded and there are no steps
  const isCompleted = currentStep === enhancedSteps.length - 1 && 
                    enhancedSteps.length > 1 && 
                    completedSteps.length === enhancedSteps.length;
  
  // Progress percentage for the progress bar - ensure we don't divide by zero
  const progressPercentage = enhancedSteps.length <= 1 
    ? 0 
    : (currentStep / (enhancedSteps.length - 1)) * 100
  
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
          fontSize: '0.65em'
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

  // Create a compact version for the sidebar
  const compactContent = () => (
    <div className="compact-story-guide">
      {/* Smaller, more compact layout for sidebar */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.68em', // Smaller overall font size
        backgroundColor: isCompleted ? 'rgba(76, 175, 80, 0.08)' : 'rgba(33, 150, 243, 0.08)',
        padding: '0.5rem',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease'
      }}>
        {/* Step badge */}
        <span style={{ 
          display: 'inline-block', 
          minWidth: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          backgroundColor: isCompleted ? '#4caf50' : '#2196f3', 
          color: 'white',
          textAlign: 'center',
          lineHeight: '20px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}>
          {currentStep + 1}
        </span>
        
        {/* Current step text */}
        <span style={{ 
          fontWeight: 'bold',
          fontSize: '0.68em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexGrow: 1,
          color: isCompleted ? '#2e7d32' : '#1565c0'
        }}>
          {enhancedSteps[currentStep]}
        </span>
        
        {/* Progress indicator */}
        <div style={{
          backgroundColor: isCompleted ? '#e8f5e9' : '#e3f2fd',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '0.65em',
          color: isCompleted ? '#2e7d32' : '#2196f3',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {isCompleted ? 'Done' : `${currentStep + 1}/${Math.max(1, enhancedSteps.length - 1)}`}
        </div>
      </div>
      
      {/* Compact progress bar */}
      <div style={{ 
        height: '4px', 
        backgroundColor: '#e0e0e0', 
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
        marginTop: '0.5rem',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
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
      
      {/* Step List - shown when expanded or when showStepList is true */}
      {(expanded || showStepList) && (
        <div style={{ 
          marginTop: '0.75rem',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '0.65em'
        }}>
          {enhancedSteps.map((step, index) => {
            const isActiveStep = index === currentStep;
            const stepEnabled = actionableSteps.includes(index) || index === currentStep;
            const isLastStep = index === enhancedSteps.length - 1;
            
            return (
              <div 
                key={index} 
                onClick={() => stepEnabled && !isLastStep ? setCurrentStep(index) : null}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: index < enhancedSteps.length - 1 ? '1px solid #f0f0f0' : 'none',
                  backgroundColor: isActiveStep ? '#e3f2fd' : (stepEnabled ? 'white' : '#f9f9f9'),
                  opacity: stepEnabled || isLastStep ? 1 : 0.6,
                  cursor: stepEnabled && !isLastStep ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: isActiveStep ? '#2196f3' : 
                                  isLastStep && isCompleted ? '#4caf50' : 
                                  stepEnabled ? '#bbdefb' : '#e0e0e0',
                  color: isActiveStep || (isLastStep && isCompleted) ? 'white' : '#757575',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </span>
                <span style={{
                  fontSize: compactMode ? '0.65em' : '0.75em',
                  color: isActiveStep ? '#1565c0' : 
                        isLastStep && isCompleted ? '#2e7d32' : 
                        stepEnabled ? '#424242' : '#757575',
                  fontWeight: isActiveStep ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Regular full version
  const fullContent = () => (
    <div className="full-story-guide">
      {/* Only show toggle button when not controlled externally via showStepList prop */}
      {!showStepList && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          {!isCompleted && (
            <button 
              onClick={() => onToggleExpand ? onToggleExpand() : setInternalExpanded(!internalExpanded)}
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
      )}
      
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
            <ol style={{ paddingLeft: '1.5rem', margin: '1rem 0', fontSize: '0.65em' }}>
              {enhancedSteps.map((step, index) => {
                // Determine step status
                const stepActionable = actionableSteps.includes(index);
                const isTriggered = isStepTriggered(index);
                const isLastStep = index === enhancedSteps.length - 1;
                const isActiveStep = index === currentStep;
                
                return (
                  <li key={index} style={{
                    fontWeight: isActiveStep ? 'bold' : 'normal',
                    color: isActiveStep 
                      ? '#2196f3' 
                      : !stepActionable && !isLastStep
                        ? '#9e9e9e' // Gray out non-actionable steps  
                        : 'inherit',
                    padding: '0.25rem 0',
                    cursor: stepActionable && !isLastStep ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                    onClick={() => stepActionable && !isLastStep && setCurrentStep(index)}
                  >
                    <span>{step}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {/* Triggered status */}
                      {!isLastStep && (
                        <span style={{ 
                          fontSize: '0.65em', 
                          color: isTriggered ? '#4caf50' : '#f44336',
                          backgroundColor: isTriggered ? '#e8f5e9' : '#ffebee',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ 
                            fontSize: '0.65em',
                            lineHeight: 1
                          }}>
                            {isTriggered ? '✓' : '✗'}
                          </span>
                          Trigger
                        </span>
                      )}
                      
                      {/* Actionable status */}
                      {stepActionable && !isLastStep && (
                        <span style={{ 
                          fontSize: '0.65em', 
                          color: '#2196f3',
                          backgroundColor: '#e3f2fd',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          Ready
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
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