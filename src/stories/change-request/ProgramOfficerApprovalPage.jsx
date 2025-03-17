import React, { useState, useContext, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { ProcessStepContext } from '../../context/ProcessStepContext';
import StepSection, { StepHeader } from '../../components/StepSection';
import Form from '../../components/Form';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { ChangeApprovalStory } from './change-request.story';

export default function ProgramOfficerApprovalPage() {
  // Get user context for authentication
  const { user } = useContext(UserContext);
  const { currentStep, setCurrentStep, markStepActionable } = useContext(ProcessStepContext);
  
  // State for UI and data
  const [changeRequests, setChangeRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalDecision, setApprovalDecision] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Check if user has permission to access this page
  const hasPermission = user.role === 'admin' || user.role === 'programOfficer';
  
  if (!hasPermission) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        color: '#c62828',
        margin: '2rem'
      }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to approve change requests.</p>
        <p>Only Program Officers and Administrators can access this page.</p>
        <Link 
          to="/dashboard"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2196f3',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  // Step 1: Fetch pending change requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/change-requests?status=pending');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending requests (${response.status})`);
      }
      
      const data = await response.json();
      setChangeRequests(data);
      
      // Mark next step as actionable and move to it
      markStepActionable(1);
      setCurrentStep(1);
    } catch (err) {
      console.error('Error fetching change requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Select a change request to review
  const selectChangeRequest = (request) => {
    setSelectedRequest(request);
    // Mark next step as actionable and move to it
    markStepActionable(2);
    setCurrentStep(2);
  };
  
  // Step 3: Open approval/rejection modal with feedback (combined step)
  const openApprovalModal = () => {
    if (!selectedRequest) {
      setError('Please select a change request first');
      return;
    }
    
    setShowApprovalModal(true);
    // Mark this combined step as actionable
    markStepActionable(2);
    setCurrentStep(2);
  };
  
  // Process approval or rejection with feedback (combined step)
  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRequest) {
      setError('No change request selected');
      return;
    }
    
    if (!approvalDecision) {
      setError('Please select a decision (approve or reject)');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update the change request
      const response = await fetch(`/api/change-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: approvalDecision,
          reviewNotes: approvalNotes,
          reviewedById: user.id || 4, // Fallback to sample user ID
          reviewedByName: user.name,
          dateReviewed: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process change request (${response.status})`);
      }
      
      const result = await response.json();
      
      // If it was an approval for eligibility change, update the applicant too
      if (approvalDecision === 'approved' && selectedRequest.requestType === 'eligibility') {
        // Ensure we're using the correct applicant ID (numeric value)
        const applicantId = parseInt(selectedRequest.targetId, 10);
        
        // Fetch the applicant
        const applicantResponse = await fetch(`/api/applicants/${applicantId}`);
        
        if (!applicantResponse.ok) {
          console.warn(`Could not fetch applicant ${applicantId}`);
        } else {
          const applicant = await applicantResponse.json();
          
          // Update the applicant's eligibility status
          const updateResponse = await fetch(`/api/applicants/${applicantId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              eligibilityStatus: selectedRequest.requestedValue
            })
          });
          
          if (!updateResponse.ok) {
            console.warn(`Could not update applicant status`);
          }
        }
      }
      
      // Close the modal
      setShowApprovalModal(false);
      
      // Show success message
      setSuccessMessage(
        `Change request ${approvalDecision === 'approved' ? 'approved' : 'rejected'} successfully!`
      );
      
      // Reset form
      setApprovalNotes('');
      setApprovalDecision('');
      
      // Update to mark completion when decision is made - no need to go to next step since we removed it
      // Instead, this marks the journey as completed
      markStepActionable(3); // Mark completion step as actionable
      setCurrentStep(3);     // Move to completion step
      
      // Refresh the list of pending requests
      fetchPendingRequests();
    } catch (err) {
      console.error('Error processing approval:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Fetch applicant name by ID
  const [applicantNameCache, setApplicantNameCache] = useState({});
  
  const getApplicantName = async (id) => {
    // If already in cache, return from cache
    if (applicantNameCache[id]) {
      return applicantNameCache[id];
    }
    
    try {
      const response = await fetch(`/api/applicants/${id}`);
      if (response.ok) {
        const applicant = await response.json();
        // Update cache
        setApplicantNameCache({
          ...applicantNameCache,
          [id]: applicant.name
        });
        return applicant.name;
      }
    } catch (err) {
      console.warn(`Error fetching applicant name for ID ${id}:`, err);
    }
    
    return `Applicant #${id}`;
  };
  
  // Define table columns
  const changeRequestColumns = [
    { key: 'id', label: 'Request ID' },
    { 
      key: 'targetId', 
      label: 'Applicant ID',
      render: (id) => `${id}`
    },
    { key: 'title', label: 'Title' },
    { key: 'requestType', label: 'Type' },
    { key: 'requestedByName', label: 'Requested By' },
    { 
      key: 'dateRequested', 
      label: 'Date Requested',
      render: (date) => formatDate(date)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, request) => (
        <button
          onClick={() => selectChangeRequest(request)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: selectedRequest?.id === request.id ? '#4caf50' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {selectedRequest?.id === request.id ? 'Selected ✓' : 'Review'}
        </button>
      )
    }
  ];
  
  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Change Request Approval</h2>
      
      {/* Error display */}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div style={{ 
          color: 'green', 
          marginTop: '1rem', 
          marginBottom: '1rem', 
          padding: '10px', 
          backgroundColor: '#e8f5e9', 
          borderRadius: '4px' 
        }}>
          <strong>Success:</strong> {successMessage}
        </div>
      )}
      
      {/* Step 1: Load pending change requests */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title={ChangeApprovalStory.steps[0]} />
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={fetchPendingRequests}
            disabled={loading}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Loading...' : 'Load Pending Requests'}
          </button>
        </div>
      </StepSection>
      
      {/* Step 2: Display change requests */}
      {changeRequests.length > 0 && (
        <StepSection stepNumber={1}>
          <StepHeader stepNumber={2} title="Review pending change requests" />
          <div style={{ marginTop: '1rem' }}>
            <Table 
              data={changeRequests}
              columns={changeRequestColumns}
              selectedRow={selectedRequest}
              onRowClick={selectChangeRequest}
            />
          </div>
        </StepSection>
      )}
      
      {/* Step 2: Review selected change request and make decision with feedback (combined) */}
      {selectedRequest && (
        <StepSection stepNumber={2}>
          <StepHeader stepNumber={3} title={ChangeApprovalStory.steps[2]} />
          <div style={{ 
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f5f5f5'
          }}>
            <h3 style={{ marginTop: 0 }}>Change Request Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p><strong>ID:</strong> {selectedRequest.id}</p>
                <p><strong>Title:</strong> {selectedRequest.title}</p>
                <p><strong>Type:</strong> {selectedRequest.requestType}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <p><strong>Requested By:</strong> {selectedRequest.requestedByName} ({selectedRequest.requestedByRole})</p>
              </div>
              <div>
                <p><strong>Target Type:</strong> {selectedRequest.targetType}</p>
                <p><strong>Applicant ID:</strong> {selectedRequest.targetId}</p>
                <p><strong>Current Value:</strong> {selectedRequest.currentValue}</p>
                <p><strong>Requested Value:</strong> {selectedRequest.requestedValue}</p>
                <p><strong>Date Requested:</strong> {formatDate(selectedRequest.dateRequested)}</p>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <h4>Justification:</h4>
              <div style={{ 
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '4px'
              }}>
                {selectedRequest.description || 'No justification provided.'}
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={openApprovalModal}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Make Decision with Feedback
              </button>
            </div>
          </div>
        </StepSection>
      )}
      
      {/* We removed the confirmation step completely */}
      
      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <Modal onClose={() => setShowApprovalModal(false)}>
          <div style={{ padding: '1.5rem' }}>
            <h3>Make Decision with Feedback</h3>
            <p>Change request: <strong>{selectedRequest.title}</strong></p>
            
            <Form onSubmit={handleApprovalSubmit} autoComplete="off">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Decision:
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: approvalDecision === 'approved' ? '#e8f5e9' : 'white',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={approvalDecision === 'approved'}
                      onChange={(e) => setApprovalDecision(e.target.value)}
                    />
                    Approve
                  </label>
                  
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: approvalDecision === 'rejected' ? '#ffebee' : 'white',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={approvalDecision === 'rejected'}
                      onChange={(e) => setApprovalDecision(e.target.value)}
                    />
                    Reject
                  </label>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Notes/Feedback:
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                  placeholder="Provide your reasoning for this decision..."
                  autoComplete="off"
                />
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !approvalDecision}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: approvalDecision === 'approved' ? '#4caf50' : 
                                    approvalDecision === 'rejected' ? '#f44336' : '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading || !approvalDecision ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Processing...' : 'Submit Decision'}
                </button>
              </div>
            </Form>
          </div>
        </Modal>
      )}
    </div>
  );
}