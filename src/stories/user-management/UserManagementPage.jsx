import React, { useState, useEffect, useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import { ProcessStepContext } from '../../context/ProcessStepContext'
import StepSection, { StepHeader } from '../../components/StepSection'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Form from '../../components/Form'
import { UserManagementStory } from './user-management.story'

export default function UserManagementPage() {
  // State for user data and UI controls
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin'
  })
  const [dataLoaded, setDataLoaded] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [workflowCompleted, setWorkflowCompleted] = useState(false)

  // Access the process step context
  const { currentStep, setCurrentStep } = useContext(ProcessStepContext)
  
  // Get user context for authentication
  const { user } = useContext(UserContext)
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />
  }
  
  // Check if user has permission to access this page (only admins)
  const hasPermission = user.role === 'admin'
  
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
        <p>You do not have permission to access User Management.</p>
        <p>Only administrators can manage users.</p>
      </div>
    )
  }

  // Step 1: Fetch users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setUsers(data)
      setDataLoaded(true)
      
      // Move to the next step - "Add a new user"
      setCurrentStep(1)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Add a new user
  const openAddUserModal = () => {
    // Reset form data for a new user
    setFormData({
      name: '',
      email: '',
      role: 'admin'
    })
    setSelectedUser(null)
    setShowModal(true)
    
    // Move to the "Add a new user" step
    setCurrentStep(1)
  }

  // Step 3: Edit a user
  const openEditUserModal = (user) => {
    // Set form data to the user's current values
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    })
    setSelectedUser(user)
    setShowModal(true)
    
    // Move to the "Edit existing user" step
    setCurrentStep(2)
  }

  // Close the modal without saving
  const closeModal = () => {
    setShowModal(false)
    
    // Maintain the current step instead of going backwards
  }

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      if (selectedUser) {
        // Edit existing user
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to update user (${response.status})`)
        }
        
        const updatedUser = await response.json()
        
        // Update the local state
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
        setSuccessMessage(`User "${updatedUser.name}" was updated successfully.`)
      } else {
        // Add new user
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to create user (${response.status})`)
        }
        
        const newUser = await response.json()
        
        // Update the local state
        setUsers([...users, newUser])
        setSuccessMessage(`New user "${newUser.name}" was created successfully.`)
      }
      
      // Close the modal and reset form
      setShowModal(false)
      
      // If we were adding a user, advance to the next step (edit)
      // If we were editing, advance to the next step (delete)
      if (!selectedUser) {
        // We just added a user, move to the edit step
        setCurrentStep(2)
      } else {
        // We just edited a user, move to the delete step
        setCurrentStep(3)
      }
    } catch (err) {
      console.error('Error saving user:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
    
    // Move to the "Delete users" step
    setCurrentStep(3)
  }
  
  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
  }
  
  // Step 4: Delete a user
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete user (${response.status})`)
      }
      
      // Update the local state
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setSuccessMessage(`User "${userToDelete.name}" was deleted successfully.`)
      
      // Close the modal
      closeDeleteModal()
      
      // Mark workflow as completed
      setWorkflowCompleted(true)
      
      // IMPORTANT: Set the current step to 4, which is the completion step
      // This ensures the workflow advances to the "User Journey Completed" step
      setCurrentStep(4)
      
      // Display a completion message
      setTimeout(() => {
        setSuccessMessage('User management workflow completed successfully!')
      }, 1000)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Define table columns
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', 
      render: (role) => {
        let color
        switch (role) {
          case 'admin': color = '#d81b60'; break;
          case 'transcriptReviewer': color = '#1e88e5'; break;
          case 'applicantReviewer': color = '#43a047'; break;
          case 'programOfficer': color = '#f57c00'; break;
          default: color = '#757575';
        }
        
        return (
          <span style={{ 
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: `${color}20`,
            color: color,
            fontWeight: 'bold'
          }}>
            {role}
          </span>
        )
      }
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_, user) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => openEditUserModal(user)}
            style={{
              padding: '4px 10px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
          <button 
            onClick={() => openDeleteModal(user)}
            style={{
              padding: '4px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  // Format role for display
  const formatRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'transcriptReviewer': return 'Transcript Reviewer';
      case 'applicantReviewer': return 'Applicant Reviewer';
      case 'programOfficer': return 'Program Officer';
      default: return role;
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>User Management</h2>
      
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
      
      {/* Step 1: Load and review user data */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title={UserManagementStory.steps[0]} />
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={fetchUsers} 
            disabled={loading || dataLoaded}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: dataLoaded ? '#f0f0f0' : '#2196f3',
              color: dataLoaded ? '#666' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || dataLoaded ? 'default' : 'pointer',
              boxShadow: dataLoaded ? 'none' : '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Loading...' : dataLoaded ? 'Data Loaded ✓' : 'Load User Data'}
          </button>
          
          {dataLoaded && (
            <div style={{ color: '#388e3c', marginTop: '0.5rem' }}>
              <strong>{users.length}</strong> users loaded successfully.
            </div>
          )}
        </div>
      </StepSection>
      
      {/* Step 2: Add/Edit/Delete Users */}
      {dataLoaded && (
        <StepSection stepNumber={1}>
          <StepHeader stepNumber={2} title={UserManagementStory.steps[1]} />
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={openAddUserModal}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Add New User
            </button>
            
            <Table 
              data={users} 
              columns={columns}
            />
            
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#757575' }}>
                No users found. Click "Add New User" to create your first user.
              </div>
            )}
          </div>
        </StepSection>
      )}
      
      {/* User modal form for Add/Edit */}
      {showModal && (
        <Modal onClose={closeModal}>
          <div style={{ padding: '1rem' }}>
            <StepSection stepNumber={selectedUser ? 2 : 1}>
              <StepHeader 
                stepNumber={selectedUser ? 3 : 2} 
                title={selectedUser ? UserManagementStory.steps[2] : UserManagementStory.steps[1]} 
              />
              <div style={{ marginTop: '1rem' }}>
                <h3>{selectedUser ? 'Edit User' : 'Add New User'}</h3>
                
                <Form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Name:
                    </label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem' }}
                      required
                      autoComplete="name"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Email:
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem' }}
                      required
                      autoComplete="email"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Role:
                    </label>
                    <select 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem' }}
                      autoComplete="off"
                    >
                      <option value="admin">Administrator</option>
                      <option value="transcriptReviewer">Transcript Reviewer</option>
                      <option value="applicantReviewer">Applicant Reviewer</option>
                      <option value="programOfficer">Program Officer</option>
                    </select>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
                        backgroundColor: selectedUser ? '#2196f3' : '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'wait' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {loading ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </Form>
              </div>
            </StepSection>
          </div>
        </Modal>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && userToDelete && (
        <Modal onClose={closeDeleteModal}>
          <div style={{ padding: '1rem' }}>
            <StepSection stepNumber={3}>
              <StepHeader 
                stepNumber={4} 
                title={UserManagementStory.steps[3]} 
              />
              <div style={{ marginTop: '1rem' }}>
                <h3>Delete User</h3>
                <p style={{ marginBottom: '1.5rem' }}>
                  Are you sure you want to delete the user <strong>{userToDelete.name}</strong>?
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    onClick={closeDeleteModal}
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
                    onClick={handleDeleteUser}
                    disabled={loading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'wait' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </StepSection>
          </div>
        </Modal>
      )}
    </div>
  )
}
