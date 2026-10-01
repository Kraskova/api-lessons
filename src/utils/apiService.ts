import { PostmanRequest, PostmanResponse } from '../types/course';
import { processMockServerRequest, DEFAULT_MOCK_CONFIG } from './mockServerEngine';
import { apiResponseLogger } from './responseLogger';

async function executeApiRequestInternal(req: PostmanRequest): Promise<PostmanResponse> {
  const startTime = performance.now();

  // Build target URL with enabled query params
  let targetUrl = req.url;
  const activeParams = req.params.filter(p => p.enabled && p.key.trim().length > 0);
  
  if (req.authType === 'apiKeyQuery' && req.authKey && req.authValue) {
    activeParams.push({
      id: 'auth_q',
      key: req.authKey,
      value: req.authValue,
      description: 'Auth key',
      enabled: true
    });
  }

  if (activeParams.length > 0) {
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    activeParams.forEach(p => {
      urlObj.searchParams.set(p.key, p.value);
    });
    targetUrl = urlObj.toString();
  }

  // Build headers
  const headersRecord: Record<string, string> = {};
  req.headers.filter(h => h.enabled && h.key.trim().length > 0).forEach(h => {
    headersRecord[h.key] = h.value;
  });

  if (req.authType === 'apiKeyHeader' && req.authKey && req.authValue) {
    headersRecord[req.authKey] = req.authValue;
  } else if (req.authType === 'bearer' && req.authValue) {
    headersRecord['Authorization'] = `Bearer ${req.authValue}`;
  }

  // Handle requests to the API Mock Server (localhost:8080 or mock-weather)
  if (targetUrl.includes('localhost:8080') || targetUrl.includes('mock-weather')) {
    try {
      const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `http://${targetUrl}`);
      const queryObj: Record<string, string> = {};
      urlObj.searchParams.forEach((v, k) => { queryObj[k] = v; });

      // Simulate network latency
      await new Promise(r => setTimeout(r, DEFAULT_MOCK_CONFIG.simulatedDelayMs || 100));

      const mockRes = processMockServerRequest(
        req.method,
        urlObj.pathname,
        queryObj,
        headersRecord,
        req.bodyContent,
        DEFAULT_MOCK_CONFIG
      );

      const elapsed = Math.round(performance.now() - startTime);
      const size = +(JSON.stringify(mockRes.data).length / 1024).toFixed(2);

      return {
        status: mockRes.statusCode,
        statusText: mockRes.statusText,
        timeMs: elapsed,
        sizeKb: size || 0.4,
        headers: mockRes.headers,
        data: mockRes.data
      };
    } catch (e: any) {
      return {
        status: 500,
        statusText: 'Mock Server Error',
        timeMs: 20,
        sizeKb: 0.1,
        headers: { 'content-type': 'application/json' },
        data: { error: true, message: e.message }
      };
    }
  }

  // Handle special simulated endpoints
  if (targetUrl.includes('weather-alerts.simulation')) {
    const elapsed = Math.round(performance.now() - startTime) + 120;
    try {
      const parsedBody = req.bodyContent ? JSON.parse(req.bodyContent) : {};
      return {
        status: 201,
        statusText: 'Created',
        timeMs: elapsed,
        sizeKb: 0.42,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-limit': '100',
          'x-ratelimit-remaining': '99',
          'location': '/v1/webhooks/sub_99418241',
          'server': 'WeatherAlerts-Gateway/3.2'
        },
        data: {
          subscription_id: 'sub_99418241',
          status: 'active',
          city: parsedBody.city || 'Novosibirsk',
          registered_at: new Date().toISOString(),
          webhook_url: parsedBody.callback_url || 'https://my-company.com/api/weather-listener',
          triggers: parsedBody.alert_triggers || ['storm_warning'],
          message: 'Подписка на погодные предупреждения успешно зарегистрирована'
        }
      };
    } catch {
      return {
        status: 400,
        statusText: 'Bad Request',
        timeMs: elapsed,
        sizeKb: 0.18,
        headers: { 'content-type': 'application/json' },
        data: {
          error: true,
          code: 'INVALID_JSON_BODY',
          message: 'Невалидное тело запроса: ожидался корректный JSON объект с полями city и callback_url'
        }
      };
    }
  }

  // Handle 401 simulation for WeatherAPI key test
  if (targetUrl.includes('weatherapi.com') && req.authKey === 'X-Api-Key' && req.authValue?.includes('sample_key')) {
    const elapsed = Math.round(performance.now() - startTime) + 85;
    return {
      status: 401,
      statusText: 'Unauthorized',
      timeMs: elapsed,
      sizeKb: 0.22,
      headers: {
        'content-type': 'application/json',
        'server': 'Kestrel',
        'x-powered-by': 'ASP.NET',
        'date': new Date().toUTCString()
      },
      data: {
        error: {
          code: 2006,
          message: 'API key is invalid or not provided. Please provide a valid key in header or query parameter.'
        }
      }
    };
  }

  // Real fetch attempt with fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headersRecord,
      signal: controller.signal
    };

    if (req.method !== 'GET' && req.bodyType === 'json' && req.bodyContent) {
      fetchOptions.body = req.bodyContent;
    }

    const res = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeoutId);

    const elapsed = Math.round(performance.now() - startTime);
    const contentType = res.headers.get('content-type') || '';
    
    let responseData: any;
    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      responseData = await res.json();
    } else {
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const size = +(JSON.stringify(responseData).length / 1024).toFixed(2);

    return {
      status: res.status,
      statusText: res.statusText || (res.status === 200 ? 'OK' : 'Response'),
      timeMs: elapsed,
      sizeKb: size || 0.5,
      headers: responseHeaders,
      data: responseData
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);

    // If Open-Meteo requested but network had CORS or network error, provide realistic data
    if (targetUrl.includes('open-meteo.com')) {
      // Check if coordinates were invalid (e.g. 999)
      if (targetUrl.includes('999')) {
        return {
          status: 400,
          statusText: 'Bad Request',
          timeMs: elapsed + 40,
          sizeKb: 0.15,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'server': 'open-meteo-edge',
            'date': new Date().toUTCString()
          },
          data: {
            error: true,
            reason: 'Latitude must be in range of -90 to 90°. Given: 999.0.'
          }
        };
      }

      return {
        status: 200,
        statusText: 'OK',
        timeMs: elapsed > 0 ? elapsed : 115,
        sizeKb: 1.24,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=900',
          'server': 'open-meteo-worker'
        },
        data: {
          latitude: 55.75,
          longitude: 37.62,
          generationtime_ms: 0.052,
          utc_offset_seconds: 10800,
          timezone: 'Europe/Moscow',
          timezone_abbreviation: 'MSK',
          elevation: 144.0,
          current_units: {
            time: 'iso8601',
            interval: 'seconds',
            temperature_2m: '°C',
            relative_humidity_2m: '%',
            apparent_temperature: '°C',
            precipitation: 'mm',
            wind_speed_10m: 'km/h'
          },
          current: {
            time: new Date().toISOString().substring(0, 16),
            interval: 900,
            temperature_2m: 14.8,
            relative_humidity_2m: 68,
            apparent_temperature: 13.9,
            precipitation: 0.0,
            wind_speed_10m: 7.2
          }
        }
      };
    }

    return {
      status: 0,
      statusText: 'Network / CORS Error',
      timeMs: elapsed,
      sizeKb: 0,
      headers: {},
      data: null,
      error: `Не удалось выполнить сетевой запрос: ${err.message || 'Сетевая ошибка или блокировка CORS'}. Используйте встроенные шаблоны или проверьте адрес URL.`
    };
  }
}

