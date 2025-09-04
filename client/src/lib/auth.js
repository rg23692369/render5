import {jwtDecode} from "jwt-decode"; // ✅ default import

export const TOKEN_KEY = "token";

// ✅ Check if user is authenticated
export const isAuthed = () => !!localStorage.getItem(TOKEN_KEY);

// ✅ Set, get, and clear JWT token
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ✅ Get user info from token
export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token); // expects { id, username, role }
  } catch (e) {
    console.warn("Invalid token:", e);
    return null;
  }
};

// ✅ Return authorization header for API calls
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Logout function
export const logout = (navigate) => {
  clearToken();
  if (navigate) navigate("/login");
  else window.location.href = "/login"; // fallback
};
