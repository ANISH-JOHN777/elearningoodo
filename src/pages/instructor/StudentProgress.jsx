import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Search,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Zap,
} from 'lucide-react';

const StudentProgress = () => {
  const { user, courses, enrollments, getEnrollment, getCourseById, users } = useApp();
  const [selectedLearnerId, setSelectedLearnerId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get courses created by this instructor
  const instructorCourses = courses.filter(
    (course) => course.responsibleId === user?.id || course.adminId === user?.id
  );

  // Get enrollments for instructor's courses
  const getCourseEnrollments = (courseId) => {
    return enrollments.filter((enrollment) => enrollment.courseId === courseId);
  };

  const getLearnerById = (userId) => users.find((u) => u.id === userId);

  const calculateProgress = (enrollment, courseId) => {
    const course = getCourseById(courseId);
    if (!course || course.lessons.length === 0) return 0;
    const completed = enrollment.completedLessons.length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!user || user.role === 'learner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900/10 to-slate-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">Only instructors can view student progress</p>
        </div>
      </div>
    );
  }

  // Detailed Analytics View
  if (selectedLearnerId && selectedCourseId) {
    const learner = getLearnerById(selectedLearnerId);
    const course = getCourseById(selectedCourseId);
    const enrollment = getEnrollment(selectedLearnerId, selectedCourseId);

    if (!learner || !course || !enrollment) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900/10 to-slate-900 p-6">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => {
                setSelectedLearnerId(null);
                setSelectedCourseId(null);
              }}
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Progress
            </button>
            <p className="text-white">Learner or course not found</p>
          </div>
        </div>
      );
    }

    const progress = calculateProgress(enrollment, selectedCourseId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900/10 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => {
              setSelectedLearnerId(null);
              setSelectedCourseId(null);
            }}
            className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Progress
          </button>

          {/* Learner Info Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {learner.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{learner.name}</h1>
                <p className="text-white/70 mb-4">{learner.email}</p>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-white/50 text-sm">Overall Progress</p>
                    <p className="text-3xl font-bold text-white">{progress}%</p>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressBarColor(progress)} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">{course.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Total Lessons</p>
                <p className="text-2xl font-bold text-white">{course.lessons.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-400">{enrollment.completedLessons.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Points Earned</p>
                <p className="text-2xl font-bold text-yellow-400">{learner.points || 0}</p>
              </div>
            </div>
          </div>

          {/* Lessons Breakdown */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Lesson Progress</h3>
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => {
                const isCompleted = enrollment.completedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          Lesson {index + 1}: {lesson.title}
                        </p>
                        <p className="text-sm text-white/50 capitalize">{lesson.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-white/50'}`}>
                        {isCompleted ? '✓ Completed' : 'Not Started'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Progress View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900/10 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-cyan-400" />
            Student Progress
          </h1>
          <p className="text-white/70">Track your learners' progress across all courses</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Courses List */}
        {instructorCourses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">You haven't created any courses yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {instructorCourses.map((course) => {
              const courseEnrollments = getCourseEnrollments(course.id);
              const filteredEnrollments = courseEnrollments.filter((enrollment) => {
                const learner = getLearnerById(enrollment.userId);
                return (
                  searchQuery === '' ||
                  learner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  learner?.email.toLowerCase().includes(searchQuery.toLowerCase())
                );
              });

              return (
                <div
                  key={course.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
                >
                  {/* Course Header */}
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
                    <div className="flex items-center gap-6 text-white/70 text-sm">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {courseEnrollments.length} enrolled
                      </span>
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {course.lessons.length} lessons
                      </span>
                    </div>
                  </div>

                  {/* Learners List */}
                  <div className="p-6">
                    {filteredEnrollments.length === 0 ? (
                      <p className="text-white/50 text-center py-8">No students found</p>
                    ) : (
                      <div className="space-y-3">
                        {filteredEnrollments.map((enrollment) => {
                          const learner = getLearnerById(enrollment.userId);
                          const progress = calculateProgress(enrollment, course.id);

                          if (!learner) return null;

                          return (
                            <button
                              key={enrollment.userId}
                              onClick={() => {
                                setSelectedLearnerId(enrollment.userId);
                                setSelectedCourseId(course.id);
                              }}
                              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all group cursor-pointer"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {learner.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left flex-1">
                                  <p className="font-semibold text-white">{learner.name}</p>
                                  <p className="text-sm text-white/50">{learner.email}</p>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="flex items-center gap-4 flex-shrink-0 w-64">
                                <div className="flex-1">
                                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getProgressBarColor(
                                        Math.round(
                                          (enrollment.completedLessons.length / course.lessons.length) * 100
                                        )
                                      )} transition-all`}
                                      style={{
                                        width: `${Math.round(
                                          (enrollment.completedLessons.length / course.lessons.length) * 100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className={`text-sm font-bold px-3 py-1 rounded-lg ${getProgressColor(
                                  Math.round(
                                    (enrollment.completedLessons.length / course.lessons.length) * 100
                                  )
                                )}`}>
                                  {Math.round(
                                    (enrollment.completedLessons.length / course.lessons.length) * 100
                                  )}%
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
