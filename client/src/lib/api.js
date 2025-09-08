// lib/api.js
import axios from "axios";

// ✅ Use the same variable you set in render.yaml
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  withCredentials: true, // keep this if you’re using cookies/sessions
});

// ✅ Attach token if available
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// ✅ Debug log (optional, helps during deploy)
// console.log("🔗 API Base URL:", api.defaults.baseURL);

export default api;
