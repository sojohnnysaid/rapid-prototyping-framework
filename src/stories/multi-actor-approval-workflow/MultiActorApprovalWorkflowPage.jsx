import React, { useState, useContext, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { ProcessStepContext } from '../../context/ProcessStepContext';
import StepSection, { StepHeader } from '../../components/StepSection';
import { MultiActorApprovalWorkflowStory } from './multi-actor-approval-workflow.story';

export default function MultiActorApprovalWorkflowPage() {
  // Get user context for authentication
  const { user, setUser } = useContext(UserContext);
  const { currentStep, setCurrentStep, saveScrollPosition } = useContext(ProcessStepContext);
  
  // Workflow state
  const [logs, setLogs] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState({
    applicantLoggedIn: false,
    changeRequested: false,
    programOfficerLoggedIn: false,
    changeApproved: false,
    verificationCompleted: false
  });
  
  // We don't redirect non-authenticated users - this workflow can be accessed without login
  // This allows seeing the simulation from beginning to end without requiring a pre-existing login
  
  // We'll use the framework-level scroll preservation from ProcessStepContext
  
  // Add a helper function to apply highlight effect to the clicked button
  const applyButtonHighlight = (buttonElement) => {
    if (!buttonElement) return;
    
    // Remove any existing animation class
    buttonElement.classList.remove('highlight-flash');
    
    // Force a reflow to restart the animation
    void buttonElement.offsetWidth;
    
    // Add the animation class
    buttonElement.classList.add('highlight-flash');
  };

  // Function to simulate logging in as an applicant
  const loginAsApplicant = (event) => {
    // Apply highlight effect to the button that was clicked
    applyButtonHighlight(event.currentTarget);
    
    // We're using the framework-level scroll preservation
    saveScrollPosition();
    
    setUser({
      name: 'Alice Applicant',
      role: 'applicantReviewer' // Using this role since it's already defined
    });
    
    setSimulationStatus({
      ...simulationStatus,
      applicantLoggedIn: true
    });
    
    addLog('Alice Applicant logged in');
    
    // Use a short timeout to allow the button animation to finish
    // before changing steps and potentially causing a larger re-render
    setTimeout(() => {
      setCurrentStep(1); // Move to step 2
    }, 200);
  };
  
  // Function to simulate initiating a change request
  const initiateChangeRequest = (event) => {
    // Apply highlight effect to the button that was clicked
    applyButtonHighlight(event.currentTarget);
    
    // We're using the framework-level scroll preservation
    saveScrollPosition();
    
    // Log the action
    addLog('Alice Applicant submitted change request: Change eligibility status to Eligible');
    
    // Update simulation status
    setSimulationStatus({
      ...simulationStatus,
      changeRequested: true
    });
    
    // Use a short timeout to allow the button animation to finish
    setTimeout(() => {
      setCurrentStep(2); // Move to step 3
    }, 200);
  };
  
  // Function to simulate logging in as a program officer
  const loginAsProgramOfficer = (event) => {
    // Apply highlight effect to the button that was clicked
    applyButtonHighlight(event.currentTarget);
    
    // We're using the framework-level scroll preservation
    saveScrollPosition();
    
    setUser({
      name: 'Paul ProgramOfficer',
      role: 'programOfficer'
    });
    
    setSimulationStatus({
      ...simulationStatus,
      programOfficerLoggedIn: true
    });
    
    addLog('Paul ProgramOfficer logged in');
    
    // Use a short timeout to allow the button animation to finish
    setTimeout(() => {
      setCurrentStep(3); // Move to step 4
    }, 200);
  };
  
  // Function to simulate approving a change request
  const approveChangeRequest = (event) => {
    // Apply highlight effect to the button that was clicked
    applyButtonHighlight(event.currentTarget);
    
    // We're using the framework-level scroll preservation
    saveScrollPosition();
    
    // Log the action
    addLog('Paul ProgramOfficer approved change request from Alice Applicant');
    
    // Update simulation status
    setSimulationStatus({
      ...simulationStatus,
      changeApproved: true
    });
    
    // Use a short timeout to allow the button animation to finish
    setTimeout(() => {
      setCurrentStep(4); // Move to step 5
    }, 200);
  };
  
  // Function to simulate verifying changes
  const verifyChanges = (event) => {
    // Apply highlight effect to the button that was clicked
    applyButtonHighlight(event.currentTarget);
    
    // We're using the framework-level scroll preservation
    saveScrollPosition();
    
    // Log the action
    addLog('Verification completed: Changes are reflected across the system');
    
    // Update simulation status
    setSimulationStatus({
      ...simulationStatus,
      verificationCompleted: true
    });
    
    // Use a short timeout to allow the button animation to finish
    setTimeout(() => {
      setCurrentStep(5); // Complete workflow
    }, 200);
  };
  
  // Helper function to add log entries
  const addLog = (message) => {
    const timestamp = new Date().toISOString();
    setLogs(prevLogs => [
      { id: prevLogs.length + 1, message, timestamp },
      ...prevLogs
    ]);
  };
  
  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Multi-Actor Approval Workflow Simulation</h2>
      <div style={{
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        padding: '1rem',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #2196f3'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Demo Workflow: No Login Required
        </p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          This is a guided simulation of the multi-actor approval process. You can access this page 
          without logging in, and it will guide you through the entire workflow with role switching.
        </p>
      </div>
      <p>
        This page demonstrates a simulated workflow that spans multiple actors and roles.
        Follow the steps below to see how a change request flows through the system.
      </p>
      
      {/* Step 1: Login as an applicant */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title={MultiActorApprovalWorkflowStory.steps[0]} />
        <div style={{ marginTop: '1rem' }}>
          <p>
            The first step is to simulate logging in as an applicant who will initiate a change request.
          </p>
          <button 
            onClick={loginAsApplicant}
            disabled={simulationStatus.applicantLoggedIn}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: simulationStatus.applicantLoggedIn ? '#e0e0e0' : '#2196f3',
              color: simulationStatus.applicantLoggedIn ? '#757575' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: simulationStatus.applicantLoggedIn ? 'default' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {simulationStatus.applicantLoggedIn ? 'Logged in as Alice Applicant ✓' : 'Login as Alice Applicant'}
          </button>
          
          {simulationStatus.applicantLoggedIn && (
            <div style={{ 
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
              color: '#2e7d32'
            }}>
              Successfully logged in as Alice Applicant with role: Applicant
            </div>
          )}
        </div>
      </StepSection>
      
      {/* Step 2: Initiate a change request */}
      {simulationStatus.applicantLoggedIn && (
        <StepSection stepNumber={1}>
          <StepHeader stepNumber={2} title={MultiActorApprovalWorkflowStory.steps[1]} />
          <div style={{ marginTop: '1rem' }}>
            <p>
              Now that you're logged in as an applicant, you can initiate a change request.
              In a real application, this would be done through a form, but we'll simulate it here.
            </p>
            <div style={{ 
              padding: '1rem',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Change Request Form</h4>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Applicant ID:</strong> 1001
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Current Status:</strong> Pending
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>New Status:</strong> Eligible
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Rationale:</strong> Met all eligibility criteria
              </div>
            </div>
            <button 
              onClick={initiateChangeRequest}
              disabled={simulationStatus.changeRequested}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: simulationStatus.changeRequested ? '#e0e0e0' : '#2196f3',
                color: simulationStatus.changeRequested ? '#757575' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: simulationStatus.changeRequested ? 'default' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {simulationStatus.changeRequested ? 'Change Request Submitted ✓' : 'Submit Change Request'}
            </button>
            
            {simulationStatus.changeRequested && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                color: '#2e7d32'
              }}>
                Change request submitted successfully! This request will need approval from a Program Officer.
              </div>
            )}
          </div>
        </StepSection>
      )}
      
      {/* Step 3: Login as a program officer */}
      {simulationStatus.changeRequested && (
        <StepSection stepNumber={2}>
          <StepHeader stepNumber={3} title={MultiActorApprovalWorkflowStory.steps[2]} />
          <div style={{ marginTop: '1rem' }}>
            <p>
              Now we'll simulate logging out and logging back in as a Program Officer
              who will review and approve the change request.
            </p>
            <button 
              onClick={loginAsProgramOfficer}
              disabled={simulationStatus.programOfficerLoggedIn}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: simulationStatus.programOfficerLoggedIn ? '#e0e0e0' : '#2196f3',
                color: simulationStatus.programOfficerLoggedIn ? '#757575' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: simulationStatus.programOfficerLoggedIn ? 'default' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {simulationStatus.programOfficerLoggedIn ? 'Logged in as Paul ProgramOfficer ✓' : 'Login as Paul ProgramOfficer'}
            </button>
            
            {simulationStatus.programOfficerLoggedIn && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                color: '#2e7d32'
              }}>
                Successfully logged in as Paul ProgramOfficer with role: Program Officer
              </div>
            )}
          </div>
        </StepSection>
      )}
      
      {/* Step 4: Review and approve the change request */}
      {simulationStatus.programOfficerLoggedIn && (
        <StepSection stepNumber={3}>
          <StepHeader stepNumber={4} title={MultiActorApprovalWorkflowStory.steps[3]} />
          <div style={{ marginTop: '1rem' }}>
            <p>
              As a Program Officer, you now see the pending change request
              in your dashboard. Let's review and approve it.
            </p>
            <div style={{ 
              padding: '1rem',
              border: '1px solid #bbdefb',
              borderRadius: '4px',
              backgroundColor: '#e3f2fd',
              marginBottom: '1rem',
              borderLeft: '4px solid #2196f3'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>Pending Notification</h4>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>From:</strong> Alice Applicant
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Request:</strong> Change eligibility status to Eligible for Applicant #1001
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Rationale:</strong> Met all eligibility criteria
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Date:</strong> {new Date().toLocaleString()}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {}}
                  disabled={simulationStatus.changeApproved}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f5f5f5',
                    color: '#d32f2f',
                    border: '1px solid #e57373',
                    borderRadius: '4px',
                    cursor: simulationStatus.changeApproved ? 'default' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Reject
                </button>
                <button 
                  onClick={approveChangeRequest}
                  disabled={simulationStatus.changeApproved}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: simulationStatus.changeApproved ? '#a5d6a7' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: simulationStatus.changeApproved ? 'default' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {simulationStatus.changeApproved ? 'Approved ✓' : 'Approve'}
                </button>
              </div>
            </div>
            
            {simulationStatus.changeApproved && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                color: '#2e7d32'
              }}>
                Change request approved! The applicant status has been updated to Eligible.
              </div>
            )}
          </div>
        </StepSection>
      )}
      
      {/* Step 5: Verify changes across the system */}
      {simulationStatus.changeApproved && (
        <StepSection stepNumber={4}>
          <StepHeader stepNumber={5} title={MultiActorApprovalWorkflowStory.steps[4]} />
          <div style={{ marginTop: '1rem' }}>
            <p>
              Finally, let's verify that the changes are reflected across the system.
              In a real application, you would navigate to different pages to see the updates,
              but we'll simulate it here.
            </p>
            <div style={{ 
              padding: '1rem',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>System Verification</h4>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Eligibility Page:</strong> Status shows as "Eligible" for Applicant #1001
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Dashboard:</strong> Notification marked as "Approved"
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Audit Log:</strong> All actions have been recorded with timestamps
              </div>
            </div>
            <button 
              onClick={verifyChanges}
              disabled={simulationStatus.verificationCompleted}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: simulationStatus.verificationCompleted ? '#e0e0e0' : '#2196f3',
                color: simulationStatus.verificationCompleted ? '#757575' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: simulationStatus.verificationCompleted ? 'default' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {simulationStatus.verificationCompleted ? 'Verification Complete ✓' : 'Verify Changes'}
            </button>
            
            {simulationStatus.verificationCompleted && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                color: '#2e7d32'
              }}>
                All changes have been verified across the system! The workflow is now complete.
              </div>
            )}
          </div>
        </StepSection>
      )}
      
      {/* Workflow Log */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Workflow Log</h3>
        <div style={{ 
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {logs.length === 0 ? (
            <div style={{ padding: '1rem', color: '#757575', textAlign: 'center' }}>
              No log entries yet. Start the workflow to see logs here.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Event</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Links to actual pages */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Try the Real Pages</h3>
        <p>
          This is a simulation of the workflow. To experience the actual implementation,
          you can navigate to these pages:
        </p>
        <ul style={{ marginTop: '0.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link to="/" style={{ color: '#2196f3', fontWeight: 'bold' }}>Login Page</Link> - Start by logging in with different roles
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link to="/dashboard" style={{ color: '#2196f3', fontWeight: 'bold' }}>Dashboard</Link> - See notifications and pending approvals
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link to="/eligibility" style={{ color: '#2196f3', fontWeight: 'bold' }}>Eligibility Screening</Link> - Update applicant eligibility status
          </li>
        </ul>
      </div>
    </div>
  );
}