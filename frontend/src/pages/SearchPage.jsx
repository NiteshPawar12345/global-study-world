import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, Filter, Star, Users, MapPin, Phone, Mail, MessageCircle, ArrowRight, ChevronDown, Building } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useStudentAuth } from '../context/StudentAuthContext'
import ChatModal from '../components/ChatModal'
import { startConversationAsStudent } from '../services/chatApi'
import { getApiBase } from '../utils/apiConfig'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    country: searchParams.get('country') || '',
    course: searchParams.get('course') || '',
    budget: searchParams.get('budget') || '',
    language: searchParams.get('language') || '',
    experience: searchParams.get('experience') || '',
    rating: searchParams.get('rating') || '',
    location: searchParams.get('location') || '',
    feeModel: searchParams.get('feeModel') || ''
  })
  const [sortBy, setSortBy] = useState('most-trusted')
  const [showFilters, setShowFilters] = useState(false)
  const { student } = useStudentAuth()
  const studentToken = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatConversation, setChatConversation] = useState(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatTargetId, setChatTargetId] = useState(null)

  // Comprehensive lists
  const countries = [
    'Australia', 'Austria', 'Belgium', 'Canada', 'China', 'Denmark', 'Finland', 
    'France', 'Germany', 'India', 'Ireland', 'Italy', 'Japan', 'Malaysia', 
    'Netherlands', 'New Zealand', 'Norway', 'Singapore', 'South Korea', 'Spain', 
    'Sweden', 'Switzerland', 'Thailand', 'United Kingdom', 'United States'
  ]

  const courses = [
    { name: 'Architecture', category: 'Arts' },
    { name: 'Artificial Intelligence', category: 'Technology' },
    { name: 'Arts', category: 'Arts' },
    { name: 'Biology', category: 'Science' },
    { name: 'Biomedical Engineering', category: 'Engineering' },
    { name: 'Business Administration', category: 'Business' },
    { name: 'Chemical Engineering', category: 'Engineering' },
    { name: 'Chemistry', category: 'Science' },
    { name: 'Civil Engineering', category: 'Engineering' },
    { name: 'Computer Science', category: 'Technology' },
    { name: 'Criminal Law', category: 'Law' },
    { name: 'Cybersecurity', category: 'Technology' },
    { name: 'Data Science', category: 'Technology' },
    { name: 'Dentistry', category: 'Healthcare' },
    { name: 'Design', category: 'Arts' },
    { name: 'Digital Marketing', category: 'Media' },
    { name: 'Economics', category: 'Business' },
    { name: 'Education', category: 'Education' },
    { name: 'Electrical Engineering', category: 'Engineering' },
    { name: 'Environmental Science', category: 'Science' },
    { name: 'Fashion Design', category: 'Arts' },
    { name: 'Film Studies', category: 'Arts' },
    { name: 'Finance', category: 'Business' },
    { name: 'Graphic Design', category: 'Arts' },
    { name: 'Information Technology', category: 'Technology' },
    { name: 'International Business', category: 'Business' },
    { name: 'International Law', category: 'Law' },
    { name: 'Journalism', category: 'Media' },
    { name: 'Law', category: 'Law' },
    { name: 'Marketing', category: 'Business' },
    { name: 'Mass Communication', category: 'Media' },
    { name: 'Mathematics', category: 'Science' },
    { name: 'MBA', category: 'Business' },
    { name: 'Mechanical Engineering', category: 'Engineering' },
    { name: 'Medicine', category: 'Healthcare' },
    { name: 'Music', category: 'Arts' },
    { name: 'Nursing', category: 'Healthcare' },
    { name: 'Pharmacy', category: 'Healthcare' },
    { name: 'Physics', category: 'Science' },
    { name: 'Psychology', category: 'Healthcare' },
    { name: 'Public Health', category: 'Healthcare' },
    { name: 'Software Engineering', category: 'Technology' },
    { name: 'Special Education', category: 'Education' },
    { name: 'Statistics', category: 'Science' },
    { name: 'Teaching', category: 'Education' }
  ]

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ]

  const languages = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 
    'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'French', 
    'German', 'Spanish', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'
  ]

  // Fetch consultants from API
  const { data: consultantsData, isLoading: loading } = useQuery({
    queryKey: ['consultants', filters, sortBy],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      
      // Add all active filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          // Convert filter values to proper format for backend
          let formattedValue = value;
          
          // Convert kebab-case back to proper format for backend search
          if (key === 'country' || key === 'course' || key === 'language' || key === 'location') {
            formattedValue = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
          
          queryParams.append(key, formattedValue);
        }
      })
      
      queryParams.append('sort', sortBy);
      queryParams.append('limit', '20'); // Increase limit for better results
      
      console.log('Search query params:', queryParams.toString());
      
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/consultants?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch consultants')
      const data = await response.json();
      
      console.log('Search results:', data);
      return data;
    }
  })

  const consultants = consultantsData?.data?.consultants || []

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => value && value.trim() !== '').length

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      country: '',
      course: '',
      budget: '',
      language: '',
      experience: '',
      rating: '',
      location: '',
      feeModel: ''
    })
    setSearchParams({})
  }

  // Consultants are already filtered and sorted by the API
  const sortedConsultants = consultants

  const handleOpenChat = async (consultant) => {
    if (!student) {
      toast.error('Please login as a student to chat with consultants')
      return
    }

    if (!studentToken) {
      toast.error('Authentication token missing. Please login again.')
      return
    }

    try {
      setChatTargetId(consultant.id)
      setChatLoading(true)
      const data = await startConversationAsStudent(studentToken, consultant.id)
      setChatConversation(data.conversation)
      setIsChatOpen(true)
    } catch (error) {
      console.error('Failed to start chat', error)
      toast.error(error.message || 'Failed to start chat')
    } finally {
      setChatLoading(false)
      setChatTargetId(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Find Study Abroad Consultants | Global Education</title>
        <meta name="description" content="Search and compare verified study abroad consultants. Filter by country, course, budget, and more. Find the perfect consultant for your education journey." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Find Your Study Abroad Consultant
                </h1>
                <p className="text-gray-600 mt-1">
                  {sortedConsultants.length} verified consultants found
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="most-trusted">Most Trusted</option>
                  <option value="lowest-fee">Lowest Fee</option>
                  <option value="most-experienced">Most Experienced</option>
                  <option value="most-reviews">Most Reviews</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country.toLowerCase().replace(/\s+/g, '-')}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course/Program
                    </label>
                    <select
                      value={filters.course}
                      onChange={(e) => handleFilterChange('course', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Courses</option>
                      {courses.map((course) => (
                        <option key={course.name} value={course.name.toLowerCase().replace(/\s+/g, '-')}>
                          {course.name} ({course.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <select
                      value={filters.budget}
                      onChange={(e) => handleFilterChange('budget', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Budgets</option>
                      <option value="under-10l">Under ₹10 Lakhs</option>
                      <option value="10-20l">₹10-20 Lakhs</option>
                      <option value="20-30l">₹20-30 Lakhs</option>
                      <option value="30-50l">₹30-50 Lakhs</option>
                      <option value="above-50l">Above ₹50 Lakhs</option>
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Languages</option>
                      {languages.map((language) => (
                        <option key={language} value={language.toLowerCase().replace(/\s+/g, '-')}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) => handleFilterChange('experience', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Any Experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Any Rating</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4.0">4.0+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultant Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Locations</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fee Model Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Model
                    </label>
                    <select
                      value={filters.feeModel}
                      onChange={(e) => handleFilterChange('feeModel', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Models</option>
                      <option value="fixed">Fixed Fee</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedConsultants.map((consultant) => (
                    <div key={consultant.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                        {/* Consultant Info */}
                        <div className="flex items-start space-x-4 flex-1">
                          {consultant.profile_picture ? (
                            <img
                              src={`/uploads/consultants/${consultant.profile_picture}`}
                              alt={consultant.agency_name}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                console.error('Profile picture failed to load:', e.target.src);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {!consultant.profile_picture && (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Building className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {consultant.agency_name}
                              </h3>
                              {consultant.is_verified && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Verified
                                </span>
                              )}
                              {consultant.is_featured && (
                                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1 mb-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{consultant.averageRating || '4.5'}</span>
                              <span className="text-sm text-gray-500">({consultant.totalReviews || 0} reviews)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Experience:</span>
                                <div className="text-sm text-gray-600 mt-1">
                                  {consultant.experience_years} years
                                </div>
                              </div>
                              
                              <div>
                                <span className="text-sm font-medium text-gray-700">Location:</span>
                                <div className="text-sm text-gray-600 mt-1">
                                  {consultant.location}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Experience:</span>
                                <div className="font-medium">{consultant.experience_years} years</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Placements:</span>
                                <div className="font-medium">{consultant.total_placements}+</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Response Time:</span>
                                <div className="font-medium">{consultant.response_time_hours} hours</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Success Rate:</span>
                                <div className="font-medium text-green-600">{consultant.success_rate}%</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-3 lg:w-80">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                              ₹{consultant.fee_min?.toLocaleString()} - ₹{consultant.fee_max?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {consultant.fee_model} • {consultant.location}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Link
                              to={`/consultant/${consultant.id}`}
                              className="btn-primary flex items-center justify-center space-x-2"
                            >
                              <span>View Profile</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleOpenChat(consultant)}
                                disabled={chatLoading && chatTargetId === consultant.id}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-60"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>
                                  {chatLoading && chatTargetId === consultant.id ? 'Opening...' : 'Chat'}
                                </span>
                              </button>
                              <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                <Phone className="h-4 w-4" />
                                <span>Call</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sortedConsultants.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No consultants found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters to see more results.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="btn-primary"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen && !!chatConversation}
        onClose={() => setIsChatOpen(false)}
        conversation={chatConversation}
        userType="student"
        authToken={studentToken}
      />
    </>
  )
}

export default SearchPage

