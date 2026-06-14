import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { ConsultantAuthProvider } from './context/ConsultantAuthContext'
import { StudentAuthProvider } from './context/StudentAuthContext'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ConsultantProfile from './pages/ConsultantProfile'
import StudentDashboard from './pages/StudentDashboard'
import ConsultantDashboard from './components/ConsultantDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ConsultantRegistration from './pages/ConsultantRegistration'
import ConsultantLogin from './components/ConsultantLogin'
import ConsultantSignup from './components/ConsultantSignup'
import StudentSignup from './components/StudentSignup'
import StudentLogin from './components/StudentLogin'
import ConsultantProtectedRoute from './components/ConsultantProtectedRoute'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import HowItWorksPage from './pages/HowItWorksPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ConsultantAuthProvider>
          <StudentAuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/consultant/:id" element={<ConsultantProfile />} />
                    <Route path="/consultant/register" element={<ConsultantRegistration />} />
                    <Route path="/consultant/login" element={<ConsultantLogin />} />
                    <Route path="/consultant/signup" element={<ConsultantSignup />} />
                    <Route 
                      path="/consultant/dashboard" 
                      element={
                        <ConsultantProtectedRoute>
                          <ConsultantDashboard />
                        </ConsultantProtectedRoute>
                      } 
                    />
                    <Route path="/student/signup" element={<StudentSignup />} />
                    <Route path="/student/login" element={<StudentLogin />} />
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                  </Routes>
                </main>
                <Footer />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              </div>
            </Router>
          </StudentAuthProvider>
        </ConsultantAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
