import React, { useState, useContext, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { ProcessStepContext } from '../../context/ProcessStepContext';
import StepSection, { StepHeader } from '../../components/StepSection';
import Form from '../../components/Form';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { ChangeRequestStory } from './change-request.story';

export default function ApplicantChangeRequestPage() {
  // Get user context for authentication
  const { user } = useContext(UserContext);
  const { currentStep, setCurrentStep, markStepActionable } = useContext(ProcessStepContext);
  
  // State for form and UI
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestType: 'eligibility',
    currentValue: '',
    requestedValue: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Check if user has permission to access this page
  const hasPermission = user.role === 'admin' || user.role === 'applicantReviewer';
  
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
        <p>You do not have permission to initiate change requests.</p>
        <p>Only Applicant Reviewers and Administrators can access this page.</p>
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
  
  // Step 1: Load applicants
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch applicants from API
      const response = await fetch('/api/applicants');
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setApplicants(data);
      
      // Mark next step as actionable and move to it
      markStepActionable(1);
      setCurrentStep(1);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Select an applicant
  const handleSelectApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    
    // Pre-fill the current value based on the selected applicant
    setFormData({
      ...formData,
      currentValue: applicant.eligibilityStatus
    });
    
    // Mark next step as actionable and move to it
    markStepActionable(2);
    setCurrentStep(2);
  };
  
  // Step 3: Show the change request form
  const openChangeRequestForm = () => {
    setShowModal(true);
    // Since the form is now step 2 after removing Wait step
    markStepActionable(2);
    setCurrentStep(2);
  };
  
  // Step 4: Submit change request
  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    
    if (!selectedApplicant) {
      setError('Please select an applicant first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare the change request data
      // Ensure we're using the correct applicant ID (numeric value)
      const applicantId = parseInt(selectedApplicant.id, 10);
      
      const changeRequestData = {
        title: formData.title,
        description: formData.description,
        status: 'pending',
        requestType: formData.requestType,
        requestedById: user.id || 3, // Fallback to the sample user ID
        requestedByName: user.name,
        requestedByRole: user.role,
        targetId: applicantId,
        targetType: 'applicant',
        currentValue: formData.currentValue,
        requestedValue: formData.requestedValue,
        dateRequested: new Date().toISOString()
      };
      
      // Submit the change request
      const response = await fetch('/api/change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changeRequestData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit change request (${response.status})`);
      }
      
      const result = await response.json();
      
      // Close the modal
      setShowModal(false);
      
      // Display success message
      setSuccessMessage(`Change request "${formData.title}" has been submitted and is awaiting approval`);
      
      // Reset form data
      setFormData({
        title: '',
        description: '',
        requestType: 'eligibility',
        currentValue: '',
        requestedValue: ''
      });
      
      // Make the completion step actionable once we've submitted the request
      // Since we removed 'Wait for program officer review', we now go to step 3 then completion
      markStepActionable(3); // View approval status
      markStepActionable(4); // Complete journey step
      
      // Advance to step 3 (skipping the removed "Wait for" step)
      setCurrentStep(3);
      
      // Fetch my current change requests
      fetchMyChangeRequests();
    } catch (err) {
      console.error('Error submitting change request:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch change requests made by the current user
  const fetchMyChangeRequests = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/change-requests?requestedByRole=${user.role}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch change requests (${response.status})`);
      }
      
      const data = await response.json();
      setChangeRequests(data);
    } catch (err) {
      console.error('Error fetching change requests:', err);
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
  
  // Get applicant by ID for consistent reference
  const getApplicantById = (id) => {
    return applicants.find(app => parseInt(app.id, 10) === parseInt(id, 10)) || null;
  };
  
  // Define columns for tables
  const applicantColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'eligibilityStatus', label: 'Current Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, applicant) => (
        <button
          onClick={() => handleSelectApplicant(applicant)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: selectedApplicant?.id === applicant.id ? '#4caf50' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {selectedApplicant?.id === applicant.id ? 'Selected ✓' : 'Select'}
        </button>
      )
    }
  ];
  
  const changeRequestColumns = [
    { key: 'id', label: 'Request ID' },
    { 
      key: 'targetId', 
      label: 'Applicant ID',
      render: (id) => `${id}`
    },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { 
      key: 'targetId', 
      label: 'Applicant Name',
      render: (id) => {
        const applicant = getApplicantById(id);
        return applicant ? applicant.name : 'Unknown';
      }
    },
    { 
      key: 'dateRequested', 
      label: 'Date Submitted',
      render: (date) => formatDate(date)
    },
    { 
      key: 'dateReviewed', 
      label: 'Date Reviewed',
      render: (date) => formatDate(date)
    }
  ];
  
  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Change Request Submission</h2>
      
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
      
      {/* Step 1: Load applicants */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title={ChangeRequestStory.steps[0]} />
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={fetchApplicants}
            disabled={loading || applicants.length > 0}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: applicants.length > 0 ? '#f0f0f0' : '#2196f3',
              color: applicants.length > 0 ? '#666' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: applicants.length > 0 ? 'default' : 'pointer',
              boxShadow: applicants.length > 0 ? 'none' : '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Loading...' : applicants.length > 0 ? 'Applicants Loaded ✓' : 'Load Applicants'}
          </button>
          
          {applicants.length > 0 && (
            <div style={{ color: '#388e3c', marginTop: '0.5rem' }}>
              <strong>{applicants.length}</strong> applicants loaded successfully.
            </div>
          )}
        </div>
      </StepSection>
      
      {/* Step 2: Select an applicant */}
      {applicants.length > 0 && (
        <StepSection stepNumber={1}>
          <StepHeader stepNumber={2} title="Select an applicant" />
          <div style={{ marginTop: '1rem' }}>
            <Table 
              data={applicants}
              columns={applicantColumns}
              selectedRow={selectedApplicant}
              onRowClick={handleSelectApplicant}
            />
          </div>
        </StepSection>
      )}
      
      {/* Step 2: Fill out change request details */}
      {selectedApplicant && (
        <StepSection stepNumber={2}>
          <StepHeader stepNumber={3} title={ChangeRequestStory.steps[0]} />
          <div style={{ marginTop: '1rem' }}>
            <h3>Selected Applicant: {selectedApplicant.name}</h3>
            <p>Applicant ID: <strong>{selectedApplicant.id}</strong></p>
            <p>Current Status: <strong>{selectedApplicant.eligibilityStatus}</strong></p>
            
            <button
              onClick={openChangeRequestForm}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Request Status Change
            </button>
          </div>
        </StepSection>
      )}
      
      {/* Step 3: View your change requests */}
      {currentStep >= 2 && (
        <StepSection stepNumber={3}>
          <StepHeader stepNumber={4} title={ChangeRequestStory.steps[2]} />
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={fetchMyChangeRequests}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              View My Change Requests
            </button>
            
            {changeRequests.length > 0 ? (
              <Table
                data={changeRequests}
                columns={changeRequestColumns}
              />
            ) : (
              <p>No change requests found.</p>
            )}
          </div>
        </StepSection>
      )}
      
      {/* Change Request Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{ padding: '1.5rem' }}>
            <h3>Submit Change Request</h3>
            <p>For applicant: <strong>{selectedApplicant.name}</strong> (ID: <strong>{selectedApplicant.id}</strong>)</p>
            
            <Form onSubmit={handleSubmitChangeRequest} autoComplete="off">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Request Title:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }}
                  required
                  autoComplete="off"
                  placeholder="e.g., Change Eligibility Status"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Request Type:
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }}
                  required
                  autoComplete="off"
                >
                  <option value="eligibility">Eligibility Status Change</option>
                  <option value="reviewer">Reviewer Assignment Change</option>
                  <option value="other">Other Change</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Current Value:
                </label>
                <input
                  type="text"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }}
                  required
                  autoComplete="off"
                  placeholder="e.g., Pending"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Requested Value:
                </label>
                <select
                  value={formData.requestedValue}
                  onChange={(e) => setFormData({...formData, requestedValue: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }}
                  required
                  autoComplete="off"
                >
                  <option value="">Select a value</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Ineligible">Ineligible</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Justification:
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                  required
                  autoComplete="off"
                  placeholder="Explain why this change is needed..."
                />
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'wait' : 'pointer'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Change Request'}
                </button>
              </div>
            </Form>
          </div>
        </Modal>
      )}
    </div>
  );
}