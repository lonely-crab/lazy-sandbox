# ДОКУМЕНТАЦИЯ ПРОЕКТА lazy-sandbox

---

## 1. ОБЩЕЕ ОПИСАНИЕ ПРОЕКТА

### 1.1 Назначение

lazy-sandbox — веб-приложение для интерактивного сравнения шаблонизаторов JavaScript. Пользователь вводит шаблон и JSON-данные, выбирает один из трёх движков (Handlebars, Mustache или EJS), нажимает кнопку «Рендер» — и немедленно видит результат вместе со временем выполнения в миллисекундах. Каждое успешное измерение автоматически сохраняется на сервере, формируя накопительную историю бенчмарков, которая отображается прямо на странице.

### 1.2 Цели

- Предоставить разработчикам простой визуальный инструмент для сравнения синтаксиса и производительности популярных шаблонизаторов.
- Накапливать метрики рендеринга через REST API для дальнейшего анализа.
- Служить учебным примером full-stack приложения на React + FastAPI + SQLite.

### 1.3 Поддерживаемые шаблонизаторы

| Движок | Синтаксис переменной | Особенности |
|--------|----------------------|-------------|
| Handlebars | `{{name}}` | Блоки `{{#if}}`, `{{#each}}`, поддержка хелперов |
| Mustache | `{{name}}` | Логически-безопасный (logic-less), секции `{{#section}}` |
| EJS | `<%= name %>` | Встроенный JavaScript, `<% %>` для управляющих конструкций |

### 1.4 Ключевые характеристики

- **Рендеринг на стороне клиента** — все три движка работают в браузере, бэкенд не участвует в рендеринге шаблонов.
- **Высокая точность замера** — используется `performance.now()` с точностью до 0,0001 мс.
- **Автосохранение** — после каждого успешного рендера результат немедленно отправляется на `POST /benchmarks`.
- **Живая история** — таблица бенчмарков обновляется на странице после каждого сохранения без перезагрузки.
- **Встроенная документация API** — Swagger UI на `/docs`, ReDoc на `/redoc`.
- **Лёгкое развёртывание** — SQLite не требует отдельного процесса базы данных.

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### 2.1 Frontend

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| React | 19.2 | UI-фреймворк |
| TypeScript | 6.0 | Статическая типизация |
| Vite | 8.0 | Бандлер и dev-сервер |
| Handlebars | 4.7 | Рендеринг шаблонов в браузере |
| Mustache | 4.2 | Рендеринг шаблонов в браузере |
| EJS | 5.0 | Рендеринг шаблонов в браузере |
| ESLint | 10.3 | Линтер |
| Prettier | 3.8 | Форматирование кода |

### 2.2 Backend

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| Python | 3.11+ | Язык разработки |
| FastAPI | 0.109+ | HTTP-фреймворк |
| Uvicorn | 0.27+ | ASGI-сервер |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.6+ | Валидация и сериализация данных |
| Pydantic-Settings | 2.2+ | Управление конфигурацией |
| SQLite | — | Встроенная реляционная СУБД |
| pytest | 8.0+ | Тестирование |
| httpx | 0.26+ | HTTP-клиент для тестов |
| ruff | 0.3+ | Линтер и форматтер Python |

---

## 3. АРХИТЕКТУРА СИСТЕМЫ

### 3.1 Общая схема

Система состоит из трёх уровней:

1. **Frontend (браузер)** — React-приложение, выполняющее рендеринг шаблонов и отображающее UI.
2. **Backend (сервер)** — FastAPI-приложение, хранящее и отдающее результаты измерений.
3. **Хранилище** — SQLite-файл на диске сервера.

Frontend взаимодействует с Backend исключительно через REST API: `POST /benchmarks` для сохранения и `GET /benchmarks` для получения истории.

### 3.2 Поток данных

1. Пользователь выбирает движок, вводит шаблон и JSON-данные в UI.
2. При нажатии «Рендер» компонент `App.tsx` вызывает `renderTemplate()` — рендеринг выполняется в браузере.
3. Результат и `render_time_ms` отображаются в компоненте `ResultView`.
4. Функция `saveBenchmark()` отправляет `POST /benchmarks` с полями `template_engine`, `render_time_ms`, `payload`.
5. После успешного сохранения инкрементируется `historyRefreshKey`, компонент `BenchmarkHistory` перезагружает список через `GET /benchmarks`.

