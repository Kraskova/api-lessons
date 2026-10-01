import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';

interface AchievementBadgeProps {
  unlockedCount: number;
  totalCount: number;
  newUnlockedCount: number;
  onClick: () => void;
  theme: 'dark' | 'light';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  unlockedCount,
  totalCount,
  newUnlockedCount,
  onClick
}) => {
  const hasNew = newUnlockedCount > 0;

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer select-none group ${
        hasNew
          ? 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-400/50 shadow-sm animate-pulse'
          : 'hover:bg-white/20 text-white'
      }`}
      title={
        hasNew
          ? `Получены новые достижения! (${unlockedCount}/${totalCount}) — кликните для просмотра`
          : `Мои достижения: получено ${unlockedCount} из ${totalCount} наград`
      }
    >
      <div className="relative flex items-center justify-center">
        <Trophy className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
          hasNew ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-bounce' : 'text-amber-300'
        }`} />

        {hasNew && (
          <Sparkles className="w-2.5 h-2.5 text-yellow-200 absolute -top-1.5 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
        )}
      </div>

      <span className="font-semibold text-[11px] tracking-tight">
        {unlockedCount}/{totalCount}
      </span>

      {hasNew && (
        <span className="ml-0.5 px-1 py-0.1 text-[9px] font-black rounded-full bg-amber-500 text-neutral-950 uppercase tracking-tighter leading-none shadow-sm">
          +{newUnlockedCount} NEW
        </span>
      )}
    </button>
  );
};
