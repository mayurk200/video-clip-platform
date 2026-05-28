import axios from "axios";

/**
 * Axios instance with base URL, auth interceptor, and error handling.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clipforge_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
