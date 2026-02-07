# LearnSphere - eLearning Platform

A comprehensive eLearning platform built for the Odoo Hackathon 2026. LearnSphere provides a complete learning experience with separate interfaces for instructors/admins and learners.

![LearnSphere](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80)

## 🚀 Features

### Module A - Instructor/Admin Backoffice

#### A1) Courses Dashboard
- **Kanban & List Views**: Toggle between grid and list views for course management
- **Search Functionality**: Quickly find courses by name
- **Course Metrics**: View course stats (views, lessons count, duration, published status)
- **Actions**: Edit, Share, and Delete courses

#### A2) Course Form & Editor
- **Rich Course Configuration**: Title, tags, website, image, and course admin
- **Publish Toggle**: Control course visibility on the website
- **Four Tabs**:
  - **Content**: Manage lessons with add/edit/delete functionality
  - **Description**: Rich text course description
  - **Options**: Configure visibility (Everyone/Signed In) and access rules (Open/Invitation/Payment)
  - **Quiz**: List and manage course quizzes

#### A3-A4) Lesson Management
- **Multiple Content Types**: Video, Document, Image, and Quiz lessons
- **Lesson Editor**: Three-tab interface (Content, Description, Attachments)
- **Type-Specific Fields**:
  - Video: URL, duration
  - Document: Upload, allow download toggle
  - Image: Upload, allow download toggle
- **Additional Resources**: Attach files and external links to lessons

#### A5) Course Options
- **Visibility Rules**: Control who can see the course
- **Access Rules**: Open, On Invitation, or On Payment (with price field)
- **Course Admin**: Assign course responsible person

#### A6-A7) Quiz Builder
- **Question Management**: Add, edit, and delete quiz questions
- **Multiple Choice**: Support for multiple options per question
- **Correct Answer Marking**: Visual selection of correct answers
- **Rewards System**: Configure points for 1st, 2nd, 3rd, and 4th+ attempts

#### A8) Reporting Dashboard
- **Overview Cards**: Total Participants, Yet to Start, In Progress, Completed
- **Filterable Table**: Click cards to filter learner progress
- **Detailed Metrics**: 
  - Course name, Participant name
  - Enrolled date, Start date, Completion date
  - Time spent, Completion percentage
  - Status tracking
- **Customizable Columns**: Show/hide columns based on preference

### Module B - Learner Website/App

#### B1-B2) My Courses Page
- **Course Cards**: Beautiful course cards with images, tags, and descriptions
- **Search**: Find courses quickly
- **Smart Buttons**: 
  - "Join Course" for guests
  - "Start" for enrolled but not started
  - "Continue" for in-progress courses
  - "Buy $X" for paid courses
- **My Profile Panel** (Logged-in users):
  - Total points display
  - Current badge with visual indicator
  - Progress to next badge
  - Complete badge level hierarchy

#### B3) Course Detail Page
- **Course Overview Tab**:
  - Course image, title, and description
  - Progress bar showing completion percentage
  - Lessons list with completion status icons
  - Search lessons functionality
  - Start/Review lesson buttons
- **Ratings & Reviews Tab**:
  - Average rating with star display
  - Review list with user avatars
  - Add review functionality for logged-in users
  - 5-star rating system

#### B4-B5) Full-Screen Lesson Player
- **Immersive Interface**: Distraction-free learning environment
- **Collapsible Sidebar**:
  - Course progress indicator
  - Lesson list with status icons
  - Additional attachments displayed under lessons
  - Complete course button (when 100% done)
- **Content Viewers**:
  - Video Player: Embedded YouTube/Drive videos
  - Document Viewer: Display documents with download option
  - Image Viewer: Display images with download option
- **Navigation**: Back, Previous, Next, Mark Complete buttons

#### B6-B7) Quiz Experience
- **Quiz Intro Screen**: Shows total questions and multiple attempts info
- **One Question Per Page**: Focused quiz-taking experience
- **Progress Indicator**: Visual dots showing question progress
- **Radio Button Selection**: Clear answer selection
- **Points Popup**: Beautiful modal showing earned points after quiz
- **Multiple Attempts**: Support for retaking quizzes with reduced points

#### B8) Gamification
- **Points System**: Earn points by completing quizzes
- **Attempt-Based Rewards**: Decreasing points for multiple attempts
- **Badge Levels**:
  - Newbie (0 points) - Gray
  - Explorer (20 points) - Green
  - Achiever (40 points) - Blue
  - Specialist (60 points) - Purple
  - Expert (80 points) - Orange
  - Master (100 points) - Red
- **Progress Tracking**: Visual progress to next badge

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will open at `http://localhost:3000`

### 3. Build for Production

\`\`\`bash
npm run build
\`\`\`

### 4. Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## 👥 Demo Accounts

### Admin Account
- **Email**: admin@learnsphere.com
- **Password**: admin123
- **Access**: Full admin dashboard, course management, reporting

### Instructor Account
- **Email**: instructor@learnsphere.com
- **Password**: instructor123
- **Access**: Course creation, quiz building, reporting

### Learner Account
- **Email**: learner@learnsphere.com
- **Password**: learner123
- **Access**: Course browsing, learning, quizzes, reviews
- **Points**: 45 (Explorer badge)

## 📁 Project Structure

\`\`\`
oodoE-learning/
├── src/
│   ├── context/
│   │   └── AppContext.jsx          # Global state management
│   ├── layouts/
│   │   ├── AdminLayout.jsx         # Admin/Instructor layout
│   │   └── LearnerLayout.jsx       # Learner website layout
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── CoursesDashboard.jsx    # Courses list (Kanban/List)
│   │   │   ├── CourseForm.jsx          # Course editor
│   │   │   ├── QuizBuilder.jsx         # Quiz creation
│   │   │   └── ReportingDashboard.jsx  # Analytics & reporting
│   │   ├── learner/
│   │   │   ├── MyCourses.jsx           # Course browsing
│   │   │   ├── CourseDetail.jsx        # Course overview & reviews
│   │   │   └── LessonPlayer.jsx        # Full-screen learning
│   │   └── auth/
│   │       ├── Login.jsx               # Login page
│   │       └── Register.jsx            # Registration page
│   ├── App.jsx                      # Main app component with routes
│   ├── main.jsx                     # App entry point
│   └── index.css                    # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
\`\`\`

## 🎯 Key Features Implementation

### Role-Based Access Control
- **Admin**: Full access to all features
- **Instructor**: Can create/edit courses, view reports
- **Learner**: Can browse courses, learn, take quizzes
- **Guest**: Can view public courses, must login to enroll

### Visibility & Access Rules
- **Visibility**: Who can see the course (Everyone / Signed In)
- **Access**: Who can start learning (Open / On Invitation / On Payment)

### Progress Tracking
- Automatic progress calculation based on completed lessons
- Visual progress bars throughout the app
- Status indicators: Not Started, In Progress, Completed
- Time spent tracking

### Quiz System
- Multiple-choice questions with single correct answer
- One question per page for focused learning
- Multiple attempts with decreasing points
- Immediate feedback and points popup
- Attempt history tracking

### Gamification
- Points earned from quiz completion
- Badge system with 6 levels
- Visual progress indicators
- Profile panel showing achievements

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean and professional interface
- **Smooth Transitions**: Animated interactions throughout
- **Accessible**: WCAG-compliant color contrasts and keyboard navigation
- **Intuitive UX**: Clear navigation and user feedback

## 🔄 Data Flow

1. **Context API**: Centralized state management in `AppContext.jsx`
2. **Mock Data**: Initial data for courses, users, quizzes, enrollments
3. **LocalStorage**: Persists user authentication
4. **Real-time Updates**: Instant UI updates on state changes

## 🚧 Future Enhancements

- Backend integration (REST API / GraphQL)
- Database persistence (MongoDB / PostgreSQL)
- Real file uploads (AWS S3 / Cloudinary)
- Email notifications for invitations
- Live video streaming
- Discussion forums
- Certificates on course completion
- Payment gateway integration (Stripe / PayPal)
- Advanced analytics and insights
- Mobile app (React Native)

## 📝 License

This project was created for the Odoo Hackathon 2026.

## 🤝 Contributing

This is a hackathon project. Feel free to fork and enhance it!

## 📧 Contact

For questions or feedback about this project, please reach out during the hackathon.

---

**Built with ❤️ for Odoo Hackathon 2026**
