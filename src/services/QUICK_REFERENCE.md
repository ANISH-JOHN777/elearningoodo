# Service Layer Quick Reference

## Quick Import Guide

```javascript
// Auth
import { signIn, signOut, getCurrentSession } from '@/services/authService';

// Users
import { getUserProfile, updateUserProfile } from '@/services/userService';

// Courses
import { getCourses, getCourseById, enrollCourse } from '@/services/courseService';
import { enrollCourse, getUserEnrollments } from '@/services/enrollmentService';

// Progress
import { getCourseProgress, getLessonCompletionStatus } from '@/services/activityService';

// Rankings & Points
import { getLeaderboard, addUserPoints, getUserTierInfo } from '@/services/rankingService';

// Quizzes
import { getQuizWithQuestions, submitQuizAnswers } from '@/services/quizService';

// Files
import { uploadAvatar, uploadCourseMaterial } from '@/services/storageService';
```

---

## Common Use Cases

### 1. User Profile Management
```javascript
// Get profile
const { data: profile, error } = await getUserProfile(userId);

// Update profile
await updateUserProfile(userId, { 
  name: 'John Doe',
  bio: 'Learner'
});

// Upload avatar
const { url } = await uploadAvatar(userId, avatarFile);
```

### 2. Course Management
```javascript
// Get all courses with filters
const { data: courses, count } = await getCourses({
  search: 'React',
  category: 'web-development',
  page: 1,
  pageSize: 10
});

// Get course with enrollment status
const { data: course } = await getCourseWithEnrollmentStatus(courseId, userId);

// Enroll in course
await enrollCourse(userId, courseId);

// Get user's enrolled courses
const { data: enrollments } = await getUserEnrollments(userId);
```

### 3. Progress & Activity Tracking
```javascript
// Get course progress
const { data: progress } = await getCourseProgress(userId, courseId);
// Returns: { progress, completedLessons, totalLessons }

// Get lesson details
const { data: lesson } = await getLesson(lessonId);

// Get lesson activities
const { data: activities } = await getActivitiesByLesson(lessonId);

// Record activity completion
await logActivityCompletion(userId, activityId, {
  time_spent: 300, // seconds
  score: 85,
  passed: true
});

// Get progress details
const { data } = await getLessonCompletionStatus(userId, lessonId);
// Returns: { completed, progress, completedCount, totalActivities }
```

### 4. Leaderboards & Gamification
```javascript
// Get global leaderboard
const { data: leaderboard } = await getLeaderboard(100); // Top 100

// Get user's rank
const { data: ranking } = await getUserRanking(userId);
// Returns: { points, tier, rank, ... }

// Add points
await addUserPoints(userId, 50, 'lesson_completed');

// Get tier information
const { data: tierInfo } = await getUserTierInfo(userId);
// Returns: { currentTier, nextTier, pointsToNextTier, progressPercentage }

// Get top performers by tier
const { data: goldTier } = await getTopPerformersByTier('gold', 20);
```

### 5. Quizzes & Assessments
```javascript
// Get quiz with questions
const { data: quiz } = await getQuizWithQuestions(quizId);

// Submit quiz answers
const answers = [
  { questionId: 'q1', selectedAnswer: 'A', isCorrect: true },
  { questionId: 'q2', selectedAnswer: 'B', isCorrect: false }
];
const { data: submission } = await submitQuizAnswers(userId, quizId, answers);
// Returns: { score, passed, correctAnswers, totalQuestions }

// Get submission history
const { data: submissions } = await getUserQuizSubmissions(userId, quizId);

// Get best score
const { data: best } = await getUserBestQuizScore(userId, quizId);

// Get quiz stats
const { data: stats } = await getQuizStatistics(quizId);
// Returns: { totalAttempts, averageScore, passRate }
```

