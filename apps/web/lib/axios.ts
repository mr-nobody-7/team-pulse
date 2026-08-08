import axios, { type AxiosRequestConfig } from "axios";

const api = axios.create({
  // Always call through Next.js rewrite so both local and production are consistent.
  baseURL: "/api",
  // Send the httpOnly cookie on every request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _csrfRetry?: boolean;
}

// ---------------------------------------------------------------------------
// CSRF
//
// The API protects every state-changing request with a double-submit token.
// Fetch one lazily, cache it, and attach it to mutating requests. The token is
// tied to a cookie the API sets, so a 403 means the pair went stale (new
// deployment, cleared cookie) and is recoverable by fetching a fresh one.
// ---------------------------------------------------------------------------

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  // De-duplicate concurrent fetches so a burst of mutations issues one request.
  if (!csrfRequest) {
    csrfRequest = api
      .get<{ data: { csrfToken: string } }>("/auth/csrf-token")
      .then((response) => {
        csrfToken = response.data.data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method ?? "get").toLowerCase();

  if (!MUTATING_METHODS.has(method)) {
    return config;
  }

  const token = csrfToken ?? (await fetchCsrfToken());
  config.headers.set("x-csrf-token", token);

  return config;
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

const processQueue = (error?: unknown, token: string | null = null) => {
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
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const config = error.config as CustomAxiosRequestConfig | undefined;

    // Stale CSRF token/cookie pair — fetch a fresh one and replay once.
    if (
      error.response?.status === 403 &&
      (error.response.data as { code?: string } | undefined)?.code ===
        "EBADCSRFTOKEN" &&
      config &&
      !config._csrfRetry
    ) {
      config._csrfRetry = true;
      csrfToken = null;

      try {
        await fetchCsrfToken();
        return await api(config);
      } catch {
        return Promise.reject(error);
      }
    }

    if (error.response?.status !== 401 || typeof window === "undefined") {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;

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
