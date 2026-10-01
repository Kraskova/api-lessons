import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Play, 
  Square, 
  RefreshCw, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  Terminal, 
  FileCode, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Trash2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  MockServerConfig, 
  MockServerLog, 
  DEFAULT_MOCK_CONFIG, 
  processMockServerRequest 
} from '../../utils/mockServerEngine';
import { highlightCode } from '../../utils/syntaxHighlight';
import { apiResponseLogger } from '../../utils/responseLogger';

interface ApiMockServerProps {
  theme: 'dark' | 'light';
  onSendToPostman: (presetUrl: string, method?: string) => void;
  onSendToTerminal: (cmd: string) => void;
}

export const ApiMockServer: React.FC<ApiMockServerProps> = ({
  theme,
  onSendToPostman,
  onSendToTerminal
}) => {
  const isDark = theme === 'dark';

  // Server state
  const [config, setConfig] = useState<MockServerConfig>(DEFAULT_MOCK_CONFIG);
  const [logs, setLogs] = useState<MockServerLog[]>([
    {
      id: 'log-init-1',
      timestamp: Date.now() - 45000,
      method: 'GET',
      path: '/v1/forecast?latitude=55.75&longitude=37.61&temperature_unit=celsius',
      queryParams: { latitude: '55.75', longitude: '37.61', temperature_unit: 'celsius' },
      headers: { 'accept': 'application/json' },
      statusCode: 200,
      statusText: 'OK',
      latencyMs: 110,
      responsePayload: {
        latitude: 55.75,
        longitude: 37.61,
        timezone: 'Europe/Moscow',
        current: { temperature_2m: 14.8, relative_humidity_2m: 68, wind_speed_10m: 6.4, weather_code: 2 }
      },
      validatedAgainstSchema: true
    }
  ]);
  const [selectedLog, setSelectedLog] = useState<MockServerLog | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Playground request test state
  const [testMethod, setTestMethod] = useState('GET');
  const [testEndpoint, setTestEndpoint] = useState('/v1/forecast?latitude=55.7558&longitude=37.6173&temperature_unit=celsius');
  const [testBody, setTestBody] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [liveTestResponse, setLiveTestResponse] = useState<any>(null);

  // Uptime counter
  const [uptimeSeconds, setUptimeSeconds] = useState(140);
  useEffect(() => {
    if (!config.isRunning) return;
    const interval = setInterval(() => setUptimeSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [config.isRunning]);

  // Handle Mock Request Execution
  const handleExecuteMockCall = async () => {
    if (!config.isRunning) {
      alert('Mock сервер остановлен! Запустите сервер перед отправкой запросов.');
      return;
    }

    setIsDispatching(true);
    const start = performance.now();

    // Parse path & params
    const fullUrl = testEndpoint.startsWith('/') ? `http://localhost:8080${testEndpoint}` : testEndpoint;
    const urlObj = new URL(fullUrl.startsWith('http') ? fullUrl : `http://localhost:8080${fullUrl}`);
    const queryParams: Record<string, string> = {};
    urlObj.searchParams.forEach((v, k) => { queryParams[k] = v; });

    // Simulated latency
    await new Promise(r => setTimeout(r, config.simulatedDelayMs));

    const headers: Record<string, string> = {
      'accept': 'application/json',
      'user-agent': 'TechWriter-Simulator/2.0'
    };

    if (config.requireAuth) {
      headers[config.authHeaderName] = config.expectedToken;
    }

    const result = processMockServerRequest(
      testMethod,
      urlObj.pathname,
      queryParams,
      headers,
      testBody,
      config
    );

    const elapsed = Math.round(performance.now() - start);

    const newLog: MockServerLog = {
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      method: testMethod,
      path: testEndpoint,
      queryParams,
      headers,
      statusCode: result.statusCode,
      statusText: result.statusText,
      latencyMs: elapsed,
      responsePayload: result.data,
      validatedAgainstSchema: result.schemaValid
    };

    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
    setLiveTestResponse(result);
    setSelectedLog(newLog);
    setIsDispatching(false);

    apiResponseLogger.log({
      source: 'mock_server',
      method: testMethod,
      url: `http://localhost:8080${testEndpoint.startsWith('/') ? testEndpoint : '/' + testEndpoint}`,
      statusCode: result.statusCode,
      statusText: result.statusText,
      timeMs: elapsed,
      sizeKb: +(JSON.stringify(result.data).length / 1024).toFixed(2),
      requestHeaders: headers,
      queryParams,
      requestBody: testBody,
      responseHeaders: result.headers,
      responseBody: result.data
    });

    // Decrement rate limit
    setConfig(prev => ({
      ...prev,
      rateLimitRemaining: Math.max(0, prev.rateLimitRemaining - 1)
    }));
  };

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(config.baseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formatUptime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}м ${s < 10 ? '0' : ''}${s}с`;
  };

  const presetScenarios = [
    {
      label: 'Прогноз погоды (Москва)',
      method: 'GET',
      endpoint: '/v1/forecast?latitude=55.7558&longitude=37.6173&temperature_unit=celsius'
    },
    {
      label: 'Прогноз в Фаренгейтах (°F)',
      method: 'GET',
      endpoint: '/v1/forecast?latitude=40.7128&longitude=-74.0060&temperature_unit=fahrenheit'
    },
    {
      label: 'Поиск городов: /locations/search',
      method: 'GET',
      endpoint: '/v1/locations/search?q=Tokyo'
    },
    {
      label: 'Ошибка координат 400 (Bad Request)',
      method: 'GET',
      endpoint: '/v1/forecast?latitude=999.0&longitude=999.0'
    },
    {
      label: 'POST Подписка на оповещения',
      method: 'POST',
      endpoint: '/v1/alerts/subscriptions',
      body: JSON.stringify({ city: 'Kazan', alert_triggers: ['storm_warning'] }, null, 2)
    }
  ];

  return (
    <div className={`h-full flex flex-col overflow-y-auto font-sans text-xs ${
      isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-[#f8f9fa] text-[#24292f]'
    }`}>
      {/* Top Header */}
      <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-white border-[#dee2e6]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">API Mock Server (Песочница живой симуляции)</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                config.isRunning ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' : 'bg-neutral-800 text-neutral-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                {config.isRunning ? 'RUNNING (LIVE)' : 'STOPPED'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Генерирует динамические метеоданные в реальном времени для валидации документации
            </p>
          </div>
        </div>

        {/* Server Start/Stop Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfig(prev => ({ ...prev, isRunning: !prev.isRunning }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shadow-sm ${
              config.isRunning
                ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {config.isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{config.isRunning ? 'Остановить сервер' : 'Запустить Mock Сервер'}</span>
          </button>

          <button
            onClick={() => onSendToPostman(config.baseUrl + testEndpoint, testMethod)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors shadow-sm"
            title="Открыть этот эндпоинт в Postman"
          >
            <Send className="w-3.5 h-3.5" />
            <span>В Postman</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-5">
        {/* Server Status Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Базовый адрес (Base URL):</span>
            <div className="flex items-center justify-between font-mono text-xs text-sky-300">
              <span className="truncate">{config.baseUrl}</span>
              <button
                onClick={handleCopyBaseUrl}
                className="text-neutral-400 hover:text-white p-1"
                title="Копировать адрес"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Имитация задержки (Latency):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1500}
                step={50}
                value={config.simulatedDelayMs}
                onChange={(e) => setConfig({ ...config, simulatedDelayMs: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-amber-300 w-12 text-right">
                {config.simulatedDelayMs} ms
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Лимит вызовов (Rate Limit):</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-sm font-bold text-emerald-400">{config.rateLimitRemaining}</span>
              <span className="text-neutral-500 text-xs">/ {config.rateLimitMax} в мин.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-0.5">Время непрерывной работы:</span>
            <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{config.isRunning ? formatUptime(uptimeSeconds) : 'Не активен'}</span>
            </div>
          </div>
        </div>

        {/* Chaos & Behavior Configuration Box */}
        <div className="p-4 rounded-xl bg-[#252526] border border-neutral-700/70 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-700/60 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Инъекция сценариев и ошибок (Chaos Simulator)</span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Позволяет проверить, как ваша документация объясняет краевые случаи
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-neutral-300 block mb-1 font-medium">
                Принудительный статус ответа (Forced Status):
              </label>
              <select
                value={config.forcedStatusCode}
                onChange={(e) => setConfig({ ...config, forcedStatusCode: parseInt(e.target.value) || 0 })}
                className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white outline-none font-mono"
              >
                <option value={0}>Auto (Динамический расчет по параметрам)</option>
                <option value={200}>200 OK (Всегда успешный)</option>
                <option value={400}>400 Bad Request (Ошибка валидации входных данных)</option>
                <option value={401}>401 Unauthorized (Ошибка аутентификации)</option>
                <option value={429}>429 Too Many Requests (Превышение лимита вызовов)</option>
                <option value={500}>500 Internal Server Error (Сбой сервера)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={config.requireAuth}
                  onChange={(e) => setConfig({ ...config, requireAuth: e.target.checked })}
                  className="rounded accent-emerald-500 cursor-pointer"
                />
                <span>Требовать авторизацию ({config.authHeaderName})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={config.enableNoise}
                  onChange={(e) => setConfig({ ...config, enableNoise: e.target.checked })}
                  className="rounded accent-emerald-500 cursor-pointer"
                />
                <span>Живые колебания метеорологии (Real-time Noise)</span>
              </label>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              💡 <strong>Совет техписателю:</strong> Включите ошибку <code className="text-amber-300">429</code> или <code className="text-rose-300">401</code>, 
              чтобы скопировать точный формат тела ошибки и задокументировать его в разделе <em>Errors</em>.
            </div>
          </div>
        </div>

        {/* Live Interactive Playground */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Тестовый вызов к Mock Серверу
            </span>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {presetScenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTestMethod(sc.method);
                    setTestEndpoint(sc.endpoint);
                    if (sc.body) setTestBody(sc.body);
                  }}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-300 text-[11px] whitespace-nowrap transition-colors border border-neutral-700"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value)}
              className="h-9 px-3 rounded bg-neutral-800 border border-neutral-700 font-mono font-bold text-xs text-emerald-400 outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>

            <div className="flex-1 h-9 px-3 rounded bg-[#1e1e1e] border border-neutral-700 flex items-center font-mono text-xs text-neutral-200">
              <span className="text-neutral-500 mr-1">http://localhost:8080</span>
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full bg-transparent outline-none text-sky-300"
              />
            </div>

            <button
              onClick={handleExecuteMockCall}
              disabled={isDispatching}
              className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
            >
              {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Выполнить вызов</span>
            </button>
          </div>
        </div>

        {/* Live Response & Logs Split Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Request Stream Logs */}
          <div className="p-4 rounded-xl bg-[#252526] border border-neutral-700 flex flex-col h-96">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-700/60 mb-2">
              <span className="text-xs font-semibold text-white">
                Журнал обращений (Live Request Log)
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Очистить</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {logs.map(log => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors text-xs flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#007acc]/20 border-[#007acc] text-white'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-emerald-400 text-[11px]">{log.method}</span>
                      <span className="font-mono truncate text-[11px]">{log.path}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.statusCode === 200 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {log.statusCode}
                      </span>
                      <span className="text-neutral-500 font-mono text-[10px]">{log.latencyMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Response Inspector */}
          <div className="p-4 rounded-xl bg-[#252526] border border-neutral-700 flex flex-col h-96">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-700/60 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  Сгенерированный ответ (Response Payload)
                </span>
                {selectedLog?.validatedAgainstSchema && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-950/80 text-teal-300 border border-teal-700/60 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" />
                    <span>OpenAPI Valid</span>
                  </span>
                )}
              </div>

              {selectedLog && (
                <button
                  onClick={() => {
                    const curlCmd = `curl -X ${selectedLog.method} "http://localhost:8080${selectedLog.path}"`;
                    onSendToTerminal(curlCmd);
                  }}
                  className="text-[11px] text-sky-400 hover:text-white flex items-center gap-1"
                  title="Отправить команду в терминал"
                >
                  <Terminal className="w-3 h-3" />
                  <span>В терминал</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedLog ? (
                <pre className="p-3 rounded-lg font-mono text-xs leading-relaxed vscode-dark-code overflow-x-auto border border-neutral-800">
                  <code 
                    className="language-json"
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(JSON.stringify(selectedLog.responsePayload, null, 2), 'json')
                    }}
                  />
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                  Выберите запрос из журнала слева для инспекции полезной нагрузки
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
