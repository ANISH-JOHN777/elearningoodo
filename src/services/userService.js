import { supabase } from './supabaseClient';

/**
 * User Service
 * Handles user profile and data operations
 */

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get user profile error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Create or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{data, error}>}
 */
export const upsertUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Upsert user profile error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update user profile error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get all users (with pagination)
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Promise<{data, count, error}>}
 */
export const getAllUsers = async (page = 1, pageSize = 10) => {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    console.error('Get all users error:', error.message);
    return { data: null, count: 0, error: error.message };
  }
};

/**
 * Search users by name or email
 * @param {string} query - Search query
 * @returns {Promise<{data, error}>}
 */
export const searchUsers = async (query) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Search users error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get user stats and analytics
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getUserStats = async (userId) => {
  try {
    // Get enrollments count
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    // Get completed courses count
    const { data: completed, error: completeError } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get total points
    const { data: points, error: pointsError } = await supabase
      .from('rankings')
      .select('points')
      .eq('user_id', userId);

    if (enrollError || completeError || pointsError) {
      throw new Error('Failed to fetch user stats');
    }

    const totalPoints = points?.reduce((sum, r) => sum + (r.points || 0), 0) || 0;

    return {
      data: {
        enrollments_count: enrollments?.length || 0,
        completed_count: completed?.length || 0,
        total_points: totalPoints,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get user stats error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Subscribe to user profile changes
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserProfile = (userId, callback) => {
  const subscription = supabase
    .from(`users:id=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};
