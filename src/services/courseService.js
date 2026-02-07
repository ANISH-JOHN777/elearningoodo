import { supabase } from './supabaseClient';

/**
 * Course Service
 * Handles course CRUD and query operations
 */

/**
 * Get all courses with optional filters
 * @param {Object} filters - Filter options { category?, search?, page?, pageSize? }
 * @returns {Promise<{data, count, error}>}
 */
export const getCourses = async (filters = {}) => {
  try {
    const { category, search, page = 1, pageSize = 10 } = filters;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.contains('tags', [category]);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    console.error('Get courses error:', error.message);
    return { data: null, count: 0, error: error.message };
  }
};

/**
 * Get single course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const getCourseById = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get course by ID error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Create new course
 * @param {Object} courseData - Course data
 * @returns {Promise<{data, error}>}
 */
export const createCourse = async (courseData) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          ...courseData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create course error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update course
 * @param {string} courseId - Course ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update course error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Delete course
 * @param {string} courseId - Course ID
 * @returns {Promise<{error}>}
 */
export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete course error:', error.message);
    return { error: error.message };
  }
};

/**
 * Get courses by instructor ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<{data, error}>}
 */
export const getCoursesByInstructor = async (instructorId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get courses by instructor error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Search courses
 * @param {string} query - Search query
 * @returns {Promise<{data, error}>}
 */
export const searchCourses = async (query) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Search courses error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get course with enrollment status for user
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getCourseWithEnrollmentStatus = async (courseId, userId) => {
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    return {
      data: {
        ...course,
        enrolled: !!enrollment,
        enrollment: enrollment || null,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get course with enrollment status error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get course statistics
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const getCourseStats = async (courseId) => {
  try {
    // Get total enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('course_id', courseId);

    // Get completed enrollments
    const { data: completed, error: completeError } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('course_id', courseId)
      .eq('status', 'completed');

    // Get in-progress enrollments
    const { data: inProgress, error: progressError } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('course_id', courseId)
      .eq('status', 'in_progress');

    if (enrollError || completeError || progressError) {
      throw new Error('Failed to fetch course stats');
    }

    return {
      data: {
        total_enrollments: enrollments?.length || 0,
        completed_enrollments: completed?.length || 0,
        in_progress_enrollments: inProgress?.length || 0,
        completion_rate:
          enrollments?.length > 0
            ? Math.round(((completed?.length || 0) / enrollments.length) * 100)
            : 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get course stats error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Subscribe to courses changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCourses = (callback) => {
  const subscription = supabase
    .from('courses')
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};
