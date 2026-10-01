export interface ApiResponseLogItem {
  id: string;
  timestamp: number;
  source: 'postman' | 'mock_server' | 'terminal' | 'system';
  method: string;
  url: string;
  statusCode: number;
  statusText: string;
  timeMs: number;
  sizeKb?: number;
  requestHeaders?: Record<string, string>;
  queryParams?: Record<string, string>;
  requestBody?: string | any;
  responseHeaders?: Record<string, string>;
  responseBody: any;
}

type LoggerListener = (logs: ApiResponseLogItem[]) => void;

const STORAGE_KEY = 'techwriter_api_response_logs_v1';

// Seed with realistic initial logs so students immediately see past inspection entries
const INITIAL_LOGS: ApiResponseLogItem[] = [
  {
    id: 'log-seed-1',
    timestamp: Date.now() - 120000,
    source: 'mock_server',
    method: 'GET',
    url: 'http://localhost:8080/v1/forecast?latitude=55.7558&longitude=37.6173&temperature_unit=celsius',
    statusCode: 200,
    statusText: 'OK',
    timeMs: 112,
    sizeKb: 0.85,
    queryParams: { latitude: '55.7558', longitude: '37.6173', temperature_unit: 'celsius' },
    requestHeaders: { 'accept': 'application/json', 'user-agent': 'TechWriter-Simulator/2.0' },
    responseHeaders: { 'content-type': 'application/json; charset=utf-8', 'x-server': 'WeatherMockEngine/1.0' },
    responseBody: {
      latitude: 55.7558,
      longitude: 37.6173,
      timezone: 'Europe/Moscow',
      current: {
        time: new Date().toISOString(),
        temperature_2m: 14.8,
        relative_humidity_2m: 65,
        wind_speed_10m: 5.2,
        weather_code: 2
      }
    }
  },
  {
    id: 'log-seed-2',
    timestamp: Date.now() - 65000,
    source: 'postman',
    method: 'GET',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m',
    statusCode: 200,
    statusText: 'OK',
    timeMs: 184,
    sizeKb: 0.42,
    queryParams: { latitude: '55.7558', longitude: '37.6173', current: 'temperature_2m' },
    requestHeaders: { 'accept': 'application/json', 'user-agent': 'TechWriter-Course-Student/1.0' },
    responseHeaders: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=900' },
    responseBody: {
      latitude: 55.7558,
      longitude: 37.6173,
      generationtime_ms: 0.082,
      utc_offset_seconds: 0,
      timezone: 'GMT',
      current: {
        time: new Date().toISOString(),
        interval: 900,
        temperature_2m: 15.2
      }
    }
  },
  {
    id: 'log-seed-3',
    timestamp: Date.now() - 30000,
    source: 'postman',
    method: 'GET',
    url: 'https://api.weatherapi.com/v1/current.json?q=Tokyo',
    statusCode: 401,
    statusText: 'Unauthorized',
    timeMs: 92,
    sizeKb: 0.22,
    requestHeaders: { 'X-Api-Key': 'tw_sample_key_9948271', 'Accept': 'application/json' },
    responseHeaders: { 'content-type': 'application/json', 'server': 'Kestrel' },
    responseBody: {
      error: {
        code: 2006,
        message: 'API key is invalid or not provided. Please provide a valid key in header or query parameter.'
      }
    }
  }
];

class ApiResponseLoggerService {
  private logs: ApiResponseLogItem[] = [];
  private listeners: Set<LoggerListener> = new Set();

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.logs = parsed;
          return;
        }
      }
    } catch {}
    this.logs = INITIAL_LOGS;
  }

  private saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(0, 100)));
    } catch {}
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb([...this.logs]));
  }

  public getLogs(): ApiResponseLogItem[] {
    return [...this.logs];
  }

  public log(entry: Omit<ApiResponseLogItem, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) {
    const newLog: ApiResponseLogItem = {
      ...entry,
      id: entry.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: entry.timestamp || Date.now()
    };

    this.logs = [newLog, ...this.logs.slice(0, 99)];
    this.saveLogs();
  }

  public clear() {
    this.logs = [];
    this.saveLogs();
  }

  public subscribe(listener: LoggerListener): () => void {
    this.listeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const apiResponseLogger = new ApiResponseLoggerService();
