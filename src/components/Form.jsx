// src/components/Form.jsx
import React from 'react'

export default function Form({ onSubmit, children, autoComplete = "on", ...props }) {
  return (
    <form onSubmit={onSubmit} autoComplete={autoComplete} {...props}>
      {children}
    </form>
  )
}