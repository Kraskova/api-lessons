import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  RefreshCw, 
  FileCode, 
  Layers, 
  Terminal, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Search,
  X,
  FolderOpen
} from 'lucide-react';
import { PostmanRequest, PostmanResponse, PostmanParam, PostmanHeader } from '../../types/course';
import { WEATHER_PRESETS } from '../../data/weatherApiPresets';
import { executeApiRequest, generateSchemaMarkdown, generateCurlSnippet } from '../../utils/apiService';
import { highlightCode } from '../../utils/syntaxHighlight';

interface PostmanClientProps {
  initialPresetId?: string;
  theme: 'dark' | 'light';
  onNavigateToQuiz?: () => void;
}

export const PostmanClient: React.FC<PostmanClientProps> = ({
  initialPresetId,
  theme,
  onNavigateToQuiz
}) => {
  const isDark = theme === 'dark';

  // Request state
  const [currentRequest, setCurrentRequest] = useState<PostmanRequest>(() => {
    const found = WEATHER_PRESETS.find(p => p.id === initialPresetId);
    return found ? JSON.parse(JSON.stringify(found)) : JSON.parse(JSON.stringify(WEATHER_PRESETS[0]));
  });

  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'auth' | 'body'>('params');
  const [activeResponseTab, setActiveResponseTab] = useState<'pretty' | 'raw' | 'headers' | 'schema' | 'code'>('pretty');
  
  // Collections sidebar state directly on Postman tab
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
  const [collectionSearch, setCollectionSearch] = useState('');
  
  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PostmanResponse | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // When initialPresetId changes from external click
  useEffect(() => {
    if (initialPresetId) {
      const found = WEATHER_PRESETS.find(p => p.id === initialPresetId);
      if (found) {
        setCurrentRequest(JSON.parse(JSON.stringify(found)));
      }
    }
  }, [initialPresetId]);

  // Load a preset
  const handleSelectPreset = (presetId: string) => {
    const found = WEATHER_PRESETS.find(p => p.id === presetId);
    if (found) {
      setCurrentRequest(JSON.parse(JSON.stringify(found)));
      setResponse(null);
    }
  };

  // Sync params with URL or update
  const handleParamChange = (id: string, field: keyof PostmanParam, value: any) => {
    setCurrentRequest(prev => ({
      ...prev,
      params: prev.params.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleAddParam = () => {
    const newParam: PostmanParam = {
      id: `p_${Date.now()}`,
      key: '',
      value: '',
      description: '',
      enabled: true
    };
    setCurrentRequest(prev => ({
      ...prev,
      params: [...prev.params, newParam]
    }));
  };

  const handleDeleteParam = (id: string) => {
    setCurrentRequest(prev => ({
      ...prev,
      params: prev.params.filter(p => p.id !== id)
    }));
  };

  // Headers management
  const handleHeaderChange = (id: string, field: keyof PostmanHeader, value: any) => {
    setCurrentRequest(prev => ({
      ...prev,
      headers: prev.headers.map(h => h.id === id ? { ...h, [field]: value } : h)
    }));
  };

  const handleAddHeader = () => {
    const newHeader: PostmanHeader = {
      id: `h_${Date.now()}`,
      key: '',
      value: '',
      description: '',
      enabled: true
    };
    setCurrentRequest(prev => ({
      ...prev,
      headers: [...prev.headers, newHeader]
    }));
  };

  const handleDeleteHeader = (id: string) => {
    setCurrentRequest(prev => ({
      ...prev,
      headers: prev.headers.filter(h => h.id !== id)
    }));
  };

  // Execute request
  const handleSend = async () => {
    setIsLoading(true);
    try {
      const res = await executeApiRequest(currentRequest);
      setResponse(res);
    } catch (err: any) {
      setResponse({
        status: 500,
        statusText: 'Internal Error',
        timeMs: 20,
        sizeKb: 0,
        headers: {},
        data: null,
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // HTTP method color helper
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-emerald-400 font-bold';
      case 'POST': return 'text-amber-400 font-bold';
      case 'PUT': return 'text-sky-400 font-bold';
      case 'DELETE': return 'text-rose-400 font-bold';
      default: return 'text-neutral-300 font-bold';
    }
  };

  // Status color helper
  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
    }
    if (status >= 400 && status < 500) {
      return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
    }
    return 'bg-rose-950/80 text-rose-300 border-rose-600/60';
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'POST': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'PUT': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/40';
    }
  };

  const filteredPresets = WEATHER_PRESETS.filter(p => {
    const q = collectionSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.url.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`h-full flex flex-col overflow-hidden font-sans text-xs ${
      isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#f8f9fa] text-[#212529]'
    }`}>
      {/* Top Postman Header & Presets Bar */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#ffffff] border-[#e9ecef]'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              isCollectionsOpen
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-xs'
                : isDark 
                  ? 'bg-[#333333] hover:bg-[#3d3d3d] text-neutral-300 border-neutral-600' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
            }`}
            title={isCollectionsOpen ? "Скрыть панель коллекций" : "Показать список коллекций Postman"}
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Коллекции ({WEATHER_PRESETS.length})</span>
          </button>

          <div className="h-4 w-px bg-neutral-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-600 flex items-center justify-center text-white font-black text-xs">
              P
            </div>
            <span className="font-semibold text-white tracking-wide">
              Postman API Sandbox
            </span>
            <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
              · Интерактивное тестирование
            </span>
          </div>
        </div>

        {/* Preset Selector & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-neutral-400 text-xs hidden lg:inline">Быстрый выбор:</label>
            <select
              value={currentRequest.id}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className={`px-2.5 py-1 rounded text-xs border outline-none font-sans font-medium cursor-pointer max-w-[200px] sm:max-w-xs truncate ${
                isDark 
                  ? 'bg-[#333333] border-[#444444] text-white hover:border-neutral-500' 
                  : 'bg-white border-neutral-300 text-neutral-800'
              }`}
            >
              {WEATHER_PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {onNavigateToQuiz && (
            <button 
              onClick={onNavigateToQuiz}
              className="text-sky-400 hover:underline shrink-0 text-xs flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Перейти к тесту</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout on Postman Tab */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. LEFT SIDEBAR: Postman Collections Picker */}
        {isCollectionsOpen && (
          <aside className={`w-72 sm:w-80 shrink-0 border-r flex flex-col h-full select-none ${
            isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f4f5f7] border-[#e0e0e0]'
          }`}>
            {/* Sidebar header */}
            <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'border-[#333333]' : 'border-neutral-200'
            }`}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-xs text-white">Коллекции Weather API</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
                {WEATHER_PRESETS.length} запросов
              </span>
            </div>

            {/* Search Box */}
            <div className={`p-2 border-b shrink-0 ${isDark ? 'border-[#333333]' : 'border-neutral-200'}`}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs border ${
                isDark 
                  ? 'bg-[#1e1e1e] border-[#3e3e3e] text-neutral-200 focus-within:border-orange-500' 
                  : 'bg-white border-neutral-300 text-neutral-800 focus-within:border-orange-500'
              }`}>
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Поиск запроса (GET, POST, 400)..."
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs"
                />
                {collectionSearch && (
                  <button
                    onClick={() => setCollectionSearch('')}
                    className="p-0.5 hover:text-white text-neutral-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Collection Requests */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredPresets.map((preset) => {
                const isActive = preset.id === currentRequest.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer group flex items-start gap-2.5 ${
                      isActive
                        ? isDark
                          ? 'bg-orange-500/15 border-orange-500/60 shadow-xs'
                          : 'bg-orange-50 border-orange-400 shadow-xs'
                        : isDark
                          ? 'bg-[#1e1e1e]/60 border-neutral-700/60 hover:bg-[#2f2f32] text-neutral-300'
                          : 'bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 mt-0.5 ${
                      getMethodBadgeClass(preset.method)
                    }`}>
                      {preset.method}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-xs leading-snug line-clamp-2 ${
                        isActive ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                      }`}>
                        {preset.name}
                      </div>

                      <div className="text-[10px] font-mono text-neutral-400 truncate mt-1">
                        {preset.url.replace('https://', '').replace('http://', '')}
                      </div>

                      {preset.description && (
                        <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                          {preset.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="p-6 text-center text-neutral-400 text-xs">
                  Ничего не найдено
                </div>
              )}
            </div>

            {/* Sidebar Tip */}
            <div className={`p-2.5 border-t text-[11px] text-neutral-400 flex items-center gap-1.5 shrink-0 ${
              isDark ? 'border-[#333333] bg-[#1e1e1e]/50' : 'border-neutral-200 bg-neutral-100'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">Кликните любой запрос для моментального теста</span>
            </div>
          </aside>
        )}

        {/* 2. RIGHT WORKSPACE: Request Builder & Response Viewer */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
          {/* Description callout for current scenario */}
          <div className={`px-4 py-2 border-b text-[11px] leading-relaxed flex items-center justify-between shrink-0 ${
            isDark ? 'bg-[#181818] border-[#2c2c2c] text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
          }`}>
            <span className="truncate mr-2">
              💡 <strong className="text-neutral-200">Цель техписателя:</strong> {currentRequest.description}
            </span>
          </div>

      {/* URL & Method Execution Bar */}
      <div className={`p-4 border-b ${isDark ? 'bg-[#252526] border-[#333333]' : 'bg-white border-[#dee2e6]'}`}>
        <div className="flex items-center gap-2">
          {/* Method Selector */}
          <select
            value={currentRequest.method}
            onChange={(e) => setCurrentRequest({ ...currentRequest, method: e.target.value as any })}
            className={`h-9 px-3 rounded font-mono font-bold text-xs border outline-none cursor-pointer ${
              getMethodColor(currentRequest.method)
            } ${isDark ? 'bg-[#333333] border-[#444444]' : 'bg-neutral-100 border-neutral-300'}`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          {/* URL Input */}
          <div className={`flex-1 h-9 flex items-center px-3 rounded border font-mono text-xs ${
            isDark 
              ? 'bg-[#1e1e1e] border-[#444444] text-[#d4d4d4] focus-within:border-[#007acc]' 
              : 'bg-white border-neutral-300 text-neutral-900 focus-within:border-[#007acc]'
          }`}>
            <input
              type="text"
              value={currentRequest.url}
              onChange={(e) => setCurrentRequest({ ...currentRequest, url: e.target.value })}
              placeholder="https://api.open-meteo.com/v1/forecast"
              className="w-full bg-transparent outline-none"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`h-9 px-5 rounded font-semibold text-xs text-white flex items-center gap-2 transition-all shadow-sm ${
              isLoading 
                ? 'bg-neutral-600 cursor-not-allowed' 
                : 'bg-[#007acc] hover:bg-[#0062a3] active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

        {/* Request Tabs (Params, Headers, Auth, Body) */}
        <div className="flex items-center gap-1 mt-3 border-b border-neutral-700/50 pt-1">
          <button
            onClick={() => setActiveTab('params')}
            className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'params' 
                ? 'border-orange-500 text-orange-400 font-semibold' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Params ({currentRequest.params.filter(p => p.enabled).length})
          </button>

          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'headers' 
                ? 'border-orange-500 text-orange-400 font-semibold' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Headers ({currentRequest.headers.filter(h => h.enabled).length})
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'auth' 
                ? 'border-orange-500 text-orange-400 font-semibold' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Authorization {currentRequest.authType !== 'none' && '✓'}
          </button>

          {currentRequest.method !== 'GET' && (
            <button
              onClick={() => setActiveTab('body')}
              className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
                activeTab === 'body' 
                  ? 'border-orange-500 text-orange-400 font-semibold' 
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Body (raw JSON)
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Top Request Editor, Bottom Response Viewer */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* REQUEST TAB PANELS */}
        <div className="p-4 border-b border-neutral-700/40">
          {/* 1. PARAMS TAB */}
          {activeTab === 'params' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                  Query Parameters (Параметры строки запроса)
                </span>
                <button
                  onClick={handleAddParam}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить параметр</span>
                </button>
              </div>

              <div className="border border-neutral-700/60 rounded overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className={isDark ? 'bg-[#252526] text-neutral-400' : 'bg-neutral-100 text-neutral-600'}>
                    <tr>
                      <th className="p-2 w-8 text-center">✓</th>
                      <th className="p-2 w-1/4">Key (Имя параметра)</th>
                      <th className="p-2 w-1/3">Value (Значение)</th>
                      <th className="p-2">Description (Описание для документа)</th>
                      <th className="p-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/30">
                    {currentRequest.params.map(param => (
                      <tr key={param.id} className={param.enabled ? '' : 'opacity-50'}>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={(e) => handleParamChange(param.id, 'enabled', e.target.checked)}
                            className="rounded accent-orange-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={param.key}
                            onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                            placeholder="например, latitude"
                            className="w-full px-2 py-1 bg-transparent outline-none text-sky-300"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={param.value}
                            onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                            placeholder="55.75"
                            className="w-full px-2 py-1 bg-transparent outline-none text-amber-200"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={param.description}
                            onChange={(e) => handleParamChange(param.id, 'description', e.target.value)}
                            placeholder="Географическая широта точки"
                            className="w-full px-2 py-1 bg-transparent outline-none text-neutral-400 font-sans"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            onClick={() => handleDeleteParam(param.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. HEADERS TAB */}
          {activeTab === 'headers' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                  HTTP Headers (Заголовки запроса)
                </span>
                <button
                  onClick={handleAddHeader}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить заголовок</span>
                </button>
              </div>

              <div className="border border-neutral-700/60 rounded overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className={isDark ? 'bg-[#252526] text-neutral-400' : 'bg-neutral-100 text-neutral-600'}>
                    <tr>
                      <th className="p-2 w-8 text-center">✓</th>
                      <th className="p-2 w-1/3">Header Name</th>
                      <th className="p-2 w-1/3">Value</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/30">
                    {currentRequest.headers.map(hdr => (
                      <tr key={hdr.id} className={hdr.enabled ? '' : 'opacity-50'}>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={hdr.enabled}
                            onChange={(e) => handleHeaderChange(hdr.id, 'enabled', e.target.checked)}
                            className="rounded accent-orange-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={hdr.key}
                            onChange={(e) => handleHeaderChange(hdr.id, 'key', e.target.value)}
                            placeholder="Accept"
                            className="w-full px-2 py-1 bg-transparent outline-none text-sky-300"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={hdr.value}
                            onChange={(e) => handleHeaderChange(hdr.id, 'value', e.target.value)}
                            placeholder="application/json"
                            className="w-full px-2 py-1 bg-transparent outline-none text-amber-200"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={hdr.description}
                            onChange={(e) => handleHeaderChange(hdr.id, 'description', e.target.value)}
                            placeholder="Формат"
                            className="w-full px-2 py-1 bg-transparent outline-none text-neutral-400 font-sans"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            onClick={() => handleDeleteHeader(hdr.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. AUTH TAB */}
          {activeTab === 'auth' && (
            <div className="max-w-xl">
              <div className="mb-3">
                <label className="block text-neutral-400 text-xs mb-1 font-semibold">
                  Тип аутентификации (Auth Type)
                </label>
                <select
                  value={currentRequest.authType}
                  onChange={(e) => setCurrentRequest({ ...currentRequest, authType: e.target.value as any })}
                  className={`w-full p-2 rounded border outline-none font-medium ${
                    isDark ? 'bg-[#252526] border-neutral-700 text-white' : 'bg-white border-neutral-300'
                  }`}
                >
                  <option value="none">No Auth (Открытый публичный API, например Open-Meteo)</option>
                  <option value="apiKeyHeader">API Key в Заголовке (Header: X-Api-Key)</option>
                  <option value="apiKeyQuery">API Key в строке запроса (Query: ?key=...)</option>
                  <option value="bearer">Bearer Token (Authorization: Bearer &lt;JWT&gt;)</option>
                </select>
              </div>

              {currentRequest.authType === 'apiKeyHeader' && (
                <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded bg-neutral-800/40 border border-neutral-700">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Header Key Name</label>
                    <input
                      type="text"
                      value={currentRequest.authKey || 'X-Api-Key'}
                      onChange={(e) => setCurrentRequest({ ...currentRequest, authKey: e.target.value })}
                      className="w-full p-1.5 rounded bg-black/30 border border-neutral-700 text-sky-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Key Value</label>
                    <input
                      type="text"
                      value={currentRequest.authValue || ''}
                      onChange={(e) => setCurrentRequest({ ...currentRequest, authValue: e.target.value })}
                      placeholder="sample_secret_key_123"
                      className="w-full p-1.5 rounded bg-black/30 border border-neutral-700 text-amber-200 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {currentRequest.authType === 'bearer' && (
                <div className="mt-3 p-3 rounded bg-neutral-800/40 border border-neutral-700">
                  <label className="text-[11px] text-neutral-400 block mb-1">Bearer Token (JWT / OAuth)</label>
                  <input
                    type="text"
                    value={currentRequest.authValue || ''}
                    onChange={(e) => setCurrentRequest({ ...currentRequest, authValue: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full p-1.5 rounded bg-black/30 border border-neutral-700 text-amber-200 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. BODY TAB */}
          {activeTab === 'body' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">
                  Request Payload (JSON)
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">application/json</span>
              </div>

              <textarea
                rows={7}
                value={currentRequest.bodyContent}
                onChange={(e) => setCurrentRequest({ ...currentRequest, bodyContent: e.target.value })}
                placeholder={`{\n  "city": "Moscow",\n  "active": true\n}`}
                className={`w-full p-3 rounded font-mono text-xs border outline-none leading-relaxed ${
                  isDark 
                    ? 'bg-[#1e1e1e] border-neutral-700 text-emerald-300 focus:border-[#007acc]' 
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#007acc]'
                }`}
              />
            </div>
          )}
        </div>

        {/* RESPONSE SECTION */}
        <div className="flex-1 flex flex-col p-4 min-h-[300px]">
          {/* Response status bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-700/40">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-xs tracking-wide uppercase text-neutral-400">
                Ответ сервера (Response)
              </span>

              {response && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border text-xs font-mono font-bold ${getStatusBadge(response.status)}`}>
                    Status: {response.status} {response.statusText}
                  </span>
                  <span className="text-neutral-400 font-mono text-[11px]">
                    ⏱️ {response.timeMs} ms
                  </span>
                  <span className="text-neutral-400 font-mono text-[11px]">
                    📦 {response.sizeKb} KB
                  </span>
                </div>
              )}
            </div>

            {/* Response View Switcher */}
            {response && (
              <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded border border-neutral-700/50">
                <button
                  onClick={() => setActiveResponseTab('pretty')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeResponseTab === 'pretty' ? 'bg-[#007acc] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Pretty JSON
                </button>
                <button
                  onClick={() => setActiveResponseTab('raw')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeResponseTab === 'raw' ? 'bg-[#007acc] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Raw
                </button>
                <button
                  onClick={() => setActiveResponseTab('headers')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeResponseTab === 'headers' ? 'bg-[#007acc] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Headers ({Object.keys(response.headers).length})
                </button>
                <button
                  onClick={() => setActiveResponseTab('schema')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    activeResponseTab === 'schema' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'
                  }`}
                  title="Автоматическая генерация Markdown-таблицы полей ответа для документации"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Схема в Markdown</span>
                </button>
                <button
                  onClick={() => setActiveResponseTab('code')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    activeResponseTab === 'code' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
                  }`}
                  title="Сниппеты cURL, JS fetch, Python"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Код запроса</span>
                </button>
              </div>
            )}
          </div>

          {/* Response Content Body */}
          <div className="flex-1 mt-3 overflow-y-auto">
            {!response && !isLoading && (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-neutral-500 border border-dashed border-neutral-700/50 rounded-lg">
                <Send className="w-8 h-8 mb-2 opacity-30 text-orange-400" />
                <p className="text-sm font-medium text-neutral-400">Запрос еще не отправлен</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-md">
                  Нажмите синюю кнопку «Send», чтобы выполнить вызов к реальному метеорологическому API, получить данные и проанализировать структуру ответа.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="h-48 flex flex-col items-center justify-center text-neutral-400">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mb-2" />
                <p className="text-xs font-mono">Выполнение сетевого запроса к сервису погоды...</p>
              </div>
            )}

            {response && (
              <>
                {/* 1. PRETTY JSON TAB */}
                {activeResponseTab === 'pretty' && (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2), 'pretty')}
                      className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-700/60 hover:bg-neutral-600 text-white text-[11px] transition-colors shadow-sm"
                    >
                      {copiedType === 'pretty' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedType === 'pretty' ? 'Скопировано' : 'Копировать JSON'}</span>
                    </button>

                    <pre className={`p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border ${
                      isDark ? 'vscode-dark-code border-neutral-800' : 'vscode-light-code border-neutral-300'
                    }`}>
                      <code 
                        className="language-json"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightCode(JSON.stringify(response.data, null, 2), 'json') 
                        }}
                      />
                    </pre>
                  </div>
                )}

                {/* 2. RAW TAB */}
                {activeResponseTab === 'raw' && (
                  <textarea
                    readOnly
                    rows={12}
                    value={typeof response.data === 'string' ? response.data : JSON.stringify(response.data)}
                    className="w-full p-3 font-mono text-xs rounded bg-neutral-900 text-neutral-300 border border-neutral-700"
                  />
                )}

                {/* 3. HEADERS TAB */}
                {activeResponseTab === 'headers' && (
                  <div className="border border-neutral-700/50 rounded overflow-hidden">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#252526] text-neutral-400">
                        <tr>
                          <th className="p-2 w-1/3">Header</th>
                          <th className="p-2">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-700/30">
                        {Object.entries(response.headers).map(([k, v]) => (
                          <tr key={k}>
                            <td className="p-2 text-sky-400 font-semibold">{k}</td>
                            <td className="p-2 text-neutral-300">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. SCHEMA GENERATOR (TECH WRITER SUPERPOWER) */}
                {activeResponseTab === 'schema' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-amber-950/20 border border-amber-500/30">
                      <div>
                        <h4 className="font-semibold text-amber-300 font-sans">
                          Генератор таблицы документации схемы (Response Fields)
                        </h4>
                        <p className="text-[11px] text-amber-200/80">
                          Автоматический разбор JSON в Markdown таблицу полей для вставки в спецификацию вашего API.
                        </p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(generateSchemaMarkdown(response.data), 'schema')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shrink-0"
                      >
                        {copiedType === 'schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Копировать таблицу в Markdown</span>
                      </button>
                    </div>

                    <pre className="p-3 rounded font-mono text-xs bg-neutral-900 text-neutral-300 border border-neutral-700 overflow-x-auto whitespace-pre">
                      <code>{generateSchemaMarkdown(response.data)}</code>
                    </pre>
                  </div>
                )}

                {/* 5. CODE SNIPPETS TAB */}
                {activeResponseTab === 'code' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 font-semibold">Готовая cURL команда:</span>
                      <button
                        onClick={() => copyToClipboard(generateCurlSnippet(currentRequest), 'curl')}
                        className="flex items-center gap-1 text-xs text-sky-400 hover:text-white"
                      >
                        {copiedType === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'curl' ? 'Скопировано' : 'Копировать cURL'}</span>
                      </button>
                    </div>

                    <pre className="p-3 rounded font-mono text-xs bg-neutral-900 text-emerald-300 border border-neutral-700 overflow-x-auto whitespace-pre">
                      <code>{generateCurlSnippet(currentRequest)}</code>
                    </pre>

                    <div className="pt-2">
                      <span className="text-xs text-neutral-400 font-semibold">Пример на JavaScript (fetch):</span>
                      <pre className="mt-1 p-3 rounded font-mono text-xs bg-neutral-900 text-sky-300 border border-neutral-700 overflow-x-auto">
                        <code>{`const response = await fetch('${currentRequest.url}', {
  method: '${currentRequest.method}',
  headers: {
    'Accept': 'application/json'${currentRequest.authType === 'bearer' ? `,\n    'Authorization': 'Bearer YOUR_TOKEN'` : ''}
  }
});
const data = await response.json();
console.log(data);`}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
