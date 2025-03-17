import React, { useState, useEffect, useRef } from 'react';
import { useProcessSteps } from '../context/ProcessStepContext';
import { Easing, Duration } from '../hooks/useTransitions';

/**
 * StepSection - A component for wrapping sections that correspond to steps in a business process.
 * Used to visually highlight the current active step.
 * 
 * @param {Object} props
 * @param {number} props.stepNumber - The step number in the process (0-indexed)
 * @param {React.ReactNode} props.children - Child components/elements
 * @returns {JSX.Element}
 */
const StepSection = ({ stepNumber, children }) => {
  const { currentStep } = useProcessSteps();
  const sectionRef = useRef(null);
  const [wasActive, setWasActive] = useState(false);
  
  // Determine if this section is the active step
  const isActiveStep = currentStep === stepNumber;
  
  // Track when a step becomes active
  useEffect(() => {
    if (isActiveStep && !wasActive) {
      setWasActive(true);
    }
  }, [isActiveStep, wasActive]);
  
  // Calculate distance from current step (-1 = previous, 0 = current, 1 = next, etc.)
  const stepDistance = currentStep - stepNumber;
  
  // Apply different transition styles based on the step's state
  let transform = 'translateX(0)';
  let opacity = 1;
  let scale = 1;
  
  // Only apply these effects to non-active steps that haven't been seen yet
  if (!isActiveStep && !wasActive) {
    // Future steps slide in from right and are slightly faded
    if (stepDistance < 0) {
      transform = 'translateX(10px)';
      opacity = 0.7;
      scale = 0.98;
    }
    // Past steps slide in from left and are slightly faded
    else if (stepDistance > 0) {
      transform = 'translateX(-10px)';
      opacity = 0.9;
      scale = 0.99;
    }
  }
  
  // Style based on active state with enhanced transitions
  const sectionStyle = {
    marginBottom: '2rem',
    padding: '1.5rem',
    borderRadius: '8px',
    backgroundColor: isActiveStep ? '#e3f2fd' : '#f9f9f9',
    borderLeft: isActiveStep ? '4px solid #2196f3' : '4px solid transparent',
    boxShadow: isActiveStep ? '0 2px 10px rgba(33, 150, 243, 0.1)' : 'none',
    transform: `${transform} scale(${scale})`,
    opacity: opacity,
    transition: `
      background-color ${Duration.normal}ms ${Easing.easeOut},
      border-left ${Duration.normal}ms ${Easing.easeOut},
      box-shadow ${Duration.normal}ms ${Easing.easeOut},
      transform ${Duration.normal}ms ${Easing.smooth},
      opacity ${Duration.normal}ms ${Easing.smooth}
    `,
    position: 'relative',
    willChange: 'transform, opacity, background-color, box-shadow'
  };
  
  // Instead of animating the entire section, we'll let individual elements 
  // control their own animations for a more targeted experience
  return (
    <div 
      ref={sectionRef} 
      style={sectionStyle}
      className="step-section"
      data-active={isActiveStep ? "true" : "false"}
    >
      <style>
        {`
          @keyframes stepHighlight {
            0% {
              background-color: #e3f2fd;
            }
            15% {
              background-color: #bbdefb;
            }
            100% {
              background-color: #e3f2fd;
            }
          }
          
          .highlight-flash {
            animation: buttonHighlight 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          }
          
          @keyframes buttonHighlight {
            0% {
              box-shadow: 0 0 0 rgba(33, 150, 243, 0);
            }
            40% {
              box-shadow: 0 0 8px rgba(33, 150, 243, 0.5);
            }
            100% {
              box-shadow: 0 0 0 rgba(33, 150, 243, 0);
            }
          }
        `}
      </style>
      {children}
    </div>
  );
};

/**
 * StepHeader - A component for displaying step titles with visual indicators
 * 
 * @param {Object} props
 * @param {number} props.stepNumber - The step number to display (1-indexed for user-facing display)
 * @param {string} props.title - The title of the step
 * @returns {JSX.Element}
 */
export const StepHeader = ({ stepNumber, title }) => {
  const headerRef = useRef(null);
  const { currentStep } = useProcessSteps();
  const isActive = currentStep === stepNumber - 1;

  // Apply animation when step becomes active
  useEffect(() => {
    if (isActive && headerRef.current) {
      // Remove any existing animation
      headerRef.current.style.animation = 'none';
      // Force reflow to restart animation
      void headerRef.current.offsetWidth;
      // Apply animations
      headerRef.current.style.animation = 'headerFadeIn 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) forwards';
      
      // Animate the number badge with a slight delay
      const badge = headerRef.current.querySelector('.step-number');
      if (badge) {
        badge.style.animation = 'badgePulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards';
      }
    }
  }, [isActive]);

  return (
    <div 
      ref={headerRef} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        opacity: isActive ? 1 : 0.9,
        transform: isActive ? 'translateY(0)' : 'translateY(5px)',
        transition: `
          opacity ${Duration.normal}ms ${Easing.easeOut},
          transform ${Duration.normal}ms ${Easing.smooth}
        `
      }}
    >
      <div 
        className="step-number"
        style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          backgroundColor: '#2196f3',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: isActive ? '0 2px 8px rgba(33, 150, 243, 0.3)' : 'none',
          transition: `
            background-color ${Duration.normal}ms ${Easing.easeOut},
            box-shadow ${Duration.normal}ms ${Easing.easeOut}
          `
        }}
      >
        {stepNumber}
      </div>
      <h3 style={{ 
        margin: 0,
        color: isActive ? '#1565c0' : '#424242',
        fontSize: '1.25rem',
        transition: `color ${Duration.normal}ms ${Easing.easeOut}`
      }}>
        {title}
      </h3>
      <style>
        {`
          @keyframes headerFadeIn {
            0% {
              opacity: 0.9;
              transform: translateY(5px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes badgePulse {
            0% {
              transform: scale(1);
              box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
            }
            50% {
              transform: scale(1.2);
              box-shadow: 0 2px 12px rgba(33, 150, 243, 0.5);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
            }
          }
        `}
      </style>
    </div>
  );
};

export default StepSection;