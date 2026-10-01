import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Send, 
  Terminal, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { WEATHER_OPENAPI_SPEC_YAML } from '../../data/openApiSample';

export const OpenApiViewer: React.FC<{ theme: 'dark' | 'light'; onOpenPostman: () => void }> = ({
  theme,
  onOpenPostman
}) => {
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WEATHER_OPENAPI_SPEC_YAML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = WEATHER_OPENAPI_SPEC_YAML.split('\n');

  return (
    <div className={`h-full flex flex-col overflow-hidden font-mono text-xs ${
      isDark ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-white text-[#24292f]'
    }`}>
      {/* Top Header */}
      <div className={`px-4 py-2 border-b flex items-center justify-between shrink-0 ${
        isDark ? 'bg-[#252526] border-[#333333]' : 'bg-[#f6f8fa] border-[#d0d7de]'
      }`}>
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-white font-sans text-xs">
            weather_openapi_spec.yaml
          </span>
          <span className="text-[11px] text-neutral-400 font-sans">
            (OpenAPI 3.0.3 Спецификация метеосервиса)
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={onOpenPostman}
            className="flex items-center gap-1 px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Тестировать эндпоинт в Postman</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано' : 'Копировать YAML'}</span>
          </button>
        </div>
      </div>

      {/* Educational notice */}
      <div className="p-3 bg-teal-950/30 border-b border-teal-800/40 text-[11px] text-teal-200 font-sans flex items-start gap-2 shrink-0">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Этот файл представляет собой эталонную машиночитаемую спецификацию <strong>OpenAPI 3.0</strong>. 
          Такие файлы технический писатель коммитит в Git репозиторий. Инструменты Swagger UI и Redoc автоматически 
          рендерят из него интерактивную документацию с кнопкой «Try it out».
        </p>
      </div>

      {/* Code Editor with Line Numbers */}
      <div className="flex-1 overflow-y-auto p-4 flex">
        {/* Line numbers gutter */}
        <div className="pr-4 select-none text-neutral-600 text-right font-mono text-xs border-r border-neutral-800">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code body */}
        <pre className="pl-4 text-xs font-mono text-neutral-200 leading-normal overflow-x-auto whitespace-pre">
          <code>{WEATHER_OPENAPI_SPEC_YAML}</code>
        </pre>
      </div>
    </div>
  );
};
