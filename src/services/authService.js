import { supabase } from './supabaseClient';

/**
 * Authentication Service
 * Handles user authentication operations (signup, signin, logout, password reset)
 */

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} metadata - Additional user metadata (name, avatar, etc.)
 * @returns {Promise<{user, session, error}>}
 */
export const signUp = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Sign up error:', error.message);
    return { user: null, session: null, error: error.message };
  }
};

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user, session, error}>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Sign in error:', error.message);
    return { user: null, session: null, error: error.message };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{error}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error.message);
    return { error: error.message };
  }
};

/**
 * Get the current user session
 * @returns {Promise<{user, session, error}>}
 */
export const getCurrentSession = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (userError) throw userError;
    if (sessionError) throw sessionError;

    return { user, session, error: null };
  } catch (error) {
    console.error('Get session error:', error.message);
    return { user: null, session: null, error: error.message };
  }
};

/**
 * Request email verification
 * @returns {Promise<{error}>}
 */
export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Resend verification error:', error.message);
    return { error: error.message };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<{error}>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error.message);
    return { error: error.message };
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{user, error}>}
 */
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Update password error:', error.message);
    return { user: null, error: error.message };
  }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Function called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: subscriptionData } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  return subscriptionData?.subscription?.unsubscribe ?? (() => {});
};
