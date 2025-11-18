// src/api.js
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const fetchOpts = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  };
  if (opts.body && typeof opts.body !== 'string') {
    fetchOpts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, fetchOpts);
  const text = await res.text();
  // try parse JSON, otherwise throw with server text
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(json && json.error ? json.error : `HTTP ${res.status}`);
    return json;
  } catch (e) {
    // if parse failed but HTTP ok, throw clearer error
    if (res.ok) throw new Error('Invalid JSON received from server: ' + text);
    throw new Error(`Request failed: ${e.message} - server response: ${text}`);
  }
}

export default {
  get: (p) => request(p, { method: 'GET' }),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};