### 3.3 Технические детали Backend

| Аспект | Реализация |
|--------|------------|
| ORM | SQLAlchemy 2 (синхронный режим) |
| Создание схемы | `Base.metadata.create_all()` при старте приложения (lifespan) |
| Валидация | Pydantic v2 на входе и выходе всех эндпоинтов |
| CORS | `CORSMiddleware`; origins задаются через переменную окружения `CORS_ORIGINS` |
| Документация API | Swagger UI — `/docs`, ReDoc — `/redoc` |
| Тесты | pytest + `TestClient` (httpx); изолированная in-memory SQLite |

### 3.4 Технические детали Frontend

| Аспект | Реализация |
|--------|------------|
| Рендеринг шаблонов | Handlebars, Mustache, EJS — NPM-пакеты, выполняются в браузере |
| Замер времени | `performance.now()` с точностью 0,0001 мс |
| HTTP-клиент | Нативный `fetch` |
| URL бэкенда | `VITE_API_BASE_URL` (пусто = тот же origin) |
| Состояние | Хуки `useState` в корневом `App.tsx`; дочерние компоненты stateless |
| Доступность | TemplateSelector — WAI-ARIA Listbox; ResultView — `aria-live="polite"` |

---

## 4. СТРУКТУРА РЕПОЗИТОРИЯ

```
lazy-sandbox/
├── backend/                    # FastAPI-сервис
│   ├── app/
│   │   ├── main.py             # Точка входа, CORS, lifespan
│   │   ├── config.py           # Настройки из переменных окружения
│   │   ├── database.py         # SQLAlchemy engine и сессии
│   │   ├── models.py           # ORM-модель Benchmark
│   │   ├── schemas.py          # Pydantic-схемы запросов/ответов
│   │   ├── crud.py             # Операции с базой данных
│   │   └── routers/
│   │       └── benchmarks.py   # POST/GET /benchmarks
│   ├── tests/
│   │   ├── conftest.py         # Фикстуры pytest
│   │   ├── test_benchmarks.py  # Тесты бенчмарк-эндпоинтов
│   │   └── test_health.py      # Тест health-эндпоинта
│   ├── .env.example            # Шаблон переменных окружения
│   ├── requirements.txt        # Зависимости продакшена
│   ├── requirements-dev.txt    # Зависимости разработки
│   └── pyproject.toml          # Конфигурация ruff и pytest
├── frontend/                   # React-приложение (Vite)
│   ├── src/
│   │   ├── main.tsx            # Точка входа React
│   │   ├── App.tsx             # Корневой компонент
│   │   ├── types/
│   │   │   └── template.ts     # Тип TemplateEngine
│   │   ├── services/
│   │   │   ├── benchmarkApi.ts     # HTTP-клиент
│   │   │   └── templateRenderer.ts # Обёртка над движками
│   │   └── components/
│   │       ├── TemplateSelector.tsx
│   │       ├── TemplateInput.tsx
│   │       ├── DataInput.tsx
│   │       ├── RenderButton.tsx
│   │       ├── ResultView.tsx
│   │       └── BenchmarkHistory.tsx
│   ├── vite.config.ts
│   ├── tsconfig*.json
│   └── package.json
├── docs/                       # Документация проекта
├── package.json                # Корневые зависимости (движки шаблонов)
└── README.md
```

---

## 5. МОДЕЛЬ ДАННЫХ

### 5.1 Таблица `benchmarks`

| Колонка | Тип SQL | Nullable | Индекс | Описание |
|---------|---------|----------|--------|----------|
| `id` | INTEGER | NOT NULL | PRIMARY KEY | Автоинкрементный идентификатор |
| `template_engine` | VARCHAR(64) | NOT NULL | Да | Имя шаблонизатора |
| `render_time_ms` | FLOAT | NOT NULL | — | Время рендеринга (≥ 0 мс) |
| `payload` | TEXT | NULL | — | JSON-данные, использованные при рендере |
| `created_at` | DATETIME | NOT NULL | Да | Время создания (server default: now()) |

