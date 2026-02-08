const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');

const buildUrl = (path) => `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, token } = options;

  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || 'Something went wrong');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const endpoints = {
  register: '/auth/register',
  login: '/auth/login',
  me: '/users/me',
  users: '/users',
};
