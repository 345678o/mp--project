# Project Showcase Platform - Backend Documentation

## Overview
This project now includes a complete backend system built with Next.js API routes, SQLite database, and file upload capabilities.

## Backend Features

### 🗄️ Database
- **SQLite Database** with two main tables:
  - `projects` - Stores project information
  - `project_files` - Stores uploaded file metadata
- **Auto-generated reference numbers** in format: `MP[Year][Branch]-[Section][Type][Batch][TeamNo]`
- **Full CRUD operations** for projects

### 📁 File Upload System
- **Secure file uploads** with type validation
- **Organized storage** in `public/uploads/` directory
- **Support for multiple file types**:
  - Documents: PDF, DOC, DOCX, PPT, PPTX, TXT
  - Images: JPEG, PNG, GIF, WEBP
- **File size limits** (10MB per file, max 10 files per request)

### 🔌 API Endpoints

#### Projects API
- `GET /api/projects` - Get all projects (with search & pagination)
- `POST /api/projects` - Create new project
- `GET /api/projects/[referenceNo]` - Get specific project
- `PUT /api/projects/[referenceNo]` - Update project
- `DELETE /api/projects/[referenceNo]` - Delete project

#### File Upload API
- `POST /api/upload` - Upload files for a project

### 📊 Database Schema

#### Projects Table
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  project_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  technologies TEXT, -- JSON array
  github_url TEXT,
  live_url TEXT,
  ppt_url TEXT,
  abstract_url TEXT,
  research_paper_url TEXT,
  working_video_url TEXT,
  academic_year TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  batch TEXT NOT NULL,
  team_number TEXT NOT NULL,
  team_lead TEXT NOT NULL,
  team_lead_number TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Project Files Table
```sql
CREATE TABLE project_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  file_type TEXT NOT NULL, -- 'ppt', 'abstract', 'research_paper', 'image', 'documentation'
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Initialization
The database will be automatically created when you first run the application. It will be stored in:
```
MicroProjectsSiteIdea/data/projects.db
```

### 3. File Storage
Upload directories will be automatically created:
```
MicroProjectsSiteIdea/public/uploads/
├── documents/  # PPT, PDF, DOC files
└── images/     # Image files
```

### 4. Start the Application
```bash
npm run dev
```

## API Usage Examples

### Create a Project
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    referenceNo: 'MP2026-27CSE-ASB1001',
    title: 'My Awesome Project',
    description: 'A detailed description...',
    category: 'Web Development',
    projectType: 'Software',
    domain: 'Education',
    technologies: ['React', 'Node.js'],
    academicYear: '2026-2027',
    class: 'CSE - Computer Science Engineering',
    section: 'A',
    batch: 'Batch 1',
    teamNumber: '1',
    teamLead: 'John Doe',
    teamLeadNumber: '+1234567890',
    authorName: 'Jane Smith',
    authorEmail: 'jane@example.com'
  })
});
```

### Upload a File
```javascript
const formData = new FormData();
formData.append('referenceNo', 'MP2026-27CSE-ASB1001');
formData.append('fileType', 'ppt');
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Search Projects
```javascript
const response = await fetch('/api/projects?search=react&limit=10&offset=0');
```

## Security Features

- **File type validation** - Only allowed file types can be uploaded
- **File size limits** - Prevents large file uploads
- **SQL injection protection** - Using parameterized queries
- **Input validation** - Required fields validation
- **Unique constraints** - Prevents duplicate reference numbers

## Migration from localStorage

The frontend has been updated to use the new API endpoints instead of localStorage. All existing functionality is preserved:

- ✅ Project creation and editing
- ✅ File uploads (PPT, Abstract, Research Papers, Images)
- ✅ Search functionality
- ✅ Reference number generation
- ✅ Academic information management
- ✅ Team information tracking

## Development Notes

- Database file is created automatically on first run
- File uploads are stored in `public/uploads/` and served statically
- All API responses follow a consistent format with `success`, `data`, and `error` fields
- The system supports both URL links and file uploads for documents
- Edit functionality loads existing project data from the database

## Production Considerations

For production deployment, consider:

1. **Database**: Migrate to PostgreSQL or MySQL for better performance
2. **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage)
3. **Authentication**: Add user authentication and authorization
4. **Rate Limiting**: Implement API rate limiting
5. **Validation**: Add more robust server-side validation
6. **Logging**: Implement comprehensive logging
7. **Backup**: Set up database backup strategies