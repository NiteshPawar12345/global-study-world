import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle, User, Mail, Phone, MapPin, BookOpen, DollarSign, Calendar, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStudentAuth } from '../context/StudentAuthContext'
import { useQuery } from '@tanstack/react-query'
import { getApiBase } from '../utils/apiConfig'

const InquiryForm = ({ consultantId: initialConsultantId, consultantName: initialConsultantName, onClose }) => {
  const navigate = useNavigate()
  const { student } = useStudentAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedConsultantId, setSelectedConsultantId] = useState(initialConsultantId || '')
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    name: student?.first_name && student?.last_name ? `${student.first_name} ${student.last_name}` : '',
    email: student?.email || '',
    phone: student?.mobile || '',
    
    // Step 2: Study Preferences
    country_preference: '',
    course_preference: '',
    budget_min: '',
    budget_max: '',
    timeline: '',
    
    // Step 3: Additional Information
    additional_requirements: '',
    current_education: '',
    english_proficiency: '',
    work_experience: ''
  })

  // Fetch consultants for selection
  const { data: consultantsData } = useQuery({
    queryKey: ['consultants'],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      queryParams.append('limit', '50')
      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/consultants?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch consultants')
      return response.json()
    },
    enabled: currentStep === 2 // Only fetch when on step 2
  })

  const consultants = consultantsData?.data?.consultants || []

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Study Preferences', icon: BookOpen },
    { number: 3, title: 'Additional Details', icon: MessageSquare }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) {
        toast.error('Please login to submit an inquiry')
        return
      }

      if (!selectedConsultantId) {
        toast.error('Please select a consultant before submitting.')
        return
      }

      const consultantIdToSubmit = parseInt(selectedConsultantId, 10)
      if (Number.isNaN(consultantIdToSubmit)) {
        toast.error('Invalid consultant selected. Please try again.')
        return
      }

      const apiBase = getApiBase()
      const response = await fetch(`${apiBase}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country_preference: formData.country_preference,
          course_preference: formData.course_preference,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          timeline: formData.timeline,
          additional_requirements: formData.additional_requirements,
          current_education: formData.current_education || null,
          english_proficiency: formData.english_proficiency || null,
          work_experience: formData.work_experience || null,
          consultant_id: consultantIdToSubmit
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit inquiry')
      }

      const result = await response.json()
      toast.success(result.message || 'Inquiry submitted successfully!')
      if (onClose) {
        onClose()
      } else {
        navigate('/student/dashboard')
      }
    } catch (error) {
      console.error('Submit inquiry error:', error)
      toast.error(error.message || 'Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone
      case 2:
        return formData.country_preference && formData.course_preference && formData.timeline && selectedConsultantId
      case 3:
        return true // Step 3 is optional
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="input-field"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="input-field"
          placeholder="Enter your email address"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="input-field"
          placeholder="Enter your phone number"
          required
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination Country *
        </label>
        <select
          value={formData.country_preference}
          onChange={(e) => handleInputChange('country_preference', e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select Country</option>
          <option value="usa">United States</option>
          <option value="canada">Canada</option>
          <option value="uk">United Kingdom</option>
          <option value="australia">Australia</option>
          <option value="germany">Germany</option>
          <option value="ireland">Ireland</option>
          <option value="netherlands">Netherlands</option>
          <option value="france">France</option>
          <option value="spain">Spain</option>
          <option value="italy">Italy</option>
          <option value="sweden">Sweden</option>
          <option value="norway">Norway</option>
          <option value="denmark">Denmark</option>
          <option value="finland">Finland</option>
          <option value="switzerland">Switzerland</option>
          <option value="austria">Austria</option>
          <option value="belgium">Belgium</option>
          <option value="new_zealand">New Zealand</option>
          <option value="singapore">Singapore</option>
          <option value="japan">Japan</option>
          <option value="south_korea">South Korea</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Course/Program *
        </label>
        <select
          value={formData.course_preference}
          onChange={(e) => handleInputChange('course_preference', e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select Course</option>
          <option value="engineering">Engineering</option>
          <option value="business">Business & Management</option>
          <option value="computer_science">Computer Science</option>
          <option value="medicine">Medicine</option>
          <option value="arts">Arts & Humanities</option>
          <option value="design">Design</option>
          <option value="it">Information Technology</option>
          <option value="healthcare">Healthcare</option>
          <option value="law">Law</option>
          <option value="education">Education</option>
          <option value="psychology">Psychology</option>
          <option value="social_sciences">Social Sciences</option>
          <option value="sciences">Natural Sciences</option>
          <option value="architecture">Architecture</option>
          <option value="agriculture">Agriculture</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Budget (₹)
          </label>
          <input
            type="number"
            value={formData.budget_min}
            onChange={(e) => handleInputChange('budget_min', e.target.value)}
            className="input-field"
            placeholder="e.g., 1000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Budget (₹)
          </label>
          <input
            type="number"
            value={formData.budget_max}
            onChange={(e) => handleInputChange('budget_max', e.target.value)}
            className="input-field"
            placeholder="e.g., 5000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Intake *
        </label>
        <select
          value={formData.timeline}
          onChange={(e) => handleInputChange('timeline', e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select Intake</option>
          <option value="fall_2024">Fall 2024</option>
          <option value="spring_2025">Spring 2025</option>
          <option value="fall_2025">Fall 2025</option>
          <option value="spring_2026">Spring 2026</option>
          <option value="fall_2026">Fall 2026</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Consultant *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Please choose the consultant you want to send this inquiry to.
        </p>
        {consultantsData?.isLoading ? (
          <div className="mt-2 text-sm text-gray-500">Loading consultants...</div>
        ) : consultants.length > 0 ? (
          <select
            value={selectedConsultantId}
            onChange={(e) => setSelectedConsultantId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">-- Select a consultant --</option>
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.agency_name} {consultant.contact_person && `- ${consultant.contact_person}`}
                {consultant.location && ` (${consultant.location})`}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-2 text-sm text-gray-500">
            No consultants are currently available. Please try again later.
          </div>
        )}
        {selectedConsultantId && (
          <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded text-sm text-primary-700">
            ✓ Consultant selected: {consultants.find(c => c.id === parseInt(selectedConsultantId))?.agency_name || 'Selected consultant'}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Education Level
        </label>
        <select
          value={formData.current_education}
          onChange={(e) => handleInputChange('current_education', e.target.value)}
          className="input-field"
        >
          <option value="">Select Current Education</option>
          <option value="high_school">High School (12th Grade)</option>
          <option value="diploma">Diploma</option>
          <option value="bachelor">Bachelor's Degree</option>
          <option value="master">Master's Degree</option>
          <option value="phd">PhD</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          English Proficiency
        </label>
        <select
          value={formData.english_proficiency}
          onChange={(e) => handleInputChange('english_proficiency', e.target.value)}
          className="input-field"
        >
          <option value="">Select English Proficiency</option>
          <option value="ielts_9">IELTS 9.0</option>
          <option value="ielts_8">IELTS 8.0-8.5</option>
          <option value="ielts_7">IELTS 7.0-7.5</option>
          <option value="ielts_6">IELTS 6.0-6.5</option>
          <option value="ielts_5">IELTS 5.0-5.5</option>
          <option value="toefl_120">TOEFL 120</option>
          <option value="toefl_100">TOEFL 100-119</option>
          <option value="toefl_80">TOEFL 80-99</option>
          <option value="toefl_60">TOEFL 60-79</option>
          <option value="pte_90">PTE 90</option>
          <option value="pte_80">PTE 80-89</option>
          <option value="pte_70">PTE 70-79</option>
          <option value="pte_60">PTE 60-69</option>
          <option value="duolingo_160">Duolingo 160+</option>
          <option value="duolingo_140">Duolingo 140-159</option>
          <option value="duolingo_120">Duolingo 120-139</option>
          <option value="duolingo_100">Duolingo 100-119</option>
          <option value="not_taken">Not Taken Yet</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Experience (Years)
        </label>
        <select
          value={formData.work_experience}
          onChange={(e) => handleInputChange('work_experience', e.target.value)}
          className="input-field"
        >
          <option value="">Select Work Experience</option>
          <option value="0">No Experience</option>
          <option value="1">1 Year</option>
          <option value="2">2 Years</option>
          <option value="3">3 Years</option>
          <option value="4">4 Years</option>
          <option value="5">5+ Years</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Requirements & Notes
        </label>
        <textarea
          value={formData.additional_requirements}
          onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
          className="input-field"
          rows={4}
          placeholder="Any specific requirements, preferences, or additional information you'd like to share..."
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStep === 1 && 'Tell us about yourself'}
            {currentStep === 2 && 'What are your study preferences?'}
            {currentStep === 3 && 'Any additional information?'}
          </h2>
          <p className="text-gray-600">
            {currentStep === 1 && 'We need some basic information to get started.'}
            {currentStep === 2 && 'Help us understand your study abroad goals.'}
            {currentStep === 3 && 'Share any additional details that might help us assist you better.'}
          </p>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${
                isStepValid(currentStep)
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {currentStep === 3 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700 font-medium">
              {selectedConsultantId 
                ? 'Your inquiry will be sent directly to the selected consultant!'
                : "We'll match you with the best consultants within 24 hours!"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InquiryForm
