# Global Education Backend

This is the backend API for the Global Education platform, built with Node.js, Express, and MySQL.

## Features

- **User Authentication**: JWT-based authentication for students and consultants
- **Student Management**: Student registration, profile management, and inquiry tracking
- **Consultant Management**: Consultant registration, approval workflow, and profile management
- **Lead Matching**: Automated matching of student inquiries with suitable consultants
- **Review System**: Rating and review system for consultants
- **Admin Dashboard**: Administrative functions for managing the platform
- **Search & Filtering**: Advanced search capabilities for consultants
- **Payment Integration**: Commission tracking and invoicing system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Built-in Sequelize validation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   ```bash
   # Login to MySQL as root
   mysql -u root -p
   
   # Run the setup script
   source database/setup.sql
   
   # Create the application user
   source database/user_setup.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Setup

### 1. Create Database and User

Run the following SQL commands to set up the database:

```sql
-- Create database
CREATE DATABASE global_education;
USE global_education;

-- Create user
CREATE USER 'global_edu_user'@'localhost' IDENTIFIED BY 'GlobalEdu@2024!';

-- Grant permissions
GRANT ALL PRIVILEGES ON global_education.* TO 'global_edu_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Run Setup Scripts

```bash
# Run the main setup script
mysql -u global_edu_user -p global_education < database/setup.sql

# Run the user setup script (as root)
mysql -u root -p < database/user_setup.sql
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_NAME=global_education
DB_USER=global_edu_user
DB_PASSWORD=GlobalEdu@2024!
DB_HOST=localhost
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/consultant` - Consultant registration
- `POST /api/auth/login/student` - Student login
- `POST /api/auth/login/consultant` - Consultant login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/inquiries` - Get student inquiries

### Consultants
- `GET /api/consultants` - Get all consultants (public)
- `GET /api/consultants/:id` - Get consultant by ID (public)
- `GET /api/consultants/profile/me` - Get consultant profile (authenticated)
- `PUT /api/consultants/profile/me` - Update consultant profile

### Inquiries
- `POST /api/inquiries` - Create new inquiry
- `GET /api/inquiries/consultant` - Get consultant inquiries
- `PUT /api/inquiries/:id/status` - Update inquiry status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/consultant/:id` - Get consultant reviews

### Search
- `GET /api/search/consultants` - Search consultants
- `GET /api/search/suggestions` - Get search suggestions

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/consultants/pending` - Get pending consultants
- `PUT /api/admin/consultants/:id/status` - Approve/reject consultant
- `GET /api/admin/inquiries` - Get all inquiries

## Database Schema

### Main Tables

- **students** - Student user accounts
- **consultants** - Consultant user accounts
- **student_inquiries** - Student inquiries and lead matching
- **reviews** - Consultant reviews and ratings
- **invoices** - Commission invoices for consultants
- **countries** - Available study destinations
- **courses** - Available courses and programs

### Key Relationships

- Students can have multiple inquiries
- Consultants can handle multiple inquiries
- Inquiries can have reviews
- Consultants can have multiple invoices

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

### Database Migrations

The application uses Sequelize's sync functionality for development. In production, you should use proper migrations.

```bash
# Sync database (development only)
npx sequelize-cli db:migrate
```

### Testing

```bash
# Run tests (when implemented)
npm test
```

## Production Deployment

1. **Set production environment variables**
2. **Use a process manager like PM2**
3. **Set up reverse proxy with Nginx**
4. **Configure SSL certificates**
5. **Set up database backups**

```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "global-education-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Rate limiting is implemented
- CORS is configured
- Helmet is used for security headers
- Input validation is implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.








