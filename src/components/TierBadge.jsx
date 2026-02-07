import React from 'react';
import { Award, Medal, Zap, Crown } from 'lucide-react';

/**
 * TierBadge Component
 * Displays a user's rank tier with icon and color
 * Reusable across the application
 */
export default function TierBadge({ tier, size = 'md', showLabel = true, animated = false }) {
  if (!tier) return null;

  // Get icon based on tier
  const getIcon = () => {
    if (tier.order <= 3) return Medal; // Bronze
    if (tier.order === 4) return Award; // Silver
    if (tier.order <= 6) return Zap; // Gold/Platinum
    return Crown; // Diamond
  };

  // Get size classes
  const sizeClasses = {
    xs: { container: 'px-2 py-1', icon: 'w-3 h-3', text: 'text-xs' },
    sm: { container: 'px-3 py-2', icon: 'w-4 h-4', text: 'text-sm' },
    md: { container: 'px-4 py-2', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'px-6 py-3', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Get background color
  const getBgColor = () => {
    if (tier.order <= 3) return 'bg-amber-600/20 border-amber-500/50';
    if (tier.order === 4) return 'bg-slate-500/20 border-slate-400/50';
    if (tier.order === 5) return 'bg-yellow-500/20 border-yellow-400/50';
    if (tier.order === 6) return 'bg-cyan-500/20 border-cyan-400/50';
    return 'bg-cyan-400/20 border-cyan-300/50';
  };

  const Icon = getIcon();

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border ${sizeClass.container} ${getBgColor()} ${
        animated ? 'animate-pulse' : ''
      }`}
    >
      <Icon className={`${sizeClass.icon} ${tier.color} flex-shrink-0`} />
      {showLabel && (
        <span className={`${sizeClass.text} font-semibold ${tier.color}`}>
          {tier.tier}
        </span>
      )}
    </div>
  );
}
