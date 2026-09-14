import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// Change this to wherever your Laravel API actually lives.
// e.g. "http://127.0.0.1:8000/api" for `php artisan serve`,
// or "http://localhost/club/public/api" for XAMPP.
const BASE_URL = "http://club.test/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach the saved token to every outgoing request automatically.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, the API replies 401 — auto-clear
// local storage and send the user back to /login instead of showing
// a confusing "Unauthenticated" error on every screen.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;