import React, { createContext, useContext, useState, useEffect } from 'react'
import { getApiBase } from '../utils/apiConfig'

const ConsultantAuthContext = createContext()

export const useConsultantAuth = () => {
  const context = useContext(ConsultantAuthContext)
  if (!context) {
    throw new Error('useConsultantAuth must be used within a ConsultantAuthProvider')
  }
  return context
}

export const ConsultantAuthProvider = ({ children }) => {
  const [consultant, setConsultant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('consultantToken')
      if (!token) {
        setLoading(false)
        return
      }

      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultant/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('=== CONSULTANT /me API RESPONSE ===');
        console.log('Full response:', data);
        console.log('Consultant data:', data.data.consultant);
        setConsultant(data.data.consultant)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('consultantToken')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('consultantToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultant/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('consultantToken', data.data.token)
        setConsultant(data.data.consultant)
        setIsAuthenticated(true)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const signup = async (formData) => {
    try {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultant/signup`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('consultantToken', data.data.token)
        setConsultant(data.data.consultant)
        setIsAuthenticated(true)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('consultantToken')
    setConsultant(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('consultantToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultant/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      console.log('=== UPDATE PROFILE RESPONSE ===');
      console.log('Full response:', data);
      console.log('Updated consultant:', data.data?.consultant);

      if (data.success) {
        setConsultant(data.data.consultant)
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Profile update failed. Please try again.' }
    }
  }

  const value = {
    consultant,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile
  }

  return (
    <ConsultantAuthContext.Provider value={value}>
      {children}
    </ConsultantAuthContext.Provider>
  )
}
