# Frontend

## Обзор

Фронтенд написан на React 19 + TypeScript 6, собирается Vite 8. Весь рендеринг шаблонов
выполняется в браузере — бэкенд не участвует в этом процессе. После рендеринга результат
и замеренное время автоматически отправляются на сервер.

## Структура исходников

```
frontend/src/
├── main.tsx                    # Точка входа React
├── App.tsx                     # Корневой компонент, оркестратор состояния
├── App.css                     # Стили приложения
├── index.css                   # CSS-reset
├── types/
│   └── template.ts             # Тип TemplateEngine
├── services/
│   ├── benchmarkApi.ts         # HTTP-клиент к backend
│   └── templateRenderer.ts     # Обёртка над движками шаблонов
└── components/
    ├── TemplateSelector.tsx     # Выпадающий список выбора движка
    ├── TemplateInput.tsx        # Textarea для шаблона
    ├── DataInput.tsx            # Textarea для JSON-данных
    ├── RenderButton.tsx         # Кнопка «Рендер»
    ├── ResultView.tsx           # Результат и метрики
    └── BenchmarkHistory.tsx     # Таблица истории измерений
```

## Компонентное дерево

```
App
├── header
│   ├── (текст hero)
│   └── TemplateSelector        ← выбор движка
└── main
    ├── section.card (ввод)
    │   ├── RenderButton
    │   ├── TemplateInput        ← textarea шаблона
    │   └── DataInput            ← textarea JSON
    ├── ResultView               ← результат, время, статус сохранения
    └── BenchmarkHistory         ← таблица истории
```

## Управление состоянием

Всё состояние хранится в `App.tsx` через хуки `useState`. Компоненты принимают данные
через props и вызывают коллбэки для изменений — классическая однонаправленная модель React.

| Состояние | Тип | Назначение |
|-----------|-----|------------|
| `engine` | `TemplateEngine` | Выбранный шаблонизатор |
| `template` | `string` | Текст шаблона |
| `dataInput` | `string` | JSON как строка |
| `result` | `string` | Результат рендеринга |
| `error` | `string \| null` | Ошибка рендеринга или парсинга |
| `renderTimeMs` | `number \| null` | Время рендеринга |
| `saveStatus` | `'idle' \| 'saving' \| 'saved' \| 'error'` | Статус сохранения на бэкенд |
| `saveError` | `string \| null` | Текст ошибки сохранения |
| `historyRefreshKey` | `number` | Инкрементируется после сохранения, тригерит перезагрузку истории |

## Поток данных при рендеринге

```
handleRender()
  ├── JSON.parse(dataInput)          → если ошибка: setError(...)
  ├── renderTemplate(engine, ...)    → performance.now() замер времени
  │     └── Handlebars / Mustache / EJS
  ├── setResult(output)
  ├── setRenderTimeMs(duration)
  └── saveBenchmark(...)             → POST /benchmarks
        └── setHistoryRefreshKey(n+1)  → BenchmarkHistory перезагружает
```

## Сервисный слой

### `templateRenderer.ts`

Обёртка над тремя библиотеками. Принимает тип движка, строку шаблона и данные,
возвращает строку результата. Использует exhaustive-проверку через `never` для защиты
от неожиданных значений движка.

```typescript
renderTemplate('handlebars', '{{name}}', { name: 'World' })
// => 'World'
```

### `benchmarkApi.ts`

HTTP-клиент на основе `fetch`. Читает базовый URL из `import.meta.env.VITE_API_BASE_URL`.
Если переменная не задана — делает запросы на текущий origin (удобно для dev-прокси и деплоя
фронтенда рядом с бэкендом).

Экспортирует две функции:

| Функция | Метод | Эндпоинт | Описание |
|---------|-------|----------|----------|
| `saveBenchmark(payload)` | POST | `/benchmarks` | Сохранить результат измерения |
| `getBenchmarks()` | GET | `/benchmarks` | Получить всю историю |

## Компоненты

### TemplateSelector

Кастомный выпадающий список (не `<select>`). Реализует полную поддержку клавиатуры
по стандарту WAI-ARIA Listbox:

- `Enter` / `Space` / `ArrowDown` / `ArrowUp` — открывают список
- `ArrowDown` / `ArrowUp` — навигация по опциям
- `Home` / `End` — первый / последний элемент
- `Escape` — закрыть
- Клик вне компонента — закрыть (listener на `mousedown`)

Список опций: `handlebars`, `mustache`, `ejs`.

### TemplateInput / DataInput

Простые обёртки над `<textarea>` с лейблом. `TemplateInput` — для текста шаблона,
`DataInput` — для JSON-данных (ожидается корректный JSON, иначе `handleRender`
выдаёт ошибку парсинга).

### RenderButton

Кнопка «Рендер». Отключена (`disabled`) если:
- шаблон пустой
- JSON пустой
- идёт сохранение (`saveStatus === 'saving'`)

### ResultView

Отображает:
- Время рендеринга (`render_time_ms` в мс с 4 знаками)
- Статус сохранения (цветной бейдж: idle / saving / saved / error)
- Результат рендеринга в `<pre>` с `aria-live="polite"`
- Ошибки рендеринга и сохранения в `role="alert"`

### BenchmarkHistory

Загружает историю при монтировании и при каждом изменении `refreshKey`.
Отображает таблицу с колонками: шаблонизатор, время (мс), дата/время.
Таблица прокручивается (max-height 130px).

## Конфигурация инструментов

| Файл | Назначение |
|------|------------|
| `vite.config.ts` | Плагин `@vitejs/plugin-react` |
| `tsconfig.app.json` | Target ES2023, строгий режим, JSX react-jsx |
| `eslint.config.js` | ESLint + TypeScript + react-hooks + react-refresh |
| `prettier.config.cjs` | printWidth 100, singleQuote, trailingComma all |
