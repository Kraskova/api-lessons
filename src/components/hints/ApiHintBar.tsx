import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Code,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { CourseModule } from '../../types/course';

interface ApiHint {
  id: string;
  category: 'Безопасность' | 'HTTP Коды' | 'REST Стандарты' | 'Форматирование' | 'OpenAPI 3.0' | 'Best Practice';
  text: string;
  templateSnippet?: string;
  docRecommendation: string;
}

const MODULE_HINTS: Record<string, ApiHint[]> = {
  // Module 1: Архитектура REST и HTTP
  'mod-1': [
    {
      id: 'm1-1',
      category: 'REST Стандарты',
      text: 'Метод GET должен быть строго идемпотентным и безопасным (safe): никогда не документируйте эндпоинты, удаляющие или меняющие данные через GET.',
      docRecommendation: 'Всегда указывайте гарантию неизменности состояния: «Вызов данного метода является безопасным и предназначен исключительно для чтения».',
      templateSnippet: '### Метод: GET\n- **Идемпотентность:** Да\n- **Изменение данных:** Нет (только чтение)'
    },
    {
      id: 'm1-2',
      category: 'HTTP Коды',
      text: 'Не забудьте описать статус 404 (Not Found) и 500 (Internal Server Error) даже для простых эндпоинтов чтения.',
      docRecommendation: 'Если запрашиваемый город или метеостанция не найдены в базе, сервер должен вернуть 404 с внятным JSON сообщением.',
      templateSnippet: '### Коды ответов\n| Код | Описание |\n| :--- | :--- |\n| `200 OK` | Данные успешно получены |\n| `404 Not Found` | Город с указанными координатами не найден |'
    }
  ],

  // Module 2: Эндпоинты и методы
  'mod-2': [
    {
      id: 'm2-1',
      category: 'REST Стандарты',
      text: 'Используйте существительные во множественном числе в URI эндпоинтов (например: /v1/cities, а не /v1/getCity).',
      docRecommendation: 'В REST URI идентифицирует ресурс, а действие определяется HTTP-методом (GET, POST, DELETE).',
      templateSnippet: 'GET /v1/forecasts/{id}\nDELETE /v1/forecasts/{id}'
    },
    {
      id: 'm2-2',
      category: 'HTTP Коды',
      text: 'Для операций создания ресурса (POST) всегда документируйте статус 201 Created вместе с заголовком Location.',
      docRecommendation: 'В заголовке Location сервер возвращает URI созданного ресурса для последующего чтения.',
      templateSnippet: 'HTTP/1.1 201 Created\nLocation: /v1/alerts/alert_99418241\nContent-Type: application/json'
    }
  ],

  // Module 3: Параметры запроса
  'mod-3': [
    {
      id: 'm3-1',
      category: 'Форматирование',
      text: 'Всегда четко разделяйте Path, Query и Header параметры в разных секциях документации эндпоинта.',
      docRecommendation: 'Разработчики часто путают переменные пути /cities/{id} и query-фильтры ?city_id=1. Выделите колонку «Расположение» (Location).',
      templateSnippet: '| Имя | Расположение | Тип | Обязательный | Описание |\n| :--- | :--- | :--- | :--- | :--- |\n| `latitude` | `query` | `number` | Да | Географическая широта (-90.0 .. 90.0) |'
    },
    {
      id: 'm3-2',
      category: 'Best Practice',
      text: 'Для дат и времени всегда явно указывайте стандарт ISO-8601 (например: 2026-09-30T12:00:00Z) и таймзону (UTC).',
      docRecommendation: 'Неопределенность с форматом дат — частая причина багов интеграции у разработчиков.',
      templateSnippet: 'Параметр `start_date`: формат `YYYY-MM-DD` по стандарту ISO-8601 (например: `2026-09-30`).'
    }
  ],

  // Module 4: Аутентификация и API-ключи
  'mod-4': [
    {
      id: 'm4-1',
      category: 'Безопасность',
      text: 'Никогда не публикуйте реальные production-ключи в примерах! Используйте стандартизированные плейсхолдеры: <YOUR_API_KEY>.',
      docRecommendation: 'В кодовых блоках cURL и SDK заменяйте ключи на плейсхолдеры и давайте ссылку на личный кабинет получения ключа.',
      templateSnippet: 'curl -H "X-Api-Key: <YOUR_API_KEY>" "https://api.weather.com/v1/forecast"'
    },
    {
      id: 'm4-2',
      category: 'HTTP Коды',
      text: 'Четко разграничивайте в документации 401 Unauthorized (нет ключа / невалиден) и 403 Forbidden (нет прав на тариф).',
      docRecommendation: '401 означает: «Сервер не знает, кто вы». 403 означает: «Сервер знает, кто вы, но ваш тариф не включает почасовой прогноз».',
      templateSnippet: '| 401 | `Unauthorized` | Не передан заголовок `X-Api-Key` или токен истек |\n| 403 | `Forbidden` | Эндпоинт доступен только на тарифе Pro |'
    }
  ],

  // Module 5: Тело ответа и JSON
  'mod-5': [
    {
      id: 'm5-1',
      category: 'Форматирование',
      text: 'Для каждого числового поля в JSON обязательно указывайте физические единицы измерения (°C, м/с, гПа, %).',
      docRecommendation: 'Если поле называется wind_speed, разработчик не знает: это мили/час, узлы или метры в секунду. Всегда пишите единицу в описании.',
      templateSnippet: '| `temperature_2m` | `number` | Градусы Цельсия (°C) на высоте 2м |\n| `relative_humidity` | `integer` | Проценты относительной влажности (0–100%) |'
    },
    {
      id: 'm5-2',
      category: 'Best Practice',
      text: 'Всегда описывайте JSON-схему тела ошибки (Error Payload), а не только успешный ответ 200 OK.',
      docRecommendation: 'Разработчикам критично настроить перехват ошибок: покажите структуру `{"error": true, "code": "INVALID_COORDINATES", "message": "..."}`.',
      templateSnippet: '```json\n{\n  "error": true,\n  "code": "INVALID_LATITUDE",\n  "message": "Широта должна быть в диапазоне от -90 до 90 градусов"\n}\n```'
    }
  ],

  // Module 6: Консольная утилита cURL
  'mod-6': [
    {
      id: 'm6-1',
      category: 'Форматирование',
      text: 'Оформляйте многострочные cURL-команды с обратными слэшами (\\) для гарантированного копирования в один клик.',
      docRecommendation: 'Длинные однострочные команды сложно читать в кодовой документации. Разделяйте URL, флаги заголовков и тело запроса.',
      templateSnippet: 'curl -i -X GET "https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61" \\\n  -H "Accept: application/json"'
    }
  ],

  // Module 7: Статус-коды и обработка ошибок
  'mod-7': [
    {
      id: 'm7-1',
      category: 'HTTP Коды',
      text: 'Обязательно опишите статус 429 Too Many Requests и заголовки лимитов: Retry-After, X-RateLimit-Limit и X-RateLimit-Remaining.',
      docRecommendation: 'Укажите точное поведение клиента: через сколько секунд разрешено повторить запрос при превышении лимита (Retry-After).',
      templateSnippet: 'HTTP/1.1 429 Too Many Requests\nRetry-After: 60\nX-RateLimit-Limit: 1000\nX-RateLimit-Remaining: 0'
    }
  ],

  // Module 8: OpenAPI 3.0 и Swagger
  'mod-8': [
    {
      id: 'm8-1',
      category: 'OpenAPI 3.0',
      text: 'Используйте ссылки $ref: "#/components/schemas/WeatherCurrent" для повторного использования моделей данных.',
      docRecommendation: 'Принцип DRY (Don\'t Repeat Yourself) предотвращает рассинхронизацию между десятками эндпоинтов сервиса.',
      templateSnippet: 'schema:\n  $ref: \'#/components/schemas/WeatherCurrent\''
    }
  ]
};

