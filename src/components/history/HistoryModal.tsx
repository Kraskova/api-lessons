import React, { useState } from 'react';
import { 
  History, 
  X, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Send, 
  GitPullRequest, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Award, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Download,
  Filter
} from 'lucide-react';
import { HistoryEvent, StudentProgress } from '../../types/course';

interface HistoryModalProps {
  progress: StudentProgress;
  totalModules: number;
  onClose: () => void;
  onSelectModule: (moduleId: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  progress,
  totalModules,
  onClose,
  onSelectModule,
  onClearHistory
}) => {
  const [filter, setFilter] = useState<'all' | 'quiz_passed' | 'rollback' | 'postman_tested' | 'admin'>('all');

  const history = progress.history || [];

  // Filtered list
  const filteredEvents = history.filter(ev => {
    if (filter === 'all') return true;
    if (filter === 'quiz_passed') return ev.type === 'quiz_passed';
    if (filter === 'rollback') return ev.type === 'rollback' || ev.type === 'quiz_failed';
    if (filter === 'postman_tested') return ev.type === 'postman_tested';
    if (filter === 'admin') return ev.type === 'module_created' || ev.type === 'module_updated' || ev.type === 'module_deleted';
    return true;
  });

  // Calculate statistics
  const completedCount = progress.completedModuleIds.length;
  const passedQuizzesCount = Object.keys(progress.quizScores).length;
  const rollbackCount = progress.rollbackHistory.length;

  const getRank = (xp: number) => {
    if (xp >= 1000) return 'Lead API Technical Writer';
    if (xp >= 600) return 'Senior Technical Writer (OpenAPI Expert)';
    if (xp >= 300) return 'Middle API Documentation Engineer';
    return 'Junior Technical Writer';
  };

  const getEventIcon = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'quiz_passed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'rollback':
      case 'quiz_failed':
        return <RotateCcw className="w-4 h-4 text-amber-400" />;
      case 'postman_tested':
        return <Send className="w-4 h-4 text-orange-400" />;
      case 'pr_merged':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'module_created':
        return <PlusCircle className="w-4 h-4 text-teal-400" />;
      case 'module_updated':
        return <Edit3 className="w-4 h-4 text-sky-400" />;
      case 'module_deleted':
        return <Trash2 className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `course_history_progress_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1e1e1e] border border-neutral-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-neutral-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-700/80 bg-[#252526] rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#007acc]/20 border border-[#007acc]/40 flex items-center justify-center text-sky-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Журнал обучения и хронология изменений
              </h3>
              <p className="text-xs text-neutral-400">
                Полная история прохождения курса, сдачи тестов, закрепления в Postman и откатов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-neutral-900/60 border-b border-neutral-800">
          <div className="p-3 rounded-lg bg-[#252526] border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Освоено модулей:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-bold text-emerald-400">{completedCount}</span>
              <span className="text-xs text-neutral-500">из {totalModules}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#252526] border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Сдано тестов:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-bold text-sky-400">{passedQuizzesCount}</span>
              <span className="text-xs text-neutral-500">модулей</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#252526] border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Случаев отката:</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-mono text-lg font-bold ${rollbackCount > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                {rollbackCount}
              </span>
              <span className="text-xs text-neutral-500">повторений</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#252526] border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Опыт и Ранг:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{progress.xp} XP</span>
            </div>
            <span className="text-[10px] text-neutral-400 truncate block mt-0.5" title={getRank(progress.xp)}>
              {getRank(progress.xp)}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 border-b border-neutral-800 bg-[#1e1e1e] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1" />
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'all' ? 'bg-[#007acc] text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Все события ({history.length})
            </button>
            <button
              onClick={() => setFilter('quiz_passed')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'quiz_passed' ? 'bg-emerald-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Успешные тесты
            </button>
            <button
              onClick={() => setFilter('rollback')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'rollback' ? 'bg-amber-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Откаты ({rollbackCount})
            </button>
            <button
              onClick={() => setFilter('postman_tested')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'postman_tested' ? 'bg-orange-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Postman
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'admin' ? 'bg-teal-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Редактор курса
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-sky-300 transition-colors"
              title="Скачать историю в JSON"
            >
              <Download className="w-3 h-3" />
              <span>Экспорт</span>
            </button>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 font-sans text-xs">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-400">Событий пока нет</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Проходите учебные модули, проверяйте запросы в Postman и сдавайте контрольные тесты — каждое действие будет фиксироваться здесь!
              </p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-neutral-800">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className="relative flex items-start gap-3.5 pl-1 group"
                >
                  {/* Timeline icon node */}
                  <div className="w-7 h-7 rounded-full bg-[#252526] border border-neutral-700 flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5">
                    {getEventIcon(event.type)}
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 p-3.5 rounded-lg bg-[#252526] border border-neutral-700/60 hover:border-neutral-500 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {event.title}
                        </span>

                        {event.scorePercent !== undefined && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            event.scorePercent >= 75 
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          }`}>
                            {event.scorePercent}%
                          </span>
                        )}

                        {event.xpEarned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            +{event.xpEarned} XP
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>

                    <p className="text-neutral-300 text-xs leading-relaxed">
                      {event.description}
                    </p>

                    {event.moduleId && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-700/50 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400 font-mono">
                          Модуль: {event.moduleTitle || event.moduleId}
                        </span>

                        <button
                          onClick={() => {
                            onSelectModule(event.moduleId!);
                            onClose();
                          }}
                          className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 font-medium"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Открыть модуль</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-700/60 bg-[#252526] rounded-b-xl flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Очистить историю всех событий? Прогресс курса при этом сохранится.')) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить журнал</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
