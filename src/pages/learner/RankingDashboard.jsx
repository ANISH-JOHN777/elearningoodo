import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, TrendingUp, Target, Zap, Crown, Medal } from 'lucide-react';

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
    if (!userId && user) {
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
  }, [user, userId, getAllUserRankings, getRankingTier, RANKING_SYSTEM]);

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
  const progressPercent = nextTier
    ? ((stats.totalPoints - currentTier.minPoints) /
        (nextTier.minPoints - currentTier.minPoints)) *
      100
    : 100;

  // Get tier badge icon
  const getTierIcon = (tier) => {
    if (tier.order <= 3) return Medal; // Bronze
    if (tier.order === 4) return Award; // Silver
    if (tier.order <= 6) return Zap; // Gold/Platinum
    return Crown; // Diamond
  };

  const getTierColor = (tier) => {
    if (tier.order <= 3) return 'from-amber-600 to-amber-700'; // Bronze
    if (tier.order === 4) return 'from-slate-400 to-slate-500'; // Silver
    if (tier.order === 5) return 'from-yellow-500 to-yellow-600'; // Gold
    if (tier.order === 6) return 'from-cyan-400 to-cyan-500'; // Platinum
    return 'from-cyan-300 to-cyan-400'; // Diamond
  };

  return (
    <div className="space-y-8">
      {/* Main Tier Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl overflow-hidden">
        {/* Header with Tier */}
        <div className={`bg-gradient-to-r ${getTierColor(currentTier)} p-8 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold opacity-90 mb-2">Current Tier</p>
              <h2 className="text-4xl font-bold mb-2">{currentTier?.tier}</h2>
              <p className="text-lg opacity-90">{stats.totalPoints} / 120 Points</p>
            </div>
            {React.createElement(getTierIcon(currentTier), {
              className: 'w-16 h-16 opacity-80',
            })}
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-8 space-y-6">
          {/* Overall Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-cyan-500/20">
              <p className="text-3xl font-bold text-cyan-400 mb-1">
                {stats.totalPoints}
              </p>
              <p className="text-xs text-slate-400">Total Points</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-cyan-500/20">
              <p className="text-3xl font-bold text-sky-400 mb-1">
                {stats.coursesEnrolled}
              </p>
              <p className="text-xs text-slate-400">Courses</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-cyan-500/20">
              <p className="text-3xl font-bold text-yellow-400 mb-1">
                {stats.pointsToNextTier}
              </p>
              <p className="text-xs text-slate-400">To Next Tier</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">
                  Progress to {nextTier.tier}
                </span>
                <span className="text-sm text-slate-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 border border-cyan-500/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Earn {stats.pointsToNextTier} more points to reach {nextTier.tier}
              </p>
            </div>
          )}

          {/* Tier Progression */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-300 mb-4">
              Tier Progression
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {RANKING_SYSTEM.map((tier, idx) => {
                const isReached = tier.minPoints <= stats.totalPoints;
                const isCurrent = tier.tier === currentTier?.tier;

                return (
                  <div
                    key={tier.tier}
                    className={`relative group cursor-pointer transition-transform hover:scale-110`}
                  >
                    <div
                      className={`w-full aspect-square rounded-lg flex items-center justify-center border-2 text-center ${
                        isCurrent
                          ? `border-2 border-white shadow-lg shadow-${tier.color.split('-')[1]}-500/50`
                          : isReached
                          ? `border-2 border-${tier.color.split('-')[1]}-500/50`
                          : 'border-2 border-slate-600'
                      } ${
                        isReached
                          ? `bg-${tier.color.split('-')[1]}-500/20`
                          : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-300 leading-tight">
                          {tier.tier.split(' ')[0]}
                        </span>
                        {isReached && (
                          <span className="text-lg">✓</span>
                        )}
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-cyan-500/50 rounded-lg px-2 py-1 text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      {tier.tier}
                      <br />
                      {tier.minPoints}-{tier.maxPoints} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Course Rankings */}
      {userRankings.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
          <h3 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            Course Rankings
          </h3>

          <div className="space-y-4">
            {userRankings.map((ranking, idx) => {
              const course = courses.find((c) => c.id === ranking.courseId);
              const tier = getRankingTier(ranking.points);
              const TierIcon = getTierIcon(tier);

              return (
                <div
                  key={ranking.courseId}
                  className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-100 truncate">
                        {course?.title || 'Unknown Course'}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {ranking.points} / 120 points
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-cyan-400">{tier.tier}</p>
                        <p className="text-xs text-slate-500">
                          {Math.round(
                            (ranking.points / 120) * 100
                          )}%
                        </p>
                      </div>
                      <TierIcon className={`w-8 h-8 ${tier.color}`} />
                    </div>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="mt-3 h-2 bg-slate-600/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-sky-500"
                      style={{
                        width: `${Math.min((ranking.points / 120) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Preview */}
      {courses.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
          <h3 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6" />
            Leaderboard
          </h3>

          {/* Course Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-cyan-300 mb-3">
              Select Course
            </label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
            >
              <option value="">Select a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Leaderboard Table */}
          {selectedCourse && courseLeaderboard.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courseLeaderboard.slice(0, 10).map((ranking, idx) => {
                const rankedUser = users.find((u) => u.id === ranking.userId);
                const tier = getRankingTier(ranking.points);
                const TierIcon = getTierIcon(tier);
                const isCurrentUser = ranking.userId === user?.id;

                return (
                  <div
                    key={ranking.userId}
                    className={`p-4 rounded-lg border transition ${
                      isCurrentUser
                        ? 'bg-cyan-500/20 border-cyan-500/50'
                        : 'bg-slate-700/30 border-cyan-500/20 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-10 text-center">
                        <p className="text-lg font-bold text-cyan-400">
                          #{idx + 1}
                        </p>
                      </div>

                      {/* User Info */}
                      <img
                        src={rankedUser?.avatar}
                        alt={rankedUser?.name}
                        className="w-10 h-10 rounded-full flex-shrink-0 border border-cyan-500/50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-100 truncate">
                          {rankedUser?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ranking.points} points
                        </p>
                      </div>

                      {/* Tier Badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-slate-300 text-sm">
                          {tier.tier}
                        </span>
                        <TierIcon className={`w-6 h-6 ${tier.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* View More Button */}
              {courseLeaderboard.length > 10 && (
                <button className="w-full mt-4 px-4 py-2 border border-cyan-500/50 text-cyan-300 hover:bg-slate-700/50 rounded-lg font-semibold transition">
                  View Full Leaderboard
                </button>
              )}
            </div>
          ) : selectedCourse ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No rankings available yet</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">Select a course to see rankings</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
