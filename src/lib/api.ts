import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Your Django API root
});

// Add request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post("http://localhost:8000/accounts/api/token/refresh/", {
          refresh: localStorage.getItem("refresh_token"),
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        // Retry original request with updated token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed or expired");
        localStorage.clear();
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
