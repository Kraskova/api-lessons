import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Filter, 
  ArrowDownUp, 
  RefreshCw, 
  Copy, 
  Check, 
  Layers,
  Terminal,
  Info
} from 'lucide-react';

interface NetworkEntry {
  id: string;
  name: string;
  method: string;
  status: number;
  type: string;
  initiator: string;
  size: string;
  time: string;
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  responsePayload: any;
}

const SAMPLE_ENTRIES: NetworkEntry[] = [
  {
    id: 'net-1',
    name: 'forecast?latitude=55.75&longitude=37.61...',
    method: 'GET',
    status: 200,
    type: 'fetch',
    initiator: 'weather-widget.js:42',
    size: '1.2 kB',
    time: '124 ms',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m,relative_humidity_2m&timezone=auto',
    headers: {
      'Request URL': 'https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m,relative_humidity_2m&timezone=auto',
      'Request Method': 'GET',
      'Status Code': '200 OK',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
      'Server': 'open-meteo-edge/2.1'
    },
    queryParams: {
      latitude: '55.7558',
      longitude: '37.6173',
      current: 'temperature_2m,relative_humidity_2m',
      timezone: 'auto'
    },
    responsePayload: {
      latitude: 55.75,
      longitude: 37.625,
      timezone: "Europe/Moscow",
      current: {
        time: "2026-09-30T10:00",
        temperature_2m: 13.6,
        relative_humidity_2m: 72
      }
    }
  },
  {
    id: 'net-2',
    name: 'Saint_Petersburg?format=j1',
    method: 'GET',
    status: 200,
    type: 'fetch',
    initiator: 'city-lookup.ts:18',
    size: '4.8 kB',
    time: '280 ms',
    url: 'https://wttr.in/Saint_Petersburg?format=j1',
    headers: {
      'Request URL': 'https://wttr.in/Saint_Petersburg?format=j1',
      'Request Method': 'GET',
      'Status Code': '200 OK',
      'Content-Type': 'application/json'
    },
    queryParams: {
      format: 'j1'
    },
    responsePayload: {
      current_condition: [
        {
          temp_C: "11",
          weatherDesc: [{ value: "Partly cloudy" }],
          humidity: "81",
          windspeedKmph: "15"
        }
      ]
    }
  },
  {
    id: 'net-3',
    name: 'forecast?latitude=999&longitude=999',
    method: 'GET',
    status: 400,
    type: 'fetch',
    initiator: 'validator.js:105',
    size: '210 B',
    time: '85 ms',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=999&longitude=999',
    headers: {
      'Request URL': 'https://api.open-meteo.com/v1/forecast?latitude=999&longitude=999',
      'Request Method': 'GET',
      'Status Code': '400 Bad Request',
      'Content-Type': 'application/json; charset=utf-8'
    },
    queryParams: {
      latitude: '999',
      longitude: '999'
    },
    responsePayload: {
      error: true,
      reason: "Latitude must be in range of -90 to 90°. Given: 999.0."
    }
  }
];

