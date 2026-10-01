import React, { useMemo } from 'react';
import { 
  Flame, 
  X, 
  Check, 
  Calendar as CalendarIcon, 
  Award, 
  Sparkles, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { StudentProgress } from '../../types/course';

interface StreakCalendarPopoverProps {
  progress: StudentProgress;
  onClose: () => void;
  onRecordStudyToday?: () => void;
}

export const StreakCalendarPopover: React.FC<StreakCalendarPopoverProps> = ({
  progress,
  onClose,
  onRecordStudyToday
}) => {
  const streakDays = Math.max(1, progress.streakDays || 1);

  // Today's date representation
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  // Extract set of active study days
  const activeDaysSet = useMemo(() => {
    const set = new Set<string>();
    // From activeDays
    if (progress.activeDays) {
      progress.activeDays.forEach(d => set.add(d));
    }
    // From history timestamps
    if (progress.history) {
      progress.history.forEach(h => {
        const dStr = new Date(h.timestamp).toISOString().split('T')[0];
        set.add(dStr);
      });
    }
    // Always include today if user has XP
    set.add(todayStr);

    // Also populate previous streakDays-1 days to show consistent consecutive fire streak visually!
    for (let i = 1; i < streakDays; i++) {
      const prevDate = new Date();
      prevDate.setDate(today.getDate() - i);
      set.add(prevDate.toISOString().split('T')[0]);
    }

    return set;
  }, [progress.activeDays, progress.history, today, todayStr, streakDays]);

  // Build calendar matrix for current month
  const calendarData = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week for first day (0 is Sunday, adjust so Monday is 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const monthName = firstDayOfMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

    // Days array
    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean; isActive: boolean; isToday: boolean }[] = [];

    // Leading empty / prev month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dayNumber: 0, dateStr: '', isCurrentMonth: false, isActive: false, isToday: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dStr = curDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr: dStr,
        isCurrentMonth: true,
        isActive: activeDaysSet.has(dStr),
        isToday: dStr === todayStr
      });
    }

    return { monthName, days };
  }, [today, todayStr, activeDaysSet]);

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 select-none">
      <div 
        className="bg-[#1e1e1e] border border-orange-500/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-neutral-200 animate-in fade-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-700/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-inner">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">Календарь ударного режима</h3>
                <span className="font-mono text-xs font-bold text-orange-400">🔥 {streakDays}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Непрерывная серия дней обучения API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-700/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streak Highlight Card */}
        <div className="my-3.5 p-3 rounded-xl bg-gradient-to-r from-orange-950/40 via-neutral-900 to-amber-950/30 border border-orange-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-orange-500/20 border border-orange-500/60 flex items-center justify-center text-orange-400 shrink-0">
              <Flame className="w-6 h-6 fill-orange-500 text-orange-300" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-orange-400">{streakDays}</span>
                <span className="text-xs font-semibold text-white">
                  {streakDays === 1 ? 'день подряд' : streakDays < 5 ? 'дня подряд' : 'дней подряд'}!
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Цель на сегодня выполнена ✓
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-neutral-500 block">Бонус XP</span>
            <span className="text-xs font-bold font-mono text-amber-300 flex items-center gap-1 justify-end">
              <Sparkles className="w-3 h-3 text-amber-400" />
              +50 XP/день
            </span>
          </div>
        </div>

        {/* Calendar View */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          {/* Month Label */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
              {calendarData.monthName}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Активных: <strong className="text-orange-400">{activeDaysSet.size}</strong> дн.
            </span>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[10px] font-mono font-medium text-neutral-500">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className={idx >= 5 ? 'text-neutral-600' : ''}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
            {calendarData.days.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return <div key={idx} className="h-7" />;
              }

              return (
                <div
                  key={idx}
                  className={`h-7 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                    item.isToday
                      ? 'ring-2 ring-orange-500 font-bold text-white bg-orange-950/40'
                      : item.isActive
                        ? 'bg-orange-500/20 text-orange-200 font-semibold'
                        : 'text-neutral-400 hover:bg-neutral-800'
                  }`}
                  title={item.isActive ? `${item.dateStr}: День активного изучения` : item.dateStr}
                >
                  <span className="text-[11px] leading-none">{item.dayNumber}</span>
                  {item.isActive && (
                    <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Tip */}
        <div className="mt-3.5 text-[11px] text-neutral-400 leading-relaxed px-1">
          💡 <strong>Секрет технического писателя:</strong> Регулярность важнее разовых рывков. Даже 10–15 минут практики в cURL и Postman закрепляют терминологию в долговременной памяти.
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-neutral-700/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Продолжить обучение
          </button>
        </div>
      </div>
    </div>
  );
};
