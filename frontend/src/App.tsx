import { useState } from 'react';

import './App.css';
import { DataInput } from './components/DataInput';
import { RenderButton } from './components/RenderButton';
import { ResultView } from './components/ResultView';
import { TemplateInput } from './components/TemplateInput';
import { TemplateSelector } from './components/TemplateSelector';
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

  const isRenderDisabled = template.trim().length === 0 || dataInput.trim().length === 0;

  const handleRender = () => {
    setError(null);

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
      const output = renderTemplate(engine, template, parsedData);
      setResult(output);
    } catch (renderError) {
      const message =
        renderError instanceof Error ? renderError.message : 'Не удалось отрендерить шаблон.';
      setError(`Ошибка рендера: ${message}`);
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

        <ResultView result={result} error={error} />
      </main>
    </div>
  );
}

export default App;
