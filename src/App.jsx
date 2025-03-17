import React, { useState, useContext, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Table from './components/Table'
import Modal from './components/Modal'
import Form from './components/Form'
import FloatingStoryGuide from './components/FloatingStoryGuide'
import StepSection, { StepHeader } from './components/StepSection'
import { UserProvider, UserContext } from './context/UserContext'
import { ProcessStepContext, ProcessStepProvider } from './context/ProcessStepContext'

// Home page component - now redirects to login if not authenticated, or dashboard if authenticated
function Home() {
  const { user } = useContext(UserContext);
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  // Otherwise, redirect to login
  return <Navigate to="/" />;
}

// Eligibility page component with data fetching and editing
function Eligibility() {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Access the process step context
  const { currentStep, setCurrentStep, saveScrollPosition } = useContext(ProcessStepContext)
  
  // Get user context for authentication
  const { user } = useContext(UserContext)
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />
  }
  
  // Check if user has permission to access this page
  const hasPermission = user.role === 'admin' || 
                       user.role === 'transcriptReviewer' || 
                       user.role === 'programOfficer'
  
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
        <p>You do not have permission to access Eligibility Screening.</p>
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
    )
  }

  // Don't load applicants automatically on mount

  const fetchApplicants = async () => {
    try {
      // Save scroll position before any state changes
      if (saveScrollPosition) saveScrollPosition();
      
      setLoading(true)
      setError(null)
      
      console.log('Fetching applicants...')
      const response = await fetch('/api/applicants')
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Data received:', data)
      setApplicants(data)
      setDataLoaded(true)
      
      // After successfully loading data, move to the next step
      setCurrentStep(1) // Move to "Review transcripts" step
    } catch (err) {
      console.error('Error fetching applicants:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (applicant) => {
    // Save scroll position before any state changes
    if (saveScrollPosition) saveScrollPosition();
    
    setSelectedApplicant(applicant)
    setNewStatus(applicant.eligibilityStatus)
    setShowModal(true)
    
    // Move to the "Mark eligibility status" step
    setCurrentStep(2)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedApplicant(null)
  }

  const handleUpdateStatus = (evt) => {
    evt.preventDefault()
    if (!selectedApplicant) return
    
    // Save scroll position before any state changes
    if (saveScrollPosition) saveScrollPosition();

    setLoading(true)
    fetch(`/api/applicants/${selectedApplicant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eligibilityStatus: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setApplicants(applicants.map(app => (app.id === updated.id ? updated : app)))
        closeModal()
        
        // Since we removed the "Log decision and rationale" step, move to completion
        // which will be step 3 (0-indexed) now that there are only 3 steps plus the completion step
        setCurrentStep(3)
      })
      .catch(err => {
        console.error('Error updating status:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }

  // Column definition for the table
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'eligibilityStatus', label: 'Status' }
  ]

  return (
    <div>
      <h2>Eligibility Screening</h2>
      
      {/* Step 1: Load applicant data */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title="Load applicant data" />
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={fetchApplicants} 
            disabled={loading || dataLoaded || currentStep === 3}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: dataLoaded || currentStep === 3 ? '#f0f0f0' : '#2196f3',
              color: dataLoaded || currentStep === 3 ? '#666' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: dataLoaded || currentStep === 3 ? 'default' : 'pointer',
              boxShadow: dataLoaded || currentStep === 3 ? 'none' : '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Loading...' : currentStep === 3 ? 'Journey Complete' : dataLoaded ? 'Data Loaded ✓' : 'Load Applicant Data'}
          </button>
          
          {dataLoaded && (
            <div style={{ color: '#388e3c', marginTop: '0.5rem' }}>
              <strong>{applicants.length}</strong> applicants loaded successfully.
            </div>
          )}
        </div>
      </StepSection>
      
      {error && (
        <div style={{ color: 'red', marginTop: '1rem', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {loading && <p>Loading applicants...</p>}
      
      {/* Step 2: Review transcripts */}
      {dataLoaded && (
        <StepSection stepNumber={1}>
          <StepHeader stepNumber={2} title="Review transcripts" />
          <div style={{ marginTop: '1rem' }}>
            <h3>Applicants:</h3>
            <Table 
              data={applicants} 
              columns={columns} 
            />
            {applicants.length > 0 && (
              <button 
                onClick={() => {
                  if (applicants.length > 0) openModal(applicants[0])
                }}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Review First Applicant
              </button>
            )}
          </div>
        </StepSection>
      )}
      
      {/* We've removed the duplicate completion section here */}
      {/* The StoryGuide component already handles displaying the completion state */}
      
      {/* For when data isn't loaded yet */}
      {!dataLoaded && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Applicants:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                  Click "Load Applicant Data" to view applicants
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedApplicant && (
        <Modal onClose={closeModal}>
          <div style={{ padding: '1rem' }}>
            <StepSection stepNumber={2}>
              <StepHeader stepNumber={3} title="Mark eligibility status" />
              <div style={{ marginTop: '1rem' }}>
                <Form onSubmit={handleUpdateStatus}>
                  <p><strong>Applicant:</strong> {selectedApplicant.name}</p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Eligibility Status:
                    </label>
                    <select 
                      value={newStatus} 
                      onChange={e => setNewStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem' }}
                      autoComplete="off"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Eligible">Eligible</option>
                      <option value="Ineligible">Ineligible</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={closeModal}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #757575',
                        borderRadius: '4px',
                        backgroundColor: '#e0e0e0',
                        color: '#424242',
                        fontWeight: 'bold',
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
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </Form>
              </div>
            </StepSection>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Import the story definitions directly
import { EligibilityStory } from './stories/eligibility/eligibility.story'
import { MultiActorApprovalWorkflowStory } from './stories/multi-actor-approval-workflow/multi-actor-approval-workflow.story'
import { UserManagementStory } from './stories/user-management/user-management.story'
import { ChangeRequestStory, ChangeApprovalStory } from './stories/change-request/change-request.story'

// AppLayout with navigation and story panel
function AppLayout() {
  // Use the location hook from React Router
  const location = useLocation()
  
  // Access the context to reset steps manually when routes change
  const { resetSteps } = useContext(ProcessStepContext)
  
  // Reset steps when location changes (route navigation)
  useEffect(() => {
    // Only reset on actual route changes (not on initial render)
    if (location.pathname) {
      resetSteps();
    }
  }, [location.pathname, resetSteps])
  
  // Import the story content lazily
  const [reviewerAssignmentStory, setReviewerAssignmentStory] = useState(null)
  
  // Load the reviewer assignment story when needed
  useEffect(() => {
    if (location.pathname === '/reviewer-assignment') {
      // Dynamic import using ES modules (Vite-compatible)
      import('./stories/reviewer-assignment/reviewer-assignment.story')
        .then(module => {
          setReviewerAssignmentStory(module.ReviewerAssignmentStory)
        })
        .catch(error => {
          console.error('Error loading reviewer assignment story:', error)
        })
    }
  }, [location.pathname])
  
  // Determine which story to show based on the current path
  const getStoryContent = () => {
    if (location.pathname === '/eligibility') {
      return <FloatingStoryGuide story={EligibilityStory} />
    } else if (location.pathname === '/reviewer-assignment' && reviewerAssignmentStory) {
      return <FloatingStoryGuide story={reviewerAssignmentStory} />
    } else if (location.pathname === '/multi-actor-workflow') {
      return <FloatingStoryGuide story={MultiActorApprovalWorkflowStory} />
    } else if (location.pathname === '/users') {
      return <FloatingStoryGuide story={UserManagementStory} />
    } else if (location.pathname === '/change-request') {
      return <FloatingStoryGuide story={ChangeRequestStory} />
    } else if (location.pathname === '/change-approval') {
      return <FloatingStoryGuide story={ChangeApprovalStory} />
    }
    return <p>Select a process to see business rules</p>
  }
  
  // Import our dynamic Sidebar component
  const Sidebar = React.lazy(() => import('./components/Sidebar'))
  
  // Sidebar content with the dynamic component
  const sidebarContent = (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <Sidebar />
    </Suspense>
  )
  
  // Lazy load components
  const ReviewerAssignmentPage = React.lazy(() => 
    import('./stories/reviewer-assignment/ReviewerAssignmentPage')
  );
  
  const LoginPage = React.lazy(() => 
    import('./stories/auth/LoginPage')
  );
  
  const Dashboard = React.lazy(() => 
    import('./stories/auth/Dashboard')
  );
  
  const MultiActorApprovalWorkflowPage = React.lazy(() => 
    import('./stories/multi-actor-approval-workflow/MultiActorApprovalWorkflowPage')
  );
  
  const UserManagementPage = React.lazy(() => 
    import('./stories/user-management/UserManagementPage')
  );
  
  // New change request workflow components
  const ApplicantChangeRequestPage = React.lazy(() => 
    import('./stories/change-request/ApplicantChangeRequestPage')
  );
  
  const ProgramOfficerApprovalPage = React.lazy(() => 
    import('./stories/change-request/ProgramOfficerApprovalPage')
  );

  // Main content (routes)
  const mainContent = (
    <Suspense fallback={<div>Loading page...</div>}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/eligibility" element={<Eligibility />} />
        <Route path="/reviewer-assignment" element={<ReviewerAssignmentPage />} />
        <Route path="/multi-actor-workflow" element={<MultiActorApprovalWorkflowPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        {/* Change Request Workflow Routes */}
        <Route path="/change-request" element={<ApplicantChangeRequestPage />} />
        <Route path="/change-approval" element={<ProgramOfficerApprovalPage />} />
        {/* These routes would be implemented later */}
        <Route path="/settings" element={<div>System Settings (Coming Soon)</div>} />
        <Route path="/transcripts" element={<div>Transcript Review (Coming Soon)</div>} />
        <Route path="/reports" element={<div>Program Reports (Coming Soon)</div>} />
      </Routes>
    </Suspense>
  )
  
  return (
    <Layout 
      sidebar={sidebarContent}
      content={mainContent}
      story={getStoryContent()}
    />
  )
}

// Wrapper component that uses Router hooks
function AppWrapper() {
  return (
    <>
      <h1 style={{ textAlign: 'center', margin: '1rem 0' }}>NSF GRFP Rapid Prototyping Framework</h1>
      <ProcessStepProvider>
        <AppLayout />
      </ProcessStepProvider>
    </>
  )
}

// Main App component with BrowserRouter and UserProvider
export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppWrapper />
      </UserProvider>
    </BrowserRouter>
  )
}