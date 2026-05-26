# Backend — FastAPI + SQLite

Сервис принимает результаты замеров времени рендеринга шаблонов и отдаёт историю через REST API.

## Структура

```
backend/
├── app/
│   ├── main.py           # приложение FastAPI, CORS, lifespan
│   ├── config.py         # настройки из переменных окружения
│   ├── database.py       # SQLAlchemy engine, сессии
│   ├── models.py         # ORM-модель Benchmark
│   ├── schemas.py        # Pydantic-схемы запросов/ответов
│   ├── crud.py           # операции с БД
│   └── routers/
│       └── benchmarks.py # POST/GET /benchmarks
├── tests/                # pytest + TestClient
├── requirements.txt
├── requirements-dev.txt
└── pyproject.toml
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | URL SQLite (по умолчанию файл `lazy_sandbox.db` в каталоге `backend/`) |
| `CORS_ORIGINS` | Список origin через запятую для CORS |

## Запуск локально

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Документация API: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/health  

## Тесты

```bash
cd backend
pytest -v
```

Линтер:

```bash
ruff check .
```
