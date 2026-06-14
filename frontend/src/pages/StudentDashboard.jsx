import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useStudentAuth } from '../context/StudentAuthContext'
import { User, Mail, Phone, Calendar, GraduationCap, Globe, DollarSign, Edit3, Save, X, BarChart3, MessageCircle, Users, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react'
import InquiryForm from '../components/InquiryForm'
import ConsultantComparison from './ConsultantComparison'
import { useQuery } from '@tanstack/react-query'
import { getApiBase } from '../utils/apiConfig'

const StudentDashboard = () => {
  const { student, updateProfile, logout } = useStudentAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [formData, setFormData] = useState({
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    date_of_birth: student?.date_of_birth || '',
    gender: student?.gender || '',
    current_education: student?.current_education || '',
    budget_range: student?.budget_range || '',
    preferred_intake: student?.preferred_intake || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewForm, setReviewForm] = useState({
    inquiry_id: '',
    rating: 5,
    title: '',
    comment: ''
  })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewAlert, setReviewAlert] = useState({ type: '', message: '' })

  // Fetch student inquiries
  const { data: inquiriesData, isLoading: inquiriesLoading, refetch: refetchInquiries } = useQuery({
    queryKey: ['student-inquiries'],
    queryFn: async () => {
      const token = localStorage.getItem('studentToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/students/inquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      return response.json()
    }
  })

  const inquiries = inquiriesData?.data?.inquiries || []
  const reviewableInquiries = inquiries.filter(
    (inquiry) => inquiry.consultant && inquiry.status === 'completed'
  )

  const parseListField = (field) => {
    if (!field) return []
    if (Array.isArray(field)) return field.filter(Boolean)

    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean)
        }
      } catch (error) {
        // Not JSON, fall back to comma-separated parsing
      }

      return field
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    }

    return []
  }

  const interestedCountries = parseListField(student?.interested_countries)
  const interestedCourses = parseListField(student?.interested_courses)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'assigned':
        return <MessageCircle className="h-4 w-4" />
      case 'in_progress':
        return <MessageCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'assigned':
        return 'Assigned'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: student?.first_name || '',
      last_name: student?.last_name || '',
      date_of_birth: student?.date_of_birth || '',
      gender: student?.gender || '',
      current_education: student?.current_education || '',
      budget_range: student?.budget_range || '',
      preferred_intake: student?.preferred_intake || ''
    })
    setIsEditing(false)
    setMessage('')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewAlert({ type: '', message: '' })

    const selectedInquiry = reviewableInquiries.find(
      (inquiry) => inquiry.id === parseInt(reviewForm.inquiry_id, 10)
    )

    if (!selectedInquiry) {
      setReviewAlert({
        type: 'error',
        message: 'Please select a consultant you have completed an inquiry with.'
      })
      return
    }

    setReviewSubmitting(true)
    try {
      const token = localStorage.getItem('studentToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consultant_id: selectedInquiry.consultant.id,
          inquiry_id: selectedInquiry.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review')
      }

      setReviewAlert({ type: 'success', message: data.message || 'Review submitted successfully!' })
      setReviewForm({ inquiry_id: '', rating: 5, title: '', comment: '' })
    } catch (error) {
      setReviewAlert({
        type: 'error',
        message: error.message || 'Unable to submit review. Please try again.'
      })
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Student Dashboard | Global Education</title>
        <meta name="description" content="Manage your student profile and connect with study abroad consultants." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
          {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {student.first_name}!
                  </h1>
                  <p className="text-sm text-gray-600">Student Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
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
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="flex flex-wrap">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'inquiries', label: 'My Inquiries' },
                { id: 'reviews', label: 'Write Review' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
              <>
              {/* Profile Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                        onClick={handleCancel}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                    </button>
                    </div>
                  )}
                </div>

                {message && (
                  <div className={`mb-4 p-3 rounded-md text-sm ${
                    message.includes('success') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        className="input-field"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-gray-900">{student.first_name}</p>
                    )}
                      </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        className="input-field"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-gray-900">{student.last_name}</p>
                    )}
                                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900">{student.email}</p>
                              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Mobile
                    </label>
                    <p className="text-gray-900">{student.mobile}</p>
                              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="date_of_birth"
                        className="input-field"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="text-gray-900">{student.date_of_birth || 'Not specified'}</p>
                    )}
                            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        name="gender"
                        className="input-field"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{student.gender || 'Not specified'}</p>
                    )}
                        </div>

                                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap className="inline h-4 w-4 mr-1" />
                      Current Education
                    </label>
                    {isEditing ? (
                      <select
                        name="current_education"
                        className="input-field"
                        value={formData.current_education}
                        onChange={handleChange}
                      >
                        <option value="">Select Education Level</option>
                        <option value="high_school">High School</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="diploma">Diploma</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{student.current_education?.replace('_', ' ') || 'Not specified'}</p>
                    )}
                                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Budget Range
                    </label>
                    {isEditing ? (
                      <select
                        name="budget_range"
                        className="input-field"
                        value={formData.budget_range}
                        onChange={handleChange}
                      >
                        <option value="">Select Budget</option>
                        <option value="under-10l">Under ₹10 Lakhs</option>
                        <option value="10-20l">₹10-20 Lakhs</option>
                        <option value="20-30l">₹20-30 Lakhs</option>
                        <option value="30-50l">₹30-50 Lakhs</option>
                        <option value="above-50l">Above ₹50 Lakhs</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{student.budget_range?.replace('-', ' - ').replace('l', ' Lakhs') || 'Not specified'}</p>
                    )}
                              </div>

                                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Preferred Intake
                    </label>
                    {isEditing ? (
                      <select
                        name="preferred_intake"
                        className="input-field"
                        value={formData.preferred_intake}
                        onChange={handleChange}
                      >
                        <option value="">Select Intake</option>
                        <option value="fall-2024">Fall 2024</option>
                        <option value="spring-2025">Spring 2025</option>
                        <option value="fall-2025">Fall 2025</option>
                        <option value="spring-2026">Spring 2026</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{student.preferred_intake?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}</p>
                    )}
                  </div>
                                  </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/search"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Find Consultants</h3>
                        <p className="text-sm text-gray-600">Browse study abroad consultants</p>
                      </div>
                    </div>
                  </a>
                  
                  <button
                    onClick={() => setShowComparison(true)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Compare Consultants</h3>
                        <p className="text-sm text-gray-600">Compare fees and services</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowInquiryForm(true)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Send Inquiry</h3>
                        <p className="text-sm text-gray-600">Contact consultants directly</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              </>
              )}

              {activeTab === 'inquiries' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">My Inquiries</h2>
                      <p className="text-sm text-gray-600">Track all your submissions and their statuses</p>
                    </div>
                    <button
                      onClick={() => setShowInquiryForm(true)}
                      className="btn-primary"
                    >
                      New Inquiry
                    </button>
                  </div>
                  {inquiriesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading inquiries...</p>
                    </div>
                  ) : inquiries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Inquiry</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Requested Consultant</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assigned Consultant</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inquiries.map((inquiry) => (
                            <tr key={inquiry.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">{inquiry.course_preference || 'N/A'}</div>
                                <div className="text-gray-500">{inquiry.country_preference || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-3">
                                {inquiry.requestedConsultant
                                  ? inquiry.requestedConsultant.agency_name
                                  : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                {inquiry.consultant
                                  ? inquiry.consultant.agency_name
                                  : 'Not assigned'}
                              </td>
                              <td className="px-4 py-3">
                                ₹{inquiry.budget_min?.toLocaleString() || '0'} - ₹{inquiry.budget_max?.toLocaleString() || '0'}
                              </td>
                              <td className="px-4 py-3">
                                {inquiry.timeline?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-max ${getStatusColor(inquiry.status)}`}>
                                  {getStatusIcon(inquiry.status)}
                                  <span>{formatStatus(inquiry.status)}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {new Date(inquiry.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                      <p className="text-gray-600 mb-4">Start by sending an inquiry to connect with consultants.</p>
                      <button
                        onClick={() => setShowInquiryForm(true)}
                        className="btn-primary"
                      >
                        Send Your First Inquiry
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
                    <p className="text-sm text-gray-600">
                      Reflect on consultants who helped you cross the finish line.
                    </p>
                  </div>

                  {reviewAlert.message && (
                    <div
                      className={`mb-4 p-3 rounded-md text-sm ${
                        reviewAlert.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {reviewAlert.message}
                    </div>
                  )}

                  {reviewableInquiries.length === 0 ? (
                    <div className="text-center py-10">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed consultations yet</h3>
                      <p className="text-gray-600">
                        Finish an inquiry with a consultant to unlock reviews and inspire future students.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Consultant
                        </label>
                        <select
                          className="input-field"
                          value={reviewForm.inquiry_id}
                          onChange={(e) => setReviewForm({ ...reviewForm, inquiry_id: e.target.value })}
                          required
                        >
                          <option value="">Choose a consultant</option>
                          {reviewableInquiries.map((inquiry) => (
                            <option key={inquiry.id} value={inquiry.id}>
                              {inquiry.consultant.agency_name} — {inquiry.course_preference} ({new Date(inquiry.created_at).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-7 w-7 ${
                                  reviewForm.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-sm text-gray-600">{reviewForm.rating} / 5</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title (optional)
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g., Transparent, friendly, and fast!"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          maxLength={120}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe your experience
                        </label>
                        <textarea
                          className="input-field"
                          rows="4"
                          placeholder="Share how the consultant assisted you with shortlisting, SOPs, visa, or scholarships..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="btn-primary flex items-center space-x-2 disabled:opacity-60"
                        >
                          {reviewSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <span>Submit Review</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email Verified:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.email_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.email_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mobile Verified:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.mobile_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.mobile_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="text-gray-900">
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {student.last_login && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="text-gray-900">
                        {new Date(student.last_login).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                              </div>
                            </div>

              {/* Study Preferences */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Preferences</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Interested Countries:</span>
                    <div className="mt-1">
                      {interestedCountries.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {interestedCountries.map((country, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {country}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Not specified</p>
                      )}
                    </div>
                      </div>
                  <div>
                    <span className="text-gray-600">Interested Courses:</span>
                    <div className="mt-1">
                      {interestedCourses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {interestedCourses.map((course, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              {course}
                            </span>
                          ))}
                    </div>
                      ) : (
                        <p className="text-gray-500">Not specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background with Animation */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm animate-modal-backdrop"
            onClick={() => setShowInquiryForm(false)}
          />
          
          {/* Modal Content with Animation */}
          <div className="relative bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-modal-content">
            <div className="flex justify-between items-center p-4 border-b bg-primary-50">
              <h2 className="text-xl font-semibold text-gray-900">Send Inquiry</h2>
              <button
                onClick={() => setShowInquiryForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <InquiryForm
                onClose={() => {
                  setShowInquiryForm(false)
                  refetchInquiries()
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Consultant Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Compare Consultants</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <ConsultantComparison />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentDashboard