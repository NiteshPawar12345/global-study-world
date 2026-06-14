import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getApiBase } from '../utils/apiConfig'

const AdminAuthContext = createContext()

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  // Check if admin is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        try {
          const apiBase = getApiBase()
          const response = await axios.get(`${apiBase}/api/admin/me`)
          setAdmin(response.data.data.admin)
        } catch (error) {
          localStorage.removeItem('adminToken')
          delete axios.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const apiBase = getApiBase()
      const response = await axios.post(`${apiBase}/api/admin/login`, {
        email,
        password
      })
      
      const { token, admin: adminData } = response.data.data
      localStorage.setItem('adminToken', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setAdmin(adminData)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const signup = async (formData) => {
    try {
      const apiBase = getApiBase()
      const response = await axios.post(`${apiBase}/api/admin/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const apiBase = getApiBase()
      const response = await axios.post(`${apiBase}/api/admin/forgot-password`, {
        email
      })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send reset email' 
      }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const apiBase = getApiBase()
      const response = await axios.post(`${apiBase}/api/admin/reset-password`, {
        token,
        password
      })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    delete axios.defaults.headers.common['Authorization']
    setAdmin(null)
  }

  const value = {
    admin,
    login,
    signup,
    forgotPassword,
    resetPassword,
    logout,
    loading
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}





