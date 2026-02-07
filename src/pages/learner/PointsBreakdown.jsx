import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, PieChart, TrendingUp, Award, ArrowUpRight } from 'lucide-react';

/**
 * PointsBreakdown Component
 * Shows detailed breakdown of points earned by activity type, course, etc.
 */
export default function PointsBreakdown() {
  const { courses } = useApp();
  const [breakdownType, setBreakdownType] = useState('byType'); // byType, byCourse

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
          icon: '📝',
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
          icon: '⚙️',
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
          icon: '💬',
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
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
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
