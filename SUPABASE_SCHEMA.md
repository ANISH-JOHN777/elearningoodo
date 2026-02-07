# Supabase Database Schema Design

## Tables Overview

The following tables are required for the LearnSphere e-learning platform. Use these schemas to create tables in Supabase.

---

## 1. Users Table

Extends Supabase `auth.users` with additional profile data.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK, FK auth.users.id | User unique ID |
| email | text | UNIQUE | User email |
| name | text | | Display name |
| avatar | text | | Avatar URL from storage |
| bio | text | | User biography |
| role | enum | DEFAULT 'learner' | learner, instructor, admin |
| country | text | | User country |
| metadata | jsonb | | Additional user data |
| created_at | timestamp | DEFAULT now() | Account creation |
| updated_at | timestamp | DEFAULT now() | Last updated |

**Indexes:**
```sql
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## 2. Courses Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Course unique ID |
| title | text | NOT NULL | Course title (max 200) |
| description | text | NOT NULL | Course description |
| category | text | NOT NULL | Course category |
| level | enum | DEFAULT 'beginner' | beginner, intermediate, advanced |
| thumbnail | text | | Course cover image URL |
| instructor_id | uuid | FK users.id | Instructor user ID |
| price | numeric | DEFAULT 0 | Course price (0 = free) |
| duration | integer | | Total duration in minutes |
| lessons_count | integer | DEFAULT 0 | Number of lessons |
| rating | numeric | | Average rating (0-5) |
| tags | text[] | | Course tags |
| published | boolean | DEFAULT false | Published status |
| metadata | jsonb | | Additional data |
| created_at | timestamp | DEFAULT now() | |
| updated_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_published ON courses(published);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
```

---

## 3. Enrollments Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Enrollment unique ID |
| user_id | uuid | FK users.id, NOT NULL | Enrolled user |
| course_id | uuid | FK courses.id, NOT NULL | Course enrolled |
| status | enum | DEFAULT 'in_progress' | in_progress, completed, dropped |
| progress | integer | DEFAULT 0 | Progress percentage (0-100) |
| enrolled_at | timestamp | DEFAULT now() | Enrollment date |
| completed_at | timestamp | | Completion date (if completed) |
| updated_at | timestamp | DEFAULT now() | |

**Constraints:**
```sql
UNIQUE(user_id, course_id) -- User can only enroll once per course
```

**Indexes:**
```sql
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);
```

---

## 4. Lessons Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Lesson unique ID |
| course_id | uuid | FK courses.id, NOT NULL | Parent course |
| title | text | NOT NULL | Lesson title |
| description | text | | Lesson description |
| content | text | | Lesson content (HTML/Markdown) |
| video_url | text | | Video URL |
| duration | integer | | Duration in minutes |
| order | integer | NOT NULL | Lesson order in course |
| published | boolean | DEFAULT false | Published status |
| created_at | timestamp | DEFAULT now() | |
| updated_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order);
```

---

## 5. Activities Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Activity unique ID |
| lesson_id | uuid | FK lessons.id, NOT NULL | Parent lesson |
| type | enum | NOT NULL | video, quiz, assignment, reading |
| title | text | NOT NULL | Activity title |
| description | text | | Activity description |
| content | text | | Activity content |
| order | integer | NOT NULL | Activity order in lesson |
| points | integer | DEFAULT 0 | Points for completing |
| required | boolean | DEFAULT false | Required to complete lesson |
| created_at | timestamp | DEFAULT now() | |
| updated_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_activities_lesson_id ON activities(lesson_id);
CREATE INDEX idx_activities_type ON activities(type);
```

---

## 6. Activity Attempts Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Attempt unique ID |
| user_id | uuid | FK users.id, NOT NULL | User |
| activity_id | uuid | FK activities.id, NOT NULL | Activity |
| time_spent | integer | | Time in seconds |
| score | integer | | Score/percentage |
| passed | boolean | | If activity passed |
| answers | jsonb | | User answers/response |
| completed_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_activity_attempts_user_id ON activity_attempts(user_id);
CREATE INDEX idx_activity_attempts_activity_id ON activity_attempts(activity_id);
CREATE INDEX idx_activity_attempts_completed_at ON activity_attempts(completed_at DESC);
```

---

## 7. Rankings Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Ranking unique ID |
| user_id | uuid | FK users.id, UNIQUE, NOT NULL | Ranked user |
| points | integer | DEFAULT 0 | Total points earned |
| tier | enum | DEFAULT 'bronze' | bronze, silver, gold, platinum, diamond |
| activities_completed | integer | DEFAULT 0 | Count of activities done |
| updated_at | timestamp | DEFAULT now() | Last points update |

**Tier Thresholds:**
- Bronze: 0-499 points
- Silver: 500-1,499 points
- Gold: 1,500-2,999 points
- Platinum: 3,000-4,999 points
- Diamond: 5,000+ points

**Indexes:**
```sql
CREATE INDEX idx_rankings_points DESC ON rankings(points DESC);
CREATE INDEX idx_rankings_tier ON rankings(tier);
CREATE INDEX idx_rankings_updated_at ON rankings(updated_at DESC);
```

---

## 8. Course Rankings Table

Course-specific leaderboards.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Ranking unique ID |
| user_id | uuid | FK users.id, NOT NULL | User |
| course_id | uuid | FK courses.id, NOT NULL | Course |
| points | integer | DEFAULT 0 | Course-specific points |
| updated_at | timestamp | DEFAULT now() | |

**Constraints:**
```sql
UNIQUE(user_id, course_id)
```

**Indexes:**
```sql
CREATE INDEX idx_course_rankings_course_id ON course_rankings(course_id);
CREATE INDEX idx_course_rankings_points ON course_rankings(course_id, points DESC);
```

---

## 9. Quizzes Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Quiz unique ID |
| lesson_id | uuid | FK lessons.id, NOT NULL | Parent lesson |
| title | text | NOT NULL | Quiz title |
| description | text | | Quiz description |
| order | integer | NOT NULL | Order in lesson |
| passing_score | integer | DEFAULT 70 | Passing percentage |
| allow_retakes | boolean | DEFAULT true | Can user retake |
| show_answers | boolean | DEFAULT true | Show answers after submit |
| created_at | timestamp | DEFAULT now() | |
| updated_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
```

