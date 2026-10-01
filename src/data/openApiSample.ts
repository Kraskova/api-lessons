export const WEATHER_OPENAPI_SPEC_YAML = `openapi: 3.0.3
info:
  title: Open-Meteo Weather Forecast API
  description: |
    # Документация метеорологического сервиса прогноза погоды
    Практический пример спецификации OpenAPI для курса технических писателей.
    Позволяет получать почасовые и суточные метеоданные без необходимости API-ключа.
  version: 1.0.0
  contact:
    name: Команда курса технических писателей
    email: docs-team@weather-example.com
servers:
  - url: https://api.open-meteo.com/v1
    description: Основной производственный сервер (Production)

paths:
  /forecast:
    get:
      summary: Получение текущего прогноза погоды и таймсерий
      description: |
        Возвращает детальные метеорологические параметры по указанным географическим координатам.
        Поддерживает выбор единиц измерения, временных зон и горизонта прогнозирования.
      operationId: getWeatherData
      tags:
        - Weather Forecast
      parameters:
        - name: latitude
          in: query
          required: true
          description: Географическая широта точки в десятичных градусах WGS84.
          schema:
            type: number
            format: float
            minimum: -90.0
            maximum: 90.0
            example: 55.7558
        - name: longitude
          in: query
          required: true
          description: Географическая долгота точки в десятичных градусах WGS84.
          schema:
            type: number
            format: float
            minimum: -180.0
            maximum: 180.0
            example: 37.6173
        - name: current
          in: query
          required: false
          description: Список метеорологических переменных текущего момента через запятую.
          schema:
            type: string
            example: "temperature_2m,relative_humidity_2m,wind_speed_10m"
        - name: forecast_days
          in: query
          required: false
          description: Количество дней для прогнозирования (по умолчанию 7).
          schema:
            type: integer
            minimum: 1
            maximum: 16
            default: 7
            example: 3
        - name: timezone
          in: query
          required: false
          description: Часовой пояс для форматирования времени (или 'auto').
          schema:
            type: string
            default: "auto"
            example: "Europe/Moscow"
      responses:
        '200':
          description: Успешный возврат метеоданных.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForecastResponse'
        '400':
          description: Некорректный запрос (например, координаты вне допустимого диапазона).
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Превышение лимита частоты обращений (Rate Limit).

components:
  schemas:
    ForecastResponse:
      type: object
      required:
        - latitude
        - longitude
        - timezone
      properties:
        latitude:
          type: number
          example: 55.75
          description: Спроецированная широта расчетной сетки
        longitude:
          type: number
          example: 37.625
          description: Спроецированная долгота расчетной сетки
        elevation:
          type: number
          example: 144.0
          description: Высота над уровнем моря в метрах
        timezone:
          type: string
          example: "Europe/Moscow"
          description: Идентификатор временной зоны IANA
        current:
          type: object
          description: Блок текущих измерений
          properties:
            time:
              type: string
              example: "2026-09-30T14:00"
              description: Время замера в формате ISO 8601
            temperature_2m:
              type: number
              example: 16.4
              description: Температура воздуха на высоте 2м в градусах Цельсия
            relative_humidity_2m:
              type: integer
              example: 65
              description: Относительная влажность воздуха в процентах
            wind_speed_10m:
              type: number
              example: 4.8
              description: Скорость ветра на высоте 10м (км/ч)

    ErrorResponse:
      type: object
      required:
        - error
        - reason
      properties:
        error:
          type: boolean
          example: true
          description: Флаг ошибки
        reason:
          type: string
          example: "Latitude must be in range of -90 to 90°. Given: 999.0."
          description: Понятное техническое описание причины отказа
`;
