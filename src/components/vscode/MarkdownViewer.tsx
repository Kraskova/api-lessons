import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, 
  Terminal, 
  Award, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp,
  ChevronDown,
  BookOpen, 
  Sparkles, 
  AlertTriangle,
  Search,
  X,
  ListFilter,
  Hash,
  Lock
} from 'lucide-react';
import { CourseModule } from '../../types/course';
import { highlightCode } from '../../utils/syntaxHighlight';
import { KnowledgeCheckpointCard } from '../checkpoints/KnowledgeCheckpointCard';
import { KNOWLEDGE_CHECKPOINTS } from '../../data/checkpointsData';

interface MarkdownViewerProps {
  module: CourseModule;
  onOpenPostman: (presetId?: string) => void;
  onOpenTerminal: (cmd?: string) => void;
  onOpenQuiz: () => void;
  onNextModule?: () => void;
  onPrevModule?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isCompleted: boolean;
  isNextLocked?: boolean;
  theme: 'dark' | 'light';
  completedCheckpointIds?: string[];
  onCompleteCheckpoint?: (checkpointId: string, xp: number) => void;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  module,
  onOpenPostman,
  onOpenTerminal,
  onOpenQuiz,
  onNextModule,
  onPrevModule,
  hasNext,
  hasPrev,
  isCompleted,
  isNextLocked = false,
  theme,
  completedCheckpointIds = [],
  onCompleteCheckpoint
}) => {
  const isDark = theme === 'dark';
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSectionsMenuOpen, setIsSectionsMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search when module changes
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [module.id]);

  // Extract table of contents headings for quick jump
  const headings = useMemo(() => {
    return module.content
      .split('\n')
      .map((line, idx) => {
        const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (hMatch) {
          return {
            level: hMatch[1].length,
            title: hMatch[2].replace(/[#*`]/g, '').trim(),
            id: `heading-sec-${idx}`
          };
        }
        return null;
      })
      .filter(Boolean) as { level: number; title: string; id: string }[];
  }, [module.content]);

  // Keyboard shortcut listener (Ctrl+F or Cmd+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchVisible(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && isSearchVisible) {
        if (searchQuery) {
          setSearchQuery('');
        } else {
          setIsSearchVisible(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible, searchQuery]);

  // Scroll to active match when activeMatchIndex changes
  useEffect(() => {
    if (totalMatches > 0) {
      const matchElem = document.getElementById(`search-match-${activeMatchIndex}`);
      if (matchElem) {
        matchElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeMatchIndex, totalMatches]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleNextMatch = () => {
    if (totalMatches > 0) {
      setActiveMatchIndex(prev => (prev + 1) % totalMatches);
    }
  };

  const handlePrevMatch = () => {
    if (totalMatches > 0) {
      setActiveMatchIndex(prev => (prev - 1 + totalMatches) % totalMatches);
    }
  };

  const handleJumpToHeading = (headingId: string) => {
    setIsSectionsMenuOpen(false);
    const elem = document.getElementById(headingId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render markdown with search highlight support
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let codeBlockCount = 0;
    let inTable = false;
    let tableRows: string[][] = [];

    // Track match count in this pass
    let currentMatchCounter = 0;
    const cleanQuery = searchQuery.trim();
    const hasSearch = cleanQuery.length > 0;

    const renderedCheckpointIds = new Set<string>();
    const hasExplicitCheckpoints = module.content.includes(':::checkpoint');

    const highlightTextWithSearch = (text: string): React.ReactNode => {
      if (!hasSearch) return text;

      const regex = new RegExp(`(${escapeRegex(cleanQuery)})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, pIdx) => {
        if (part.toLowerCase() === cleanQuery.toLowerCase()) {
          const matchIdx = currentMatchCounter++;
          const isActive = matchIdx === activeMatchIndex;

          return (
            <mark
              key={pIdx}
              id={`search-match-${matchIdx}`}
              className={`rounded px-0.5 transition-all ${
                isActive 
                  ? 'bg-orange-500 text-white font-bold ring-2 ring-orange-300' 
                  : 'bg-amber-300 text-black font-semibold'
              }`}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(2);
        elements.push(
          <div key={`table-${elements.length}`} className="my-5 overflow-x-auto rounded border border-neutral-700/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={isDark ? 'bg-[#2d2d2d] text-neutral-200' : 'bg-neutral-100 text-neutral-800'}>
                  {header.map((col, idx) => (
                    <th key={idx} className="p-2.5 border-b border-neutral-700/50 font-semibold font-mono">
                      {highlightTextWithSearch(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/30">
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 font-sans leading-relaxed">
                        {renderInlineFormatted(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const renderInlineFormatted = (text: string) => {
      // Replaces `code` and **bold**
      const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeVal = part.slice(1, -1);
          return (
            <code 
              key={pIdx} 
              className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                isDark ? 'bg-[#2a2a2a] text-[#ce9178]' : 'bg-neutral-200 text-rose-700'
              }`}
            >
              {highlightTextWithSearch(codeVal)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-sky-400">
              {highlightTextWithSearch(part.slice(2, -2))}
            </strong>
          );
        }
        return highlightTextWithSearch(part);
      });
    };

    lines.forEach((line, index) => {
      // Checkpoint tag: :::checkpoint id::: or :::checkpoint:id
      const cpMatch = line.trim().match(/^:::checkpoint[:\s]+([a-zA-Z0-9_-]+):{0,3}$/);
      if (cpMatch) {
        flushTable();
        const cpId = cpMatch[1];
        const checkpoint = module.checkpoints?.find(c => c.id === cpId) || KNOWLEDGE_CHECKPOINTS[cpId];
        if (checkpoint && !renderedCheckpointIds.has(cpId)) {
          renderedCheckpointIds.add(cpId);
          elements.push(
            <KnowledgeCheckpointCard
              key={`cp-${cpId}-${index}`}
              checkpoint={checkpoint}
              isCompleted={completedCheckpointIds?.includes(cpId)}
              onComplete={onCompleteCheckpoint}
              theme={theme}
            />
          );
        }
        return;
      }

      // Code block start / end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushTable();
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeBuffer = [];
        } else {
          const codeText = codeBuffer.join('\n');
          const currentCount = codeBlockCount++;
          const isCurl = codeLanguage.includes('bash') || codeText.includes('curl');
          const highlightedHtml = highlightCode(codeText, codeLanguage);
          const codeLines = codeText.split('\n');

          const getLangDotColor = (lang: string) => {
            const l = (lang || '').toLowerCase();
            if (l === 'json') return 'bg-amber-400';
            if (l.includes('bash') || l.includes('sh') || l.includes('curl')) return 'bg-emerald-400';
            if (l.includes('yaml') || l.includes('yml')) return 'bg-teal-400';
            if (l.includes('http')) return 'bg-sky-400';
            if (l.includes('javascript') || l === 'js') return 'bg-yellow-400';
            if (l.includes('typescript') || l === 'ts') return 'bg-blue-400';
            return 'bg-purple-400';
          };

          elements.push(
            <div 
              key={`code-${index}`} 
              className={`my-4 rounded-lg overflow-hidden border shadow-sm ${
                isDark ? 'border-[#3c3c3c] bg-[#1e1e1e]' : 'border-neutral-300 bg-white text-[#24292e]'
              }`}
            >
              {/* Code block header bar */}
              <div className={`flex items-center justify-between px-3 py-1.5 text-xs font-mono border-b ${
                isDark ? 'bg-[#252526] text-neutral-400 border-neutral-700/60' : 'bg-[#f6f8fa] text-neutral-600 border-neutral-200'
              }`}>
                <span className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${getLangDotColor(codeLanguage)}`} />
                  <span className="uppercase text-[11px] tracking-wider">{codeLanguage || 'code'}</span>
                </span>

                <div className="flex items-center gap-2">
                  {isCurl && (
                    <button
                      onClick={() => onOpenTerminal(codeText.replace(/\\\n\s*/g, ' '))}
                      className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900 transition-colors text-[11px]"
                      title="Выполнить в терминале VS Code"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>В терминал</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(codeText, currentCount)}
                    className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-neutral-700/40 hover:bg-neutral-700 transition-colors text-[11px]"
                    title="Копировать код"
                  >
                    {copiedCodeIndex === currentCount ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code block with line numbers & Prism syntax highlighting */}
              <div className="flex overflow-x-auto">
                <div className={`py-3 pl-3 pr-2.5 text-right select-none font-mono text-[11px] border-r shrink-0 ${
                  isDark ? 'text-neutral-600 border-neutral-800 bg-[#181818]' : 'text-neutral-400 border-neutral-200 bg-neutral-50'
                }`}>
                  {codeLines.map((_, lIdx) => (
                    <div key={lIdx} className="leading-relaxed">{lIdx + 1}</div>
                  ))}
                </div>

                <pre className={`p-3 text-xs font-mono flex-1 leading-relaxed overflow-x-auto ${
                  isDark ? 'vscode-dark-code' : 'vscode-light-code'
                }`}>
                  <code 
                    className={`language-${codeLanguage || 'markup'}`}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                </pre>
              </div>
            </div>
          );

          inCodeBlock = false;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cols = line.trim().slice(1, -1).split('|');
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Blockquotes
      if (line.startsWith('>')) {
        elements.push(
          <blockquote 
            key={`bq-${index}`} 
            className="my-3 pl-4 py-2 border-l-4 border-[#007acc] bg-[#007acc]/10 text-neutral-300 rounded-r text-sm leading-relaxed"
          >
            {renderInlineFormatted(line.slice(1).trim())}
          </blockquote>
        );
        return;
      }

      // Headings with IDs for Section Jump navigation
      if (line.startsWith('# ')) {
        elements.push(
          <h1 
            key={`h1-${index}`} 
            id={`heading-sec-${index}`}
            className="text-2xl font-bold mt-4 mb-3 text-white pb-2 border-b border-neutral-700/60 font-sans scroll-mt-20"
          >
            {renderInlineFormatted(line.slice(2))}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 
            key={`h2-${index}`} 
            id={`heading-sec-${index}`}
            className="text-lg font-semibold mt-6 mb-2.5 text-sky-400 pb-1 border-b border-neutral-700/40 font-sans scroll-mt-20"
          >
            {renderInlineFormatted(line.slice(3))}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 
            key={`h3-${index}`} 
            id={`heading-sec-${index}`}
            className="text-base font-semibold mt-4 mb-2 text-neutral-200 font-sans scroll-mt-20"
          >
            {renderInlineFormatted(line.slice(4))}
          </h3>
        );
        return;
      }

      // Horizontal Rule
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${index}`} className="my-6 border-neutral-700/60" />);
        return;
      }

      // Unordered list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`li-${index}`} className="ml-5 list-disc text-sm my-1 leading-relaxed text-neutral-300">
            {renderInlineFormatted(line.slice(2))}
          </li>
        );
        return;
      }

      // Ordered list
      const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (olMatch) {
        elements.push(
          <div key={`ol-${index}`} className="flex gap-2 text-sm my-1.5 leading-relaxed text-neutral-300 ml-2">
            <span className="font-mono text-sky-400 font-semibold">{olMatch[1]}.</span>
            <span>{renderInlineFormatted(olMatch[2])}</span>
          </div>
        );
        return;
      }

      // Normal paragraph
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${index}`} className="my-3 text-sm leading-relaxed text-neutral-300">
            {renderInlineFormatted(line)}
          </p>
        );
      }
    });

    flushTable();

    // Fallback: If module has critical concepts and no explicit checkpoint was encountered in the text, render the concept checkpoint
    const candidateFallbackIds: string[] = [];
    if (!hasExplicitCheckpoints) {
      if (module.id === 'mod-4' || module.slug?.includes('auth') || module.title.toLowerCase().includes('аутентификац')) {
        candidateFallbackIds.push('auth-header-vs-query', 'auth-types-dragdrop');
      } else if (module.id === 'mod-5' || module.slug?.includes('json') || module.title.toLowerCase().includes('json')) {
        candidateFallbackIds.push('json-schema-required-tf', 'json-schema-types-dragdrop');
      } else if (module.id === 'mod-3' || module.id === 'mod-2' || module.title.toLowerCase().includes('параметр')) {
        candidateFallbackIds.push('param-locations-dragdrop');
      } else if (module.id === 'mod-6' || module.title.toLowerCase().includes('curl')) {
        candidateFallbackIds.push('curl-flags-tf');
      } else if (module.id === 'mod-7' || module.title.toLowerCase().includes('статус') || module.title.toLowerCase().includes('код')) {
        candidateFallbackIds.push('status-codes-dragdrop');
      } else if (module.id === 'mod-8' || module.title.toLowerCase().includes('openapi') || module.title.toLowerCase().includes('swagger')) {
        candidateFallbackIds.push('openapi-components-tf');
      } else if (module.id === 'mod-1') {
        candidateFallbackIds.push('idempotence-get-tf');
      }
    }

    // Also include any custom checkpoints from module.checkpoints if defined
    if (module.checkpoints) {
      module.checkpoints.forEach(cp => {
        if (!renderedCheckpointIds.has(cp.id) && !candidateFallbackIds.includes(cp.id)) {
          candidateFallbackIds.push(cp.id);
        }
      });
    }

    candidateFallbackIds.forEach((cpId, fbIdx) => {
      if (!renderedCheckpointIds.has(cpId)) {
        const cp = module.checkpoints?.find(c => c.id === cpId) || KNOWLEDGE_CHECKPOINTS[cpId];
        if (cp) {
          renderedCheckpointIds.add(cpId);
          elements.push(
            <KnowledgeCheckpointCard
              key={`cp-fallback-${cpId}-${fbIdx}`}
              checkpoint={cp}
              isCompleted={completedCheckpointIds?.includes(cpId)}
              onComplete={onCompleteCheckpoint}
              theme={theme}
            />
          );
        }
      }
    });

    // Sync total matches
    if (currentMatchCounter !== totalMatches) {
      setTimeout(() => setTotalMatches(currentMatchCounter), 0);
    }

    return elements;
  };

  return (
    <div className={`h-full flex flex-col overflow-y-auto relative ${isDark ? 'bg-[#1e1e1e] text-[#d4d4d4]' : 'bg-white text-[#1f2328]'}`}>
      {/* Top Banner with Module Metadata & Search Trigger */}
      <div className={`px-6 py-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f6f8fa] border-[#d0d7de]'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <span>МОДУЛЬ {module.order}</span>
            <span>·</span>
            <span>{module.category}</span>
            <span>·</span>
            <span>⏱️ {module.estimatedMinutes} МИН</span>
            {isCompleted && (
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded text-[11px] font-sans font-medium">
                ✓ Освоен
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white font-sans">{module.title}</h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl">{module.shortDescription}</p>
        </div>

        {/* Quick launch buttons & Search toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setIsSearchVisible(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              isSearchVisible
                ? 'bg-[#007acc]/20 border-[#007acc] text-sky-300'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
            }`}
            title="Поиск по тексту модуля (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Поиск (Ctrl+F)</span>
          </button>

          <button
            onClick={() => onOpenPostman(module.postmanPresetId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>В Postman</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#007acc] hover:bg-[#0062a3] text-white transition-colors shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Сдать тест (75%)</span>
          </button>
        </div>
      </div>

      {/* VS CODE STYLE FIND & SECTION NAVIGATION WIDGET */}
      {isSearchVisible && (
        <div className={`sticky top-0 z-20 px-6 py-2.5 border-b backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-md ${
          isDark ? 'bg-[#252526]/95 border-[#3c3c3c]' : 'bg-[#f0f2f5]/95 border-neutral-300'
        }`}>
          {/* Left: In-Text Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className={`flex items-center gap-2 flex-1 px-2.5 py-1.5 rounded-lg border text-xs ${
              isDark 
                ? 'bg-[#1e1e1e] border-neutral-700 text-white focus-within:border-[#007acc]' 
                : 'bg-white border-neutral-300 text-neutral-900 focus-within:border-[#007acc]'
            }`}>
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Поиск по теории (например: endpoint, cURL, 401, JSON)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveMatchIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) handlePrevMatch();
                    else handleNextMatch();
                  }
                }}
                className="w-full bg-transparent outline-none text-xs"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-400 hover:text-white p-0.5"
                  title="Очистить поиск"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Match Counter */}
            <div className="text-[11px] font-mono text-neutral-400 shrink-0 whitespace-nowrap min-w-[65px]">
              {searchQuery.trim() ? (
                totalMatches > 0 ? (
                  <span className="text-sky-300 font-semibold">
                    {activeMatchIndex + 1} из {totalMatches}
                  </span>
                ) : (
                  <span className="text-rose-400">0 найдено</span>
                )
              ) : (
                <span className="opacity-50">Поиск в тексте</span>
              )}
            </div>

            {/* Match navigation buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrevMatch}
                disabled={totalMatches === 0}
                className={`p-1.5 rounded hover:bg-neutral-700/50 transition-colors ${
                  totalMatches > 0 ? 'text-neutral-300 hover:text-white' : 'opacity-30 cursor-not-allowed'
                }`}
                title="Предыдущее совпадение (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextMatch}
                disabled={totalMatches === 0}
                className={`p-1.5 rounded hover:bg-neutral-700/50 transition-colors ${
                  totalMatches > 0 ? 'text-neutral-300 hover:text-white' : 'opacity-30 cursor-not-allowed'
                }`}
                title="Следующее совпадение (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Quick Jump to Section Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsSectionsMenuOpen(!isSectionsMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs transition-colors"
                title="Быстрый переход к разделам статьи"
              >
                <ListFilter className="w-3.5 h-3.5 text-sky-400" />
                <span>Разделы темы ({headings.length})</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Sections Dropdown Menu */}
              {isSectionsMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#252526] border border-neutral-700 rounded-xl shadow-2xl p-2 z-30 space-y-1 max-h-72 overflow-y-auto font-sans text-xs">
                  <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50 mb-1">
                    Оглавление модуля
                  </div>
                  {headings.map(h => (
                    <button
                      key={h.id}
                      onClick={() => handleJumpToHeading(h.id)}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors flex items-center gap-2 hover:bg-neutral-700/50 text-neutral-300 hover:text-white ${
                        h.level === 1 ? 'font-bold text-white' : h.level === 2 ? 'pl-4 text-sky-300' : 'pl-6 text-neutral-400'
                      }`}
                    >
                      <Hash className="w-3 h-3 opacity-40 shrink-0" />
                      <span className="truncate">{h.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsSearchVisible(false);
                setSearchQuery('');
              }}
              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-700/40 transition-colors"
              title="Закрыть панель поиска (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Markdown Body with Live Search Highlights */}
      <div className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
        {renderFormattedMarkdown(module.content)}

        {/* Rollback Warning Card */}
        <div className="my-8 p-4 rounded-lg bg-amber-950/20 border border-amber-500/40 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-300 font-sans">
                Правило строгого закрепления: Тест с защитой от поверхностного изучения
              </h4>
              <p className="text-amber-200/90 mt-1 leading-relaxed">
                После изучения теории обязательно проверьте отправку запросов в Postman и выполните cURL в терминале. 
                Если на тесте вы наберете менее <strong className="text-white">75%</strong>, система выполнит 
                <strong className="text-amber-300"> откат на {module.quiz.rollbackSteps > 0 ? module.quiz.rollbackSteps : 1} шага(-ов) назад</strong>, 
                чтобы повторить фундаментальные концепции.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Action Dock */}
        <div className={`my-8 p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isNextLocked
            ? isDark ? 'bg-amber-950/20 border-amber-500/40' : 'bg-amber-50 border-amber-300'
            : isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-[#f6f8fa] border-neutral-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              isNextLocked
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {isNextLocked ? <Lock className="w-5 h-5 text-amber-400" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">
                  {isNextLocked ? 'Следующий урок заблокирован' : 'Модуль освоен!'}
                </h4>
                {isNextLocked ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    ТЕСТ НЕ СДАН
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    ДОСТУП ОТКРЫТ
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isNextLocked
                  ? 'Пока тест этого урока не сдан (порог 75%), следующий урок заблокирован.'
                  : 'Тест успешно сдан! Вы можете перейти к следующей теме или закрепить вызовы в Postman.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenPostman(module.postmanPresetId)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-semibold bg-neutral-700/60 hover:bg-neutral-600 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-orange-400" />
              <span>Открыть в Postman</span>
            </button>

            <button
              onClick={onOpenQuiz}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white transition-colors shadow ${
                isNextLocked
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30 animate-pulse'
                  : 'bg-[#007acc] hover:bg-[#0066b8]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isNextLocked ? 'Сдать тест для разблокировки' : 'Пройти тест повторно'}</span>
            </button>
          </div>
        </div>

        {/* Module Navigation Footer */}
        <div className="pt-6 pb-12 border-t border-neutral-700/50 flex items-center justify-between">
          <button
            onClick={onPrevModule}
            disabled={!hasPrev}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
              hasPrev ? 'hover:bg-neutral-700/40 text-neutral-300 cursor-pointer' : 'opacity-30 cursor-not-allowed text-neutral-500'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Предыдущий модуль</span>
          </button>

          <span className="text-xs text-neutral-500 font-mono">
            {module.filename}
          </span>

          <button
            onClick={() => {
              if (isNextLocked) {
                onOpenQuiz();
                return;
              }
              if (onNextModule) onNextModule();
            }}
            disabled={!hasNext}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
              !hasNext
                ? 'opacity-30 cursor-not-allowed text-neutral-500'
                : isNextLocked
                  ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/40 cursor-pointer'
                  : 'hover:bg-neutral-700/40 text-neutral-300 cursor-pointer'
            }`}
            title={isNextLocked ? 'Следующий урок заблокирован: сдайте тест текущего урока' : 'Перейти к следующему модулю'}
          >
            {isNextLocked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isNextLocked ? 'Следующий урок (заблокирован)' : 'Следующий модуль'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
