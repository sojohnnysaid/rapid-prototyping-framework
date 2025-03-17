// src/stories/eligibility/EligibilityScreening.jsx
//
// This file implements the Eligibility Screening business process for the NSF GRFP application.
// It demonstrates how to build a process-centric UI with guided steps and data manipulation.
//
// KEY CONCEPTS:
// - Business Process Steps: The process is broken down into sequential steps
// - Interactive Guidance: The UI guides users through each step in the process
// - Mock API Integration: Uses MSW to simulate backend data operations
// - Process State Tracking: Keeps track of where the user is in the process
//
// HOW TO CREATE A STORY:
// 1. Define a story object with a title and array of steps (like eligibilityStory below)
// 2. Create UI elements that correspond to each step in the process
// 3. Use the StoryGuide component to display the steps to the user
// 4. Connect user actions to progress through the steps
//
// CONNECTING STEPS TO ACTIONS:
// - Step 1: "Load applicant data" - Initial state when page loads
// - Step 2: "Review transcripts" - After data is displayed in the table
// - Step 3: "Mark eligibility status" - When user opens the edit modal
// - Step 4: "Log decision and rationale" - After saving the status change

import React, { useEffect, useState } from 'react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Form from '../../components/Form'
import StoryGuide from '../../components/StoryGuide'

// Define the business process steps for eligibility screening
const eligibilityStory = {
  title: "Eligibility Screening Process",
  steps: [
    "Load applicant data",
    "Review transcripts",
    "Mark eligibility status",
    "Log decision and rationale"
  ]
}

export default function EligibilityScreening() {
  const [applicants, setApplicants] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  // Load applicants from mock API
  useEffect(() => {
    fetch('/api/applicants')
      .then(res => res.json())
      .then(data => setApplicants(data))
      .catch(console.error)
  }, [])

  const openModal = (applicant) => {
    setSelectedApplicant(applicant)
    setNewStatus(applicant.eligibilityStatus)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedApplicant(null)
  }

  const handleUpdateStatus = (evt) => {
    evt.preventDefault()
    fetch(`/api/applicants/${selectedApplicant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eligibilityStatus: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setApplicants(applicants.map(app => (app.id === updated.id ? updated : app)))
        closeModal()
      })
      .catch(console.error)
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'eligibilityStatus', label: 'Status' }
  ]

  return (
    <div>
      <h2>Eligibility Screening</h2>
      <Table data={applicants} columns={columns} />
      <button onClick={() => {
        // For demo: open modal for first applicant if exists
        if(applicants.length > 0) openModal(applicants[0])
      }}>
        Edit First Applicant
      </button>

      {showModal && (
        <Modal onClose={closeModal}>
          <h3>Edit Eligibility Status</h3>
          <Form onSubmit={handleUpdateStatus}>
            <label>
              Status:
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value)}
                autoComplete="off"
              >
                <option value="Pending">Pending</option>
                <option value="Eligible">Eligible</option>
                <option value="Ineligible">Ineligible</option>
              </select>
            </label>
            <div style={{ marginTop: '1rem' }}>
              <button type="submit">Save</button>
              <button type="button" onClick={closeModal} style={{ marginLeft: '0.5rem' }}>Cancel</button>
            </div>
          </Form>
        </Modal>
      )}
      
      {/* Display the story guide */}
      <StoryGuide story={eligibilityStory} />
    </div>
  )
}