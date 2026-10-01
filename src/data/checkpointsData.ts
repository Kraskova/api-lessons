import { KnowledgeCheckpoint } from '../types/course';

export const KNOWLEDGE_CHECKPOINTS: Record<string, KnowledgeCheckpoint> = {
  'idempotence-get-tf': {
    id: 'idempotence-get-tf',
    type: 'true_false',
    concept: 'Архитектура REST: Безопасность и идемпотентность GET',
    statement: 'Метод HTTP GET является "безопасным" (safe) и "идемпотентным" (idempotent): его многократный повторный вызов гарантированно не изменяет состояние данных на сервере и предназначен только для чтения.',
    codeSnippet: 'GET /v1/forecast?latitude=55.75&longitude=37.61 HTTP/1.1\nHost: api.open-meteo.com\n// Безопасный запрос: только возвращает данные',
    isTrue: true,
    explanation: 'Верно! В архитектуре REST метод GET предназначен исключительно для безопасного получения ресурса. Изменение состояния (создание, удаление, редактирование) обязательно должно производиться методами POST, PUT, PATCH или DELETE.',
    techWriterInsight: 'Никогда не пропускайте в документации эндпоинты вроде GET /api/delete-item?id=5 — это грубое нарушение RESTful-стандартов и уязвимость безопасности.'
  },

  'param-locations-dragdrop': {
    id: 'param-locations-dragdrop',
    type: 'drag_drop',
    concept: 'Локации параметров запроса (Query, Path, Header, Body)',
    instruction: 'Распределите фрагменты параметров по правильным зонам HTTP-запроса:',
    zones: [
      { id: 'header', title: 'HTTP Header', description: 'Заголовки и метаданные' },
      { id: 'query', title: 'Query Param', description: 'Параметры в URL после ?' },
      { id: 'path', title: 'Path Param', description: 'Переменная в пути URI' },
      { id: 'body', title: 'Request Body', description: 'Тело JSON для POST/PUT' }
    ],
    items: [
      { id: 'item-1', label: 'Authorization: Bearer eyJhb...', category: 'header' },
      { id: 'item-2', label: '?forecast_days=7&units=metric', category: 'query' },
      { id: 'item-3', label: '/v1/cities/{city_id}/weather', category: 'path' },
      { id: 'item-4', label: '{"alert_trigger": "storm"}', category: 'body' }
    ],
    explanation: 'Отлично! Вы безошибочно сопоставили все 4 ключевые локации параметров, которые технический писатель указывает в спецификации OpenAPI (in: query, in: path, in: header, requestBody).',
    techWriterInsight: 'В сводной таблице параметров эндпоинта всегда делайте колонку "Расположение" (Location) одной из первых — разработчикам критично знать, куда именно подставлять значение.'
  },

  'auth-header-vs-query': {
    id: 'auth-header-vs-query',
    type: 'true_false',
    concept: 'Аутентификация API: Заголовки против строки URL',
    statement: 'Передача секретного API-ключа в HTTP-заголовке (например, X-Api-Key или Authorization) считается безопаснее, чем передача через Query-параметр в URL (например, ?api_key=secret), потому что URL сохраняются в логах прокси-серверов, шлюзов и истории браузера.',
    codeSnippet: 'GET /v1/forecast HTTP/1.1\nHost: api.weather.com\nX-Api-Key: sec_live_9948271   <-- В заголовке (не пишется в access.log)',
    isTrue: true,
    explanation: 'Верно! Полные URL-адреса логируются веб-серверами (Nginx, Apache), кэширующими CDN, балансировщиками нагрузки и сохраняются в истории браузера. Заголовки HTTP в стандартные логи не попадают, что предотвращает утечку секретных ключей.',
    techWriterInsight: 'В документации всегда рекомендуйте заголовочную аутентификацию как приоритетную (Best Practice) и явно предупреждайте о рисках query-ключей.'
  },

  'auth-types-dragdrop': {
    id: 'auth-types-dragdrop',
    type: 'drag_drop',
    concept: 'Механизмы аутентификации API',
    instruction: 'Соотнесите формат учетных данных с типом аутентификации:',
    zones: [
      { id: 'bearer', title: 'Bearer Token (OAuth 2.0 / JWT)', description: 'Временный токен доступа' },
      { id: 'apikey', title: 'API Key (Ключ доступа)', description: 'Статический ключ сервиса' },
      { id: 'basic', title: 'HTTP Basic Auth', description: 'Base64 логин:пароль' }
    ],
    items: [
      { id: 'a-1', label: 'Authorization: Bearer eyJhbGciOi...', category: 'bearer' },
      { id: 'a-2', label: 'X-Api-Key: tw_live_98124', category: 'apikey' },
      { id: 'a-3', label: 'Authorization: Basic dXNlcjpwYXNz', category: 'basic' },
      { id: 'a-4', label: '?appid=tw_public_weather_key', category: 'apikey' }
    ],
    explanation: 'Супер! Вы четко различаете Bearer-токены (часто используются с ограничением по времени жизни TTL), статические API Keys и классический Basic Auth.',
    techWriterInsight: 'Всегда давайте готовый пример cURL команды с флагом -H для каждого типа авторизации в вводном руководстве (Quickstart).'
  },

  'json-schema-required-tf': {
    id: 'json-schema-required-tf',
    type: 'true_false',
    concept: 'JSON Schema: Правило объявления обязательных полей',
    statement: 'В спецификации JSON Schema (и OpenAPI 3.0) обязательные поля объявляются ключевым словом "required: true" прямо внутри описания каждого дочернего свойства.',
    codeSnippet: '// Частая ошибка:\n"properties": {\n  "latitude": {\n    "type": "number",\n    "required": true  <-- ОШИБКА ВАЛИДАЦИИ!\n  }\n}',
    isTrue: false,
    explanation: 'Неверно! В стандарте JSON Schema и OpenAPI 3.0 свойство required объявляется на уровне родительского объекта как массив строк с именами обязательных полей: required: ["latitude", "longitude"]. Использование "required: true" внутри свойства является синтаксической ошибкой!',
    techWriterInsight: 'Используйте валидаторы Spectral и Redocly для проверки документации — они сразу ловят неправильно размещенный required.'
  },

  'json-schema-types-dragdrop': {
    id: 'json-schema-types-dragdrop',
    type: 'drag_drop',
    concept: 'JSON Schema: Сопоставление типов данных',
    instruction: 'Сопоставьте типы схемы с реальными значениями метеорологического ответа:',
    zones: [
      { id: 'string', title: '"type": "string"', description: 'Текстовые строки' },
      { id: 'number', title: '"type": "number"', description: 'Дробные числа' },
      { id: 'integer', title: '"type": "integer"', description: 'Целые числа' },
      { id: 'array', title: '"type": "array"', description: 'Массивы / списки' }
    ],
    items: [
      { id: 'j-1', label: '"Europe/Moscow"', category: 'string' },
      { id: 'j-2', label: '14.85', category: 'number' },
      { id: 'j-3', label: '1013', category: 'integer' },
      { id: 'j-4', label: '[12.1, 14.5, 18.0]', category: 'array' }
    ],
    explanation: 'Отличная работа! Различие между целыми (integer) и числами с плавающей точкой (number) критично для технического писателя при документировании кодов WMO и температуры.',
    techWriterInsight: 'Если поле может быть null, не забывайте указывать nullable: true в OpenAPI 3.0 или type: ["string", "null"] в JSON Schema.'
  },

  'curl-flags-tf': {
    id: 'curl-flags-tf',
    type: 'true_false',
    concept: 'Утилита cURL: Флаги инспекции запросов',
    statement: 'Флаг "-i" (или "--include") в команде cURL выводит HTTP-заголовки ответа сервера вместе с телом, а флаг "-d" (или "--data") передает тело запроса и автоматически переключает метод на POST.',
    codeSnippet: 'curl -i -X POST "https://api.weather.com/v1/alerts" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"city":"Moscow"}\'',
    isTrue: true,
    explanation: 'Верно! Флаг -i крайне важен для техписателя, так как позволяет увидеть статус-код ответа, Content-Type, заголовки лимитов (Rate-Limit) и кэширования. Флаг -d передает данные и неявно задает метод POST.',
    techWriterInsight: 'В документации всегда оформляйте многострочные cURL-команды с обратными слэшами (\\) для удобного копирования в один клик.'
  },

  'status-codes-dragdrop': {
    id: 'status-codes-dragdrop',
    type: 'drag_drop',
    concept: 'HTTP Статус-коды: Семантика классов ответов',
    instruction: 'Распределите коды по классам ответственности:',
    zones: [
      { id: '2xx', title: '2xx (Успех)', description: 'Запрос успешно обработан' },
      { id: '4xx', title: '4xx (Ошибка клиента)', description: 'Проблема на стороне клиента' },
      { id: '5xx', title: '5xx (Ошибка сервера)', description: 'Сбой бэкенда или шлюза' }
    ],
    items: [
      { id: 's-1', label: '200 OK (Успех)', category: '2xx' },
      { id: 's-2', label: '400 Bad Request (Ошибка координат)', category: '4xx' },
      { id: 's-3', label: '401 Unauthorized (Нет ключа)', category: '4xx' },
      { id: 's-4', label: '429 Too Many Requests (Превышен лимит)', category: '4xx' },
      { id: 's-5', label: '500 Internal Error (Ошибка бэкенда)', category: '5xx' },
      { id: 's-6', label: '503 Service Unavailable (Перегрузка)', category: '5xx' }
    ],
    explanation: 'Превосходно! 4xx требует действий от пользователя/разработчика для исправления запроса, в то время как 5xx сигнализирует о внутренней проблеме сервера.',
    techWriterInsight: 'В документации для каждого кода ошибки обязательно приводите пример JSON-структуры сообщения об ошибке.'
  },

  'openapi-components-tf': {
    id: 'openapi-components-tf',
    type: 'true_false',
    concept: 'Спецификация OpenAPI 3.0: Реиспользование схем ($ref)',
    statement: 'Конструкция $ref: "#/components/schemas/WeatherCurrent" позволяет переиспользовать единое описание модели данных в нескольких эндпоинтах, предотвращая дублирование и рассинхронизацию документации.',
    codeSnippet: 'responses:\n  \'200\':\n    description: Успешный ответ\n    content:\n      application/json:\n        schema:\n          $ref: \'#/components/schemas/WeatherCurrent\'',
    isTrue: true,
    explanation: 'Абсолютно верно! Принцип DRY (Don\'t Repeat Yourself) в спецификациях OpenAPI реализуется через секцию components.schemas и ссылки $ref. Изменение схемы в одном месте автоматически обновляет все зависимые эндпоинты.',
    techWriterInsight: 'Регулярно проверяйте валидность путей $ref: сломанная ссылка сделает Swagger UI или Redoc неработоспособными.'
  }
};
