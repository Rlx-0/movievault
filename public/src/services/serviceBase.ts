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

export const get = async <T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T }> => {
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    ...options,
  });
  return handleResponse<T>(response);
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

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("accessToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<{ data: T }> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return { data };
};
