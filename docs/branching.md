# Стратегия ветвления

## Основные ветки

| Ветка | Назначение |
|-------|------------|
| `main` | Стабильное состояние релизов; мерж только из `dev` после проверки (локально: тесты и линтер; CI настраивается отдельно) |
| `dev` | Интеграционная ветка текущей разработки всех подкоманд |

## Рабочие ветки

- `feature/<scope>-<short-name>` — новая функциональность  
  Примеры: `feature/back-benchmarks-api`, `feature/front-engine-selector`
- `fix/<scope>-<short-name>` — исправления ошибок
- `docs/<topic>` — только изменения в `docs/`

## Правила слияния

1. Задачи ведутся в отдельных ветках от актуального `dev`.
2. В `dev` попадает только через **Pull Request**.
3. Перед мержем прогоняются проверки качества (например `ruff` и `pytest` в `backend/`); автоматизация в GitHub Actions — отдельная задача.
4. Рекомендуется **squash-merge** для читаемой истории в `dev`.
5. В `main` мержится только проверенный `dev` (например перед демо или отчётом).

## Сообщения коммитов

Рекомендуется стиль [Conventional Commits](https://www.conventionalcommits.org/), например:

- `feat(backend): add benchmarks POST endpoint`
- `fix(backend): validate render_time_ms`
- `docs: update API contract`
