import React from 'react'
import { Navigate } from 'react-router-dom'

const ConsultantRegistration = () => {
  // Redirect to the new consultant signup form
  return <Navigate to="/consultant/signup" replace />
}

export default ConsultantRegistration