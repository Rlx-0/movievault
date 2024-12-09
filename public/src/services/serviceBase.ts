import axios from "axios";

export const get = async <T>(url: string) => await axios.get<T>(url);

export const post = async <T>(url: string, body: T) =>
  await axios.post<T>(url, body);

export const put = async <T>(url: string, body: T) =>
  await axios.put<T>(url, body);

export const del = async (url: string) => await axios.delete(url);