export const DevToolsInspector: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const isDark = theme === 'dark';
  const [selectedEntry, setSelectedEntry] = useState<NetworkEntry>(SAMPLE_ENTRIES[0]);
  const [detailTab, setDetailTab] = useState<'headers' | 'payload' | 'preview' | 'response'>('headers');
  const [copied, setCopied] = useState(false);

  const handleCopyCurl = () => {
    const curl = `curl -X ${selectedEntry.method} "${selectedEntry.url}"`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`h-full flex flex-col font-sans text-xs select-none ${
      isDark ? 'bg-[#181818] text-[#cccccc]' : 'bg-neutral-100 text-[#24292f]'
    }`}>
      {/* DevTools Top Bar */}
      <div className="h-8 px-3 border-b border-neutral-700/60 bg-[#252526] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white">Chrome DevTools (F12)</span>
          <span className="text-[11px] text-neutral-400 font-mono">/ Network Tab Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-700/50 hover:bg-neutral-600 text-sky-300 text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy as cURL</span>
          </button>
        </div>
      </div>

      {/* Info Callout for Tech Writers */}
      <div className="p-3 bg-sky-950/30 border-b border-sky-800/40 text-[11px] text-sky-200 flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Зачем техписателю Chrome DevTools?</strong> Когда бэкенд обновился без предупреждения, откройте Network вкладку, 
          найдите вызов (Fetch/XHR) и сразу увидите реальные Query-параметры, точные заголовки ответа и статус-коды ошибок!
        </p>
      </div>

      {/* Split Window: Left Requests Table, Right Details Inspector */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden font-mono">
        {/* Left: Request List Table */}
        <div className="w-full md:w-1/2 border-r border-neutral-700/50 flex flex-col overflow-y-auto">
          <div className="bg-[#2d2d2d] text-neutral-400 text-[11px] p-2 border-b border-neutral-700 flex justify-between font-semibold">
            <span>Name ({SAMPLE_ENTRIES.length} requests)</span>
            <span>Status / Size</span>
          </div>

          <div className="divide-y divide-neutral-800">
            {SAMPLE_ENTRIES.map(entry => {
              const isSelected = entry.id === selectedEntry.id;
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`p-2 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    isSelected 
                      ? 'bg-[#007acc]/20 text-white border-l-2 border-[#007acc]' 
                      : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-emerald-400 font-bold mr-1.5">{entry.method}</span>
                    <span className="truncate">{entry.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-1 rounded text-[10px] font-bold ${
                      entry.status === 200 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {entry.status}
                    </span>
                    <span className="text-[11px] text-neutral-500">{entry.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Request & Response Inspector */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto bg-[#181818]">
          {/* Sub-tabs */}
          <div className="flex items-center border-b border-neutral-700 bg-[#252526] text-xs font-sans">
            {(['headers', 'payload', 'preview', 'response'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`px-3 py-1.5 border-b-2 font-medium capitalize transition-colors ${
                  detailTab === tab 
                    ? 'border-sky-400 text-sky-400 font-semibold' 
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-3 text-xs overflow-y-auto space-y-4">
            {detailTab === 'headers' && (
              <div className="space-y-3 font-mono">
                <div>
                  <h5 className="font-sans font-bold text-neutral-400 mb-1 text-[11px] uppercase">General</h5>
                  <div className="pl-2 border-l border-neutral-700 space-y-1 text-neutral-300">
                    <div><strong>Request URL:</strong> <span className="text-sky-300 break-all">{selectedEntry.url}</span></div>
                    <div><strong>Request Method:</strong> <span className="text-emerald-400">{selectedEntry.method}</span></div>
                    <div><strong>Status Code:</strong> <span className={selectedEntry.status === 200 ? 'text-emerald-400' : 'text-amber-400'}>{selectedEntry.status}</span></div>
                  </div>
                </div>

                <div>
                  <h5 className="font-sans font-bold text-neutral-400 mb-1 text-[11px] uppercase">Response Headers</h5>
                  <div className="pl-2 border-l border-neutral-700 space-y-1 text-neutral-300">
                    {Object.entries(selectedEntry.headers).map(([k, v]) => (
                      <div key={k} className="break-all">
                        <strong className="text-neutral-400">{k}:</strong> {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'payload' && (
              <div>
                <h5 className="font-sans font-bold text-neutral-400 mb-2 text-[11px] uppercase">
                  Query String Parameters
                </h5>
                <div className="space-y-1.5 font-mono">
                  {Object.entries(selectedEntry.queryParams).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-sky-400 font-semibold">{k}:</span>
                      <span className="text-amber-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(detailTab === 'preview' || detailTab === 'response') && (
              <div>
                <pre className="p-3 rounded bg-black/40 border border-neutral-800 text-sky-200 overflow-x-auto font-mono text-xs leading-relaxed">
                  <code>{JSON.stringify(selectedEntry.responsePayload, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
