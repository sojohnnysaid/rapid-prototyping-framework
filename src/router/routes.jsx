// src/router/routes.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EligibilityScreening from '../stories/eligibility/EligibilityScreening'

// A simple Home page
function HomePage() {
  return <div><h2>Welcome to the PMCS|Lux Applicant Tracker</h2></div>
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/eligibility" element={<EligibilityScreening />} />
      </Routes>
    </BrowserRouter>
  )
}