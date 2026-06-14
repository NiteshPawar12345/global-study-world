import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, Star, Users, Globe, Award, ArrowRight, CheckCircle, Building, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import heroImage from '../assets/hero.png'
import { useEffect, useMemo, useState } from 'react'
import { getApiBase } from '../utils/apiConfig'

const HomePage = () => {
  const navigate = useNavigate()

  // Fetch featured consultants from API
  const { data: consultantsData, isLoading: consultantsLoading } = useQuery({
    queryKey: ['featured-consultants'],
    queryFn: async () => {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/consultants?featured=true&limit=3`)
      if (!response.ok) throw new Error('Failed to fetch consultants')
      return response.json()
    }
  })

  const featuredConsultants = consultantsData?.data?.consultants || []

  const stats = [
    { number: "10,000+", label: "Students Helped" },
    { number: "500+", label: "Verified Consultants" },
    { number: "50+", label: "Countries Covered" },
    { number: "95%", label: "Success Rate" }
  ]

  const aboutHighlights = [
    {
      title: 'Personalized Guidance',
      description: 'Match with mentors who specialize in your destination, course, and budget goals.',
      icon: Users,
      accent: 'from-green-100 to-emerald-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Verified Experts',
      description: 'Every consultant on Global Education is background-checked and performance rated.',
      icon: Shield,
      accent: 'from-orange-100 to-amber-50',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Transparent Process',
      description: 'Track each step—from shortlisting universities to visa filing—with total visibility.',
      icon: CheckCircle,
      accent: 'from-red-100 to-rose-50',
      iconColor: 'text-red-500'
    },
    {
      title: 'Global Network',
      description: 'Access partner universities and alumni communities across 50+ countries.',
      icon: Globe,
      accent: 'from-blue-100 to-sky-50',
      iconColor: 'text-blue-500'
    }
  ]

  const testimonials = [
    {
      quote: 'Global Education paired me with a counselor who understood my STEM goals—and pushed my SoP to the next level.',
      name: 'Aditi Sharma',
      result: 'MS in Computer Science, NYU',
      color: 'from-blue-50 to-white'
    },
    {
      quote: 'The funding roadmap we built helped me secure a 40% scholarship in Canada. Transparent and reassuring support!',
      name: 'Rahul Menon',
      result: 'MBA, Rotman School of Management',
      color: 'from-green-50 to-white'
    },
    {
      quote: 'Visa prep, accommodation tips, alumni connects—everything was packaged so smoothly. I never felt lost.',
      name: 'Meera Iqbal',
      result: 'Bachelors in Design, RMIT Australia',
      color: 'from-orange-50 to-white'
    }
  ]
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [testimonialsPerSlide, setTestimonialsPerSlide] = useState(1)

  useEffect(() => {
    const updatePerSlide = () => {
      const width = window.innerWidth
      if (width >= 1280) {
        setTestimonialsPerSlide(3)
      } else if (width >= 1024) {
        setTestimonialsPerSlide(3)
      } else if (width >= 640) {
        setTestimonialsPerSlide(2)
      } else {
        setTestimonialsPerSlide(1)
      }
    }

    updatePerSlide()
    window.addEventListener('resize', updatePerSlide)
    return () => window.removeEventListener('resize', updatePerSlide)
  }, [])

  const testimonialSlides = useMemo(() => {
    const chunks = []
    for (let i = 0; i < testimonials.length; i += testimonialsPerSlide) {
      chunks.push(testimonials.slice(i, i + testimonialsPerSlide))
    }
    return chunks
  }, [testimonialsPerSlide])

  useEffect(() => {
    if (testimonialIndex >= testimonialSlides.length) {
      setTestimonialIndex(0)
    }
  }, [testimonialIndex, testimonialSlides.length])

  const handleTestimonialNav = (direction) => {
    setTestimonialIndex((prev) => {
      const next = prev + direction
      if (next < 0) return testimonialSlides.length - 1
      if (next >= testimonialSlides.length) return 0
      return next
    })
  }

  return (
    <>
      <Helmet>
        <title>Global Education - Find Your Dream Study Abroad Program | Verified Consultants</title>
        <meta name="description" content="Connect with verified international education consultants. Find the best study abroad programs in USA, Canada, UK, Australia and more. Get expert guidance for your education journey." />
        <meta name="keywords" content="study abroad consultants, international education, study in USA, study in Canada, study in UK, education consultants India" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative w-full">
        <img
          src={heroImage}
          alt="Global Education students exploring study abroad options"
          className="w-full h-auto md:h-[630px] object-cover"
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <IncrementalStats stats={stats} />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-10">
            <div className="lg:w-1/2 space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-500 mb-2">Why Global Education</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Built for ambitious students who want expert-backed study abroad journeys
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                We combine human expertise with data-driven matching to help you shortlist the right programs, prepare standout applications,
                and arrive on campus confident and ready. From profile building to pre-departure checklists, our consultants walk every step with you.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                  24/7 Counselor Support
                </div>
                <div className="px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                  Scholarships & Funding Guidance
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {aboutHighlights.map(({ title, description, icon: Icon, accent, iconColor }) => (
                <div
                  key={title}
                  className={`bg-gradient-to-br ${accent} rounded-2xl p-6 shadow-sm border border-white/70`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow ${iconColor} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
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
      </section>

      {/* Featured Consultants */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Consultants
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our top-rated education consultants who have helped thousands of students achieve their study abroad dreams.
            </p>
          </div>

          {consultantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredConsultants.map((consultant) => (
                <div key={consultant.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    {consultant.profile_picture ? (
                      <img
                        src={`/uploads/consultants/${consultant.profile_picture}`}
                        alt={consultant.agency_name}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                        onError={(e) => {
                          console.error('Profile picture failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {!consultant.profile_picture && (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {consultant.agency_name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {consultant.averageRating || '4.5'} ({consultant.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
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
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        <Users className="h-4 w-4 inline mr-1" />
                        {consultant.total_placements}+ placements
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{consultant.fee_min?.toLocaleString()} - ₹{consultant.fee_max?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/consultant/${consultant.id}`}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/search" className="btn-secondary">
              View All Consultants
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Voices of Global Trailblazers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear how students across the world fast-tracked their dream admits with Global Education.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden -mx-4 py-8">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {testimonialSlides.map((slide, slideIdx) => (
                  <div key={slideIdx} className="w-full flex-shrink-0 px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {slide.map((testimonial) => (
                        <div
                          key={testimonial.name}
                          className={`bg-gradient-to-br ${testimonial.color} rounded-2xl p-6 shadow`}
                        >
                          <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, index) => (
                              <Star key={index} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-700 italic mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                          <div>
                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                            <p className="text-sm text-gray-600">{testimonial.result}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <button
                onClick={() => handleTestimonialNav(-1)}
                className="p-3 bg-white/90 hover:bg-white rounded-full shadow transform -translate-x-full"
                aria-label="Previous testimonial"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                onClick={() => handleTestimonialNav(1)}
                className="p-3 bg-white/90 hover:bg-white rounded-full shadow transform translate-x-full"
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonialSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full ${
                    idx === testimonialIndex ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Study Abroad Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of students who have successfully achieved their study abroad dreams with our verified consultants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="btn-secondary">
              Find Your Consultant
            </Link>
            <Link to="/consultant/register" className="bg-white text-primary-500 hover:bg-gray-100 font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Become a Consultant
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

const IncrementalStats = ({ stats }) => {
  const [displayValues, setDisplayValues] = useState(stats.map(() => 0))
  const suffixes = stats.map(stat => stat.number.replace(/[0-9.,+]/g, '').trim())

  useEffect(() => {
    let animationFrame
    const duration = 1500
    const startTime = performance.now()

    const parseValue = (val) => parseInt(val.replace(/\D/g, ''), 10) || 0
    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const newValues = stats.map((stat, index) => {
        const target = parseValue(stat.number)
        const easedProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
        return Math.floor(target * easedProgress)
      })
      setDisplayValues(newValues)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [stats])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={stat.label} className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
            {displayValues[index].toLocaleString()}
            {stat.number.includes('+') ? '+' : ''}
            {suffixes[index]}
          </div>
          <div className="text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default HomePage

