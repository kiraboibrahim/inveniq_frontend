import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── Request interceptor: attach JWT from cookie ────────────────────────────
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("aims_session="))
    ?.split("=")[1];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle session expiry ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Clear the session cookie
      document.cookie =
        "aims_session=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

      // 2. Clear persisted Zustand auth state from localStorage
      try {
        localStorage.removeItem("aims-auth-storage");
      } catch {
        // localStorage may not be available in all environments
      }

      // 3. Notify the user — sonner's imperative API works outside React
      toast.error("Session expired", {
        description: "Please sign in again to continue.",
        duration: 4000,
      });

      // 4. Redirect to login (small delay lets the toast render first)
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }

    return Promise.reject(error);
  }
);

export default api;

