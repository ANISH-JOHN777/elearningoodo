import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, PieChart, TrendingUp, Award, ArrowUpRight, FileText, Wrench, MessageCircle, ChevronDown } from 'lucide-react';

/**
 * PointsBreakdown Component
 * Shows detailed breakdown of points earned by activity type, course, etc.
 */
export default function PointsBreakdown() {
  const { courses } = useApp();
  const [breakdownType, setBreakdownType] = useState('byType'); // byType, byCourse
  const [expandedHistory, setExpandedHistory] = useState({}); // Track which items show history

  // Map icon names to Lucide components
  const iconMap = {
    FileText,
    Wrench,
    MessageCircle,
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || Award;
  };

  const toggleHistory = (label) => {
    setExpandedHistory(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Mock activity history (in real app, would come from AppContext)
  const activityHistory = useMemo(() => {
    return {
      'Quiz': [
        { id: 1, name: 'React Hooks Quiz', points: 98, date: new Date(2024, 0, 15), score: 95 },
        { id: 2, name: 'JavaScript Basics', points: 92, date: new Date(2024, 0, 13), score: 92 },
        { id: 3, name: 'CSS Selectors Quiz', points: 100, date: new Date(2024, 0, 10), score: 100 },
        { id: 4, name: 'HTML Structure', points: 100, date: new Date(2024, 0, 8), score: 100 },
      ],
      'Lab': [
        { id: 1, name: 'Todo App Lab', points: 70, date: new Date(2024, 0, 14), tests: '8/10' },
        { id: 2, name: 'API Integration', points: 100, date: new Date(2024, 0, 12), tests: '10/10' },
        { id: 3, name: 'Responsive Design', points: 100, date: new Date(2024, 0, 9), tests: '5/5' },
      ],
      'Dialogue': [
        { id: 1, name: 'State Management Chat', points: 100, date: new Date(2024, 0, 13), objectives: '5/5' },
        { id: 2, name: 'Component Patterns', points: 80, date: new Date(2024, 0, 11), objectives: '4/5' },
        { id: 3, name: 'Hooks Introduction', points: 80, date: new Date(2024, 0, 8), objectives: '4/5' },
      ],
      'JavaScript Mastery': [
        { id: 1, name: 'Advanced Closures', points: 95, date: new Date(2024, 0, 15), type: 'quiz' },
        { id: 2, name: 'Promise Chains', points: 125, date: new Date(2024, 0, 12), type: 'lab' },
      ],
      'React Fundamentals': [
        { id: 1, name: 'Hooks Practice', points: 98, date: new Date(2024, 0, 15), type: 'quiz' },
        { id: 2, name: 'Todo App', points: 70, date: new Date(2024, 0, 14), type: 'lab' },
        { id: 3, name: 'State Management', points: 100, date: new Date(2024, 0, 13), type: 'dialogue' },
      ],
      'Web Design Essentials': [
        { id: 1, name: 'Flexbox Layout', points: 88, date: new Date(2024, 0, 12), type: 'quiz' },
        { id: 2, name: 'Responsive Design', points: 30, date: new Date(2024, 0, 11), type: 'lab' },
      ],
      'Web Fundamentals': [
        { id: 1, name: 'HTML Semantics', points: 80, date: new Date(2024, 0, 10), type: 'dialogue' },
      ],
    };
  }, []);

  // Mock points data (in real app, would come from AppContext)
  const pointsData = useMemo(() => {
    return {
      byType: [
        {
          label: 'Quiz',
          points: 390,
          maxPoints: 400,
          percentage: 97.5,
          activities: 4,
          iconName: 'FileText',
          color: 'from-sky-500 to-sky-600',
          secondaryColor: 'bg-sky-500/20',
          borderColor: 'border-sky-500/30',
        },
        {
          label: 'Lab',
          points: 270,
          maxPoints: 400,
          percentage: 67.5,
          activities: 4,
          iconName: 'Wrench',
          color: 'from-cyan-500 to-cyan-600',
          secondaryColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-500/30',
        },
        {
          label: 'Dialogue',
          points: 260,
          maxPoints: 300,
          percentage: 86.7,
          activities: 3,
          iconName: 'MessageCircle',
          color: 'from-yellow-500 to-yellow-600',
          secondaryColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
        },
      ],
      byCourse: [
        {
          label: 'JavaScript Mastery',
          points: 220,
          maxPoints: 200,
          percentage: 110,
          activities: 2,
          color: 'from-emerald-500 to-emerald-600',
          secondaryColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/30',
        },
        {
          label: 'React Fundamentals',
          points: 268,
          maxPoints: 300,
          percentage: 89.3,
          activities: 3,
          color: 'from-blue-500 to-blue-600',
          secondaryColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
        },
        {
          label: 'Web Design Essentials',
          points: 118,
          maxPoints: 200,
          percentage: 59,
          activities: 2,
          color: 'from-pink-500 to-pink-600',
          secondaryColor: 'bg-pink-500/20',
          borderColor: 'border-pink-500/30',
        },
        {
          label: 'Web Fundamentals',
          points: 80,
          maxPoints: 100,
          percentage: 80,
          activities: 1,
          color: 'from-purple-500 to-purple-600',
          secondaryColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30',
        },
      ],
    };
  }, []);

  const currentData = breakdownType === 'byType' ? pointsData.byType : pointsData.byCourse;

  // Calculate totals
  const totals = useMemo(() => {
    const total = currentData.reduce((sum, item) => sum + item.points, 0);
    const maxTotal = currentData.reduce((sum, item) => sum + item.maxPoints, 0);
    const avgPercentage = Math.round(currentData.reduce((sum, item) => sum + item.percentage, 0) / currentData.length);
    return { total, maxTotal, avgPercentage };
  }, [currentData]);

  // Calculate breakdowns for charts
  const typeDistribution = useMemo(() => {
    const total = pointsData.byType.reduce((sum, item) => sum + item.points, 0);
    return pointsData.byType.map((item) => ({
      ...item,
      share: Math.round((item.points / total) * 100),
    }));
  }, [pointsData.byType]);

  const courseDistribution = useMemo(() => {
    const total = pointsData.byCourse.reduce((sum, item) => sum + item.points, 0);
    return pointsData.byCourse.map((item) => ({
      ...item,
      share: Math.round((item.points / total) * 100),
    }));
  }, [pointsData.byCourse]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          Points Breakdown
        </h1>
        <p className="text-slate-400 text-lg">
          Detailed analysis of your points earned by activity type and course
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Points Earned',
            value: totals.total,
            subtext: `of ${totals.maxTotal} possible`,
            icon: Award,
            color: 'from-cyan-500 to-cyan-600',
          },
          {
            label: 'Average Achievement',
            value: `${totals.avgPercentage}%`,
            subtext: 'across all categories',
            icon: TrendingUp,
            color: 'from-emerald-500 to-emerald-600',
          },
          {
            label: 'Categories',
            value: currentData.length,
            subtext: `${currentData.reduce((sum, item) => sum + item.activities, 0)} total activities`,
            icon: BarChart3,
            color: 'from-sky-500 to-sky-600',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-xl p-6 shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
                  <p className="text-white/60 text-xs">{card.subtext}</p>
                </div>
                <Icon className="w-8 h-8 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2 justify-center">
        {[
          { label: 'By Activity Type', value: 'byType', icon: BarChart3 },
          { label: 'By Course', value: 'byCourse', icon: PieChart },
        ].map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.value}
              onClick={() => setBreakdownType(btn.value)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition ${
                breakdownType === btn.value
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 border border-cyan-500/20 hover:border-cyan-500/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Distribution Chart */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-8">Distribution</h2>

        <div className="space-y-4">
          {(breakdownType === 'byType' ? typeDistribution : courseDistribution).map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  {item.iconName && React.createElement(getIcon(item.iconName), {
                    className: 'w-6 h-6 flex-shrink-0'
                  })}
                  <div>
                    <p className="font-semibold text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">
                      {item.activities} activity/activities
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{item.share}%</p>
                  <p className="text-sm text-slate-400">{item.points} pts</p>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden border border-cyan-500/20">
                <div
                  className={`h-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-6">Detailed Breakdown</h2>

        <div className="space-y-4">
          {currentData.map((item) => {
            const percentage = Math.round((item.points / item.maxPoints) * 100);
            const isExceeding = percentage > 100;

            return (
              <div
                key={item.label}
                className={`bg-gradient-to-br ${item.secondaryColor} border ${item.borderColor} rounded-xl p-6 overflow-hidden hover:border-opacity-100 transition`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {item.activities} activity{item.activities > 1 ? 'ies' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${isExceeding ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {item.points}
                    </p>
                    <p className="text-xs text-slate-500">
                      of {item.maxPoints} possible
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Achievement</span>
                    <span className={`text-sm font-bold ${isExceeding ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {percentage}%
                      {isExceeding && (
                        <ArrowUpRight className="w-4 h-4 inline ml-1" />
                      )}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden border border-cyan-500/10">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    {
                      label: 'Earned',
                      value: item.points,
                      color: 'text-emerald-400',
                    },
                    {
                      label: 'Maximum',
                      value: item.maxPoints,
                      color: 'text-cyan-400',
                    },
                    {
                      label: 'Percentage',
                      value: `${percentage}%`,
                      color: 'text-sky-400',
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-slate-700/50 rounded-lg p-3 text-center border border-cyan-500/10"
                    >
                      <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                      <p className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* History Toggle Button */}
                <button
                  onClick={() => toggleHistory(item.label)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 font-semibold text-sm border border-cyan-500/10 hover:border-cyan-500/30"
                >
                  <span>View History</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedHistory[item.label] ? 'rotate-180' : ''}`} />
                </button>

                {/* History Section */}
                {expandedHistory[item.label] && (
                  <div className="mt-4 pt-4 border-t border-slate-500/30 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Recent Activities</p>
                    {(activityHistory[item.label] || []).map((activity) => (
                      <div key={activity.id} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{activity.name}</p>
                          <p className="text-xs text-slate-500">{activity.date.toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-emerald-400">+{activity.points}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Strongest Category',
            category: 'Quiz',
            percentage: 97,
            insight: 'You excel at quiz-based learning with a 97.5% achievement rate',
            color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
          },
          {
            title: 'Growth Area',
            category: 'Lab',
            percentage: 67,
            insight: 'Lab exercises need focus - aim for 80%+ to unlock full potential',
            color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
          },
        ].map((insight) => (
          <div
            key={insight.title}
            className={`bg-gradient-to-br ${insight.color} border rounded-xl p-6`}
          >
            <p className="text-sm font-semibold text-slate-400 mb-2">{insight.title}</p>
            <p className="text-xl font-bold text-slate-200 mb-3">{insight.category}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Achievement</span>
                <span>{insight.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-500"
                  style={{ width: `${insight.percentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">{insight.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
