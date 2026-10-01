export interface MockServerConfig {
  isRunning: boolean;
  port: number;
  baseUrl: string;
  simulatedDelayMs: number;
  forcedStatusCode: number; // 0 = dynamic/auto, 200, 400, 401, 403, 429, 500
  rateLimitMax: number;
  rateLimitRemaining: number;
  requireAuth: boolean;
  authHeaderName: string;
  expectedToken: string;
  enableNoise: boolean; // tiny random variations in temperature/humidity
}

export interface MockServerLog {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  responsePayload: any;
  validatedAgainstSchema: boolean;
}

export const DEFAULT_MOCK_CONFIG: MockServerConfig = {
  isRunning: true,
  port: 8080,
  baseUrl: 'http://localhost:8080/v1',
  simulatedDelayMs: 120,
  forcedStatusCode: 0,
  rateLimitMax: 1000,
  rateLimitRemaining: 987,
  requireAuth: false,
  authHeaderName: 'X-Api-Key',
  expectedToken: 'techwriter_live_mock_key',
  enableNoise: true
};

// Generates dynamic real-time simulated payload for weather
export function processMockServerRequest(
  method: string,
  urlPath: string,
  queryParams: Record<string, string>,
  headers: Record<string, string>,
  bodyContent: string,
  config: MockServerConfig
): {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  schemaValid: boolean;
} {
  // 1. Check Forced Status Code override
  if (config.forcedStatusCode > 0) {
    if (config.forcedStatusCode === 401) {
      return {
        statusCode: 401,
        statusText: 'Unauthorized',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'Bearer realm="WeatherMockAPI"',
          'x-mock-server': 'WeatherEngine/Mock-Live'
        },
        data: {
          error: true,
          status: 401,
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Отсутствует или недействителен ключ аутентификации. Передайте заголовок X-Api-Key или Authorization: Bearer <token>.'
        },
        schemaValid: true
      };
    }
    if (config.forcedStatusCode === 429) {
      return {
        statusCode: 429,
        statusText: 'Too Many Requests',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'retry-after': '60',
          'x-ratelimit-limit': `${config.rateLimitMax}`,
          'x-ratelimit-remaining': '0'
        },
        data: {
          error: true,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Превышен лимит обращений в минуту. Повторите запрос через 60 секунд (заголовок Retry-After).'
        },
        schemaValid: true
      };
    }
    if (config.forcedStatusCode === 500) {
      return {
        statusCode: 500,
        statusText: 'Internal Server Error',
        headers: { 'content-type': 'application/json' },
        data: {
          error: true,
          status: 500,
          code: 'METEOROLOGICAL_ENGINE_FAULT',
          message: 'Внутренний сбой метеорологической модели интерполяции. Лог ошибки передан дежурному инженеру.'
        },
        schemaValid: false
      };
    }
  }

  // 2. Check Auth if enabled in config
  if (config.requireAuth) {
    const passedKey = headers[config.authHeaderName] || headers[config.authHeaderName.toLowerCase()];
    const authHeader = headers['authorization'] || headers['Authorization'];
    const hasValidKey = passedKey === config.expectedToken || (authHeader && authHeader.includes(config.expectedToken));

    if (!hasValidKey) {
      return {
        statusCode: 401,
        statusText: 'Unauthorized',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'www-authenticate': 'ApiKey realm="WeatherMock"',
          'x-mock-server': 'WeatherEngine/Mock-Live'
        },
        data: {
          error: true,
          code: 'INVALID_CREDENTIALS',
          message: `Требуется заголовок ${config.authHeaderName} со значением '${config.expectedToken}'.`
        },
        schemaValid: true
      };
    }
  }

  // 3. Dynamic endpoint routing
  // Endpoint: /v1/forecast or /forecast
  if (urlPath.includes('forecast')) {
    const latStr = queryParams['latitude'];
    const lonStr = queryParams['longitude'];

    // Validation: coordinates required
    if (!latStr || !lonStr) {
      return {
        statusCode: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
        data: {
          error: true,
          code: 'MISSING_REQUIRED_PARAMETERS',
          reason: 'Параметры latitude и longitude обязательны для эндпоинта /v1/forecast.'
        },
        schemaValid: true
      };
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    // Validation: ranges -90..90 and -180..180
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return {
        statusCode: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
        data: {
          error: true,
          code: 'INVALID_COORDINATES',
          reason: `Параметр latitude должен быть в диапазоне [-90, 90]. Передано: ${latStr}`
        },
        schemaValid: true
      };
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return {
        statusCode: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
        data: {
          error: true,
          code: 'INVALID_COORDINATES',
          reason: `Параметр longitude должен быть в диапазоне [-180, 180]. Передано: ${lonStr}`
        },
        schemaValid: true
      };
    }

    // Dynamic temperature synthesis based on latitude & real-time clock
    const now = new Date();
    const hours = now.getHours();
    const diurnalFactor = Math.sin(((hours - 6) / 24) * 2 * Math.PI); // warmer during afternoon
    const baseTemp = 30 - (Math.abs(lat) * 0.55); // equator is warm, poles cold
    const noise = config.enableNoise ? (Math.random() * 2 - 1) : 0;
    let celsiusTemp = +(baseTemp + (diurnalFactor * 4) + noise).toFixed(1);

    // Handle units
    const unitParam = (queryParams['temperature_unit'] || 'celsius').toLowerCase();
    let displayTemp = celsiusTemp;
    let tempUnitLabel = '°C';

    if (unitParam === 'fahrenheit') {
      displayTemp = +((celsiusTemp * 9/5) + 32).toFixed(1);
      tempUnitLabel = '°F';
    }

    // Days calculation
    const daysParam = parseInt(queryParams['forecast_days'] || '7', 10);
    const safeDays = Math.min(16, Math.max(1, isNaN(daysParam) ? 7 : daysParam));

    // Dynamic time series array
    const hourlyTimes: string[] = [];
    const hourlyTemps: number[] = [];
    const hourlyRainProb: number[] = [];

    for (let dayOffset = 0; dayOffset < safeDays; dayOffset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      // Sample 4 intervals per day (00:00, 06:00, 12:00, 18:00)
      [0, 6, 12, 18].forEach(h => {
        const timeStr = `${dateStr}T${h < 10 ? '0' : ''}${h}:00`;
        hourlyTimes.push(timeStr);
        const dayDiurnal = Math.sin(((h - 6) / 24) * 2 * Math.PI);
        const hTemp = +(baseTemp + (dayDiurnal * 4) + (Math.random() * 1.5 - 0.75)).toFixed(1);
        hourlyTemps.push(unitParam === 'fahrenheit' ? +((hTemp * 9/5) + 32).toFixed(1) : hTemp);
        hourlyRainProb.push(Math.round(Math.abs(Math.sin(h * 3)) * 40));
      });
    }

    const payload = {
      latitude: lat,
      longitude: lon,
      generationtime_ms: +(Math.random() * 0.04 + 0.02).toFixed(3),
      utc_offset_seconds: 10800,
      timezone: queryParams['timezone'] || 'auto',
      elevation: Math.round(Math.abs(lat * 3) + 20),
      current_units: {
        time: 'iso8601',
        interval: 'seconds',
        temperature_2m: tempUnitLabel,
        relative_humidity_2m: '%',
        wind_speed_10m: 'km/h'
      },
      current: {
        time: now.toISOString().substring(0, 16),
        interval: 900,
        temperature_2m: displayTemp,
        relative_humidity_2m: Math.min(95, Math.max(30, Math.round(65 + (noise * 5)))),
        apparent_temperature: +(displayTemp - 1.2).toFixed(1),
        precipitation: +(Math.random() > 0.7 ? (Math.random() * 2).toFixed(1) : 0),
        wind_speed_10m: +(Math.random() * 12 + 3).toFixed(1),
        weather_code: displayTemp > 0 ? (displayTemp > 25 ? 0 : 2) : 71
      },
      hourly: {
        time: hourlyTimes,
        temperature_2m: hourlyTemps,
        precipitation_probability: hourlyRainProb
      }
    };

    return {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-cache, live-simulated',
        'x-mock-server': 'WeatherEngine-LiveMock/1.0',
        'x-ratelimit-limit': `${config.rateLimitMax}`,
        'x-ratelimit-remaining': `${config.rateLimitRemaining}`
      },
      data: payload,
      schemaValid: true
    };
  }

  // Endpoint: /v1/locations/search
  if (urlPath.includes('search')) {
    const q = (queryParams['q'] || '').toLowerCase();
    const mockLocations = [
      { name: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173, population: 13000000 },
      { name: 'Saint Petersburg', country: 'Russia', latitude: 59.9343, longitude: 30.3351, population: 5600000 },
      { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, population: 8900000 },
      { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, population: 14000000 },
      { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, population: 3600000 }
    ];

    const results = mockLocations.filter(loc => 
      !q || loc.name.toLowerCase().includes(q) || loc.country.toLowerCase().includes(q)
    );

    return {
      statusCode: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      data: {
        query: queryParams['q'] || '',
        count: results.length,
        results
      },
      schemaValid: true
    };
  }

  // Endpoint: /v1/alerts/subscriptions (POST)
  if (urlPath.includes('subscriptions') || urlPath.includes('webhooks')) {
    if (method !== 'POST') {
      return {
        statusCode: 405,
        statusText: 'Method Not Allowed',
        headers: { 'allow': 'POST', 'content-type': 'application/json' },
        data: { error: true, message: 'Данный эндпоинт поддерживает только метод POST' },
        schemaValid: false
      };
    }

    try {
      const parsed = bodyContent ? JSON.parse(bodyContent) : {};
      return {
        statusCode: 201,
        statusText: 'Created',
        headers: {
          'content-type': 'application/json',
          'location': '/v1/alerts/subscriptions/sub_live_' + Date.now()
        },
        data: {
          subscription_id: 'sub_live_' + Date.now().toString(36),
          status: 'active',
          city: parsed.city || 'CustomCity',
          triggers: parsed.alert_triggers || ['storm_warning'],
          callback_url: parsed.callback_url || 'https://client-listener.com/webhook',
          created_at: new Date().toISOString()
        },
        schemaValid: true
      };
    } catch {
      return {
        statusCode: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
        data: { error: true, code: 'MALFORMED_JSON', message: 'Невалидное тело JSON в теле запроса' },
        schemaValid: false
      };
    }
  }

  // 404 fallback
  return {
    statusCode: 404,
    statusText: 'Not Found',
    headers: { 'content-type': 'application/json' },
    data: {
      error: true,
      status: 404,
      code: 'RESOURCE_NOT_FOUND',
      message: `Эндпоинт '${urlPath}' не зарегистрирован на сервере Mock API. Поддерживаемые пути: /v1/forecast, /v1/locations/search, /v1/alerts/subscriptions`
    },
    schemaValid: false
  };
}
