import { Helmet } from 'react-helmet-async'
import { Users, Award, Globe, Target } from 'lucide-react'

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Global Education | Connecting Students with Verified Consultants</title>
        <meta name="description" content="Learn about Global Education's mission to connect students with verified international education consultants worldwide." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Global Education
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              We're on a mission to make study abroad accessible, transparent, and successful for every student.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                To connect students with verified, experienced education consultants who can guide them through their study abroad journey with transparency, trust, and expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">10,000+ Students</h3>
                <p className="text-gray-600">Successfully guided to their dream universities</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">500+ Consultants</h3>
                <p className="text-gray-600">Verified and experienced education experts</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">50+ Countries</h3>
                <p className="text-gray-600">Covering major study destinations worldwide</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">95% Success Rate</h3>
                <p className="text-gray-600">Students achieving their study abroad goals</p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Global Education was founded with a simple yet powerful vision: to democratize access to quality international education by connecting students with the right consultants.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  We recognized that the study abroad process was often opaque, expensive, and filled with uncertainty. Students struggled to find reliable consultants, while good consultants had difficulty reaching the right students.
                </p>
                <p className="text-lg text-gray-600">
                  Today, we're proud to be the trusted platform that brings transparency, verification, and success to the study abroad journey for thousands of students worldwide.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Transparency</h4>
                      <p className="text-gray-600">Clear pricing, honest reviews, and open communication</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Trust</h4>
                      <p className="text-gray-600">Verified consultants with proven track records</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Excellence</h4>
                      <p className="text-gray-600">High standards for both consultants and outcomes</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Accessibility</h4>
                      <p className="text-gray-600">Making quality education guidance available to all</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Join thousands of students who have successfully achieved their study abroad dreams with our verified consultants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/search" className="btn-secondary">
                Find Your Consultant
              </a>
              <a href="/contact" className="bg-white text-primary-500 hover:bg-gray-100 font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AboutPage

