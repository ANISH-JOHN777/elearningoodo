import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Circle,
  Menu,
  X,
  FileText,
  Download,
  ExternalLink,
  Award,
  Trophy,
  PartyPopper,
  Sparkles,
  Star,
} from 'lucide-react';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const {
    user,
    getCourseById,
    getEnrollment,
    completeLesson,
    completeCourse,
    getQuizById,
    recordQuizAttempt,
    getQuizAttempts,
    addPoints,
  } = useApp();

  const course = getCourseById(parseInt(courseId));
  const enrollment = getEnrollment(user?.id, parseInt(courseId));
  const currentLesson = course?.lessons.find((l) => l.id === parseInt(lessonId));
  const currentIndex = course?.lessons.findIndex((l) => l.id === parseInt(lessonId));

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quizState, setQuizState] = useState('intro'); // 'intro', 'question', 'completed'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const quiz = currentLesson?.type === 'quiz' ? getQuizById(currentLesson.quizId) : null;
  const quizAttempts = quiz ? getQuizAttempts(user?.id, quiz.id) : [];
  const attemptNumber = quizAttempts.length + 1;

  useEffect(() => {
    // Reset quiz state when lesson changes
    setQuizState('intro');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
  }, [lessonId]);

  if (!course || !currentLesson || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load lesson</p>
          <button
            onClick={() => navigate('/courses')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const isLessonCompleted = enrollment?.completedLessons.includes(currentLesson.id);
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;

  const handleCompleteLesson = () => {
    completeLesson(user.id, parseInt(courseId), currentLesson.id);
    if (nextLesson) {
      navigate(`/learn/${courseId}/${nextLesson.id}`);
    }
  };

  const handleCompleteCourse = () => {
    completeCourse(user.id, parseInt(courseId));
    alert('Congratulations! You have completed this course!');
    navigate(`/courses/${courseId}`);
  };

  const handleStartQuiz = () => {
    setQuizState('question');
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleProceedQuestion = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setQuizAnswers([
      ...quizAnswers,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
      },
    ]);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      completeQuizAndAwardPoints();
    }
  };

  const completeQuizAndAwardPoints = () => {
    const correctAnswers = quizAnswers.filter((a) => a.isCorrect).length + (selectedAnswer === quiz.questions[currentQuestionIndex].correctAnswer ? 1 : 0);
    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Award points based on attempt number
    let points = 0;
    if (attemptNumber === 1) points = quiz.rewards.firstTry;
    else if (attemptNumber === 2) points = quiz.rewards.secondTry;
    else if (attemptNumber === 3) points = quiz.rewards.thirdTry;
    else points = quiz.rewards.fourthTry;

    recordQuizAttempt(user.id, quiz.id, score, attemptNumber);
    addPoints(user.id, points);
    completeLesson(user.id, parseInt(courseId), currentLesson.id);

    setEarnedPoints(points);
    setShowPointsModal(true);
    setQuizState('completed');
  };

  const renderViewer = () => {
    if (currentLesson.type === 'video') {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={currentLesson.url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (currentLesson.type === 'document') {
      return (
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Document</h3>
            {currentLesson.allowDownload && (
              <a
                href={currentLesson.url}
                download
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600">Document viewer placeholder</p>
            <p className="text-sm text-gray-500 mt-2">URL: {currentLesson.url}</p>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'image') {
      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <img
            src={currentLesson.url}
            alt={currentLesson.title}
            className="w-full h-auto rounded-lg"
          />
          {currentLesson.allowDownload && (
            <a
              href={currentLesson.url}
              download
              className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </a>
          )}
        </div>
      );
    }

    if (currentLesson.type === 'quiz' && quiz) {
      if (quizState === 'intro') {
        return (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center animate-scale-in-center">
            <Trophy className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Ready for the Quiz?</h2>
            <p className="text-gray-600 mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>Total Questions: {quiz.questions.length}</p>
            <p className="text-gray-600 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>Multiple attempts allowed</p>
            {attemptNumber > 1 && (
              <p className="text-sm text-amber-600 mb-6 animate-pulse-soft">
                This is attempt #{attemptNumber}. You will earn {
                  attemptNumber === 2 ? quiz.rewards.secondTry :
                  attemptNumber === 3 ? quiz.rewards.thirdTry :
                  quiz.rewards.fourthTry
                } points upon completion.
              </p>
            )}
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-lg font-semibold btn-ripple btn-press hover-glow transform hover:scale-105 transition-all animate-bounce-in"
            >
              Start Quiz
            </button>
          </div>
        );
      }

      if (quizState === 'question') {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        return (
          <div className="bg-white rounded-lg p-8 border border-gray-200 animate-fade-in" key={currentQuestionIndex}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600 animate-fade-in">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <div className="flex space-x-1">
                  {quiz.questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        index < currentQuestionIndex
                          ? 'bg-green-500 scale-110'
                          : index === currentQuestionIndex
                          ? 'bg-primary-600 animate-pulse scale-125'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                {currentQuestion.text}
              </h3>
            </div>

            <div className="space-y-3 mb-8 stagger-children">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedAnswer === index
                      ? 'border-primary-600 bg-primary-50 scale-[1.02] shadow-md'
                      : 'border-gray-200 hover:border-primary-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        selectedAnswer === index
                          ? 'border-primary-600 bg-primary-600 scale-110'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 bg-white rounded-full animate-scale-in" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleProceedQuestion}
              disabled={selectedAnswer === null}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold btn-ripple btn-press transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {currentQuestionIndex === quiz.questions.length - 1
                ? 'Complete Quiz'
                : 'Next Question'}
            </button>
          </div>
        );
      }

      if (quizState === 'completed') {
        return (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center animate-scale-in-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6 animate-bounce-in" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Quiz Completed!</h2>
            <p className="text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              You've earned <span className="text-primary-600 font-bold text-xl animate-pulse">{earnedPoints}</span> points
            </p>
            {nextLesson && (
              <button
                onClick={() => navigate(`/learn/${courseId}/${nextLesson.id}`)}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold whitespace-nowrap btn-ripple btn-press hover-glow transform hover:scale-105 transition-all animate-bounce-in"
              >
                Continue to Next Lesson
              </button>
            )}
          </div>
        );
      }
    }

    return <div>Content type not supported</div>;
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-white transition-all duration-500 ease-out overflow-hidden flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 animate-fade-in">
            <h2 className="font-semibold text-gray-900 mb-2">{course.title}</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {enrollment?.completedLessons.length}/{course.lessons.length} completed
              </span>
              <span className="font-semibold text-primary-600 counter-animate">
                {enrollment?.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-1000 ease-out progress-animate"
                style={{ width: `${enrollment?.progress || 0}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 stagger-children">
            {course.lessons.map((lesson, index) => {
              const isCompleted = enrollment?.completedLessons.includes(lesson.id);
              const isCurrent = lesson.id === currentLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/learn/${courseId}/${lesson.id}`)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 transform hover:translate-x-1 ${
                    isCurrent
                      ? 'bg-primary-100 border-2 border-primary-600 scale-[1.02] shadow-md'
                      : 'hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600 animate-scale-in" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent ? 'text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {lesson.type}
                        {lesson.duration && ` • ${lesson.duration} min`}
                      </p>
                      {lesson.attachments && lesson.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {lesson.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {att.type === 'file' ? (
                                <FileText className="w-3 h-3" />
                              ) : (
                                <ExternalLink className="w-3 h-3" />
                              )}
                              <span className="truncate">{att.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {enrollment?.progress === 100 && (
            <div className="p-4 border-t border-gray-200 animate-fade-in-up">
              <button
                onClick={handleCompleteCourse}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center space-x-2 btn-ripple btn-press hover-glow transform hover:scale-[1.02] transition-all"
              >
                <Trophy className="w-5 h-5 animate-float" />
                <span>Complete Course</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{currentLesson.title}</h1>
              <p className="text-sm text-gray-600 capitalize">{currentLesson.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {prevLesson && (
              <button
                onClick={() => navigate(`/learn/${courseId}/${prevLesson.id}`)}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs whitespace-nowrap"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            {nextLesson ? (
              <button
                onClick={() => {
                  if (!isLessonCompleted) {
                    handleCompleteLesson();
                  } else {
                    navigate(`/learn/${courseId}/${nextLesson.id}`);
                  }
                }}
                className="flex items-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs whitespace-nowrap"
              >
                <span>{isLessonCompleted ? 'Next' : 'Complete & Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              !isLessonCompleted && (
                <button
                  onClick={handleCompleteLesson}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark Complete</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Lesson Description */}
            {currentLesson.description && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">About this lesson</h3>
                <p className="text-gray-600">{currentLesson.description}</p>
              </div>
            )}

            {/* Viewer */}
            {renderViewer()}
          </div>
        </div>
      </div>

      {/* Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-overlay-enter">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center modal-enter relative overflow-hidden">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 animate-confetti" style={{ animationDelay: '0s' }}><PartyPopper className="w-8 h-8 text-yellow-500" /></div>
              <div className="absolute top-0 right-1/4 animate-confetti" style={{ animationDelay: '0.2s' }}><Sparkles className="w-8 h-8 text-pink-500" /></div>
              <div className="absolute top-0 left-1/2 animate-confetti" style={{ animationDelay: '0.4s' }}><Star className="w-8 h-8 text-yellow-400 fill-yellow-400" /></div>
            </div>
            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce-in" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">Congratulations!</h2>
            <p className="text-3xl font-bold text-primary-600 mb-4 animate-scale-in-center" style={{ animationDelay: '0.3s' }}>
              +{earnedPoints} Points
            </p>
            <p className="text-gray-600 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              You now have <span className="font-bold text-primary-600">{(user.points || 0) + earnedPoints}</span> total points!
            </p>
            <button
              onClick={() => setShowPointsModal(false)}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold whitespace-nowrap btn-ripple btn-press hover-glow transform hover:scale-[1.02] transition-all animate-bounce-in" style={{ animationDelay: '0.5s' }}
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;
