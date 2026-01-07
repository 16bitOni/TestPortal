# Test Portal - Online Examination System

A comprehensive online examination system built with Next.js and Supabase, featuring separate admin and student portals.

## Features

### Admin Portal
- Admin authentication with ID and password
- Create and manage exams with multiple-choice questions
- Register students for specific exams
- Generate student credentials automatically
- View exam results and analytics
- Activate/deactivate exams

### Student Portal
- Student authentication with generated credentials
- Take exams with timer functionality
- Navigate between questions
- Auto-submit when time expires
- Secure exam environment

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key
```

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `src/lib/database-schema.sql` to create the required tables

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Admin Access
1. Go to Admin Portal
2. Login with:
   - Admin ID: `admin`
   - Password: `admin123`

### Creating an Exam
1. Click "Create New Exam"
2. Fill in exam details (title, description, duration)
3. Add questions with multiple choice options
4. Mark the correct answer for each question
5. Submit to create the exam

### Registering Students
1. Go to the exam management page
2. Click "Add Student"
3. Enter student name or use "Generate" for automatic credentials
4. Students will receive their login credentials

### Student Access
1. Students go to Student Portal
2. Login with provided Student ID and Password
3. Take the exam within the time limit
4. Submit answers before time expires

## Database Schema

The application uses the following main tables:

- `admins` - Admin user accounts
- `exams` - Exam definitions
- `questions` - Exam questions with options and correct answers
- `students` - Student accounts linked to specific exams
- `student_results` - Exam results with scores and timing

## Security Features

- JWT-based authentication
- Role-based access control (Admin/Student)
- Exam session management
- Automatic logout after exam submission
- Password-protected exam access

## API Endpoints

### Admin APIs
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/exams` - List admin's exams
- `POST /api/admin/create-exam` - Create new exam
- `GET /api/admin/exam/[id]` - Get exam details
- `POST /api/admin/exam/[id]/students` - Add student to exam

### Student APIs
- `POST /api/student/login` - Student authentication
- `GET /api/student/exam` - Get exam questions
- `POST /api/student/submit` - Submit exam answers

## Development

To extend the application:

1. Add new API routes in `src/app/api/`
2. Create new pages in `src/app/`
3. Update database schema as needed
4. Add new components in `src/components/`

## Production Deployment

1. Set up environment variables in your hosting platform
2. Configure Supabase for production
3. Update CORS settings in Supabase
4. Deploy using Vercel, Netlify, or your preferred platform

## License

This project is open source and available under the MIT License.