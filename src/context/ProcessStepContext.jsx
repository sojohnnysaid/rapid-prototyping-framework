// src/context/ProcessStepContext.jsx
import React, { createContext, useState, useCallback } from 'react';

// Create a context for managing process steps without forced scrolling
export const ProcessStepContext = createContext({
  currentStep: 0,
  setCurrentStep: () => {},
  saveScrollPosition: () => {}
});

// Provider component for process step management
export function ProcessStepProvider({ children }) {
  // State for current step
  const [currentStep, setCurrentStepState] = useState(0);
  
  // We're intentionally not preserving scroll position or auto-scrolling
  // as this causes a distracting jump animation
  const setCurrentStep = useCallback((step) => {
    // Just update the step without modifying scroll
    setCurrentStepState(step);
  }, []);
  
  // Empty scroll position saver - just for API compatibility
  const saveScrollPosition = useCallback(() => {
    // Intentionally empty - we don't want to preserve/restore scroll
  }, []);
  
  // Provide the context
  return (
    <ProcessStepContext.Provider value={{ 
      currentStep, 
      setCurrentStep,
      saveScrollPosition
    }}>
      {children}
    </ProcessStepContext.Provider>
  );
}