import axios from "axios";

const api = axios.create({
  baseURL: "https://resume-analyzer-vnuq.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ra_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ra_token");
      localStorage.removeItem("ra_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;