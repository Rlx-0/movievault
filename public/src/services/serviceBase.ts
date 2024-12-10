import axios from "axios";
import { authService } from "./apiService";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { access } = await authService.refreshToken(refreshToken);
          localStorage.setItem("accessToken", access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const get = <T>(url: string) => {
  return axiosInstance.get<T>(url);
};

export const post = <T>(url: string, data?: any) => {
  return axiosInstance.post<T>(url, data);
};

export const put = <T>(url: string, data: any) => {
  return axiosInstance.put<T>(url, data);
};

export const del = <T>(url: string) => {
  return axiosInstance.delete<T>(url);
};
