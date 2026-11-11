import axios from "axios";
import { clearSession } from "../auth/session";

// Cliente único para a API atual. Em desenvolvimento, HTTP e Socket.IO usam o proxy local.
const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api/reaproveitafranca" : import.meta.env.VITE_API_URL?.trim() || "/api/reaproveitafranca",
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.response.data?.auth === false) clearSession();
  return Promise.reject(error);
});

export default api;