// Generic fallback hints if module has no specific overrides
const GENERIC_HINTS: ApiHint[] = [
  {
    id: 'gen-1',
    category: 'HTTP Коды',
    text: 'Не забудьте описать статус 404 (Not Found) и схему тела ошибки Error Payload для этого метода.',
    docRecommendation: 'Дайте разработчикам готовый JSON-пример сообщения об ошибке для отладки.',
    templateSnippet: '```json\n{\n  "error": true,\n  "code": "RESOURCE_NOT_FOUND",\n  "message": "Запрашиваемый ресурс не найден"\n}\n```'
  },
  {
    id: 'gen-2',
    category: 'Best Practice',
    text: 'Приводите рабочий пример запроса с реальными тестовыми параметрами, готовый к запуску в cURL или Postman.',
    docRecommendation: 'Разработчики начинают чтение документации с копирования первого примера (Quickstart).',
    templateSnippet: 'curl -X GET "https://api.example.com/v1/data" -H "Accept: application/json"'
  }
];

interface ApiHintBarProps {
  currentModule: CourseModule;
  theme: 'dark' | 'light';
}

export const ApiHintBar: React.FC<ApiHintBarProps> = ({ currentModule, theme }) => {
  const isDark = theme === 'dark';

  const hints = MODULE_HINTS[currentModule.id] || GENERIC_HINTS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Reset index when module changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsDismissed(false);
  }, [currentModule.id]);

  const currentHint = hints[currentIndex % hints.length];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % hints.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + hints.length) % hints.length);
  };

  const handleCopy = () => {
    const textToCopy = currentHint.templateSnippet || currentHint.text;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (isDismissed) {
    return (
      <div className="absolute bottom-2 right-4 z-20">
        <button
          onClick={() => setIsDismissed(false)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-lg border transition-all cursor-pointer ${
            isDark 
              ? 'bg-[#252526] hover:bg-neutral-800 text-amber-300 border-amber-500/40' 
              : 'bg-white hover:bg-neutral-100 text-amber-800 border-amber-400'
          }`}
          title="Развернуть контекстный совет по API-документации"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Совет техписателю</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`border-t select-none transition-all duration-200 shrink-0 z-20 ${
      isDark 
        ? 'bg-[#1e1e1e] border-neutral-700/80 text-neutral-200' 
        : 'bg-[#fbfbfb] border-neutral-300 text-neutral-800'
    }`}>
      {/* Collapsed single-line view */}
      {isCollapsed ? (
        <div className="px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span>Совет ({currentIndex + 1}/{hints.length}):</span>
            </span>
            <span className="truncate text-neutral-300 text-[11px]">
              {currentHint.text}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1 rounded hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Развернуть подробнее"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Скрыть подсказку"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded view */
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Icon & Badge */}
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-300 tracking-wide">
                    API Doc Совет ({currentIndex + 1}/{hints.length}):
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {currentHint.category}
                  </span>
                </div>

                <p className="text-xs font-medium text-neutral-100 leading-relaxed mb-1">
                  {currentHint.text}
                </p>

                <p className="text-[11px] text-neutral-400 leading-relaxed flex items-center gap-1">
                  <span className="text-amber-400/90 font-semibold">Внимание:</span>
                  <span>{currentHint.docRecommendation}</span>
                </p>

                {currentHint.templateSnippet && (
                  <div className={`mt-2 p-2 rounded text-[11px] font-mono border overflow-x-auto max-h-24 ${
                    isDark ? 'bg-[#181818] border-neutral-700/60 text-emerald-300' : 'bg-neutral-100 border-neutral-300 text-emerald-800'
                  }`}>
                    <pre>{currentHint.templateSnippet}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-1.5 shrink-0 self-start">
              {hints.length > 1 && (
                <div className="flex items-center rounded border border-neutral-700/60 overflow-hidden mr-1">
                  <button
                    onClick={handlePrev}
                    className="p-1 hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Предыдущий совет"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 text-[10px] text-neutral-400 font-mono">
                    {currentIndex + 1}/{hints.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="p-1 hover:bg-neutral-700/60 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Следующий совет"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={handleCopy}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Скопировать совет или шаблон в буфер обмена"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedSnippet ? 'Скопировано!' : 'Копировать'}</span>
              </button>

              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Свернуть в одну строку"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Скрыть подсказку"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