Индексы на `template_engine` и `created_at` обеспечивают эффективную фильтрацию по движку и сортировку по времени.

### 5.2 Правила валидации (Pydantic)

**Запрос (BenchmarkCreate):**

- `template_engine` — строка от 1 до 64 символов, обязательное поле.
- `render_time_ms` — число, ≥ 0, обязательное поле.
- `payload` — строка до 10 000 символов или null, необязательное поле.

**Ответ (BenchmarkRead)** — содержит все поля запроса плюс:

- `id` — целое число.
- `created_at` — строка в формате ISO 8601.

### 5.3 Пример записи (JSON)

```json
{
  "id": 42,
  "template_engine": "handlebars",
  "render_time_ms": 0.0821,
  "payload": "{\"name\": \"World\"}",
  "created_at": "2026-05-26T14:30:00.000000"
}
```

---

## 6. REST API

**Базовый URL:** `http://localhost:8000`

### 6.1 POST /benchmarks — Сохранить результат

**Тело запроса (JSON):**

```json
{
  "template_engine": "handlebars",
  "render_time_ms": 0.0821,
  "payload": "{\"name\": \"World\"}"
}
```

**Ответы:**

- `201 Created` — объект записи с `id` и `created_at`.
- `422 Unprocessable Entity` — неверные данные (отрицательное время, пустой движок и т.п.).

**Пример curl:**

```bash
curl -s -X POST http://localhost:8000/benchmarks \
  -H 'Content-Type: application/json' \
  -d '{"template_engine":"handlebars","render_time_ms":0.0821}'
```

### 6.2 GET /benchmarks — Получить историю

**Query-параметры:**

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `engine` | string | — | Фильтр по `template_engine` (точное совпадение) |
| `limit` | int | 100 | Количество записей (1–500) |
| `offset` | int | 0 | Смещение для пагинации |

**Ответ:** `200 OK` — массив объектов. Сортировка: новые записи первыми.

**Пример curl:**

```bash
curl -s 'http://localhost:8000/benchmarks?engine=handlebars&limit=10'
```

### 6.3 GET /health — Проверка живости

**Ответ:** `200 OK`, тело `{"status": "ok"}`.

### 6.4 Интерактивная документация

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 7. КОМПОНЕНТЫ FRONTEND

### 7.1 Компонентное дерево

```
App
├── header
│   ├── (текст hero-секции)
│   └── TemplateSelector       — выпадающий список выбора движка
└── main
    ├── section (ввод)
    │   ├── RenderButton        — кнопка «Рендер»
    │   ├── TemplateInput       — textarea для шаблона
    │   └── DataInput           — textarea для JSON
    ├── ResultView              — результат, время, статус сохранения
    └── BenchmarkHistory        — таблица истории измерений
```

### 7.2 Описание компонентов

**TemplateSelector** — кастомный выпадающий список (не `<select>`). Реализует полную поддержку клавиатуры по стандарту WAI-ARIA Listbox: открытие через Enter/Space/стрелки, навигация стрелками, Home/End, закрытие через Escape или клик вне компонента.

**TemplateInput / DataInput** — обёртки над `<textarea>` с лейблом. TemplateInput принимает текст шаблона, DataInput — JSON-данные (корректность JSON проверяется при нажатии «Рендер»).

**RenderButton** — кнопка «Рендер». Отключена если: шаблон пустой, JSON пустой, или идёт сохранение (`saveStatus === 'saving'`).

**ResultView** — отображает: время рендеринга, цветной бейдж статуса сохранения (idle/saving/saved/error), результат в теге `<pre>` с `aria-live="polite"`, сообщения об ошибках с `role="alert"`.

**BenchmarkHistory** — загружает историю через `getBenchmarks()` при монтировании и при каждом изменении `refreshKey`. Показывает прокручиваемую таблицу: движок, время (мс), дата/время.

### 7.3 Сервисный слой

**`templateRenderer.ts`** — единственная точка интеграции с движками шаблонов. Принимает тип движка, строку шаблона и данные, возвращает строку результата. Использует exhaustive-проверку через `never` для TypeScript.

