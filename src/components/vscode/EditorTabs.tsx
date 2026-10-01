import React from 'react';
import { 
  X, 
  FileText, 
  Send, 
  Terminal, 
  Award, 
  Globe, 
  FileCode, 
  GitPullRequest,
  Sliders,
  Server,
  Radio
} from 'lucide-react';

export interface EditorTab {
  id: string;
  type: 'module' | 'postman' | 'terminal' | 'quiz' | 'openapi' | 'devtools' | 'opensource' | 'admin' | 'mockserver' | 'logger';
  title: string;
  closable?: boolean;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  theme: 'dark' | 'light';
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  theme
}) => {
  const isDark = theme === 'dark';

  const getIcon = (type: EditorTab['type']) => {
    switch (type) {
      case 'module':
        return <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'postman':
        return <Send className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'quiz':
        return <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'openapi':
        return <FileCode className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
      case 'devtools':
        return <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'opensource':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'admin':
        return <Sliders className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
      case 'mockserver':
        return <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'logger':
        return <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
    }
  };

  return (
    <div 
      className={`h-9 flex items-center overflow-x-auto select-none border-b shrink-0 scrollbar-none font-mono text-xs ${
        isDark 
          ? 'bg-[#252526] border-[#1e1e1e]' 
          : 'bg-[#ececec] border-[#d4d4d4]'
      }`}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative h-full flex items-center gap-2 px-3 border-r cursor-pointer transition-colors max-w-[220px] shrink-0 ${
              isActive
                ? isDark
                  ? 'bg-[#1e1e1e] text-white border-r-[#1e1e1e]'
                  : 'bg-white text-[#333333] border-r-[#e5e5e5]'
                : isDark
                  ? 'bg-[#2d2d2d] text-[#969696] hover:bg-[#282828] hover:text-[#cccccc] border-r-[#1e1e1e]'
                  : 'bg-[#ececec] text-[#616161] hover:bg-[#e4e4e4] hover:text-[#333333] border-r-[#d4d4d4]'
            }`}
          >
            {/* Active top line */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#007acc]" />
            )}

            {getIcon(tab.type)}

            <span className="truncate text-xs font-sans">
              {tab.title}
            </span>

            {tab.closable !== false && tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-neutral-600/30 p-0.5 rounded transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
