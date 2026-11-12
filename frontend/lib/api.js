export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Thin fetch wrapper for the Express API (proxied via the Next.js /api rewrite). */
export async function api(path, { method = 'GET', body, query, signal } = {}) {
  const qs = query
    ? `?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''))}`
    : '';

  let res;
  try {
    res = await fetch(`/api${path}${qs}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Is the API running?', 0, 'NETWORK_ERROR');
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const e = data?.error;
    throw new ApiError(e?.message || `Request failed (${res.status})`, res.status, e?.code, e?.details);
  }
  return data;
}

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
export function safeNext(value, fallback = '/account') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}
