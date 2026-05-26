# Модель данных

## Схема базы данных

База данных — SQLite, управляется SQLAlchemy 2. При старте приложения
(`lifespan` в `main.py`) вызывается `Base.metadata.create_all(bind=engine)`,
что создаёт отсутствующие таблицы автоматически.

### Таблица `benchmarks`

| Колонка | Тип SQL | Nullable | Индекс | Описание |
|---------|---------|----------|--------|----------|
| `id` | INTEGER | NOT NULL | PRIMARY KEY | Автоинкрементный идентификатор |
| `template_engine` | VARCHAR(64) | NOT NULL | Да | Имя шаблонизатора (`handlebars`, `mustache`, `ejs`) |
| `render_time_ms` | FLOAT | NOT NULL | — | Время рендеринга в миллисекундах (≥ 0) |
| `payload` | TEXT | NULL | — | JSON-данные, использованные при рендере |
| `created_at` | DATETIME | NOT NULL | Да | Время создания записи (server default: `now()`) |

Индексы на `template_engine` и `created_at` обеспечивают эффективную фильтрацию по движку
и сортировку по времени (история выдаётся новые-первыми).

## ORM-модель (SQLAlchemy)

```python
# app/models.py
class Benchmark(Base):
    __tablename__ = "benchmarks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    template_engine: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    render_time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False, index=True
    )
```

## Pydantic-схемы

### `BenchmarkCreate` — входные данные (запрос)

```python
class BenchmarkCreate(BaseModel):
    template_engine: str   # min_length=1, max_length=64
    render_time_ms: float  # ge=0
    payload: str | None    # max_length=10_000, опционально
```

**Правила валидации:**
- `template_engine` — не пустая строка, не длиннее 64 символов
- `render_time_ms` — неотрицательное число (0 допустимо)
- `payload` — любая строка до 10 000 символов или `null`/отсутствие поля

### `BenchmarkRead` — выходные данные (ответ)

Наследует `BenchmarkCreate`, добавляет поля, устанавливаемые сервером:

```python
class BenchmarkRead(BenchmarkCreate):
    id: int
    created_at: datetime   # ISO 8601 в ответе
```

## Пример записи (JSON)

```json
{
  "id": 42,
  "template_engine": "handlebars",
  "render_time_ms": 0.0821,
  "payload": "{\"name\": \"World\"}",
  "created_at": "2026-05-26T14:30:00.000000"
}
```

## Операции с БД (`crud.py`)

### `create_benchmark`

```python
create_benchmark(db: Session, data: BenchmarkCreate) -> Benchmark
```

Создаёт строку, делает `commit` и `refresh` (чтобы получить `id` и `created_at`).

### `list_benchmarks`

```python
list_benchmarks(
    db: Session,
    *,
    engine: str | None,   # фильтр по template_engine (точное совпадение)
    limit: int,           # 1–500
    offset: int,          # ≥ 0
) -> list[Benchmark]
```

Сортировка: `created_at DESC, id DESC`. Если `engine` задан — добавляется `WHERE`.

## Конфигурация подключения к БД

Логика определена в `database.py`:

- Для **SQLite** автоматически добавляется `connect_args={"check_same_thread": False}`.
- Для **SQLite in-memory** (тесты) используется `StaticPool`, чтобы все соединения
  шли к одной и той же базе данных в памяти.
- Для остальных баз данных (PostgreSQL, MySQL и др.) используется стандартный `create_engine`.

Сессия предоставляется через FastAPI Dependency Injection (`Depends(get_db)`).
