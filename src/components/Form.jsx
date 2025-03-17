// src/components/Form.jsx
import React, { useState, useEffect } from 'react'
import { useStepTrigger } from '../context/ProcessStepContext'

/**
 * Enhanced Form component that integrates with the step system
 * Can trigger a step when form is valid or submitted
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Submit handler function
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.autoComplete - HTML form autoComplete attribute
 * @param {number} props.stepTrigger - Optional step number this form acts as a trigger for
 * @param {boolean} props.isRequired - Whether this form is required for step activation
 * @param {Function} props.validationFn - Function to validate if form can trigger step
 * @param {Object} props.formState - Form state object if managed externally
 * @param {boolean} props.validateOnChange - Whether to validate as user types
 */
export default function Form({ 
  onSubmit, 
  children, 
  autoComplete = "on",
  stepTrigger = null,
  isRequired = true,
  validationFn = null,
  formState = null,
  validateOnChange = false,
  ...props 
}) {
  // If step trigger is provided, use the trigger hook
  const trigger = stepTrigger !== null
    ? useStepTrigger(stepTrigger, { 
        isRequired,
        validationFn
      })
    : null;
  
  // Handle submission with trigger integration
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Activate the trigger on successful submit
    if (trigger && (!validationFn || validationFn())) {
      trigger.activate();
    }
    
    // Call the original onSubmit
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  // If we have form state and validateOnChange, watch for changes
  useEffect(() => {
    if (trigger && formState && validateOnChange && validationFn) {
      if (validationFn(formState)) {
        trigger.activate();
      } else {
        trigger.deactivate();
      }
    }
  }, [formState, trigger, validateOnChange, validationFn]);
  
  return (
    <form onSubmit={handleSubmit} autoComplete={autoComplete} {...props}>
      {children}
    </form>
  )
}