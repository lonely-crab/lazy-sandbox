export type BenchmarkCreate = {
  template_engine: string;
  render_time_ms: number;
  payload: string;
};

export type BenchmarkRead = BenchmarkCreate & {
  id: number;
  created_at: string;
};

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!baseUrl) {
    return '';
  }
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

export async function saveBenchmark(payload: BenchmarkCreate): Promise<BenchmarkRead> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/benchmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<BenchmarkRead>;
}


export async function getBenchmarks(): Promise<BenchmarkRead[]> {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/benchmarks`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<BenchmarkRead[]>;
}