**`benchmarkApi.ts`** — HTTP-клиент на основе `fetch`. Базовый URL читается из `import.meta.env.VITE_API_BASE_URL`. При пустой переменной запросы идут на тот же origin — удобно при деплое фронтенда рядом с бэкендом или использовании dev-прокси Vite.

---

## 8. УСТАНОВКА И ЗАПУСК

### 8.1 Требования

| Инструмент | Минимальная версия |
|------------|--------------------|
| Python | 3.11 |
| Node.js | 18 |
| npm | 9 |

### 8.2 Запуск Backend

```bash
cd backend

# Создать и активировать виртуальное окружение
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# или
.venv\Scripts\Activate.ps1         # Windows PowerShell

# Установить зависимости
pip install -r requirements.txt -r requirements-dev.txt

# Настроить окружение
cp .env.example .env

# Запустить сервер
uvicorn app.main:app --reload
```

Сервер поднимается на `http://localhost:8000`. При первом запуске автоматически создаётся файл базы данных `backend/lazy_sandbox.db`.

### 8.3 Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение открывается на `http://localhost:5173`.

### 8.4 Конфигурация

**Backend** (`backend/.env`):

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|----------|
| `DATABASE_URL` | `sqlite:///./lazy_sandbox.db` | URL базы данных (SQLAlchemy) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Разрешённые origin через запятую |

**Frontend** (`frontend/.env.local`, опционально):

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|----------|
| `VITE_API_BASE_URL` | `""` | Базовый URL бэкенда; пусто = тот же origin |

---

## 9. ТЕСТИРОВАНИЕ

### 9.1 Запуск тестов

```bash
cd backend
pytest -v
```

### 9.2 Покрытие тестами

| Тест | Описание |
|------|----------|
| `test_health_ok` | GET /health возвращает `{"status":"ok"}` |
| `test_get_benchmarks_empty` | GET /benchmarks возвращает пустой массив |
| `test_post_benchmark_valid` | POST с корректными данными — 201 и корректное тело |
| `test_post_benchmark_without_payload` | POST без поля payload — 201, payload=null |
| `test_post_benchmark_negative_time_returns_422` | Отрицательное время — 422 |
| `test_post_benchmark_empty_engine_returns_422` | Пустой движок — 422 |
| `test_list_benchmarks_sorted_newest_first` | Сортировка: новые записи первыми |
| `test_filter_by_engine` | Фильтрация по engine работает корректно |
| `test_pagination_limit_offset` | Пагинация через limit и offset |

### 9.3 Изоляция тестов

Каждый тест получает чистую базу данных в памяти (`sqlite:///:memory:/`) благодаря фикстуре `reset_database` с `autouse=True`, которая сбрасывает и пересоздаёт схему перед каждым тестом. `StaticPool` в SQLAlchemy гарантирует, что все соединения используют один и тот же in-memory экземпляр.

### 9.4 Линтер

```bash
# Backend
cd backend && ruff check .

# Frontend
cd frontend && npm run lint
```

---

## 10. СТРАТЕГИЯ ВЕТВЛЕНИЯ

### 10.1 Основные ветки

| Ветка | Назначение |
|-------|------------|
| `main` | Стабильное состояние релизов; мерж только из `dev` после проверки |
| `dev` | Интеграционная ветка текущей разработки |

### 10.2 Рабочие ветки

- `feature/<scope>-<short-name>` — новая функциональность (например `feature/back-benchmarks-api`)
- `fix/<scope>-<short-name>` — исправления ошибок
- `docs/<topic>` — только изменения в `docs/`

### 10.3 Правила слияния

1. Задачи ведутся в отдельных ветках от актуального `dev`.
2. В `dev` попадает только через Pull Request.
3. Перед мержем прогоняются `ruff check` и `pytest`.
4. Рекомендуется squash-merge для читаемой истории.
5. В `main` мержится только проверенный `dev`.

### 10.4 Сообщения коммитов

Используется стиль Conventional Commits:

- `feat(backend): add benchmarks POST endpoint`
- `fix(frontend): validate render_time_ms before save`
- `docs: update API contract`

---

*Документация актуальна на: 2026-05-26. Версия проекта: 0.1.0.*
