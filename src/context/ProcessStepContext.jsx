// src/context/ProcessStepContext.jsx
import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

// Create a context for managing process steps with actionable triggers
export const ProcessStepContext = createContext({
  // Step navigation
  currentStep: 0,
  setCurrentStep: () => {},
  
  // Step state tracking
  completedSteps: [],
  actionableSteps: [],
  
  // Trigger management
  registerTrigger: () => {},
  unregisterTrigger: () => {},
  activateTrigger: () => {},
  deactivateTrigger: () => {},
  
  // Step utility methods
  markStepComplete: () => {},
  markStepActionable: () => {},
  isStepActionable: () => false,
  isStepTriggered: () => false,
  
  // Framework utilities
  resetSteps: () => {},
  saveScrollPosition: () => {}
});

/**
 * Hook to use the ProcessStepContext
 */
export function useProcessSteps() {
  return useContext(ProcessStepContext);
}

/**
 * Hook to register and manage a step trigger
 * @param {number} stepNumber - The step number this trigger is for
 * @param {Object} options - Configuration options
 * @param {boolean} options.isRequired - Whether this trigger must be activated for the step
 * @param {function} options.validationFn - Optional function to validate if trigger should be active
 */
export function useStepTrigger(stepNumber, options = { isRequired: true, validationFn: null }) {
  const { 
    registerTrigger, 
    unregisterTrigger, 
    activateTrigger, 
    deactivateTrigger 
  } = useProcessSteps();
  
  // Generate a unique ID for this trigger
  const [triggerId] = useState(() => `trigger-${stepNumber}-${Math.random().toString(36).substring(2, 9)}`);
  
  // Register this trigger when the component mounts
  useEffect(() => {
    registerTrigger(stepNumber, triggerId, options);
    
    // Clean up when the component unmounts
    return () => {
      unregisterTrigger(stepNumber, triggerId);
    };
  }, [stepNumber, triggerId, registerTrigger, unregisterTrigger, options]);
  
  // Return functions to activate/deactivate this trigger
  return {
    activate: () => activateTrigger(stepNumber, triggerId),
    deactivate: () => deactivateTrigger(stepNumber, triggerId),
    triggerId
  };
}

