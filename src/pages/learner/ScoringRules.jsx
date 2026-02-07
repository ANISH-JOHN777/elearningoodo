import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, TrendingUp, Zap, Target, Flame, AlertCircle } from 'lucide-react';

/**
 * ScoringRules Component
 * Displays how points are calculated across different activity types
 * Explains point allocation and bonus systems
 */
export default function ScoringRules() {
  const { RANKING_SYSTEM } = useApp();

  const scoringRules = [
    {
      type: 'Quiz',
      icon: Target,
      color: 'from-sky-500 to-sky-600',
      iconColor: 'text-sky-400',
      rules: [
        { label: 'Per Correct Answer', value: '70% of total points ÷ total questions' },
        { label: 'Perfect Score Bonus', value: '+30% when 100% correct' },
        { label: '80%+ Bonus', value: '+15% when 80% or higher correct' },
        { label: 'Max Points', value: '100 points per quiz' },
      ],
      example: '10 questions: 7 points per correct + potential 30 bonus = up to 100 points',
    },
    {
      type: 'Lab',
      icon: Zap,
      color: 'from-cyan-500 to-cyan-600',
      iconColor: 'text-cyan-400',
      rules: [
        { label: 'All Tests Pass', value: '100 points' },
        { label: '80%+ Tests Pass', value: '70 points' },
        { label: '50%+ Tests Pass', value: '40 points' },
        { label: 'Partial Completion', value: 'Proportional to tests passed' },
      ],
      example: '8 of 10 tests passing: 80% = 70 points awarded',
    },
    {
      type: 'Dialogue',
      icon: Award,
      color: 'from-yellow-500 to-yellow-600',
      iconColor: 'text-yellow-400',
      rules: [
        { label: 'All Objectives Covered', value: '100 points' },
        { label: '80%+ Objectives Covered', value: '70 points' },
        { label: '60%+ Objectives Covered', value: '40 points' },
        { label: 'Minimum Engagement', value: '3+ messages required' },
      ],
      example: '5 of 5 objectives completed: 100 points awarded',
    },
    {
      type: 'Activities',
      icon: Flame,
      color: 'from-orange-500 to-orange-600',
      iconColor: 'text-orange-400',
      rules: [
        { label: 'Completion Bonus', value: '+5 points for completing activity' },
        { label: 'Streak Bonus', value: '+10 points for 3+ consecutive activities' },
        { label: 'Speed Bonus', value: '+5 points for completing within time limit' },
        { label: 'Daily Maximum', value: '200 points per day cap' },
      ],
      example: 'Complete 5 activities in a row: base points + 10 streak bonus',
    },
  ];

  const tierProgression = useMemo(() => {
    return RANKING_SYSTEM.map((tier) => ({
      ...tier,
      percentage: ((tier.minPoints) / 120) * 100,
    }));
  }, [RANKING_SYSTEM]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 flex items-center gap-3">
          <Target className="w-8 h-8" />
          How Points Work
        </h1>
        <p className="text-gray-600 text-lg">
          Learn how points are earned and how they contribute to your ranking tier
        </p>
      </div>

      {/* Scoring Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scoringRules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.type}
              className="bg-white rounded-2xl border border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${rule.color} p-6 text-white`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-8 h-8 opacity-90" />
                  <h2 className="text-2xl font-bold">{rule.type}</h2>
                </div>
              </div>

              {/* Rules */}
              <div className="p-6 space-y-4">
                {rule.rules.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{r.label}</p>
                      <p className="text-sm text-gray-600 mt-1">{r.value}</p>
                    </div>
                  </div>
                ))}

                {/* Example */}
                <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 mb-2">Example:</p>
                  <p className="text-sm text-gray-700">{rule.example}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier Thresholds */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6" />
          Points to Tier Progression
        </h2>

        <div className="space-y-4">
          {tierProgression.map((tier) => (
            <div key={tier.tier} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg font-bold text-sm ${tier.color} bg-gray-100 border border-gray-300`}>
                    {tier.tier}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {tier.minPoints} - {tier.maxPoints} points
                  </span>
                </div>
                <span className="text-blue-600 font-semibold">
                  {Math.round(tier.percentage)}% of max
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${Math.min(tier.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Key Info */}
        <div className="mt-8 p-4 bg-blue-100 border border-blue-300 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 mb-1">Points are per-course</p>
            <p className="text-sm text-blue-700">
              Each course tracks points separately (0-120 per course). Your tier is determined by points within each course, not globally.
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-blue-200 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
          <Flame className="w-6 h-6" />
          Tips to Maximize Points
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Perfect Your Quizzes', desc: 'Aim for 100% on quizzes to get the 30-point bonus' },
            { title: 'Pass All Tests', desc: 'Complete all lab tests for full 100 points' },
            { title: 'Engage in Dialogues', desc: 'Cover all learning objectives to earn maximum points' },
            { title: 'Maintain Streaks', desc: 'Complete activities consecutively for streak bonuses' },
            { title: 'Speed Matters', desc: 'Finish activities within time limits for bonus points' },
            { title: 'Consistency Counts', desc: 'Regular daily participation maintains momentum' },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-100 border border-gray-300 rounded-lg hover:shadow-md transition"
            >
              <p className="font-semibold text-blue-600 mb-2">{tip.title}</p>
              <p className="text-sm text-gray-700">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
