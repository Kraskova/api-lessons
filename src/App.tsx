import React, { useState, useEffect, useMemo } from 'react';
import { COURSE_MODULES } from './data/courseModules';
import { CourseModule, StudentProgress, RollbackEvent, HistoryEvent } from './types/course';
import { Achievement } from './types/achievements';
import { ActivityBar, ActiveView } from './components/vscode/ActivityBar';
import { SidebarExplorer } from './components/vscode/SidebarExplorer';
import { EditorTabs, EditorTab } from './components/vscode/EditorTabs';
import { MarkdownViewer } from './components/vscode/MarkdownViewer';
import { PostmanClient } from './components/postman/PostmanClient';
import { TerminalPanel } from './components/terminal/TerminalPanel';
import { QuizRunner } from './components/quiz/QuizRunner';
import { RollbackModal } from './components/quiz/RollbackModal';
import { DevToolsInspector } from './components/devtools/DevToolsInspector';
import { OpenApiViewer } from './components/vscode/OpenApiViewer';
import { OpenSourceGuide } from './components/opensource/OpenSourceGuide';
import { HistoryModal } from './components/history/HistoryModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { StreakCalendarPopover } from './components/streak/StreakCalendarPopover';
import { ApiMockServer } from './components/mockserver/ApiMockServer';
import { ApiResponseLogger } from './components/logger/ApiResponseLogger';
import { AchievementsModal } from './components/achievements/AchievementsModal';
import { LockedModuleModal } from './components/vscode/LockedModuleModal';
import { ApiHintBar } from './components/hints/ApiHintBar';
import { calculateAchievements, markAchievementsAsSeen } from './utils/achievementService';
import { isModuleLocked, getPrerequisiteModule } from './utils/courseProgression';
import { StatusBar } from './components/vscode/StatusBar';
import { 
  Minus, 
  Square, 
  X, 
  Terminal as TerminalIcon, 
  Send, 
  Award,
  BookOpen,
  Sparkles,
  RotateCcw,
  History,
  Sliders,
  Flame,
  Server,
  Radio,
  Trophy
} from 'lucide-react';

