const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Always include credentials (cookies)
  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  console.log('apiFetch URL:', url);
  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    // If we're on the client, we might want to redirect to login
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
}
