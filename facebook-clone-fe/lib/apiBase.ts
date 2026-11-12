/** Browser calls the API on the host. Docker/CI can override at build time. */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3301'
).replace(/\/$/, '');
