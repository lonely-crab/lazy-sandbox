type ResultViewProps = {
  result: string;
  error: string | null;
};

export function ResultView({ result, error }: ResultViewProps) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Результат</h2>
      </div>
      <div className="stack">
        <div className="output" aria-live="polite">
          <pre>{result || 'Результат рендера появится здесь.'}</pre>
        </div>
        {error ? (
          <div className="error" role="alert">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
