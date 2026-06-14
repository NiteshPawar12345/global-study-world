import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, User, LogIn, Globe, Bell } from 'lucide-react'
import { useStudentAuth } from '../context/StudentAuthContext'
import ChatModal from './ChatModal'
import { fetchChatNotifications } from '../services/chatApi'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, student, logout } = useStudentAuth()
  const studentToken = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null
  const [showChatDropdown, setShowChatDropdown] = useState(false)
  const [chatNotifications, setChatNotifications] = useState([])
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [navChatConversation, setNavChatConversation] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const refreshChatNotifications = useCallback(async () => {
    if (!isAuthenticated || !studentToken) return
    try {
      const data = await fetchChatNotifications(studentToken)
      setChatUnreadCount(data.totalUnread || 0)
      setChatNotifications(data.recentUnread || [])
    } catch (error) {
      console.error('Failed to fetch chat notifications', error)
    }
  }, [isAuthenticated, studentToken])

  useEffect(() => {
    if (!isAuthenticated || !studentToken) return
    refreshChatNotifications()
    const interval = setInterval(refreshChatNotifications, 20000)
    return () => clearInterval(interval)
  }, [isAuthenticated, studentToken, refreshChatNotifications])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const searchQuery = formData.get('search')
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Global Education</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-primary-500 transition-colors">
              Find Consultants
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-primary-500 transition-colors">
              How It Works
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary-500 transition-colors">
              Blog
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-500 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-500 transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
                <Link
                  to="/consultant/register"
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                >
                  Become a Consultant
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 relative">
                <span className="text-sm text-gray-600">
                  Welcome, {student?.first_name}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowChatDropdown((prev) => !prev)}
                    className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {chatUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                      </span>
                    )}
                  </button>
                  {showChatDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold text-gray-900">Chat Notifications</p>
                        <p className="text-xs text-gray-500">
                          {chatUnreadCount > 0 ? `${chatUnreadCount} unread` : 'All caught up'}
                        </p>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y">
                        {chatNotifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No new messages
                          </div>
                        ) : (
                          chatNotifications.map((message) => {
                            const consultantInfo = message.conversation?.consultant
                            return (
                              <button
                                key={message.id}
                                onClick={() => {
                                  setNavChatConversation(message.conversation)
                                  setIsChatOpen(true)
                                  setShowChatDropdown(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50"
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {consultantInfo?.agency_name || consultantInfo?.contact_person || 'Consultant'}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                  {message.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/student/dashboard"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/student/login"
                className="btn-primary flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-primary-500 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/search"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Consultants
              </Link>
              <Link
                to="/how-it-works"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t pt-3 mt-3">
                {!isAuthenticated && (
                  <Link
                    to="/consultant/register"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Become a Consultant
                  </Link>
                )}
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Welcome, {student?.first_name}
                    </div>
                    <Link
                      to="/student/dashboard"
                      className="block px-3 py-2 text-primary-500 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block px-3 py-2 text-gray-700 hover:text-primary-500 transition-colors w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/student/login"
                    className="block px-3 py-2 text-primary-500 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Student Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Search Consultants</h3>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by country, course, or consultant name..."
                  className="input-field"
                  autoFocus
                />
                <button type="submit" className="btn-primary w-full">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChatModal
        isOpen={isChatOpen && !!navChatConversation}
        onClose={() => {
          setIsChatOpen(false)
          setNavChatConversation(null)
        }}
        conversation={navChatConversation}
        userType="student"
        authToken={studentToken}
        onConversationUpdated={refreshChatNotifications}
      />
    </nav>
  )
}

export default Navbar

