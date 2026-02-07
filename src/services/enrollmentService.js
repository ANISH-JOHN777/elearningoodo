import { supabase } from './supabaseClient';

/**
 * Enrollment Service
 * Handles course enrollment operations
 */

/**
 * Enroll user in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const enrollCourse = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          status: 'in_progress',
          progress: 0,
          enrolled_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Enroll course error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Unenroll user from a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{error}>}
 */
export const unenrollCourse = async (userId, courseId) => {
  try {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Unenroll course error:', error.message);
    return { error: error.message };
  }
};

/**
 * Get enrollments for a user
 * @param {string} userId - User ID
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Promise<{data, count, error}>}
 */
export const getUserEnrollments = async (userId, page = 1, pageSize = 10) => {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from('enrollments')
      .select(
        `
        *,
        courses (*)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    console.error('Get user enrollments error:', error.message);
    return { data: null, count: 0, error: error.message };
  }
};

/**
 * Get enrollments for a course
 * @param {string} courseId - Course ID
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Promise<{data, count, error}>}
 */
export const getCourseEnrollments = async (courseId, page = 1, pageSize = 10) => {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from('enrollments')
      .select(
        `
        *,
        users (*)
      `,
        { count: 'exact' }
      )
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    console.error('Get course enrollments error:', error.message);
    return { data: null, count: 0, error: error.message };
  }
};

/**
 * Get single enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Promise<{data, error}>}
 */
export const getEnrollment = async (enrollmentId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get enrollment error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Check if user is enrolled in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const getUserCourseEnrollment = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

    return { data, error: null };
  } catch (error) {
    console.error('Get user course enrollment error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update enrollment status and progress
 * @param {string} enrollmentId - Enrollment ID
 * @param {Object} updates - { status?, progress? }
 * @returns {Promise<{data, error}>}
 */
export const updateEnrollment = async (enrollmentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update enrollment error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Mark course as completed for user
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const completeCourse = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Complete course error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get user's enrolled courses with course details
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getUserCoursesWithDetails = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        status,
        progress,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          description,
          category,
          thumbnail,
          level,
          duration,
          lessons_count,
          instructor_id
        )
      `
      )
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get user courses with details error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Subscribe to enrollment changes for a course
 * @param {string} courseId - Course ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCourseEnrollments = (courseId, callback) => {
  const subscription = supabase
    .from(`enrollments:course_id=eq.${courseId}`)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};

/**
 * Subscribe to user enrollments changes
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserEnrollments = (userId, callback) => {
  const subscription = supabase
    .from(`enrollments:user_id=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};