// Provider component for process step management
export function ProcessStepProvider({ children }) {
  // State for current step and tracking
  const [currentStep, setCurrentStepState] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([0]); // First step is always initially completed
  const [actionableSteps, setActionableSteps] = useState([0]); // First step is always initially actionable
  
  // Store for step triggers - structure:
  // { 
  //   stepNumber: { 
  //     [triggerId]: { active: boolean, required: boolean, validationFn: function } 
  //   } 
  // }
  const [stepTriggers, setStepTriggers] = useState({});
  
  // Reset all steps and triggers to initial state
  const resetSteps = useCallback(() => {
    // Use functional updates to avoid potential stale closures
    setCurrentStepState(() => 0);
    setCompletedSteps(() => [0]);
    setActionableSteps(() => [0]);
    setStepTriggers(() => ({}));
  }, []);
  
  // Register a trigger for a specific step
  const registerTrigger = useCallback((stepNumber, triggerId, options = {}) => {
    setStepTriggers(prev => {
      // Create entry for this step if it doesn't exist
      const stepTriggers = prev[stepNumber] || {};
      
      return {
        ...prev,
        [stepNumber]: {
          ...stepTriggers,
          [triggerId]: {
            active: false,
            required: options.isRequired !== false, // Default to true
            validationFn: options.validationFn || null
          }
        }
      };
    });
  }, []);
  
  // Remove a trigger registration
  const unregisterTrigger = useCallback((stepNumber, triggerId) => {
    setStepTriggers(prev => {
      // If step doesn't exist, nothing to do
      if (!prev[stepNumber]) return prev;
      
      // Clone the step triggers
      const stepTriggers = { ...prev[stepNumber] };
      
      // Remove this trigger
      delete stepTriggers[triggerId];
      
      // Update the entire state
      return {
        ...prev,
        [stepNumber]: stepTriggers
      };
    });
  }, []);
  
  // Activate a trigger (mark it as ready)
  const activateTrigger = useCallback((stepNumber, triggerId) => {
    setStepTriggers(prev => {
      // If step or trigger doesn't exist, nothing to do
      if (!prev[stepNumber] || !prev[stepNumber][triggerId]) return prev;
      
      // Update this trigger to active
      const updatedTriggers = {
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          [triggerId]: {
            ...prev[stepNumber][triggerId],
            active: true
          }
        }
      };
      
      return updatedTriggers;
    });
  }, []);
  
  // Deactivate a trigger
  const deactivateTrigger = useCallback((stepNumber, triggerId) => {
    setStepTriggers(prev => {
      // If step or trigger doesn't exist, nothing to do
      if (!prev[stepNumber] || !prev[stepNumber][triggerId]) return prev;
      
      // Update this trigger to inactive
      return {
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          [triggerId]: {
            ...prev[stepNumber][triggerId],
            active: false
          }
        }
      };
    });
  }, []);
  
  // Check if all required triggers for a step are active
  const areStepTriggersActive = useCallback((stepNumber) => {
    // If no triggers registered for this step, it's considered active by default
    if (!stepTriggers[stepNumber] || Object.keys(stepTriggers[stepNumber]).length === 0) {
      return true;
    }
    
    // Check if all required triggers are active
    return Object.values(stepTriggers[stepNumber]).every(trigger => {
      // Skip non-required triggers
      if (!trigger.required) return true;
      
      // If trigger has validation function, use that to determine active state
      if (trigger.validationFn) {
        return trigger.validationFn();
      }
      
      // Otherwise, use the stored active state
      return trigger.active;
    });
  }, [stepTriggers]);
  
  // Mark a step as complete and check if next step should be actionable
  const markStepComplete = useCallback((step) => {
    setCompletedSteps(prev => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });
    
    // Make the next step actionable if its triggers are active or if it has no triggers
    const nextStep = step + 1;
    if (areStepTriggersActive(nextStep)) {
      setActionableSteps(prev => {
        if (!prev.includes(nextStep)) {
          return [...prev, nextStep];
        }
        return prev;
      });
    }
  }, [areStepTriggersActive]);
  
  // Manually mark a step as actionable, but only if its triggers are active
  const markStepActionable = useCallback((step) => {
    // Only mark as actionable if all its required triggers are active
    if (areStepTriggersActive(step)) {
      setActionableSteps(prev => {
        if (!prev.includes(step)) {
          return [...prev, step];
        }
        return prev;
      });
      return true;
    }
    return false;
  }, [areStepTriggersActive]);
  
  // Check if a step is actionable
  const isStepActionable = useCallback((step) => {
    return actionableSteps.includes(step);
  }, [actionableSteps]);
  
  // Check if a step's triggers are all active
  const isStepTriggered = useCallback((step) => {
    return areStepTriggersActive(step);
  }, [areStepTriggersActive]);
  
  // Enhanced setCurrentStep that prevents moving backwards and enforces action flow
  const setCurrentStep = useCallback((step) => {
    // Don't allow decreasing the step (moving backwards)
    if (step < currentStep) {
      console.warn(`Cannot move backward from step ${currentStep} to ${step}`);
      return false;
    }
    
    // Only allow moving to actionable steps
    if (!actionableSteps.includes(step)) {
      console.warn(`Step ${step} is not actionable yet`);
      return false;
    }
    
    // Only allow moving if all required triggers for the step are active
    if (!areStepTriggersActive(step)) {
      console.warn(`Step ${step} has inactive required triggers`);
      return false;
    }
    
    // Update the step
    setCurrentStepState(step);
    
    // Automatically mark the current step as completed when moving to it
    markStepComplete(step);
    
    return true;
  }, [currentStep, actionableSteps, areStepTriggersActive, markStepComplete]);
  
  // Empty scroll position saver - just for API compatibility
  const saveScrollPosition = useCallback(() => {
    // Intentionally empty - we don't want to preserve/restore scroll
  }, []);
  
  // Update actionable steps when triggers change
  useEffect(() => {
    // Check all steps that are not yet actionable but have active triggers
    for (let step = 0; step <= currentStep + 1; step++) {
      if (!actionableSteps.includes(step) && areStepTriggersActive(step)) {
        markStepActionable(step);
      }
    }
  }, [stepTriggers, currentStep, actionableSteps, areStepTriggersActive, markStepActionable]);
  
  // Provide the context
  return (
    <ProcessStepContext.Provider value={{ 
      // Step navigation
      currentStep,
      setCurrentStep,
      
      // Step state tracking
      completedSteps,
      actionableSteps,
      
      // Trigger management
      registerTrigger,
      unregisterTrigger,
      activateTrigger,
      deactivateTrigger,
      
      // Step utility methods
      markStepComplete,
      markStepActionable,
      isStepActionable,
      isStepTriggered,
      
      // Framework utilities
      resetSteps,
      saveScrollPosition
    }}>
      {children}
    </ProcessStepContext.Provider>
  );
}