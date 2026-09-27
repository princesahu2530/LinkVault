import axios from 'axios';

let currentAccessToken = null;
let currentWorkspaceId = localStorage.getItem('linkvault_active_workspace') || null;
let isRefreshing = false;
let failedQueue = [];

export function setAccessToken(token) {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('linkvault_has_token', 'true');
  } else {
    localStorage.removeItem('linkvault_has_token');
  }
}

export function getAccessToken() {
  return currentAccessToken;
}

export function setActiveWorkspaceId(workspaceId) {
  currentWorkspaceId = workspaceId;
  if (workspaceId) {
    localStorage.setItem('linkvault_active_workspace', workspaceId);
  } else {
    localStorage.removeItem('linkvault_active_workspace');
  }
}

export function getActiveWorkspaceId() {
  return currentWorkspaceId;
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor attaches Bearer token and active workspace header
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    if (currentWorkspaceId && !config.headers['x-workspace-id']) {
      config.headers['x-workspace-id'] = currentWorkspaceId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handles 401 and transparent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('linkvault:unauthorized'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
