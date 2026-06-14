# Admin Panel Setup Guide

This guide will help you set up and run the separate admin panel for the Global Education platform.

## 🚀 Quick Start

### 1. Install Dependencies

Navigate to the admin directory and install dependencies:

```bash
cd admin
npm install
```

### 2. Start the Admin Panel

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## 🔧 Features

### Authentication System
- **Admin Signup**: Create new admin accounts with username, email, password, and profile picture
- **Admin Login**: Secure login with email and password
- **Forgot Password**: Password reset functionality with email tokens
- **Protected Routes**: Dashboard access requires authentication

### Admin Dashboard
- **Overview**: Platform statistics and recent activity
- **Consultant Management**: View, approve, and manage consultant applications
- **Inquiry Management**: Monitor student inquiries and assignments
- **Revenue Analytics**: Track platform revenue and performance

## 📁 Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── AdminLogin.jsx          # Login form
│   │   ├── AdminSignup.jsx          # Signup form with profile picture
│   │   ├── ForgotPassword.jsx       # Forgot password & reset forms
│   │   ├── AdminDashboard.jsx       # Main dashboard
│   │   └── ProtectedRoute.jsx       # Route protection
│   ├── context/
│   │   └── AdminAuthContext.jsx     # Authentication context
│   ├── App.jsx                      # Main app with routing
│   └── App.css                      # Tailwind CSS styles
├── package.json                     # Dependencies
├── tailwind.config.js              # Tailwind configuration
└── postcss.config.js               # PostCSS configuration
```

## 🔐 Default Admin Account

After running the database setup, you can use these credentials:

- **Email**: `admin@globaleducation.in`
- **Password**: `admin123`
- **Role**: `super_admin`

## 🛠️ Backend API Endpoints

The admin panel communicates with these backend endpoints:

### Authentication
- `POST /api/admin/signup` - Create new admin account
- `POST /api/admin/login` - Admin login
- `POST /api/admin/forgot-password` - Request password reset
- `POST /api/admin/reset-password` - Reset password with token
- `GET /api/admin/me` - Get current admin info
- `POST /api/admin/logout` - Logout

### Dashboard Data
- `GET /api/admin/overview` - Dashboard statistics
- `GET /api/admin/consultants` - Consultant management data
- `GET /api/admin/inquiries` - Inquiry management data

## 🎨 UI Components

### Login Form
- Email and password fields
- Password visibility toggle
- Forgot password link
- Signup link

### Signup Form
- Username field
- Email field
- Profile picture upload
- Password and confirm password fields
- Password visibility toggles

### Dashboard
- Statistics cards
- Tabbed interface (Overview, Consultants, Inquiries, Revenue)
- Quick actions sidebar
- Responsive design

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected routes
- File upload validation
- Input validation and sanitization

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🚨 Important Notes

1. **Profile Pictures**: Uploaded images are stored in `backend/uploads/admin/`
2. **File Size Limit**: Profile pictures are limited to 5MB
3. **Token Expiry**: JWT tokens expire after 7 days
4. **Password Reset**: Reset tokens expire after 1 hour
5. **Auto-verification**: New admin accounts are auto-verified (change this in production)

## 🔧 Customization

### Styling
- Uses Tailwind CSS for styling
- Custom button classes defined in `App.css`
- Easy to customize colors and themes

### Authentication
- Modify token expiry in `backend/routes/adminAuth.js`
- Change password requirements in validation
- Add email verification if needed

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure backend CORS is configured for admin panel
2. **File Upload Issues**: Check uploads directory permissions
3. **Token Errors**: Verify JWT secret is set in environment variables
4. **Database Connection**: Ensure MySQL is running and accessible

### Development Tips

1. Check browser console for API errors
2. Verify backend server is running on port 5000
3. Check network tab for failed requests
4. Ensure all dependencies are installed

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database is properly configured
4. Check that all required dependencies are installed