### 6. Real-Time Updates
```javascript
// Subscribe to user ranking changes
const unsubscribe = subscribeToUserRanking(userId, (newRanking) => {
  console.log('Points:', newRanking.points);
  console.log('Rank:', newRanking.rank);
});

// Subscribe to course enrollments
const unsubEnrollments = subscribeToCourseEnrollments(courseId, (payload) => {
  console.log('New enrollment:', payload.new);
});

// Cleanup in useEffect
useEffect(() => {
  return () => unsubscribe();
}, [userId]);
```

---

## React Hook Examples

### useUser Hook
```javascript
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await getUserProfile(userId);
      if (error) setError(error);
      else setUser(data);
      setLoading(false);
    };
    
    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

// Usage
const { user, loading } = useUser(userId);
```

### useCourses Hook
```javascript
function useCourses(filters = {}) {
  const [courses, setCourses] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCourses(filters).then(({ data, count }) => {
      setCourses(data);
      setCount(count);
    });
  }, [filters]);

  return { courses, count };
}

// Usage
const { courses } = useCourses({ category: 'web-dev', page: 1 });
```

### useLeaderboard Hook
```javascript
function useLeaderboard(limit = 100) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    getLeaderboard(limit).then(({ data }) => setLeaderboard(data));

    // Real-time updates
    const unsubscribe = subscribeToRankings((payload) => {
      setLeaderboard(prev => 
        prev.map(item => item.user_id === payload.new.user_id ? payload.new : item)
      );
    });

    return unsubscribe;
  }, [limit]);

  return leaderboard;
}
```

---

## Error Handling Pattern

All services return `{ data, error }`:

```javascript
const { data, error } = await someServiceFunction();

if (error) {
  // Handle error
  console.error('Operation failed:', error);
  showToast('Error: ' + error);
} else {
  // Use data
  console.log(data);
}
```

---

## Pagination Example

```javascript
// Get page 2 of courses (10 per page)
const { data: courses, count } = await getCourses({
  page: 2,
  pageSize: 10
});

// Calculate total pages
const totalPages = Math.ceil(count / 10);
console.log(`Showing page 2 of ${totalPages}`);
```

---

## Search & Filter Examples

```javascript
// Search courses by title/description
const { data: results } = await searchCourses('React');

// Filter courses
const { data: filtered } = await getCourses({
  search: 'web',
  category: 'programming'
});

// Search users
const { data: users } = await searchUsers('john');
```

---

## File Upload Examples

```javascript
// Upload user avatar
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const { url, error } = await uploadAvatar(userId, file);
if (!error) {
  await updateUserProfile(userId, { avatar: url });
}

// Upload course material
const { url: materialUrl } = await uploadCourseMaterial(courseId, file);
```

---

## Important Notes

1. **Error Handling**: Always check for `error` before using `data`
2. **Subscriptions**: Always unsubscribe in cleanup to prevent memory leaks
3. **Pagination**: Default page size is usually 10, adjust as needed
4. **Timestamps**: Services automatically handle `created_at` and `updated_at`
5. **Real-time**: Use subscriptions for live updates (rankings, scores, etc.)
6. **Storage**: Public URLs are returned for files, no auth needed for access

---

## Database Tables Reference

| Service | Table |
|---------|-------|
| authService | auth.users |
| userService | users |
| courseService | courses |
| enrollmentService | enrollments |
| activityService | lessons, activities, activity_attempts |
| rankingService | rankings, course_rankings |
| storageService | storage (buckets) |
| quizService | quizzes, questions, quiz_submissions |

---

## Support Functions

### Tier System
```javascript
const tierInfo = getTierInfo();
// Returns tiers: bronze, silver, gold, platinum, diamond
// Each with minPoints, maxPoints, color, level
```

### Storage Buckets
```javascript
import { STORAGE_BUCKETS } from '@/services/storageService';
// STORAGE_BUCKETS.AVATARS
// STORAGE_BUCKETS.COURSE_MATERIALS
// STORAGE_BUCKETS.LESSON_ATTACHMENTS
```

