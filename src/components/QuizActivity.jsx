import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';

/**
 * QuizActivity Component
 * Displays quiz questions one per page with automatic scoring
 * - Max 10 questions
 * - No backward navigation (one-way progression)
 * - Tracks score and awards points based on performance
 * - Prevents multiple submissions
 */
export default function QuizActivity({
  activityId,
  courseId,
  moduleId,
  userId,
  quizTitle = 'Quiz Activity',
  questions = [],
  onComplete = () => {},
}) {
  const { updateUserCoursePoints, recordQuizAttempt } = useApp();

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate quiz data
  useEffect(() => {
    if (!questions || questions.length === 0) {
      setQuizComplete(true);
    }
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Handle answer selection
  const handleSelectAnswer = (optionIndex) => {
    if (!submitted) {
      setSelectedAnswer(optionIndex);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setLoading(true);
    setSubmitted(true);
    setShowResult(true);

    // Record the answer
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: selectedAnswer,
    };
    setAnswers(newAnswers);

    // Check if answer is correct
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Simulate processing delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Handle next question or complete quiz
  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setShowResult(false);
    }
  };

  // Finish quiz and calculate points
  const finishQuiz = async () => {
    setLoading(true);
    
    // Calculate points based on score
    // Full score = 10 points, each correct = 10/total questions
    const totalQuestions = questions.length;
    let earnedPoints = 0;
    
    // Points for correct answers (70% of total)
    const pointsPerQuestion = Math.floor((70 / totalQuestions) * score);
    earnedPoints += pointsPerQuestion;

    // Bonus points for 100% (30% of total)
    if (score === totalQuestions) {
      earnedPoints += 30;
    } else if (score >= totalQuestions * 0.8) {
      earnedPoints += 15; // 80% or higher gets half bonus
    }

    // Cap at 100 points max
    earnedPoints = Math.min(earnedPoints, 100);

    try {
      // Record attempt in AppContext
      await recordQuizAttempt(userId, activityId, score, 1);

      // Award points to user
      if (earnedPoints > 0) {
        await updateUserCoursePoints(userId, courseId, earnedPoints, 'quiz_completion');
      }

      setQuizComplete(true);

      // Call completion callback
      setTimeout(() => {
        onComplete({
          activityId,
          score,
          totalQuestions,
          earnedPoints,
          percentage: Math.round((score / totalQuestions) * 100),
        });
      }, 1000);
    } catch (error) {
      console.error('Error completing quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset quiz
  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowResult(false);
  };

  // Quiz Complete Screen
  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const earnedPoints = Math.min(
      Math.floor((70 / questions.length) * score) +
        (score === questions.length ? 30 : score >= questions.length * 0.8 ? 15 : 0),
      100
    );

    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-sky-500/20 rounded-full mb-4">
            <Award className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">Quiz Complete! 🎉</h2>
          <p className="text-slate-400 text-lg">{quizTitle}</p>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Correct Answers */}
          <div className="bg-sky-500/20 border border-sky-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-sky-400 mb-2">{score}</div>
            <div className="text-sm text-slate-400">Correct Answers</div>
            <div className="text-xs text-slate-500 mt-1">out of {questions.length}</div>
          </div>

          {/* Percentage */}
          <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{percentage}%</div>
            <div className="text-sm text-slate-400">Score</div>
            <div className="text-xs text-slate-500 mt-1">
              {percentage >= 90 ? 'Outstanding!' : percentage >= 80 ? 'Great!' : percentage >= 70 ? 'Good' : 'Keep trying'}
            </div>
          </div>

          {/* Points Earned */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">+{earnedPoints}</div>
            <div className="text-sm text-slate-400">Points Earned</div>
            <div className="text-xs text-slate-500 mt-1">for this course</div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-cyan-300 mb-4">Review Your Answers</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    isCorrect ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">
                      Q{idx + 1}: {q.question.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isCorrect ? 'Correct!' : `Wrong. Answer: ${q.options[q.correctAnswer]}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-300 transition group"
          >
            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
            Retake Quiz
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 rounded-lg font-semibold text-white transition"
          >
            Continue Course
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Empty Quiz State
  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl text-center">
        <p className="text-slate-400 text-lg">No questions available for this quiz.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-white transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Quiz Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">{quizTitle}</h1>
        <p className="text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <div className="mt-4 bg-slate-700/50 rounded-full h-2 overflow-hidden border border-cyan-500/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8 mb-8">
        {/* Question Text */}
        <h2 className="text-xl font-bold text-white mb-8 leading-relaxed">{currentQuestion.question}</h2>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrectAnswer = idx === currentQuestion.correctAnswer;
            const isShowingResult = showResult && submitted;
            const isWrongSelected = isSelected && !isCorrectAnswer;

            let bgColor = 'bg-slate-700/50 border-cyan-500/30';
            let labelColor = 'text-slate-300';
            let hoverEffect = 'hover:bg-slate-600/50 hover:border-cyan-400/50';

            if (isShowingResult) {
              if (isCorrectAnswer) {
                bgColor = 'bg-sky-500/20 border-sky-500/50';
                labelColor = 'text-sky-300';
                hoverEffect = '';
              } else if (isWrongSelected) {
                bgColor = 'bg-red-500/20 border-red-500/50';
                labelColor = 'text-red-300';
                hoverEffect = '';
              } else {
                hoverEffect = '';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                disabled={submitted}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${bgColor} ${labelColor} ${
                  isSelected && !isShowingResult && 'ring-2 ring-cyan-400 border-cyan-400'
                } ${hoverEffect} disabled:cursor-default`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected || (isShowingResult && isCorrectAnswer)
                      ? 'bg-cyan-500 border-cyan-400'
                      : isWrongSelected
                      ? 'bg-red-500 border-red-400'
                      : 'border-slate-500'
                  }`}>
                    {isShowingResult && isCorrectAnswer && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                    {isShowingResult && isWrongSelected && (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="flex-1 font-medium">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {showResult && submitted && (
          <div className={`p-4 rounded-lg mb-8 ${
            selectedAnswer === currentQuestion.correctAnswer
              ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            <p className="font-semibold mb-1">
              {selectedAnswer === currentQuestion.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-sm">{currentQuestion.explanation || 'Great effort!'}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-cyan-500/50 text-cyan-300 hover:bg-slate-700/50 rounded-lg font-semibold transition"
          >
            Exit Quiz
          </button>

          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 rounded-lg font-bold text-white transition"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Submit Answer
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg font-bold text-white transition"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
