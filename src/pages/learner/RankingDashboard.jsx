import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, TrendingUp, Target, Zap, Crown, Medal, Flame, Star, Trophy, ChevronUp } from 'lucide-react';

/**
 * RankingDashboard Component
 * Displays user's ranking progress, current tier, and overall achievements
 * Shows points, tier progression, and leaderboard integration
 */
export default function RankingDashboard({ userId, courseId = null }) {
  const {
    user,
    users,
    getAllUserRankings,
    getCourseRankings,
    getRankingTier,
    RANKING_SYSTEM,
    courses,
  } = useApp();

  const [userRankings, setUserRankings] = useState([]);
  const [courseLeaderboard, setCourseLeaderboard] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId);
  const [stats, setStats] = useState({
    totalPoints: 0,
    coursesEnrolled: 0,
    currentTier: null,
    pointsToNextTier: 0,
  });

  // Fetch user rankings
  useEffect(() => {
    if (user?.id) {
      const rankings = getAllUserRankings(user.id);
      setUserRankings(rankings);

      // Calculate stats
      const totalPoints = rankings.reduce((sum, r) => sum + r.points, 0);
      const currentTier = getRankingTier(totalPoints);
      const nextTier = RANKING_SYSTEM.find((t) => t.minPoints > totalPoints);
      const pointsToNextTier = nextTier
        ? nextTier.minPoints - totalPoints
        : 0;

      setStats({
        totalPoints,
        coursesEnrolled: rankings.length,
        currentTier,
        pointsToNextTier,
      });
    }
  }, [user?.id, getAllUserRankings, getRankingTier, RANKING_SYSTEM]);

  // Fetch course leaderboard
  useEffect(() => {
    if (selectedCourse) {
      const leaderboard = getCourseRankings(selectedCourse);
      setCourseLeaderboard(leaderboard);
    }
  }, [selectedCourse, getCourseRankings]);

  const currentTier = stats.currentTier;
  const currentTierIndex = RANKING_SYSTEM.findIndex(
    (t) => t.tier === currentTier?.tier
  );
  const nextTierIndex = currentTierIndex + 1;
  const nextTier = nextTierIndex < RANKING_SYSTEM.length
    ? RANKING_SYSTEM[nextTierIndex]
    : null;

  // Calculate progress to next tier
  const progressPercent = 
    nextTier && currentTier && stats.totalPoints
      ? ((stats.totalPoints - currentTier.minPoints) /
          (nextTier.minPoints - currentTier.minPoints)) * 100
      : 0;

  // Get tier badge icon
  const getTierIcon = (tier) => {
    if (!tier || !tier.order) return Medal;
    if (tier.order <= 3) return Medal; // Bronze
    if (tier.order === 4) return Award; // Silver
    if (tier.order <= 6) return Zap; // Gold/Platinum
    return Crown; // Diamond
  };

  const getTierColor = (tier) => {
    if (!tier || !tier.order) return 'from-slate-600 to-slate-700';
    if (tier.order <= 3) return 'from-amber-600 to-amber-700'; // Bronze
    if (tier.order === 4) return 'from-slate-400 to-slate-500'; // Silver
    if (tier.order === 5) return 'from-yellow-500 to-yellow-600'; // Gold
    if (tier.order === 6) return 'from-cyan-400 to-cyan-500'; // Platinum
    return 'from-cyan-300 to-cyan-400'; // Diamond
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header Section */}
        <div className="relative animate-fade-in-down">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-white/95 to-blue-50/80 rounded-3xl border border-blue-200 backdrop-blur p-8 lg:p-10 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-500">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2 animate-gradient-xy">
                  Rankings & Achievements
                </h1>
                <p className="text-slate-600 text-lg">Track your progress and compete across courses</p>
              </div>
              <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-blue-200">
                {currentTier ? React.createElement(getTierIcon(currentTier), {
                  className: 'w-14 h-14 text-blue-600',
                }) : React.createElement(Medal, {
                  className: 'w-14 h-14 text-blue-600',
                })}
              </div>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-xl p-8 text-center">
            <p className="text-slate-700 text-lg mb-4">Please log in to view your rankings</p>
          </div>
        ) : (
          <>
      {/* Main Tier Card - Enhanced */}
      <div className="group relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 hover:shadow-cyan-500/20">
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
          </div>
          
          {/* Header with Tier */}
          <div className={`relative bg-gradient-to-r ${getTierColor(currentTier)} p-8 lg:p-10 text-white overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <Flame className="absolute -top-4 -right-4 w-32 h-32 animate-pulse" />
            </div>
            <div className="relative flex items-start justify-between gap-6 lg:gap-12">
              <div className="flex-1">
                <p className="text-sm font-semibold opacity-90 mb-3 uppercase tracking-wider">Current Tier</p>
                <h2 className="text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg">{currentTier?.tier || 'Bronze III'}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/50"></div>
                  <p className="text-xl opacity-95 font-semibold">{stats.totalPoints} / 120 Points</p>
                </div>
              </div>
              {currentTier ? React.createElement(getTierIcon(currentTier), {
                className: 'w-24 h-24 opacity-90 filter drop-shadow-lg flex-shrink-0 animate-bounce',
              }) : React.createElement(Medal, {
                className: 'w-24 h-24 opacity-90 filter drop-shadow-lg flex-shrink-0 animate-bounce',
              })}
            </div>
          </div>

          {/* Progress Section - Enhanced */}
          <div className="relative p-8 lg:p-10 space-y-8">
            {/* Overall Stats Grid - Enhanced with icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-50 p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="absolute top-0 right-0 -m-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-24 h-24" />
                </div>
                <div className="relative">
                  <Zap className="w-6 h-6 text-blue-600 mb-3" />
                  <p className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                    {stats.totalPoints}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Points</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-50 p-6 border border-sky-500/30 hover:border-sky-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="absolute top-0 right-0 -m-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-24 h-24" />
                </div>
                <div className="relative">
                  <Target className="w-6 h-6 text-purple-600 mb-3" />
                  <p className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                    {stats.coursesEnrolled}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Courses</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50 p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="absolute top-0 right-0 -m-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ChevronUp className="w-24 h-24" />
                </div>
                <div className="relative">
                  <ChevronUp className="w-6 h-6 text-emerald-600 mb-3" />
                  <p className="text-4xl lg:text-5xl font-bold text-emerald-600 mb-2">
                    {stats.pointsToNextTier}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">To Next Tier</p>
                </div>
              </div>
            </div>

            {/* Progress to Next Tier - Enhanced */}
            {nextTier && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 animate-fade-in-up hover:border-cyan-500/40 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold text-slate-900">
                      Progress to {nextTier.tier}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 border border-blue-200 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-500 transition-all duration-700 rounded-full shadow-lg shadow-cyan-500/50"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-3">
                  🎯 Earn {stats.pointsToNextTier} more points to reach {nextTier.tier}
                </p>
              </div>
            )}

            {/* Tier Progression - Enhanced visualization */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Tier Progression
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {RANKING_SYSTEM.map((tier, idx) => {
                  const isReached = tier.minPoints <= stats.totalPoints;
                  const isCurrent = tier.tier === currentTier?.tier;

                  return (
                    <div
                      key={tier.tier}
                      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${isCurrent ? 'scale-110' : ''}`}
                    >
                      <div
                        className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                          isCurrent
                            ? `border-white shadow-lg shadow-white/50 bg-gradient-to-br ${getTierColor(tier)}`
                            : isReached
                            ? `border-blue-300 bg-slate-700/40 shadow-lg shadow-cyan-500/20`
                            : 'border-slate-600 bg-slate-700/20'
                        }`}
                      >
                        {isCurrent && <Flame className="w-4 h-4 text-yellow-300 absolute top-1 animate-bounce" />}
                        <span className={`text-xs font-black leading-tight ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                          {tier.tier.split(' ')[0]}
                        </span>
                        {isReached && (
                          <span className="text-lg mt-0.5">✨</span>
                        )}
                      </div>
                      {/* Enhanced Tooltip */}
                      <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-blue-300 rounded-lg px-3 py-2 text-xs text-slate-900 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 font-semibold shadow-lg">
                        {tier.tier}
                        <br />
                        <span className="text-blue-600">{tier.minPoints}-{tier.maxPoints} pts</span>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Rankings - Enhanced */}
      {userRankings.length > 0 && (
        <div className="group relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 hover:shadow-cyan-500/20">
            <div className="p-8 lg:p-10">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <Trophy className="w-6 h-6" />
                Your Course Rankings
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userRankings.map((ranking, idx) => {
                  const course = courses.find((c) => c.id === ranking.courseId);
                  const courseRankings = getCourseRankings(ranking.courseId);
                  const userRank = courseRankings.findIndex(r => r.id === user.id) + 1;
                  const isTopThree = userRank <= 3;

                  return (
                    <div
                      key={`${ranking.courseId}-${idx}`}
                      className={`group/card relative overflow-hidden rounded-xl border-2 transition-all duration-300 animate-fade-in-up hover:scale-105 ${
                        isTopThree
                          ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30'
                          : 'border-blue-200 bg-gradient-to-br from-cyan-500/5 to-slate-700/20 hover:shadow-lg hover:shadow-cyan-500/20'
                      }`}
                      style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                    >
                      {/* Rank badge */}
                      {isTopThree && (
                        <div className="absolute top-4 right-4 z-10">
                          {userRank === 1 && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-lg"></div>
                              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-2 border-yellow-300">
                                <Crown className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                          {userRank === 2 && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center border-2 border-slate-300">
                              <Medal className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {userRank === 3 && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center border-2 border-orange-300">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="p-6 lg:p-7">
                        {/* Course name and rank */}
                        <div className="mb-5">
                          <h4 className="text-lg font-bold text-slate-100 mb-2">
                            {course?.title || `Course ${ranking.courseId}`}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              isTopThree
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-cyan-500/20 text-slate-900 border border-blue-200'
                            }`}>
                              Rank #{userRank}
                            </span>
                            <span className={`text-xl font-bold ${isTopThree ? 'text-amber-500' : 'text-blue-600'}`}>
                              {ranking.points} pts
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-5">
                          <div className="w-full bg-slate-200 rounded-full h-2 border border-slate-600 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isTopThree
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                  : 'bg-gradient-to-r from-cyan-500 to-sky-500'
                              }`}
                              style={{
                                width: `${Math.min((ranking.points / 120) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-blue-50 rounded-lg p-3 border border-slate-600/50">
                            <p className="text-slate-600 text-xs mb-1">Total Users</p>
                            <p className="text-lg font-bold text-slate-900">{courseRankings.length}</p>
                          </div>
                          <div className={`rounded-lg p-3 border ${
                            isTopThree
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-cyan-500/10 border-blue-200'
                          }`}>
                            <p className={`text-xs mb-1 ${isTopThree ? 'text-amber-500' : 'text-blue-600'}`}>
                              Position
                            </p>
                            <p className={`text-lg font-bold ${isTopThree ? 'text-yellow-300' : 'text-slate-900'}`}>
                              {userRank}/{courseRankings.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Preview - Enhanced */}
      {courses.length > 0 && (
        <div className="group relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 hover:shadow-cyan-500/20">
            <div className="p-8 lg:p-10">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <Star className="w-6 h-6" />
                Leaderboard
              </h3>

              {/* Course Selector - Enhanced */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                  Select Course
                </label>
                <div className="relative">
                  <select
                    value={selectedCourse || ''}
                    onChange={(e) => setSelectedCourse(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-gradient-to-r from-slate-700/50 to-slate-800/50 border-2 border-blue-200 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all appearance-none cursor-pointer hover:border-blue-300"
                  >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <ChevronUp className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
                </div>
              </div>

              {/* Leaderboard Table - Enhanced */}
              {selectedCourse && courseLeaderboard.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {courseLeaderboard.slice(0, 10).map((ranking, idx) => {
                    const rankedUser = users.find((u) => u.id === ranking.userId);
                    const tier = getRankingTier(ranking.points);
                    const TierIcon = getTierIcon(tier);
                    const isCurrentUser = ranking.userId === user?.id;
                    const isTopThree = idx < 3;

                    let medalBg = '';
                    if (idx === 0) medalBg = 'from-yellow-500/20 to-amber-500/10 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/30';
                    else if (idx === 1) medalBg = 'from-slate-500/20 to-slate-600/10 border-2 border-slate-500/50 shadow-lg shadow-slate-500/20';
                    else if (idx === 2) medalBg = 'from-orange-500/20 to-red-500/10 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20';
                    else medalBg = isCurrentUser ? 'from-cyan-500/20 to-cyan-500/5 border-2 border-blue-300' : 'from-slate-700/40 to-slate-800/20 border-2 border-blue-200 hover:border-cyan-500/40';

                    return (
                      <div
                        key={ranking.userId}
                        className={`group/row p-5 rounded-xl bg-gradient-to-r ${medalBg} transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up`}
                        style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div className="flex-shrink-0">
                            {idx === 0 && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-yellow-500/40 rounded-full blur-md"></div>
                                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center border-2 border-yellow-300 font-black text-lg text-white">
                                  👑
                                </div>
                              </div>
                            )}
                            {idx === 1 && (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center border-2 border-slate-300 font-black text-lg text-white">
                                🥈
                              </div>
                            )}
                            {idx === 2 && (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center border-2 border-orange-300 font-black text-lg text-white">
                                🥉
                              </div>
                            )}
                            {idx > 2 && (
                              <div className="w-12 h-12 rounded-full bg-slate-700/60 border-2 border-slate-600 flex items-center justify-center font-bold text-slate-700">
                                #{idx + 1}
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={rankedUser?.avatar}
                                alt={rankedUser?.name}
                                className="w-10 h-10 rounded-full border-2 border-blue-300 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold truncate ${isTopThree ? 'text-lg text-slate-100' : 'text-slate-100'}`}>
                                  {rankedUser?.name}
                                  {isCurrentUser && <span className="text-blue-600 ml-2">(You)</span>}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                                isTopThree
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-cyan-500/20 text-slate-900'
                              }`}>
                                {ranking.points} pts
                              </span>
                              {/* Mini progress */}
                              <div className="flex-1 min-w-0 h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-600/50">
                                <div
                                  className={`h-full ${
                                    isTopThree
                                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                      : 'bg-gradient-to-r from-cyan-500 to-sky-500'
                                  }`}
                                  style={{
                                    width: `${Math.min((ranking.points / 120) * 100, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Tier Badge */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={`text-right`}>
                              <p className="font-bold text-xs text-slate-600 uppercase tracking-wider">Tier</p>
                              <p className={`font-bold text-sm ${tier.color}`}>
                                {tier.tier}
                              </p>
                            </div>
                            <div className={`p-2 rounded-lg ${
                              isTopThree
                                ? 'bg-yellow-500/20 border border-yellow-500/30'
                                : 'bg-slate-700/40 border border-slate-600/50'
                            }`}>
                              <TierIcon className={`w-5 h-5 ${tier.color}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* View More Button */}
                  {courseLeaderboard.length > 10 && (
                    <button className="w-full mt-6 px-4 sm:px-6 py-3 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 hover:from-cyan-600/40 hover:to-purple-600/40 border-2 border-blue-300 hover:border-cyan-500/80 text-slate-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                      <span className="whitespace-nowrap text-sm sm:text-base">View All Rankings</span>
                      <ChevronUp className="w-4 h-4 group-hover:translate-y-1 transition-transform flex-shrink-0" />
                    </button>
                  )}
                </div>
              ) : selectedCourse ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-600 text-lg">No rankings available yet</p>
                  <p className="text-slate-500 text-sm mt-2">Be the first to earn points in this course!</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-600 text-lg">Select a course to see rankings</p>
                  <p className="text-slate-500 text-sm mt-2">Choose from the dropdown above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          </>
        )}
      </div>
    </div>
  );
}
