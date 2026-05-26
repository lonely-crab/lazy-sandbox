# lazy-sandbox

Песочница для сравнения разных шаблонизаторов: фронтенд измеряет время рендеринга, бэкенд сохраняет результаты в SQLite и отдаёт историю через REST API.

## Стек

| Слой | Технология |
|------|------------|
| Backend | FastAPI, SQLAlchemy 2, SQLite |
| Frontend | React (папка `frontend/` — заглушка для команды UI) |

## Структура репозитория

```
lazy-sandbox/
├── backend/     # FastAPI-сервис и тесты
├── frontend/    # UI (инициализация — см. frontend/README.md)
└── docs/        # Архитектура, API, стратегия ветвления
```

## Быстрый старт: backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env        # при необходимости поправьте DATABASE_URL / CORS_ORIGINS
uvicorn app.main:app --reload
```

- OpenAPI (Swagger): <http://localhost:8000/docs>
- Health: <http://localhost:8000/health>

### Тесты (без фронтенда)

```bash
cd backend
pytest -v
```

## Документация

- [Архитектура](docs/architecture.md)
- [Контракт HTTP API](docs/api.md)
- [Стратегия ветвления](docs/branching.md)

## Лицензия

См. [LICENSE](LICENSE).
