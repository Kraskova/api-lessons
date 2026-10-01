import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Clock, 
  Zap, 
  Filter, 
  Send, 
  Server, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  Code,
  FileText,
  Activity,
  Layers
} from 'lucide-react';
import { ApiResponseLogItem, apiResponseLogger } from '../../utils/responseLogger';
import { highlightCode } from '../../utils/syntaxHighlight';

interface ApiResponseLoggerProps {
  theme: 'dark' | 'light';
  onOpenPostman?: (presetUrl?: string) => void;
  onOpenTerminal?: (cmd?: string) => void;
}

export const ApiResponseLogger: React.FC<ApiResponseLoggerProps> = ({
  theme,
  onOpenPostman,
  onOpenTerminal
}) => {
  const isDark = theme === 'dark';

  const [logs, setLogs] = useState<ApiResponseLogItem[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'mock_server' | 'postman' | 'terminal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | '2xx' | '4xx' | '5xx' | 'errors'>('all');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<'response' | 'request' | 'headers'>('response');

  // Subscribe to real-time logs
  useEffect(() => {
    const unsubscribe = apiResponseLogger.subscribe((newLogs) => {
      setLogs(newLogs);
      if (newLogs.length > 0 && !selectedLogId) {
        setSelectedLogId(newLogs[0].id);
      }
    });
    return () => unsubscribe();
  }, [selectedLogId]);

  // Selected Log
  const selectedLog = useMemo(() => {
    return logs.find(l => l.id === selectedLogId) || logs[0] || null;
  }, [logs, selectedLogId]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Source filter
      if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;

      // Status filter
      if (statusFilter === '2xx' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
      if (statusFilter === '4xx' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
      if (statusFilter === '5xx' && (log.statusCode < 500 || log.statusCode >= 600)) return false;
      if (statusFilter === 'errors' && log.statusCode < 400 && log.statusCode !== 0) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesUrl = log.url.toLowerCase().includes(q);
        const matchesMethod = log.method.toLowerCase().includes(q);
        const matchesStatus = log.statusCode.toString().includes(q);
        const matchesBody = typeof log.responseBody === 'object' 
          ? JSON.stringify(log.responseBody).toLowerCase().includes(q) 
          : String(log.responseBody).toLowerCase().includes(q);

        return matchesUrl || matchesMethod || matchesStatus || matchesBody;
      }

      return true;
    });
  }, [logs, sourceFilter, statusFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    if (total === 0) return { total: 0, successCount: 0, errorCount: 0, avgLatency: 0, successRate: 100 };

    const successCount = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const errorCount = logs.filter(l => l.statusCode >= 400 || l.statusCode === 0).length;
    const totalLatency = logs.reduce((acc, l) => acc + (l.timeMs || 0), 0);
    const avgLatency = Math.round(totalLatency / total);
    const successRate = Math.round((successCount / total) * 100);

    return { total, successCount, errorCount, avgLatency, successRate };
  }, [logs]);

  // Format timestamp (HH:mm:ss.SSS)
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  // Time ago
  const formatTimeAgo = (ts: number) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 5) return 'только что';
    if (diffSec < 60) return `${diffSec} сек назад`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} мин назад`;
    return `${Math.floor(diffMin / 60)} ч назад`;
  };

  // Status color helper
  const getStatusBadge = (code: number, text: string) => {
    if (code >= 200 && code < 300) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{code} {text || 'OK'}</span>
        </span>
      );
    }
    if (code >= 400 && code < 500) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{code} {text || 'Client Error'}</span>
        </span>
      );
    }
    if (code >= 500) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>{code} {text || 'Server Error'}</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-700 text-neutral-300 border border-neutral-600">
        {code || 'ERR'} {text}
      </span>
    );
  };

  // Method color helper
  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return <span className="font-mono font-bold text-sky-400 text-xs">GET</span>;
      case 'POST':
        return <span className="font-mono font-bold text-emerald-400 text-xs">POST</span>;
      case 'PUT':
        return <span className="font-mono font-bold text-amber-400 text-xs">PUT</span>;
      case 'DELETE':
        return <span className="font-mono font-bold text-rose-400 text-xs">DELETE</span>;
      default:
        return <span className="font-mono font-bold text-purple-400 text-xs">{method}</span>;
    }
  };

  // Source icon helper
  const getSourceBadge = (source: ApiResponseLogItem['source']) => {
    switch (source) {
      case 'mock_server':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Server className="w-2.5 h-2.5" />
            <span>Mock Server</span>
          </span>
        );
      case 'postman':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-orange-950/60 text-orange-300 border border-orange-500/30 flex items-center gap-1">
            <Send className="w-2.5 h-2.5" />
            <span>Postman</span>
          </span>
        );
      case 'terminal':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-teal-950/60 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <Terminal className="w-2.5 h-2.5" />
            <span>Terminal cURL</span>
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
            System
          </span>
        );
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `api_response_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy selected response
  const handleCopyPayload = () => {
    if (!selectedLog) return;
    const text = typeof selectedLog.responseBody === 'object' 
      ? JSON.stringify(selectedLog.responseBody, null, 2) 
      : String(selectedLog.responseBody);
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Copy as cURL
  const handleCopyCurl = () => {
    if (!selectedLog) return;
    let cmd = `curl -X ${selectedLog.method} "${selectedLog.url}"`;
    if (selectedLog.requestHeaders) {
      Object.entries(selectedLog.requestHeaders).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
    }
    if (selectedLog.requestBody) {
      const b = typeof selectedLog.requestBody === 'object' ? JSON.stringify(selectedLog.requestBody) : selectedLog.requestBody;
      cmd += ` \\\n  -d '${b}'`;
    }
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className={`h-full flex flex-col select-none overflow-hidden ${
      isDark ? 'bg-[#1e1e1e] text-neutral-200' : 'bg-white text-neutral-800'
    }`}>
      {/* 1. TOP HEADER & METRICS BAR */}
      <header className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f3f3f3] border-[#e5e5e5]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">API Response Logger</h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Мониторинг сетевых запросов и ответов в реальном времени (Mock Server, Postman, Terminal)
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className={`px-2.5 py-1 rounded border flex items-center gap-2 ${
            isDark ? 'bg-[#1e1e1e] border-neutral-700/60' : 'bg-white border-neutral-300'
          }`}>
            <span className="text-neutral-400">Всего:</span>
            <span className="font-bold font-mono">{stats.total}</span>
          </div>

          <div className={`px-2.5 py-1 rounded border flex items-center gap-2 ${
            isDark ? 'bg-[#1e1e1e] border-neutral-700/60' : 'bg-white border-neutral-300'
          }`}>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> {stats.successCount}
            </span>
            <span className="text-neutral-500">/</span>
            <span className="text-rose-400 flex items-center gap-1 font-semibold">
              <XCircle className="w-3 h-3" /> {stats.errorCount}
            </span>
            <span className="text-neutral-400 text-[11px]">({stats.successRate}%)</span>
          </div>

          <div className={`hidden sm:flex px-2.5 py-1 rounded border items-center gap-1.5 ${
            isDark ? 'bg-[#1e1e1e] border-neutral-700/60 text-sky-300' : 'bg-white border-neutral-300 text-sky-700'
          }`}>
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-[11px]">{stats.avgLatency} ms</span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700/50">
            <button
              onClick={handleExportJson}
              title="Экспортировать историю запросов в JSON"
              className="p-1.5 rounded hover:bg-neutral-700/50 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => apiResponseLogger.clear()}
              title="Очистить журнал логов"
              className="p-1.5 rounded hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 ${
        isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-[#fafafa] border-[#e5e5e5]'
      }`}>
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source filters */}
          <div className="flex items-center rounded border overflow-hidden text-[11px] border-neutral-700/60">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2 py-1 transition-colors ${
                sourceFilter === 'all' 
                  ? 'bg-[#007acc] text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              Все источники
            </button>
            <button
              onClick={() => setSourceFilter('mock_server')}
              className={`px-2 py-1 transition-colors border-l border-neutral-700/60 ${
                sourceFilter === 'mock_server' 
                  ? 'bg-emerald-600 text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              Mock Server
            </button>
            <button
              onClick={() => setSourceFilter('postman')}
              className={`px-2 py-1 transition-colors border-l border-neutral-700/60 ${
                sourceFilter === 'postman' 
                  ? 'bg-orange-600 text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              Postman
            </button>
          </div>

          {/* Status filters */}
          <div className="flex items-center rounded border overflow-hidden text-[11px] border-neutral-700/60">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-neutral-700 text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              Любой статус
            </button>
            <button
              onClick={() => setStatusFilter('2xx')}
              className={`px-2 py-1 transition-colors border-l border-neutral-700/60 ${
                statusFilter === '2xx' 
                  ? 'bg-emerald-600 text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              2xx Успех
            </button>
            <button
              onClick={() => setStatusFilter('4xx')}
              className={`px-2 py-1 transition-colors border-l border-neutral-700/60 ${
                statusFilter === '4xx' 
                  ? 'bg-amber-600 text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              4xx Ошибки
            </button>
            <button
              onClick={() => setStatusFilter('5xx')}
              className={`px-2 py-1 transition-colors border-l border-neutral-700/60 ${
                statusFilter === '5xx' 
                  ? 'bg-rose-600 text-white font-medium' 
                  : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-neutral-200' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              5xx Сервер
            </button>
          </div>
        </div>

        {/* Right: Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по URL, телу, статусу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1 rounded text-xs border outline-none ${
              isDark 
                ? 'bg-[#252526] border-neutral-700 text-white focus:border-[#007acc]' 
                : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#007acc]'
            }`}
          />
        </div>
      </div>

      {/* 3. MAIN SPLIT VIEW (LIST ON LEFT, DETAIL ON RIGHT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Requests List */}
        <div className="w-full md:w-5/12 border-r flex flex-col overflow-hidden border-neutral-700/50">
          <div className="p-2 border-b text-[11px] text-neutral-400 flex items-center justify-between bg-black/10">
            <span>Показано запросов: {filteredLogs.length} из {logs.length}</span>
            <span className="font-mono text-[10px]">Кликните строку для инспекции</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800">
            {filteredLogs.map(log => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? isDark 
                        ? 'bg-[#2a2d2e] border-l-4 border-l-[#007acc]' 
                        : 'bg-[#e8f2fc] border-l-4 border-l-[#007acc]'
                      : isDark
                        ? 'hover:bg-neutral-800/60'
                        : 'hover:bg-neutral-50'
                  }`}
                >
                  {/* Top line: method, url, status */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      {getMethodBadge(log.method)}
                      <span className="font-mono text-xs text-neutral-200 truncate font-medium" title={log.url}>
                        {log.url.replace(/^https?:\/\/[^/]+/, '') || log.url}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(log.statusCode, log.statusText)}
                    </div>
                  </div>

                  {/* Bottom line: source, timestamp, latency, size */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      {getSourceBadge(log.source)}
                      <span className="font-mono">{formatTime(log.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span>{log.timeMs} ms</span>
                      {log.sizeKb !== undefined && (
                        <span>• {log.sizeKb} KB</span>
                      )}
                      <span className="text-neutral-500">({formatTimeAgo(log.timestamp)})</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-neutral-500 space-y-2">
                <Radio className="w-8 h-8 mx-auto text-neutral-600 animate-pulse" />
                <p className="text-xs font-medium">Нет зафиксированных запросов по выбранным фильтрам</p>
                <p className="text-[11px] text-neutral-600">
                  Выполните запрос в Postman или в API Mock Server, и ответ моментально появится здесь в реальном времени.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Inspection Inspector Detail Panel */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden">
          {selectedLog ? (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Detail Header */}
              <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'bg-[#252526] border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getMethodBadge(selectedLog.method)}
                    <span className="font-mono text-xs font-semibold select-all text-neutral-100">
                      {selectedLog.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-mono">{new Date(selectedLog.timestamp).toLocaleString()} ({formatTime(selectedLog.timestamp)})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono">{selectedLog.timeMs} ms</span>
                    </div>
                    {selectedLog.sizeKb !== undefined && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{selectedLog.sizeKb} KB</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedLog.statusCode, selectedLog.statusText)}

                  <button
                    onClick={handleCopyCurl}
                    className="p-1.5 rounded hover:bg-neutral-700/50 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs border border-neutral-700/60"
                    title="Копировать команду cURL"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className="hidden lg:inline">{copiedCurl ? 'Скопировано!' : 'cURL'}</span>
                  </button>

                  <button
                    onClick={handleCopyPayload}
                    className="p-1.5 rounded hover:bg-neutral-700/50 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs border border-neutral-700/60"
                    title="Копировать тело ответа JSON"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden lg:inline">{copiedPayload ? 'Скопировано!' : 'JSON'}</span>
                  </button>

                  {onOpenPostman && (
                    <button
                      onClick={() => onOpenPostman(selectedLog.url)}
                      className="p-1.5 rounded bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/40 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                      title="Открыть этот запрос в Postman"
                    >
                      <Send className="w-3.5 h-3.5 text-orange-400" />
                      <span className="hidden lg:inline">Postman</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Detail Tabs Navigation */}
              <div className={`px-4 flex items-center gap-4 border-b text-xs shrink-0 font-medium ${
                isDark ? 'bg-[#1e1e1e] border-neutral-700/60' : 'bg-white border-neutral-200'
              }`}>
                <button
                  onClick={() => setActiveDetailTab('response')}
                  className={`py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeDetailTab === 'response'
                      ? 'border-[#007acc] text-[#007acc] font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Тело ответа (Response Payload)</span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('headers')}
                  className={`py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeDetailTab === 'headers'
                      ? 'border-[#007acc] text-[#007acc] font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Заголовки (Headers)</span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('request')}
                  className={`py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeDetailTab === 'request'
                      ? 'border-[#007acc] text-[#007acc] font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Параметры и Тело запроса</span>
                </button>
              </div>

              {/* Detail Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 1. RESPONSE PAYLOAD TAB */}
                {activeDetailTab === 'response' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold">Форматированный ответ (JSON):</span>
                      <span className="font-mono text-[11px]">
                        MIME: {selectedLog.responseHeaders?.['content-type'] || 'application/json'}
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg border font-mono text-xs overflow-x-auto ${
                      isDark ? 'bg-[#181818] border-neutral-700/60' : 'bg-neutral-100 border-neutral-300'
                    }`}>
                      <pre
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(
                            typeof selectedLog.responseBody === 'object'
                              ? JSON.stringify(selectedLog.responseBody, null, 2)
                              : String(selectedLog.responseBody),
                            'json'
                          )
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. HEADERS TAB */}
                {activeDetailTab === 'headers' && (
                  <div className="space-y-4 text-xs">
                    {/* Response Headers */}
                    <div>
                      <h4 className="font-bold text-sky-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Заголовки ответа (Response Headers)
                      </h4>
                      {selectedLog.responseHeaders && Object.keys(selectedLog.responseHeaders).length > 0 ? (
                        <div className={`rounded border overflow-hidden ${
                          isDark ? 'border-neutral-700/60' : 'border-neutral-200'
                        }`}>
                          <table className="w-full text-left font-mono">
                            <thead className={isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}>
                              <tr>
                                <th className="p-2 border-b border-neutral-700/60">Header</th>
                                <th className="p-2 border-b border-neutral-700/60">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700/40">
                              {Object.entries(selectedLog.responseHeaders).map(([k, v]) => (
                                <tr key={k}>
                                  <td className="p-2 text-sky-300 font-semibold">{k}</td>
                                  <td className="p-2 text-neutral-300 select-all">{v}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic">Заголовки ответа не были переданы</p>
                      )}
                    </div>

                    {/* Request Headers */}
                    <div>
                      <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Заголовки запроса (Request Headers)
                      </h4>
                      {selectedLog.requestHeaders && Object.keys(selectedLog.requestHeaders).length > 0 ? (
                        <div className={`rounded border overflow-hidden ${
                          isDark ? 'border-neutral-700/60' : 'border-neutral-200'
                        }`}>
                          <table className="w-full text-left font-mono">
                            <thead className={isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}>
                              <tr>
                                <th className="p-2 border-b border-neutral-700/60">Header</th>
                                <th className="p-2 border-b border-neutral-700/60">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700/40">
                              {Object.entries(selectedLog.requestHeaders).map(([k, v]) => (
                                <tr key={k}>
                                  <td className="p-2 text-purple-300 font-semibold">{k}</td>
                                  <td className="p-2 text-neutral-300 select-all">{v}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic">Специфические заголовки запроса отсутствуют</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. REQUEST PARAMS & BODY TAB */}
                {activeDetailTab === 'request' && (
                  <div className="space-y-4 text-xs">
                    {/* Query Params */}
                    <div>
                      <h4 className="font-bold text-amber-400 mb-2">Query-параметры в строке запроса:</h4>
                      {selectedLog.queryParams && Object.keys(selectedLog.queryParams).length > 0 ? (
                        <div className={`rounded border overflow-hidden ${
                          isDark ? 'border-neutral-700/60' : 'border-neutral-200'
                        }`}>
                          <table className="w-full text-left font-mono">
                            <thead className={isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}>
                              <tr>
                                <th className="p-2 border-b border-neutral-700/60">Ключ параметра</th>
                                <th className="p-2 border-b border-neutral-700/60">Значение</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700/40">
                              {Object.entries(selectedLog.queryParams).map(([k, v]) => (
                                <tr key={k}>
                                  <td className="p-2 text-amber-300 font-semibold">{k}</td>
                                  <td className="p-2 text-neutral-200 select-all">{v}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic">Query-параметры не передавались</p>
                      )}
                    </div>

                    {/* Request Body */}
                    <div>
                      <h4 className="font-bold text-emerald-400 mb-2">Тело запроса (Request Body):</h4>
                      {selectedLog.requestBody ? (
                        <div className={`p-3 rounded border font-mono overflow-x-auto ${
                          isDark ? 'bg-[#181818] border-neutral-700/60' : 'bg-neutral-100 border-neutral-300'
                        }`}>
                          <pre
                            dangerouslySetInnerHTML={{
                              __html: highlightCode(
                                typeof selectedLog.requestBody === 'object'
                                  ? JSON.stringify(selectedLog.requestBody, null, 2)
                                  : String(selectedLog.requestBody),
                                'json'
                              )
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic">Запрос не содержал тела данных (GET-запрос)</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
              Выберите запрос слева для просмотра деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
