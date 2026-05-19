const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const isBackendEnabled = () => Boolean(API_URL)

export function isRealToken(token) {
  return token && !token.startsWith('mock-token')
}

async function request(path, options = {}) {
  const { body, token, headers, method, ...rest } = options
  const res = await fetch(`${API_URL}${path}`, {
    method: method || 'GET',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const authApi = {
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  verify: (token) => request(`/api/auth/verify/${token}`),
  forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
}

export const gamificationApi = {
  getStats: (token) => request('/api/gamification/stats', { token }),
  postActivity: (token, activityType, result) =>
    request('/api/gamification/activity', {
      method: 'POST',
      token,
      body: { activityType, result },
    }),
  getLeaderboard: (type) => request(`/api/gamification/leaderboard/${type}`),
}
