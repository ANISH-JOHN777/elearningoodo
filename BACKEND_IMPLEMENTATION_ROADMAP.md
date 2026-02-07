# Backend Implementation Roadmap

## Phase Summary

**Current Status:** Service Layer Complete ✅  
**Next Phase:** Supabase Database Setup & Component Integration

---

## Phase 1: Database Setup (Next)

### 1.1 Create Database Tables in Supabase Dashboard

**Steps:**
1. Go to your Supabase project dashboard
2. Open "SQL Editor"
3. Run migrations to create tables (see SUPABASE_SCHEMA.md)
4. Create storage buckets: avatars, course-materials, lesson-attachments
5. Enable Row Level Security on all tables

**Time Estimate:** 30 minutes

**Deliverables:**
- ✅ 12 database tables created
- ✅ Indexes configured for performance
- ✅ 3 storage buckets ready
- ✅ RLS policies enabled

**Validation:**
```bash
# In Supabase dashboard, verify:
# - Database > Tables section shows all 12 tables
# - Storage > Buckets shows 3 buckets
# - All indexes created
```

---

### 1.2 Create RLS Policies

**Steps:**
1. Open Supabase SQL Editor
2. Create policies for each table (templates in SUPABASE_SCHEMA.md)
3. Enable RLS on all tables
4. Test policies with test users

**Time Estimate:** 45 minutes

**Key Policies:**
- Users: Private data (each user sees only their data)
- Courses: Public reads (published courses visible)
- Rankings: Public leaderboard (everyone can see)
- Enrollments: Private (users see only their enrollments)

**Test:**
```javascript
// Test RLS - this should work
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', currentUserId);

// This should fail (RLS blocks)
const { error } = await supabase
  .from('users')
  .select('*')
  .eq('id', otherUserId);
```

---

## Phase 2: Mock Data Migration

### 2.1 Export Mock Data from AppContext

**Steps:**
1. Review current mock data in src/context/AppContext.jsx
2. Extract user data, courses, enrollments, rankings
3. Format as SQL INSERT statements or JSON

**Available Mock Data:**
- Users: 7 learners + 1 admin (check AppContext line ~400)
- Courses: 4 courses (check AppContext line ~500)  
- Enrollments: ~28 user-course relationships
- Rankings: User points and tier data

**Time Estimate:** 30 minutes

### 2.2 Migrate Data to Supabase

**Two Approaches:**

**Option A: SQL INSERT (Fastest)**
```sql
-- Create SQL with mock data
INSERT INTO users (id, email, name, avatar, role, created_at)
VALUES 
  ('user-1', 'user1@example.com', 'Alice', NULL, 'learner', now()),
  ('user-2', 'user2@example.com', 'Bob', NULL, 'learner', now());
```

**Option B: Service Layer**
```javascript
import { upsertUserProfile } from '@/services/userService';

// Import mock data
import { MOCK_USERS } from '#/context/AppContext';

// Migrate
for (const user of MOCK_USERS) {
  await upsertUserProfile(user.id, user);
}
```

**Time Estimate:** 45 minutes

**Validation:**
```javascript
// Verify data migrated
const { data: users } = await getAllUsers();
console.log(`Migrated ${users.length} users`);

const { data: courses } = await getCourses();
console.log(`Migrated ${courses.length} courses`);
```

---

## Phase 3: Component Integration

### 3.1 Update Login/Register Pages

**Files to Modify:**
- [src/pages/auth/Login.jsx](src/pages/auth/Login.jsx)
- [src/pages/auth/Register.jsx](src/pages/auth/Register.jsx)

**Changes:**
- Replace mock validation with `signIn()` and `signUp()`
- Store user session in context
- Redirect after successful auth

**Example:**
```javascript
import { signIn } from '@/services/authService';

const handleLogin = async (email, password) => {
  const { user, error } = await signIn(email, password);
  if (error) {
    setError(error);
  } else {
    setUser(user);
    navigate('/dashboard');
  }
};
```

**Time Estimate:** 1-2 hours

---

### 3.2 Update Course Pages

**Files to Modify:**
- [src/pages/learner/MyCourses.jsx](src/pages/learner/MyCourses.jsx)
- [src/pages/learner/CourseDetail.jsx](src/pages/learner/CourseDetail.jsx)

