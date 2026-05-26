import { useState } from 'react';

import './App.css';
import { DataInput } from './components/DataInput';
import { RenderButton } from './components/RenderButton';
import { ResultView } from './components/ResultView';
import { TemplateInput } from './components/TemplateInput';
import { TemplateSelector } from './components/TemplateSelector';
import { BenchmarkHistory } from './components/BenchmarkHistory';
import { saveBenchmark } from './services/benchmarkApi';
import { renderTemplate } from './services/templateRenderer';
import type { TemplateEngine } from './types/template';

const DEFAULT_TEMPLATE = 'Hello {{name}}';
const DEFAULT_DATA = '{\n  "name": "John"\n}';

function App() {
  const [engine, setEngine] = useState<TemplateEngine>('handlebars');
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [dataInput, setDataInput] = useState(DEFAULT_DATA);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [renderTimeMs, setRenderTimeMs] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const isRenderDisabled =
    template.trim().length === 0 || dataInput.trim().length === 0 || saveStatus === 'saving';

  const handleRender = async () => {
    setError(null);
    setSaveError(null);
    setSaveStatus('idle');

    if (template.trim().length === 0) {
      setError('Шаблон не может быть пустым.');
      return;
    }

    if (dataInput.trim().length === 0) {
      setError('JSON-данные не могут быть пустыми.');
      return;
    }

    let parsedData: unknown;

    try {
      parsedData = JSON.parse(dataInput);
    } catch (parseError) {
      const message =
        parseError instanceof Error ? parseError.message : 'Некорректные JSON-данные.';
      setError(`Ошибка разбора JSON: ${message}`);
      return;
    }

    try {
      const startTime = performance.now();
      const output = renderTemplate(engine, template, parsedData);
      const endTime = performance.now();
      const duration = Number((endTime - startTime).toFixed(4));

      setRenderTimeMs(duration);
      setResult(output);
      setSaveStatus('saving');

      try {
        await saveBenchmark({
          template_engine: engine,
          render_time_ms: duration,
          payload: JSON.stringify(parsedData),
        });

        setSaveStatus('saved');
        setHistoryRefreshKey((key) => key + 1);
      } catch (saveBenchmarkError) {
        const message =
          saveBenchmarkError instanceof Error
            ? saveBenchmarkError.message
            : 'Failed to save benchmark.';
        setSaveError(message);
        setSaveStatus('error');
      }
    } catch (renderError) {
      const message =
        renderError instanceof Error ? renderError.message : 'Не удалось отрендерить шаблон.';
      setError(`Ошибка рендера: ${message}`);
      setRenderTimeMs(null);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Песочница шаблонов</p>
          <h1 className="title">Шаблонизаторы в действии</h1>
          <p className="subtitle">
            Введите шаблон, добавьте JSON-данные и получите реальный результат рендера.
          </p>
        </div>
        <TemplateSelector value={engine} onChange={setEngine} />
      </header>

      <main className="grid">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Ввод</h2>
            <RenderButton disabled={isRenderDisabled} onClick={handleRender} />
          </div>
          <div className="inputs">
            <TemplateInput value={template} onChange={setTemplate} />
            <DataInput value={dataInput} onChange={setDataInput} />
          </div>
        </section>

        <ResultView
          result={result}
          error={error}
          renderTimeMs={renderTimeMs}
          saveStatus={saveStatus}
          saveError={saveError}
        />

        <BenchmarkHistory refreshKey={historyRefreshKey} />
      </main>
    </div>
  );
}

export default App;