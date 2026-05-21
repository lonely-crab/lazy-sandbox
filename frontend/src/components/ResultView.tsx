type ResultViewProps = {
  result: string;
  error: string | null;
  renderTimeMs: number | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
};

const SAVE_STATUS_LABELS: Record<ResultViewProps['saveStatus'], string> = {
  idle: 'Ожидание сохранения',
  saving: 'Saving benchmark...',
  saved: 'Benchmark saved',
  error: 'Failed to save benchmark',
};

export function ResultView({
  result,
  error,
  renderTimeMs,
  saveStatus,
  saveError,
}: ResultViewProps) {
  const renderTimeText = renderTimeMs !== null ? `Render time: ${renderTimeMs} ms` : null;

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Результат</h2>
      </div>
      <div className="stack">
        <div className="metrics">
          <span className="metric">{renderTimeText ?? 'Render time: —'}</span>
          <span className={`status status-${saveStatus}`}>{SAVE_STATUS_LABELS[saveStatus]}</span>
        </div>
        <div className="output" aria-live="polite">
          <pre>{result || 'Результат рендера появится здесь.'}</pre>
        </div>
        {error ? (
          <div className="error" role="alert">
            {error}
          </div>
        ) : null}
        {saveError ? (
          <div className="error" role="alert">
            {saveError}
          </div>
        ) : null}
      </div>
    </section>
  );
}
