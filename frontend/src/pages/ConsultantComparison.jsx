import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Star, Users, Clock, TrendingUp, DollarSign, Building, CheckCircle, MessageCircle, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getApiBase } from '../utils/apiConfig'

const ConsultantComparison = () => {
  const [selectedConsultants, setSelectedConsultants] = useState([])
  const [comparisonData, setComparisonData] = useState([])
  const navigate = useNavigate()

  // Fetch all consultants for selection
  const { data: consultantsData, isLoading } = useQuery({
    queryKey: ['consultants'],
    queryFn: async () => {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultants?limit=50`)
      if (!response.ok) throw new Error('Failed to fetch consultants')
      return response.json()
    }
  })

  const consultants = consultantsData?.data?.consultants || []

  const handleConsultantSelect = (consultant) => {
    if (selectedConsultants.length >= 3) {
      alert('You can compare maximum 3 consultants at a time')
      return
    }
    
    if (selectedConsultants.find(c => c.id === consultant.id)) {
      alert('This consultant is already selected')
      return
    }

    setSelectedConsultants(prev => [...prev, consultant])
  }

  const handleConsultantRemove = (consultantId) => {
    setSelectedConsultants(prev => prev.filter(c => c.id !== consultantId))
  }

  const handleViewProfile = (consultantId) => {
    navigate(`/consultant/${consultantId}`)
  }

  const parseJsonField = (field) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch (error) {
        return []
      }
    }
    return field || []
  }

  const formatFee = (fee) => {
    if (!fee) return 'N/A'
    return `₹${(fee / 100000).toFixed(1)}L`
  }

  return (
    <>
      <Helmet>
        <title>Compare Consultants | Global Education</title>
        <meta name="description" content="Compare study abroad consultants side-by-side to find the best match for your needs." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Compare Consultants</h1>
            <p className="text-gray-600 mt-2">Select up to 3 consultants to compare their services, fees, and reviews</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Consultant Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Select Consultants to Compare</h2>
            <p className="text-gray-600 mb-6">Choose up to 3 consultants from the list below:</p>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading consultants...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {consultants.map((consultant) => {
                  const isSelected = selectedConsultants.find(c => c.id === consultant.id)
                  const isDisabled = selectedConsultants.length >= 3 && !isSelected
                  
                  return (
                    <div
                      key={consultant.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : isDisabled 
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                      onClick={() => !isDisabled && handleConsultantSelect(consultant)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {consultant.profile_picture ? (
                          <img
                            src={`/uploads/consultants/${consultant.profile_picture}`}
                            alt={consultant.agency_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{consultant.agency_name}</h3>
                          <p className="text-sm text-gray-600">{consultant.contact_person}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{consultant.averageRating || '4.5'}</span>
                        <span className="text-sm text-gray-500">({consultant.totalReviews || 0})</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Experience:</span>
                          <span>{consultant.experience_years} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span>{consultant.success_rate}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Comparison Table */}
          {selectedConsultants.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold">Side-by-Side Comparison</h2>
                <p className="text-gray-600">Compare key metrics and features</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agency Name
                      </th>
                      {selectedConsultants.map((consultant) => (
                        <th key={consultant.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2 mb-2">
                              {consultant.profile_picture ? (
                                <img
                                  src={`/uploads/consultants/${consultant.profile_picture}`}
                                  alt={consultant.agency_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Building className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <span className="font-medium text-gray-900">{consultant.agency_name}</span>
                            </div>
                            <button
                              onClick={() => handleConsultantRemove(consultant.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Basic Information */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Contact Person
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {consultant.contact_person}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Location
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {consultant.location || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Status
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            consultant.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {consultant.status?.charAt(0).toUpperCase() + consultant.status?.slice(1)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Experience & Performance */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary-500" />
                          Experience
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {consultant.experience_years} years
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary-500" />
                          Total Placements
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {consultant.total_placements}+
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                          Success Rate
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className="text-green-600 font-semibold">{consultant.success_rate}%</span>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          Rating
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{consultant.averageRating || '4.5'}</span>
                            <span className="text-gray-500">({consultant.totalReviews || 0})</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Fee Structure */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-primary-500" />
                          Minimum Fee
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatFee(consultant.fee_min)}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-primary-500" />
                          Maximum Fee
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatFee(consultant.fee_max)}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Fee Model
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className="capitalize">{consultant.fee_model || 'Fixed'}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Services */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-primary-500" />
                          Destination Countries
                        </div>
                      </td>
                      {selectedConsultants.map((consultant) => {
                        const countries = parseJsonField(consultant.destination_countries)
                        return (
                          <td key={consultant.id} className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {countries.slice(0, 3).map((country, index) => (
                                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                  {country}
                                </span>
                              ))}
                              {countries.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{countries.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Languages
                      </td>
                      {selectedConsultants.map((consultant) => {
                        const languages = parseJsonField(consultant.languages)
                        return (
                          <td key={consultant.id} className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {languages.slice(0, 3).map((language, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  {language}
                                </span>
                              ))}
                              {languages.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{languages.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Actions */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Contact
                      </td>
                      {selectedConsultants.map((consultant) => (
                        <td key={consultant.id} className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleViewProfile(consultant.id)}
                              className="btn-primary text-sm py-1 px-3"
                            >
                              View Profile
                            </button>
                            <button className="flex items-center justify-center space-x-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                              <MessageCircle className="h-3 w-3" />
                              <span>Contact</span>
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedConsultants.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No consultants selected
              </h3>
              <p className="text-gray-600 mb-4">
                Select consultants from the list above to start comparing their services and fees.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ConsultantComparison
