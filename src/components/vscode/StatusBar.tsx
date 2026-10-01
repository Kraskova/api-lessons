import React from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  Terminal as TerminalIcon, 
  Send, 
  FileCode, 
  Award,
  RotateCcw,
  Sparkles,
  History,
  Sliders,
  Flame,
  Server,
  Radio
} from 'lucide-react';
import { StudentProgress } from '../../types/course';
import { AchievementBadge } from '../achievements/AchievementBadge';

interface StatusBarProps {
  activeFileName: string;
  progress: StudentProgress;
  totalModules: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  newAchievementsCount?: number;
  onOpenAchievements?: () => void;
  onOpenTerminal: () => void;
  onOpenPostman: () => void;
  onOpenQuiz: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenStreak: () => void;
  onOpenMockServer: () => void;
  onOpenLogger: () => void;
  theme: 'dark' | 'light';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeFileName,
  progress,
  totalModules,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 0,
  newAchievementsCount = 0,
  onOpenAchievements,
  onOpenTerminal,
  onOpenPostman,
  onOpenQuiz,
  onOpenHistory,
  onOpenAdmin,
  onOpenStreak,
  onOpenMockServer,
  onOpenLogger,
  theme
}) => {
  const completedCount = progress.completedModuleIds.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);
  const rollbackCount = progress.rollbackHistory.length;
  const streakDays = Math.max(1, progress.streakDays || 1);

  return (
    <footer 
      className={`h-6 w-full flex items-center justify-between px-3 text-xs select-none z-20 shrink-0 font-mono ${
        theme === 'dark' ? 'bg-[#007acc] text-white' : 'bg-[#0066b8] text-white'
      }`}
    >
      {/* Left zone */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Ветка курса">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors" title="Статус репозитория">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
          <span>0 errors</span>
        </div>

        {/* Streak Calendar Component Button with Fire Icon & Counter */}
        <button
          onClick={onOpenStreak}
          className="flex items-center gap-1 bg-orange-950/70 hover:bg-orange-900 text-orange-200 border border-orange-500/50 px-2 py-0.5 rounded cursor-pointer transition-all shadow-xs"
          title={`Ударный режим: ${streakDays} дня подряд! Нажмите для просмотра календаря активности.`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
          <span className="font-bold font-mono text-orange-300">
            {streakDays}
          </span>
          <span className="hidden sm:inline text-[10px] text-orange-200/90 font-sans">
            {streakDays === 1 ? 'день' : streakDays < 5 ? 'дня' : 'дней'}
          </span>
        </button>

        {/* History / Журнал изменений button in status bar */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded transition-colors text-white font-medium cursor-pointer shadow-sm"
          title="Открыть Журнал изменений и хронологию обучения"
        >
          <History className="w-3.5 h-3.5 text-amber-200" />
          <span>Журнал изменений (History)</span>
        </button>

        {rollbackCount > 0 && (
          <div 
            onClick={onOpenHistory}
            className="flex items-center gap-1 bg-amber-500/40 text-amber-100 px-1.5 py-0.5 rounded cursor-pointer"
            title={`Было откатов для повторения: ${rollbackCount}. Кликните для просмотра в журнале.`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Откатов: {rollbackCount}</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-white/90">
          <FileCode className="w-3.5 h-3.5" />
          <span className="truncate max-w-[160px]">{activeFileName}</span>
        </div>
      </div>

      {/* Right zone */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTerminal}
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors text-white"
          title="Открыть терминал cURL"
        >
          <TerminalIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Терминал</span>
        </button>

        <button
          onClick={onOpenPostman}
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors text-white"
          title="Открыть Postman Sandbox"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Postman</span>
        </button>

        <button
          onClick={onOpenMockServer}
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors text-white"
          title="Открыть API Mock Server (живая симуляция погоды)"
        >
          <Server className="w-3.5 h-3.5 text-emerald-200" />
          <span className="hidden md:inline">Mock Server</span>
        </button>

        <button
          onClick={onOpenLogger}
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors text-white"
          title="Открыть API Response Logger (журнал сетевых запросов и ответов)"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          <span className="hidden md:inline">API Logs</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors text-white"
          title="Панель администратора курса"
        >
          <Sliders className="w-3.5 h-3.5 text-teal-200" />
          <span className="hidden sm:inline">Админ</span>
        </button>

        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors text-white"
          title="Текущее тестирование"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{completedCount}/{totalModules} ({progressPercent}%)</span>
        </button>

        {onOpenAchievements && (
          <AchievementBadge
            unlockedCount={unlockedAchievementsCount}
            totalCount={totalAchievementsCount}
            newUnlockedCount={newAchievementsCount}
            onClick={onOpenAchievements}
            theme={theme}
          />
        )}

        <div className="hidden lg:flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded font-semibold text-amber-200">
          <Sparkles className="w-3 h-3" />
          <span>{progress.xp} XP</span>
        </div>
      </div>
    </footer>
  );
};
