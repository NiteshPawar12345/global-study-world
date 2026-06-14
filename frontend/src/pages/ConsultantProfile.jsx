import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Star, Users, MapPin, Phone, Mail, Award, CheckCircle, Globe, Building, Clock, TrendingUp, DollarSign, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getApiBase } from '../utils/apiConfig'

const ConsultantProfile = () => {
  const { id } = useParams()

  // Fetch consultant data from API
  const { data: consultantData, isLoading, error } = useQuery({
    queryKey: ['consultant', id],
    queryFn: async () => {
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultants/${id}`)
      if (!response.ok) throw new Error('Failed to fetch consultant')
      return response.json()
    }
  })

  const consultant = consultantData?.data?.consultant

  // Parse JSON fields if they are strings
  const parseJsonField = (field) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch (error) {
        console.warn('Failed to parse JSON field:', error)
        return []
      }
    }
    return field || []
  }

  const destinationCountries = parseJsonField(consultant?.destination_countries)
  const courses = parseJsonField(consultant?.courses)
  const languages = parseJsonField(consultant?.languages)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultant profile...</p>
        </div>
      </div>
    )
  }

  if (error || !consultant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Consultant Not Found</h1>
          <p className="text-gray-600">The consultant you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{consultant.agency_name} - Study Abroad Consultant | Global Education</title>
        <meta name="description" content={`${consultant.agency_name} - ${consultant.experience_years} years experience, ${consultant.averageRating || '4.5'} rating. Located in ${consultant.location}. Contact for study abroad guidance.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-6">
              {consultant.profile_picture ? (
                <img
                  src={`/uploads/consultants/${consultant.profile_picture}`}
                  alt={consultant.agency_name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    console.error('Profile picture failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {!consultant.profile_picture && (
                <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Building className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{consultant.agency_name}</h1>
                  {consultant.is_verified && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified</span>
                    </span>
                  )}
                  {consultant.is_featured && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-2">Contact Person: {consultant.contact_person}</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{consultant.averageRating || '4.5'}</span>
                  <span className="text-gray-600">({consultant.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About {consultant.agency_name}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{consultant.experience_years}</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{consultant.total_placements}</div>
                    <div className="text-sm text-gray-600">Total Placements</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{consultant.success_rate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{consultant.response_time_hours}h</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {consultant.description || 'No description available. This consultant specializes in study abroad guidance and has helped numerous students achieve their educational goals.'}
                  </p>
                </div>
              </div>

              {/* Services & Specialties */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold mb-6">Services & Specialties</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Globe className="h-5 w-5 text-primary-500 mr-2" />
                      Destination Countries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {destinationCountries.length > 0 ? (
                        destinationCountries.map((country, index) => (
                          <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                            {country}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No countries specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 text-primary-500 mr-2" />
                      Courses & Programs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {courses.length > 0 ? (
                        courses.map((course, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {course}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No courses specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <MessageCircle className="h-5 w-5 text-primary-500 mr-2" />
                    Languages Spoken
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {languages.length > 0 ? (
                      languages.map((language, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {language}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No languages specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Structure */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <DollarSign className="h-5 w-5 text-primary-500 mr-2" />
                  Fee Structure
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {consultant.fee_min ? `₹${(consultant.fee_min / 100000).toFixed(1)}L` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Minimum Fee</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {consultant.fee_max ? `₹${(consultant.fee_max / 100000).toFixed(1)}L` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Maximum Fee</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {consultant.fee_model || 'Fixed'}
                    </div>
                    <div className="text-sm text-gray-600">Fee Model</div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold mb-6">Reviews & Testimonials</h3>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews available yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Be the first to review this consultant!</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-6">Get in Touch</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-700">{consultant.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-700">{consultant.email}</span>
                  </div>
                  {consultant.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-primary-500" />
                      <a href={consultant.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        Visit Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary-500 mt-0.5" />
                    <span className="text-gray-700">{consultant.location || 'Location not specified'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {consultant.phone && (
                    <a
                      href={`tel:${consultant.phone}`}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Now</span>
                    </a>
                  )}
                  
                  <a
                    href={`mailto:${consultant.email}`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      consultant.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {consultant.status?.charAt(0).toUpperCase() + consultant.status?.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">{consultant.response_time_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium text-green-600">{consultant.success_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Placements</span>
                    <span className="font-medium">{consultant.total_placements}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{consultant.experience_years} years</span>
                  </div>
                  {consultant.gst_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Number</span>
                      <span className="font-medium text-xs">{consultant.gst_number}</span>
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

export default ConsultantProfile
