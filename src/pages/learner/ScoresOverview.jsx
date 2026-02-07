import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Award, TrendingUp, Zap, Target, Activity, ChevronRight, Medal, Flame, Code, FileText, Palette, Globe, MessageCircle, Wrench, Star, CheckCircle } from 'lucide-react';
import PointsBreakdown from './PointsBreakdown';
import ActivityHistory from './ActivityHistory';
import PointsTimeline from './PointsTimeline';
import ScoringRules from './ScoringRules';

/**
 * ScoresOverview Component
 * Main dashboard for viewing points, scores, and achievements
 */
export default function ScoresOverview() {
  const { courses } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, breakdown, history, timeline, rules

  // Map icon names to Lucide components
  const iconMap = {
    Code,
    FileText,
    Palette,
    Globe,
    MessageCircle,
    Target,
    Wrench,
    Flame,
    Zap,
    Star,
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || Code;
  };

  // Mock user score data (in real app, would come from AppContext)
  const userScoreData = useMemo(() => {
    return {
      totalPoints: 920,
      totalMaxPoints: 1200,
      recentPoints: 228, // last 7 days
      averageScore: 82,
      courseScores: [
        {
          id: 1,
          name: 'React Fundamentals',
          points: 268,
          maxPoints: 300,
          percentage: 89,
          activities: 3,
          rank: 'Advanced',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-500/10',
          iconName: 'Code',
        },
        {
          id: 4,
          name: 'JavaScript Mastery',
          points: 220,
          maxPoints: 200,
          percentage: 110,
          activities: 2,
          rank: 'Master',
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-500/10',
          iconName: 'FileText',
        },
        {
          id: 2,
          name: 'Web Design Essentials',
          points: 118,
          maxPoints: 200,
          percentage: 59,
          activities: 2,
          rank: 'Intermediate',
          color: 'from-pink-500 to-pink-600',
          bgColor: 'bg-pink-500/10',
          iconName: 'Palette',
        },
        {
          id: 3,
          name: 'Web Fundamentals',
          points: 80,
          maxPoints: 100,
          percentage: 80,
          activities: 1,
          rank: 'Advanced',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-500/10',
          iconName: 'Globe',
        },
        {
          id: 5,
          name: 'Python for Data Science',
          points: 234,
          maxPoints: 400,
          percentage: 58,
          activities: 5,
          rank: 'Beginner',
          color: 'from-yellow-500 to-yellow-600',
          bgColor: 'bg-yellow-500/10',
          iconName: 'Code',
        },
      ],
      achievements: [
        { id: 1, name: 'Perfect Quiz Master', description: 'Score 100% on any quiz', unlocked: true, iconName: 'Target' },
        { id: 2, name: 'Lab Legend', description: 'Pass all test cases in a lab', unlocked: true, iconName: 'Wrench' },
        { id: 3, name: 'Dialogue Expert', description: 'Cover all objectives in a dialogue', unlocked: true, iconName: 'MessageCircle' },
        { id: 4, name: 'Streak Master', description: 'Complete 10 activities in a row', unlocked: false, iconName: 'Flame' },
        { id: 5, name: 'Speed Runner', description: 'Complete activity under 5 min', unlocked: false, iconName: 'Zap' },
        { id: 6, name: 'Thousand Points', description: 'Earn 1000 points total', unlocked: false, iconName: 'Star' },
      ],
    };
  }, []);

  // Prepare tab content
  const tabContent = {
    overview: (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Points',
              value: userScoreData.totalPoints,
              subtext: `of ${userScoreData.totalMaxPoints}`,
              icon: Award,
              color: 'from-cyan-500 to-cyan-600',
            },
            {
              label: 'This Week',
              value: `+${userScoreData.recentPoints}`,
              subtext: 'points earned',
              icon: Zap,
              color: 'from-sky-500 to-sky-600',
            },
            {
              label: 'Avg Score',
              value: `${userScoreData.averageScore}%`,
              subtext: 'across all activities',
              icon: TrendingUp,
              color: 'from-emerald-500 to-emerald-600',
            },
            {
              label: 'Courses',
              value: userScoreData.courseScores.length,
              subtext: 'active learning',
              icon: Activity,
              color: 'from-orange-500 to-orange-600',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-white/60 text-xs mt-1">{stat.subtext}</p>
                  </div>
                  <Icon className="w-8 h-8 text-white/30" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Overall Progress</h2>

          <div className="space-y-4">
            {/* Main Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 font-semibold">Total Points Earned</span>
                <span className="text-blue-600 font-bold">
                  {Math.round((userScoreData.totalPoints / userScoreData.totalMaxPoints) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-blue-200">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-500"
                  style={{
                    width: `${Math.min(
                      (userScoreData.totalPoints / userScoreData.totalMaxPoints) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {userScoreData.totalPoints} / {userScoreData.totalMaxPoints} points
              </p>
            </div>

            {/* Achievement Unlocks */}
            <div className="mt-8 pt-8 border-t border-blue-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Medal className="w-5 h-5" />
                Achievement Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userScoreData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition ${
                      achievement.unlocked
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-200 border-slate-600/30 opacity-60'
                    }`}
                  >
                  <div className="flex items-start gap-3">
                      {React.createElement(getIcon(achievement.iconName), {
                        className: 'w-6 h-6 flex-shrink-0 mt-1'
                      })}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{achievement.name}</p>
                        <p className="text-xs text-slate-600 mt-1">{achievement.description}</p>
                        {achievement.unlocked && (
                          <p className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Unlocked</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Scores */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-blue-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Your Courses
            </h2>
          </div>

          <div className="divide-y divide-blue-100">
            {userScoreData.courseScores.map((course) => (
              <div
                key={course.id}
                className={`p-6 hover:${course.bgColor} transition cursor-pointer`}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(getIcon(course.iconName), {
                      className: 'w-8 h-8 flex-shrink-0'
                    })}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{course.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${course.bgColor}`}>
                          {course.rank}
                        </span>
                        <span className="text-xs text-slate-600">{course.activities} activities</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-400">{course.points}</p>
                    <p className="text-xs text-slate-600">of {course.maxPoints} pts</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Achievement</span>
                    <span className="text-sm font-bold text-blue-600">{course.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-blue-200">
                    <div
                      className={`h-full bg-gradient-to-r ${course.color}`}
                      style={{ width: `${Math.min(course.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    breakdown: <PointsBreakdown />,
    history: <ActivityHistory />,
    timeline: <PointsTimeline />,
    rules: <ScoringRules />,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Award },
    { id: 'breakdown', label: 'Breakdown', icon: TrendingUp },
    { id: 'history', label: 'History', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Flame },
    { id: 'rules', label: 'Scoring Rules', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-xl p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Award className="w-10 h-10" />
          Scores & Achievements
        </h1>
        <p className="text-slate-600 text-lg">
          Track your learning progress and earned points across all courses
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 px-2 md:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-700 border border-blue-200 hover:border-cyan-500/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