---

## 10. Questions Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Question unique ID |
| quiz_id | uuid | FK quizzes.id, NOT NULL | Parent quiz |
| type | enum | NOT NULL | multiple_choice, true_false, short_answer |
| question_text | text | NOT NULL | Question text |
| options | jsonb | | Answer options (for MC) |
| correct_answer | text | NOT NULL | Correct answer |
| explanation | text | | Explanation for answer |
| order | integer | NOT NULL | Question order |
| points | integer | DEFAULT 1 | Points for correct |
| created_at | timestamp | DEFAULT now() | |
| updated_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
```

---

## 11. Quiz Submissions Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Submission unique ID |
| user_id | uuid | FK users.id, NOT NULL | User |
| quiz_id | uuid | FK quizzes.id, NOT NULL | Quiz |
| score | integer | NOT NULL | Score percentage |
| passed | boolean | NOT NULL | If passed |
| submitted_at | timestamp | DEFAULT now() | |

**Indexes:**
```sql
CREATE INDEX idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_submitted_at ON quiz_submissions(submitted_at DESC);
```

---

## 12. Quiz Answers Table

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | uuid | PK | Answer unique ID |
| submission_id | uuid | FK quiz_submissions.id, NOT NULL | Submission |
| question_id | uuid | FK questions.id, NOT NULL | Question |
| selected_answer | text | NOT NULL | User's answer |
| is_correct | boolean | NOT NULL | If answer correct |

**Indexes:**
```sql
CREATE INDEX idx_quiz_answers_submission_id ON quiz_answers(submission_id);
```

---

## Storage Buckets

Create these storage buckets:

1. **avatars** - User profile pictures
   - Path format: `{user_id}/{filename}`
   - Public access: Yes
   - Max file size: 5MB

2. **course-materials** - Course files (PDF, slides, etc.)
   - Path format: `{course_id}/{filename}`
   - Public access: Yes
   - Max file size: 50MB

3. **lesson-attachments** - Lesson-specific files
   - Path format: `{lesson_id}/{filename}`
   - Public access: Yes
   - Max file size: 50MB

---

## Row Level Security (RLS) Policies

### Users Table RLS
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
```

### Courses Table RLS
```sql
-- Anyone can view published courses
CREATE POLICY "Published courses visible to all"
ON courses FOR SELECT
USING (published = true);

-- Instructors can view their own courses
CREATE POLICY "Instructors see own courses"
ON courses FOR SELECT
USING (instructor_id = auth.uid());
```

### Enrollments Table RLS
```sql
-- Users can view their own enrollments
CREATE POLICY "Users see own enrollments"
ON enrollments FOR SELECT
USING (user_id = auth.uid());

-- Instructors see student enrollments in their courses
CREATE POLICY "Instructors see student enrollments"
ON enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.instructor_id = auth.uid()
  )
);
```

### Rankings Table RLS
```sql
-- Everyone can view rankings (public leaderboard)
CREATE POLICY "Rankings visible to all"
ON rankings FOR SELECT
USING (true);

-- Users can only update their own ranking
CREATE POLICY "Users update own ranking"
ON rankings FOR UPDATE
USING (user_id = auth.uid());
```

---

## Migrations SQL

Use this to create all tables:

```sql
-- See individual table definitions above
-- Run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in order (respecting foreign keys)
-- 1. Users (extends auth.users)
-- 2. Courses
-- 3. Lessons
-- 4. Activities
-- 5. Enrollments
-- 6. Activity Attempts
-- 7. Rankings
-- 8. Course Rankings
-- 9. Quizzes
-- 10. Questions
-- 11. Quiz Submissions
-- 12. Quiz Answers

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Create RLS policies for each table
-- (See RLS Policies section above)
```

---

## Mock Data for Testing

After creating tables, populate with test data matching mock AppContext:

```javascript
// Users: 7 test users
// Courses: 4 sample courses
// Enrollments: ~28 user-course pairs
// Rankings: Correlation with activities completed
// Lessons: 4 lessons per course
// Activities: 2-3 per lesson
```

See `MockDataMigration.md` for migration scripts.

---

## Performance Considerations

1. **Indexes**: Created on foreign keys and commonly filtered columns
2. **Pagination**: Always use with large result sets
3. **Caching**: Consider caching leaderboards (updated hourly)
4. **Real-time**: Use subscriptions carefully (limit connections)
5. **Storage**: Implement cleanup for old quiz submissions
6. **Archiving**: Archive completed courses after 1 year

---

## Notes

- All tables use UUID primary keys for security
- `created_at` and `updated_at` are on most tables
- Foreign keys ensure referential integrity
- RLS policies restrict data access
- Indexes improve query performance
- Storage paths are predictable for management

