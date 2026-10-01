import React from 'react';
import { Lock, X, Award, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { CourseModule } from '../../types/course';

interface LockedModuleModalProps {
  lockedModule: CourseModule;
  prerequisiteModule: CourseModule;
  onTakePrerequisiteQuiz: (mod: CourseModule) => void;
  onReadPrerequisiteTheory: (mod: CourseModule) => void;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const LockedModuleModal: React.FC<LockedModuleModalProps> = ({
  lockedModule,
  prerequisiteModule,
  onTakePrerequisiteQuiz,
  onReadPrerequisiteTheory,
  onClose,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden border ${
          isDark 
            ? 'bg-[#1e1e1e] border-neutral-700 text-neutral-200' 
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">Урок заблокирован</h3>
              <p className="text-[11px] text-neutral-400">Требуется сдача контрольного теста</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-700/40 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className={`p-3 rounded-lg border flex items-start gap-3 ${
            isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-semibold">
                Доступ к уроку «{lockedModule.title}» закрыт.
              </p>
              <p className="text-neutral-300">
                По правилам методики курса следующий модуль открывается только после успешной сдачи теста по предыдущей теме (минимум 75% правильных ответов).
              </p>
            </div>
          </div>

          {/* Prerequisite block */}
          <div className={`p-3.5 rounded-lg border space-y-2 ${
            isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
              Требуется сдать тест к уроку:
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-xs text-neutral-100 truncate">
                {prerequisiteModule.title}
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Порог: 75%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-end gap-2 shrink-0 ${
          isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <button
            onClick={() => {
              onClose();
              onReadPrerequisiteTheory(prerequisiteModule);
            }}
            className="w-full sm:w-auto px-3 py-1.5 rounded text-xs text-neutral-300 hover:text-white hover:bg-neutral-700/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Читать теорию</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onTakePrerequisiteQuiz(prerequisiteModule);
            }}
            className="w-full sm:w-auto px-4 py-1.5 rounded text-xs font-semibold bg-[#007acc] hover:bg-[#0066b8] text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Сдать тест урока</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
