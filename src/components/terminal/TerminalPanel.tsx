import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  CornerDownLeft, 
  Play, 
  Check, 
  Copy,
  ChevronRight
} from 'lucide-react';
import { executeApiRequest } from '../../utils/apiService';
import { PostmanRequest } from '../../types/course';

interface TerminalPanelProps {
  initialCommand?: string;
  theme: 'dark' | 'light';
  onClose?: () => void;
}

interface TerminalLog {
  id: string;
  type: 'cmd' | 'output' | 'error' | 'info';
  text: string;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  initialCommand,
  theme
}) => {
  const isDark = theme === 'dark';
  const [command, setCommand] = useState(initialCommand || '');
  const [history, setHistory] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'info',
      text: 'Интерактивный терминал cURL (Bash environment ready).'
    },
    {
      id: 'init-2',
      type: 'info',
      text: 'Введите команду curl или выберите готовую заготовку ниже для проверки API метеосервисов.'
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCommand) {
      setCommand(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const quickCommands = [
    {
      label: 'curl Open-Meteo Москва',
      cmd: 'curl -s "https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61&current=temperature_2m"'
    },
    {
      label: 'curl -i заголовки ответа',
      cmd: 'curl -i "https://api.open-meteo.com/v1/forecast?latitude=59.93&longitude=30.33"'
    },
    {
      label: 'curl ошибка 400 (Bad Coords)',
      cmd: 'curl -i "https://api.open-meteo.com/v1/forecast?latitude=999&longitude=999"'
    },
    {
      label: 'curl wttr.in (Saint Petersburg)',
      cmd: 'curl -s "https://wttr.in/Saint_Petersburg?format=j1"'
    },
    {
      label: 'git status',
      cmd: 'git status'
    }
  ];

  const handleExecute = async (cmdToRun: string) => {
    const raw = cmdToRun.trim();
    if (!raw) return;

    // Append command to log
    const cmdId = `cmd_${Date.now()}`;
    setHistory(prev => [...prev, { id: cmdId, type: 'cmd', text: `techwriter@vscode:~/weather$ ${raw}` }]);
    setCommand('');
    setIsExecuting(true);

    try {
      // Internal commands
      if (raw === 'clear') {
        setHistory([]);
        setIsExecuting(false);
        return;
      }

      if (raw === 'help') {
        setHistory(prev => [
          ...prev,
          {
            id: `h_${Date.now()}`,
            type: 'info',
            text: `Доступные команды:\n  curl [flags] "<url>" — отправка HTTP запроса\n  clear — очистить экран терминала\n  git status — проверить состояние репозитория курса\n  ls — список файлов каталога\n  cat <filename> — просмотр файла`
          }
        ]);
        setIsExecuting(false);
        return;
      }

      if (raw === 'ls') {
        setHistory(prev => [
          ...prev,
          {
            id: `ls_${Date.now()}`,
            type: 'output',
            text: '01_intro_api_weather.md   02_endpoints_and_verbs.md   03_query_path_headers.md\n04_auth_mechanisms.md     05_curl_and_terminal.md     06_json_schemas.md\nweather_openapi_spec.yaml package.json                README.md'
          }
        ]);
        setIsExecuting(false);
        return;
      }

      if (raw.startsWith('git status')) {
        setHistory(prev => [
          ...prev,
          {
            id: `git_${Date.now()}`,
            type: 'output',
            text: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tmodified:   SPECS/weather_openapi_spec.yaml\n\nUntracked files:\n\tcurl_weather_test.sh'
          }
        ]);
        setIsExecuting(false);
        return;
      }

      // Handle cURL command
      if (raw.startsWith('curl')) {
        // Extract URL
        const urlMatch = raw.match(/https?:\/\/[^\s"']+/);
        const targetUrl = urlMatch ? urlMatch[0] : '';
        const hasInclude = raw.includes('-i') || raw.includes('--include');

        if (!targetUrl) {
          setHistory(prev => [
            ...prev,
            { id: `err_${Date.now()}`, type: 'error', text: 'cURL: URL не найден. Пример: curl "https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61"' }
          ]);
          setIsExecuting(false);
          return;
        }

        const simulatedReq: PostmanRequest = {
          id: 'curl_call',
          name: 'cURL Terminal Call',
          method: raw.includes('-X POST') ? 'POST' : 'GET',
          url: targetUrl,
          params: [],
          headers: [],
          authType: 'none',
          bodyType: 'none',
          bodyContent: '',
          description: ''
        };

        const res = await executeApiRequest(simulatedReq);

        let outputText = '';
        if (hasInclude) {
          outputText += `HTTP/1.1 ${res.status} ${res.statusText}\n`;
          Object.entries(res.headers).forEach(([k, v]) => {
            outputText += `${k}: ${v}\n`;
          });
          outputText += '\n';
        }

        outputText += JSON.stringify(res.data, null, 2);

        setHistory(prev => [
          ...prev,
          { id: `res_${Date.now()}`, type: 'output', text: outputText }
        ]);
      } else {
        setHistory(prev => [
          ...prev,
          { id: `err_${Date.now()}`, type: 'error', text: `bash: command not found: ${raw.split(' ')[0]}. Введите 'help' для списка поддерживаемых команд.` }
        ]);
      }
    } catch (err: any) {
      setHistory(prev => [
        ...prev,
        { id: `err_${Date.now()}`, type: 'error', text: `Ошибка выполнения: ${err.message}` }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={`h-full flex flex-col font-mono text-xs ${
      isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-[#1e1e1e] text-[#d4d4d4]'
    }`}>
      {/* Terminal Title Bar */}
      <div className="h-8 px-4 flex items-center justify-between border-b border-neutral-700/60 bg-[#252526] select-none shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-white font-sans text-xs">
            Терминал bash (cURL Console)
          </span>
          <span className="text-[11px] text-neutral-400 font-sans hidden sm:inline">
            · Симулятор командной строки технического писателя
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="hover:text-white p-1 rounded transition-colors text-neutral-400 flex items-center gap-1 font-sans text-[11px]"
            title="Очистить терминал"
          >
            <Trash2 className="w-3 h-3" />
            <span>Очистить</span>
          </button>
        </div>
      </div>

      {/* Quick preset commands bar */}
      <div className="px-3 py-1.5 border-b border-neutral-800 bg-[#1e1e1e] flex items-center gap-1.5 overflow-x-auto select-none shrink-0">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans shrink-0 mr-1">
          Быстрые команды:
        </span>
        {quickCommands.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleExecute(q.cmd)}
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-300 hover:text-white transition-colors text-[11px] whitespace-nowrap flex items-center gap-1 border border-neutral-700/60"
          >
            <Play className="w-2.5 h-2.5 text-emerald-400" />
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal logs viewport */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 select-text font-mono text-xs leading-relaxed">
        {history.map(item => {
          if (item.type === 'cmd') {
            return (
              <div key={item.id} className="text-emerald-400 font-semibold pt-1">
                {item.text}
              </div>
            );
          }
          if (item.type === 'info') {
            return (
              <div key={item.id} className="text-sky-300/80">
                {item.text}
              </div>
            );
          }
          if (item.type === 'error') {
            return (
              <div key={item.id} className="text-rose-400 font-medium">
                {item.text}
              </div>
            );
          }
          return (
            <pre key={item.id} className="text-[#d4d4d4] whitespace-pre-wrap pl-2 border-l border-neutral-700/50">
              {item.text}
            </pre>
          );
        })}

        {isExecuting && (
          <div className="text-neutral-400 animate-pulse flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
            Выполнение cURL запроса по сети...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Command prompt input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecute(command);
        }}
        className="p-2 border-t border-neutral-800 bg-[#1e1e1e] flex items-center gap-2 shrink-0"
      >
        <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1">
          techwriter@vscode:~/weather$
        </span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='например: curl -i "https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61"'
          className="flex-1 bg-transparent text-white outline-none font-mono text-xs placeholder-neutral-600"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-[#007acc] hover:bg-[#0062a3] text-white flex items-center gap-1 font-sans text-xs"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
