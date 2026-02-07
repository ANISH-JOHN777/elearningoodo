import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TrendingUp, Award, Filter, Search, Medal, Zap, Crown } from 'lucide-react';
import TierBadge from '../components/TierBadge';

/**
 * CourseLeaderboard Component
 * Displays course-specific rankings and student achievements
 * Features filtering, searching, and detailed rank information
 */
export default function CourseLeaderboard() {
  const { courseId: courseIdParam } = useParams();
  const courseId = parseInt(courseIdParam, 10);
  const { getCourseRankings, getRankingTier, RANKING_SYSTEM, courses, users, user } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState('points'); // points, name, progress

  // Get leaderboard data
  const leaderboard = useMemo(() => {
    const rankings = getCourseRankings(courseId);
    
    return rankings
      .map((ranking) => {
        const rankedUser = users.find((u) => u.id === ranking.userId);
        const tier = getRankingTier(ranking.points);
        return {
          ...ranking,
          user: rankedUser,
          tier,
          progress: Math.round((ranking.points / 120) * 100),
        };
      })
      .filter((item) => {
        // Filter by search
        if (searchQuery && !item.user?.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        // Filter by tier
        if (filterTier !== 'all' && item.tier.tier !== filterTier) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'points') return b.points - a.points;
        if (sortBy === 'name') return a.user?.name.localeCompare(b.user?.name);
        if (sortBy === 'progress') return b.progress - a.progress;
        return 0;
      });
  }, [courseId, getCourseRankings, getRankingTier, users, searchQuery, filterTier, sortBy]);

  const course = courses.find((c) => c.id === courseId);
  const uniqueTiers = [...new Set(leaderboard.map((item) => item.tier.tier))];

  // Get statistics
  const stats = {
    totalParticipants: leaderboard.length,
    averagePoints: Math.round(leaderboard.reduce((sum, item) => sum + item.points, 0) / leaderboard.length || 0),
    topTier: leaderboard[0]?.tier,
    highestScore: leaderboard[0]?.points || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          {course?.title} Rankings
        </h1>
        <p className="text-slate-400">See how you rank against other learners in this course</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-cyan-400 mb-1">{stats.totalParticipants}</p>
            <p className="text-xs text-slate-400">Total Participants</p>
          </div>
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-sky-400 mb-1">{stats.averagePoints}</p>
            <p className="text-xs text-slate-400">Average Points</p>
          </div>
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-yellow-400 mb-1">{stats.highestScore}</p>
            <p className="text-xs text-slate-400">Highest Score</p>
          </div>
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-2xl font-bold text-cyan-300 mb-1">{uniqueTiers.length}</p>
            <p className="text-xs text-slate-400">Tiers Represented</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
            />
          </div>

          {/* Filter by Tier */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
            >
              <option value="all">All Tiers</option>
              {RANKING_SYSTEM.map((tier) => (
                <option key={tier.tier} value={tier.tier}>
                  {tier.tier}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
          >
            <option value="points">Sort by Points</option>
            <option value="name">Sort by Name</option>
            <option value="progress">Sort by Progress</option>
          </select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-slate-400 mt-4">
          Showing {leaderboard.length} of {stats.totalParticipants} participants
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl overflow-hidden">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {leaderboard.map((item, idx) => {
                  const isCurrentUser = item.userId === user?.id;
                  const medalColor = 
                    idx === 0 ? 'text-yellow-400' :
                    idx === 1 ? 'text-slate-400' :
                    idx === 2 ? 'text-amber-600' :
                    'text-slate-500';
                  const medalEmoji = idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`;

                  return (
                    <tr
                      key={item.userId}
                      className={`transition ${
                        isCurrentUser
                          ? 'bg-cyan-500/20 border-l-4 border-l-cyan-500'
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${medalColor}`}>
                          {medalEmoji}
                        </span>
                      </td>

                      {/* Student Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.user?.avatar}
                            alt={item.user?.name}
                            className="w-10 h-10 rounded-full border border-cyan-500/50"
                          />
                          <div>
                            <p className="font-semibold text-slate-100">
                              {item.user?.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">ID: {item.user?.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TierBadge tier={item.tier} size="sm" showLabel={true} />
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-lg font-bold text-cyan-400">
                            {item.points}
                          </p>
                          <p className="text-xs text-slate-500">/ 120</p>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-slate-600/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No rankings found</p>
          </div>
        )}
      </div>

      {/* Tier Distribution */}
      {leaderboard.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
          <h3 className="text-xl font-bold text-cyan-300 mb-6">Tier Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RANKING_SYSTEM.map((tier) => {
              const count = leaderboard.filter((item) => item.tier.tier === tier.tier).length;
              const percentage = leaderboard.length > 0 ? Math.round((count / leaderboard.length) * 100) : 0;

              return (
                <div
                  key={tier.tier}
                  className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4 text-center"
                >
                  <p className="text-sm font-semibold mb-2 text-slate-300">{tier.tier}</p>
                  <p className="text-2xl font-bold mb-2">
                    <span className={tier.color}>{count}</span>
                  </p>
                  <div className="w-full h-2 bg-slate-600/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-sky-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
