# Micro Projects Management System

A comprehensive web application for managing micro projects in educational institutions. This system allows administrators to manage mentors, classes, problem statements, and sessions, while providing mentors with tools to manage their sessions and projects.

## Features

### Admin Features
- **Dashboard**: Overview with statistics and quick access to all management functions
- **Mentor Management**: Create and manage mentors with detailed profiles including skills, hobbies, and social links
- **Class Management**: Create classes with batches and assign mentors
- **Problem Statement Management**: Create and manage problem statements with difficulty levels, tech stacks, and team size requirements
- **Session Management**: Create and schedule micro project sessions with auto-population functionality
- **Project Management**: Track and manage all projects across classes

### Mentor Features
- **Session Management**: View and update session progress, upload attendance images
- **Project Management**: Create and manage projects, track team members
- **Substitute Management**: Assign substitute mentors when unavailable

### Public Features
- **Problem Statement Browser**: Public access to view all available problem statements
- **Filtering**: Filter by academic year, difficulty level, and domain

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Simple session-based authentication (no bcrypt for demo)

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MPSiteIdea
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=microprojects
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

### Admin Login
- **Username**: admin
- **Password**: admin123
- **URL**: `/admin/login`

### Mentor Login
- Create mentors through the admin panel first
- Use the mentor's username and password to login
- **URL**: `/mentors/login`

## Database Schema

### Collections

1. **mentors**: Mentor profiles with skills, hobbies, and academic information
2. **classes**: Class information with batches and assigned mentors
3. **sessions**: Micro project sessions with status tracking
4. **problemStatements**: Available problem statements for projects
5. **projects**: Student projects with team members and progress

### Key Features

- **Academic Year Management**: All data is organized by academic years
- **Batch System**: Classes can have multiple batches (e.g., 2028, 2029)
- **Session Auto-population**: Automatically create recurring sessions
- **Substitute Mentor System**: Handle mentor unavailability
- **Project Tracking**: Complete project lifecycle management

## API Endpoints

### Admin APIs
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/admin/mentors` - Create mentors
- `GET /api/admin/mentors` - List mentors
- `POST /api/admin/classes` - Create classes
- `GET /api/admin/classes` - List classes
- `POST /api/admin/problems` - Create problem statements
- `GET /api/admin/problems` - List problem statements
- `POST /api/admin/sessions` - Create sessions
- `GET /api/admin/sessions` - List sessions

### Mentor APIs
- `POST /api/mentors/login` - Mentor authentication
- `GET /api/mentors/sessions` - Get mentor's sessions
- `PUT /api/mentors/sessions` - Update session progress

### Public APIs
- `GET /api/admin/problems` - Public access to problem statements

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin pages
│   ├── mentors/         # Mentor pages
│   ├── problems/        # Public problem statements
│   └── api/            # API routes
├── components/          # Reusable components
├── data/               # TypeScript interfaces
└── lib/                # Utility functions
```

## Key Features Implemented

✅ **Simple Authentication System** (no bcrypt)
✅ **Admin Dashboard** with statistics
✅ **Mentor Management** with comprehensive profiles
✅ **Class Management** with batch system
✅ **Problem Statement Management** with filtering
✅ **Session Management** with auto-population
✅ **Public Problem Statement Browser**
✅ **Academic Year Organization**
✅ **Responsive UI** with Tailwind CSS

## Future Enhancements

- Email notifications for session updates
- File upload for project documents
- Advanced reporting and analytics
- Mobile app for mentors
- Integration with learning management systems
- Real-time notifications
- Advanced search and filtering

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.