const PROGRESS_STORAGE_KEY = 'techwriter_course_progress_v3';
const MODULES_STORAGE_KEY = 'techwriter_course_custom_modules_v3';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeView, setActiveView] = useState<ActiveView>('explorer');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [lockedModuleAlert, setLockedModuleAlert] = useState<{ lockedMod: CourseModule; prereqMod: CourseModule } | null>(null);

  // Course modules state (can be edited/added by user in Admin Panel)
  const [modules, setModules] = useState<CourseModule[]>(() => {
    try {
      const savedMods = localStorage.getItem(MODULES_STORAGE_KEY);
      if (savedMods) {
        const parsed = JSON.parse(savedMods);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return COURSE_MODULES;
  });

  // Save custom modules to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
    } catch {}
  }, [modules]);

  // Student progress in localStorage
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.history) {
          parsed.history = [];
        }
        return parsed;
      }
    } catch {}
    return {
      currentModuleId: 'mod-1',
      completedModuleIds: [],
      quizScores: {},
      rollbackHistory: [],
      history: [
        {
          id: 'init-hist',
          timestamp: Date.now(),
          type: 'module_started',
          moduleId: 'mod-1',
          moduleTitle: '1. Введение в API: реальная погода вместо абстракций',
          title: 'Начало обучения на курсе',
          description: 'Добро пожаловать на курс «Документация API для технических писателей в VS Code».'
        }
      ],
      xp: 100,
      streakDays: 1
    };
  });

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // Current active module
  const currentModule = modules.find(m => m.id === progress.currentModuleId) || modules[0] || COURSE_MODULES[0];

  // Editor Tabs
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: 'tab-module', type: 'module', title: currentModule.filename, closable: false },
    { id: 'tab-postman', type: 'postman', title: 'Postman: Weather API', closable: true },
    { id: 'tab-terminal', type: 'terminal', title: 'Terminal: cURL', closable: true }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-module');

  // Active sub-tool states
  const [activePostmanPresetId, setActivePostmanPresetId] = useState<string | undefined>(currentModule.postmanPresetId);
  const [activeTerminalCommand, setActiveTerminalCommand] = useState<string | undefined>(currentModule.defaultCurlCommand);
  const [activeRollbackAlert, setActiveRollbackAlert] = useState<RollbackEvent | null>(null);

  // Sync tab title when current module changes
  useEffect(() => {
    setTabs(prev => prev.map(t => t.type === 'module' ? { ...t, title: currentModule.filename } : t));
  }, [currentModule]);

  // Helper to add history event
  const addHistoryEvent = (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => {
    const fullEvent: HistoryEvent = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now()
    };
    setProgress(prev => ({
      ...prev,
      history: [fullEvent, ...(prev.history || [])]
    }));
  };

  // Handle module selection with locking enforcement
  const handleSelectModule = (mod: CourseModule, bypassLockCheck: boolean = false) => {
    if (!bypassLockCheck && isModuleLocked(mod.id, modules, progress.completedModuleIds)) {
      const prereq = getPrerequisiteModule(mod.id, modules);
      if (prereq) {
        setLockedModuleAlert({ lockedMod: mod, prereqMod: prereq });
      }
      return;
    }

    setProgress(prev => ({ ...prev, currentModuleId: mod.id }));
    setActivePostmanPresetId(mod.postmanPresetId);
    setActiveTerminalCommand(mod.defaultCurlCommand);

    let found = tabs.find(t => t.type === 'module');
    if (!found) {
      setTabs(prev => [...prev, { id: 'tab-module', type: 'module', title: mod.filename, closable: false }]);
    }
    setActiveTabId('tab-module');
    setActiveView('explorer');
  };

  // Open Postman
  const handleOpenPostman = (presetId?: string) => {
    if (presetId) setActivePostmanPresetId(presetId);
    
    let tab = tabs.find(t => t.type === 'postman');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-postman', type: 'postman', title: 'Postman: Weather API', closable: true }]);
    }
    setActiveTabId('tab-postman');
    setActiveView('postman');
  };

  // Open Terminal
  const handleOpenTerminal = (cmd?: string) => {
    if (cmd) setActiveTerminalCommand(cmd);

    let tab = tabs.find(t => t.type === 'terminal');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-terminal', type: 'terminal', title: 'Terminal: cURL', closable: true }]);
    }
    setActiveTabId('tab-terminal');
    setActiveView('terminal');
  };

  // Open Quiz
  const handleOpenQuiz = () => {
    let tab = tabs.find(t => t.type === 'quiz');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-quiz', type: 'quiz', title: `Test: ${currentModule.title.split('.')[0]}`, closable: true }]);
    } else {
      setTabs(prev => prev.map(t => t.type === 'quiz' ? { ...t, title: `Test: ${currentModule.title.split('.')[0]}` } : t));
    }
    setActiveTabId('tab-quiz');
    setActiveView('quiz');
  };

  // Open OpenAPI Spec
  const handleOpenOpenApi = () => {
    let tab = tabs.find(t => t.type === 'openapi');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-openapi', type: 'openapi', title: 'weather_openapi_spec.yaml', closable: true }]);
    }
    setActiveTabId('tab-openapi');
    setActiveView('openapi');
  };

  // Open DevTools Inspector
  const handleOpenDevTools = () => {
    let tab = tabs.find(t => t.type === 'devtools');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-devtools', type: 'devtools', title: 'Chrome DevTools', closable: true }]);
    }
    setActiveTabId('tab-devtools');
    setActiveView('devtools');
  };

  // Open Open Source PR Lab
  const handleOpenOpenSource = () => {
    let tab = tabs.find(t => t.type === 'opensource');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-opensource', type: 'opensource', title: 'Open Source Lab', closable: true }]);
    }
    setActiveTabId('tab-opensource');
    setActiveView('opensource');
  };

  // Open Admin Panel
  const handleOpenAdmin = () => {
    let tab = tabs.find(t => t.type === 'admin');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-admin', type: 'admin', title: 'Админ-панель курса', closable: true }]);
    }
    setActiveTabId('tab-admin');
    setActiveView('admin');
  };

  // Open API Mock Server
  const handleOpenMockServer = () => {
    let tab = tabs.find(t => t.type === 'mockserver');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-mockserver', type: 'mockserver', title: 'API Mock Server', closable: true }]);
    }
    setActiveTabId('tab-mockserver');
    setActiveView('mockserver');
  };

  // Open API Response Logger
  const handleOpenLogger = () => {
    let tab = tabs.find(t => t.type === 'logger');
    if (!tab) {
      setTabs(prev => [...prev, { id: 'tab-logger', type: 'logger', title: 'API Response Logger', closable: true }]);
    }
    setActiveTabId('tab-logger');
    setActiveView('logger');
  };

  // Compute achievements dynamically
  const achievementData = useMemo(() => {
    return calculateAchievements(progress, modules.length);
  }, [progress, modules.length]);

  const handleOpenAchievements = () => {
    setIsAchievementsOpen(true);
    markAchievementsAsSeen(achievementData.achievements.filter((a: Achievement) => a.isUnlocked).map((a: Achievement) => a.id));
  };

  // Complete Knowledge Checkpoint
  const handleCompleteCheckpoint = (checkpointId: string, xpEarned: number) => {
    setProgress(prev => {
      const alreadyCompleted = (prev.completedCheckpointIds || []).includes(checkpointId);
      if (alreadyCompleted) return prev;
      return {
        ...prev,
        completedCheckpointIds: [...(prev.completedCheckpointIds || []), checkpointId],
        xp: prev.xp + xpEarned
      };
    });

    addHistoryEvent({
      type: 'checkpoint_passed',
      moduleId: currentModule.id,
      moduleTitle: currentModule.title,
      title: 'Пройден интерактивный чекпоинт знаний',
      description: `Успешно пройдена интерактивная проверка концепта в модуле "${currentModule.title}" (+${xpEarned} XP)`,
      xpEarned
    });
  };

  // Close tab
  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0]?.id || 'tab-module');
    }
  };

  // Pass Module Quiz
  const handlePassModule = (moduleId: string, score: number) => {
    const mod = modules.find(m => m.id === moduleId);
    setProgress(prev => {
      const alreadyCompleted = prev.completedModuleIds.includes(moduleId);
      return {
        ...prev,
        completedModuleIds: alreadyCompleted ? prev.completedModuleIds : [...prev.completedModuleIds, moduleId],
        quizScores: { ...prev.quizScores, [moduleId]: score },
        xp: prev.xp + 100
      };
    });

    addHistoryEvent({
      type: 'quiz_passed',
      moduleId,
      moduleTitle: mod?.title,
      title: `Успешная сдача теста: ${mod?.title || moduleId}`,
      description: `Контрольный тест сдан на ${score}% (порог 75%). Модуль подтвержден в портфолио.`,
      scorePercent: score,
      xpEarned: 100
    });
  };

  // Handle Rollback on Poor Score
  const handleRollback = (rollbackEvent: RollbackEvent) => {
    setActiveRollbackAlert(rollbackEvent);

    setProgress(prev => {
      const targetMod = modules.find(m => m.id === rollbackEvent.rolledBackToModuleId);
      const targetOrder = targetMod ? targetMod.order : 1;

      const filteredCompleted = prev.completedModuleIds.filter(id => {
        const mod = modules.find(m => m.id === id);
        return mod && mod.order < targetOrder;
      });

      return {
        ...prev,
        currentModuleId: rollbackEvent.rolledBackToModuleId,
        completedModuleIds: filteredCompleted,
        rollbackHistory: [...prev.rollbackHistory, rollbackEvent]
      };
    });

    addHistoryEvent({
      type: 'rollback',
      moduleId: rollbackEvent.moduleId,
      moduleTitle: rollbackEvent.moduleTitle,
      title: `Откат прогресса: ${rollbackEvent.scorePercent}%`,
      description: `Тест не пройден. Прогресс возвращен к «${rollbackEvent.rolledBackToModuleTitle}» для закрепления пробелов (${rollbackEvent.failedTopics.join(', ')}).`,
      scorePercent: rollbackEvent.scorePercent
    });

    setActiveTabId('tab-module');
    setActiveView('explorer');
  };

  // Admin: Save or update module
  const handleSaveModule = (modToSave: CourseModule, isNew: boolean) => {
    setModules(prev => {
      if (isNew) {
        return [...prev, modToSave].sort((a, b) => a.order - b.order);
      }
      return prev.map(m => m.id === modToSave.id ? modToSave : m).sort((a, b) => a.order - b.order);
    });

    addHistoryEvent({
      type: isNew ? 'module_created' : 'module_updated',
      moduleId: modToSave.id,
      moduleTitle: modToSave.title,
      title: isNew ? `Создан новый модуль: ${modToSave.title}` : `Отредактирован модуль: ${modToSave.title}`,
      description: `Файл: ${modToSave.filename}, категория: ${modToSave.category}, вопросов в тесте: ${modToSave.quiz.questions.length}`
    });
  };

  // Admin: Delete module
  const handleDeleteModule = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    setModules(prev => prev.filter(m => m.id !== moduleId));

    addHistoryEvent({
      type: 'module_deleted',
      moduleId,
      moduleTitle: mod?.title,
      title: `Удален модуль: ${mod?.title || moduleId}`,
      description: `Модуль ${mod?.filename || moduleId} был удален из программы курса.`
    });

    if (progress.currentModuleId === moduleId) {
      const remaining = modules.filter(m => m.id !== moduleId);
      if (remaining.length > 0) {
        handleSelectModule(remaining[0]);
      }
    }
  };

  // Admin: Reset modules to default 11
  const handleResetModulesToDefaults = () => {
    setModules(COURSE_MODULES);
    localStorage.removeItem(MODULES_STORAGE_KEY);
    addHistoryEvent({
      type: 'module_updated',
      title: 'Сброс модулей курса',
      description: 'Все модули программы сброшены к исходным 11 урокам погодных API.'
    });
  };

  // Reset Progress
  const handleResetProgress = () => {
    if (confirm('Сбросить весь прогресс прохождения курса и начать с Модуля 1?')) {
      setProgress({
        currentModuleId: modules[0]?.id || 'mod-1',
        completedModuleIds: [],
        quizScores: {},
        rollbackHistory: [],
        history: [
          {
            id: `ev_reset_${Date.now()}`,
            timestamp: Date.now(),
            type: 'module_started',
            title: 'Сброс прогресса курса',
            description: 'Пользователь обнулил прогресс для повторного прохождения с первого модуля.'
          }
        ],
        xp: 100,
        streakDays: 1
      });
      setActiveTabId('tab-module');
      setActiveView('explorer');
    }
  };

  // Clear History
  const handleClearHistory = () => {
    setProgress(prev => ({
      ...prev,
      history: []
    }));
  };

  // Navigation & Locking
  const currentIndex = modules.findIndex(m => m.id === currentModule.id);
  const hasNext = currentIndex < modules.length - 1;
  const hasPrev = currentIndex > 0;
  const isCurrentModuleCompleted = progress.completedModuleIds.includes(currentModule.id);
  const isNextLocked = hasNext && !isCurrentModuleCompleted;

  const handleNextModule = () => {
    if (hasNext) {
      if (isNextLocked) {
        setLockedModuleAlert({
          lockedMod: modules[currentIndex + 1],
          prereqMod: currentModule
        });
        return;
      }
      handleSelectModule(modules[currentIndex + 1]);
    }
  };

  const handlePrevModule = () => {
    if (hasPrev) {
      handleSelectModule(modules[currentIndex - 1]);
    }
  };

  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${
      theme === 'dark' ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#f3f3f3] text-[#333333]'
    }`}>
      {/* 1. VS CODE WINDOW TITLE BAR */}
      <header className={`h-8 w-full flex items-center justify-between px-3 text-xs select-none border-b shrink-0 z-30 ${
        theme === 'dark' ? 'bg-[#3c3c3c] border-[#252526] text-neutral-300' : 'bg-[#dddddd] border-[#cccccc] text-neutral-800'
      }`}>
        {/* Left: Window traffic lights & Course name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/20" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/20" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/20" />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <span>Visual Studio Code</span>
            <span className="text-neutral-400 font-normal">
              — Документация API: руководство для технических писателей
            </span>
          </div>
        </div>

        {/* Center: Command Palette search mockup */}
        <div 
          onClick={() => setActiveView('explorer')}
          className={`hidden md:flex items-center justify-center gap-2 px-6 py-0.5 rounded text-[11px] cursor-pointer border ${
            theme === 'dark' 
              ? 'bg-[#252526] border-[#4e4e4e] text-neutral-400 hover:text-white hover:border-[#007acc]' 
              : 'bg-white border-[#bbbbbb] text-neutral-600'
          }`}
        >
          <span>api-docs-course-techwriter [VS Code Environment]</span>
        </div>

        {/* Right: Actions and Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreakOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-950/60 hover:bg-orange-900/80 text-orange-300 border border-orange-500/40 text-[11px] transition-colors"
            title="Календарь ударного режима обучения"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-pulse" />
            <span>{progress.streakDays || 1} дн.</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors"
            title="Открыть хронологию обучения"
          >
            <History className="w-3.5 h-3.5 text-amber-300" />
            <span>История</span>
          </button>

          <button
            onClick={handleOpenAchievements}
            className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
              achievementData.newUnlockedCount > 0
                ? 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-400/50 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Открыть модальное окно достижений и наград"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Награды ({achievementData.unlockedCount}/{achievementData.achievements.length})</span>
          </button>

          <button
            onClick={handleOpenAdmin}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 text-[11px] transition-colors"
            title="Панель администратора курса"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Админ-панель</span>
          </button>

          <button
            onClick={handleOpenMockServer}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] transition-colors"
            title="API Mock Server: симулятор реальных ответов погоды"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Mock Server</span>
          </button>

          <button
            onClick={handleOpenLogger}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-200 border border-emerald-500/40 text-[11px] transition-colors"
            title="API Response Logger: журнал сетевых запросов и ответов в реальном времени"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>API Logs</span>
          </button>

          <div className="flex items-center gap-2 text-neutral-400">
            <Minus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
            <Square className="w-3 h-3 hover:text-white cursor-pointer" />
            <X className="w-3.5 h-3.5 hover:text-rose-400 cursor-pointer" />
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Leftmost Activity Bar */}
        <ActivityBar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            if (view === 'postman') handleOpenPostman();
            if (view === 'terminal') handleOpenTerminal();
            if (view === 'quiz') handleOpenQuiz();
            if (view === 'openapi') handleOpenOpenApi();
            if (view === 'devtools') handleOpenDevTools();
            if (view === 'opensource') handleOpenOpenSource();
            if (view === 'admin') handleOpenAdmin();
            if (view === 'mockserver') handleOpenMockServer();
            if (view === 'logger') handleOpenLogger();
          }}
          theme={theme}
          toggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          onResetProgress={handleResetProgress}
          hasRollbackAlert={progress.rollbackHistory.length > 0}
        />

        {/* Collapsible Sidebar Explorer */}
        {activeView === 'explorer' && (
          <SidebarExplorer
            modules={modules}
            currentModuleId={currentModule.id}
            onSelectModule={handleSelectModule}
            onLockedModuleClick={(lockedMod, prereqMod) => setLockedModuleAlert({ lockedMod, prereqMod })}
            progress={progress}
            onOpenPostmanPreset={handleOpenPostman}
            onOpenOpenApiSpec={handleOpenOpenApi}
            onOpenTerminal={handleOpenTerminal}
            theme={theme}
          />
        )}

        {/* Right Editor Zone with Tabs */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Horizontal Editor Tabs */}
          <EditorTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={(tabId) => {
              setActiveTabId(tabId);
              const t = tabs.find(item => item.id === tabId);
              if (t?.type === 'postman') setActiveView('postman');
              else if (t?.type === 'terminal') setActiveView('terminal');
              else if (t?.type === 'quiz') setActiveView('quiz');
              else if (t?.type === 'openapi') setActiveView('openapi');
              else if (t?.type === 'devtools') setActiveView('devtools');
              else if (t?.type === 'opensource') setActiveView('opensource');
              else if (t?.type === 'admin') setActiveView('admin');
              else if (t?.type === 'mockserver') setActiveView('mockserver');
              else if (t?.type === 'logger') setActiveView('logger');
              else setActiveView('explorer');
            }}
            onCloseTab={handleCloseTab}
            theme={theme}
          />

          {/* Active View Port */}
          <div className="flex-1 overflow-hidden relative">
            {currentTab.type === 'module' && (
              <MarkdownViewer
                module={currentModule}
                onOpenPostman={handleOpenPostman}
                onOpenTerminal={handleOpenTerminal}
                onOpenQuiz={handleOpenQuiz}
                onNextModule={handleNextModule}
                onPrevModule={handlePrevModule}
                hasNext={hasNext}
                hasPrev={hasPrev}
                isCompleted={progress.completedModuleIds.includes(currentModule.id)}
                isNextLocked={isNextLocked}
                theme={theme}
                completedCheckpointIds={progress.completedCheckpointIds || []}
                onCompleteCheckpoint={handleCompleteCheckpoint}
              />
            )}

            {currentTab.type === 'postman' && (
              <PostmanClient
                initialPresetId={activePostmanPresetId}
                theme={theme}
                onNavigateToQuiz={handleOpenQuiz}
              />
            )}

            {currentTab.type === 'terminal' && (
              <TerminalPanel
                initialCommand={activeTerminalCommand}
                theme={theme}
              />
            )}

            {currentTab.type === 'quiz' && (
              <QuizRunner
                module={currentModule}
                allModules={modules}
                onPassModule={handlePassModule}
                onRollback={handleRollback}
                onOpenPostman={handleOpenPostman}
                onOpenTheory={() => setActiveTabId('tab-module')}
                onNextModule={handleNextModule}
                theme={theme}
              />
            )}

            {currentTab.type === 'openapi' && (
              <OpenApiViewer
                theme={theme}
                onOpenPostman={() => handleOpenPostman(currentModule.postmanPresetId)}
              />
            )}

            {currentTab.type === 'devtools' && (
              <DevToolsInspector theme={theme} />
            )}

            {currentTab.type === 'opensource' && (
              <OpenSourceGuide 
                theme={theme} 
                onAwardXp={(xp) => {
                  setProgress(prev => ({ ...prev, xp: prev.xp + xp }));
                  addHistoryEvent({
                    type: 'pr_merged',
                    title: 'Open Source PR принят!',
                    description: 'Вы успешно оформили Pull Request с документацией API и получили +150 XP в портфолио.',
                    xpEarned: 150
                  });
                }}
              />
            )}

            {currentTab.type === 'admin' && (
              <AdminPanel
                modules={modules}
                onSaveModule={handleSaveModule}
                onDeleteModule={handleDeleteModule}
                onResetToDefaults={handleResetModulesToDefaults}
                onSelectModuleForStudy={(mod) => handleSelectModule(mod)}
                theme={theme}
              />
            )}

            {currentTab.type === 'mockserver' && (
              <ApiMockServer
                theme={theme}
                onSendToPostman={(presetUrl, method) => {
                  handleOpenPostman('mock-server-live');
                }}
                onSendToTerminal={(cmd) => {
                  handleOpenTerminal(cmd);
                }}
              />
            )}

            {currentTab.type === 'logger' && (
              <ApiResponseLogger
                theme={theme}
                onOpenPostman={(presetUrl) => handleOpenPostman(presetUrl)}
                onOpenTerminal={(cmd) => handleOpenTerminal(cmd)}
              />
            )}
          </div>

          {/* Contextual API-Hint-Bar for Technical Writers */}
          <ApiHintBar
            currentModule={currentModule}
            theme={theme}
          />
        </main>
      </div>

      {/* 3. BOTTOM VS CODE STATUS BAR (WITH 'Журнал изменений' / 'History', STREAK, AND ACHIEVEMENTS) */}
      <StatusBar
        activeFileName={currentTab.title}
        progress={progress}
        totalModules={modules.length}
        unlockedAchievementsCount={achievementData.unlockedCount}
        totalAchievementsCount={achievementData.achievements.length}
        newAchievementsCount={achievementData.newUnlockedCount}
        onOpenAchievements={handleOpenAchievements}
        onOpenTerminal={() => handleOpenTerminal()}
        onOpenPostman={() => handleOpenPostman()}
        onOpenQuiz={() => handleOpenQuiz()}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAdmin={() => handleOpenAdmin()}
        onOpenStreak={() => setIsStreakOpen(true)}
        onOpenMockServer={() => handleOpenMockServer()}
        onOpenLogger={() => handleOpenLogger()}
        theme={theme}
      />

      {/* 4. STREAK CALENDAR POPOVER */}
      {isStreakOpen && (
        <StreakCalendarPopover
          progress={progress}
          onClose={() => setIsStreakOpen(false)}
        />
      )}

      {/* 5. HISTORY MODAL (Журнал изменений и хронология обучения) */}
      {isHistoryOpen && (
        <HistoryModal
          progress={progress}
          totalModules={modules.length}
          onClose={() => setIsHistoryOpen(false)}
          onSelectModule={(modId) => {
            setIsHistoryOpen(false);
            const m = modules.find(item => item.id === modId);
            if (m) handleSelectModule(m);
          }}
          onClearHistory={handleClearHistory}
        />
      )}

      {/* 6. ACHIEVEMENTS MODAL (Мои достижения и награды) */}
      {isAchievementsOpen && (
        <AchievementsModal
          achievements={achievementData.achievements}
          totalXp={progress.xp}
          onClose={() => setIsAchievementsOpen(false)}
          theme={theme}
        />
      )}

      {/* 5. ADAPTIVE ROLLBACK MODAL (if triggered by failed quiz) */}
      {activeRollbackAlert && (
        <RollbackModal
          rollback={activeRollbackAlert}
          onConfirm={() => setActiveRollbackAlert(null)}
          onOpenModule={(modId) => {
            setActiveRollbackAlert(null);
            const m = modules.find(item => item.id === modId);
            if (m) handleSelectModule(m, true);
          }}
          onOpenPostman={() => {
            setActiveRollbackAlert(null);
            handleOpenPostman();
          }}
          onOpenTerminal={() => {
            setActiveRollbackAlert(null);
            handleOpenTerminal();
          }}
        />
      )}

      {/* 7. LOCKED MODULE MODAL (Уведомление о блокировке урока) */}
      {lockedModuleAlert && (
        <LockedModuleModal
          lockedModule={lockedModuleAlert.lockedMod}
          prerequisiteModule={lockedModuleAlert.prereqMod}
          onTakePrerequisiteQuiz={(prereq) => {
            setLockedModuleAlert(null);
            handleSelectModule(prereq, true);
            handleOpenQuiz();
          }}
          onReadPrerequisiteTheory={(prereq) => {
            setLockedModuleAlert(null);
            handleSelectModule(prereq, true);
            setActiveTabId('tab-module');
          }}
          onClose={() => setLockedModuleAlert(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
