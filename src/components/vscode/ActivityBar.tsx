import React from 'react';
import { 
  Files, 
  Send, 
  Terminal as TerminalIcon, 
  Award, 
  Globe, 
  FileCode, 
  GitPullRequest,
  Sliders,
  Server,
  Radio,
  Sun,
  Moon,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export type ActiveView = 
  | 'explorer' 
  | 'postman' 
  | 'terminal' 
  | 'quiz' 
  | 'devtools' 
  | 'openapi' 
  | 'opensource'
  | 'mockserver'
  | 'logger'
  | 'admin';

interface ActivityBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onResetProgress: () => void;
  hasRollbackAlert: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  setActiveView,
  theme,
  toggleTheme,
  onResetProgress,
  hasRollbackAlert
}) => {
  const isDark = theme === 'dark';

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string; alert?: boolean }[] = [
    {
      id: 'explorer',
      label: 'Проводник файлов курса (Explorer)',
      icon: <Files className="w-5 h-5" />
    },
    {
      id: 'postman',
      label: 'Postman: Закрепление знаний API на практике',
      icon: <Send className="w-5 h-5 text-orange-400" />
    },
    {
      id: 'terminal',
      label: 'Терминал: Выполнение команд cURL',
      icon: <TerminalIcon className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'quiz',
      label: 'Тестирование и проверка знаний (с откатом)',
      icon: <Award className="w-5 h-5 text-amber-400" />,
      alert: hasRollbackAlert
    },
    {
      id: 'devtools',
      label: 'Chrome DevTools: Инспектор сетевых запросов',
      icon: <Globe className="w-5 h-5 text-sky-400" />
    },
    {
      id: 'openapi',
      label: 'Спецификация OpenAPI 3.0 (weather_spec.yaml)',
      icon: <FileCode className="w-5 h-5 text-teal-400" />
    },
    {
      id: 'opensource',
      label: 'Open Source Лаборатория для портфолио',
      icon: <GitPullRequest className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'mockserver',
      label: 'API Mock Server: Живая симуляция ответов погоды',
      icon: <Server className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'logger',
      label: 'API Response Logger: Мониторинг сетевых запросов и ответов в реальном времени',
      icon: <Radio className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'admin',
      label: 'Админ-панель: Добавление и редактирование модулей',
      icon: <Sliders className="w-5 h-5 text-teal-400" />
    }
  ];

  return (
    <aside 
      className={`w-12 shrink-0 flex flex-col justify-between items-center py-2 select-none border-r ${
        isDark 
          ? 'bg-[#333333] border-[#252526] text-[#858585]' 
          : 'bg-[#2c2c2c] border-[#e5e5e5] text-[#969696]'
      }`}
    >
      {/* Top Nav Buttons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={item.label}
              className={`relative w-12 h-12 flex items-center justify-center transition-colors group ${
                isActive 
                  ? 'text-white' 
                  : 'text-[#858585] hover:text-[#d7d7d7]'
              }`}
            >
              {/* Active blue left indicator in VS Code */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc]" />
              )}
              {item.icon}

              {item.alert && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#333333] animate-pulse" />
              )}

              {/* Tooltip on hover */}
              <div className="absolute left-14 bg-[#1e1e1e] text-white text-xs px-2 py-1 rounded shadow-lg border border-[#3e3e42] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom utility buttons */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={toggleTheme}
          title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          className="w-12 h-10 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-slate-300" />}
        </button>

        <button
          onClick={onResetProgress}
          title="Сбросить прогресс курса (для повторного прохождения)"
          className="w-12 h-10 flex items-center justify-center text-[#858585] hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
