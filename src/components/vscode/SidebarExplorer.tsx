import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Send, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  Circle, 
  Lock, 
  RotateCcw,
  Search,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { CourseModule, StudentProgress } from '../../types/course';
import { WEATHER_PRESETS } from '../../data/weatherApiPresets';
import { isModuleLocked, getPrerequisiteModule } from '../../utils/courseProgression';

interface SidebarExplorerProps {
  modules: CourseModule[];
  currentModuleId: string;
  onSelectModule: (module: CourseModule) => void;
  onLockedModuleClick?: (lockedMod: CourseModule, prereqMod: CourseModule) => void;
  progress: StudentProgress;
  onOpenPostmanPreset: (presetId: string) => void;
  onOpenOpenApiSpec: () => void;
  onOpenTerminal: () => void;
  theme: 'dark' | 'light';
}

export const SidebarExplorer: React.FC<SidebarExplorerProps> = ({
  modules,
  currentModuleId,
  onSelectModule,
  onLockedModuleClick,
  progress,
  onOpenPostmanPreset,
  onOpenOpenApiSpec,
  onOpenTerminal,
  theme
}) => {
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [isModulesOpen, setIsModulesOpen] = useState(true);
  const [isPostmanOpen, setIsPostmanOpen] = useState(true);
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const latestRollback = progress.rollbackHistory[progress.rollbackHistory.length - 1];

  return (
    <div 
      className={`w-72 shrink-0 flex flex-col h-full border-r select-none ${
        isDark 
          ? 'bg-[#252526] border-[#1e1e1e] text-[#cccccc]' 
          : 'bg-[#f3f3f3] border-[#e5e5e5] text-[#333333]'
      }`}
    >
      {/* Explorer Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-black/10">
        <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
          Проводник курса
        </span>
        <span className="text-[11px] opacity-60 font-mono">VS CODE</span>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-black/5">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${
          isDark 
            ? 'bg-[#3c3c3c] border-[#3c3c3c] text-white placeholder-neutral-400 focus-within:border-[#007acc]' 
            : 'bg-white border-[#cecece] text-neutral-800 focus-within:border-[#007acc]'
        }`}>
          <Search className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <input 
            type="text"
            placeholder="Поиск по темам, cURL, OpenAPI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>
      </div>

      {/* Rollback Alert Banner (if recently rolled back) */}
      {latestRollback && (
        <div className="mx-2 my-2 p-2 rounded bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Откат для закрепления темы!</span>
          </div>
          <p className="text-[11px] mt-1 text-amber-300/90 leading-tight">
            Балл {latestRollback.scorePercent}%. Прогресс возвращен к: «{latestRollback.rolledBackToModuleTitle}».
          </p>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1 font-mono text-xs">
        {/* Workspace Root Node */}
        <div className="px-2 py-1 font-semibold flex items-center gap-1 text-[11px] uppercase tracking-wide opacity-75">
          <span>api-docs-course-techwriter</span>
        </div>

        {/* 1. MODULES FOLDER */}
        <div>
          <button 
            onClick={() => setIsModulesOpen(!isModulesOpen)}
            className="w-full flex items-center gap-1 px-3 py-1 hover:bg-black/10 transition-colors text-left font-medium opacity-90"
          >
            {isModulesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="font-sans font-semibold">📁 Учебные модули ({modules.length})</span>
          </button>

          {isModulesOpen && (
            <div className="pl-4 pr-1">
              {filteredModules.map(mod => {
                const isSelected = mod.id === currentModuleId;
                const isCompleted = progress.completedModuleIds.includes(mod.id);
                const isLocked = isModuleLocked(mod.id, modules, progress.completedModuleIds);
                const prereq = isLocked ? getPrerequisiteModule(mod.id, modules) : null;

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      if (isLocked) {
                        if (prereq && onLockedModuleClick) {
                          onLockedModuleClick(mod, prereq);
                        }
                        return;
                      }
                      onSelectModule(mod);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors group mb-0.5 ${
                      isSelected
                        ? isDark 
                          ? 'bg-[#37373d] text-white font-medium' 
                          : 'bg-[#e4e6f1] text-[#0066b8] font-medium'
                        : isLocked
                          ? isDark
                            ? 'opacity-50 hover:bg-neutral-800/40 text-neutral-400 cursor-not-allowed'
                            : 'opacity-55 hover:bg-neutral-200/50 text-neutral-500 cursor-not-allowed'
                          : isDark
                            ? 'hover:bg-[#2a2d2e] text-[#cccccc]'
                            : 'hover:bg-[#f0f0f0] text-[#333333]'
                    }`}
                    title={isLocked ? `Урок заблокирован! Сначала сдайте тест: «${prereq?.title || ''}»` : mod.title}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      ) : (
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-neutral-400'}`} />
                      )}
                      <span className={`truncate ${isLocked ? 'text-neutral-400' : ''}`}>
                        {mod.filename}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {isCompleted ? (
                        <span title="Модуль освоен и тест сдан"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /></span>
                      ) : isLocked ? (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          LOCK
                        </span>
                      ) : (
                        <Circle className="w-3 h-3 text-neutral-500 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. POSTMAN PRESETS FOLDER */}
        <div className="mt-2">
          <button 
            onClick={() => setIsPostmanOpen(!isPostmanOpen)}
            className="w-full flex items-center gap-1 px-3 py-1 hover:bg-black/10 transition-colors text-left font-medium opacity-90"
          >
            {isPostmanOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="font-sans font-semibold text-orange-400">⚡ Postman Коллекции ({WEATHER_PRESETS.length})</span>
          </button>

          {isPostmanOpen && (
            <div className="pl-4 pr-1">
              {WEATHER_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => onOpenPostmanPreset(preset.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors mb-0.5 ${
                    isDark ? 'hover:bg-[#2a2d2e] text-[#cccccc]' : 'hover:bg-[#f0f0f0] text-[#333333]'
                  }`}
                  title={preset.description}
                >
                  <Send className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">{preset.name.split('.')[1] || preset.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. SPECS & TERMINAL FOLDER */}
        <div className="mt-2">
          <button 
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className="w-full flex items-center gap-1 px-3 py-1 hover:bg-black/10 transition-colors text-left font-medium opacity-90"
          >
            {isSpecsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="font-sans font-semibold text-teal-400">📄 Спецификации & Скрипты</span>
          </button>

          {isSpecsOpen && (
            <div className="pl-4 pr-1">
              <button
                onClick={onOpenOpenApiSpec}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors mb-0.5 ${
                  isDark ? 'hover:bg-[#2a2d2e] text-[#cccccc]' : 'hover:bg-[#f0f0f0] text-[#333333]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">weather_openapi_spec.yaml</span>
              </button>

              <button
                onClick={onOpenTerminal}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors mb-0.5 ${
                  isDark ? 'hover:bg-[#2a2d2e] text-[#cccccc]' : 'hover:bg-[#f0f0f0] text-[#333333]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">curl_weather_test.sh</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Footer Card */}
      <div className={`p-3 border-t text-xs ${isDark ? 'border-[#333333] bg-[#1e1e1e]' : 'border-[#e0e0e0] bg-white'}`}>
        <div className="flex items-center justify-between mb-1.5 font-sans font-semibold">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Прогресс курса
          </span>
          <span className="text-[11px] font-mono text-sky-400">
            {progress.completedModuleIds.length} / {modules.length}
          </span>
        </div>

        <div className="w-full bg-neutral-700/40 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#007acc] h-full transition-all duration-500 rounded-full"
            style={{ width: `${(progress.completedModuleIds.length / modules.length) * 100}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1 text-amber-300 font-medium">
            <Sparkles className="w-3 h-3" /> {progress.xp} XP
          </span>
          <span>Порог сдачи: 75%</span>
        </div>
      </div>
    </div>
  );
};
