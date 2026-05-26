# HTTP API (контракт)

Базовый URL по умолчанию: `http://localhost:8000`.

## Модель записи

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `template_engine` | string | да | Имя шаблонизатора (`handlebars`, `mustache`, `ejs`) |
| `render_time_ms` | number | да | Время рендеринга в миллисекундах, ≥ 0 |
| `payload` | string \| null | нет | Дополнительные данные (JSON-строка или текст) |

Ответ после сохранения дополнительно содержит `id` (целое) и `created_at` (ISO 8601).

---

## `POST /benchmarks`

Сохранить результат измерения.

**Тело (JSON):**

```json
{
  "template_engine": "handlebars",
  "render_time_ms": 0.0821,
  "payload": "{\"name\": \"World\"}"
}
```

**Ответ:** `201 Created` — объект записи с `id`, `created_at`.

**Ошибки:** `422 Unprocessable Entity` — неверная форма данных (например отрицательное время).

### Пример curl

```bash
curl -s -X POST http://localhost:8000/benchmarks \
  -H 'Content-Type: application/json' \
  -d '{"template_engine":"handlebars","render_time_ms":0.0821,"payload":"{\"name\":\"World\"}"}'
```

---

## `GET /benchmarks`

Список сохранённых результатов (новые первыми).

**Query-параметры:**

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `engine` | string | — | Фильтр по `template_engine` |
| `limit` | int | 100 | От 1 до 500 |
| `offset` | int | 0 | Смещение для пагинации |

**Ответ:** `200 OK` — массив объектов записей.

### Пример curl

```bash
curl -s 'http://localhost:8000/benchmarks?engine=handlebars&limit=10'
```

---

## `GET /health`

Проверка живости сервиса.

**Ответ:** `200 OK`, тело `{"status":"ok"}`.

---

Полная интерактивная спецификация: **Swagger UI** — `/docs`.
