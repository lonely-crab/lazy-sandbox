# Frontend (заглушка)

Здесь будет React-приложение команды UI (песочница шаблонизаторов + отправка метрик на backend).

## Контракт с backend

См. **[docs/api.md](../docs/api.md)**:

- `POST /benchmarks` — отправить результат измерения (`template_engine`, `render_time_ms`, опционально `payload`)
- `GET /benchmarks` — получить историю (опционально `engine`, `limit`, `offset`)

По умолчанию backend: `http://localhost:8000`. Для локальной разработки включён CORS для типичных портов фронта (см. `CORS_ORIGINS` в `backend/.env.example`).

## Инициализация проекта (для команды K2)

Из каталога `frontend/`:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

После этого приложение обычно доступно на `http://localhost:5173`.