**Changes:**
- Replace mock course data with `getCourses()`
- Replace enrollments with `getUserEnrollments()`
- Add real enroll/unenroll functionality
- Show real progress from database

**Example:**
```javascript
import { getCourses } from '@/services/courseService';
import { getUserEnrollments } from '@/services/enrollmentService';

useEffect(() => {
  getCourses().then(({ data }) => setCourses(data));
  getUserEnrollments(userId).then(({ data }) => setEnrollments(data));
}, [userId]);
```

**Time Estimate:** 2-3 hours

---

### 3.3 Update Ranking/Leaderboard Pages

**Files to Modify:**
- [src/pages/learner/Dashboard.jsx](src/pages/learner/Dashboard.jsx) (or RankingDashboard)
- [src/pages/admin/ReportingDashboard.jsx](src/pages/admin/ReportingDashboard.jsx)

**Changes:**
- Replace mock rankings with `getLeaderboard()`
- Add real-time subscriptions with `subscribeToRankings()`
- Show real user tiers with `getUserTierInfo()`
- Display course-specific rankings

**Example:**
```javascript
import { getLeaderboard, subscribeToRankings } from '@/services/rankingService';

useEffect(() => {
  getLeaderboard(100).then(({ data }) => setLeaderboard(data));
  
  const unsubscribe = subscribeToRankings(() => {
    // Refresh leaderboard when someone gets points
    getLeaderboard(100).then(({ data }) => setLeaderboard(data));
  });
  
  return unsubscribe;
}, []);
```

**Time Estimate:** 2-3 hours

---

### 3.4 Update Profile Pages

**Files to Modify:**
- [src/pages/learner/Profile.jsx](src/pages/learner/Profile.jsx)
- [src/pages/admin/AdminDashboard.jsx](src/pages/admin/AdminDashboard.jsx)

**Changes:**
- Replace mock profile with `getUserProfile()`
- Add avatar upload with `uploadAvatar()`
- Show real user stats with `getUserStats()`
- Update profile with `updateUserProfile()`

**Example:**
```javascript
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/services/userService';

const handleAvatarUpload = async (file) => {
  const { url } = await uploadAvatar(userId, file);
  if (url) {
    await updateUserProfile(userId, { avatar: url });
  }
};
```

**Time Estimate:** 1-2 hours

---

### 3.5 Add Quiz Functionality

**Files to Create/Modify:**
- [src/pages/learner/QuizPage.jsx](src/pages/learner/QuizPage.jsx) (new)
- [src/pages/admin/QuizBuilder.jsx](src/pages/admin/QuizBuilder.jsx) (modify)

**Changes:**
- Create quiz builder with `createQuiz()` and `createQuestion()`
- Add quiz taking interface with `getQuizWithQuestions()`
- Submit answers with `submitQuizAnswers()`
- Show results from submission

**Example:**
```javascript
import { submitQuizAnswers, getQuizWithQuestions } from '@/services/quizService';

const handleSubmit = async (answers) => {
  const { data: submission } = await submitQuizAnswers(userId, quizId, answers);
  setScore(submission.score);
  setPassed(submission.passed);
};
```

**Time Estimate:** 3-4 hours

---

## Phase 4: Testing & Optimization

### 4.1 Unit Testing

