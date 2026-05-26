import { useEffect, useState } from 'react';

import { getBenchmarks, type BenchmarkRead } from '../services/benchmarkApi';

type BenchmarkHistoryProps = {
  refreshKey: number | null;
};

export function BenchmarkHistory({ refreshKey }: BenchmarkHistoryProps) {
  const [benchmarks, setBenchmarks] = useState<BenchmarkRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    getBenchmarks()
      .then((data) => {
        if (Array.isArray(data)) {
          setBenchmarks(data);
        } else {
          setBenchmarks([data]);
        }
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load benchmarks';

        setError(message);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <p>Загрузка истории...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="card">
      <h2 className="card-title">История измерений</h2>

      <div style={{ maxHeight: '130px', overflowY: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Шаблонизатор</th>
              <th>Время (ms)</th>
              <th>Дата</th>
            </tr>
          </thead>

          <tbody>
            {benchmarks.map((item) => (
              <tr key={item.id}>
                <td>{item.template_engine}</td>
                <td>{item.render_time_ms}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}