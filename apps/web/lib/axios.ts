import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Define it in apps/web/.env.local for development and in your deployment environment for production.",
  );
}

const api = axios.create({
  baseURL: apiBaseUrl,
  // Send the httpOnly cookie on every request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// On 401 (expired / invalid session) redirect to login (client-side only)
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