**Test Services:**
```javascript
// test/services/courseService.test.js
describe('courseService', () => {
  it('should fetch courses', async () => {
    const { data } = await getCourses();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

**Time Estimate:** 2-3 hours

### 4.2 Component Testing

**Test Components:**
- Login/Register with real auth
- Course enrollment flow
- Quiz submission
- Profile update

**Time Estimate:** 2-3 hours

### 4.3 Performance Testing

- Test with 100+ users
- Test real-time subscriptions
- Monitor database queries
- Optimize slow endpoints

**Time Estimate:** 2-3 hours

---

## Phase 5: Deployment

### 5.1 Environment Setup

**Production Configuration:**
```
# .env.production.local
VITE_SUPABASE_URL=production_url
VITE_SUPABASE_ANON_KEY=production_key
```

**Time Estimate:** 30 minutes

### 5.2 Database Backups

- Set up automated backups in Supabase
- Test restore procedure
- Document backup schedule

**Time Estimate:** 1 hour

### 5.3 Deploy Frontend

```bash
npm run build
# Deploy to Netlify/Vercel/etc
```

**Time Estimate:** 1 hour

---

## Timeline Summary

| Phase | Task | Hours | Status |
|-------|------|-------|--------|
| 1.1 | Create DB tables | 0.5 | Next |
| 1.2 | RLS policies | 0.75 | Next |
| 2.1 | Export mock data | 0.5 | Next |
| 2.2 | Migrate data | 0.75 | Next |
| 3.1 | Auth pages | 2 | Next |
| 3.2 | Course pages | 3 | Next |
| 3.3 | Ranking pages | 3 | Next |
| 3.4 | Profile pages | 2 | Next |
| 3.5 | Quiz system | 4 | Next |
| 4.1 | Unit testing | 3 | Next |
| 4.2 | Component testing | 3 | Next |
| 4.3 | Performance | 3 | Next |
| 5.1 | Environment | 0.5 | Next |
| 5.2 | Backups | 1 | Next |
| 5.3 | Deploy | 1 | Next |
| **Total** | | **~32 hours** | |

---

## Recommended Order

1. **Day 1:** Phases 1.1, 1.2, 2.1, 2.2 (3-4 hours)
2. **Day 2:** Phase 3.1, 3.2 (4-5 hours)
3. **Day 3:** Phase 3.3, 3.4, 3.5 (8-9 hours)
4. **Day 4:** Phase 4 testing (7-9 hours)
5. **Day 5:** Phase 5 deployment (2-3 hours)

**Total: 5 days of focused development**

---

## Checkpoints & Validation

### After Phase 1: Database ready
```javascript
// Test database connectivity
const { data: test } = await supabase
  .from('courses')
  .select('*')
  .limit(1);
expect(test).toBeDefined();
```

### After Phase 2: Data migrated
```javascript
// Verify all mock data present
const users = await getAllUsers();
const courses = await getCourses();
expect(users.length).toBe(7); // or your count
expect(courses.length).toBe(4);
```

### After Phase 3: Components functional
```javascript
// Test complete user journey
// 1. Login with real auth
// 2. Browse courses
// 3. Enroll in course
// 4. View progress
// 5. Take quiz
// 6. Check leaderboard
```

### After Phase 4: Tests pass
```bash
npm run test      # All tests pass
npm run lint      # No linting errors
npm run build     # Production build succeeds
```

### After Phase 5: Deployed
```bash
# Site is live and operational
# All features work in production
# Backups configured
```

---

## Common Issues & Solutions

**Issue:** RLS policies block all queries
**Solution:** Check policy conditions, add RLS logging

**Issue:** Auth not persisting
**Solution:** Use `onAuthStateChange()` to restore session

**Issue:** Real-time subscriptions not updating
**Solution:** Verify RLS allows access, check network

**Issue:** Storage uploads fail
**Solution:** Verify bucket permissions, check file size

**Issue:** Performance slow with many users
**Solution:** Add pagination, implement caching, optimize indexes

---

## Success Criteria

✅ All 12 database tables created  
✅ RLS policies enforced  
✅ Mock data migrated (7 users, 4 courses, ~28 enrollments)  
✅ Authentication working (login/register/logout)  
✅ Course enrollment functional  
✅ Leaderboard real-time updates  
✅ Quiz system working  
✅ All components use Supabase instead of mock data  
✅ No console errors  
✅ Responsive on mobile  
✅ Performance acceptable (<3s page load)  
✅ All tests passing  
✅ Deployed and live  

---

## Support Resources

**Supabase Docs:** https://supabase.com/docs  
**Service Layer Docs:** [src/services/README.md](src/services/README.md)  
**Quick Reference:** [src/services/QUICK_REFERENCE.md](src/services/QUICK_REFERENCE.md)  
**Schema Design:** [SUPABASE_SCHEMA.md](SUPABASE_SCHEMA.md)  

---

## Next Steps

1. ✅ Read SUPABASE_SCHEMA.md
2. ✅ Review service layer (src/services/README.md)
3. ⏭️ Create database tables in Supabase
4. ⏭️ Set up RLS policies
5. ⏭️ Migrate mock data
6. ⏭️ Start component integration with Phase 3.1

