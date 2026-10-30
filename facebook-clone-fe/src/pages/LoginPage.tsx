import { useState, type FormEvent } from 'react';
import { api, setAccessToken, type LoginResponse } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<LoginResponse>('/backend/auth/login', {
        email,
        password,
      });
      const token = res.data.access_token;
      if (token) {
        setAccessToken(token);
      }
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Đăng nhập (POST /backend/auth/login)</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Đăng nhập'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && <pre>{result}</pre>}
    </section>
  );
}
