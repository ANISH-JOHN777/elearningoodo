import { supabase } from './supabaseClient';

/**
 * File Storage Service
 * Handles file uploads and downloads for avatars, course materials, etc.
 */

const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  COURSE_MATERIALS: 'course-materials',
  LESSON_ATTACHMENTS: 'lesson-attachments',
};

/**
 * Upload user avatar
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @returns {Promise<{url, error}>}
 */
export const uploadAvatar = async (userId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Upload avatar error:', error.message);
    return { url: null, error: error.message };
  }
};

/**
 * Delete avatar
 * @param {string} userId - User ID
 * @param {string} filePath - File path from storage
 * @returns {Promise<{error}>}
 */
export const deleteAvatar = async (userId, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .remove([filePath]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete avatar error:', error.message);
    return { error: error.message };
  }
};

/**
 * Upload course material
 * @param {string} courseId - Course ID
 * @param {File} file - File to upload
 * @returns {Promise<{url, error}>}
 */
export const uploadCourseMaterial = async (courseId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${courseId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.COURSE_MATERIALS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.COURSE_MATERIALS)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, filePath, error: null };
  } catch (error) {
    console.error('Upload course material error:', error.message);
    return { url: null, filePath: null, error: error.message };
  }
};

/**
 * Delete course material
 * @param {string} filePath - File path from storage
 * @returns {Promise<{error}>}
 */
export const deleteCourseMaterial = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.COURSE_MATERIALS)
      .remove([filePath]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete course material error:', error.message);
    return { error: error.message };
  }
};

/**
 * Upload lesson attachment
 * @param {string} lessonId - Lesson ID
 * @param {File} file - File to upload
 * @returns {Promise<{url, error}>}
 */
export const uploadLessonAttachment = async (lessonId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${lessonId}/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.LESSON_ATTACHMENTS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.LESSON_ATTACHMENTS)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, filePath, error: null };
  } catch (error) {
    console.error('Upload lesson attachment error:', error.message);
    return { url: null, filePath: null, error: error.message };
  }
};

/**
 * Delete lesson attachment
 * @param {string} filePath - File path from storage
 * @returns {Promise<{error}>}
 */
export const deleteLessonAttachment = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.LESSON_ATTACHMENTS)
      .remove([filePath]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete lesson attachment error:', error.message);
    return { error: error.message };
  }
};

/**
 * List files in a directory
 * @param {string} bucket - Bucket name
 * @param {string} path - Directory path
 * @returns {Promise<{data, error}>}
 */
export const listFiles = async (bucket, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('List files error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get file metadata
 * @param {string} bucket - Bucket name
 * @param {string} filePath - File path
 * @returns {Promise<{data, error}>}
 */
export const getFileMetadata = async (bucket, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .getMetadata(filePath);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get file metadata error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Download file
 * @param {string} bucket - Bucket name
 * @param {string} filePath - File path
 * @returns {Promise<{data, error}>}
 */
export const downloadFile = async (bucket, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Download file error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get public URL for a file
 * @param {string} bucket - Bucket name
 * @param {string} filePath - File path
 * @returns {string} Public URL
 */
export const getPublicUrl = (bucket, filePath) => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Get public URL error:', error.message);
    return null;
  }
};

/**
 * Create signed URL (for temporary access)
 * @param {string} bucket - Bucket name
 * @param {string} filePath - File path
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<{url, error}>}
 */
export const createSignedUrl = async (bucket, filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error('Create signed URL error:', error.message);
    return { url: null, error: error.message };
  }
};

export { STORAGE_BUCKETS };
