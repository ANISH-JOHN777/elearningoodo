import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Award, Filter, Search, ChevronDown, Clock, CheckCircle, AlertCircle, TrendingUp, Flame } from 'lucide-react';

/**
 * ActivityHistory Component
 * Shows all completed activities with their scores and details
 */
export default function ActivityHistory() {
  const { courses, recordQuizAttempt } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterType, setFilterType] = useState('all');

  // Mock activity history data (in real app, would come from AppContext)
  const activityHistory = useMemo(() => {
    return [
      {
        id: 1,
        activityName: 'Introduction to React Hooks',
        type: 'quiz',
        courseName: 'React Fundamentals',
        courseId: 1,
        score: 95,
        maxScore: 100,
        earnedPoints: 98,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 15, 14, 30),
        duration: '12 minutes',
        performanceLevel: 'excellent',
        details: 'Scored 95/100 with 30-point perfect bonus',
      },
      {
        id: 2,
        activityName: 'Building a Todo App',
        type: 'lab',
        courseName: 'React Fundamentals',
        courseId: 1,
        score: 8,
        maxScore: 10,
        earnedPoints: 70,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 14, 10, 15),
        duration: '45 minutes',
        performanceLevel: 'good',
        details: '8 of 10 tests passed (80%)',
      },
      {
        id: 3,
        activityName: 'Understanding State Management',
        type: 'dialogue',
        courseName: 'React Fundamentals',
        courseId: 1,
        score: 5,
        maxScore: 5,
        earnedPoints: 100,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 13, 16, 45),
        duration: '18 minutes',
        performanceLevel: 'excellent',
        details: 'Covered all 5 learning objectives',
      },
      {
        id: 4,
        activityName: 'CSS Flexbox Fundamentals',
        type: 'quiz',
        courseName: 'Web Design Essentials',
        courseId: 2,
        score: 78,
        maxScore: 100,
        earnedPoints: 78,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 12, 11, 20),
        duration: '8 minutes',
        performanceLevel: 'good',
        details: 'Scored 78/100',
      },
      {
        id: 5,
        activityName: 'Building Responsive Layouts',
        type: 'lab',
        courseName: 'Web Design Essentials',
        courseId: 2,
        score: 6,
        maxScore: 10,
        earnedPoints: 40,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 11, 13, 30),
        duration: '60 minutes',
        performanceLevel: 'fair',
        details: '6 of 10 tests passed (60%)',
      },
      {
        id: 6,
        activityName: 'HTML Semantics',
        type: 'dialogue',
        courseName: 'Web Fundamentals',
        courseId: 3,
        score: 4,
        maxScore: 5,
        earnedPoints: 80,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 10, 9, 0),
        duration: '15 minutes',
        performanceLevel: 'good',
        details: 'Covered 4 of 5 learning objectives',
      },
      {
        id: 7,
        activityName: 'JavaScript Basics Quiz',
        type: 'quiz',
        courseName: 'JavaScript Mastery',
        courseId: 4,
        score: 100,
        maxScore: 100,
        earnedPoints: 130,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 9, 15, 45),
        duration: '15 minutes',
        performanceLevel: 'excellent',
        details: 'Perfect score with 30-point bonus',
      },
      {
        id: 8,
        activityName: 'API Integration Challenge',
        type: 'lab',
        courseName: 'JavaScript Mastery',
        courseId: 4,
        score: 9,
        maxScore: 10,
        earnedPoints: 90,
        totalPoints: 100,
        completedAt: new Date(2024, 0, 8, 14, 0),
        duration: '50 minutes',
        performanceLevel: 'excellent',
        details: '9 of 10 tests passed (90%)',
      },
    ];
  }, []);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activityHistory;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((a) => a.courseId === selectedCourseId);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.completedAt - a.completedAt;
        case 'date-asc':
          return a.completedAt - b.completedAt;
        case 'score-high':
          return b.score - a.score;
        case 'score-low':
          return a.score - b.score;
        case 'points-high':
          return b.earnedPoints - a.earnedPoints;
        default:
          return 0;
      }
    });

    return sorted;
  }, [activityHistory, selectedCourseId, filterType, searchTerm, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    const completed = filteredActivities.length;
    const totalPointsEarned = filteredActivities.reduce((sum, a) => sum + a.earnedPoints, 0);
    const avgScore =
      completed > 0 ? Math.round(filteredActivities.reduce((sum, a) => sum + a.score, 0) / completed) : 0;
    const excellentCount = filteredActivities.filter((a) => a.performanceLevel === 'excellent').length;

    return { completed, totalPointsEarned, avgScore, excellentCount };
  }, [filteredActivities]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'quiz':
        return 'bg-sky-100 text-sky-700 border-sky-300';
      case 'lab':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'dialogue':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'excellent':
        return 'text-emerald-600';
      case 'good':
        return 'text-cyan-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceIcon = (level) => {
    if (level === 'excellent') return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 flex items-center gap-3">
          <Award className="w-8 h-8" />
          Activity History
        </h1>
        <p className="text-gray-600 text-lg">
          View all your completed activities and earned points
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Completed',
            value: stats.completed,
            icon: CheckCircle,
            color: 'from-emerald-500 to-emerald-600',
          },
          {
            label: 'Total Points',
            value: stats.totalPointsEarned,
            icon: Award,
            color: 'from-cyan-500 to-cyan-600',
          },
          {
            label: 'Avg Score',
            value: `${stats.avgScore}%`,
            icon: TrendingUp,
            color: 'from-sky-500 to-sky-600',
          },
          {
            label: 'Excellent',
            value: stats.excellentCount,
            icon: Flame,
            color: 'from-orange-500 to-orange-600',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-white/50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Course Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Course
            </label>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="lab">Lab</option>
              <option value="dialogue">Dialogue</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-high">Highest Score</option>
              <option value="score-low">Lowest Score</option>
              <option value="points-high">Most Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No activities found</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 hover:shadow-lg transition shadow-md overflow-hidden"
            >
              {/* Activity Card */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left: Activity Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-blue-600 mb-1">
                          {activity.activityName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{activity.courseName}</p>

                        {/* Activity Type Badge */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getTypeColor(
                              activity.type
                            )}`}
                          >
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {activity.completedAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.duration}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score & Points */}
                  <div className="flex items-center gap-8">
                    {/* Performance Level */}
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${getPerformanceColor(activity.performanceLevel)}`}>
                        {getPerformanceIcon(activity.performanceLevel)}
                        <span className="text-sm font-semibold capitalize">
                          {activity.performanceLevel}
                        </span>
                      </div>
                    </div>

                    {/* Score Circle */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">
                            {Math.round((activity.score / activity.maxScore) * 100)}
                          </p>
                          <p className="text-xs text-white/80">%</p>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Points Earned</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        +{activity.earnedPoints}
                        <span className="text-sm text-gray-600 ml-1">/ {activity.totalPoints}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
