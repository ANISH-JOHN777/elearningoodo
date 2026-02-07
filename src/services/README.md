# Supabase Service Layer Documentation

## Overview
This document describes the complete service layer for the Supabase backend integration. Each service file handles specific business domains and can be imported and used throughout the React application.

## Services Index

### 1. **supabaseClient.js** (Core)
Single Supabase client instance used by all other services.

**Exports:**
- `supabase` - Initialized Supabase client

**Usage:**
```javascript
import { supabase } from '@/services/supabaseClient';
```

---

### 2. **authService.js** (Authentication)
Handles user authentication with Supabase Auth.

**Functions:**
- `signUp(email, password, metadata)` - Register new user
- `signIn(email, password)` - Login user
- `signOut()` - Logout current user
- `getCurrentSession()` - Get current auth session
- `resendVerificationEmail(email)` - Resend verification email
- `resetPassword(email)` - Initiate password reset
- `updatePassword(newPassword)` - Update user password
- `onAuthStateChange(callback)` - Subscribe to auth state changes

**Usage:**
```javascript
import { signIn, signUp, signOut } from '@/services/authService';

const { user, session, error } = await signIn('user@example.com', 'password');
```

---

### 3. **userService.js** (User Profiles)
Manages user profile data and user metadata.

**Functions:**
- `getUserProfile(userId)` - Get user profile
- `upsertUserProfile(userId, profileData)` - Create/update profile
- `updateUserProfile(userId, updates)` - Update specific fields
- `getAllUsers(page, pageSize)` - Get paginated user list
- `searchUsers(query)` - Search users by name/email
- `getUserStats(userId)` - Get user statistics
- `subscribeToUserProfile(userId, callback)` - Real-time profile updates

**Usage:**
```javascript
import { getUserProfile, updateUserProfile } from '@/services/userService';

const { data: profile } = await getUserProfile(userId);
await updateUserProfile(userId, { name: 'New Name', avatar: 'url' });
```

---

### 4. **courseService.js** (Courses)
Handles course CRUD operations and queries.

**Functions:**
- `getCourses(filters)` - Get courses with filters/pagination
- `getCourseById(courseId)` - Get single course
- `createCourse(courseData)` - Create new course
- `updateCourse(courseId, updates)` - Update course
- `deleteCourse(courseId)` - Delete course
- `getCoursesByInstructor(instructorId)` - Get instructor's courses
- `searchCourses(query)` - Search courses
- `getCourseWithEnrollmentStatus(courseId, userId)` - Course + enrollment info
- `getCourseStats(courseId)` - Course statistics
- `subscribeToCourses(callback)` - Real-time course updates

**Usage:**
```javascript
import { getCourses, getCourseById } from '@/services/courseService';

const { data: courses, count } = await getCourses({ 
  search: 'React', 
  page: 1, 
  pageSize: 10 
});
```

---

### 5. **enrollmentService.js** (Course Enrollments)
Manages course enrollments and enrollment status.

**Functions:**
- `enrollCourse(userId, courseId)` - Enroll user in course
- `unenrollCourse(userId, courseId)` - Remove enrollment
- `getUserEnrollments(userId, page, pageSize)` - Get user's courses
- `getCourseEnrollments(courseId, page, pageSize)` - Get course enrollees
- `getEnrollment(enrollmentId)` - Get single enrollment
- `getUserCourseEnrollment(userId, courseId)` - Check enrollment
- `updateEnrollment(enrollmentId, updates)` - Update enrollment
- `completeCourse(userId, courseId)` - Mark course complete
- `getUserCoursesWithDetails(userId)` - Enrollments with course data
- `subscribeToCourseEnrollments(courseId, callback)` - Real-time enrollment updates
- `subscribeToUserEnrollments(userId, callback)` - Real-time user enrollment updates

**Usage:**
```javascript
import { enrollCourse, getUserEnrollments } from '@/services/enrollmentService';

await enrollCourse(userId, courseId);
const { data: enrollments, count } = await getUserEnrollments(userId);
```

---

### 6. **rankingService.js** (Leaderboards & Points)
Handles rankings, points, and tier management.

**Functions:**
- `getLeaderboard(limit, timeframe)` - Global leaderboard
- `getUserRanking(userId)` - Get user's rank
- `addUserPoints(userId, points, activityType)` - Add points
- `setUserPoints(userId, points)` - Set absolute points
- `getCourseRankings(courseId, limit)` - Course-specific rankings
- `getTierInfo()` - Get tier definitions
- `getTopPerformersByTier(tier, limit)` - Top users by tier
- `getUserTierInfo(userId)` - User tier details
- `subscribeToRankings(callback)` - Real-time ranking updates
- `subscribeToUserRanking(userId, callback)` - User ranking updates

**Tier System:**
- Bronze: 0-500 points
- Silver: 500-1,500 points
- Gold: 1,500-3,000 points
- Platinum: 3,000-5,000 points
- Diamond: 5,000+ points

**Usage:**
```javascript
import { getLeaderboard, addUserPoints } from '@/services/rankingService';

const { data: leaderboard } = await getLeaderboard(100);
await addUserPoints(userId, 50, 'lesson_completed');
```

---

### 7. **activityService.js** (Lessons & Activities)
Manages lessons, activities, and progress tracking.

