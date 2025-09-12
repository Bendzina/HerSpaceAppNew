import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://192.168.100.4:8000/api';

// --- Auth failure notifications (for auto-logout) ---
const authFailureHandlers = new Set<() => void>();
function emitAuthFailure() {
  authFailureHandlers.forEach((h) => {
    try { h(); } catch {}
  });
}
export function onAuthFailure(handler: () => void) {
  authFailureHandlers.add(handler);
  return () => authFailureHandlers.delete(handler);
}

export async function clearStoredTokens() {
  try {
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "user_data"]);
  } catch {}
}

// Refresh the access token using the stored refresh token
async function refreshAccessToken(): Promise<string> {
  const refresh = await AsyncStorage.getItem("refresh_token");
  if (!refresh) throw new Error('No refresh token');

  const resp = await fetch(`${BASE_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  const contentType = resp.headers.get('content-type') || '';
  const raw = await resp.text();
  let data: any = null;
  if (contentType.includes('application/json')) {
    try { data = raw ? JSON.parse(raw) : null; } catch {}
  }

  if (!resp.ok || resp.status === 401) {
    // Refresh is invalid/expired – clear tokens and notify listeners for auto-logout
    await clearStoredTokens();
    emitAuthFailure();
    const msg = (data && (data.detail || data.message)) || raw || 'Failed to refresh token';
    throw new Error(typeof msg === 'string' ? msg : 'Failed to refresh token');
  }

  if (!data?.access) throw new Error('No access token in refresh response');
  await AsyncStorage.setItem('access_token', data.access);
  return data.access as string;
}

// Wrapper that retries once on expired token
async function fetchWithAuth(url: string, options: RequestInit, accessToken: string) {
  const doFetch = async (token: string) => {
    const headers = {
      ...(options.headers as Record<string, string> | undefined),
      'Authorization': `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  let response = await doFetch(accessToken);

  if (response.status === 401) {
    // Try to detect token expiration response shape from SimpleJWT
    let shouldRetry = false;
    try {
      const ct = response.headers.get('content-type') || '';
      const raw = await response.text();
      const j = ct.includes('application/json') ? JSON.parse(raw) : null;
      if (j?.code === 'token_not_valid') {
        // If message indicates expired OR generally token_not_valid, attempt refresh once
        shouldRetry = true;
      }
    } catch {}

    if (shouldRetry) {
      try {
        const newToken = await refreshAccessToken();
        response = await doFetch(newToken);
      } catch (e) {
        throw e;
      }
    }
  }

  return response;
}

// Exported helper for other services to make authenticated API calls using the
// same token/refresh logic. Pass API path starting with '/'.
export async function authorizedFetch(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found');
  }
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  try {
    const resp = await fetchWithAuth(url, options, token);
    try { console.log('authorizedFetch:', options.method || 'GET', url, '->', resp.status); } catch {}
    return resp;
  } catch (e) {
    try { console.log('authorizedFetch error:', options.method || 'GET', url, e); } catch {}
    throw e;
  }
}

export async function login(username: string, password: string) {
  try {
    console.log('authService: Login attempt...', { username });
    const response = await fetch(`${BASE_URL}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ✅ username
    });

    const data = await response.json();
    console.log('authService: Login response:', response.status);

    if (!response.ok) {
      const errorMessage = data.detail || data.message || "Login failed";
      throw new Error(errorMessage);
    }

    // ✅ Consistent token storage
    await AsyncStorage.setItem("access_token", data.access);
    await AsyncStorage.setItem("refresh_token", data.refresh);
    return data;
  } catch (error) {
    console.error('authService: Login error:', error);
    throw error;
  }
}

export async function register(username: string, email: string, password: string) {
  try {
    console.log('authService: Registration attempt...', { username, email });
    const response = await fetch(`${BASE_URL}/users/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    console.log('authService: Registration response:', response.status);

    if (!response.ok) {
      // ✅ Better error handling
      let errorMessage = 'Registration failed';
      if (data.username) {
        errorMessage = `Username: ${data.username[0]}`;
      } else if (data.email) {
        errorMessage = `Email: ${data.email[0]}`;
      } else if (data.password) {
        errorMessage = `Password: ${data.password[0]}`;
      } else if (data.detail) {
        errorMessage = data.detail;
      }
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('authService: Registration error:', error);
    throw error;
  }
}

export async function getUserInfo(token: string) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('authService: Get user info error:', error);
    throw error;
  }
}

// ✅ ახალი updateProfile ფუნქცია
export async function updateProfile(updates: any, token: string) {
  try {
    console.log('authService: Updating profile...', updates);
    
    const response = await fetchWithAuth(`${BASE_URL}/users/me/`, {
      method: 'PATCH', // ან PUT შენი Django API-ის მიხედვით
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }, token);

    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text();
    console.log('authService: Profile update response:', response.status, contentType, raw?.slice(0, 200));

    // Try JSON parse only when appropriate
    let parsed: any = null;
    if (contentType.includes('application/json')) {
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (e) {
        // Keep parsed as null; fall back to raw error text
      }
    }

    if (!response.ok) {
      const message = (parsed && (parsed.detail || parsed.message))
        || raw
        || `Profile update failed (${response.status})`;
      throw new Error(typeof message === 'string' ? message : 'Profile update failed');
    }

    return parsed ?? raw; // Prefer JSON, otherwise raw (server may return empty body)
  } catch (error) {
    console.error('authService: Profile update error:', error);
    throw error;
  }
}