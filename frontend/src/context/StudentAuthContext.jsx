import React, { createContext, useContext, useState, useEffect } from 'react'
import { getApiBase } from '../utils/apiConfig'

const StudentAuthContext = createContext()

const parseResponseBody = async (response) => {
  const text = await response.text().catch(() => '')
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch (error) {
    return { message: text }
  }
}

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext)
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider')
  }
  return context
}

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) {
        setLoading(false)
        return
      }

      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/student/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await parseResponseBody(response)
        console.log('=== STUDENT /me API RESPONSE ===')
        console.log('Full response:', data)
        console.log('Student data:', data.data.student)
        setStudent(data.data.student)
        setIsAuthenticated(true)
      } else if (response.status === 429) {
        console.warn('Student auth check rate limited; retrying soon')
        setTimeout(checkAuthStatus, 10000)
      } else {
        localStorage.removeItem('studentToken')
        setStudent(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('studentToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await parseResponseBody(response)

      if (response.ok && data.success) {
        localStorage.setItem('studentToken', data.data.token)
        setStudent(data.data.student)
        setIsAuthenticated(true)
        return { success: true, message: data.message }
      } else if (response.status === 429) {
        return { success: false, message: 'Too many login attempts. Please wait a moment.' }
      } else {
        return { success: false, message: data.message || 'Login failed. Please try again.' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const signup = async (formData) => {
    try {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/student/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await parseResponseBody(response)

      if (response.ok && data.success) {
        localStorage.setItem('studentToken', data.data.token)
        setStudent(data.data.student)
        setIsAuthenticated(true)
        return { success: true, message: data.message }
      } else if (response.status === 429) {
        return { success: false, message: 'Too many signup attempts. Please wait a moment.' }
      } else {
        return { success: false, message: data.message || 'Registration failed. Please try again.' }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('studentToken')
    setStudent(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('studentToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/student/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await parseResponseBody(response)
      console.log('=== UPDATE STUDENT PROFILE RESPONSE ===');
      console.log('Full response:', data);
      console.log('Updated student:', data.data?.student);

      if (response.ok && data.success) {
        setStudent(data.data.student)
        return { success: true, message: data.message }
      } else if (response.status === 429) {
        return { success: false, message: 'Too many requests. Please wait a moment.' }
      } else {
        return { success: false, message: data.message || 'Profile update failed. Please try again.' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: 'Profile update failed. Please try again.' }
    }
  }

  const value = {
    student,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile
  }

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  )
}


