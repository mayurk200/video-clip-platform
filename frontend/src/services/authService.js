import api from "./api";

/**
 * Authentication service — login, register, profile.
 */
const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  async register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
  },

  async getProfile() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  async updateProfile(updates) {
    const { data } = await api.put("/auth/me", updates);
    return data;
  },

  logout() {
    localStorage.removeItem("clipforge_token");
    window.location.href = "/login";
  },
};

export default authService;
