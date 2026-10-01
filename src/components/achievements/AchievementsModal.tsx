import React, { useState } from 'react';
import { 
  Trophy, 
  X, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Flame, 
  Award, 
  Send, 
  Terminal, 
  Radio, 
  GitPullRequest, 
  ShieldCheck, 
  Zap,
  Filter,
  Star
} from 'lucide-react';
import { Achievement } from '../../types/achievements';

interface AchievementsModalProps {
  achievements: Achievement[];
  totalXp: number;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  totalXp,
  onClose,
  theme
}) => {
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const earnedAchievementsXp = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const filteredList = achievements.filter(a => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  const getAchievementIcon = (name: Achievement['iconName'], isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-amber-400' : 'text-neutral-500'}`;
    switch (name) {
      case 'trophy': return <Trophy className={iconClass} />;
      case 'flame': return <Flame className={iconClass} />;
      case 'award': return <Award className={iconClass} />;
      case 'send': return <Send className={iconClass} />;
      case 'terminal': return <Terminal className={iconClass} />;
      case 'radio': return <Radio className={iconClass} />;
      case 'git': return <GitPullRequest className={iconClass} />;
      case 'shield': return <ShieldCheck className={iconClass} />;
      case 'zap': return <Zap className={iconClass} />;
      default: return <Star className={iconClass} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark 
            ? 'bg-[#1e1e1e] border-neutral-700 text-neutral-200' 
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-neutral-100">Мои достижения</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {unlockedCount} / {totalCount}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Награды за регулярную учебу, практику в Postman и успешную сдачу тестов
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-700/40 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Overview Bar */}
        <div className={`p-4 border-b shrink-0 ${
          isDark ? 'bg-[#181818] border-neutral-700/40' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">Общий прогресс:</span>
              <span className="font-bold text-amber-400">{progressPercent}% получено</span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{earnedAchievementsXp} XP заработано</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-neutral-700/50 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-3 pt-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Все награды ({totalCount})
            </button>

            <button
              onClick={() => setFilter('unlocked')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'unlocked'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Полученные ({unlockedCount})</span>
            </button>

            <button
              onClick={() => setFilter('locked')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'locked'
                  ? 'bg-neutral-700 text-white font-bold'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>В процессе ({totalCount - unlockedCount})</span>
            </button>
          </div>
        </div>

        {/* Achievements Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredList.map(item => {
            const percent = Math.min(100, Math.round((item.progress.current / item.progress.max) * 100));

            return (
              <div 
                key={item.id}
                className={`p-3.5 rounded-lg border transition-all flex items-start gap-3.5 ${
                  item.isUnlocked
                    ? isDark 
                      ? 'bg-[#252526] border-amber-500/40 shadow-sm shadow-amber-950/20' 
                      : 'bg-amber-50/50 border-amber-300 shadow-sm'
                    : isDark 
                      ? 'bg-neutral-900/60 border-neutral-800 opacity-80' 
                      : 'bg-neutral-50 border-neutral-200 opacity-80'
                }`}
              >
                {/* Icon box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  item.isUnlocked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-500'
                }`}>
                  {getAchievementIcon(item.iconName, item.isUnlocked)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${item.isUnlocked ? 'text-neutral-100' : 'text-neutral-400'}`}>
                        {item.title}
                      </h4>
                      {item.isUnlocked && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Получено
                        </span>
                      )}
                    </div>

                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      +{item.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed mb-2.5">
                    {item.description}
                  </p>

                  {/* Progress Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Прогресс: {item.progress.current} / {item.progress.max} {item.progress.unit || ''}</span>
                      <span>{percent}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-neutral-700/60 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.isUnlocked ? 'bg-amber-400' : 'bg-neutral-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-xs">
              Нет наград в этой категории
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
          isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <span className="text-neutral-400 text-[11px]">
            Награды обновляются автоматически по мере прохождения уроков и тестов
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-medium cursor-pointer transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
