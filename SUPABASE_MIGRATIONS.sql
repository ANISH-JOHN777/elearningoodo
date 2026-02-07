-- LearnSphere Database Schema Migration
-- Copy and paste this entire file into Supabase SQL Editor
-- This creates all 12 tables with indexes and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  bio TEXT,
  role TEXT DEFAULT 'learner' CHECK (role IN ('learner', 'instructor', 'admin')),
  country TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================
-- 2. COURSES TABLE
-- ============================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail TEXT,
  instructor_id UUID NOT NULL REFERENCES public.users(id),
  price NUMERIC DEFAULT 0,
  duration INTEGER,
  lessons_count INTEGER DEFAULT 0,
  rating NUMERIC,
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_published ON public.courses(published);
CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses visible to all" ON public.courses
  FOR SELECT USING (published = true);

CREATE POLICY "Instructors see own courses" ON public.courses
  FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "Instructors create courses" ON public.courses
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors update own courses" ON public.courses
  FOR UPDATE USING (instructor_id = auth.uid());

-- ============================================
-- 3. LESSONS TABLE
-- ============================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER,
  "order" INTEGER NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, "order");

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons visible for published courses" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = lessons.course_id AND c.published = true
    )
  );

-- ============================================
-- 4. ACTIVITIES TABLE
-- ============================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'quiz', 'assignment', 'reading', 'lab', 'dialogue')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  "order" INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_lesson_id ON public.activities(lesson_id);
CREATE INDEX idx_activities_type ON public.activities(type);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities visible for published lessons" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      WHERE l.id = activities.lesson_id AND l.published = true
    )
  );

-- ============================================
-- 5. ENROLLMENTS TABLE
-- ============================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'dropped')),
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);
CREATE INDEX idx_enrollments_enrolled_at ON public.enrollments(enrolled_at DESC);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in published courses" ON public.enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND published = true)
  );

CREATE POLICY "Users can update own enrollments" ON public.enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- 6. ACTIVITY_ATTEMPTS TABLE
-- ============================================
CREATE TABLE public.activity_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  activity_id UUID NOT NULL REFERENCES public.activities(id),
  time_spent INTEGER,
  score INTEGER,
  passed BOOLEAN,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_attempts_user_id ON public.activity_attempts(user_id);
CREATE INDEX idx_activity_attempts_activity_id ON public.activity_attempts(activity_id);
CREATE INDEX idx_activity_attempts_completed_at ON public.activity_attempts(completed_at DESC);

ALTER TABLE public.activity_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own attempts" ON public.activity_attempts
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 7. RANKINGS TABLE
-- ============================================
CREATE TABLE public.rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  activities_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rankings_points ON public.rankings(points DESC);
CREATE INDEX idx_rankings_tier ON public.rankings(tier);
CREATE INDEX idx_rankings_updated_at ON public.rankings(updated_at DESC);

ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rankings visible to all" ON public.rankings
  FOR SELECT USING (true);

-- ============================================
-- 8. COURSE_RANKINGS TABLE
-- ============================================
CREATE TABLE public.course_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_course_rankings_course_id ON public.course_rankings(course_id);
CREATE INDEX idx_course_rankings_points ON public.course_rankings(course_id, points DESC);

ALTER TABLE public.course_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course rankings visible to all" ON public.course_rankings
  FOR SELECT USING (true);

-- ============================================
-- 9. QUIZZES TABLE
-- ============================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  passing_score INTEGER DEFAULT 70,
  allow_retakes BOOLEAN DEFAULT TRUE,
  show_answers BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson_id ON public.quizzes(lesson_id);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes visible for published lessons" ON public.quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l 
      WHERE l.id = quizzes.lesson_id AND l.published = true
    )
  );

-- ============================================
-- 10. QUESTIONS TABLE
-- ============================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'short_answer')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  "order" INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions visible for published quizzes" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = questions.quiz_id
    )
  );

-- ============================================
-- 11. QUIZ_SUBMISSIONS TABLE
-- ============================================
CREATE TABLE public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_submitted_at ON public.quiz_submissions(submitted_at DESC);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own submissions" ON public.quiz_submissions
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 12. QUIZ_ANSWERS TABLE
-- ============================================
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL
);

CREATE INDEX idx_quiz_answers_submission_id ON public.quiz_answers(submission_id);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own answers" ON public.quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions qs 
      WHERE qs.id = quiz_answers.submission_id AND qs.user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these separate calls in Supabase Storage UI:
-- 1. Create bucket: "avatars" - Public
-- 2. Create bucket: "course-materials" - Public
-- 3. Create bucket: "lesson-attachments" - Public

-- Or use these SQL commands:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-attachments', 'lesson-attachments', true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate tier based on points
CREATE OR REPLACE FUNCTION calculate_tier(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF points >= 5000 THEN
    RETURN 'diamond';
  ELSIF points >= 3000 THEN
    RETURN 'platinum';
  ELSIF points >= 1500 THEN
    RETURN 'gold';
  ELSIF points >= 500 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update ranking when points change
CREATE OR REPLACE FUNCTION update_ranking_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier = calculate_tier(NEW.points);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tier when points change
CREATE TRIGGER trigger_update_ranking_tier
BEFORE UPDATE ON public.rankings
FOR EACH ROW
EXECUTE FUNCTION update_ranking_tier();

-- ============================================
-- SAMPLE DATA (Optional - Remove if not needed)
-- ============================================
-- This inserts test data for development
-- Comment out if you want to start fresh

-- Insert test user (set auth_user_id to your actual test user ID)
-- INSERT INTO public.users (id, email, name, role, created_at, updated_at)
-- VALUES (
--   'test-user-id-here',
--   'test@example.com',
--   'Test User',
--   'learner',
--   NOW(),
--   NOW()
-- );

-- INSERT INTO public.rankings (user_id, points, activities_completed)
-- VALUES (
--   'test-user-id-here',
--   250,
--   5
-- );

-- ============================================
-- MIGRATIONS COMPLETE
-- ============================================
-- All tables created with proper RLS policies
-- Ready for component integration
-- Run next: Supabase Storage bucket creation (if not using SQL inserts)
