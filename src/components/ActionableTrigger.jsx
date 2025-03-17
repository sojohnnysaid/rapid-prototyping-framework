// src/components/ActionableTrigger.jsx
import React, { useEffect } from 'react'
import { useStepTrigger } from '../context/ProcessStepContext'

/**
 * ActionableTrigger - A component that wraps clickable elements 
 * to make them act as step triggers
 * 
 * @param {Object} props - Component props
 * @param {number} props.stepNumber - The step this trigger activates
 * @param {boolean} props.isRequired - Whether this action is required for the step
 * @param {Function} props.validationFn - Optional validation function
 * @param {boolean} props.autoActivate - Whether to activate automatically on mount
 * @param {Function} props.onClick - Original click handler
 * @param {React.ReactNode} props.children - Child elements
 */
export default function ActionableTrigger({
  stepNumber,
  isRequired = true,
  validationFn = null,
  autoActivate = false,
  onClick,
  children,
  ...props
}) {
  // Register with the step trigger system
  const { activate, deactivate } = useStepTrigger(stepNumber, {
    isRequired,
    validationFn
  });

  // Auto-activate if specified
  useEffect(() => {
    if (autoActivate) {
      activate();
    }
    
    // Clean up on unmount
    return () => {
      if (autoActivate) {
        deactivate();
      }
    };
  }, [autoActivate, activate, deactivate]);

  // Handle click with trigger activation
  const handleClick = (e) => {
    // Activate this trigger
    activate();
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  // Clone the child element with the enhanced onClick handler
  return React.cloneElement(
    // If there's only one child, use it; otherwise, wrap in a div
    React.Children.count(children) === 1 ? children : <div>{children}</div>,
    {
      onClick: handleClick,
      ...props
    }
  );
}