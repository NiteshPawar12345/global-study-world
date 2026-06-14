import { Link } from 'react-router-dom'
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">Global Education</span>
            </div>
            <p className="text-gray-300 text-sm">
              Connecting students with verified international education consultants worldwide. 
              Your trusted partner for study abroad success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white transition-colors">
                  Find Consultants
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Consultants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Consultants</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/consultant/register" className="text-gray-300 hover:text-white transition-colors">
                  Register as Consultant
                </Link>
              </li>
              <li>
                <Link to="/consultant/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Consultant Login
                </Link>
              </li>
              <li>
                <Link to="/consultant/benefits" className="text-gray-300 hover:text-white transition-colors">
                  Benefits & Features
                </Link>
              </li>
              <li>
                <Link to="/consultant/support" className="text-gray-300 hover:text-white transition-colors">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">info@globaleducation.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">+91 84600 00006</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-400">Trusted by:</span>
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded px-3 py-1">
                  <span className="text-xs text-gray-600 font-medium">Study in India</span>
                </div>
                <div className="bg-white rounded px-3 py-1">
                  <span className="text-xs text-gray-600 font-medium">SEPC/IEC</span>
                </div>
                <div className="bg-white rounded px-3 py-1">
                  <span className="text-xs text-gray-600 font-medium">Digital India</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Global Education. All rights reserved.
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-800 mt-4 pt-4">
          <div className="flex flex-wrap justify-center space-x-6 text-sm">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/nda" className="text-gray-400 hover:text-white transition-colors">
              NDA Agreement
            </Link>
            <Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

