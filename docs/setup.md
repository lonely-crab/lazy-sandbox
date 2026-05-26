# Установка и запуск

## Требования

| Инструмент | Минимальная версия |
|------------|--------------------|
| Python | 3.11 |
| Node.js | 18 |
| npm | 9 |

## Backend

### 1. Установка зависимостей

```bash
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install -r requirements.txt -r requirements-dev.txt
```

### 2. Конфигурация окружения

```bash
cp .env.example .env
```

Содержимое `.env` (значения по умолчанию уже рабочие):

```dotenv
DATABASE_URL=sqlite:///./lazy_sandbox.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Запуск

```bash
uvicorn app.main:app --reload
```

Сервер поднимается на `http://localhost:8000`.

| URL | Описание |
|-----|----------|
| `http://localhost:8000/health` | Проверка живости |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |

При первом запуске SQLAlchemy автоматически создаёт файл базы данных `backend/lazy_sandbox.db`
и таблицу `benchmarks`.

### 4. Тесты

```bash
cd backend
pytest -v
```

Тесты используют изолированную базу данных в памяти (`sqlite:///:memory:/`) — файл на диске
не затрагивается.

### 5. Линтер

```bash
ruff check .
```

---

## Frontend

### 1. Установка зависимостей

```bash
cd frontend
npm install
```

### 2. Конфигурация окружения (опционально)

По умолчанию фронтенд обращается к тому же origin (работает при dev-сервере Vite
с бэкендом на `localhost:8000` благодаря пустому `VITE_API_BASE_URL`).

Если бэкенд запущен на другом хосте или порту, создайте `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Запуск dev-сервера

```bash
cd frontend
npm run dev
```

Приложение открывается на `http://localhost:5173`.

### 4. Сборка для продакшена

```bash
cd frontend
npm run build
```

Артефакты попадают в `frontend/dist/`. Их можно раздавать любым статическим сервером.

### 5. Линтер

```bash
cd frontend
npm run lint
```

---

## Запуск обоих сервисов одновременно

Откройте два терминала:

```bash
# Терминал 1 — backend
cd backend && uvicorn app.main:app --reload

# Терминал 2 — frontend
cd frontend && npm run dev
```

Откройте `http://localhost:5173` в браузере.

---

## Переменные окружения — справочник

### Backend (`backend/.env`)

| Переменная | Тип | Значение по умолчанию | Описание |
|------------|-----|----------------------|----------|
| `DATABASE_URL` | string | `sqlite:///./lazy_sandbox.db` | SQLAlchemy URL базы данных |
| `CORS_ORIGINS` | string | `http://localhost:5173,http://localhost:3000` | Разрешённые origin через запятую |

### Frontend (`frontend/.env.local`)

| Переменная | Тип | Значение по умолчанию | Описание |
|------------|-----|----------------------|----------|
| `VITE_API_BASE_URL` | string | `""` (пустая строка) | Базовый URL бэкенда; пусто = тот же origin |