**Functions:**
- `getLessonsByCourse(courseId)` - Get course lessons
- `getLesson(lessonId)` - Get single lesson
- `createLesson(lessonData)` - Create lesson
- `updateLesson(lessonId, updates)` - Update lesson
- `deleteLesson(lessonId)` - Delete lesson
- `getActivitiesByLesson(lessonId)` - Get lesson activities
- `getActivity(activityId)` - Get single activity
- `createActivity(activityData)` - Create activity
- `updateActivity(activityId, updates)` - Update activity
- `deleteActivity(activityId)` - Delete activity
- `logActivityCompletion(userId, activityId, data)` - Record completion
- `getUserActivityAttempts(userId, activityId)` - Get user attempts
- `getLessonCompletionStatus(userId, lessonId)` - Lesson progress
- `getCourseProgress(userId, courseId)` - Course progress
- `subscribeToLessons(courseId, callback)` - Real-time lesson updates
- `subscribeToActivityAttempts(activityId, callback)` - Real-time activity updates

**Usage:**
```javascript
import { getLessonsByCourse, getCourseProgress } from '@/services/activityService';

const { data: lessons } = await getLessonsByCourse(courseId);
const { data: progress } = await getCourseProgress(userId, courseId);
```

---

### 8. **storageService.js** (File Storage)
Handles file uploads/downloads for avatars and course materials.

**Storage Buckets:**
- `avatars` - User profile pictures
- `course-materials` - Course PDFs, videos, etc.
- `lesson-attachments` - Lesson-specific files

**Functions:**
- `uploadAvatar(userId, file)` - Upload user avatar
- `deleteAvatar(userId, filePath)` - Delete avatar
- `uploadCourseMaterial(courseId, file)` - Upload course file
- `deleteCourseMaterial(filePath)` - Delete course file
- `uploadLessonAttachment(lessonId, file)` - Upload lesson file
- `deleteLessonAttachment(filePath)` - Delete lesson file
- `listFiles(bucket, path)` - List files in directory
- `getFileMetadata(bucket, filePath)` - Get file info
- `downloadFile(bucket, filePath)` - Download file
- `getPublicUrl(bucket, filePath)` - Get public URL
- `createSignedUrl(bucket, filePath, expiresIn)` - Temporary access URL

**Usage:**
```javascript
import { uploadAvatar, uploadCourseMaterial } from '@/services/storageService';

const { url } = await uploadAvatar(userId, file);
const { url: materialUrl } = await uploadCourseMaterial(courseId, file);
```

---

### 9. **quizService.js** (Quizzes & Assessments)
Manages quizzes, questions, and submission grading.

**Functions:**
- `getQuizzesByLesson(lessonId)` - Get lesson quizzes
- `getQuizWithQuestions(quizId)` - Quiz + all questions
- `createQuiz(quizData)` - Create quiz
- `updateQuiz(quizId, updates)` - Update quiz
- `deleteQuiz(quizId)` - Delete quiz
- `getQuizQuestions(quizId)` - Get quiz questions
- `createQuestion(questionData)` - Create question
- `updateQuestion(questionId, updates)` - Update question
- `deleteQuestion(questionId)` - Delete question
- `submitQuizAnswers(userId, quizId, answers)` - Submit quiz
- `getUserQuizSubmissions(userId, quizId)` - Submission history
- `getQuizSubmissionWithAnswers(submissionId)` - Detailed submission
- `getQuizStatistics(quizId)` - Quiz statistics
- `getUserBestQuizScore(userId, quizId)` - Best score
- `subscribeToQuizSubmissions(quizId, callback)` - Real-time submissions

**Grading:**
- Passing score: 70%
- Each question is marked correct/incorrect
- Score calculated as percentage

**Usage:**
```javascript
import { submitQuizAnswers, getQuizStatistics } from '@/services/quizService';

const { data } = await submitQuizAnswers(userId, quizId, answers);
const { data: stats } = await getQuizStatistics(quizId);
```

---

## Error Handling Pattern

All services follow consistent error handling:

```javascript
// Standard return object
{ data: null, error: 'Error message' }
// or
{ data: {...}, error: null }
```

Example:
```javascript
const { data, error } = await getUserProfile(userId);

if (error) {
  console.error('Failed to get profile:', error);
  // Handle error
} else {
  // Use data
  console.log(data);
}
```

---

## Real-Time Subscriptions

Services provide real-time updates using Supabase subscriptions:

```javascript
import { subscribeToUser­Rankings } from '@/services/rankingService';

const unsubscribe = subscribeToUserRanking(userId, (newData) => {
  console.log('Ranking updated:', newData);
});

// Cleanup when component unmounts
// unsubscribe();
```

---

## Environment Variables Required

The following should be set in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Import Examples

**In React Components:**
```javascript
import { getCourses } from '@/services/courseService';
import { getUserProfile } from '@/services/userService';
import { uploadAvatar } from '@/services/storageService';
import { addUserPoints } from '@/services/rankingService';
```

**In Custom Hooks:**
```javascript
export function useCourses() {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    getCourses().then(({ data }) => setCourses(data));
  }, []);
  
  return courses;
}
```

---

## Database Schema Required

These services expect the following Supabase tables:
- `users` - User profiles
- `courses` - Course information
- `enrollments` - User course enrollments  
- `lessons` - Course lessons
- `activities` - Lesson activities
- `activity_attempts` - Activity completion history
- `rankings` - User points and tiers
- `quizzes` - Quiz definitions
- `questions` - Quiz questions
- `quiz_submissions` - Quiz submissions
- `quiz_answers` - Individual quiz answers

---

## Next Steps

1. **Database Schema** - Create tables in Supabase using migrations
2. **RLS Policies** - Set up Row Level Security policies
3. **Component Integration** - Connect React components to these services
4. **Real-time Updates** - Implement subscriptions in components
5. **Data Migration** - Migrate mock AppContext data to Supabase
6. **Testing** - Test all services with actual database

