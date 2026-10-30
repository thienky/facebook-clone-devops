import { useEffect, useState } from 'react';
import { api, getApiBaseUrl, type HomeResponse } from '../lib/api';

export default function HomePage() {
  const [data, setData] = useState<HomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = getApiBaseUrl() || window.location.origin;

  useEffect(() => {
    api
      .get<HomeResponse>('/home')
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message ?? 'Không gọi được API'));
  }, []);

  return (
    <section className="card">
      <h2>Frontend React + Axios → Backend NestJS</h2>
      <p>
        <strong>API base URL:</strong> {apiUrl}
      </p>
      {error && <p className="error">Lỗi: {error}</p>}
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
      <p className="hint">
        Flow đề bài: Localhost → Docker Desktop → VPS (Terraform + Ansible + CI/CD).
      </p>
    </section>
  );
}
