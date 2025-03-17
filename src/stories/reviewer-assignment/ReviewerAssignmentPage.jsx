/**
 * Reviewer Assignment Page
 * 
 * This page implements the business process for assigning reviewers to NSF GRFP applications.
 * Following the defined steps:
 * 1. Load applications and reviewers
 * 2. Filter applications by field of study
 * 3. Select a reviewer based on expertise
 * 4. Assign reviewer to application
 * 5. Confirm assignment and notify reviewer
 */

import React, { useState, useEffect, useContext } from 'react'
import { Navigate, Link } from 'react-router-dom'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Form from '../../components/Form'
import StepSection, { StepHeader } from '../../components/StepSection'
import { ReviewerAssignmentStory } from './reviewer-assignment.story'
import { ProcessStepContext } from '../../context/ProcessStepContext'
import { UserContext } from '../../context/UserContext'

export default function ReviewerAssignmentPage() {
  // Get user context for authentication
  const { user } = useContext(UserContext)
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />
  }
  
  // Check if user has permission to access this page
  const hasPermission = user.role === 'admin' || user.role === 'applicantReviewer'
  
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
        <p>You do not have permission to access Reviewer Assignment.</p>
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
  // State for managing the reviewer assignment process
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [reviewers, setReviewers] = useState([])
  const [filteredReviewers, setFilteredReviewers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [selectedReviewer, setSelectedReviewer] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [fieldOfStudyFilter, setFieldOfStudyFilter] = useState('')
  const [availableFields, setAvailableFields] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  
  // Access the process step context
  const { currentStep, setCurrentStep, saveScrollPosition } = useContext(ProcessStepContext)
  
  // No dedicated guidance function needed as the StoryGuide shows the current step
  
  // Step 1: Load applications and reviewers
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage('')
    
    try {
      // Fetch applications and reviewers
      const appsResponse = await fetch('/api/applicants')
      const reviewersResponse = await fetch('/api/reviewers')
      
      if (!appsResponse.ok || !reviewersResponse.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const appsData = await appsResponse.json()
      const reviewersData = await reviewersResponse.json()
      
      setApplications(appsData)
      setFilteredApplications(appsData)
      setReviewers(reviewersData)
      setDataLoaded(true)
      
      // Extract unique fields of study from applications
      const fields = [...new Set(appsData.map(app => app.fieldOfStudy))].filter(Boolean)
      setAvailableFields(fields)
      
      // Use a slight delay before moving to the next step
      // but don't force scrolling
      setTimeout(() => {
        // Move to next step in the process
        setCurrentStep(1) // Step 2: Filter applications by field of study
      }, 300)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Step 2: Filter applications by field of study
  const filterApplicationsByField = (field) => {
    setFieldOfStudyFilter(field)
    setSuccessMessage('')
    
    if (!field) {
      setFilteredApplications(applications)
      setFilteredReviewers([])
      return
    }
    
    const filtered = applications.filter(app => app.fieldOfStudy === field)
    setFilteredApplications(filtered)
    
    // Move to next step when field is selected with a small delay
    if (field) {
      // Also fetch reviewers for this field
      fetchReviewersByExpertise(field);
      
      // Delay the step transition for a smoother experience
      setTimeout(() => {
        setCurrentStep(2); // Step 3: Select an applicant from the filtered list
      }, 300)
      
      // As a fallback, also show all reviewers in case the API filtering doesn't work
      console.log('All reviewers:', reviewers)
      const matchingReviewers = reviewers.filter(
        rev => rev.expertise === field || rev.secondaryExpertise === field
      )
      console.log('Client-side filtered reviewers:', matchingReviewers)
      
      if (matchingReviewers.length > 0) {
        setFilteredReviewers(matchingReviewers)
      }
    }
  }
  
  // Step 3: Fetch reviewers by expertise
  const fetchReviewersByExpertise = async (expertise) => {
    if (!expertise) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Fetching reviewers with expertise: ${expertise}`)
      const response = await fetch(`/api/reviewers?expertise=${expertise}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviewers by expertise')
      }
      
      const data = await response.json()
      console.log('Reviewers returned from API:', data)
      setFilteredReviewers(data)
    } catch (err) {
      console.error('Error fetching reviewers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Note: We're no longer using this direct selection function
  // Instead selection happens in two steps:
  // 1. Temporarily select in the table row click handler
  // 2. Confirm selection in the modal
  const selectReviewer = (reviewer) => {
    setSelectedReviewer(reviewer)
    setSuccessMessage('')
  }
  
  // Step 3: Select an application
  const selectApplication = (application) => {
    // Visual feedback immediately - don't save scroll position as we don't want to move
    setSuccessMessage('');
    
    // Update the selection state
    setSelectedApplication(application);
    
    // Reset selected reviewer when changing applications
    setSelectedReviewer(null);
    
    // Update the current step to highlight step 4 in the story guide
    // We need to set the step to 3 because the story steps are 0-indexed
    // but the visual representation is 1-indexed
    setCurrentStep(3); // Step 4: Choose a reviewer with matching expertise
  }
  
  // Step 4: Assign reviewer to application
  const assignReviewer = async () => {
    if (!selectedApplication || !selectedReviewer) {
      setError('Please select both an application and a reviewer')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccessMessage('')
    
    try {
      const response = await fetch('/api/assign-reviewer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId: selectedApplication.id,
          reviewerId: selectedReviewer.id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign reviewer')
      }
      
      const result = await response.json()
      
      // Update the applications list with the new assignment
      setApplications(applications.map(app => 
        app.id === result.applicant.id ? result.applicant : app
      ))
      
      // Update filtered applications as well
      setFilteredApplications(filteredApplications.map(app => 
        app.id === result.applicant.id ? result.applicant : app
      ))
      
      // Update reviewer assignment count
      setReviewers(reviewers.map(rev => 
        rev.id === result.reviewer.id ? result.reviewer : rev
      ))
      
      setFilteredReviewers(filteredReviewers.map(rev => 
        rev.id === result.reviewer.id ? result.reviewer : rev
      ))
      
      // Show success modal without forcing step change
      setShowSuccessModal(true)
      
      // Step will be updated after confirmation in a smoother way
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Step 5: Confirm and close
  const confirmAssignment = () => {
    // First update the message without scrolling
    setSuccessMessage(`Successfully assigned ${selectedReviewer.name} to review ${selectedApplication.name}'s application`);
    setShowSuccessModal(false);
    
    // Delay the reset of selections for visual continuity
    setTimeout(() => {
      // Reset selection state
      setSelectedApplication(null);
      setSelectedReviewer(null);
      
      // Move to the completion step which is dynamically added by the StoryGuide component
      // The completion step is always the number of steps in the story
      setCurrentStep(5);
    }, 400);
  }
  
  // Column definitions for tables
  const appColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Applicant Name' },
    { key: 'email', label: 'Email' },
    { key: 'fieldOfStudy', label: 'Field of Study' },
    { 
      key: 'reviewer', 
      label: 'Assigned Reviewer',
      render: (reviewer) => reviewer?.name || 'None'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button 
          onClick={(e) => {
            // Prevent event bubbling to avoid double handling
            e.stopPropagation();
            
            if (!row.reviewer && fieldOfStudyFilter) {
              // Add a class for animation on the button itself
              e.currentTarget.classList.add('highlight-flash');
              
              // Apply selection
              selectApplication(row);
              
              // Scroll to reviewer section after a short delay
              setTimeout(() => {
                document.querySelector('div[style*="animation: fadeIn"]')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
              }, 100);
            }
          }}
          disabled={row.reviewer || !fieldOfStudyFilter}
          style={{ 
            padding: '6px 12px',
            backgroundColor: selectedApplication?.id === row.id ? '#4caf50' : '#f0f0f0',
            color: selectedApplication?.id === row.id ? 'white' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: row.reviewer || !fieldOfStudyFilter ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedApplication?.id === row.id ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {row.reviewer ? 'Assigned ✓' : selectedApplication?.id === row.id ? 'Selected ✓' : 'Select'}
          
          {/* Add button ripple effect */}
          <span style={{
            position: 'absolute',
            display: selectedApplication?.id === row.id ? 'block' : 'none',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: selectedApplication?.id === row.id ? 'rippleEffect 0.6s ease-out' : 'none'
          }} />
        </button>
      )
    }
  ]
  
  const reviewerColumns = [
    { key: 'name', label: 'Name' },
    { key: 'expertise', label: 'Primary Expertise' },
    { key: 'secondaryExpertise', label: 'Secondary Expertise' },
    { 
      key: 'assignments', 
      label: 'Workload',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '100px', 
            height: '10px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '5px',
            overflow: 'hidden',
            marginRight: '10px'
          }}>
            <div style={{ 
              width: `${(row.currentAssignments / row.maxAssignments) * 100}%`, 
              height: '100%', 
              backgroundColor: row.currentAssignments >= row.maxAssignments ? '#f44336' : 
                              (row.currentAssignments > row.maxAssignments / 2) ? '#ff9800' : '#4caf50',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <span>{row.currentAssignments}/{row.maxAssignments}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Actions',
      render: (_, row) => {
        // Different button states depending on selection state and capacity
        // Check if this reviewer is already assigned to the selected application
        const isAssigned = selectedApplication && selectedApplication.reviewer && 
                          selectedApplication.reviewer.id === row.id
                          
        // Disable if at capacity, no application selected, or already assigned
        const isDisabled = row.currentAssignments >= row.maxAssignments || 
                          !selectedApplication || 
                          isAssigned
                          
        // Only show as selected after confirmed assignment
        const isSelected = isAssigned
        
        let buttonText, buttonColor, buttonBackground
        
        if (row.currentAssignments >= row.maxAssignments) {
          buttonText = 'At Capacity'
          buttonBackground = '#f5f5f5'
          buttonColor = '#999'
        } else if (isSelected) {
          buttonText = 'Already Assigned ✓'
          buttonBackground = '#4caf50'
          buttonColor = 'white'
        } else if (!selectedApplication) {
          buttonText = 'Select Applicant First'
          buttonBackground = '#f5f5f5'
          buttonColor = '#999'
        } else {
          buttonText = 'Assign to ' + selectedApplication.name.split(' ')[0]
          buttonBackground = '#2196f3'
          buttonColor = 'white'
        }
        
        return (
          <button 
            onClick={(e) => {
              // Store the reviewer temporarily but don't fully select until confirmed
              if (!isDisabled) {
                // Add highlight animation to the button
                e.currentTarget.classList.add('highlight-flash');
                
                // Visual feedback - highlight the selection without scrolling
                setSelectedReviewer(row);
                
                // Give a moment for the UI to update before showing the modal
                setTimeout(() => {
                  // Update the step to step 5 (index 4) to highlight the current step
                  setCurrentStep(4);
                  
                  // Open confirmation modal
                  setShowConfirmModal(true);
                }, 300)
              }
            }}
            disabled={isDisabled}
            style={{ 
              padding: '6px 12px',
              backgroundColor: buttonBackground,
              color: buttonColor,
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
              minWidth: '120px'
            }}
          >
            {buttonText}
          </button>
        )
      }
    }
  ]
  
  return (
    <div>
      {/* Add animations for smoother transitions */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes rippleEffect {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            50% {
              transform: scale(2);
              opacity: 0.5;
            }
            100% {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          .highlight-flash {
            animation: buttonFlash 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          }
          
          @keyframes buttonFlash {
            0% {
              box-shadow: 0 0 0 rgba(33, 150, 243, 0);
            }
            30% {
              box-shadow: 0 0 12px rgba(33, 150, 243, 0.7);
            }
            100% {
              box-shadow: 0 0 0 rgba(33, 150, 243, 0);
            }
          }
        `}
      </style>
      <h2 style={{ marginBottom: '1.5rem' }}>Reviewer Assignment</h2>
      
      {/* Step 1: Load applications and reviewers */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title="Load Application and Reviewer Data" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button 
            onClick={fetchData} 
            disabled={loading || dataLoaded || currentStep === 5}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: dataLoaded || currentStep === 5 ? '#f0f0f0' : '#2196f3',
              color: dataLoaded || currentStep === 5 ? '#666' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: dataLoaded || currentStep === 5 ? 'default' : 'pointer',
              boxShadow: dataLoaded || currentStep === 5 ? 'none' : '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Loading...' : currentStep === 5 ? 'Journey Complete' : dataLoaded ? 'Data Loaded ✓' : 'Load Applications and Reviewers'}
          </button>
          
          {dataLoaded && (
            <div style={{ color: '#388e3c' }}>
              <strong>{applications.length}</strong> applications and <strong>{reviewers.length}</strong> reviewers loaded successfully.
            </div>
          )}
        </div>
      </StepSection>
      
      {/* Error display */}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div style={{ color: 'green', marginTop: '1rem', marginBottom: '1rem', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
          <strong>Success:</strong> {successMessage}
        </div>
      )}
      
      {/* The journey completion UI is now handled by the StoryGuide component */}
      
      {/* Content once data is loaded - always show content even when journey is complete */}
      {dataLoaded && (
        <div>
          {/* Step 2: Filter by field of study */}
          <StepSection stepNumber={1}>
            <StepHeader stepNumber={2} title="Filter Applications by Field of Study" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select 
                value={fieldOfStudyFilter} 
                onChange={(e) => filterApplicationsByField(e.target.value)}
                style={{ 
                  padding: '0.5rem', 
                  minWidth: '200px', 
                  borderRadius: '4px',
                  border: '1px solid #ccc' 
                }}
                autoComplete="off"
              >
                <option value="">Select Field of Study</option>
                {availableFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
              
              {fieldOfStudyFilter && (
                <div style={{
                  color: '#388e3c',
                  backgroundColor: '#e8f5e9',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  Filter applied: {fieldOfStudyFilter}
                </div>
              )}
            </div>
          </StepSection>
          
          {/* Step 3: View and select applications */}
          <div style={{
            marginBottom: '2rem',
            padding: fieldOfStudyFilter ? '0' : '0',
            backgroundColor: 'transparent',
            border: 'none'
          }}>
            {fieldOfStudyFilter && (
              <StepSection stepNumber={2}>
                <StepHeader stepNumber={3} title="Select an applicant from the filtered list" />
                <div style={{ marginTop: '1rem' }}>
                  <h4>Applications{fieldOfStudyFilter ? ` (${fieldOfStudyFilter})` : ''}</h4>
                
                  {selectedApplication && (
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '0.5rem',
                      backgroundColor: '#e8f5e9',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <strong>Selected:</strong> {selectedApplication.name} ({selectedApplication.fieldOfStudy})
                    </div>
                    <button 
                      onClick={() => setSelectedApplication(null)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#f44336'
                      }}
                    >
                      Change Selection
                    </button>
                  </div>
                )}
                
                <Table 
                  data={filteredApplications}
                  columns={appColumns}
                  selectedRow={selectedApplication}
                  onRowClick={(app) => {
                    // Only allow selection of unassigned applications
                    if (!app.reviewer && fieldOfStudyFilter) {
                      // Select the application (which will update the current step)
                      selectApplication(app);
                      
                      // Smoothly scroll to reviewer section when an app is selected
                      if (document.querySelector('div[style*="animation: fadeIn"]')) {
                        setTimeout(() => {
                          document.querySelector('div[style*="animation: fadeIn"]')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                          });
                        }, 100);
                      }
                    }
                  }}
                />
                
                    {filteredApplications.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                      No applications found for {fieldOfStudyFilter}
                    </p>
                  )}
                </div>
              </StepSection>
            )}
          </div>
          
          {/* Step 4: Choose a reviewer with matching expertise */}
          {fieldOfStudyFilter && selectedApplication && (
            <StepSection stepNumber={3}>
              <StepHeader stepNumber={4} title="Choose a reviewer with matching expertise" />
              <div style={{ marginTop: '1rem', animation: 'fadeIn 0.4s ease-out' }}>
                <h4>Available Reviewers with {fieldOfStudyFilter} Expertise for {selectedApplication.name}</h4>
              
              {selectedReviewer && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.5rem',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong>Selected:</strong> {selectedReviewer.name} (Expertise: {selectedReviewer.expertise})
                  </div>
                  <button 
                    onClick={() => setSelectedReviewer(null)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#f44336'
                    }}
                  >
                    Change Selection
                  </button>
                </div>
              )}
              
              {filteredReviewers.length > 0 ? (
                <Table 
                  data={filteredReviewers}
                  columns={reviewerColumns}
                  selectedRow={selectedReviewer}
                />
              ) : (
                <div style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#fff9c4',
                  borderRadius: '4px',
                  margin: '1rem 0'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#ff6f00' }}>
                    No reviewers available with expertise in {fieldOfStudyFilter}
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                    Consider selecting a reviewer with a different expertise area or updating reviewer profiles.
                  </p>
                </div>
              )}
              </div>
            </StepSection>
          )}
          
          {/* Floating action panel removed as requested */}
          
          {/* Assignment confirmation modal */}
          {selectedApplication && selectedReviewer && showConfirmModal && (
            <Modal onClose={() => setShowConfirmModal(false)}>
              <div style={{ 
                padding: '1.5rem',
                maxWidth: '450px',
                margin: '0 auto'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#e3f2fd',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#2196f3',
                    fontWeight: 'bold'
                  }}>
                    Final Confirmation
                  </div>
                  <h3 style={{ 
                    margin: '0.5rem 0',
                    textAlign: 'center',
                    color: '#2196f3'
                  }}>Confirm Assignment</h3>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f5f5f5',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.25rem',
                      color: '#555'
                    }}>
                      Applicant:
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{selectedApplication.name}</span>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {selectedApplication.fieldOfStudy}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.25rem',
                      color: '#555'
                    }}>
                      Reviewer:
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{selectedReviewer.name}</span>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {selectedReviewer.expertise}
                      </span>
                    </div>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      color: '#757575',
                      fontSize: '0.9rem'
                    }}>
                      Current workload: {selectedReviewer.currentAssignments}/{selectedReviewer.maxAssignments} assignments
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '1.5rem', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '1rem' 
                }}>
                  <button 
                    onClick={() => {
                      // Close the modal without making the assignment
                      setShowConfirmModal(false)
                      
                      // Go back to step 3 (reviewer selection)
                      setCurrentStep(3)
                    }}
                    style={{ 
                      padding: '0.75rem 1.25rem',
                      border: '1px solid #757575',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5',
                      color: '#424242',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowConfirmModal(false)
                      assignReviewer()
                    }}
                    disabled={loading}
                    style={{ 
                      padding: '0.75rem 1.25rem', 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      cursor: loading ? 'wait' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </div>
            </Modal>
          )}
          
          {/* Step 5: Success Modal */}
          {selectedApplication && selectedReviewer && showSuccessModal && (
            <Modal onClose={() => setShowSuccessModal(false)}>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>Assignment Successful</h3>
                <p>
                  Reviewer <strong>{selectedReviewer.name}</strong> has been assigned to 
                  review the application from <strong>{selectedApplication.name}</strong>.
                </p>
                <p>
                  <strong>Details:</strong>
                </p>
                <ul>
                  <li>Applicant: {selectedApplication.name} ({selectedApplication.fieldOfStudy})</li>
                  <li>Reviewer: {selectedReviewer.name} (Expertise: {selectedReviewer.expertise})</li>
                  <li>Email notification will be sent to: {selectedReviewer.email}</li>
                  <li>Reviewer's current assignments: {selectedReviewer.currentAssignments + 1}/{selectedReviewer.maxAssignments}</li>
                </ul>
                
                <div style={{
                  backgroundColor: '#e8f5e9',
                  borderRadius: '4px',
                  padding: '0.75rem',
                  marginTop: '1rem',
                  textAlign: 'center',
                  color: '#2e7d32'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    Assignment process complete! ✓
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                    The user journey is now complete. You can close this modal to view your completed journey.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button 
                    onClick={confirmAssignment}
                    style={{ 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      padding: '0.75rem 1.25rem', 
                      border: 'none', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Complete Journey
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  )
}
