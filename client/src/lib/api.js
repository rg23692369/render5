// lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  withCredentials: true, // include cookies if backend uses them
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Debug log: shows which API base URL is being used
console.log("🔗 API Base URL:", api.defaults.baseURL);

export default api;
