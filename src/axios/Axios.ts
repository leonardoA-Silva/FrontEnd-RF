import axios from "axios";

// Base da API hospedada no PC da rede local.
// Pode ser sobrescrita com a variável de ambiente VITE_API_URL (arquivo .env).
// Ex: VITE_API_URL=http://10.89.240.27:5000/api/reaproveitafranca
const BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://10.89.240.27:5000/api/reaproveitafranca";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Anexa o token JWT (se existir) em todas as requisições
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
