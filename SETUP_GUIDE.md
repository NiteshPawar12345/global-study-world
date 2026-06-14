# Global Education Website - Setup Guide

This guide will help you set up the complete Global Education website with both frontend and backend components.

## 🏗️ Project Structure

```
Global_Education/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── admin/            # Admin panel (React)
└── package.json      # Root package.json
```

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Database Setup

#### Option A: Automated Setup (Recommended)

1. **Start MySQL service**
   ```bash
   # Windows (if installed as service)
   net start mysql
   
   # macOS (if installed via Homebrew)
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

4. **Edit .env file** with your MySQL root password:
   ```env
   DB_ROOT_PASSWORD=your_mysql_root_password
   ```

5. **Run automated setup**
   ```bash
   npm run setup-db
   ```

#### Option B: Manual Setup

1. **Login to MySQL as root**
   ```bash
   mysql -u root -p
   ```

2. **Run setup scripts**
   ```sql
   source database/setup.sql;
   source database/user_setup.sql;
   exit;
   ```

### 2. Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Edit .env file
   nano .env
   ```

   Update the following variables:
   ```env
   DB_NAME=global_education
   DB_USER=global_edu_user
   DB_PASSWORD=GlobalEdu@2024!
   DB_HOST=localhost
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### 4. Admin Panel Setup

1. **Navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the admin panel**
   ```bash
   npm run dev
   ```

   The admin panel will be available at `http://localhost:5173`

## 🔧 Configuration

### Database Configuration

The application uses MySQL with the following default settings:

- **Database Name**: `global_education`
- **Username**: `global_edu_user`
- **Password**: `GlobalEdu@2024!`
- **Host**: `localhost`
- **Port**: `3306`

### API Endpoints

The backend provides the following main API endpoints:

- **Authentication**: `/api/auth/*`
- **Students**: `/api/students/*`
- **Consultants**: `/api/consultants/*`
- **Inquiries**: `/api/inquiries/*`
- **Reviews**: `/api/reviews/*`
- **Search**: `/api/search/*`
- **Admin**: `/api/admin/*`

### Default Admin Account

A default admin account is created during setup:

- **Username**: `admin`
- **Email**: `admin@globaleducation.in`
- **Password**: `admin123`

**⚠️ Important**: Change the default admin password after first login!

## 📊 Database Schema

### Key Tables

1. **students** - Student user accounts
2. **consultants** - Consultant user accounts  
3. **student_inquiries** - Student inquiries and lead matching
4. **reviews** - Consultant reviews and ratings
5. **invoices** - Commission invoices for consultants
6. **countries** - Available study destinations
7. **courses** - Available courses and programs

### Sample Data

The setup script includes:
- 25+ countries (USA, Canada, UK, Australia, etc.)
- 40+ courses (Engineering, Business, Medicine, etc.)
- Default admin user
- System settings

## 🎯 Features Implemented

### ✅ Completed Features

- **Frontend**:
  - Responsive homepage with hero section
  - Advanced search and filtering
  - Consultant profile pages
  - Student dashboard
  - Content pages (About, Contact, etc.)
  - Mobile-first responsive design

- **Backend**:
  - User authentication (JWT)
  - Student and consultant management
  - Search and filtering APIs
  - Review system
  - Admin APIs
  - Database models and relationships

### 🚧 Features in Development

- Consultant dashboard
- Admin dashboard
- Lead matching system
- Payment integration
- Email notifications
- Chatbot integration
- Analytics setup

## 🔍 Testing the Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Get consultants
curl http://localhost:5000/api/consultants
```

### 2. Test Frontend

1. Open `http://localhost:3000`
2. Navigate through the pages
3. Test the search functionality
4. Check responsive design on mobile

### 3. Test Database

```bash
# Connect to database
mysql -u global_edu_user -p global_education

# Check tables
SHOW TABLES;

# Check sample data
SELECT * FROM countries LIMIT 5;
SELECT * FROM courses LIMIT 5;
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify credentials in .env file
   - Ensure database and user exist

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:5000 | xargs kill`

3. **Module Not Found**
   - Run `npm install` in the respective directory
   - Clear node_modules and reinstall

4. **Permission Denied (MySQL)**
   - Ensure MySQL user has proper permissions
   - Run user setup script as root

### Getting Help

1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check database connectivity

## 📈 Next Steps

After successful setup:

1. **Customize the branding** in frontend components
2. **Configure email settings** for notifications
3. **Set up payment gateways** (Stripe, Razorpay)
4. **Configure analytics** (Google Analytics, Facebook Pixel)
5. **Set up chatbot** (ProProfs, Tidio)
6. **Deploy to production** with proper SSL and domain

## 🔐 Security Notes

- Change default passwords
- Use strong JWT secrets
- Configure CORS properly
- Set up rate limiting
- Use HTTPS in production
- Regular database backups

## 📞 Support

For issues or questions:
1. Check this setup guide
2. Review the README files in each directory
3. Check the console logs for errors
4. Verify all prerequisites are installed

---

**🎉 Congratulations!** You now have a fully functional Global Education website running locally. The platform includes student and consultant management, search functionality, and a robust backend API ready for production deployment.