export async function executeApiRequest(req: PostmanRequest): Promise<PostmanResponse> {
  const response = await executeApiRequestInternal(req);

  // Extract query params for logging
  const queryParamsRecord: Record<string, string> = {};
  req.params.filter(p => p.enabled && p.key.trim().length > 0).forEach(p => {
    queryParamsRecord[p.key] = p.value;
  });

  const headersRecord: Record<string, string> = {};
  req.headers.filter(h => h.enabled && h.key.trim().length > 0).forEach(h => {
    headersRecord[h.key] = h.value;
  });

  const isMock = req.url.includes('localhost:8080') || req.url.includes('mock-weather');

  apiResponseLogger.log({
    source: isMock ? 'mock_server' : 'postman',
    method: req.method,
    url: req.url,
    statusCode: response.status,
    statusText: response.statusText,
    timeMs: response.timeMs,
    sizeKb: response.sizeKb,
    requestHeaders: headersRecord,
    queryParams: queryParamsRecord,
    requestBody: req.bodyContent,
    responseHeaders: response.headers,
    responseBody: response.data || { error: response.error }
  });

  return response;
}

/**
 * Generate Markdown Table documentation for response fields automatically
 */
export function generateSchemaMarkdown(data: any): string {
  if (!data || typeof data !== 'object') {
    return `| Поле | Тип | Описание |\n| :--- | :--- | :--- |\n| - | ${typeof data} | Примитивное значение |`;
  }

  const rows: string[] = [
    '| Поле | Тип | Пример | Описание для документации |',
    '| :--- | :--- | :--- | :--- |'
  ];

  function inspectObject(obj: any, prefix = '') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      let typeStr: string = typeof val;

      if (Array.isArray(val)) {
        typeStr = `array<${val.length > 0 ? typeof val[0] : 'any'}>`;
        rows.push(`| \`${fullKey}\` | \`${typeStr}\` | \`[...]\` | Список элементов ${key} |`);
      } else if (val === null) {
        rows.push(`| \`${fullKey}\` | \`null\` | \`null\` | Поле ${key} (nullable) |`);
      } else if (typeStr === 'object') {
        rows.push(`| \`${fullKey}\` | \`object\` | \`{...}\` | Объект с параметрами ${key} |`);
        inspectObject(val, fullKey);
      } else {
        const example = typeof val === 'string' ? `"${val.length > 25 ? val.substring(0, 22) + '...' : val}"` : `${val}`;
        rows.push(`| \`${fullKey}\` | \`${typeStr}\` | \`${example}\` | Значение ${key} |`);
      }
    }
  }

  inspectObject(data);
  return rows.join('\n');
}

/**
 * Generate cURL snippet from request
 */
export function generateCurlSnippet(req: PostmanRequest): string {
  const activeParams = req.params.filter(p => p.enabled && p.key.trim().length > 0);
  let url = req.url;

  if (activeParams.length > 0) {
    const qs = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    url += (url.includes('?') ? '&' : '?') + qs;
  }

  const parts = [`curl -X ${req.method} "${url}"`];

  req.headers.filter(h => h.enabled && h.key.trim().length > 0).forEach(h => {
    parts.push(`  -H "${h.key}: ${h.value}"`);
  });

  if (req.authType === 'apiKeyHeader' && req.authKey && req.authValue) {
    parts.push(`  -H "${req.authKey}: ${req.authValue}"`);
  } else if (req.authType === 'bearer' && req.authValue) {
    parts.push(`  -H "Authorization: Bearer ${req.authValue}"`);
  }

  if (req.method !== 'GET' && req.bodyType === 'json' && req.bodyContent) {
    const cleanBody = req.bodyContent.replace(/"/g, '\\"').replace(/\n/g, '');
    parts.push(`  -d "${cleanBody}"`);
  }

  return parts.join(' \\\n');
}
