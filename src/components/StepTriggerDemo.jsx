// src/components/StepTriggerDemo.jsx
import React, { useState } from 'react'
import { useProcessSteps } from '../context/ProcessStepContext'
import Form from './Form'
import ActionableTrigger from './ActionableTrigger'

/**
 * Demonstrates how to use the step trigger system
 * Shows both form-based and button-based triggers
 */
export default function StepTriggerDemo() {
  const { currentStep } = useProcessSteps();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  // Validate for form step
  const validateForm = (data) => {
    return data && data.name && data.name.length > 0 && 
           data.email && data.email.includes('@');
  };
  
  // Submit form handler
  const handleSubmit = (e) => {
    console.log('Form submitted with:', formData);
  };
  
  // Form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Step Trigger Demo</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Step 1: Click a Button</h3>
        <p>This step is triggered by clicking a button.</p>
        
        {/* Wrap a button in ActionableTrigger to make it activate step 1 */}
        <ActionableTrigger stepNumber={1}>
          <button 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Click to trigger Step 1
          </button>
        </ActionableTrigger>
      </div>
      
      {/* Step 2 appears when step 1 is triggered and becomes the current step */}
      {currentStep >= 1 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Step 2: Complete a Form</h3>
          <p>This step is triggered when a valid form is filled out.</p>
          
          {/* Use Form with stepTrigger to link form completion to step 2 */}
          <Form 
            stepTrigger={2}
            onSubmit={handleSubmit} 
            formState={formData}
            validateOnChange={true}
            validationFn={() => validateForm(formData)}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#666' }}>
                Must contain @ symbol
              </div>
            </div>
            
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </Form>
        </div>
      )}
      
      {/* Step 3 appears when step 2 is triggered and becomes the current step */}
      {currentStep >= 2 && (
        <div>
          <h3>Step 3: Auto-Activated</h3>
          <p>This step is automatically activated when the component loads.</p>
          
          {/* This trigger auto-activates on mount */}
          <ActionableTrigger 
            stepNumber={3}
            autoActivate={true}
          >
            <div style={{
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
              color: '#2e7d32'
            }}>
              This step is automatically triggered!
            </div>
          </ActionableTrigger>
        </div>
      )}
    </div>
  );
}