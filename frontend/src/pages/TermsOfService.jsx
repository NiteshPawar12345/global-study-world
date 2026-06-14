import { Helmet } from 'react-helmet-async'

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Global Education</title>
        <meta name="description" content="Global Education terms of service and user agreement." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>
          <div className="prose max-w-none">
            <p className="text-gray-600">
              Terms of service content will be added here...
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default TermsOfService








