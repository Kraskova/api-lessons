import { PostmanRequest } from '../types/course';

export const WEATHER_PRESETS: PostmanRequest[] = [
  {
    id: 'open-meteo-current',
    name: '1. Текущая погода в Москве (Open-Meteo)',
    method: 'GET',
    url: 'https://api.open-meteo.com/v1/forecast',
    params: [
      { id: 'p1', key: 'latitude', value: '55.7558', description: 'Широта локации (Москва: 55.7558)', enabled: true },
      { id: 'p2', key: 'longitude', value: '37.6173', description: 'Долгота локации (Москва: 37.6173)', enabled: true },
      { id: 'p3', key: 'current', value: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m', description: 'Список метеорологических переменных', enabled: true },
      { id: 'p4', key: 'timezone', value: 'Europe/Moscow', description: 'Часовой пояс для временных меток', enabled: true },
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', description: 'Ожидаемый MIME-тип ответа', enabled: true },
      { id: 'h2', key: 'User-Agent', value: 'TechWriter-Course-Student/1.0', description: 'Идентификатор клиента', enabled: true },
    ],
    authType: 'none',
    bodyType: 'none',
    bodyContent: '',
    description: 'Базовый запрос текущей погоды без необходимости API-ключа. Идеален для изучения параметров запроса (Query Params) и структуры JSON ответа.'
  },
  {
    id: 'open-meteo-forecast-hourly',
    name: '2. Почасовой прогноз на 3 дня (Open-Meteo)',
    method: 'GET',
    url: 'https://api.open-meteo.com/v1/forecast',
    params: [
      { id: 'p1', key: 'latitude', value: '59.9343', description: 'Широта (Санкт-Петербург: 59.9343)', enabled: true },
      { id: 'p2', key: 'longitude', value: '30.3351', description: 'Долгота (Санкт-Петербург: 30.3351)', enabled: true },
      { id: 'p3', key: 'hourly', value: 'temperature_2m,precipitation_probability,weather_code', description: 'Почасовые ряды данных', enabled: true },
      { id: 'p4', key: 'forecast_days', value: '3', description: 'Количество дней прогноза (от 1 до 16)', enabled: true },
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', description: 'Ожидаемый MIME-тип ответа', enabled: true },
    ],
    authType: 'none',
    bodyType: 'none',
    bodyContent: '',
    description: 'Демонстрация массивов временных рядов (Time-series arrays) в ответе API и параметров фильтрации дней.'
  },
  {
    id: 'wttr-city-json',
    name: '3. Погодная сводка города (wttr.in/JSON)',
    method: 'GET',
    url: 'https://wttr.in/Saint_Petersburg',
    params: [
      { id: 'p1', key: 'format', value: 'j1', description: 'Формат j1 возвращает подробный JSON объект', enabled: true },
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', description: 'Запрос JSON формата', enabled: true },
    ],
    authType: 'none',
    bodyType: 'none',
    bodyContent: '',
    description: 'Пример Path-параметра (город в пути URL) и глубоко вложенной структуры JSON с локализацией и лунными фазами.'
  },
  {
    id: 'auth-header-test',
    name: '4. Аутентификация через Header (X-Api-Key)',
    method: 'GET',
    url: 'https://api.weatherapi.com/v1/current.json',
    params: [
      { id: 'p1', key: 'q', value: 'Tokyo', description: 'Запрос города (Tokyo)', enabled: true },
    ],
    headers: [
      { id: 'h1', key: 'X-Api-Key', value: 'tw_sample_key_9948271', description: 'Ключ доступа в заголовке', enabled: true },
      { id: 'h2', key: 'Accept', value: 'application/json', description: 'JSON', enabled: true },
    ],
    authType: 'apiKeyHeader',
    authKey: 'X-Api-Key',
    authValue: 'tw_sample_key_9948271',
    bodyType: 'none',
    bodyContent: '',
    description: 'Демонстрация передачи API Key через Header вместо URL. Важный аспект безопасности, который описывает технический писатель.'
  },
  {
    id: 'error-bad-coordinates',
    name: '5. Ошибка валидации 400 Bad Request',
    method: 'GET',
    url: 'https://api.open-meteo.com/v1/forecast',
    params: [
      { id: 'p1', key: 'latitude', value: '999.0', description: 'Некорректная широта (> 90 градусов)', enabled: true },
      { id: 'p2', key: 'longitude', value: '500.0', description: 'Некорректная долгота (> 180 градусов)', enabled: true },
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', description: 'JSON', enabled: true },
    ],
    authType: 'none',
    bodyType: 'none',
    bodyContent: '',
    description: 'Как выглядит реальная ошибка 400 при передаче невалидных параметров. В документации техписатель обязан описать формат тела ошибки!'
  },
  {
    id: 'post-weather-alert',
    name: '6. Создание подписки на шторм (POST с JSON Body)',
    method: 'POST',
    url: 'https://api.weather-alerts.simulation/v1/webhooks',
    params: [],
    headers: [
      { id: 'h1', key: 'Content-Type', value: 'application/json', description: 'Формат отправляемого тела', enabled: true },
      { id: 'h2', key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.course_token', description: 'JWT Bearer token', enabled: true },
    ],
    authType: 'bearer',
    authValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.course_token',
    bodyType: 'json',
    bodyContent: JSON.stringify(
      {
        city: 'Novosibirsk',
        coordinates: {
          lat: 55.0084,
          lon: 82.9357
        },
        alert_triggers: ['storm_warning', 'extreme_cold'],
        temperature_threshold_celsius: -25,
        callback_url: 'https://my-company.com/api/weather-listener',
        active: true
      },
      null,
      2
    ),
    description: 'Пример создания ресурса методом POST. Изучаем документирование Request Body: типы, вложенные объекты, массивы строк.'
  },
  {
    id: 'mock-server-live',
    name: '7. Mock Server: Живая симуляция (localhost:8080)',
    method: 'GET',
    url: 'http://localhost:8080/v1/forecast',
    params: [
      { id: 'p1', key: 'latitude', value: '55.7558', description: 'Широта (Москва)', enabled: true },
      { id: 'p2', key: 'longitude', value: '37.6173', description: 'Долгота (Москва)', enabled: true },
      { id: 'p3', key: 'temperature_unit', value: 'celsius', description: 'Единица измерения (celsius | fahrenheit)', enabled: true },
      { id: 'p4', key: 'forecast_days', value: '5', description: 'Дней прогноза (1-16)', enabled: true },
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', description: 'JSON', enabled: true },
      { id: 'h2', key: 'X-Api-Key', value: 'techwriter_live_mock_key', description: 'Тестовый ключ', enabled: true },
    ],
    authType: 'none',
    bodyType: 'none',
    bodyContent: '',
    description: 'Прямой вызов к встроенному API Mock Server. Возвращает динамически вычисленные погодные таймсерии в реальном времени с поддержкой задержек сети и симуляции ошибок.'
  }
];
