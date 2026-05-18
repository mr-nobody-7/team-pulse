import axios from "axios";

const api = axios.create({
  // Always call through Next.js rewrite so both local and production are consistent.
  baseURL: "/api",
  // Send the httpOnly cookie on every request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function isPublicRoute(pathname: string): boolean {
  const exactPublicRoutes = new Set(["/", "/login", "/register", "/changelog"]);
  return exactPublicRoutes.has(pathname);
}

// Track whether we're currently refreshing to prevent refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error?: unknown,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

// Auto-refresh access token on 401
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      typeof window === "undefined"
    ) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as any;

    // Prevent infinite redirect loops on public routes
    if (isPublicRoute(window.location.pathname)) {
      return Promise.reject(error);
    }

    // Already retried this request, redirect to login
    if (originalRequest._retry) {
      window.location.replace("/login");
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => {
          window.location.replace("/login");
          return Promise.reject(err);
        });
    }

    // Mark as refreshing and attempt to refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      // Call refresh endpoint (uses refresh_token cookie)
      await api.post("/auth/refresh");
      processQueue(null);

      // Retry original request with new access token
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      window.location.replace("/login");
      return Promise.reject(refreshError);
    }
  },
);

export default api;
