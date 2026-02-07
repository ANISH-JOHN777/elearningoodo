import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Calendar, Award, Zap, Target, MessageSquare, Filter } from 'lucide-react';

/**
 * PointsTimeline Component
 * Shows historical timeline of when points were earned
 */
export default function PointsTimeline() {
  const { courses } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  // Mock timeline data (in real app, would come from AppContext)
  const timelineEvents = useMemo(() => {
    return [
      {
        id: 1,
        activityName: 'JavaScript Basics Quiz',
        type: 'quiz',
        course: 'JavaScript Mastery',
        courseId: 4,
        points: 130,
        date: new Date(2024, 0, 9, 15, 45),
        icon: Target,
      },
      {
        id: 2,
        activityName: 'API Integration Challenge',
        type: 'lab',
        course: 'JavaScript Mastery',
        courseId: 4,
        points: 90,
        date: new Date(2024, 0, 8, 14, 0),
        icon: Zap,
      },
      {
        id: 3,
        activityName: 'Introduction to React Hooks',
        type: 'quiz',
        course: 'React Fundamentals',
        courseId: 1,
        points: 98,
        date: new Date(2024, 0, 15, 14, 30),
        icon: Target,
      },
      {
        id: 4,
        activityName: 'Building a Todo App',
        type: 'lab',
        course: 'React Fundamentals',
        courseId: 1,
        points: 70,
        date: new Date(2024, 0, 14, 10, 15),
        icon: Zap,
      },
      {
        id: 5,
        activityName: 'Understanding State Management',
        type: 'dialogue',
        course: 'React Fundamentals',
        courseId: 1,
        points: 100,
        date: new Date(2024, 0, 13, 16, 45),
        icon: MessageSquare,
      },
      {
        id: 6,
        activityName: 'CSS Flexbox Fundamentals',
        type: 'quiz',
        course: 'Web Design Essentials',
        courseId: 2,
        points: 78,
        date: new Date(2024, 0, 12, 11, 20),
        icon: Target,
      },
      {
        id: 7,
        activityName: 'Building Responsive Layouts',
        type: 'lab',
        course: 'Web Design Essentials',
        courseId: 2,
        points: 40,
        date: new Date(2024, 0, 11, 13, 30),
        icon: Zap,
      },
      {
        id: 8,
        activityName: 'HTML Semantics',
        type: 'dialogue',
        course: 'Web Fundamentals',
        courseId: 3,
        points: 80,
        date: new Date(2024, 0, 10, 9, 0),
        icon: MessageSquare,
      },
    ];
  }, []);

  // Filter timeline events
  const filteredEvents = useMemo(() => {
    let filtered = timelineEvents;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((e) => e.courseId === selectedCourseId);
    }

    // Filter by time range
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (timeRange === 'week') {
      filtered = filtered.filter((e) => e.date >= weekAgo);
    } else if (timeRange === 'month') {
      filtered = filtered.filter((e) => e.date >= monthAgo);
    }

    // Sort by date descending
    return filtered.sort((a, b) => b.date - a.date);
  }, [timelineEvents, selectedCourseId, timeRange]);

  // Calculate cumulative points
  const cumulativeData = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => a.date - b.date);
    let cumulative = 0;
    return sorted.map((event) => {
      cumulative += event.points;
      return { ...event, cumulative };
    });
  }, [filteredEvents]);

  // Daily summary
  const dailySummary = useMemo(() => {
    const summary = {};
    filteredEvents.forEach((event) => {
      const dateKey = event.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (!summary[dateKey]) {
        summary[dateKey] = { points: 0, activities: 0, date: event.date };
      }
      summary[dateKey].points += event.points;
      summary[dateKey].activities += 1;
    });
    return Object.values(summary).sort((a, b) => b.date - a.date);
  }, [filteredEvents]);

  // Total stats
  const totalStats = useMemo(() => {
    const total = filteredEvents.reduce((sum, e) => sum + e.points, 0);
    const activities = filteredEvents.length;
    const avgPerActivity = activities > 0 ? Math.round(total / activities) : 0;
    return { total, activities, avgPerActivity };
  }, [filteredEvents]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz':
        return Target;
      case 'lab':
        return Zap;
      case 'dialogue':
        return MessageSquare;
      default:
        return Award;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'quiz':
        return 'from-sky-500 to-sky-600';
      case 'lab':
        return 'from-cyan-500 to-cyan-600';
      case 'dialogue':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPointColor = (points) => {
    if (points >= 100) return 'text-emerald-600';
    if (points >= 70) return 'text-cyan-600';
    if (points >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          Points Timeline
        </h1>
        <p className="text-gray-600 text-lg">
          Track when you earned points and your progress over time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Points',
            value: totalStats.total,
            subtext: 'in selected period',
            color: 'from-cyan-500 to-cyan-600',
          },
          {
            label: 'Activities',
            value: totalStats.activities,
            subtext: 'completed',
            color: 'from-sky-500 to-sky-600',
          },
          {
            label: 'Average',
            value: totalStats.avgPerActivity,
            subtext: 'points per activity',
            color: 'from-emerald-500 to-emerald-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
          >
            <p className="text-white/70 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-white/60 text-xs">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Time Range
            </label>
            <div className="flex gap-2">
              {[
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'All Time', value: 'all' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                    timeRange === range.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Daily Summary</h2>

        {dailySummary.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activities in selected period</p>
        ) : (
          <div className="space-y-3">
            {dailySummary.map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">{new Intl.DateTimeFormat('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    }).format(day.date)}</p>
                    <p className="text-sm text-gray-600">{day.activities} activity/activities</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">+{day.points}</p>
                  <p className="text-xs text-gray-600">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">Activity Timeline</h2>

        {cumulativeData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activities in selected period</p>
        ) : (
          <div className="space-y-6">
            {cumulativeData.map((event, idx) => {
              const Icon = getActivityIcon(event.type);
              return (
                <div key={event.id} className="flex gap-6">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getActivityColor(event.type)} border-2 border-blue-500 flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {idx !== cumulativeData.length - 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-transparent mt-2" />
                    )}
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 pb-6">
                    <div className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-blue-600">
                            {event.activityName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{event.course}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${getPointColor(event.points)}`}>
                            +{event.points}
                          </p>
                          <p className="text-xs text-gray-600 capitalize mt-1">
                            {event.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          {event.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm font-semibold text-emerald-600">
                          Cumulative: {event.cumulative} pts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
