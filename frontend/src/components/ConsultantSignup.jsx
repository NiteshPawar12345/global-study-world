import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { Building, Award, DollarSign, FileText, Shield, Upload, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useConsultantAuth } from '../context/ConsultantAuthContext'
import toast from 'react-hot-toast'
import { getApiBase } from '../utils/apiConfig'

const ConsultantSignup = () => {
  const [formData, setFormData] = useState({
    agency_name: '',
    contact_person: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    website: '',
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
    courses: [],
    nda_accepted: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [courses, setCourses] = useState([])
  const { signup } = useConsultantAuth()
  const navigate = useNavigate()

  const languageOptions = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada',
    'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'French', 'German', 'Spanish',
    'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'
  ]

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'languages') {
      const updatedLanguages = formData.languages.includes(value)
        ? formData.languages.filter(lang => lang !== value)
        : [...formData.languages, value]
      setFormData({ ...formData, languages: updatedLanguages })
    } else if (type === 'checkbox' && name === 'destination_countries') {
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
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData({ ...formData, [name]: files[0] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.nda_accepted) {
      toast.error('Please accept the Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)

    try {
      const submitData = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'languages' || key === 'destination_countries' || key === 'courses') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else if (key !== 'confirmPassword') {
          submitData.append(key, formData[key])
        }
      })

      const result = await signup(submitData)
      
      if (result.success) {
        toast.success(result.message)
        navigate('/consultant/dashboard')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Become a Consultant - Global Education</title>
        <meta name="description" content="Join our network of trusted education consultants" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Verified Consultant</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our network of trusted education consultants and help students achieve their study abroad dreams.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Agency Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Building className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Agency Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name *</label>
                <input
                  type="text"
                  name="agency_name"
                  className="input-field"
                  placeholder="Enter your agency name"
                  value={formData.agency_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  name="contact_person"
                  className="input-field"
                  placeholder="Enter contact person name"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="input-field pr-10"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="input-field pr-10"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  className="input-field"
                  placeholder="https://your-website.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <input
                  type="file"
                  name="profile_picture"
                  className="input-field"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-500 mt-1">Upload your professional profile picture (JPG, PNG only)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="input-field"
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Experience & Services */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Award className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Experience & Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                <input
                  type="number"
                  name="experience_years"
                  className="input-field"
                  placeholder="e.g., 5"
                  min="1"
                  max="50"
                  value={formData.experience_years}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Placements</label>
                <input
                  type="number"
                  name="total_placements"
                  className="input-field"
                  placeholder="e.g., 100"
                  min="0"
                  value={formData.total_placements}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Success Rate (%)</label>
                <input
                  type="number"
                  name="success_rate"
                  className="input-field"
                  placeholder="e.g., 95"
                  min="0"
                  max="100"
                  value={formData.success_rate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Time (Hours)</label>
                <input
                  type="number"
                  name="response_time"
                  className="input-field"
                  placeholder="e.g., 24"
                  min="1"
                  max="168"
                  value={formData.response_time}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {languageOptions.map((language) => (
                  <label key={language} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="languages"
                      value={language}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={formData.languages.includes(language)}
                      onChange={handleChange}
                    />
                    <span className="text-sm text-gray-700">{language}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Fee Structure */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Fee Structure</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Fee (₹) *</label>
                <input
                  type="number"
                  name="fee_min"
                  className="input-field"
                  placeholder="e.g., 10000"
                  min="0"
                  value={formData.fee_min}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Fee (₹) *</label>
                <input
                  type="number"
                  name="fee_max"
                  className="input-field"
                  placeholder="e.g., 50000"
                  min="0"
                  value={formData.fee_max}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Model</label>
                <select
                  name="fee_model"
                  className="input-field"
                  value={formData.fee_model}
                  onChange={handleChange}
                >
                  <option value="fixed">Fixed Fee</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Additional Information</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agency Description *</label>
                <textarea
                  name="description"
                  className="input-field"
                  rows="4"
                  placeholder="Tell us about your agency, services, and expertise..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  className="input-field"
                  placeholder="Enter GST number"
                  value={formData.gst_number}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Destination Countries */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Building className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Destination Countries</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select the countries where you provide study abroad services</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {countries.length > 0 ? (
                countries.map((country) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-full">Loading countries... ({countries.length} countries loaded)</p>
              )}
            </div>
          </div>

          {/* Courses/Programs */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Award className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Courses/Programs</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select the courses and programs you specialize in</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.length > 0 ? (
                courses.map((course) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-full">Loading courses... ({courses.length} courses loaded)</p>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Bank Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  className="input-field"
                  placeholder="Enter bank name"
                  value={formData.bank_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  className="input-field"
                  placeholder="Enter account number"
                  value={formData.account_number}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  className="input-field"
                  placeholder="Enter IFSC code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  className="input-field"
                  placeholder="Enter account holder name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Upload className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold">Required Documents</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business License</label>
                <input
                  type="file"
                  name="business_license"
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate</label>
                <input
                  type="file"
                  name="gst_certificate"
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Statement</label>
                <input
                  type="file"
                  name="bank_statement"
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identity Proof</label>
                <input
                  type="file"
                  name="identity_proof"
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Proof</label>
                <input
                  type="file"
                  name="address_proof"
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="nda_accepted"
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formData.nda_accepted}
                onChange={handleChange}
                required
              />
              <div>
                <label className="text-sm text-gray-700">
                  I accept the <Link to="/terms-of-service" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>. I agree to the Non-Disclosure Agreement and understand that my application will be reviewed within 24-48 hours.
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Application
                </div>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/consultant/login" className="text-primary-600 hover:text-primary-500 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default ConsultantSignup

