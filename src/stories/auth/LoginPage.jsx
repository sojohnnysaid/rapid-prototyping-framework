import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Form from '../../components/Form';

export default function LoginPage() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!role) {
      setError('Please select a role');
      return;
    }
    
    // Set the user in context
    setUser({ name, role });
    
    // Navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: 'white',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login to PMCS|Lux Applicant Tracker</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '0.75rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <Form onSubmit={handleSubmit} autoComplete="on" name="login-form">
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Name:
          </label>
          <input 
            id="name-input"
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="role-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Role:
          </label>
          <select 
            id="role-select"
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            autoComplete="organization-title"
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">Select a role</option>
            <option value="admin">Administrator</option>
            <option value="transcriptReviewer">Transcript Reviewer</option>
            <option value="applicantReviewer">Applicant Reviewer</option>
            <option value="programOfficer">Program Officer</option>
          </select>
        </div>
        
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Login
        </button>
      </Form>
    </div>
  );
}