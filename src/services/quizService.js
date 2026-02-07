import { supabase } from './supabaseClient';

/**
 * Quiz Service
 * Handles quiz creation, submission, and grading
 */

/**
 * Get all quizzes for a lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{data, error}>}
 */
export const getQuizzesByLesson = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get quizzes by lesson error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get quiz by ID with questions
 * @param {string} quizId - Quiz ID
 * @returns {Promise<{data, error}>}
 */
export const getQuizWithQuestions = async (quizId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        questions (*)
      `
      )
      .eq('id', quizId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get quiz with questions error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Create new quiz
 * @param {Object} quizData - Quiz data
 * @returns {Promise<{data, error}>}
 */
export const createQuiz = async (quizData) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create quiz error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateQuiz = async (quizId, updates) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quizId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update quiz error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Delete quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<{error}>}
 */
export const deleteQuiz = async (quizId) => {
  try {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete quiz error:', error.message);
    return { error: error.message };
  }
};

/**
 * Get questions for a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<{data, error}>}
 */
export const getQuizQuestions = async (quizId) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get quiz questions error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Create question
 * @param {Object} questionData - Question data
 * @returns {Promise<{data, error}>}
 */
export const createQuestion = async (questionData) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create question error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Update question
 * @param {string} questionId - Question ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateQuestion = async (questionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update question error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Delete question
 * @param {string} questionId - Question ID
 * @returns {Promise<{error}>}
 */
export const deleteQuestion = async (questionId) => {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Delete question error:', error.message);
    return { error: error.message };
  }
};

/**
 * Submit quiz answers
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @param {Array} answers - Array of {questionId, selectedAnswer, isCorrect}
 * @returns {Promise<{data, error}>}
 */
export const submitQuizAnswers = async (userId, quizId, answers) => {
  try {
    // Calculate score
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctAnswers / answers.length) * 100);
    const passed = score >= 70; // 70% passing score

    // Create submission record
    const { data: submission, error: submitError } = await supabase
      .from('quiz_submissions')
      .insert([
        {
          user_id: userId,
          quiz_id: quizId,
          score,
          passed,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (submitError) throw submitError;

    // Save individual answers
    const answersToInsert = answers.map((answer) => ({
      submission_id: submission.id,
      question_id: answer.questionId,
      selected_answer: answer.selectedAnswer,
      is_correct: answer.isCorrect,
    }));

    const { error: answersError } = await supabase
      .from('quiz_answers')
      .insert(answersToInsert);

    if (answersError) throw answersError;

    return {
      data: {
        submission,
        score,
        passed,
        correctAnswers,
        totalQuestions: answers.length,
      },
      error: null,
    };
  } catch (error) {
    console.error('Submit quiz answers error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get quiz submission history for user
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID (optional)
 * @returns {Promise<{data, error}>}
 */
export const getUserQuizSubmissions = async (userId, quizId = null) => {
  try {
    let query = supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', userId);

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data, error } = await query.order('submitted_at', {
      ascending: false,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get user quiz submissions error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get quiz submission with answers
 * @param {string} submissionId - Submission ID
 * @returns {Promise<{data, error}>}
 */
export const getQuizSubmissionWithAnswers = async (submissionId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(
        `
        *,
        quiz_answers (
          *,
          questions (*)
        )
      `
      )
      .eq('id', submissionId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Get quiz submission with answers error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get quiz statistics
 * @param {string} quizId - Quiz ID
 * @returns {Promise<{data, error}>}
 */
export const getQuizStatistics = async (quizId) => {
  try {
    const { data: submissions, error: submissionsError } = await supabase
      .from('quiz_submissions')
      .select('score, passed')
      .eq('quiz_id', quizId);

    if (submissionsError) throw submissionsError;

    if (!submissions || submissions.length === 0) {
      return {
        data: {
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          passCount: 0,
          failCount: 0,
        },
        error: null,
      };
    }

    const passCount = submissions.filter((s) => s.passed).length;
    const failCount = submissions.length - passCount;
    const averageScore = Math.round(
      submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length
    );
    const passRate = Math.round((passCount / submissions.length) * 100);

    return {
      data: {
        totalAttempts: submissions.length,
        averageScore,
        passRate,
        passCount,
        failCount,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get quiz statistics error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Get user's best quiz submission for a quiz
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<{data, error}>}
 */
export const getUserBestQuizScore = async (userId, quizId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get user best quiz score error:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Subscribe to quiz submissions
 * @param {string} quizId - Quiz ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToQuizSubmissions = (quizId, callback) => {
  const subscription = supabase
    .from(`quiz_submissions:quiz_id=eq.${quizId}`)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
};
