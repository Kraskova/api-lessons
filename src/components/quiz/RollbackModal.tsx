import React from 'react';
import { 
  RotateCcw, 
  AlertTriangle, 
  BookOpen, 
  Send, 
  Terminal, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { RollbackEvent } from '../../types/course';

interface RollbackModalProps {
  rollback: RollbackEvent;
  onConfirm: () => void;
  onOpenModule: (moduleId: string) => void;
  onOpenPostman: () => void;
  onOpenTerminal: () => void;
}

export const RollbackModal: React.FC<RollbackModalProps> = ({
  rollback,
  onConfirm,
  onOpenModule,
  onOpenPostman,
  onOpenTerminal
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border-2 border-amber-500/70 rounded-xl max-w-xl w-full p-6 shadow-2xl text-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 text-amber-400 border-b border-neutral-700/60 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400 font-bold">
              Адаптивный алгоритм обучения курса
            </span>
            <h3 className="text-lg font-bold text-white">
              Внимание: Выполнен откат назад для повторения теории
            </h3>
          </div>
        </div>

        {/* Score & reason */}
        <div className="my-4 p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Ваш результат тестирования:</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {rollback.scorePercent}% (Минимум: 75%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Точка возврата:</span>
            <span className="font-semibold text-amber-300">
              «{rollback.rolledBackToModuleTitle}»
            </span>
          </div>
          <p className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800">
            {rollback.reason}
          </p>
        </div>

        {/* Diagnostic topics */}
        {rollback.failedTopics.length > 0 && (
          <div className="my-3">
            <h5 className="text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Темы, вызвавшие затруднения:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {rollback.failedTopics.map((topic, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[11px] font-mono">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Practical Remediation Plan */}
        <div className="my-4 p-3.5 rounded-lg bg-[#252526] border border-neutral-700/60">
          <h5 className="text-xs font-semibold text-white mb-2">
            Рекомендуемый план ликвидации пробелов:
          </h5>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => onOpenModule(rollback.rolledBackToModuleId)}
              className="w-full flex items-center justify-between p-2 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors text-left text-neutral-200"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                <span>1. Перечитать файл теории: <strong>{rollback.rolledBackToModuleTitle}</strong></span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={onOpenPostman}
              className="w-full flex items-center justify-between p-2 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors text-left text-neutral-200"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-400 shrink-0" />
                <span>2. Закрепить запросы на практике в <strong>Postman Sandbox</strong></span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={onOpenTerminal}
              className="w-full flex items-center justify-between p-2 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors text-left text-neutral-200"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3. Выполнить команду с флагами в <strong>Терминале cURL</strong></span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Modal actions */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-neutral-700/60">
          <button
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-white text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Понятно, перейти к повторению материала</span>
          </button>
        </div>
      </div>
    </div>
  );
};
