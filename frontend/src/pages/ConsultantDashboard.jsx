import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, AlertCircle, MessageCircle, Users, DollarSign, TrendingUp, FileText, Settings, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getApiBase } from '../utils/apiConfig'

const ConsultantDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Fetch consultant data and leads from API
  const { data: consultantData, isLoading: consultantLoading } = useQuery({
    queryKey: ['consultant-profile'],
    queryFn: async () => {
      const token = localStorage.getItem('consultantToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultants/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch consultant profile')
      return response.json()
    }
  })

  // Check if token exists before setting up query
  const token = localStorage.getItem('consultantToken')
  console.log('🔑 Token check:', token ? `Token exists (${token.substring(0, 20)}...)` : 'NO TOKEN FOUND')

  const { data: leadsData, isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useQuery({
    queryKey: ['consultant-leads'],
    queryFn: async () => {
      console.log('🚀 QUERY FUNCTION STARTED - Fetching consultant leads...')
      const token = localStorage.getItem('consultantToken')
      if (!token) {
        console.error('❌ No token found in queryFn')
        throw new Error('No authentication token found')
      }
      console.log('🔍 Fetching consultant leads with token:', token.substring(0, 20) + '...')
      const apiBase = getApiBase()
      console.log('🌐 Making request to:', `${apiBase}/api/inquiries/consultant`)
      
      const response = await fetch(`${apiBase}/api/inquiries/consultant`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('📡 Response status:', response.status, response.statusText)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.message || 'Failed to fetch leads')
      }
      const data = await response.json()
      console.log('✅ Consultant leads API response:', data)
      console.log('📊 Data structure:', {
        success: data.success,
        hasData: !!data.data,
        hasInquiries: !!data.data?.inquiries,
        inquiriesCount: data.data?.inquiries?.length || 0,
        inquiries: data.data?.inquiries
      })
      return data
    },
    enabled: !!token, // Only run if token exists
    retry: 1,
    refetchOnWindowFocus: true
  })

  const queryClient = useQueryClient()
  const consultant = consultantData?.data?.consultant || {}
  const leads = leadsData?.data?.inquiries || []

  // Comprehensive debugging for leads
  useEffect(() => {
    console.log('=== CONSULTANT DASHBOARD LEADS DEBUG ===')
    console.log('1. Token exists:', !!token)
    console.log('2. leadsLoading:', leadsLoading)
    console.log('3. leadsError:', leadsError)
    console.log('4. leadsData:', leadsData)
    console.log('5. leadsData?.success:', leadsData?.success)
    console.log('6. leadsData?.data:', leadsData?.data)
    console.log('7. leadsData?.data?.inquiries:', leadsData?.data?.inquiries)
    console.log('8. leadsData?.data?.inquiries type:', typeof leadsData?.data?.inquiries)
    console.log('9. leadsData?.data?.inquiries isArray:', Array.isArray(leadsData?.data?.inquiries))
    console.log('10. leadsData?.data?.inquiries?.length:', leadsData?.data?.inquiries?.length)
    console.log('11. leads (extracted):', leads)
    console.log('12. leads.length:', leads.length)
    if (leads && leads.length > 0) {
      console.log('13. First lead:', JSON.stringify(leads[0], null, 2))
    } else if (!leadsLoading && !leadsError && leads.length === 0) {
      console.log('⚠️ No leads found - query completed but array is empty')
    }
    console.log('=== END LEADS DEBUG ===')
  }, [leadsData, leadsLoading, leadsError, leads, token])

  const handleUpdateStatus = (lead) => {
    setSelectedLead(lead)
    setNewStatus(lead.status)
    setShowStatusModal(true)
  }

  const handleConfirmStatusUpdate = async () => {
    if (!selectedLead || !newStatus) return

    setStatusUpdateLoading(true)
    try {
      const token = localStorage.getItem('consultantToken')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/inquiries/${selectedLead.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update status')
      }

      toast.success('Status updated successfully')
      setShowStatusModal(false)
      setSelectedLead(null)
      
      // Refresh inquiries
      queryClient.invalidateQueries(['consultant-leads'])
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

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
        return 'New Lead'
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
      title: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Leads',
      value: leads.filter(lead => ['assigned', 'in_progress'].includes(lead.status)).length,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Completed',
      value: leads.filter(lead => lead.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Success Rate',
      value: consultant.success_rate ? `${consultant.success_rate}%` : '0%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Consultant Dashboard - Global Education</title>
        <meta name="description" content="Manage your consultant profile, leads, and invoices." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-4">
              {consultant?.profile_picture ? (
                <img 
                  src={`/uploads/consultants/${consultant.profile_picture}`} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Profile picture failed to load:', e.target.src);
                    // Don't hide the image, just log the error
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-500" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {consultant.contact_person || 'Consultant'}!
                </h1>
                <p className="text-gray-600">
                  {consultant.agency_name || 'Manage your leads and profile'}
                </p>
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
                <h3 className="text-lg font-semibold mb-4">Profile</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{consultant.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{consultant.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{consultant.location || 'N/A'}</span>
                  </div>
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
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'invoices'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Invoices
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Recent Activity</h2>
                      {leadsLoading && (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading leads...</p>
                        </div>
                      )}
                      {leadsError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-700 text-sm">Error: {leadsError.message}</p>
                          <button 
                            onClick={() => refetchLeads()}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                      <div className="space-y-4">
                        {!leadsLoading && leads.length > 0 && leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-500" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                New lead from {lead.student ? `${lead.student.first_name} ${lead.student.last_name}` : 'Student'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {lead.course_preference} in {lead.country_preference}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                {formatStatus(lead.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {!leadsLoading && !leadsError && leads.length === 0 && (
                          <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                            <p className="text-gray-600 mb-4">You'll see your assigned leads here once they start coming in.</p>
                            <button 
                              onClick={() => refetchLeads()}
                              className="btn-primary"
                            >
                              Refresh
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'leads' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Your Leads</h2>
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => {
                              console.log('🔄 Manual refresh triggered')
                              refetchLeads()
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={leadsLoading}
                          >
                            {leadsLoading ? 'Refreshing...' : '🔄 Refresh'}
                          </button>
                          <button className="btn-primary">
                            Export Leads
                          </button>
                        </div>
                      </div>
                      {!leadsLoading && !leadsError && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                          <strong>Debug Info:</strong> Found {leads.length} lead(s). Query status: {leadsData ? 'Success' : 'No data'}
                        </div>
                      )}

                      {leadsLoading ? (
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
                      ) : leadsError ? (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Leads</h3>
                          <p className="text-gray-600 mb-4">{leadsError.message || 'Failed to load leads'}</p>
                          <button 
                            onClick={() => queryClient.invalidateQueries(['consultant-leads'])}
                            className="btn-primary"
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
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(lead.status)}`}>
                                  {getStatusIcon(lead.status)}
                                  <span>{formatStatus(lead.status)}</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <span className="text-sm text-gray-600">Budget:</span>
                                  <div className="font-medium">
                                    ₹{lead.budget_min?.toLocaleString()} - ₹{lead.budget_max?.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Timeline:</span>
                                  <div className="font-medium">{lead.timeline}</div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">Contact:</span>
                                  <div className="font-medium">{lead.student?.email || 'N/A'}</div>
                                </div>
                              </div>

                              <div className="flex space-x-3">
                                <a 
                                  href={`mailto:${lead.student?.email}`}
                                  className="btn-primary"
                                >
                                  Contact Student
                                </a>
                                <button 
                                  onClick={() => handleUpdateStatus(lead)}
                                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  Update Status
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                          <p className="text-gray-600">You'll receive leads based on your expertise and location.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Profile Settings</h2>
                      <div className="text-center py-12">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
                        <p className="text-gray-600">Update your profile information and preferences.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'invoices' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Invoices & Payments</h2>
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                        <p className="text-gray-600">Your commission invoices will appear here once you start closing leads.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Update Inquiry Status</h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedLead(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedLead(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStatusUpdate}
                    disabled={statusUpdateLoading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusUpdateLoading ? 'Updating...' : 'Update Status'}
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

export default ConsultantDashboard

