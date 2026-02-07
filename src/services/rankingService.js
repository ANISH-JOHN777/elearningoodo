import { supabase } from './supabaseClient';

/**
 * Ranking and Scoring Service
 * Handles rankings, points, and leaderboard operations
 */

/**
 * Get global leaderboard/rankings
 * @param {number} limit - Number of top users (default: 100)
 * @param {string} timeframe - 'all_time' or 'monthly' (default: 'all_time')
 * @returns {Promise<{data, error}>}
 */
export const getLeaderboard = async (limit = 100, timeframe = 'all_time') => {
  try {
    let query = supabase
      .from('rankings')
      .select(
        `
        *,
        users (id, name, email, avatar)
      `
      )
      .order('points', { ascending: false })
      .limit(limit);

    // Filter by timeframe if needed (would require additional timestamp tracking)
    // This is a basic implementation - can be enhanced with date filtering

    const { data, error } = await query;

    if (error) throw error;

    // Add rank positions
    const rankedData = data?.map((item, index) => ({
      ...item,
      rank: index + 1,
    })) || [];

    return { data: rankedData, error: null };
  } catch (error) {
    console.error('Get leaderboard error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get user ranking/position
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getUserRanking = async (userId) => {
  try {
    // Get user's ranking data
    const { data: userRanking, error: rankError } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (rankError && rankError.code !== 'PGRST116') throw rankError;

    if (!userRanking) {
      return { data: null, error: null };
    }

    // Get user's rank position
    const { data: allAbove, error: posError } = await supabase
      .from('rankings')
      .select('id', { count: 'exact' })
      .gt('points', userRanking.points);

    if (posError) throw posError;

    return {
      data: {
        ...userRanking,
        rank: (allAbove?.length || 0) + 1,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get user ranking error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Add or update user points
 * @param {string} userId - User ID
 * @param {number} points - Points to add
 * @param {string} activityType - Type of activity (e.g., 'course_completed', 'lesson_completed')
 * @returns {Promise<{data, error}>}
 */
export const addUserPoints = async (userId, points, activityType = 'activity') => {
  try {
    // Get current ranking or create new
    const { data: existing } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const newPoints = (existing?.points || 0) + points;

    const { data, error } = await supabase
      .from('rankings')
      .upsert({
        user_id: userId,
        points: newPoints,
        tier: calculateTier(newPoints),
        activities_completed: (existing?.activities_completed || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Add user points error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Set user points (absolute value)
 * @param {string} userId - User ID
 * @param {number} points - Total points
 * @returns {Promise<{data, error}>}
 */
export const setUserPoints = async (userId, points) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .upsert({
        user_id: userId,
        points,
        tier: calculateTier(points),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Set user points error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get rankings for a course
 * @param {string} courseId - Course ID
 * @param {number} limit - Number of top users (default: 50)
 * @returns {Promise<{data, error}>}
 */
export const getCourseRankings = async (courseId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('course_rankings')
      .select(
        `
        *,
        users (id, name, email, avatar)
      `
      )
      .eq('course_id', courseId)
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add rank positions
    const rankedData = data?.map((item, index) => ({
      ...item,
      rank: index + 1,
    })) || [];

    return { data: rankedData, error: null };
  } catch (error) {
    console.error('Get course rankings error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get tier information
 * @returns {Object} Tier thresholds and colors
 */
export const getTierInfo = () => {
  return {
    bronze: { minPoints: 0, maxPoints: 500, color: '#CD7F32', level: 1 },
    silver: { minPoints: 500, maxPoints: 1500, color: '#C0C0C0', level: 2 },
    gold: { minPoints: 1500, maxPoints: 3000, color: '#FFD700', level: 3 },
    platinum: { minPoints: 3000, maxPoints: 5000, color: '#E5E4E2', level: 4 },
    diamond: { minPoints: 5000, maxPoints: Infinity, color: '#B9F2FF', level: 5 },
  };
};

/**
 * Calculate tier based on points
 * @param {number} points - User points
 * @returns {string} Tier name
 */
const calculateTier = (points) => {
  const tiers = getTierInfo();
  
  if (points < tiers.silver.minPoints) return 'bronze';
  if (points < tiers.gold.minPoints) return 'silver';
  if (points < tiers.platinum.minPoints) return 'gold';
  if (points < tiers.diamond.minPoints) return 'platinum';
  return 'diamond';
};

/**
 * Get top performers by tier
 * @param {string} tier - Tier name (bronze, silver, gold, platinum, diamond)
 * @param {number} limit - Number of results (default: 20)
 * @returns {Promise<{data, error}>}
 */
export const getTopPerformersByTier = async (tier, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select(
        `
        *,
        users (id, name, email, avatar)
      `
      )
      .eq('tier', tier)
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get top performers by tier error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get user tier details
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getUserTierInfo = async (userId) => {
  try {
    const { data: ranking, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const tierInfo = getTierInfo();
    const userTier = ranking?.tier || 'bronze';
    const userPoints = ranking?.points || 0;

    const currentTierInfo = tierInfo[userTier];
    const nextTier = getNextTier(userTier);
    const nextTierInfo = nextTier ? tierInfo[nextTier] : null;

    const pointsToNextTier = nextTierInfo
      ? nextTierInfo.minPoints - userPoints
      : null;

    return {
      data: {
        currentTier: userTier,
        currentTierInfo,
        nextTier,
        nextTierInfo,
        points: userPoints,
        pointsToNextTier:
          pointsToNextTier && pointsToNextTier > 0 ? pointsToNextTier : 0,
        progressPercentage:
          nextTierInfo && currentTierInfo
            ? Math.min(
                100,
                ((userPoints - currentTierInfo.minPoints) /
                  (nextTierInfo.minPoints - currentTierInfo.minPoints)) *
                  100
              )
            : 100,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get user tier info error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get next tier
 * @param {string} currentTier - Current tier name
 * @returns {string|null} Next tier name or null if already at highest
 */
const getNextTier = (currentTier) => {
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null;
  }
  
  return tierOrder[currentIndex + 1];
};

/**
 * Subscribe to ranking changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToRankings = (callback) => {
  const subscription = supabase
    .from('rankings')
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};

/**
 * Subscribe to specific user ranking changes
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserRanking = (userId, callback) => {
  const subscription = supabase
    .from(`rankings:user_id=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};
