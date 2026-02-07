import { supabase } from './supabaseClient';

/**
 * Activity/Lesson Service
 * Handles lessons, activities, and progress tracking
 */

/**
 * Get all lessons for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const getLessonsByCourse = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get lessons by course error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get lesson by ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{data, error}>}
 */
export const getLesson = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get lesson error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Create new lesson
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<{data, error}>}
 */
export const createLesson = async (lessonData) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create lesson error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update lesson
 * @param {string} lessonId - Lesson ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateLesson = async (lessonId, updates) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update lesson error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Delete lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{error}>}
 */
export const deleteLesson = async (lessonId) => {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete lesson error:', error.message);
    return { error: error.message };
  }
};

/**
 * Get activities for a lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{data, error}>}
 */
export const getActivitiesByLesson = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get activities by lesson error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get activity by ID
 * @param {string} activityId - Activity ID
 * @returns {Promise<{data, error}>}
 */
export const getActivity = async (activityId) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get activity error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Create activity
 * @param {Object} activityData - Activity data
 * @returns {Promise<{data, error}>}
 */
export const createActivity = async (activityData) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create activity error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update activity
 * @param {string} activityId - Activity ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateActivity = async (activityId, updates) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update activity error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Delete activity
 * @param {string} activityId - Activity ID
 * @returns {Promise<{error}>}
 */
export const deleteActivity = async (activityId) => {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete activity error:', error.message);
    return { error: error.message };
  }
};

/**
 * Log activity completion (user attempt/progress)
 * @param {string} userId - User ID
 * @param {string} activityId - Activity ID
 * @param {Object} completionData - { time_spent, score, passed, answers }
 * @returns {Promise<{data, error}>}
 */
export const logActivityCompletion = async (userId, activityId, completionData) => {
  try {
    const { data, error } = await supabase
      .from('activity_attempts')
      .insert([
        {
          user_id: userId,
          activity_id: activityId,
          ...completionData,
          completed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Log activity completion error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get user's activity attempts
 * @param {string} userId - User ID
 * @param {string} activityId - Activity ID (optional)
 * @returns {Promise<{data, error}>}
 */
export const getUserActivityAttempts = async (userId, activityId = null) => {
  try {
    let query = supabase
      .from('activity_attempts')
      .select('*')
      .eq('user_id', userId);

    if (activityId) {
      query = query.eq('activity_id', activityId);
    }

    const { data, error } = await query.order('completed_at', {
      ascending: false,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get user activity attempts error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get lesson completion status for user
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{data, error}>}
 */
export const getLessonCompletionStatus = async (userId, lessonId) => {
  try {
    // Get all activities for the lesson
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id')
      .eq('lesson_id', lessonId);

    if (activitiesError) throw activitiesError;

    if (!activities || activities.length === 0) {
      return { data: { completed: true, progress: 100 }, error: null };
    }

    const activityIds = activities.map((a) => a.id);

    // Get user's attempts for these activities
    const { data: attempts, error: attemptsError } = await supabase
      .from('activity_attempts')
      .select('activity_id')
      .eq('user_id', userId)
      .in('activity_id', activityIds);

    if (attemptsError) throw attemptsError;

    const completedActivities = new Set(attempts?.map((a) => a.activity_id) || []);
    const completedCount = completedActivities.size;
    const totalActivities = activities.length;
    const progress = Math.round((completedCount / totalActivities) * 100);

    return {
      data: {
        completed: completedCount === totalActivities,
        progress,
        completedCount,
        totalActivities,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get lesson completion status error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get course progress for user
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{data, error}>}
 */
export const getCourseProgress = async (userId, courseId) => {
  try {
    // Get all lessons for the course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    if (lessonsError) throw lessonsError;

    if (!lessons || lessons.length === 0) {
      return { data: { progress: 0, completedLessons: 0, totalLessons: 0 }, error: null };
    }

    // Get completion status for each lesson
    const completionStatuses = await Promise.all(
      lessons.map((lesson) => getLessonCompletionStatus(userId, lesson.id))
    );

    const completedLessons = completionStatuses.filter((s) => s.data?.completed).length;
    const averageProgress =
      completionStatuses.reduce((sum, s) => sum + (s.data?.progress || 0), 0) /
      lessons.length;

    return {
      data: {
        progress: Math.round(averageProgress),
        completedLessons,
        totalLessons: lessons.length,
        byLesson: completionStatuses.map((s, i) => ({
          lessonId: lessons[i].id,
          ...s.data,
        })),
      },
      error: null,
    };
  } catch (error) {
    console.error('Get course progress error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Subscribe to lesson updates
 * @param {string} courseId - Course ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLessons = (courseId, callback) => {
  const subscription = supabase
    .from(`lessons:course_id=eq.${courseId}`)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};

/**
 * Subscribe to activity attempts
 * @param {string} activityId - Activity ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToActivityAttempts = (activityId, callback) => {
  const subscription = supabase
    .from(`activity_attempts:activity_id=eq.${activityId}`)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};
