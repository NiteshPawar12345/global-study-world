import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, AlertCircle, MessageCircle, Users, DollarSign, TrendingUp, FileText, Settings, Shield, Eye, X, Download, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAdminAuth } from '../context/AdminAuthContext'
import toast from 'react-hot-toast'
import { getApiBase } from '../utils/apiConfig'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedConsultant, setSelectedConsultant] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [consultantFilter, setConsultantFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [selectedConsultantId, setSelectedConsultantId] = useState('')
  const { admin, logout } = useAdminAuth()

  // Fetch admin data from API
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return response.json()
    },
    retry: false
  })

  const { data: consultantsData, isLoading: consultantsLoading, error: consultantsError } = useQuery({
    queryKey: ['admin-consultants'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/consultants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch consultants')
      return response.json()
    },
    retry: false
  })

  const { data: inquiriesData, isLoading: inquiriesLoading, error: inquiriesError } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/inquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      return response.json()
    },
    retry: false
  })

  const overview = overviewData?.data || {}
  const consultants = consultantsData?.data?.consultants || []
  const inquiries = inquiriesData?.data?.inquiries || []

  // Filter consultants based on selected filter
  const filteredConsultants = consultantFilter === 'all' 
    ? consultants 
    : consultants.filter(consultant => consultant.status === consultantFilter)

  // Show loading state if any data is loading
  if (overviewLoading || consultantsLoading || inquiriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state if there are errors
  if (overviewError || consultantsError || inquiriesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {overviewError?.message || consultantsError?.message || inquiriesError?.message}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    window.location.href = '/admin/login'
  }

  const handleReviewConsultant = async (consultantId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/consultants/${consultantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch consultant details')
      const data = await response.json()
      
      setSelectedConsultant(data.data.consultant)
      setShowReviewModal(true)
    } catch (error) {
      toast.error('Failed to load consultant details')
    }
  }

  const handleViewInquiry = async (inquiryId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/inquiries/${inquiryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch inquiry details')
      const data = await response.json()
      
      setSelectedInquiry(data.data.inquiry)
      setShowInquiryModal(true)
    } catch (error) {
      toast.error('Failed to load inquiry details')
    }
  }

  const handleAssignConsultant = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowAssignModal(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedConsultantId) {
      toast.error('Please select a consultant')
      return
    }

    setAssignLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/inquiries/${selectedInquiry.id}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consultant_id: parseInt(selectedConsultantId) })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to assign consultant')
      }
      
      toast.success('Consultant assigned successfully')
      setShowAssignModal(false)
      setSelectedInquiry(null)
      setSelectedConsultantId('')
      
      // Refresh inquiries data
      window.location.reload()
    } catch (error) {
      toast.error(error.message || 'Failed to assign consultant')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleUpdateStatus = async (consultantId, status) => {
    setReviewLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/consultants/${consultantId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error('Failed to update consultant status')
      
      toast.success(`Consultant ${status} successfully`)
      setShowReviewModal(false)
      setSelectedConsultant(null)
      
      // Refresh the consultants data
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update consultant status')
    } finally {
      setReviewLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <X className="h-4 w-4" />
      case 'suspended':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'suspended':
        return 'Suspended'
      default:
        return status
    }
  }

  // Helper functions for inquiry status
  const getInquiryStatusColor = (status) => {
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

  const formatInquiryStatus = (status) => {
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

  const stats = [
    {
      title: 'Total Consultants',
      value: consultants.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Approvals',
      value: consultants.filter(c => c.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Inquiries',
      value: inquiries.length,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Revenue',
      value: overview.totalRevenue ? `₹${overview.totalRevenue.toLocaleString()}` : '₹0',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Global Education</title>
        <meta name="description" content="Admin dashboard for managing consultants, leads, and revenue." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Welcome back, {admin?.username || 'Admin'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">{admin?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('consultants')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                      activeTab === 'consultants' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>View All Consultants</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('inquiries')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                      activeTab === 'inquiries' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>View All Inquiries</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Dashboard Overview</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('revenue')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                      activeTab === 'revenue' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Revenue Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'overview'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('consultants')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'consultants'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Consultants
                    </button>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'inquiries'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Inquiries
                    </button>
                    <button
                      onClick={() => setActiveTab('revenue')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'revenue'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Revenue
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Platform Overview</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                          <div className="space-y-3">
                            {inquiries.slice(0, 5).map((inquiry) => (
                              <div key={inquiry.id} className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MessageCircle className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    New inquiry from {inquiry.student?.name || 'Student'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(inquiry.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h3>
                          <div className="space-y-3">
                            {consultants.filter(c => c.status === 'pending').slice(0, 5).map((consultant) => (
                              <div key={consultant.id} className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {consultant.agency_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Pending since {new Date(consultant.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'consultants' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Consultant Management</h2>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Export Consultants
                        </button>
                      </div>

                      {/* Filter Options */}
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setConsultantFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            consultantFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All ({consultants.length})
                        </button>
                        <button
                          onClick={() => setConsultantFilter('pending')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            consultantFilter === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Pending ({consultants.filter(c => c.status === 'pending').length})
                        </button>
                        <button
                          onClick={() => setConsultantFilter('approved')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            consultantFilter === 'approved'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Approved ({consultants.filter(c => c.status === 'approved').length})
                        </button>
                        <button
                          onClick={() => setConsultantFilter('rejected')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            consultantFilter === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rejected ({consultants.filter(c => c.status === 'rejected').length})
                        </button>
                      </div>

                      {consultantsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-6 animate-pulse">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredConsultants.length === 0 ? (
                            <div className="text-center py-12">
                              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
                              <p className="text-gray-600">
                                {consultantFilter === 'all' 
                                  ? 'No consultants have registered yet.' 
                                  : `No consultants with ${consultantFilter} status.`
                                }
                              </p>
                            </div>
                          ) : (
                            filteredConsultants.map((consultant) => (
                            <div key={consultant.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {consultant.agency_name}
                                  </h3>
                                  <p className="text-gray-600">
                                    {consultant.contact_person} • {consultant.location}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(consultant.status)}`}>
                                  {getStatusIcon(consultant.status)}
                                  <span>{formatStatus(consultant.status)}</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <span className="text-sm text-gray-600">Experience:</span>
                                  <div className="font-medium">{consultant.experience_years} years</div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Placements:</span>
                                  <div className="font-medium">{consultant.total_placements}+</div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Fee Range:</span>
                                  <div className="font-medium">
                                    ₹{consultant.fee_min?.toLocaleString()} - ₹{consultant.fee_max?.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-3">
                                <button 
                                  onClick={() => handleReviewConsultant(consultant.id)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </button>
                                {consultant.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateStatus(consultant.id, 'approved')}
                                      disabled={reviewLoading}
                                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateStatus(consultant.id, 'rejected')}
                                      disabled={reviewLoading}
                                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'inquiries' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">All Inquiries</h2>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Export Inquiries
                        </button>
                      </div>

                      {inquiriesLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-6 animate-pulse">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {inquiry.student?.name || 'Student'}
                                  </h3>
                                  <p className="text-gray-600">
                                    {inquiry.course_preference} in {inquiry.country_preference}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getInquiryStatusColor(inquiry.status)}`}>
                                  {getStatusIcon(inquiry.status)}
                                  <span>{formatInquiryStatus(inquiry.status)}</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <span className="text-sm text-gray-600">Budget:</span>
                                  <div className="font-medium">
                                    ₹{inquiry.budget_min?.toLocaleString()} - ₹{inquiry.budget_max?.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Timeline:</span>
                                  <div className="font-medium">{inquiry.timeline}</div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Contact:</span>
                                  <div className="font-medium">{inquiry.student?.email || 'N/A'}</div>
                                </div>
                              </div>

                              <div className="flex space-x-3">
                                <button 
                                  onClick={() => handleViewInquiry(inquiry.id)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                {!inquiry.consultant_id && (
                                  <button 
                                    onClick={() => handleAssignConsultant(inquiry)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                    Assign Consultant
                                  </button>
                                )}
                                {inquiry.consultant_id && (
                                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                                    Assigned to {inquiry.consultant?.agency_name || 'Consultant'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'revenue' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Revenue & Analytics</h2>
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Analytics</h3>
                        <p className="text-gray-600">Track platform revenue, commissions, and financial performance.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Consultant Review - {selectedConsultant.agency_name}
                </h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.agency_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.contact_person}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.phone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedConsultant.website ? (
                        <a href={selectedConsultant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedConsultant.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.location}</p>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.experience_years} years</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fee Range</label>
                    <p className="mt-1 text-sm text-gray-900">
                      ₹{selectedConsultant.fee_min?.toLocaleString()} - ₹{selectedConsultant.fee_max?.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fee Model</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.fee_model}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedConsultant.gst_number || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Languages</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedConsultant.languages ? selectedConsultant.languages.join(', ') : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination Countries</label>
                    <div className="mt-1">
                      {selectedConsultant.destination_countries && selectedConsultant.destination_countries.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedConsultant.destination_countries.map((country, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {country}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No destination countries selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Courses/Programs</label>
                    <div className="mt-1">
                      {selectedConsultant.courses && selectedConsultant.courses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedConsultant.courses.map((course, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {course}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No courses selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NDA Accepted</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedConsultant.nda_accepted ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedConsultant.description || 'No description provided'}
                </p>
              </div>

              {/* Documents */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedConsultant.business_license && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">Business License</h4>
                      <a 
                        href={`${getApiBase()}/uploads/consultants/${selectedConsultant.business_license}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  
                  {selectedConsultant.gst_certificate && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">GST Certificate</h4>
                      <a 
                        href={`${getApiBase()}/uploads/consultants/${selectedConsultant.gst_certificate}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  
                  {selectedConsultant.identity_proof && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">Identity Proof</h4>
                      <a 
                        href={`${getApiBase()}/uploads/consultants/${selectedConsultant.identity_proof}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  
                  {selectedConsultant.address_proof && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">Address Proof</h4>
                      <a 
                        href={`${getApiBase()}/uploads/consultants/${selectedConsultant.address_proof}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  
                  {selectedConsultant.bank_statement && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">Bank Statement</h4>
                      <a 
                        href={`${getApiBase()}/uploads/consultants/${selectedConsultant.bank_statement}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </button>
                
                {selectedConsultant.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsultant.id, 'rejected')}
                      disabled={reviewLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center"
                    >
                      {reviewLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsultant.id, 'approved')}
                      disabled={reviewLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center"
                    >
                      {reviewLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Details Modal */}
      {showInquiryModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Inquiry Details</h2>
                <button
                  onClick={() => {
                    setShowInquiryModal(false)
                    setSelectedInquiry(null)
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
                          {selectedInquiry.student ? `${selectedInquiry.student.first_name} ${selectedInquiry.student.last_name}` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <div className="font-medium">{selectedInquiry.student?.email || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <div className="font-medium">{selectedInquiry.student?.mobile || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs ${getInquiryStatusColor(selectedInquiry.status)}`}>
                            {formatInquiryStatus(selectedInquiry.status)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Country:</span>
                        <div className="font-medium">{selectedInquiry.country_preference || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Course:</span>
                        <div className="font-medium">{selectedInquiry.course_preference || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Timeline:</span>
                        <div className="font-medium">{selectedInquiry.timeline || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Budget:</span>
                        <div className="font-medium">
                          ₹{selectedInquiry.budget_min?.toLocaleString() || '0'} - ₹{selectedInquiry.budget_max?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedInquiry.additional_requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Requirements</h3>
                    <p className="text-gray-700">{selectedInquiry.additional_requirements}</p>
                  </div>
                )}

                {selectedInquiry.consultant && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Consultant</h3>
                    <div className="border rounded-lg p-4">
                      <div className="font-medium">{selectedInquiry.consultant.agency_name}</div>
                      <div className="text-sm text-gray-600">{selectedInquiry.consultant.contact_person}</div>
                      <div className="text-sm text-gray-600">{selectedInquiry.consultant.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Consultant Modal */}
      {showAssignModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Assign Consultant</h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedInquiry(null)
                    setSelectedConsultantId('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Consultant
                  </label>
                  <select
                    value={selectedConsultantId}
                    onChange={(e) => setSelectedConsultantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select a consultant --</option>
                    {consultants.filter(c => c.status === 'approved').map((consultant) => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.agency_name} - {consultant.contact_person}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAssignModal(false)
                      setSelectedInquiry(null)
                      setSelectedConsultantId('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAssign}
                    disabled={assignLoading || !selectedConsultantId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Consultant'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminDashboard
