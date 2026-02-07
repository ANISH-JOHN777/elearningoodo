# 🚀 LearnSphere Quick Start Guide

Welcome to LearnSphere! This guide will help you quickly explore all the features of your eLearning platform.

## ✅ Setup Complete!

Your application is now running at: **http://localhost:3000**

## 👥 Test Accounts

### 1. Admin Account
```
Email: admin@learnsphere.com
Password: admin123
```
**What you can do:**
- Access full admin dashboard
- Create and manage courses
- View reporting analytics
- Configure all course settings

### 2. Instructor Account
```
Email: instructor@learnsphere.com
Password: instructor123
```
**What you can do:**
- Create and edit courses
- Build quizzes with rewards
- View learner progress reports
- Publish courses to website

### 3. Learner Account
```
Email: learner@learnsphere.com
Password: learner123
```
**What you can do:**
- Browse and enroll in courses
- Learn with full-screen player
- Take quizzes and earn points
- Add ratings and reviews
- Track your badges (Currently: Explorer with 45 points!)

## 🎯 Quick Feature Tour

### For Admins/Instructors:

1. **Login** with admin/instructor credentials
2. **View Dashboard**: See all courses in Kanban or List view
3. **Create a Course**: Click "+ Create Course" button
4. **Add Lessons**: 
   - Go to course edit page
   - Click "Content" tab
   - Click "Add Content"
   - Choose type: Video, Document, or Image
5. **Build a Quiz**:
   - Click "Quiz" tab in course editor
   - Click "Add Quiz"
   - Add questions and set rewards
6. **Publish Course**: Toggle "Publish" switch in course editor
7. **View Reports**: Click "Reporting" in sidebar to see learner progress

### For Learners:

1. **Browse Courses**: Click "Courses" in navbar
2. **Enroll**: Click "Start" or "Continue" on any course card
3. **Learn**: 
   - Click on a lesson to open full-screen player
   - Watch videos, read documents, view images
   - Use sidebar to navigate between lessons
4. **Take Quizzes**:
   - Click on quiz lesson
   - Click "Start Quiz"
   - Answer questions one by one
   - Earn points based on your attempt!
5. **Add Reviews**: Go to course detail → Reviews tab → "Add Review"
6. **Track Progress**: Check your profile panel on My Courses page

## 🎮 Try These Scenarios

### Scenario 1: Complete Learning Journey (Learner)
1. Login as learner
2. Click "Continue" on "Introduction to React" course
3. Complete each lesson (video, document, quiz)
4. Take the quiz and earn points
5. Watch your badge progress!
6. Complete the course and leave a review

### Scenario 2: Create Full Course (Instructor)
1. Login as instructor
2. Create a new course with title "My Test Course"
3. Add course details (description, tags, image)
4. Add 3 lessons:
   - Video lesson with YouTube URL
   - Document lesson
   - Quiz lesson
5. Set visibility to "Everyone" and access to "Open"
6. Toggle "Publish" ON
7. Preview as learner (logout and browse)

### Scenario 3: Track Progress (Admin)
1. Login as admin
2. Go to "Reporting" in sidebar
3. Click "In Progress" card to filter
4. Check learner progress percentages
5. Use "Columns" button to customize view

## 🎨 UI Features to Explore

- **Kanban/List Toggle**: In courses dashboard
- **Search**: Try searching courses and lessons
- **Progress Bars**: Visible throughout the app
- **Badge System**: Check profile panel (learner view)
- **Sidebar Toggle**: In full-screen lesson player
- **Tab Navigation**: In course editor and course detail
- **Modal Popups**: For lesson editing and points display
- **Responsive Design**: Resize your browser window

## 📊 Sample Data Included

- **3 Courses**:
  - Introduction to React (Published, 3 lessons including quiz)
  - Advanced JavaScript (Draft)
  - UI/UX Design Masterclass (Published, paid)
  
- **1 Quiz**: React Components Quiz with 2 questions

- **1 Enrollment**: Learner is enrolled in React course with 33% progress

- **1 Review**: Learner's 5-star review on React course

## 🔧 Customization Tips

### Add More Courses
1. Login as admin/instructor
2. Click "+ Create Course"
3. Fill in course details
4. Add lessons and quizzes
5. Publish!

### Modify Badge Levels
Edit `src/context/AppContext.jsx` and modify the `BADGE_LEVELS` array

### Change Theme Colors
Edit `tailwind.config.js` to change the primary color palette

### Add More Users
Edit the `initialUsers` array in `src/context/AppContext.jsx`

## 🎯 Key Concepts

### Visibility vs Access
- **Visibility**: Who can SEE the course (Everyone / Signed In)
- **Access**: Who can START learning (Open / Invitation / Payment)

### Points & Badges
- Earn points by completing quizzes
- Points decrease with multiple attempts
- 6 badge levels from Newbie to Master

### Progress Tracking
- Automatic calculation based on completed lessons
- Real-time updates across all views
- Status: Not Started → In Progress → Completed

## 🐛 Troubleshooting

### App not loading?
- Check if development server is running
- Visit http://localhost:3000
- Clear browser cache if needed

### Can't see courses as guest?
- Some courses are set to "Signed In" visibility
- Login to see all published courses

### Quiz not working?
- Make sure you've created quiz questions in the quiz builder
- Check that quiz has at least one question

## 📝 Next Steps

1. **Explore All Features**: Try every button and feature
2. **Test Different Roles**: Login with different accounts
3. **Create Content**: Build your own courses and lessons
4. **Customize**: Modify colors, text, and features
5. **Prepare Demo**: Practice your hackathon presentation!

## 🎉 Good Luck with Your Hackathon!

You now have a fully functional eLearning platform with:
- ✅ Admin Dashboard
- ✅ Course Management
- ✅ Lesson Creation
- ✅ Quiz Builder
- ✅ Learner Interface
- ✅ Progress Tracking
- ✅ Gamification
- ✅ Reviews System
- ✅ Reporting

**Happy Learning! 🚀**
