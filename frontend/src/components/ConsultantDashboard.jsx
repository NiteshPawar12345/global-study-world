import React, { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useConsultantAuth } from '../context/ConsultantAuthContext'
import { getApiBase } from '../utils/apiConfig'
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Award, 
  DollarSign, 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  MessageCircle,
  Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import ChatModal from './ChatModal'
import { startConversationAsConsultant, fetchChatNotifications } from '../services/chatApi'

const ConsultantDashboard = () => {
  const { consultant, updateProfile, logout } = useConsultantAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [courses, setCourses] = useState([])
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsError, setLeadsError] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const consultantToken = typeof window !== 'undefined' ? localStorage.getItem('consultantToken') : null
  const [chatConversation, setChatConversation] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatLeadLoadingId, setChatLeadLoadingId] = useState(null)
  const [chatNotifications, setChatNotifications] = useState([])
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleChatLead = async (lead) => {
    if (!consultantToken) {
      toast.error('Please login again to start chatting')
      return
    }

    const studentId = lead.student?.id || lead.student_id
    if (!studentId) {
      toast.error('Student information unavailable for this lead')
      return
    }

    try {
      setChatLeadLoadingId(lead.id)
      const data = await startConversationAsConsultant(consultantToken, studentId)
      setChatConversation(data.conversation)
      setIsChatOpen(true)
      setShowNotifications(false)
      refreshNotifications()
    } catch (error) {
      console.error('Failed to open chat', error)
      toast.error(error.message || 'Failed to open chat')
    } finally {
      setChatLeadLoadingId(null)
    }
  }

  const refreshNotifications = useCallback(async () => {
    if (!consultantToken) return
    try {
      const data = await fetchChatNotifications(consultantToken)
      setChatUnreadCount(data.totalUnread || 0)
      setChatNotifications(data.recentUnread || [])
    } catch (error) {
      console.error('Failed to fetch chat notifications', error)
    }
  }, [consultantToken])

  const handleCallLead = (lead) => {
    const phone = lead.student?.mobile || lead.student?.phone
    if (phone) {
      window.location.href = `tel:${phone}`
    } else {
      toast.error('No phone number available for this lead')
    }
  }
  
  const languageOptions = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada',
    'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'French', 'German', 'Spanish',
    'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'
  ]

  // Debug: Log consultant data
  useEffect(() => {
    console.log('=== CONSULTANT DATA RECEIVED ===');
    console.log('Full consultant object:', consultant);
    console.log('Experience Years:', consultant?.experience_years);
    console.log('Total Placements:', consultant?.total_placements);
    console.log('Success Rate:', consultant?.success_rate);
    console.log('Response Time:', consultant?.response_time);
    console.log('Response Time Hours:', consultant?.response_time_hours);
  }, [consultant])

  useEffect(() => {
    if (!consultantToken) return
    refreshNotifications()
    const interval = setInterval(refreshNotifications, 20000)
    return () => clearInterval(interval)
  }, [consultantToken, refreshNotifications])

  const fetchLeads = async () => {
    setLeadsLoading(true)
    setLeadsError(null)
    try {
      const token = localStorage.getItem('consultantToken')
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      // Decode JWT to see consultant ID (basic decode, not verified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('🔑 JWT Token Info:', {
          consultantId: payload.userId,
          userType: payload.userType,
          email: payload.email
        })
      } catch (e) {
        console.log('⚠️ Could not decode JWT token')
      }
      
      console.log('🔍 Current logged-in consultant:', {
        id: consultant?.id,
        agency_name: consultant?.agency_name,
        email: consultant?.email
      })
      
      console.log('🔍 Fetching leads with token:', token.substring(0, 20) + '...')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/inquiries/consultant`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.message || `Failed to fetch leads: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Leads API response:', data)
      console.log('📊 Data structure:', {
        success: data.success,
        hasData: !!data.data,
        hasInquiries: !!data.data?.inquiries,
        inquiriesCount: data.data?.inquiries?.length || 0
      })
      
      if (data.success && data.data?.inquiries) {
        setLeads(data.data.inquiries)
        console.log(`✅ Successfully loaded ${data.data.inquiries.length} leads`)
      } else {
        console.log('⚠️ No inquiries in response, setting empty array')
        console.log('💡 This might mean:')
        console.log('   1. The consultant ID in your JWT token doesn\'t match consultant_id in inquiries')
        console.log('   2. No inquiries have been submitted to this consultant yet')
        console.log('   3. Check backend console logs for more details')
        setLeads([])
      }
    } catch (error) {
      console.error('❌ Error fetching leads:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      setLeadsError(error.message)
      setLeads([])
    } finally {
      setLeadsLoading(false)
    }
  }

  // Fetch leads when activeTab is 'leads'
  useEffect(() => {
    if (activeTab === 'leads' && consultant?.id) {
      fetchLeads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, consultant?.id])

  const [formData, setFormData] = useState({
    agency_name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    profile_picture: null,
    location: '',
    experience_years: '',
    total_placements: '',
    success_rate: '',
    response_time: '',
    languages: [],
    fee_min: '',
    fee_max: '',
    fee_model: 'fixed',
    description: '',
    gst_number: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    destination_countries: [],
    courses: []
  })

  // Fetch countries and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = getApiBase()
        const [countriesRes, coursesRes] = await Promise.all([
          fetch(`${apiBase}/api/consultants/countries`),
          fetch(`${apiBase}/api/consultants/courses`)
        ])
        
        const countriesData = await countriesRes.json()
        const coursesData = await coursesRes.json()
        
        if (countriesData.success) {
          setCountries(countriesData.data.countries)
        }
        if (coursesData.success) {
          setCourses(coursesData.data.courses)
        }
      } catch (error) {
        console.error('Failed to fetch countries and courses:', error)
      }
    }
    
    fetchData()
  }, [])

  // Update form data when consultant data is loaded
  useEffect(() => {
    if (consultant) {
      console.log('=== UPDATING FORM DATA ===');
      console.log('Destination Countries:', consultant.destination_countries);
      console.log('Courses:', consultant.courses);
      console.log('Languages:', consultant.languages);
      
      // Parse JSON strings to arrays
      let parsedDestinationCountries = consultant.destination_countries;
      let parsedCourses = consultant.courses;
      let parsedLanguages = consultant.languages;
      
      try {
        if (typeof consultant.destination_countries === 'string') {
          parsedDestinationCountries = JSON.parse(consultant.destination_countries);
        }
      } catch (error) {
        console.warn('Failed to parse destination countries:', error);
      }
      
      try {
        if (typeof consultant.courses === 'string') {
          parsedCourses = JSON.parse(consultant.courses);
        }
      } catch (error) {
        console.warn('Failed to parse courses:', error);
      }
      
      try {
        if (typeof consultant.languages === 'string') {
          parsedLanguages = JSON.parse(consultant.languages);
        }
      } catch (error) {
        console.warn('Failed to parse languages:', error);
      }
      
      console.log('Parsed Destination Countries:', parsedDestinationCountries);
      console.log('Parsed Courses:', parsedCourses);
      console.log('Parsed Languages:', parsedLanguages);
      
      setFormData({
        agency_name: consultant.agency_name || '',
        contact_person: consultant.contact_person || '',
        email: consultant.email || '',
        phone: consultant.phone || '',
        website: consultant.website || '',
        profile_picture: consultant.profile_picture || null,
        location: consultant.location || '',
        experience_years: consultant.experience_years || '',
        total_placements: consultant.total_placements || '',
        success_rate: consultant.success_rate || '',
        response_time: consultant.response_time || '',
        languages: parsedLanguages || [],
        fee_min: consultant.fee_min || '',
        fee_max: consultant.fee_max || '',
        fee_model: consultant.fee_model || 'fixed',
        description: consultant.description || '',
        gst_number: consultant.gst_number || '',
        bank_name: consultant.bank_name || '',
        account_number: consultant.account_number || '',
        ifsc_code: consultant.ifsc_code || '',
        account_holder_name: consultant.account_holder_name || '',
        destination_countries: parsedDestinationCountries || [],
        courses: parsedCourses || []
      })
    }
  }, [consultant])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'destination_countries') {
      const countryName = countries.find(c => c.id === parseInt(value))?.name;
      const updatedCountries = formData.destination_countries.includes(countryName)
        ? formData.destination_countries.filter(name => name !== countryName)
        : [...formData.destination_countries, countryName]
      setFormData({ ...formData, destination_countries: updatedCountries })
    } else if (type === 'checkbox' && name === 'courses') {
      const courseName = courses.find(c => c.id === parseInt(value))?.name;
      const updatedCourses = formData.courses.includes(courseName)
        ? formData.courses.filter(name => name !== courseName)
        : [...formData.courses, courseName]
      setFormData({ ...formData, courses: updatedCourses })
    } else if (type === 'checkbox' && name === 'languages') {
      const updatedLanguages = formData.languages.includes(value)
        ? formData.languages.filter(lang => lang !== value)
        : [...formData.languages, value]
      setFormData({ ...formData, languages: updatedLanguages })
    } else {
    setFormData({
      ...formData,
        [name]: value
    })
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData({ ...formData, [name]: files[0] })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const submitData = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (key === 'destination_countries' || key === 'courses' || key === 'languages') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key])
        }
      })

      const result = await updateProfile(submitData)
      
      if (result.success) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (consultant) {
      setFormData({
        agency_name: consultant.agency_name || '',
        contact_person: consultant.contact_person || '',
        email: consultant.email || '',
        phone: consultant.phone || '',
        website: consultant.website || '',
        profile_picture: consultant.profile_picture || null,
        location: consultant.location || '',
        experience_years: consultant.experience_years || '',
        total_placements: consultant.total_placements || '',
        success_rate: consultant.success_rate || '',
        response_time: consultant.response_time || '',
        languages: consultant.languages || [],
        fee_min: consultant.fee_min || '',
        fee_max: consultant.fee_max || '',
        fee_model: consultant.fee_model || 'fixed',
        description: consultant.description || '',
        gst_number: consultant.gst_number || '',
        bank_name: consultant.bank_name || '',
        account_number: consultant.account_number || '',
        ifsc_code: consultant.ifsc_code || '',
        account_holder_name: consultant.account_holder_name || '',
        destination_countries: consultant.destination_countries || [],
        courses: consultant.courses || []
      })
    }
    setIsEditing(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleViewLeadDetails = (lead) => {
    setSelectedLead(lead)
    setShowLeadModal(true)
  }

  if (!consultant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Consultant Dashboard - Global Education</title>
        <meta name="description" content="Manage your consultant profile and leads" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                {consultant?.profile_picture ? (
                  <img 
                    src={`/uploads/consultants/${consultant.profile_picture}`} 
                    alt="Profile" 
                    className="h-12 w-12 rounded-full object-cover mr-3"
                    onError={(e) => {
                      console.error('Profile picture failed to load:', e.target.src);
                      // Don't hide the image, just log the error
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{consultant.agency_name}</h1>
                  <p className="text-sm text-gray-600">Consultant Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consultant.status)}`}>
                  {getStatusIcon(consultant.status)}
                  <span className="ml-1 capitalize">{consultant.status}</span>
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {chatUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                        {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
                      <div className="px-4 py-3 border-b">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">Chat Notifications</p>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Close
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {chatUnreadCount > 0 ? `${chatUnreadCount} unread message${chatUnreadCount > 1 ? 's' : ''}` : 'All caught up'}
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y">
                        {chatNotifications.length === 0 ? (
                          <div className="px-4 py-6 text-sm text-gray-500 text-center">
                            No new messages
                          </div>
                        ) : (
                          chatNotifications.map((message) => {
                            const studentInfo = message.conversation?.student
                            return (
                              <button
                                key={message.id}
                                onClick={() => {
                                  setChatConversation(message.conversation)
                                  setIsChatOpen(true)
                                  setShowNotifications(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50"
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {studentInfo
                                    ? `${studentInfo.first_name || ''} ${studentInfo.last_name || ''}`.trim()
                                    : 'Student'}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                  {message.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'leads'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Leads
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="flex items-center px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="agency_name"
                            className="input-field"
                            value={formData.agency_name}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.agency_name || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="contact_person"
                            className="input-field"
                            value={formData.contact_person}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.contact_person || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.email || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            className="input-field"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.phone || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="website"
                            className="input-field"
                            value={formData.website}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">
                            {consultant?.website ? (
                              <a href={consultant.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                {consultant.website}
                              </a>
                            ) : 'Not provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                        {isEditing ? (
                          <div>
                            <input
                              type="file"
                              name="profile_picture"
                              className="input-field"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleFileChange}
                            />
                            {formData.profile_picture && (
                              <p className="text-sm text-gray-500 mt-1">
                                Current: {typeof formData.profile_picture === 'string' ? formData.profile_picture : 'New file selected'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            {consultant?.profile_picture ? (
                              <img 
                                src={`/uploads/consultants/${consultant.profile_picture}`} 
                                alt="Profile" 
                                className="h-16 w-16 rounded-full object-cover"
                                onError={(e) => {
                                  console.error('Profile picture failed to load:', e.target.src);
                                  // Don't hide the image, just log the error
                                }}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            className="input-field"
                            value={formData.location}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.location || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-900">Business Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="experience_years"
                            className="input-field"
                            value={formData.experience_years}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.experience_years || 'Not specified'} years</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Placements</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="total_placements"
                            className="input-field"
                            value={formData.total_placements}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.total_placements || 'Not specified'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Success Rate (%)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="success_rate"
                            className="input-field"
                            value={formData.success_rate}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.success_rate || 'Not specified'}%</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Time (Hours)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="response_time"
                            className="input-field"
                            value={formData.response_time}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{consultant?.response_time || 'Not specified'} hours</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                        {isEditing ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {languageOptions.map((language) => (
                              <label key={language} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="languages"
                                  value={language}
                                  checked={formData.languages.includes(language)}
                                  onChange={handleChange}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">{language}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900">
                            {consultant?.languages && Array.isArray(consultant.languages) && consultant.languages.length > 0 
                              ? consultant.languages.join(', ') 
                              : 'Not specified'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fee Structure */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Fee Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fee</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="fee_min"
                            className="input-field"
                            value={formData.fee_min}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">₹{consultant?.fee_min?.toLocaleString() || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Fee</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="fee_max"
                            className="input-field"
                            value={formData.fee_max}
                            onChange={handleChange}
                          />
                        ) : (
                          <p className="text-sm text-gray-900">₹{consultant?.fee_max?.toLocaleString() || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Model</label>
                        {isEditing ? (
                          <select
                            name="fee_model"
                            className="input-field"
                            value={formData.fee_model}
                            onChange={handleChange}
                          >
                            <option value="fixed">Fixed Fee</option>
                            <option value="percentage">Percentage</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900 capitalize">{consultant?.fee_model || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Description</h3>
                    {isEditing ? (
                      <textarea
                        name="description"
                        className="input-field"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{consultant?.description || 'No description provided'}</p>
                    )}
                  </div>

                  {/* Destination Countries */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Destination Countries</h3>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {countries.map((country) => (
                          <label key={country.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="destination_countries"
                              value={country.id}
                              checked={formData.destination_countries.includes(country.name)}
                              onChange={handleChange}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{country.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Parse JSON string if needed
                          let displayCountries = consultant?.destination_countries;
                          if (typeof consultant?.destination_countries === 'string') {
                            try {
                              displayCountries = JSON.parse(consultant.destination_countries);
                            } catch (error) {
                              console.warn('Failed to parse destination countries for display:', error);
                              displayCountries = [];
                            }
                          }
                          
                          console.log('=== DESTINATION COUNTRIES DISPLAY ===');
                          console.log('Raw data:', consultant?.destination_countries);
                          console.log('Parsed data:', displayCountries);
                          console.log('Is Array:', Array.isArray(displayCountries));
                          console.log('Length:', displayCountries?.length);
                          
                          return displayCountries && Array.isArray(displayCountries) && displayCountries.length > 0 ? (
                            displayCountries.map((countryName, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {countryName}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No destination countries selected</p>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Courses/Programs */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Courses/Programs</h3>
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => (
                          <label key={course.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="courses"
                              value={course.id}
                              checked={formData.courses.includes(course.name)}
                              onChange={handleChange}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">{course.name}</span>
                              {course.category && (
                                <span className="text-xs text-gray-500 ml-2">({course.category})</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Parse JSON string if needed
                          let displayCourses = consultant?.courses;
                          if (typeof consultant?.courses === 'string') {
                            try {
                              displayCourses = JSON.parse(consultant.courses);
                            } catch (error) {
                              console.warn('Failed to parse courses for display:', error);
                              displayCourses = [];
                            }
                          }
                          
                          console.log('=== COURSES DISPLAY ===');
                          console.log('Raw data:', consultant?.courses);
                          console.log('Parsed data:', displayCourses);
                          console.log('Is Array:', Array.isArray(displayCourses));
                          console.log('Length:', displayCourses?.length);
                          
                          return displayCourses && Array.isArray(displayCourses) && displayCourses.length > 0 ? (
                            displayCourses.map((courseName, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {courseName}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No courses selected</p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Status Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultant.status)} mb-2`}>
                    {getStatusIcon(consultant.status)}
                    <span className="ml-1 capitalize">{consultant.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {consultant.status === 'pending' && 'Your application is under review. We will notify you within 24-48 hours.'}
                    {consultant.status === 'approved' && 'Congratulations! Your application has been approved. You can now receive student leads.'}
                    {consultant.status === 'rejected' && 'Your application has been rejected. Please contact support for more information.'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="text-sm font-medium">{consultant?.experience_years || '0'} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Placements</span>
                    <span className="text-sm font-medium">{consultant?.total_placements || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium">{consultant?.success_rate || '0'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{consultant?.response_time || consultant?.response_time_hours || '24'}h</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                <div className="space-y-2">
                  {consultant?.business_license && (
                    <a 
                      href={`http://localhost:5000/uploads/consultants/${consultant.business_license}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Business License
                    </a>
                  )}
                  {consultant?.gst_certificate && (
                    <a 
                      href={`http://localhost:5000/uploads/consultants/${consultant.gst_certificate}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      GST Certificate
                    </a>
                  )}
                  {consultant?.bank_statement && (
                    <a 
                      href={`http://localhost:5000/uploads/consultants/${consultant.bank_statement}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Bank Statement
                    </a>
                  )}
                  {consultant?.identity_proof && (
                    <a 
                      href={`http://localhost:5000/uploads/consultants/${consultant.identity_proof}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Identity Proof
                    </a>
                  )}
                  {consultant?.address_proof && (
                    <a 
                      href={`http://localhost:5000/uploads/consultants/${consultant.address_proof}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary-600 hover:text-primary-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Address Proof
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Leads</h2>
                <button
                  onClick={fetchLeads}
                  disabled={leadsLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {leadsLoading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>

              {leadsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading leads...</p>
                </div>
              ) : leadsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Leads</h3>
                  <p className="text-gray-600 mb-4">{leadsError}</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                    <p className="text-sm text-red-800">
                      <strong>Debug Info:</strong> Please check:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                      <li>Is the backend server running on port 5000?</li>
                      <li>Check the backend console for detailed error messages</li>
                      <li>Verify you're logged in as a consultant</li>
                      <li>Check browser console for more details</li>
                    </ul>
                  </div>
                  <button
                    onClick={fetchLeads}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Retry
                  </button>
                </div>
              ) : leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {lead.student ? `${lead.student.first_name} ${lead.student.last_name}` : 'Student'}
                          </h3>
                          <p className="text-gray-600">
                            {lead.course_preference} in {lead.country_preference}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lead.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'completed' ? 'bg-green-100 text-green-800' :
                          lead.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.status === 'assigned' ? 'Assigned' :
                           lead.status === 'in_progress' ? 'In Progress' :
                           lead.status === 'completed' ? 'Completed' :
                           lead.status === 'cancelled' ? 'Cancelled' :
                           'Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Budget:</span>
                          <div className="font-medium">
                            ₹{lead.budget_min?.toLocaleString() || '0'} - ₹{lead.budget_max?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Timeline:</span>
                          <div className="font-medium">{lead.timeline || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Contact:</span>
                          <div className="font-medium">{lead.student?.email || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Current Education:</span>
                          <div className="font-medium">{lead.current_education || 'Not provided'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Work Experience:</span>
                          <div className="font-medium">{lead.work_experience || 'Not provided'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">English Proficiency:</span>
                          <div className="font-medium">{lead.english_proficiency || 'Not provided'}</div>
                        </div>
                      </div>

                      {lead.additional_requirements && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Additional Requirements:</span>
                          <p className="text-sm text-gray-900 mt-1">{lead.additional_requirements}</p>
                        </div>
                      )}

                      {lead.student && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm">
                            {(lead.student.mobile || lead.student.phone) && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{lead.student.mobile || lead.student.phone}</span>
                              </div>
                            )}
                            {lead.student.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">{lead.student.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleViewLeadDetails(lead)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleChatLead(lead)}
                          disabled={chatLeadLoadingId === lead.id}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {chatLeadLoadingId === lead.id ? 'Opening...' : 'Chat'}
                        </button>
                        <button
                          onClick={() => handleCallLead(lead)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                  <p className="text-gray-600">You'll receive leads based on your expertise and location.</p>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lead Details</h2>
                <button
                  onClick={() => {
                    setShowLeadModal(false)
                    setSelectedLead(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <div className="font-medium">
                          {selectedLead.student ? `${selectedLead.student.first_name} ${selectedLead.student.last_name}` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <div className="font-medium">{selectedLead.student?.email || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <div className="font-medium">{selectedLead.student?.mobile || selectedLead.student?.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <div className="font-medium">{selectedLead.student?.location || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            selectedLead.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            selectedLead.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            selectedLead.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedLead.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedLead.status === 'assigned' ? 'Assigned' :
                             selectedLead.status === 'in_progress' ? 'In Progress' :
                             selectedLead.status === 'completed' ? 'Completed' :
                             selectedLead.status === 'cancelled' ? 'Cancelled' :
                             'Pending'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Country:</span>
                        <div className="font-medium">{selectedLead.country_preference || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Course:</span>
                        <div className="font-medium">{selectedLead.course_preference || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Timeline:</span>
                        <div className="font-medium">{selectedLead.timeline || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Budget:</span>
                        <div className="font-medium">
                          ₹{selectedLead.budget_min?.toLocaleString() || '0'} - ₹{selectedLead.budget_max?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Current Education:</span>
                    <div className="font-medium">{selectedLead.current_education || 'Not provided'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Work Experience:</span>
                    <div className="font-medium">{selectedLead.work_experience || 'Not provided'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">English Proficiency:</span>
                    <div className="font-medium">{selectedLead.english_proficiency || 'Not provided'}</div>
                  </div>
                </div>

                {selectedLead.additional_requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Requirements</h3>
                    <p className="text-gray-700">{selectedLead.additional_requirements}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
              )}
            </div>
          )}

          {/* Profile Tab - same as overview but can be customized */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center text-primary-600 hover:text-primary-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Rest of profile form content - you can copy from overview */}
                </div>
              </div>
              {/* Sidebar - same as overview */}
            </div>
          )}
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen && !!chatConversation}
        onClose={() => {
          setIsChatOpen(false)
          setChatConversation(null)
        }}
        conversation={chatConversation}
        userType="consultant"
        authToken={consultantToken}
        onConversationUpdated={refreshNotifications}
      />
    </>
  )
}

export default ConsultantDashboard
