import { Helmet } from 'react-helmet-async'
import { Search, Users, Award, CheckCircle } from 'lucide-react'

const HowItWorksPage = () => {
  return (
    <>
      <Helmet>
        <title>How It Works - Global Education | Study Abroad Process</title>
        <meta name="description" content="Learn how Global Education connects students with verified consultants for study abroad success." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get matched with the perfect consultant in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search & Compare</h3>
              <p className="text-gray-600">
                Use our advanced filters to find consultants based on your destination, course, and budget preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Get Matched</h3>
              <p className="text-gray-600">
                Submit your inquiry and get matched with the best consultants within 24 hours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Start Your Journey</h3>
              <p className="text-gray-600">
                Connect with your consultant and begin your study abroad journey with expert guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HowItWorksPage








