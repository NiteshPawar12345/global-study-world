import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, AlertCircle, MessageCircle, Users, DollarSign, TrendingUp, FileText, Settings, Shield, Eye, X, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getApiBase } from '../utils/apiConfig'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedConsultant, setSelectedConsultant] = useState(null)

  // Fetch admin data from API
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/overview`)
      if (!response.ok) throw new Error('Failed to fetch overview data')
      return response.json()
    }
  })

  const { data: consultantsData, isLoading: consultantsLoading } = useQuery({
    queryKey: ['admin-consultants'],
    queryFn: async () => {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/consultants`)
      if (!response.ok) throw new Error('Failed to fetch consultants')
      return response.json()
    }
  })

  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/admin/inquiries`)
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      return response.json()
    }
  })

  const overview = overviewData?.data || {}
  const consultants = consultantsData?.data?.consultants || []
  const inquiries = inquiriesData?.data?.inquiries || []

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
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
                <p className="text-gray-600">
                  Manage consultants, leads, and platform operations
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
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Users className="h-4 w-4" />
                    <span>View All Consultants</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <MessageCircle className="h-4 w-4" />
                    <span>View All Inquiries</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Settings className="h-4 w-4" />
                    <span>Platform Settings</span>
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
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('consultants')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'consultants'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Consultants
                    </button>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'inquiries'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Inquiries
                    </button>
                    <button
                      onClick={() => setActiveTab('revenue')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'revenue'
                          ? 'border-primary-500 text-primary-600'
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
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <MessageCircle className="h-4 w-4 text-primary-500" />
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
                        <button className="btn-primary">
                          Export Consultants
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
                          {consultants.map((consultant) => (
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

                              {/* Languages */}
                              {consultant.languages && consultant.languages.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-sm text-gray-600">Languages:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {consultant.languages.map((lang, index) => (
                                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {lang}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Destination Countries */}
                              {consultant.destination_countries && consultant.destination_countries.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-sm text-gray-600">Destination Countries:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {consultant.destination_countries.map((country, index) => (
                                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {country}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Courses */}
                              {consultant.courses && consultant.courses.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-sm text-gray-600">Courses/Programs:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {consultant.courses.map((course, index) => (
                                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {course}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex space-x-3">
                                <button className="btn-primary">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </button>
                                {consultant.status === 'pending' && (
                                  <>
                                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </button>
                                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'inquiries' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">All Inquiries</h2>
                        <button className="btn-primary">
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
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(inquiry.status)}`}>
                                  {getStatusIcon(inquiry.status)}
                                  <span>{formatStatus(inquiry.status)}</span>
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
                                <button className="btn-primary">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                  Assign Consultant
                                </button>
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
    </>
  )
}

export default AdminDashboard

