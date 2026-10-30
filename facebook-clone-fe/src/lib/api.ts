import axios from 'axios';

declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

/** Dev: .env → localhost:3301. Docker/production: luôn relative URL (Nginx proxy). */
export function getApiBaseUrl(): string {
  const runtime = window.__APP_CONFIG__?.apiBaseUrl;
  if (runtime !== undefined && runtime !== null) {
    return String(runtime).trim();
  }

  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3301';
  }

  return '';
}

const baseURL = getApiBaseUrl();

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('access_token');
  }
}

const saved = localStorage.getItem('access_token');
if (saved) {
  setAccessToken(saved);
}

export type HomeResponse = {
  message: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: Record<string, unknown>;
};
